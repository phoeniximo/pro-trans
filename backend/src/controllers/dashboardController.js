// backend/src/controllers/dashboardController.js
const mongoose = require('mongoose');

// Import des modèles en respectant vos conventions de nommage
const Annonce = require('../models/Annonce');
const Devis = require('../models/Devis');
const Message = require('../models/Message');
const Avis = require('../models/Avis');

/**
 * Récupère les données du tableau de bord pour un client
 */
exports.getClientDashboard = async (req, res) => {
  console.log('getClientDashboard appelé', req.user.id);
  
  try {
    const userId = req.user.id; // Utilisation de req.user.id au lieu de req.user._id
    
    // Statistiques
    const stats = {
      annonces: {
        actives: await Annonce.countDocuments({ utilisateur: userId, statut: 'disponible' })
      },
      devis: {
        enAttente: await Devis.countDocuments({ 
          annonce: { $in: await Annonce.find({ utilisateur: userId }).distinct('_id') },
          statut: 'en_attente'
        })
      },
      messages: {
        nonLus: await Message.countDocuments({ destinataire: userId, lu: false })
      },
      avis: {
        total: await Avis.countDocuments({ auteur: userId })
      }
    };
    
    // Calcul de la note moyenne si des avis existent
    if (stats.avis.total > 0) {
      const avisResults = await Avis.aggregate([
        { $match: { destinataire: new mongoose.Types.ObjectId(userId) } }, // Utilisation du constructeur new
        { $group: { _id: null, moyenne: { $avg: '$note' } } }
      ]);
      
      if (avisResults.length > 0) {
        stats.avis.note = avisResults[0].moyenne;
      }
    }
    
    // Récupération des dernières annonces
    const recentAnnonces = await Annonce.find({ utilisateur: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Récupération des derniers devis pour les annonces de l'utilisateur
    const annonceIds = await Annonce.find({ utilisateur: userId }).distinct('_id');
    const recentDevis = await Devis.find({ annonce: { $in: annonceIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('transporteur', 'nom prenom')
      .populate('annonce', 'titre')
      .lean();
    
    // Récupération des derniers messages
    const recentMessages = await Message.find({ destinataire: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('expediteur', 'nom prenom')
      .populate('annonce', 'titre')
      .lean();
    
    return res.status(200).json({
      success: true,
      data: {
        stats,
        recentAnnonces,
        recentDevis,
        recentMessages
      }
    });
  } catch (error) {
    console.error('Erreur dans getClientDashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données du tableau de bord',
      error: error.message
    });
  }
};

/**
 * Récupère les données du tableau de bord pour un transporteur
 */
exports.getTransporteurDashboard = async (req, res) => {
  console.log('getTransporteurDashboard appelé', req.user.id);
  
  try {
    const userId = req.user.id; // Utilisation de req.user.id au lieu de req.user._id
    
    // Statistiques
    const stats = {
      devis: {
        envoyes: await Devis.countDocuments({ transporteur: userId })
      },
      transports: {
        enCours: await Devis.countDocuments({ 
          transporteur: userId, 
          statut: 'en_cours'
        })
      },
      messages: {
        nonLus: await Message.countDocuments({ destinataire: userId, lu: false })
      },
      avis: {
        total: await Avis.countDocuments({ destinataire: userId })
      }
    };
    
    // Calcul de la note moyenne si des avis existent
    if (stats.avis.total > 0) {
      const avisResults = await Avis.aggregate([
        { $match: { destinataire: new mongoose.Types.ObjectId(userId) } }, // Utilisation du constructeur new
        { $group: { _id: null, moyenne: { $avg: '$note' } } }
      ]);
      
      if (avisResults.length > 0) {
        stats.avis.note = avisResults[0].moyenne;
      }
    }
    
    // Récupération des dernières annonces disponibles
    const recentAnnonces = await Annonce.find({ statut: 'disponible' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Récupération des derniers devis
    const recentDevis = await Devis.find({ transporteur: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'annonce',
        select: 'titre utilisateur',
        populate: {
          path: 'utilisateur',
          select: 'nom prenom'
        }
      })
      .lean();
    
    // Modification des devis pour adapter au format attendu par le frontend
    const formattedDevis = recentDevis.map(devis => ({
      ...devis,
      client: devis.annonce.utilisateur,
      annonce: {
        _id: devis.annonce._id,
        titre: devis.annonce.titre
      }
    }));
    
    // Récupération des derniers messages
    const recentMessages = await Message.find({ destinataire: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('expediteur', 'nom prenom')
      .populate('annonce', 'titre')
      .lean();
    
    return res.status(200).json({
      success: true,
      data: {
        stats,
        recentAnnonces,
        recentDevis: formattedDevis,
        recentMessages
      }
    });
  } catch (error) {
    console.error('Erreur dans getTransporteurDashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données du tableau de bord',
      error: error.message
    });
  }
};