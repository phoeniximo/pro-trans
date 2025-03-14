// backend/src/controllers/trackingController.js
const Annonce = require('../models/Annonce');
const Devis = require('../models/Devis');
const User = require('../models/User');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { sendTrackingUpdateEmail } = require('../utils/emailService');
const NotificationService = require('../services/notificationService');

// Génération d'un code de suivi unique
const generateTrackingCode = () => {
  // Format: PRO-XXXXX-XX (où X est alphanumérique)
  const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase().substring(0, 7);
  return `PRO-${randomPart.substring(0, 5)}-${randomPart.substring(5, 7)}`;
};

// @desc    Obtenir les informations de suivi d'une annonce (pour le client et le transporteur)
// @route   GET /api/tracking/:annonceId
// @access  Privé (client et transporteur concernés)
exports.getTracking = async (req, res) => {
  try {
    const { annonceId } = req.params;
    
    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Récupérer l'annonce avec les informations de suivi
    const annonce = await Annonce.findById(annonceId)
      .populate('utilisateur', 'nom prenom email photo')
      .populate({
        path: 'devisAccepte',
        populate: {
          path: 'transporteur',
          select: 'nom prenom email telephone photo vehicules'
        }
      });
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si l'utilisateur est autorisé à voir ces informations
    const isClient = annonce.utilisateur._id.toString() === req.user.id;
    const isTransporteur = annonce.devisAccepte && 
                           annonce.devisAccepte.transporteur && 
                           annonce.devisAccepte.transporteur._id.toString() === req.user.id;
    
    if (!isClient && !isTransporteur) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à accéder à ces informations de suivi'
      });
    }
    
    // Si l'annonce n'a pas encore de suivi, initialiser un objet vide
    if (!annonce.tracking) {
      annonce.tracking = {
        statut: 'en_attente',
        historique: []
      };
    }
    
    res.json({
      success: true,
      data: {
        _id: annonce._id,
        titre: annonce.titre,
        villeDepart: annonce.villeDepart,
        villeArrivee: annonce.villeArrivee,
        statut: annonce.statut,
        tracking: annonce.tracking,
        dateDepart: annonce.dateDepart,
        client: {
          _id: annonce.utilisateur._id,
          nom: annonce.utilisateur.nom,
          prenom: annonce.utilisateur.prenom
        },
        transporteur: annonce.devisAccepte ? {
          _id: annonce.devisAccepte.transporteur._id,
          nom: annonce.devisAccepte.transporteur.nom,
          prenom: annonce.devisAccepte.transporteur.prenom,
          telephone: annonce.devisAccepte.transporteur.telephone
        } : null
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des informations de suivi:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations de suivi',
      error: err.message
    });
  }
};

// @desc    Obtenir les informations de suivi avec un code public
// @route   GET /api/tracking/public/:codeTracking
// @access  Public
exports.getTrackingPublic = async (req, res) => {
  try {
    const { codeTracking } = req.params;
    
    // Vérifier si le code de suivi est valide
    if (!codeTracking || codeTracking.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Code de suivi invalide'
      });
    }
    
    // Rechercher l'annonce par code de suivi
    const annonce = await Annonce.findOne({ 'tracking.codeTracking': codeTracking })
      .select('titre villeDepart villeArrivee statut tracking dateDepart');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Aucune expédition trouvée avec ce code de suivi'
      });
    }
    
    // Retourner les informations publiques de suivi
    res.json({
      success: true,
      data: {
        _id: annonce._id,
        titre: annonce.titre,
        villeDepart: annonce.villeDepart,
        villeArrivee: annonce.villeArrivee,
        statut: annonce.statut,
        tracking: {
          statut: annonce.tracking.statut,
          historique: annonce.tracking.historique,
          codeTracking: annonce.tracking.codeTracking
        },
        dateDepart: annonce.dateDepart
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des informations de suivi public:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations de suivi',
      error: err.message
    });
  }
};

