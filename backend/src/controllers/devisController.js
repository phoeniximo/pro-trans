// backend/src/controllers/devisController.js
const Devis = require('../models/Devis');
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const mongoose = require('mongoose');
const NotificationService = require('../services/notificationService');

// @desc    Créer un nouveau devis (transporteur)
// @route   POST /api/devis
// @access  Privé (transporteur)
exports.createDevis = async (req, res) => {
  try {
    const { annonceId } = req.body;
    
    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Vérifier si l'annonce existe et est disponible
    const annonce = await Annonce.findById(annonceId)
      .populate('utilisateur', 'nom prenom email');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    if (annonce.statut !== 'disponible') {
      return res.status(400).json({
        success: false,
        message: 'Cette annonce n\'est plus disponible'
      });
    }
    
    // Vérifier si l'utilisateur est bien un transporteur
    if (req.user.role !== 'transporteur') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les transporteurs peuvent proposer des devis'
      });
    }
    
    // Vérifier si le transporteur a déjà fait un devis pour cette annonce
    const devisExistant = await Devis.findOne({
      annonce: annonceId,
      transporteur: req.user.id
    });
    
    if (devisExistant) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà proposé un devis pour cette annonce'
      });
    }

    // Calculer la date de validité du devis (7 jours par défaut)
    const validiteDevis = new Date();
    validiteDevis.setDate(validiteDevis.getDate() + 7);
    
    // Créer le devis
    const nouveauDevis = new Devis({
      annonce: annonceId,
      transporteur: req.user.id,
      montant: req.body.montant,
      message: req.body.message,
      delaiLivraison: req.body.delaiLivraison,
      detailTarifs: req.body.detailTarifs || {
        prixTransport: req.body.montant,
        fraisChargement: 0,
        fraisDechargement: 0,
        fraisMontage: 0,
        fraisDemontage: 0,
        fraisEmballage: 0,
        fraisAssurance: 0,
        fraisUrgence: 0,
        autresFrais: 0,
        remise: 0
      },
      descriptionAutresFrais: req.body.descriptionAutresFrais,
      dureeTransport: req.body.dureeTransport,
      vehiculeUtilise: req.body.vehiculeUtilise,
      disponibilites: req.body.disponibilites || [],
      options: req.body.options || {
        assuranceIncluse: false,
        montantAssurance: 0,
        suiviGPS: false,
        garantiePonctualite: false
      },
      conditionsPaiement: req.body.conditionsPaiement || {
        acompte: 0,
        pourcentageAcompte: 0,
        paiementIntegral: true,
        modePaiement: 'carte'
      },
      validiteDevis: validiteDevis
    });
    
    await nouveauDevis.save();
    
    // Récupérer le devis complet avec les informations du transporteur
    const devisComplet = await Devis.findById(nouveauDevis._id)
      .populate('transporteur', 'nom prenom email photo notation vehicules')
      .populate('annonce', 'titre villeDepart villeArrivee typeTransport dateDepart');
    
    // Envoyer une notification au client
    try {
      await NotificationService.createDevisNotification(
        annonce.utilisateur._id, 
        'Nouveau devis reçu',
        `Vous avez reçu un nouveau devis de ${req.user.prenom} ${req.user.nom} pour votre annonce "${annonce.titre}"`,
        nouveauDevis._id
      );
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification de nouveau devis:', notifError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Devis créé avec succès',
      data: devisComplet
    });
  } catch (err) {
    console.error('Erreur lors de la création du devis:', err);
    
    // Erreur de validation mongoose
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du devis',
      error: err.message
    });
  }
};

// @desc    Obtenir les devis pour une annonce (annonceur)
// @route   GET /api/devis/annonce/:annonceId
// @access  Privé (propriétaire de l'annonce)
exports.getDevisForAnnonce = async (req, res) => {
  try {
    const { annonceId } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Vérifier si l'annonce existe
    const annonce = await Annonce.findById(annonceId);
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si l'utilisateur est bien le propriétaire de l'annonce
    if (annonce.utilisateur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir les devis de cette annonce'
      });
    }
    
    // Récupérer tous les devis pour cette annonce
    const devis = await Devis.find({ annonce: annonceId })
      .populate('transporteur', 'nom prenom email photo notation vehicules')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: devis.length,
      data: devis
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des devis:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devis',
      error: err.message
    });
  }
};

