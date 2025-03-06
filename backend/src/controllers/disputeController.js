// backend/src/controllers/disputeController.js
const mongoose = require('mongoose');
const Dispute = require('../models/Dispute');
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const Paiement = require('../models/Paiement');
const { sendEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

// @desc    Créer un nouveau litige
// @route   POST /api/disputes
// @access  Privé
exports.createDispute = async (req, res) => {
  try {
    const { annonceId, titre, description, typeProbleme, montantReclame } = req.body;
    
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
    
    // Vérifier si l'utilisateur est bien le client ou le transporteur de cette annonce
    const isClient = annonce.utilisateur._id.toString() === req.user.id;
    const isTransporteur = annonce.devisAccepte && 
                           annonce.devisAccepte.transporteur && 
                           annonce.devisAccepte.transporteur.toString() === req.user.id;
    
    if (!isClient && !isTransporteur) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à créer un litige pour cette annonce'
      });
    }
    
    // Si l'utilisateur est le client, le transporteur est le destinataire du litige
    let client, transporteur;
    if (isClient) {
      client = req.user.id;
      transporteur = annonce.devisAccepte.transporteur;
    } else {
      client = annonce.utilisateur._id;
      transporteur = req.user.id;
    }
    
    // Créer le litige
    const dispute = new Dispute({
      annonce: annonceId,
      client,
      transporteur,
      titre,
      description,
      statut: 'ouvert',
      typeProbleme,
      montantReclame: montantReclame || 0,
    });
    
    await dispute.save();
    
    // Récupérer le litige complet avec les infos des utilisateurs
    const disputeComplete = await Dispute.findById(dispute._id)
      .populate('client', 'nom prenom email')
      .populate('transporteur', 'nom prenom email')
      .populate('annonce', 'titre villeDepart villeArrivee');
    
    // Envoyer un email de notification à l'autre partie
    try {
      const destinataire = isClient ? await User.findById(transporteur) : annonce.utilisateur;
      
      await sendEmail({
        to: destinataire.email,
        subject: `Nouveau litige concernant l'annonce "${annonce.titre}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #ef4444;">Nouveau litige ouvert</h2>
            <p>Bonjour ${destinataire.prenom},</p>
            <p>Un litige a été ouvert concernant l'annonce "${annonce.titre}" :</p>
            <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <p><strong>Titre du litige :</strong> ${titre}</p>
              <p><strong>Type de problème :</strong> ${typeProbleme}</p>
              <p><strong>Description :</strong> ${description}</p>
              ${montantReclame ? `<p><strong>Montant réclamé :</strong> ${montantReclame} €</p>` : ''}
            </div>
            <p>Veuillez vous connecter à votre compte pour résoudre ce litige à l'amiable ou fournir des informations supplémentaires.</p>
            <p>L'équipe Pro-Trans</p>
          </div>
        `
      });
    } catch (emailError) {
      logger.error('Erreur lors de l\'envoi de l\'email de notification de litige:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Litige créé avec succès',
      data: disputeComplete
    });
  } catch (err) {
    logger.error('Erreur lors de la création du litige:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du litige',
      error: err.message
    });
  }
};

// @desc    Obtenir les litiges de l'utilisateur
// @route   GET /api/disputes
// @access  Privé
exports.getMyDisputes = async (req, res) => {
  try {
    const { statut, page = 1, limit = 10 } = req.query;
    
    // Construire la requête
    const query = {
      $or: [
        { client: req.user.id },
        { transporteur: req.user.id }
      ]
    };
    
    // Filtrer par statut si fourni
    if (statut) {
      query.statut = statut;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Compte total pour la pagination
    const total = await Dispute.countDocuments(query);
    
    // Récupérer les litiges
    const disputes = await Dispute.find(query)
      .populate('client', 'nom prenom photo')
      .populate('transporteur', 'nom prenom photo')
      .populate('annonce', 'titre villeDepart villeArrivee statut')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: disputes.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: disputes
    });
  } catch (err) {
    logger.error('Erreur lors de la récupération des litiges:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des litiges',
      error: err.message
    });
  }
};