// @desc    Créer ou mettre à jour le suivi d'une annonce
// @route   POST /api/tracking/:annonceId
// @access  Privé (transporteur uniquement)
exports.createUpdateTracking = async (req, res) => {
  try {
    const { annonceId } = req.params;
    const { statut, commentaire, localisation, positionGPS } = req.body;
    
    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Récupérer l'annonce
    const annonce = await Annonce.findById(annonceId)
      .populate('utilisateur', 'nom prenom email')
      .populate('devisAccepte');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si le transporteur est bien celui qui a été choisi pour cette annonce
    if (!annonce.devisAccepte || annonce.devisAccepte.transporteur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à mettre à jour le suivi de cette annonce'
      });
    }
    
    // Vérifier si le statut est valide
    const statutsValides = ['en_attente', 'pris_en_charge', 'en_transit', 'en_livraison', 'livre', 'probleme'];
    if (statut && !statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut de suivi invalide'
      });
    }
    
    // Créer ou mettre à jour le suivi
    if (!annonce.tracking) {
      annonce.tracking = {
        codeTracking: generateTrackingCode(),
        statut: statut || 'en_attente',
        historique: [{
          statut: statut || 'en_attente',
          date: new Date(),
          commentaire: commentaire || 'Suivi initialisé',
          localisation: localisation || ''
        }]
      };
    } else {
      // Mettre à jour le statut si fourni
      if (statut) {
        annonce.tracking.statut = statut;
      }
      
      // Ajouter un nouvel événement dans l'historique
      annonce.tracking.historique.push({
        statut: statut || annonce.tracking.statut,
        date: new Date(),
        commentaire: commentaire || '',
        localisation: localisation || ''
      });
    }
    
    // Ajouter la position GPS si fournie
    if (positionGPS && positionGPS.latitude && positionGPS.longitude) {
      const lastEvent = annonce.tracking.historique[annonce.tracking.historique.length - 1];
      lastEvent.positionGPS = {
        latitude: positionGPS.latitude,
        longitude: positionGPS.longitude
      };
    }
    
    // Mettre à jour le statut de l'annonce en fonction du statut de suivi
    if (statut === 'livre') {
      annonce.statut = 'termine';
    } else if (['pris_en_charge', 'en_transit', 'en_livraison'].includes(statut)) {
      annonce.statut = 'en_cours';
    }
    
    // Sauvegarder les modifications
    await annonce.save();
    
    // Créer une notification pour le client
    try {
      const statusMessages = {
        en_attente: 'Votre colis est en attente de prise en charge',
        pris_en_charge: 'Votre colis a été pris en charge par le transporteur',
        en_transit: 'Votre colis est en transit',
        en_livraison: 'Votre colis est en cours de livraison',
        livre: 'Votre colis a été livré',
        probleme: 'Un problème est survenu avec votre colis'
      };
      
      // Notifier le client
      await NotificationService.createAnnonceStatusNotification(
        annonce.utilisateur._id,
        `Statut de suivi: ${statut}`,
        `${statusMessages[statut] || 'Mise à jour du statut de votre colis'}${commentaire ? `. Commentaire: ${commentaire}` : ''}`,
        annonceId
      );
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification de suivi:', notifError);
    }
    
    // Envoyer un email de notification au client
    try {
      await sendTrackingUpdateEmail(
        annonce.utilisateur.email,
        annonce.utilisateur.prenom,
        annonce.tracking.codeTracking,
        annonce.titre,
        statut,
        commentaire || ''
      );
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de suivi:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Suivi mis à jour avec succès',
      data: {
        tracking: annonce.tracking,
        statut: annonce.statut
      }
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du suivi:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du suivi',
      error: err.message
    });
  }
};

