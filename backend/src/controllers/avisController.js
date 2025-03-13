// backend/src/controllers/avisController.js
const Avis = require('../models/Avis');
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const Devis = require('../models/Devis'); // Ajout pour vérifier le statut du devis
const mongoose = require('mongoose');

// @desc    Créer un nouvel avis
// @route   POST /api/avis
// @access  Privé
exports.createAvis = async (req, res) => {
  try {
    console.log("Création d'avis - Données reçues:", req.body);
    console.log("Utilisateur:", req.user.id);
    
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

    // Vérifier si l'annonce existe
    const annonce = await Annonce.findById(annonceId);
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier le statut de l'annonce ou du devis associé
    let statutOk = false;
    
    if (annonce.statut === 'termine') {
      statutOk = true;
    } else {
      // Vérifier si un devis lié à cette annonce est au statut "livre" ou "termine"
      const devis = await Devis.findOne({
        annonce: annonceId,
        $or: [{ statut: 'livre' }, { statut: 'termine' }]
      });
      
      if (devis) {
        statutOk = true;
        console.log("Devis trouvé au statut acceptable:", devis.statut);
      }
    }
    
    if (!statutOk) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez donner un avis que pour une livraison terminée'
      });
    }

    // Vérifier si l'utilisateur est impliqué dans l'annonce
    const estClient = annonce.utilisateur.toString() === req.user.id;
    
    // Vérifier si l'utilisateur est le transporteur choisi
    let estTransporteur = false;
    const devisAccepte = await Devis.findOne({
      annonce: annonceId,
      transporteur: req.user.id,
      $or: [{ statut: 'accepte' }, { statut: 'en_cours' }, { statut: 'livre' }, { statut: 'termine' }]
    });
    
    if (devisAccepte) {
      estTransporteur = true;
    }
    
    console.log("Vérification des rôles:", { estClient, estTransporteur });

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
    console.log("Nouvel avis créé avec ID:", nouvelAvis._id);

    // Mettre à jour la notation moyenne du destinataire
    const destinataire = await User.findById(destinataireId);
    if (!destinataire) {
      console.error(`Destinataire introuvable: ${destinataireId}`);
      // Continuer malgré l'erreur, l'avis est déjà créé
    } else {
      const tousLesAvis = await Avis.find({ destinataire: destinataireId });
      
      if (tousLesAvis && tousLesAvis.length > 0) {
        const sommeNotes = tousLesAvis.reduce((acc, avisItem) => acc + avisItem.note, 0);
        const nouvelleNote = sommeNotes / tousLesAvis.length;
        
        if (!destinataire.notation) {
          destinataire.notation = {};
        }
        
        destinataire.notation.moyenne = parseFloat(nouvelleNote.toFixed(1));
        destinataire.notation.nombreAvis = tousLesAvis.length;
        await destinataire.save();
        console.log("Notation mise à jour pour", destinataireId, ":", destinataire.notation);
      }
    }

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
    
    console.log("Récupération des avis pour l'utilisateur:", userId);
    console.log("Paramètres:", { limit, page });

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
    console.log("Pagination:", { skip, limit: parseInt(limit) });

    // Compter le total pour la pagination
    const total = await Avis.countDocuments({ destinataire: userId });
    console.log("Total des avis trouvés:", total);

    // Récupérer les avis
    const avis = await Avis.find({ destinataire: userId })
      .populate('auteur', 'nom prenom photo')
      .populate('annonce', 'titre villeDepart villeArrivee')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log("Nombre d'avis récupérés:", avis.length);

    // Transformer les données pour garantir la structure
    const avisFormattes = avis.map(a => ({
      _id: a._id,
      note: a.note,
      commentaire: a.commentaire,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      auteur: a.auteur ? {
        _id: a.auteur._id,
        nom: a.auteur.nom || '',
        prenom: a.auteur.prenom || '',
        photo: a.auteur.photo || null
      } : null,
      annonce: a.annonce ? {
        _id: a.annonce._id,
        titre: a.annonce.titre || '',
        villeDepart: a.annonce.villeDepart || '',
        villeArrivee: a.annonce.villeArrivee || ''
      } : null
    }));

    res.json({
      success: true,
      count: avisFormattes.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: avisFormattes
    });
  } catch (err) {
    console.error('Erreur détaillée lors de la récupération des avis:', err);
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
    
    console.log("getAvisDonnes - Utilisateur:", req.user.id);
    console.log("Paramètres:", { limit, page });
    
    // Vérifier que l'ID utilisateur est valide
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log("Pagination:", { skip, limit: parseInt(limit) });

    // Compter le total pour la pagination
    const total = await Avis.countDocuments({ auteur: req.user.id });
    console.log("Total des avis donnés:", total);

    // Récupérer les avis donnés par l'utilisateur
    const avis = await Avis.find({ auteur: req.user.id })
      .populate('destinataire', 'nom prenom photo notation')
      .populate('annonce', 'titre villeDepart villeArrivee')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log("Nombre d'avis récupérés:", avis.length);
    
    // Transformer les données pour garantir la structure
    const avisFormattes = avis.map(a => ({
      _id: a._id,
      note: a.note,
      commentaire: a.commentaire,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      destinataire: a.destinataire ? {
        _id: a.destinataire._id,
        nom: a.destinataire.nom || '',
        prenom: a.destinataire.prenom || '',
        photo: a.destinataire.photo || null,
        notation: a.destinataire.notation || { moyenne: 0, nombreAvis: 0 }
      } : null,
      annonce: a.annonce ? {
        _id: a.annonce._id,
        titre: a.annonce.titre || '',
        villeDepart: a.annonce.villeDepart || '',
        villeArrivee: a.annonce.villeArrivee || ''
      } : null
    }));

    const response = {
      success: true,
      count: avisFormattes.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: avisFormattes
    };
    
    console.log("Réponse préparée avec", response.count, "avis");
    
    res.json(response);
  } catch (err) {
    console.error('Erreur détaillée lors de la récupération des avis donnés:', err);
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
    
    console.log("getAvisRecus - Utilisateur:", req.user.id);
    console.log("Paramètres:", { limit, page });
    
    // Vérifier que l'ID utilisateur est valide
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log("Pagination:", { skip, limit: parseInt(limit) });

    // Compter le total pour la pagination
    const total = await Avis.countDocuments({ destinataire: req.user.id });
    console.log("Total des avis reçus:", total);

    // Récupérer les avis reçus par l'utilisateur
    const avis = await Avis.find({ destinataire: req.user.id })
      .populate('auteur', 'nom prenom photo')
      .populate('annonce', 'titre villeDepart villeArrivee')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log("Nombre d'avis récupérés:", avis.length);
    
    // Transformer les données pour garantir la structure
    const avisFormattes = avis.map(a => ({
      _id: a._id,
      note: a.note,
      commentaire: a.commentaire,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      auteur: a.auteur ? {
        _id: a.auteur._id,
        nom: a.auteur.nom || '',
        prenom: a.auteur.prenom || '',
        photo: a.auteur.photo || null
      } : null,
      annonce: a.annonce ? {
        _id: a.annonce._id,
        titre: a.annonce.titre || '',
        villeDepart: a.annonce.villeDepart || '',
        villeArrivee: a.annonce.villeArrivee || ''
      } : null
    }));

    const response = {
      success: true,
      count: avisFormattes.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: avisFormattes
    };
    
    console.log("Réponse préparée avec", response.count, "avis");
    
    res.json(response);
  } catch (err) {
    console.error('Erreur détaillée lors de la récupération des avis reçus:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis reçus',
      error: err.message
    });
  }
};

// @desc    Vérifier si un avis existe déjà pour un transporteur et une annonce
// @route   GET /api/avis/check/:destinataireId/:annonceId
// @access  Privé
exports.checkAvisExists = async (req, res) => {
  try {
    const { destinataireId, annonceId } = req.params;
    
    console.log("Vérification de l'existence d'un avis:", {
      utilisateur: req.user.id,
      destinataire: destinataireId,
      annonce: annonceId
    });

    // Vérifier si les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(destinataireId) || 
        !mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide'
      });
    }

    // Vérifier si un avis existe déjà
    const avisExistant = await Avis.findOne({
      auteur: req.user.id,
      destinataire: destinataireId,
      annonce: annonceId
    });
    
    console.log("Résultat de la vérification:", !!avisExistant);

    res.json({
      success: true,
      exists: !!avisExistant
    });
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'avis:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'avis',
      error: err.message
    });
  }
};