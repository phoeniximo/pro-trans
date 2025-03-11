// backend/src/controllers/messageController.js
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Envoyer un nouveau message
// @route   POST /api/messages
// @access  Privé
exports.sendMessage = async (req, res) => {
  try {
    const { contenu, destinataire, annonce } = req.body;
    
    // Vérifier si les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(destinataire) || !mongoose.Types.ObjectId.isValid(annonce)) {
      return res.status(400).json({
        success: false,
        message: 'IDs invalides'
      });
    }
    
    // Vérifier si l'annonce existe
    const annonceExists = await Annonce.findById(annonce);
    if (!annonceExists) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier si le destinataire existe
    const destinataireExists = await User.findById(destinataire);
    if (!destinataireExists) {
      return res.status(404).json({
        success: false,
        message: 'Destinataire non trouvé'
      });
    }
    
    // Créer le message
    const message = new Message({
      expediteur: req.user.id,
      destinataire,
      annonce,
      contenu,
      lu: false
    });
    
    await message.save();
    
    // Récupérer le message avec les informations des utilisateurs et de l'annonce
    const messageComplet = await Message.findById(message._id)
      .populate('expediteur', 'nom prenom email photo')
      .populate('destinataire', 'nom prenom email photo')
      .populate('annonce', 'titre villeDepart villeArrivee');
    
    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: messageComplet
    });
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: err.message
    });
  }
};

// @desc    Envoyer un message avec pièces jointes
// @route   POST /api/messages/with-attachments
// @access  Privé
exports.sendMessageWithAttachments = async (req, res) => {
  try {
    const { contenu, destinataire, annonce } = req.body;
    
    // Vérifier si les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(destinataire) || !mongoose.Types.ObjectId.isValid(annonce)) {
      return res.status(400).json({
        success: false,
        message: 'IDs invalides'
      });
    }
    
    // Vérifier si des fichiers ont été téléchargés
    if (!req.files || !req.files.pieceJointes) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier téléchargé'
      });
    }
    
    // Créer le dossier de stockage s'il n'existe pas
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'messages');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    let pieceJointe = '';
    
    // Gérer un seul fichier ou plusieurs
    const files = Array.isArray(req.files.pieceJointes) ? req.files.pieceJointes : [req.files.pieceJointes];
    
    // Enregistrer le premier fichier (pour le moment, un seul fichier par message)
    if (files.length > 0) {
      const file = files[0];
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = path.join(uploadsDir, fileName);
      
      await file.mv(filePath);
      pieceJointe = `/uploads/messages/${fileName}`;
    }
    
    // Créer le message
    const message = new Message({
      expediteur: req.user.id,
      destinataire,
      annonce,
      contenu,
      pieceJointe,
      lu: false
    });
    
    await message.save();
    
    // Récupérer le message avec les informations des utilisateurs
    const messageComplet = await Message.findById(message._id)
      .populate('expediteur', 'nom prenom email photo')
      .populate('destinataire', 'nom prenom email photo')
      .populate('annonce', 'titre villeDepart villeArrivee');
    
    res.status(201).json({
      success: true,
      message: 'Message avec pièce jointe envoyé avec succès',
      data: messageComplet
    });
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message avec pièce jointe:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message avec pièce jointe',
      error: err.message
    });
  }
};