// @desc    Mettre à jour le statut de suivi
// @route   PATCH /api/tracking/:annonceId/status
// @access  Privé (transporteur uniquement)
exports.updateTrackingStatus = async (req, res) => {
  try {
    const { annonceId } = req.params;
    const { statut, commentaire, localisation } = req.body;
    
    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Vérifier si le statut est valide
    const statutsValides = ['en_attente', 'pris_en_charge', 'en_transit', 'en_livraison', 'livre', 'probleme'];
    if (!statut || !statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut de suivi invalide'
      });
    }
    
    // Récupérer l'annonce
    const annonce = await Annonce.findById(annonceId)
      .populate('utilisateur', 'nom prenom email')
      .populate('devisAccepte');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si le transporteur est bien celui qui a été choisi pour cette annonce
    if (!annonce.devisAccepte || annonce.devisAccepte.transporteur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à mettre à jour le statut de cette annonce'
      });
    }
    
    // Si l'annonce n'a pas encore de suivi, l'initialiser
    if (!annonce.tracking) {
      annonce.tracking = {
        codeTracking: generateTrackingCode(),
        statut,
        historique: []
      };
    }
    
    // Mettre à jour le statut
    annonce.tracking.statut = statut;
    
    // Ajouter un nouvel événement dans l'historique
    annonce.tracking.historique.push({
      statut,
      date: new Date(),
      commentaire: commentaire || '',
      localisation: localisation || ''
    });
    
    // Mettre à jour le statut de l'annonce en fonction du statut de suivi
    if (statut === 'livre') {
      annonce.statut = 'termine';
      
      // Aussi mettre à jour le devis
      if (annonce.devisAccepte) {
        await Devis.findByIdAndUpdate(annonce.devisAccepte._id, { statut: 'termine' });
      }
    } else if (['pris_en_charge', 'en_transit', 'en_livraison'].includes(statut)) {
      annonce.statut = 'en_cours';
    }
    
    // Sauvegarder les modifications
    await annonce.save();
    
    // Créer une notification pour le client
    try {
      const statusMessages = {
        en_attente: 'Votre colis est en attente de prise en charge',
        pris_en_charge: 'Votre colis a été pris en charge par le transporteur',
        en_transit: 'Votre colis est en transit',
        en_livraison: 'Votre colis est en cours de livraison',
        livre: 'Votre colis a été livré',
        probleme: 'Un problème est survenu avec votre colis'
      };
      
      await NotificationService.createAnnonceStatusNotification(
        annonce.utilisateur._id,
        `Statut mis à jour: ${statut}`,
        `${statusMessages[statut] || 'Mise à jour du statut de votre colis'}${commentaire ? `. Commentaire: ${commentaire}` : ''}`,
        annonceId
      );
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification de mise à jour de statut:', notifError);
    }
    
    // Envoyer un email de notification au client
    try {
      await sendTrackingUpdateEmail(
        annonce.utilisateur.email,
        annonce.utilisateur.prenom,
        annonce.tracking.codeTracking,
        annonce.titre,
        statut,
        commentaire || ''
      );
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de suivi:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Statut de suivi mis à jour avec succès',
      data: {
        tracking: annonce.tracking,
        statut: annonce.statut
      }
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut de suivi:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de suivi',
      error: err.message
    });
  }
};

// @desc    Ajouter un événement dans l'historique de suivi
// @route   POST /api/tracking/:annonceId/event
// @access  Privé (transporteur uniquement)
exports.addTrackingEvent = async (req, res) => {
  try {
    const { annonceId } = req.params;
    const { commentaire, localisation, positionGPS } = req.body;
    
    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Vérifier qu'un commentaire est fourni
    if (!commentaire) {
      return res.status(400).json({
        success: false,
        message: 'Un commentaire est requis pour ajouter un événement'
      });
    }
    
    // Récupérer l'annonce
    const annonce = await Annonce.findById(annonceId)
      .populate('utilisateur', 'nom prenom email')
      .populate('devisAccepte');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si le transporteur est bien celui qui a été choisi pour cette annonce
    if (!annonce.devisAccepte || annonce.devisAccepte.transporteur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à ajouter un événement pour cette annonce'
      });
    }
    
    // Si l'annonce n'a pas encore de suivi, l'initialiser
    if (!annonce.tracking) {
      annonce.tracking = {
        codeTracking: generateTrackingCode(),
        statut: 'en_attente',
        historique: []
      };
    }
    
    // Créer le nouvel événement
    const newEvent = {
      statut: annonce.tracking.statut, // Garder le même statut
      date: new Date(),
      commentaire,
      localisation: localisation || ''
    };
    
    // Ajouter la position GPS si fournie
    if (positionGPS && positionGPS.latitude && positionGPS.longitude) {
      newEvent.positionGPS = {
        latitude: positionGPS.latitude,
        longitude: positionGPS.longitude
      };
    }
    
    // Ajouter l'événement à l'historique
    annonce.tracking.historique.push(newEvent);
    
    // Sauvegarder les modifications
    await annonce.save();
    
    // Créer une notification pour le client
    try {
      await NotificationService.createAnnonceStatusNotification(
        annonce.utilisateur._id,
        'Mise à jour du suivi',
        `Nouvelle information sur votre colis: ${commentaire}`,
        annonceId
      );
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification d\'événement de suivi:', notifError);
    }
    
    // Envoyer un email de notification au client (optionnel pour les événements mineurs)
    try {
      await sendTrackingUpdateEmail(
        annonce.utilisateur.email,
        annonce.utilisateur.prenom,
        annonce.tracking.codeTracking,
        annonce.titre,
        annonce.tracking.statut,
        commentaire
      );
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de suivi:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Événement ajouté avec succès',
      data: {
        tracking: annonce.tracking
      }
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout d\'un événement de suivi:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout d\'un événement de suivi',
      error: err.message
    });
  }
};

