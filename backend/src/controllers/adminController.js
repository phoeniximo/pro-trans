// backend/src/controllers/adminController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const Devis = require('../models/Devis');
const Paiement = require('../models/Paiement');
const Avis = require('../models/Avis');
const Message = require('../models/Message');
const Dispute = require('../models/Dispute');
const { sendEmail } = require('../utils/emailService');

// @desc    Obtenir les statistiques du tableau de bord
// @route   GET /api/admin/dashboard
// @access  Privé (Admin uniquement)
exports.getDashboardStats = async (req, res) => {
  try {
    // Période de rapport (7 derniers jours par défaut)
    const { periode = '7d' } = req.query;
    let dateFiltre = new Date();
    
    switch (periode) {
      case '24h':
        dateFiltre.setDate(dateFiltre.getDate() - 1);
        break;
      case '7d':
        dateFiltre.setDate(dateFiltre.getDate() - 7);
        break;
      case '30d':
        dateFiltre.setDate(dateFiltre.getDate() - 30);
        break;
      case '90d':
        dateFiltre.setDate(dateFiltre.getDate() - 90);
        break;
      case '1y':
        dateFiltre.setFullYear(dateFiltre.getFullYear() - 1);
        break;
      default:
        dateFiltre.setDate(dateFiltre.getDate() - 7);
    }

    // Statistiques des utilisateurs
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: dateFiltre } });
    const totalTransporteurs = await User.countDocuments({ role: 'transporteur' });
    const totalClients = await User.countDocuments({ role: 'client' });
    
    // Statistiques des annonces
    const totalAnnonces = await Annonce.countDocuments();
    const newAnnonces = await Annonce.countDocuments({ createdAt: { $gte: dateFiltre } });
    const annoncesEnCours = await Annonce.countDocuments({ statut: 'en_cours' });
    const annoncesTerminees = await Annonce.countDocuments({ statut: 'termine' });
    
    // Statistiques des transactions
    const transactions = await Paiement.find({ createdAt: { $gte: dateFiltre } });
    const totalTransactions = transactions.length;
    const montantTotal = transactions.reduce((sum, t) => sum + t.montant, 0);
    const transactionsParJour = await Paiement.aggregate([
      { $match: { createdAt: { $gte: dateFiltre } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          montant: { $sum: "$montant" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Statistiques des avis
    const totalAvis = await Avis.countDocuments();
    const newAvis = await Avis.countDocuments({ createdAt: { $gte: dateFiltre } });
    const noteMoyenne = await Avis.aggregate([
      { $group: { _id: null, moyenne: { $avg: "$note" } } }
    ]);
    
    // Statistiques des disputes/litiges
    const totalDisputes = await Dispute.countDocuments();
    const disputesEnCours = await Dispute.countDocuments({ statut: 'ouvert' });
    const disputesResolues = await Dispute.countDocuments({ statut: 'resolu' });
    
    res.json({
      success: true,
      data: {
        utilisateurs: {
          total: totalUsers,
          nouveaux: newUsers,
          transporteurs: totalTransporteurs,
          clients: totalClients
        },
        annonces: {
          total: totalAnnonces,
          nouvelles: newAnnonces,
          enCours: annoncesEnCours,
          terminees: annoncesTerminees
        },
        transactions: {
          total: totalTransactions,
          montantTotal: montantTotal.toFixed(2),
          parJour: transactionsParJour
        },
        avis: {
          total: totalAvis,
          nouveaux: newAvis,
          noteMoyenne: noteMoyenne.length > 0 ? noteMoyenne[0].moyenne.toFixed(1) : 0
        },
        disputes: {
          total: totalDisputes,
          enCours: disputesEnCours,
          resolues: disputesResolues
        }
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: err.message
    });
  }
};

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/admin/users
// @access  Privé (Admin uniquement)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, sort = 'recent', page = 1, limit = 10, search } = req.query;
    
    // Construire la requête de filtrage
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Options de tri
    let sortOption = {};
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'name':
        sortOption = { nom: 1, prenom: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Compte total pour la pagination
    const total = await User.countDocuments(query);
    
    // Récupérer les utilisateurs
    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: users
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: err.message
    });
  }
};

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/admin/users/:userId
// @access  Privé (Admin uniquement)
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Récupérer l'utilisateur avec ses statistiques
    const user = await User.findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Statistiques supplémentaires
    const stats = {
      annonces: await Annonce.countDocuments({ utilisateur: userId }),
      devis: await Devis.countDocuments({ transporteur: userId }),
      avisRecus: await Avis.countDocuments({ destinataire: userId }),
      avisDonnes: await Avis.countDocuments({ auteur: userId }),
      paiements: await Paiement.countDocuments({ utilisateur: userId })
    };
    
    // Dernières activités (10 dernières)
    const dernieresAnnonces = await Annonce.find({ utilisateur: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('titre statut createdAt');
    
    const derniersDevis = await Devis.find({ transporteur: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('montant statut createdAt annonce');
    
    const derniersAvis = await Avis.find({ destinataire: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('note commentaire createdAt');
    
    res.json({
      success: true,
      data: {
        utilisateur: user,
        statistiques: stats,
        activites: {
          annonces: dernieresAnnonces,
          devis: derniersDevis,
          avis: derniersAvis
        }
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des détails de l\'utilisateur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails de l\'utilisateur',
      error: err.message
    });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/admin/users/:userId
// @access  Privé (Admin uniquement)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      nom, 
      prenom, 
      email, 
      telephone, 
      adresse, 
      role,
      actif,
      emailVerifie,
      notation
    } = req.body;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Construire l'objet de mise à jour
    const updateData = {};
    if (nom !== undefined) updateData.nom = nom;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (email !== undefined) updateData.email = email;
    if (telephone !== undefined) updateData.telephone = telephone;
    if (adresse !== undefined) updateData.adresse = adresse;
    if (role !== undefined) updateData.role = role;
    if (actif !== undefined) updateData.actif = actif;
    if (emailVerifie !== undefined) updateData.emailVerifie = emailVerifie;
    if (notation !== undefined) updateData.notation = notation;
    
    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    
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
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: err.message
    });
  }
};

// @desc    Activer/désactiver un utilisateur
// @route   PATCH /api/admin/users/:userId/status
// @access  Privé (Admin uniquement)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { actif } = req.body;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Vérifier si le statut est fourni
    if (actif === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Le statut (actif) est requis'
      });
    }
    
    // Mettre à jour le statut de l'utilisateur
    const user = await User.findByIdAndUpdate(
      userId,
      { actif },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Envoyer un email de notification à l'utilisateur
    try {
      await sendEmail({
        to: user.email,
        subject: actif ? 'Votre compte Pro-Trans a été activé' : 'Votre compte Pro-Trans a été désactivé',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://pro-trans.com/logo.png" alt="Pro-Trans Logo" style="max-width: 150px;">
            </div>
            <h2 style="color: ${actif ? '#10b981' : '#ef4444'};">${actif ? 'Compte activé' : 'Compte désactivé'}</h2>
            <p>Bonjour ${user.prenom},</p>
            <p>${actif 
              ? 'Nous vous informons que votre compte Pro-Trans a été activé. Vous pouvez désormais vous connecter et utiliser toutes les fonctionnalités de la plateforme.' 
              : 'Nous vous informons que votre compte Pro-Trans a été temporairement désactivé. Pendant cette période, vous ne pourrez pas vous connecter ni utiliser les services de la plateforme.'
            }</p>
            ${!actif ? '<p>Si vous avez des questions sur les raisons de cette désactivation, veuillez contacter notre service client.</p>' : ''}
            <p>L\'équipe Pro-Trans</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', emailError);
    }
    
    res.json({
      success: true,
      message: `Utilisateur ${actif ? 'activé' : 'désactivé'} avec succès`,
      data: user
    });
  } catch (err) {
    console.error('Erreur lors de la modification du statut de l\'utilisateur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut de l\'utilisateur',
      error: err.message
    });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/admin/users/:userId
// @access  Privé (Admin uniquement)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Trouver l'utilisateur
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur a des annonces actives
    const annoncesActives = await Annonce.countDocuments({
      utilisateur: userId,
      statut: { $in: ['disponible', 'en_attente', 'en_cours'] }
    });
    
    if (annoncesActives > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un utilisateur avec des annonces actives'
      });
    }
    
    // Supprimer l'utilisateur et ses données associées
    await Promise.all([
      // Supprimer l'utilisateur
      User.findByIdAndDelete(userId),
      
      // Anonymiser les annonces terminées
      Annonce.updateMany(
        { utilisateur: userId, statut: 'termine' },
        { $set: { utilisateur: null } }
      ),
      
      // Anonymiser les devis
      Devis.updateMany(
        { transporteur: userId },
        { $set: { transporteur: null } }
      ),
      
      // Anonymiser les avis
      Avis.updateMany(
        { auteur: userId },
        { $set: { auteur: null } }
      ),
      
      // Supprimer les messages
      Message.deleteMany({
        $or: [
          { expediteur: userId },
          { destinataire: userId }
        ]
      })
    ]);
    
    res.json({
      success: true,
      message: 'Utilisateur et données associées supprimés avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: err.message
    });
  }
};

