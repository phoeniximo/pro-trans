// backend/src/controllers/annonceController.js
const Annonce = require('../models/Annonce');
const Devis = require('../models/Devis');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const NotificationService = require('../services/notificationService');
const User = require('../models/User');

// @desc    Récupérer toutes les annonces
// @route   GET /api/annonces
// @access  Public
exports.listerAnnonces = async (req, res) => {
  try {
    const { 
      statut, 
      villeDepart, 
      villeArrivee, 
      typeTransport, 
      dateDepartMin, 
      dateDepartMax,
      limit = 10,
      page = 1
    } = req.query;

    // Construire le filtre de recherche
    const filter = {};
    
    if (statut) filter.statut = statut;
    if (villeDepart) filter.villeDepart = { $regex: villeDepart, $options: 'i' };
    if (villeArrivee) filter.villeArrivee = { $regex: villeArrivee, $options: 'i' };
    if (typeTransport) filter.typeTransport = typeTransport;
    
    // Filtre de date
    if (dateDepartMin || dateDepartMax) {
      filter.dateDepart = {};
      if (dateDepartMin) filter.dateDepart.$gte = new Date(dateDepartMin);
      if (dateDepartMax) filter.dateDepart.$lte = new Date(dateDepartMax);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Compter le total pour la pagination
    const total = await Annonce.countDocuments(filter);

    // Exécuter la requête avec pagination
    const annonces = await Annonce.find(filter)
      .populate('utilisateur', 'nom prenom email photo notation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Réponse avec métadonnées de pagination
    res.json({
      success: true,
      count: annonces.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: annonces
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des annonces:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des annonces',
      error: err.message
    });
  }
};

// @desc    Créer une nouvelle annonce
// @route   POST /api/annonces
// @access  Privé
exports.creerAnnonce = async (req, res) => {
  try {
    // Créer l'annonce avec l'ID de l'utilisateur connecté
    const annonce = new Annonce({
      utilisateur: req.user.id,
      ...req.body
    });

    const nouvelleAnnonce = await annonce.save();

    // Récupérer l'annonce avec les infos de l'utilisateur
    const annonceComplete = await Annonce.findById(nouvelleAnnonce._id)
      .populate('utilisateur', 'nom prenom email photo');

    // Notifier les transporteurs potentiels qui correspondent aux critères
    try {
      // Trouver des transporteurs qui pourraient être intéressés par cette annonce
      // Par exemple, ceux qui sont dans la même ville ou région
      const transporteursInteresses = await User.find({
        role: 'transporteur',
        actif: true,
        'adresse.ville': { $regex: new RegExp(annonce.villeDepart, 'i') }
      }).select('_id');

      if (transporteursInteresses && transporteursInteresses.length > 0) {
        await NotificationService.notifyMany(
          transporteursInteresses.map(t => t._id),
          'Nouvelle annonce disponible',
          `Nouvelle opportunité de transport de ${annonce.villeDepart} à ${annonce.villeArrivee}`,
          'annonce',
          nouvelleAnnonce._id,
          'Annonce'
        );
      }
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi des notifications:', notifError);
      // On continue l'exécution même si les notifications échouent
    }

    res.status(201).json({
      success: true,
      message: 'Annonce créée avec succès',
      data: annonceComplete
    });
  } catch (err) {
    console.error('Erreur lors de la création de l\'annonce:', err);
    
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
      message: 'Erreur lors de la création de l\'annonce',
      error: err.message
    });
  }
};

// @desc    Récupérer une annonce par son ID
// @route   GET /api/annonces/:id
// @access  Public
exports.getAnnonceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }

    // Récupérer l'annonce avec les infos de l'utilisateur
    const annonce = await Annonce.findById(id)
      .populate('utilisateur', 'nom prenom email photo notation')
      .populate({
        path: 'devis',
        match: { statut: { $ne: 'refuse' } },
        select: 'montant delaiLivraison statut transporteur',
        populate: {
          path: 'transporteur',
          select: 'nom prenom photo notation'
        }
      });

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    res.json({
      success: true,
      data: annonce
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'annonce:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'annonce',
      error: err.message
    });
  }
};

// @desc    Modifier une annonce
// @route   PUT /api/annonces/:id
// @access  Privé (propriétaire uniquement)
exports.modifierAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }

    // Vérifier si l'annonce a déjà un devis accepté
    const annonceExistante = await Annonce.findById(id);
    
    if (!annonceExistante) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si l'utilisateur est bien le propriétaire de l'annonce
    if (annonceExistante.utilisateur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier cette annonce'
      });
    }
    
    // Vérifier si l'annonce est encore modifiable (statut disponible)
    if (annonceExistante.statut !== 'disponible') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de modifier une annonce déjà en cours ou terminée'
      });
    }

    // Mettre à jour l'annonce
    const annonceModifiee = await Annonce.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('utilisateur', 'nom prenom email photo');

    // Notifier les transporteurs qui ont déjà proposé un devis sur cette annonce
    try {
      const devisExistants = await Devis.find({ annonce: id, statut: 'en_attente' });
      if (devisExistants && devisExistants.length > 0) {
        const transporteurIds = [...new Set(devisExistants.map(d => d.transporteur.toString()))];
        await NotificationService.notifyMany(
          transporteurIds,
          'Modification d\'annonce',
          `L'annonce "${annonceModifiee.titre}" a été modifiée. Veuillez vérifier les nouveaux détails.`,
          'modification_annonce',
          annonceModifiee._id,
          'Annonce'
        );
      }
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi des notifications de modification:', notifError);
    }

    res.json({
      success: true,
      message: 'Annonce modifiée avec succès',
      data: annonceModifiee
    });
  } catch (err) {
    console.error('Erreur lors de la modification de l\'annonce:', err);
    
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
      message: 'Erreur lors de la modification de l\'annonce',
      error: err.message
    });
  }
};