// @desc    Obtenir ou générer un code de suivi
// @route   GET /api/tracking/:annonceId/code
// @access  Privé (transporteur uniquement)
exports.getTrackingCode = async (req, res) => {
  try {
    const { annonceId } = req.params;
    
    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Récupérer l'annonce
    const annonce = await Annonce.findById(annonceId)
      .populate('devisAccepte');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si le transporteur est bien celui qui a été choisi pour cette annonce
    if (!annonce.devisAccepte || annonce.devisAccepte.transporteur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à accéder au code de suivi de cette annonce'
      });
    }
    
    // Si l'annonce n'a pas encore de suivi ou pas de code, générer un nouveau code
    if (!annonce.tracking || !annonce.tracking.codeTracking) {
      if (!annonce.tracking) {
        annonce.tracking = {
          statut: 'en_attente',
          historique: []
        };
      }
      
      annonce.tracking.codeTracking = generateTrackingCode();
      await annonce.save();
    }
    
    res.json({
      success: true,
      data: {
        codeTracking: annonce.tracking.codeTracking
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du code de suivi:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du code de suivi',
      error: err.message
    });
  }
};

// @desc    Mettre à jour la position GPS
// @route   POST /api/tracking/:annonceId/position
// @access  Privé (transporteur uniquement)
exports.updateGpsPosition = async (req, res) => {
  try {
    const { annonceId } = req.params;
    const { latitude, longitude } = req.body;
    
    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Vérifier si les coordonnées GPS sont fournies
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Les coordonnées GPS (latitude et longitude) sont requises'
      });
    }
    
    // Récupérer l'annonce
    const annonce = await Annonce.findById(annonceId)
      .populate('devisAccepte');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si le transporteur est bien celui qui a été choisi pour cette annonce
    if (!annonce.devisAccepte || annonce.devisAccepte.transporteur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à mettre à jour la position GPS pour cette annonce'
      });
    }
    
    // Si l'annonce n'a pas encore de suivi, l'initialiser
    if (!annonce.tracking) {
      annonce.tracking = {
        codeTracking: generateTrackingCode(),
        statut: 'en_attente',
        historique: []
      };
    }
    
    // Mettre à jour la dernière position GPS
    annonce.tracking.positionGPS = {
      latitude,
      longitude,
      timestamp: new Date()
    };
    
    // Sauvegarder les modifications
    await annonce.save();
    
    res.json({
      success: true,
      message: 'Position GPS mise à jour avec succès',
      data: {
        positionGPS: annonce.tracking.positionGPS
      }
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la position GPS:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la position GPS',
      error: err.message
    });
  }
};