// @desc    Obtenir un litige par son ID
// @route   GET /api/disputes/:id
// @access  Privé (parties concernées seulement)
exports.getDisputeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de litige invalide'
      });
    }
    
    // Récupérer le litige
    const dispute = await Dispute.findById(id)
      .populate('client', 'nom prenom email photo')
      .populate('transporteur', 'nom prenom email photo')
      .populate('annonce', 'titre villeDepart villeArrivee dateDepart statut')
      .populate('messages.expediteur', 'nom prenom photo');
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Litige non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est impliqué dans ce litige
    const isClient = dispute.client._id.toString() === req.user.id;
    const isTransporteur = dispute.transporteur._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isClient && !isTransporteur && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir ce litige'
      });
    }
    
    res.json({
      success: true,
      data: dispute
    });
  } catch (err) {
    logger.error('Erreur lors de la récupération du litige:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du litige',
      error: err.message
    });
  }
};

// @desc    Ajouter un message au litige
// @route   POST /api/disputes/:id/messages
// @access  Privé (parties concernées seulement)
exports.addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de litige invalide'
      });
    }
    
    // Vérifier si le message est fourni
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le message est requis'
      });
    }
    
    // Récupérer le litige
    const dispute = await Dispute.findById(id);
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Litige non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est impliqué dans ce litige
    const isClient = dispute.client.toString() === req.user.id;
    const isTransporteur = dispute.transporteur.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isClient && !isTransporteur && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à ajouter un message à ce litige'
      });
    }
    
    // Ajouter le message
    dispute.messages.push({
      expediteur: req.user.id,
      message,
      date: new Date()
    });
    
    await dispute.save();
    
    // Récupérer le litige mis à jour avec les infos des utilisateurs
    const disputeUpdated = await Dispute.findById(id)
      .populate('client', 'nom prenom email photo')
      .populate('transporteur', 'nom prenom email photo')
      .populate('messages.expediteur', 'nom prenom photo');
    
    // Envoyer un email de notification à l'autre partie
    try {
      let destinataire;
      if (isClient) {
        destinataire = await User.findById(dispute.transporteur);
      } else if (isTransporteur) {
        destinataire = await User.findById(dispute.client);
      } else if (isAdmin) {
        // Notifier les deux parties
        const client = await User.findById(dispute.client);
        const transporteur = await User.findById(dispute.transporteur);
        
        await Promise.all([
          sendEmail({
            to: client.email,
            subject: `Nouveau message de l'administrateur concernant le litige #${dispute._id}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #0f766e;">Nouveau message</h2>
                <p>Bonjour ${client.prenom},</p>
                <p>L'administrateur a laissé un nouveau message concernant votre litige :</p>
                <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
                  <p>"${message}"</p>
                </div>
                <p>Veuillez vous connecter à votre compte pour répondre ou consulter l'intégralité de la conversation.</p>
                <p>L'équipe Pro-Trans</p>
              </div>
            `
          }),
          sendEmail({
            to: transporteur.email,
            subject: `Nouveau message de l'administrateur concernant le litige #${dispute._id}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #0f766e;">Nouveau message</h2>
                <p>Bonjour ${transporteur.prenom},</p>
                <p>L'administrateur a laissé un nouveau message concernant votre litige :</p>
                <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
                  <p>"${message}"</p>
                </div>
                <p>Veuillez vous connecter à votre compte pour répondre ou consulter l'intégralité de la conversation.</p>
                <p>L'équipe Pro-Trans</p>
              </div>
            `
          })
        ]);
        
        return res.json({
          success: true,
          message: 'Message ajouté avec succès',
          data: disputeUpdated
        });
      }
      
      // Notification pour client ou transporteur
      if (destinataire) {
        await sendEmail({
          to: destinataire.email,
          subject: `Nouveau message concernant le litige #${dispute._id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #0f766e;">Nouveau message</h2>
              <p>Bonjour ${destinataire.prenom},</p>
              <p>Un nouveau message a été ajouté concernant votre litige :</p>
              <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
                <p>"${message}"</p>
              </div>
              <p>Veuillez vous connecter à votre compte pour répondre ou consulter l'intégralité de la conversation.</p>
              <p>L'équipe Pro-Trans</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      logger.error('Erreur lors de l\'envoi de l\'email de notification de message:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Message ajouté avec succès',
      data: disputeUpdated
    });
  } catch (err) {
    logger.error('Erreur lors de l\'ajout du message:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du message',
      error: err.message
    });
  }
};

// @desc    Fermer un litige avec un accord amiable
// @route   PUT /api/disputes/:id/resolve
// @access  Privé (parties concernées seulement)
exports.resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, montantRemboursement, commentaire } = req.body;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de litige invalide'
      });
    }
    
    // Récupérer le litige
    const dispute = await Dispute.findById(id);
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Litige non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est impliqué dans ce litige ou est admin
    const isClient = dispute.client.toString() === req.user.id;
    const isTransporteur = dispute.transporteur.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isClient && !isTransporteur && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à résoudre ce litige'
      });
    }
    
    // Vérifier si le litige est déjà résolu
    if (dispute.statut === 'resolu') {
      return res.status(400).json({
        success: false,
        message: 'Ce litige est déjà résolu'
      });
    }
    
    // Résoudre le litige
    dispute.statut = 'resolu';
    dispute.dateResolution = new Date();
    
    // Si c'est l'admin qui résout
    if (isAdmin) {
      dispute.decisionAdmin = {
        decision: resolution,
        montantRemboursement: montantRemboursement || 0,
        justification: commentaire || '',
        date: new Date(),
        admin: req.user.id
      };
    } else {
      // Résolution amiable entre les parties
      dispute.resolution = {
        type: 'amiable',
        description: resolution,
        montantRemboursement: montantRemboursement || 0,
        commentaire: commentaire || '',
        date: new Date(),
        initiePar: req.user.id
      };
    }
    
    await dispute.save();
    
    // Récupérer le litige mis à jour avec les infos des utilisateurs
    const disputeResolved = await Dispute.findById(id)
      .populate('client', 'nom prenom email photo')
      .populate('transporteur', 'nom prenom email photo')
      .populate('annonce', 'titre');
    
    // Envoyer des emails de notification
    try {
      const client = await User.findById(dispute.client);
      const transporteur = await User.findById(dispute.transporteur);
      
      await Promise.all([
        sendEmail({
          to: client.email,
          subject: `Litige #${dispute._id} résolu`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #10b981;">Litige résolu</h2>
              <p>Bonjour ${client.prenom},</p>
              <p>Le litige concernant l'annonce "${disputeResolved.annonce.titre}" a été résolu.</p>
              <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
                <p><strong>Résolution :</strong> ${resolution}</p>
                ${montantRemboursement ? `<p><strong>Montant de remboursement :</strong> ${montantRemboursement} €</p>` : ''}
                ${commentaire ? `<p><strong>Commentaire :</strong> ${commentaire}</p>` : ''}
              </div>
              <p>Merci d'avoir utilisé notre processus de résolution des litiges.</p>
              <p>L'équipe Pro-Trans</p>
            </div>
          `
        }),
        sendEmail({
          to: transporteur.email,
          subject: `Litige #${dispute._id} résolu`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #10b981;">Litige résolu</h2>
              <p>Bonjour ${transporteur.prenom},</p>
              <p>Le litige concernant l'annonce "${disputeResolved.annonce.titre}" a été résolu.</p>
              <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
                <p><strong>Résolution :</strong> ${resolution}</p>
                ${montantRemboursement ? `<p><strong>Montant de remboursement :</strong> ${montantRemboursement} €</p>` : ''}
                ${commentaire ? `<p><strong>Commentaire :</strong> ${commentaire}</p>` : ''}
              </div>
              <p>Merci d'avoir utilisé notre processus de résolution des litiges.</p>
              <p>L'équipe Pro-Trans</p>
            </div>
          `
        })
      ]);
    } catch (emailError) {
      logger.error('Erreur lors de l\'envoi des emails de résolution de litige:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Litige résolu avec succès',
      data: disputeResolved
    });
  } catch (err) {
    logger.error('Erreur lors de la résolution du litige:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la résolution du litige',
      error: err.message
    });
  }
};