// @desc    Obtenir les devis envoyés par le transporteur
// @route   GET /api/devis/mes-devis
// @access  Privé (transporteur)
exports.getMesDevisEnvoyes = async (req, res) => {
  try {
    const { statut, page = 1, limit = 10 } = req.query;
    
    // Construire la requête
    const query = { transporteur: req.user.id };
    
    // Filtrer par statut si fourni
    if (statut) {
      query.statut = statut;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Compter le nombre total de devis pour la pagination
    const total = await Devis.countDocuments(query);
    
    // Récupérer les devis
    const devis = await Devis.find(query)
      .populate('annonce', 'titre villeDepart villeArrivee typeTransport dateDepart statut')
      .populate('annonce.utilisateur', 'nom prenom photo notation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: devis.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: devis
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des devis:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos devis',
      error: err.message
    });
  }
};

// @desc    Obtenir les devis reçus par le client
// @route   GET /api/devis/recus
// @access  Privé (client)
exports.getMesDevisRecus = async (req, res) => {
  try {
    const { statut, annonceId, page = 1, limit = 10 } = req.query;
    
    // D'abord, trouver toutes les annonces de l'utilisateur
    const annonces = await Annonce.find({ utilisateur: req.user.id });
    
    if (annonces.length === 0) {
      return res.json({
        success: true,
        count: 0,
        total: 0,
        pages: 0,
        currentPage: parseInt(page),
        data: []
      });
    }
    
    // Construire la requête
    const query = { 
      annonce: { 
        $in: annonces.map(annonce => annonce._id) 
      }
    };
    
    // Filtrer par statut si fourni
    if (statut) {
      query.statut = statut;
    }
    
    // Filtrer par annonce spécifique si fournie
    if (annonceId && mongoose.Types.ObjectId.isValid(annonceId)) {
      query.annonce = annonceId;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Compter le nombre total de devis pour la pagination
    const total = await Devis.countDocuments(query);
    
    // Récupérer les devis
    const devis = await Devis.find(query)
      .populate('transporteur', 'nom prenom email photo notation vehicules')
      .populate('annonce', 'titre villeDepart villeArrivee typeTransport dateDepart statut')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: devis.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: devis
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des devis reçus:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devis reçus',
      error: err.message
    });
  }
};

// @desc    Obtenir un devis par son ID
// @route   GET /api/devis/:id
// @access  Privé (client ou transporteur concerné)
exports.getDevisById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de devis invalide'
      });
    }
    
    // Récupérer le devis avec les informations de l'annonce et du transporteur
    const devis = await Devis.findById(id)
      .populate('transporteur', 'nom prenom email photo notation vehicules')
      .populate({
        path: 'annonce',
        populate: {
          path: 'utilisateur',
          select: 'nom prenom email photo notation'
        }
      });
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est impliqué dans ce devis (transporteur ou propriétaire de l'annonce)
    const estTransporteur = devis.transporteur._id.toString() === req.user.id;
    const estProprietaire = devis.annonce.utilisateur._id.toString() === req.user.id;
    
    if (!estTransporteur && !estProprietaire) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir ce devis'
      });
    }
    
    res.json({
      success: true,
      data: devis
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du devis:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du devis',
      error: err.message
    });
  }
};