// @desc    Supprimer une annonce
// @route   DELETE /api/annonces/:id
// @access  Privé (propriétaire uniquement)
exports.supprimerAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }

    // Vérifier si l'annonce existe
    const annonce = await Annonce.findById(id);
    
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
        message: 'Vous n\'êtes pas autorisé à supprimer cette annonce'
      });
    }
    
    // Vérifier si l'annonce est encore supprimable (statut disponible)
    if (annonce.statut !== 'disponible') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une annonce déjà en cours ou terminée'
      });
    }

    // Notifier les transporteurs qui ont déjà proposé un devis sur cette annonce
    try {
      const devisExistants = await Devis.find({ annonce: id, statut: 'en_attente' });
      if (devisExistants && devisExistants.length > 0) {
        const transporteurIds = [...new Set(devisExistants.map(d => d.transporteur.toString()))];
        await NotificationService.notifyMany(
          transporteurIds,
          'Annonce supprimée',
          `L'annonce "${annonce.titre}" a été supprimée par le client.`,
          'suppression_annonce',
          null,
          'Annonce'
        );
      }
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi des notifications de suppression:', notifError);
    }

    // Supprimer aussi tous les devis associés
    await Devis.deleteMany({ annonce: id });
    
    // Supprimer l'annonce
    await annonce.deleteOne();

    res.json({
      success: true,
      message: 'Annonce et devis associés supprimés avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'annonce:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'annonce',
      error: err.message
    });
  }
};

// @desc    Récupérer mes annonces
// @route   GET /api/annonces/user/mes-annonces
// @access  Privé
exports.getMesAnnonces = async (req, res) => {
  try {
    const { statut, limit = 10, page = 1 } = req.query;
    
    // Construire le filtre de recherche
    const filter = { utilisateur: req.user.id };
    if (statut) filter.statut = statut;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Compter le total pour la pagination
    const total = await Annonce.countDocuments(filter);
    
    // Récupérer les annonces de l'utilisateur connecté
    const annonces = await Annonce.find(filter)
      .populate({
        path: 'devis',
        select: 'montant statut transporteur delaiLivraison',
        populate: {
          path: 'transporteur',
          select: 'nom prenom photo notation'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: annonces.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: annonces
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de vos annonces:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos annonces',
      error: err.message
    });
  }
};

// @desc    Uploader des photos pour une annonce
// @route   POST /api/annonces/:id/upload
// @access  Privé
exports.uploadPhotos = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }

    // Vérifier si l'annonce existe
    const annonce = await Annonce.findById(id);
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si l'utilisateur est le propriétaire de l'annonce
    if (annonce.utilisateur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier cette annonce'
      });
    }

    // Gérer l'upload des fichiers
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier téléchargé'
      });
    }

    const uploadedFiles = [];
    const uploadDir = path.join(__dirname, '../../uploads');

    // Créer le dossier d'uploads s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Fonction pour gérer l'upload d'un fichier
    const uploadFile = async (file) => {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadDir, fileName);
      
      await file.mv(filePath);
      
      // Chemin relatif pour la base de données
      return `/uploads/${fileName}`;
    };

    // Gérer upload multiple
    if (Array.isArray(req.files.photos)) {
      for (const file of req.files.photos) {
        const filePath = await uploadFile(file);
        uploadedFiles.push(filePath);
      }
    } else {
      // Gérer upload simple
      const filePath = await uploadFile(req.files.photos);
      uploadedFiles.push(filePath);
    }

    // Mettre à jour l'annonce avec les chemins des photos
    annonce.photos = [...(annonce.photos || []), ...uploadedFiles];
    await annonce.save();

    // Notifier les transporteurs qui ont proposé un devis qu'il y a de nouvelles photos
    try {
      const devisExistants = await Devis.find({ annonce: id, statut: 'en_attente' });
      if (devisExistants && devisExistants.length > 0) {
        const transporteurIds = [...new Set(devisExistants.map(d => d.transporteur.toString()))];
        await NotificationService.notifyMany(
          transporteurIds,
          'Nouvelles photos ajoutées',
          `De nouvelles photos ont été ajoutées à l'annonce "${annonce.titre}".`,
          'ajout_photos',
          annonce._id,
          'Annonce'
        );
      }
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi des notifications d\'ajout de photos:', notifError);
    }

    res.json({
      success: true,
      message: 'Photos téléchargées avec succès',
      data: {
        photos: annonce.photos
      }
    });
    
  } catch (err) {
    console.error('Erreur lors de l\'upload des photos:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload des photos',
      error: err.message
    });
  }
};