// @desc    Vérifier les documents d'un utilisateur
// @route   POST /api/admin/users/:userId/verify
// @access  Privé (Admin uniquement)
exports.verifyUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { documentType, isVerified, rejectionReason } = req.body;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Vérifier le type de document
    if (!['identite', 'assurance', 'vehicule'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Type de document invalide'
      });
    }
    
    // Trouver l'utilisateur
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Mettre à jour le statut de vérification du document
    if (!user.verificationsDocuments) {
      user.verificationsDocuments = {};
    }
    
    user.verificationsDocuments[documentType] = {
      verifie: isVerified,
      date: new Date(),
      raisonRejet: isVerified ? null : rejectionReason
    };
    
    await user.save();
    
    // Envoyer un email à l'utilisateur
    try {
      await sendEmail({
        to: user.email,
        subject: isVerified 
          ? `Votre document ${documentType} a été vérifié et accepté` 
          : `Votre document ${documentType} a été rejeté`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://pro-trans.com/logo.png" alt="Pro-Trans Logo" style="max-width: 150px;">
            </div>
            <h2 style="color: ${isVerified ? '#10b981' : '#ef4444'};">
              ${isVerified 
                ? `Votre document ${documentType} a été vérifié et accepté` 
                : `Votre document ${documentType} a été rejeté`
              }
            </h2>
            <p>Bonjour ${user.prenom},</p>
            ${isVerified 
              ? `<p>Nous avons vérifié votre document ${documentType} et il a été accepté. Vous pouvez maintenant utiliser pleinement nos services.</p>` 
              : `<p>Nous avons examiné votre document ${documentType} et il a été rejeté pour la raison suivante:</p>
                 <p style="padding: 10px; background-color: #f9f9f9; border-left: 4px solid #ef4444;">${rejectionReason}</p>
                 <p>Veuillez soumettre à nouveau un document valide depuis votre espace personnel.</p>`
            }
            <p>L'équipe Pro-Trans</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification de document:', emailError);
    }
    
    res.json({
      success: true,
      message: `Document ${documentType} ${isVerified ? 'vérifié' : 'rejeté'} avec succès`,
      data: {
        userId: user._id,
        documentType,
        status: isVerified ? 'vérifié' : 'rejeté',
        date: user.verificationsDocuments[documentType].date
      }
    });
  } catch (err) {
    console.error('Erreur lors de la vérification du document:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du document',
      error: err.message
    });
  }
};

// Autres méthodes du contrôleur admin seraient implémentées de façon similaire
// pour la gestion des annonces, transactions, disputes, etc.