// @desc    Marquer comme livré avec signature
// @route   POST /api/tracking/:annonceId/delivered
// @access  Privé (transporteur uniquement)
exports.markAsDelivered = async (req, res) => {
  try {
    const { annonceId } = req.params;
    const { 
      signatureBase64, 
      signatureName,
      commentaire,
      photosLivraison
    } = req.body;
    
    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Vérifier si une signature est fournie
    if (!signatureBase64) {
      return res.status(400).json({
        success: false,
        message: 'Une signature est requise pour confirmer la livraison'
      });
    }
    
    // Récupérer l'annonce
    const annonce = await Annonce.findById(annonceId)
      .populate('utilisateur', 'nom prenom email')
      .populate('devisAccepte');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si le transporteur est bien celui qui a été choisi pour cette annonce
    if (!annonce.devisAccepte || annonce.devisAccepte.transporteur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à marquer cette annonce comme livrée'
      });
    }
    
    // Si l'annonce n'a pas encore de suivi, l'initialiser
    if (!annonce.tracking) {
      annonce.tracking = {
        codeTracking: generateTrackingCode(),
        statut: 'en_attente',
        historique: []
      };
    }
    
    // Mettre à jour le statut
    annonce.tracking.statut = 'livre';
    
    // Ajouter les informations de livraison
    annonce.tracking.livraison = {
      date: new Date(),
      signature: signatureBase64,
      signataire: signatureName || 'Non spécifié',
      photos: photosLivraison || []
    };
    
    // Ajouter un événement dans l'historique
    annonce.tracking.historique.push({
      statut: 'livre',
      date: new Date(),
      commentaire: commentaire || 'Livraison effectuée',
      localisation: annonce.villeArrivee
    });
    
    // Mettre à jour le statut de l'annonce
    annonce.statut = 'termine';
    
    // Mettre à jour le devis
    if (annonce.devisAccepte) {
      await Devis.findByIdAndUpdate(annonce.devisAccepte._id, { statut: 'termine' });
    }
    
    // Sauvegarder les modifications
    await annonce.save();
    
    // Créer une notification pour le client
    try {
      await NotificationService.createAnnonceStatusNotification(
        annonce.utilisateur._id,
        'Colis livré',
        `Votre colis a été livré à ${annonce.villeArrivee}. Le transporteur a obtenu une signature de ${signatureName || 'Non spécifié'}.`,
        annonceId
      );
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification de livraison:', notifError);
    }
    
    // Envoyer un email de notification au client
    try {
      await sendTrackingUpdateEmail(
        annonce.utilisateur.email,
        annonce.utilisateur.prenom,
        annonce.tracking.codeTracking,
        annonce.titre,
        'livre',
        'Votre colis a été livré ! Veuillez confirmer la bonne réception dans votre espace client.'
      );
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de livraison:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Annonce marquée comme livrée avec succès',
      data: {
        tracking: annonce.tracking,
        statut: annonce.statut
      }
    });
  } catch (err) {
    console.error('Erreur lors du marquage de l\'annonce comme livrée:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de l\'annonce comme livrée',
      error: err.message
    });
  }
};

// @desc    Confirmer la réception
// @route   POST /api/tracking/:annonceId/confirm-reception
// @access  Privé (client uniquement)
exports.confirmReception = async (req, res) => {
  try {
    const { annonceId } = req.params;
    const { commentaire } = req.body;
    
    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Récupérer l'annonce
    const annonce = await Annonce.findById(annonceId)
      .populate('devisAccepte', 'transporteur');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si l'utilisateur est bien le client de cette annonce
    if (annonce.utilisateur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à confirmer la réception pour cette annonce'
      });
    }
    
    // Vérifier si l'annonce est bien marquée comme livrée
    if (!annonce.tracking || annonce.tracking.statut !== 'livre') {
      return res.status(400).json({
        success: false,
        message: 'Cette annonce n\'est pas encore marquée comme livrée'
      });
    }
    
    // Mettre à jour les informations de réception
    annonce.tracking.receptionConfirmee = {
      date: new Date(),
      commentaire: commentaire || 'Réception confirmée par le client'
    };
    
    // Ajouter un événement dans l'historique
    annonce.tracking.historique.push({
      statut: 'termine',
      date: new Date(),
      commentaire: commentaire || 'Réception confirmée par le client'
    });
    
    // Mettre à jour le statut de l'annonce si ce n'est pas déjà fait
    if (annonce.statut !== 'termine') {
      annonce.statut = 'termine';
    }
    
    // Sauvegarder les modifications
    await annonce.save();
    
    // Créer une notification pour le transporteur
    try {
      if (annonce.devisAccepte && annonce.devisAccepte.transporteur) {
        await NotificationService.create(
          annonce.devisAccepte.transporteur,
          'Réception confirmée',
          `Le client a confirmé la bonne réception de la livraison pour l'annonce "${annonce.titre}"`,
          'reception_confirmee',
          annonceId,
          'Annonce'
        );
      }
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification de confirmation de réception:', notifError);
    }
    
    // Envoyer un email au transporteur (optionnel)
    if (annonce.devisAccepte && annonce.devisAccepte.transporteur) {
      const transporteur = await User.findById(annonce.devisAccepte.transporteur);
      
      if (transporteur && transporteur.email) {
        // Implémenter l'envoi d'email ici
      }
    }
    
    res.json({
      success: true,
      message: 'Réception confirmée avec succès',
      data: {
        tracking: annonce.tracking
      }
    });
  } catch (err) {
    console.error('Erreur lors de la confirmation de la réception:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation de la réception',
      error: err.message
    });
  }
};