// @desc    Accepter un devis (client)
// @route   PUT /api/devis/:devisId/accepter
// @access  Privé (propriétaire de l'annonce)
exports.accepterDevis = async (req, res) => {
  try {
    const { devisId } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(devisId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de devis invalide'
      });
    }
    
    // Récupérer le devis avec les informations de l'annonce
    const devis = await Devis.findById(devisId)
      .populate('annonce')
      .populate('transporteur', 'nom prenom email');
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }
    
    // Vérifier si le devis est toujours en attente
    if (devis.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: `Ce devis ne peut pas être accepté car il est déjà ${devis.statut}`
      });
    }
    
    // Vérifier si le devis est toujours valide (date de validité non dépassée)
    if (devis.validiteDevis && new Date(devis.validiteDevis) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Ce devis a expiré et ne peut plus être accepté'
      });
    }
    
    // Vérifier si l'annonce est bien au client connecté
    if (devis.annonce.utilisateur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à accepter ce devis'
      });
    }
    
    // Accepter le devis et mettre à jour le statut de l'annonce et des autres devis
    await devis.accepter();
    
    // Récupérer le devis mis à jour avec les informations du transporteur
    const devisMisAJour = await Devis.findById(devisId)
      .populate('transporteur', 'nom prenom email photo notation')
      .populate('annonce', 'titre villeDepart villeArrivee statut');
    
    // Envoyer une notification au transporteur
    try {
      await NotificationService.create(
        devis.transporteur._id,
        'Devis accepté',
        `Votre devis pour l'annonce "${devis.annonce.titre}" a été accepté par le client. Vous pouvez maintenant planifier le transport.`,
        'devis_accepte',
        devisId,
        'Devis'
      );
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification d\'acceptation de devis:', notifError);
    }
    
    // Notifier les autres transporteurs dont les devis ont été automatiquement refusés
    try {
      const devisRefuses = await Devis.find({
        annonce: devis.annonce._id,
        _id: { $ne: devisId },
        statut: 'refuse'
      }).populate('transporteur');
      
      if (devisRefuses && devisRefuses.length > 0) {
        const transporteurIds = [...new Set(devisRefuses.map(d => d.transporteur._id.toString()))];
        
        await NotificationService.notifyMany(
          transporteurIds,
          'Devis refusé',
          `Votre devis pour l'annonce "${devis.annonce.titre}" a été refusé car le client a choisi un autre transporteur.`,
          'devis_refuse',
          devis.annonce._id,
          'Annonce'
        );
      }
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi des notifications de refus de devis:', notifError);
    }
    
    res.json({
      success: true,
      message: 'Devis accepté avec succès',
      data: devisMisAJour
    });
  } catch (err) {
    console.error('Erreur lors de l\'acceptation du devis:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'acceptation du devis',
      error: err.message
    });
  }
};

// @desc    Refuser un devis (client)
// @route   PUT /api/devis/:devisId/refuser
// @access  Privé (propriétaire de l'annonce)
exports.refuserDevis = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { raison } = req.body;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(devisId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de devis invalide'
      });
    }
    
    // Récupérer le devis avec les informations de l'annonce
    const devis = await Devis.findById(devisId)
      .populate('annonce')
      .populate('transporteur', 'nom prenom email');
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }
    
    // Vérifier si le devis est toujours en attente
    if (devis.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: `Ce devis ne peut pas être refusé car il est déjà ${devis.statut}`
      });
    }
    
    // Vérifier si l'annonce est bien au client connecté
    if (devis.annonce.utilisateur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à refuser ce devis'
      });
    }
    
    // Ajouter un commentaire du client si fourni
    if (raison) {
      devis.commentairesClient = raison;
    }
    
    // Refuser le devis
    await devis.refuser();
    
    // Envoyer une notification au transporteur
    try {
      await NotificationService.create(
        devis.transporteur._id,
        'Devis refusé',
        `Votre devis pour l'annonce "${devis.annonce.titre}" a été refusé par le client${raison ? `. Raison: ${raison}` : '.'}`,
        'devis_refuse',
        devisId,
        'Devis'
      );
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification de refus de devis:', notifError);
    }
    
    res.json({
      success: true,
      message: 'Devis refusé avec succès'
    });
  } catch (err) {
    console.error('Erreur lors du refus du devis:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du refus du devis',
      error: err.message
    });
  }
};

