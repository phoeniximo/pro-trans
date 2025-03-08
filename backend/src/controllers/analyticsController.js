// backend/src/controllers/analyticsController.js
const mongoose = require('mongoose');
const Annonce = require('../models/Annonce');
const Devis = require('../models/Devis');
const Paiement = require('../models/Paiement');
const Avis = require('../models/Avis');
const User = require('../models/User');

// @desc    Obtenir les statistiques pour le tableau de bord client
// @route   GET /api/analytics/client
// @access  Privé
exports.getClientAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur est un client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Statistiques disponibles pour les clients uniquement.'
      });
    }
    
    // Statistiques des annonces
    const totalAnnonces = await Annonce.countDocuments({ utilisateur: userId });
    const annoncesEnCours = await Annonce.countDocuments({ utilisateur: userId, statut: 'en_cours' });
    const annoncesTerminees = await Annonce.countDocuments({ utilisateur: userId, statut: 'termine' });
    
    // Statistiques par types de transport
    const typeStats = await Annonce.aggregate([
      { $match: { utilisateur: mongoose.Types.ObjectId(userId) } },
      { $group: {
          _id: '$typeTransport',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Statistiques des dépenses
    const paiements = await Paiement.find({ utilisateur: userId });
    const totalDepense = paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
    const depenseMoyenne = totalAnnonces > 0 ? totalDepense / totalAnnonces : 0;
    
    // Dépenses par mois (12 derniers mois)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const depensesParMois = await Paiement.aggregate([
      { $match: { 
          utilisateur: mongoose.Types.ObjectId(userId),
          dateTransaction: { $gte: oneYearAgo }
        } 
      },
      { $group: {
          _id: { 
            year: { $year: '$dateTransaction' },
            month: { $month: '$dateTransaction' }
          },
          total: { $sum: '$montant' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Statistiques des avis donnés et reçus
    const avisDonnes = await Avis.countDocuments({ auteur: userId });
    const avisRecus = await Avis.countDocuments({ destinataire: userId });
    
    // Récupérer la note moyenne reçue
    const noteMoyenne = await Avis.aggregate([
      { $match: { destinataire: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, moyenne: { $avg: '$note' } } }
    ]);
    
    // Distribution des notes reçues
    const distributionNotes = await Avis.aggregate([
      { $match: { destinataire: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$note', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Formater les données pour la réponse
    const analytics = {
      annonces: {
        total: totalAnnonces,
        enCours: annoncesEnCours,
        terminees: annoncesTerminees,
        disponibles: totalAnnonces - annoncesEnCours - annoncesTerminees,
        parType: typeStats.map(item => ({
          type: item._id,
          nombre: item.count
        }))
      },
      paiements: {
        totalDepense: totalDepense.toFixed(2),
        depenseMoyenne: depenseMoyenne.toFixed(2),
        nombreTransactions: paiements.length,
        parMois: depensesParMois.map(item => ({
          annee: item._id.year,
          mois: item._id.month,
          montant: item.total.toFixed(2),
          nombre: item.count
        }))
      },
      avis: {
        donnes: avisDonnes,
        recus: avisRecus,
        noteMoyenne: noteMoyenne.length > 0 ? noteMoyenne[0].moyenne.toFixed(1) : '0.0',
        distribution: Array.from({ length: 5 }, (_, i) => {
          const note = i + 1;
          const noteData = distributionNotes.find(item => item._id === note);
          return {
            note,
            nombre: noteData ? noteData.count : 0
          };
        })
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    console.error('Erreur lors de la génération des statistiques client:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des statistiques',
      error: err.message
    });
  }
};

// @desc    Obtenir les statistiques pour le tableau de bord transporteur
// @route   GET /api/analytics/transporteur
// @access  Privé
exports.getTransporteurAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur est un transporteur
    if (req.user.role !== 'transporteur') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Statistiques disponibles pour les transporteurs uniquement.'
      });
    }
    
    // Statistiques des devis
    const totalDevis = await Devis.countDocuments({ transporteur: userId });
    const devisAcceptes = await Devis.countDocuments({ transporteur: userId, statut: 'accepte' });
    const devisRefuses = await Devis.countDocuments({ transporteur: userId, statut: 'refuse' });
    const devisEnAttente = await Devis.countDocuments({ transporteur: userId, statut: 'en_attente' });
    const devisTermines = await Devis.countDocuments({ transporteur: userId, statut: 'termine' });
    
    // Taux de conversion des devis
    const tauxConversion = totalDevis > 0 ? (devisAcceptes / totalDevis) * 100 : 0;
    
    // Revenus générés
    const paiements = await Paiement.find({ transporteur: userId });
    const revenuTotal = paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
    const revenuMoyen = devisTermines > 0 ? revenuTotal / devisTermines : 0;
    
    // Revenus par mois (12 derniers mois)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const revenusParMois = await Paiement.aggregate([
      { $match: { 
          transporteur: mongoose.Types.ObjectId(userId),
          dateTransaction: { $gte: oneYearAgo }
        } 
      },
      { $group: {
          _id: { 
            year: { $year: '$dateTransaction' },
            month: { $month: '$dateTransaction' }
          },
          total: { $sum: '$montant' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Statistiques par types de transport
    const typeStats = await Devis.aggregate([
      { $match: { 
          transporteur: mongoose.Types.ObjectId(userId),
          statut: { $in: ['accepte', 'termine'] }
        } 
      },
      { $lookup: {
          from: 'annonces',
          localField: 'annonce',
          foreignField: '_id',
          as: 'annonceDetails'
        }
      },
      { $unwind: '$annonceDetails' },
      { $group: {
          _id: '$annonceDetails.typeTransport',
          count: { $sum: 1 },
          revenu: { $sum: '$montant' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Statistiques des avis reçus
    const avisRecus = await Avis.countDocuments({ destinataire: userId });
    
    // Récupérer la note moyenne reçue
    const noteMoyenne = await Avis.aggregate([
      { $match: { destinataire: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, moyenne: { $avg: '$note' } } }
    ]);
    
    // Distribution des notes reçues
    const distributionNotes = await Avis.aggregate([
      { $match: { destinataire: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$note', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Formater les données pour la réponse
    const analytics = {
      devis: {
        total: totalDevis,
        acceptes: devisAcceptes,
        refuses: devisRefuses,
        enAttente: devisEnAttente,
        termines: devisTermines,
        tauxConversion: tauxConversion.toFixed(1)
      },
      revenus: {
        total: revenuTotal.toFixed(2),
        moyen: revenuMoyen.toFixed(2),
        nombreTransactions: paiements.length,
        parMois: revenusParMois.map(item => ({
          annee: item._id.year,
          mois: item._id.month,
          montant: item.total.toFixed(2),
          nombre: item.count
        }))
      },
      typesTransport: typeStats.map(item => ({
        type: item._id,
        nombre: item.count,
        revenu: item.revenu.toFixed(2)
      })),
      avis: {
        recus: avisRecus,
        noteMoyenne: noteMoyenne.length > 0 ? noteMoyenne[0].moyenne.toFixed(1) : '0.0',
        distribution: Array.from({ length: 5 }, (_, i) => {
          const note = i + 1;
          const noteData = distributionNotes.find(item => item._id === note);
          return {
            note,
            nombre: noteData ? noteData.count : 0
          };
        })
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    console.error('Erreur lors de la génération des statistiques transporteur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des statistiques',
      error: err.message
    });
  }
};

// @desc    Obtenir les statistiques des annonces
// @route   GET /api/analytics/annonces
// @access  Privé
exports.getAnnoncesAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Filtre de base en fonction du rôle
    let filter = {};
    if (req.user.role === 'client') {
      filter.utilisateur = userId;
    } else if (req.user.role === 'transporteur') {
      // Pour les transporteurs, on récupère les annonces pour lesquelles ils ont proposé un devis
      const devis = await Devis.find({ transporteur: userId });
      const annonceIds = [...new Set(devis.map(d => d.annonce))];
      filter._id = { $in: annonceIds };
    }
    
    // Statistiques par statut
    const statutsAnnonces = await Annonce.aggregate([
      { $match: filter },
      { $group: { _id: '$statut', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Statistiques par type de transport
    const typesTransport = await Annonce.aggregate([
      { $match: filter },
      { $group: { _id: '$typeTransport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Statistiques par distance
    const distanceStats = await Annonce.aggregate([
      { $match: filter },
      { $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$distance', 50] }, then: 'moins_de_50km' },
                { case: { $lt: ['$distance', 100] }, then: '50-100km' },
                { case: { $lt: ['$distance', 250] }, then: '100-250km' },
                { case: { $lt: ['$distance', 500] }, then: '250-500km' },
              ],
              default: 'plus_de_500km'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Statistiques par période
    const annoncesParPeriode = await Annonce.aggregate([
      { $match: filter },
      { $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Tranche horaire populaire pour les demandes
    const heuresPopulaires = await Annonce.aggregate([
      { $match: filter },
      { $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Formater les données pour la réponse
    const analytics = {
      statuts: statutsAnnonces.map(item => ({
        statut: item._id,
        nombre: item.count
      })),
      typesTransport: typesTransport.map(item => ({
        type: item._id,
        nombre: item.count
      })),
      distances: distanceStats.map(item => ({
        tranche: item._id,
        nombre: item.count
      })),
      evolution: annoncesParPeriode.map(item => ({
        annee: item._id.year,
        mois: item._id.month,
        nombre: item.count
      })),
      heuresPopulaires: heuresPopulaires.map(item => ({
        heure: item._id,
        nombre: item.count
      }))
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    console.error('Erreur lors de la génération des statistiques d\'annonces:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des statistiques',
      error: err.message
    });
  }
};

// @desc    Obtenir les statistiques des paiements
// @route   GET /api/analytics/paiements
// @access  Privé
exports.getPaiementsAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Filtre de base en fonction du rôle
    let filter = {};
    if (req.user.role === 'client') {
      filter.utilisateur = userId;
    } else if (req.user.role === 'transporteur') {
      filter.transporteur = userId;
    }
    
    // Statistiques des paiements par statut
    const statutsPaiements = await Paiement.aggregate([
      { $match: filter },
      { $group: { _id: '$statut', count: { $sum: 1 }, total: { $sum: '$montant' } } },
      { $sort: { count: -1 } }
    ]);
    
    // Statistiques des paiements par méthode
    const methodesPaiement = await Paiement.aggregate([
      { $match: filter },
      { $group: { _id: '$methode', count: { $sum: 1 }, total: { $sum: '$montant' } } },
      { $sort: { count: -1 } }
    ]);
    
    // Évolution des paiements par mois
    const paiementsParMois = await Paiement.aggregate([
      { $match: filter },
      { $group: {
          _id: { 
            year: { $year: '$dateTransaction' },
            month: { $month: '$dateTransaction' }
          },
          count: { $sum: 1 },
          total: { $sum: '$montant' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Montant moyen des transactions
    const montantMoyen = await Paiement.aggregate([
      { $match: filter },
      { $group: { _id: null, moyenne: { $avg: '$montant' } } }
    ]);
    
    // Formater les données pour la réponse
    const analytics = {
      statuts: statutsPaiements.map(item => ({
        statut: item._id,
        nombre: item.count,
        montant: item.total.toFixed(2)
      })),
      methodes: methodesPaiement.map(item => ({
        methode: item._id,
        nombre: item.count,
        montant: item.total.toFixed(2)
      })),
      evolution: paiementsParMois.map(item => ({
        annee: item._id.year,
        mois: item._id.month,
        nombre: item.count,
        montant: item.total.toFixed(2)
      })),
      montantMoyen: montantMoyen.length > 0 ? montantMoyen[0].moyenne.toFixed(2) : '0.00'
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    console.error('Erreur lors de la génération des statistiques de paiements:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des statistiques',
      error: err.message
    });
  }
};

// @desc    Obtenir les statistiques de performance
// @route   GET /api/analytics/performance
// @access  Privé
exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Les statistiques de performance ne sont pertinentes que pour les transporteurs
    if (req.user.role !== 'transporteur') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Statistiques disponibles pour les transporteurs uniquement.'
      });
    }
    
    // Taux de conversion des devis
    const totalDevis = await Devis.countDocuments({ transporteur: userId });
    const devisAcceptes = await Devis.countDocuments({ transporteur: userId, statut: 'accepte' });
    const tauxConversion = totalDevis > 0 ? (devisAcceptes / totalDevis) * 100 : 0;
    
    // Taux de réponse aux demandes
    const annoncesConsultees = await Annonce.countDocuments({ 
      _id: { $in: await Devis.distinct('annonce', { transporteur: userId }) }
    });
    const tauxReponse = annoncesConsultees > 0 ? (totalDevis / annoncesConsultees) * 100 : 0;
    
    // Délai moyen de réponse
    // (Nécessite d'avoir un champ de date de consultation des annonces, à implémenter)
    
    // Taux de livraison à temps
    const transportsTermines = await Devis.find({ 
      transporteur: userId, 
      statut: 'termine'
    });
    
    // Hypothèse: on considère qu'un transport est à temps si sa date de fin est avant la date prévue de livraison
    let livraisonsATemps = 0;
    for (const transport of transportsTermines) {
      const annonce = await Annonce.findById(transport.annonce);
      if (annonce && annonce.tracking && annonce.tracking.historique) {
        const livraisonEvent = annonce.tracking.historique.find(event => event.statut === 'livre');
        if (livraisonEvent && new Date(livraisonEvent.date) <= new Date(transport.delaiLivraison)) {
          livraisonsATemps++;
        }
      }
    }
    
    const tauxLivraisonATemps = transportsTermines.length > 0 
      ? (livraisonsATemps / transportsTermines.length) * 100 
      : 0;
    
    // Notes moyennes par catégorie
    const avis = await Avis.find({ destinataire: userId });
    
    // Hypothèse: on a des champs de notation spécifiques dans les avis
    const notesPonctuallite = avis
      .filter(a => a.notesPar?.ponctualite)
      .map(a => a.notesPar.ponctualite);
    
    const notesCommunication = avis
      .filter(a => a.notesPar?.communication)
      .map(a => a.notesPar.communication);
    
    const notesService = avis
      .filter(a => a.notesPar?.service)
      .map(a => a.notesPar.service);
    
    const moyennePonctualite = notesPonctuallite.length > 0 
      ? notesPonctuallite.reduce((sum, note) => sum + note, 0) / notesPonctuallite.length 
      : 0;
    
    const moyenneCommunication = notesCommunication.length > 0 
      ? notesCommunication.reduce((sum, note) => sum + note, 0) / notesCommunication.length 
      : 0;
    
    const moyenneService = notesService.length > 0 
      ? notesService.reduce((sum, note) => sum + note, 0) / notesService.length 
      : 0;
    
    // Formater les données pour la réponse
    const analytics = {
      conversion: {
        taux: tauxConversion.toFixed(1),
        totalDevis,
        devisAcceptes
      },
      reponse: {
        taux: tauxReponse.toFixed(1),
        annoncesConsultees,
        devisEnvoyes: totalDevis
      },
      livraison: {
        tauxATemps: tauxLivraisonATemps.toFixed(1),
        livraisonsATemps,
        totalLivraisons: transportsTermines.length
      },
      notes: {
        globale: avis.length > 0 
          ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1) 
          : '0.0',
        ponctualite: moyennePonctualite.toFixed(1),
        communication: moyenneCommunication.toFixed(1),
        service: moyenneService.toFixed(1)
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    console.error('Erreur lors de la génération des statistiques de performance:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des statistiques',
      error: err.message
    });
  }
};

// @desc    Obtenir l'historique des transports
// @route   GET /api/analytics/historique
// @access  Privé
exports.getHistoriqueTransports = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Filtre selon le rôle de l'utilisateur
    let filter = {};
    if (req.user.role === 'client') {
      filter = { utilisateur: userId, statut: { $in: ['en_cours', 'termine'] } };
    } else if (req.user.role === 'transporteur') {
      const devis = await Devis.find({ 
        transporteur: userId, 
        statut: { $in: ['accepte', 'termine'] } 
      });
      
      const annonceIds = devis.map(d => d.annonce);
      filter = { _id: { $in: annonceIds } };
    } else {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Récupérer les annonces avec leur historique de tracking
    const annonces = await Annonce.find(filter)
      .populate({
        path: 'utilisateur',
        select: 'prenom nom email'
      })
      .sort({ updatedAt: -1 });
    
    // Pour chaque annonce, récupérer le devis associé
    const historique = await Promise.all(annonces.map(async (annonce) => {
      let devis;
      
      if (req.user.role === 'client') {
        devis = await Devis.findOne({ 
          annonce: annonce._id, 
          statut: { $in: ['accepte', 'termine'] } 
        }).populate({
          path: 'transporteur',
          select: 'prenom nom email'
        });
      } else {
        devis = await Devis.findOne({ 
          annonce: annonce._id, 
          transporteur: userId
        });
      }
      
      if (!devis) return null;
      
      return {
        id: annonce._id,
        titre: annonce.titre,
        statut: annonce.statut,
        dateCreation: annonce.createdAt,
        dateDepart: annonce.dateDepart,
        villeDepart: annonce.villeDepart,
        villeArrivee: annonce.villeArrivee,
        typeTransport: annonce.typeTransport,
        tracking: annonce.tracking || null,
        client: {
          id: annonce.utilisateur._id,
          nom: `${annonce.utilisateur.prenom} ${annonce.utilisateur.nom}`,
          email: annonce.utilisateur.email
        },
        transporteur: devis.transporteur ? {
          id: devis.transporteur._id,
          nom: `${devis.transporteur.prenom} ${devis.transporteur.nom}`,
          email: devis.transporteur.email
        } : null,
        montant: devis.montant,
        dateAcceptation: devis.dateAcceptation
      };
    }));
    
    // Filtrer les nulls (cas où aucun devis n'a été trouvé)
    const historiqueFiltered = historique.filter(Boolean);
    
    res.json({
      success: true,
      data: historiqueFiltered
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'historique des transports:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: err.message
    });
  }
};