// @desc    Signaler un problème lié à la livraison
// @route   POST /api/tracking/:annonceId/report-issue
// @access  Privé (client ou transporteur)
exports.reportIssue = async (req, res) => {
  try {
    const { annonceId } = req.params;
    const { description, photos, type } = req.body;
    
    // Vérifier si l'ID de l'annonce est valide
    if (!mongoose.Types.ObjectId.isValid(annonceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }
    
    // Vérifier si une description est fournie
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Une description du problème est requise'
      });
    }
    
    // Récupérer l'annonce
    const annonce = await Annonce.findById(annonceId)
      .populate('utilisateur', 'nom prenom email')
      .populate({
        path: 'devisAccepte',
        populate: {
          path: 'transporteur',
          select: 'nom prenom email'
        }
      });
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si l'utilisateur est impliqué dans cette annonce (client ou transporteur)
    const isClient = annonce.utilisateur._id.toString() === req.user.id;
    const isTransporteur = annonce.devisAccepte && 
                           annonce.devisAccepte.transporteur && 
                           annonce.devisAccepte.transporteur._id.toString() === req.user.id;
    
    if (!isClient && !isTransporteur) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à signaler un problème pour cette annonce'
      });
    }
    
    // Si l'annonce n'a pas encore de suivi, l'initialiser
    if (!annonce.tracking) {
      annonce.tracking = {
        codeTracking: generateTrackingCode(),
        statut: 'en_attente',
        historique: []
      };
    }
    
    // Créer le problème
    const issue = {
      date: new Date(),
      type: type || 'autre',
      description,
      reportedBy: req.user.id,
      reportedByRole: isClient ? 'client' : 'transporteur',
      photos: photos || [],
      statut: 'ouvert'
    };
    
    // Ajouter le problème à la liste des problèmes
    if (!annonce.tracking.problemes) {
      annonce.tracking.problemes = [];
    }
    annonce.tracking.problemes.push(issue);
    
    // Mettre à jour le statut du suivi si c'est le transporteur qui signale un problème
    if (isTransporteur) {
      annonce.tracking.statut = 'probleme';
      
      // Ajouter un événement dans l'historique
      annonce.tracking.historique.push({
        statut: 'probleme',
        date: new Date(),
        commentaire: `Problème signalé: ${description.substring(0, 100)}...`,
        localisation: ''
      });
    }
    
    // Sauvegarder les modifications
    await annonce.save();
    
    // Créer des notifications
    try {
      // Déterminer le destinataire (l'autre partie)
      const destinataireId = isClient ? 
        annonce.devisAccepte.transporteur._id : 
        annonce.utilisateur._id;
      
      const expediteur = await User.findById(req.user.id);
      const role = isClient ? 'client' : 'transporteur';
      
      // Notifier l'autre partie
      await NotificationService.create(
        destinataireId,
        'Problème signalé',
        `Un problème a été signalé par le ${role} ${expediteur.prenom} ${expediteur.nom} pour l'annonce "${annonce.titre}". Type: ${type || 'Autre'}`,
        'probleme_signale',
        annonceId,
        'Annonce'
      );
      
      // Notifier les administrateurs
      const admins = await User.find({ role: 'admin' }).select('_id');
      if (admins && admins.length > 0) {
        await NotificationService.notifyMany(
          admins.map(admin => admin._id),
          'Problème de livraison signalé',
          `Un problème a été signalé par un ${role} pour l'annonce "${annonce.titre}". Type: ${type || 'Autre'}`,
          'probleme_signale',
          annonceId,
          'Annonce'
        );
      }
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi des notifications de problème:', notifError);
    }
    
    // Envoyer des notifications par email
    try {
      // Si c'est le client qui signale, notifier le transporteur
      if (isClient && annonce.devisAccepte && annonce.devisAccepte.transporteur) {
        // Implémenter l'envoi d'email au transporteur
      }
      
      // Si c'est le transporteur qui signale, notifier le client
      if (isTransporteur) {
        // Implémenter l'envoi d'email au client
      }
      
      // Notifier l'administration (à implémenter)
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des notifications par email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Problème signalé avec succès',
      data: {
        issue,
        tracking: {
          statut: annonce.tracking.statut,
          problemes: annonce.tracking.problemes
        }
      }
    });
  } catch (err) {
    console.error('Erreur lors du signalement d\'un problème:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du signalement d\'un problème',
      error: err.message
    });
  }
};