// @desc    Annuler un devis (transporteur)
// @route   PUT /api/devis/:devisId/annuler
// @access  Privé (transporteur)
exports.annulerDevis = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { raison } = req.body;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(devisId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de devis invalide'
      });
    }
    
    // Récupérer le devis
    const devis = await Devis.findById(devisId)
      .populate('annonce', 'titre utilisateur');
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }
    
    // Vérifier si le devis est bien au transporteur connecté
    if (devis.transporteur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à annuler ce devis'
      });
    }
    
    // Vérifier si le devis peut être annulé (en attente ou accepté mais pas encore en cours)
    if (devis.statut !== 'en_attente' && devis.statut !== 'accepte') {
      return res.status(400).json({
        success: false,
        message: `Ce devis ne peut pas être annulé car il est déjà ${devis.statut}`
      });
    }
    
    // Si le devis était accepté, il faut remettre l'annonce en disponible
    if (devis.statut === 'accepte') {
      await Annonce.findByIdAndUpdate(devis.annonce._id, {
        statut: 'disponible',
        devisAccepte: null
      });
    }
    
    // Mettre à jour le devis
    devis.statut = 'annule';
    
    if (raison) {
      devis.commentairesTransporteur = raison;
    }
    
    await devis.save();
    
    // Envoyer une notification au client
    try {
      await NotificationService.create(
        devis.annonce.utilisateur,
        'Devis annulé par le transporteur',
        `Le devis pour votre annonce "${devis.annonce.titre}" a été annulé par le transporteur${raison ? `. Raison: ${raison}` : '.'}`,
        'devis_annule',
        devisId,
        'Devis'
      );
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification d\'annulation de devis:', notifError);
    }
    
    res.json({
      success: true,
      message: 'Devis annulé avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de l\'annulation du devis:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation du devis',
      error: err.message
    });
  }
};

// @desc    Mettre à jour le statut d'un transport en cours (transporteur)
// @route   PUT /api/devis/:devisId/statut
// @access  Privé (transporteur)
exports.updateStatutTransport = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { statut, commentaire, localisation } = req.body;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(devisId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de devis invalide'
      });
    }
    
    // Vérifier si le statut est valide
    const statutsValides = ['en_cours', 'en_transit', 'en_livraison', 'livre', 'termine', 'probleme'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    // Récupérer le devis et l'annonce associée
    const devis = await Devis.findById(devisId);
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }
    
    // Vérifier si le devis est bien au transporteur connecté
    if (devis.transporteur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à mettre à jour ce devis'
      });
    }
    
    // Vérifier si le devis est accepté ou déjà en cours
    if (devis.statut !== 'accepte' && devis.statut !== 'en_cours') {
      return res.status(400).json({
        success: false,
        message: `Ce devis ne peut pas être mis à jour car il est ${devis.statut}`
      });
    }
    
    // Mettre à jour le statut du devis
    devis.statut = statut === 'termine' ? 'termine' : 'en_cours';
    
    // Récupérer et mettre à jour l'annonce
    const annonce = await Annonce.findById(devis.annonce)
      .populate('utilisateur', 'nom prenom email');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Mettre à jour le tracking de l'annonce
    if (!annonce.tracking) {
      annonce.tracking = {
        statut: 'en_attente',
        historique: []
      };
    }
    
    // Map devis status to valid tracking status
    let trackingStatut;
    switch(statut) {
      case 'en_cours':
        trackingStatut = 'pris_en_charge';
        break;
      case 'en_transit':
        trackingStatut = 'en_transit';
        break;
      case 'en_livraison':
        trackingStatut = 'en_livraison';
        break;
      case 'livre':
      case 'termine':
        trackingStatut = 'livre';
        break;
      case 'probleme':
        trackingStatut = 'probleme';
        break;
      default:
        trackingStatut = 'en_attente';
    }
    
    // Mettre à jour le statut du tracking
    annonce.tracking.statut = trackingStatut;
    
    // Ajouter une entrée dans l'historique du tracking
    annonce.tracking.historique.push({
      statut: trackingStatut,
      date: new Date(),
      commentaire: commentaire || '',
      localisation: localisation || ''
    });
    
    // Si le statut est 'termine', mettre à jour l'annonce en conséquence
    if (statut === 'termine') {
      annonce.statut = 'termine';
    } else if (statut !== annonce.statut) {
      annonce.statut = 'en_cours';
    }
    
    // Sauvegarder les modifications
    await Promise.all([devis.save(), annonce.save()]);
    
    // Envoyer une notification au client
    try {
      const statusMessages = {
        en_cours: 'Le transporteur a commencé la prise en charge de votre transport',
        en_transit: 'Votre colis est en transit',
        en_livraison: 'Votre colis est en cours de livraison',
        livre: 'Votre colis a été livré',
        termine: 'Le transport est terminé',
        probleme: 'Un problème est survenu avec votre transport'
      };
      
      await NotificationService.createAnnonceStatusNotification(
        annonce.utilisateur._id,
        `Mise à jour du statut: ${statut}`,
        `${statusMessages[statut]}${commentaire ? `. Commentaire: ${commentaire}` : ''}`,
        annonce._id
      );
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification de mise à jour de statut:', notifError);
    }
    
    res.json({
      success: true,
      message: `Statut mis à jour: ${statut}`,
      data: {
        devis,
        annonce: {
          _id: annonce._id,
          statut: annonce.statut,
          tracking: annonce.tracking
        }
      }
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: err.message
    });
  }
};

