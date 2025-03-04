// backend/src/controllers/avisController.js
const Avis = require('../models/Avis');
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const mongoose = require('mongoose');

// @desc    Créer un nouvel avis
// @route   POST /api/avis
// @access  Privé
exports.createAvis = async (req, res) => {
  try {
    const { note, commentaire, destinataireId, annonceId } = req.body;

    // Vérifier si l'ID du destinataire est valide
    if (!mongoose.Types.ObjectId.isValid(destinataireId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de destinataire invalide'
      });
    }

    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }

    // Vérifier si l'annonce existe et est terminée
    const annonce = await Annonce.findById(annonceId);
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    if (annonce.statut !== 'termine') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez donner un avis que pour une annonce terminée'
      });
    }

    // Vérifier si l'utilisateur est impliqué dans l'annonce
    const estClient = annonce.utilisateur.toString() === req.user.id;
    const estTransporteur = false; // À compléter avec la logique pour vérifier si l'utilisateur est le transporteur choisi

    if (!estClient && !estTransporteur) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à donner un avis sur cette annonce'
      });
    }

    // Vérifier si l'utilisateur a déjà donné un avis pour cette annonce
    const avisExistant = await Avis.findOne({
      auteur: req.user.id,
      annonce: annonceId
    });

    if (avisExistant) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà donné un avis pour cette annonce'
      });
    }

    // Créer l'avis
    const avis = new Avis({
      note,
      commentaire,
      auteur: req.user.id,
      destinataire: destinataireId,
      annonce: annonceId
    });

    const nouvelAvis = await avis.save();

    // Mettre à jour la notation moyenne du destinataire
    const destinataire = await User.findById(destinataireId);
    const tousLesAvis = await Avis.find({ destinataire: destinataireId });
    
    const sommeNotes = tousLesAvis.reduce((acc, avis) => acc + avis.note, 0);
    const nouvelleNote = sommeNotes / tousLesAvis.length;
    
    destinataire.notation.moyenne = parseFloat(nouvelleNote.toFixed(1));
    destinataire.notation.nombreAvis = tousLesAvis.length;
    await destinataire.save();

    // Récupérer l'avis complet avec les informations de l'auteur et du destinataire
    const avisComplet = await Avis.findById(nouvelAvis._id)
      .populate('auteur', 'nom prenom photo')
      .populate('destinataire', 'nom prenom photo notation')
      .populate('annonce', 'titre villeDepart villeArrivee');

    res.status(201).json({
      success: true,
      message: 'Avis créé avec succès',
      data: avisComplet
    });
  } catch (err) {
    console.error('Erreur lors de la création de l\'avis:', err);

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
      message: 'Erreur lors de la création de l\'avis',
      error: err.message
    });
  }
};

// @desc    Récupérer les avis d'un utilisateur spécifique
// @route   GET /api/avis/utilisateur/:userId
// @access  Privé
exports.getAvisUtilisateur = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    // Vérifier si l'ID utilisateur est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await User.findById(userId);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Compter le total pour la pagination
    const total = await Avis.countDocuments({ destinataire: userId });

    // Récupérer les avis
    const avis = await Avis.find({ destinataire: userId })
      .populate('auteur', 'nom prenom photo')
      .populate('annonce', 'titre villeDepart villeArrivee')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: avis.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: avis
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des avis:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: err.message
    });
  }
};

// @desc    Récupérer les avis donnés par l'utilisateur connecté
// @route   GET /api/avis/donnes
// @access  Privé
exports.getAvisDonnes = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Compter le total pour la pagination
    const total = await Avis.countDocuments({ auteur: req.user.id });

    // Récupérer les avis donnés par l'utilisateur
    const avis = await Avis.find({ auteur: req.user.id })
      .populate('destinataire', 'nom prenom photo notation')
      .populate('annonce', 'titre villeDepart villeArrivee')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: avis.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: avis
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des avis donnés:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis donnés',
      error: err.message
    });
  }
};

// @desc    Récupérer les avis reçus par l'utilisateur connecté
// @route   GET /api/avis/recus
// @access  Privé
exports.getAvisRecus = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Compter le total pour la pagination
    const total = await Avis.countDocuments({ destinataire: req.user.id });

    // Récupérer les avis reçus par l'utilisateur
    const avis = await Avis.find({ destinataire: req.user.id })
      .populate('auteur', 'nom prenom photo')
      .populate('annonce', 'titre villeDepart villeArrivee')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: avis.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: avis
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des avis reçus:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis reçus',
      error: err.message
    });
  }
};