// @desc    Obtenir les conversations de l'utilisateur
// @route   GET /api/messages/conversations
// @access  Privé
exports.getConversations = async (req, res) => {
  try {
    // Trouver tous les messages où l'utilisateur est expéditeur ou destinataire
    const messages = await Message.find({
      $or: [
        { expediteur: req.user.id },
        { destinataire: req.user.id }
      ]
    })
    .populate('expediteur', 'nom prenom photo')
    .populate('destinataire', 'nom prenom photo')
    .populate('annonce', 'titre villeDepart villeArrivee');
    
    // Grouper les messages par conversation (combo annonce-utilisateur)
    const conversations = {};
    
    messages.forEach(message => {
      // Vérifier que les références sont correctement peuplées
      if (!message.expediteur || !message.destinataire || !message.annonce) {
        console.warn('Message incomplet ignoré:', message._id);
        return;  // Ignorer ce message et passer au suivant
      }
      
      // Déterminer l'autre utilisateur dans la conversation
      const expediteurId = message.expediteur._id ? message.expediteur._id.toString() : null;
      if (expediteurId === null) {
        console.warn('ID d\'expéditeur manquant dans le message:', message._id);
        return;  // Ignorer ce message et passer au suivant
      }
      
      const autreUtilisateur = expediteurId === req.user.id 
        ? message.destinataire
        : message.expediteur;
      
      // Vérifier que l'autre utilisateur est valide
      if (!autreUtilisateur || !autreUtilisateur._id) {
        console.warn('Autre utilisateur invalide dans le message:', message._id);
        return;  // Ignorer ce message et passer au suivant
      }
      
      const conversationId = `${message.annonce._id}_${autreUtilisateur._id}`;
      
      if (!conversations[conversationId]) {
        conversations[conversationId] = {
          id: conversationId,
          annonce: message.annonce,
          utilisateur: autreUtilisateur,
          dernierMessage: message,
          nonLus: 0
        };
      }
      
      // Mettre à jour le dernier message si ce message est plus récent
      if (new Date(message.createdAt) > new Date(conversations[conversationId].dernierMessage.createdAt)) {
        conversations[conversationId].dernierMessage = message;
      }
      
      // Compter les messages non lus (si l'utilisateur est le destinataire)
      if (message.destinataire._id.toString() === req.user.id && !message.lu) {
        conversations[conversationId].nonLus++;
      }
    });
    
    // Convertir l'objet en tableau et trier par date du dernier message (plus récent d'abord)
    const conversationsArray = Object.values(conversations)
      .sort((a, b) => new Date(b.dernierMessage.createdAt) - new Date(a.dernierMessage.createdAt));
    
    res.json({
      success: true,
      count: conversationsArray.length,
      data: conversationsArray
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des conversations:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations',
      error: err.message
    });
  }
};

// @desc    Obtenir les messages d'une conversation
// @route   GET /api/messages/conversation/:annonceId/:userId
// @access  Privé
exports.getConversation = async (req, res) => {
  try {
    const { annonceId, userId } = req.params;
    
    // Vérifier si les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(annonceId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'IDs invalides'
      });
    }
    
    // Trouver tous les messages de la conversation
    const messages = await Message.find({
      annonce: annonceId,
      $or: [
        { expediteur: req.user.id, destinataire: userId },
        { expediteur: userId, destinataire: req.user.id }
      ]
    })
    .populate('expediteur', 'nom prenom photo')
    .populate('destinataire', 'nom prenom photo')
    .sort({ createdAt: 1 });
    
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des messages:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: err.message
    });
  }
};

// @desc    Marquer les messages d'une conversation comme lus
// @route   PUT /api/messages/mark-read/:annonceId/:userId
// @access  Privé
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { annonceId, userId } = req.params;
    
    // Vérifier si les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(annonceId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'IDs invalides'
      });
    }
    
    // Marquer tous les messages non lus comme lus
    await Message.updateMany(
      {
        annonce: annonceId,
        expediteur: userId,
        destinataire: req.user.id,
        lu: false
      },
      {
        $set: { lu: true }
      }
    );
    
    res.json({
      success: true,
      message: 'Messages marqués comme lus'
    });
  } catch (err) {
    console.error('Erreur lors du marquage des messages comme lus:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des messages comme lus',
      error: err.message
    });
  }
};

// @desc    Obtenir le nombre de messages non lus
// @route   GET /api/messages/unread-count
// @access  Privé
exports.getUnreadCount = async (req, res) => {
  try {
    // Compter les messages non lus où l'utilisateur est destinataire
    const count = await Message.countDocuments({
      destinataire: req.user.id,
      lu: false
    });
    
    res.json({
      success: true,
      count
    });
  } catch (err) {
    console.error('Erreur lors du comptage des messages non lus:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du comptage des messages non lus',
      error: err.message
    });
  }
};

// Fonction temporaire pour la suppression d'un message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de message invalide'
      });
    }
    
    // Vérifier si le message existe
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est l'expéditeur du message
    if (message.expediteur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce message'
      });
    }
    
    await Message.findByIdAndDelete(messageId);
    
    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de la suppression du message:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message',
      error: err.message
    });
  }
};