// @desc    Modifier un devis (transporteur)
// @route   PUT /api/devis/:devisId
// @access  Privé (transporteur)
exports.updateDevis = async (req, res) => {
  try {
    const { devisId } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(devisId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de devis invalide'
      });
    }
    
    // Récupérer le devis
    const devis = await Devis.findById(devisId)
      .populate('annonce', 'titre utilisateur');
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }
    
    // Vérifier si le devis est bien au transporteur connecté
    if (devis.transporteur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce devis'
      });
    }
    
    // Vérifier si le devis peut être modifié (seulement si en attente)
    if (devis.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: `Ce devis ne peut pas être modifié car il est déjà ${devis.statut}`
      });
    }
    
    // Récupérer les champs à mettre à jour
    const {
      montant,
      message,
      delaiLivraison,
      detailTarifs,
      descriptionAutresFrais,
      dureeTransport,
      vehiculeUtilise,
      disponibilites,
      options,
      conditionsPaiement,
      validiteDevis
    } = req.body;
    
    // Mettre à jour les champs modifiables
    if (montant !== undefined) devis.montant = montant;
    if (message) devis.message = message;
    if (delaiLivraison) devis.delaiLivraison = delaiLivraison;
    if (detailTarifs) devis.detailTarifs = detailTarifs;
    if (descriptionAutresFrais !== undefined) devis.descriptionAutresFrais = descriptionAutresFrais;
    if (dureeTransport !== undefined) devis.dureeTransport = dureeTransport;
    if (vehiculeUtilise) devis.vehiculeUtilise = vehiculeUtilise;
    if (disponibilites) devis.disponibilites = disponibilites;
    if (options) devis.options = options;
    if (conditionsPaiement) devis.conditionsPaiement = conditionsPaiement;
    if (validiteDevis) devis.validiteDevis = validiteDevis;
    
    // Sauvegarder les modifications
    const devisMisAJour = await devis.save();
    
    // Récupérer le devis mis à jour avec les informations du transporteur et de l'annonce
    const devisComplet = await Devis.findById(devisMisAJour._id)
      .populate('transporteur', 'nom prenom email photo notation vehicules')
      .populate('annonce', 'titre villeDepart villeArrivee typeTransport dateDepart');

    // Envoyer une notification au client
    try {
      await NotificationService.create(
        devis.annonce.utilisateur,
        'Devis mis à jour',
        `Le devis pour votre annonce "${devis.annonce.titre}" a été mis à jour par le transporteur. Veuillez consulter les nouvelles conditions.`,
        'devis_modifie',
        devisId,
        'Devis'
      );
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification de mise à jour de devis:', notifError);
    }
    
    res.json({
      success: true,
      message: 'Devis mis à jour avec succès',
      data: devisComplet
    });
  } catch (err) {
    console.error('Erreur lors de la modification du devis:', err);
    
    // Erreur de validation mongoose
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du devis',
      error: err.message
    });
  }
};