// backend/src/controllers/userController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Avis = require('../models/Avis');
const fs = require('fs');
const path = require('path');

// @desc    Obtenir les transporteurs avec filtres optionnels
// @route   GET /api/users/transporteurs
// @access  Public
exports.getTransporteurs = async (req, res) => {
  try {
    const { ville, note, disponible, page = 1, limit = 10, search } = req.query;
    
    // Construire la requête de filtrage
    const query = { role: 'transporteur', actif: true };
    
    // Filtre par ville
    if (ville) {
      query['adresse.ville'] = { $regex: ville, $options: 'i' };
    }
    
    // Filtre par note minimale
    if (note) {
      query['notation.moyenne'] = { $gte: parseFloat(note) };
    }
    
    // Recherche par nom ou prénom
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Compter le total pour la pagination
    const total = await User.countDocuments(query);
    
    // Récupérer les transporteurs
    const transporteurs = await User.find(query)
      .select('nom prenom photo notation adresse vehicules emailVerifie createdAt')
      .sort({ 'notation.moyenne': -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Pour chaque transporteur, récupérer le nombre d'avis
    const transporteursWithAvisCount = await Promise.all(transporteurs.map(async (transporteur) => {
      const avisCount = await Avis.countDocuments({ destinataire: transporteur._id });
      return {
        ...transporteur.toObject(),
        avisCount
      };
    }));
    
    res.json({
      success: true,
      count: transporteurs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: transporteursWithAvisCount
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des transporteurs:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des transporteurs',
      error: err.message
    });
  }
};

// @desc    Obtenir le profil d'un utilisateur
// @route   GET /api/users/profile/:userId
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Récupérer l'utilisateur sans informations sensibles
    const user = await User.findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est actif
    if (!user.actif) {
      return res.status(403).json({
        success: false,
        message: 'Ce compte utilisateur n\'est pas actif'
      });
    }
    
    // Compter le nombre d'avis reçus
    const avisCount = await Avis.countDocuments({ destinataire: userId });
    
    // Récupérer les 3 derniers avis
    const recentAvis = await Avis.find({ destinataire: userId })
      .populate('auteur', 'nom prenom photo')
      .sort({ createdAt: -1 })
      .limit(3);
    
    res.json({
      success: true,
      data: {
        ...user.toObject(),
        avisCount,
        recentAvis
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du profil utilisateur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil utilisateur',
      error: err.message
    });
  }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/users/profile
// @access  Privé
exports.getMyProfile = async (req, res) => {
  try {
    // Récupérer l'utilisateur sans informations sensibles
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: err.message
    });
  }
};

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PUT /api/users/profile
// @access  Privé
exports.updateMyProfile = async (req, res) => {
  try {
    const { 
      nom, 
      prenom, 
      email, 
      telephone, 
      adresse,
      vehicules
    } = req.body;
    
    // Construire l'objet de mise à jour
    const updateData = {};
    if (nom !== undefined) updateData.nom = nom;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (email !== undefined && email !== req.user.email) {
      // Vérifier si l'email est déjà utilisé
      const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
      updateData.email = email;
      updateData.emailVerifie = false; // Nécessite une nouvelle vérification
      
      // Générer un nouveau token de vérification d'email (à implémenter)
    }
    if (telephone !== undefined) updateData.telephone = telephone;
    if (adresse !== undefined) updateData.adresse = adresse;
    if (vehicules !== undefined && req.user.role === 'transporteur') updateData.vehicules = vehicules;
    
    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.user.id,
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
      message: 'Profil mis à jour avec succès',
      data: user
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err);
    
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
      message: 'Erreur lors de la mise à jour du profil',
      error: err.message
    });
  }
};

// @desc    Télécharger une photo de profil
// @route   POST /api/users/profile/upload-photo
// @access  Privé
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.files || !req.files.photo) {
      return res.status(400).json({
        success: false,
        message: 'Aucune photo téléchargée'
      });
    }
    
    const photo = req.files.photo;
    
    // Vérifier le type de fichier
    if (!photo.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez télécharger une image'
      });
    }
    
    // Vérifier la taille du fichier (max 2MB)
    if (photo.size > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez télécharger une image de moins de 2MB'
      });
    }
    
    // Créer le dossier de stockage s'il n'existe pas
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'profile');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Générer un nom de fichier unique
    const fileName = `user-${req.user.id}-${Date.now()}${path.extname(photo.name)}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Déplacer le fichier
    await photo.mv(filePath);
    
    // Mettre à jour la photo de profil de l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { photo: `/uploads/profile/${fileName}` },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Photo de profil mise à jour avec succès',
      data: user
    });
  } catch (err) {
    console.error('Erreur lors du téléchargement de la photo:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement de la photo',
      error: err.message
    });
  }
};

// @desc    Télécharger des documents (pour les transporteurs)
// @route   POST /api/users/profile/upload-documents
// @access  Privé (transporteurs uniquement)
exports.uploadDocuments = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un transporteur
    if (req.user.role !== 'transporteur') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les transporteurs peuvent télécharger des documents'
      });
    }
    
    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: 'Aucun document téléchargé'
      });
    }
    
    // Créer le dossier de stockage s'il n'existe pas
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'documents', req.user.id);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const updatedDocuments = { ...req.user.documents };
    
    // Traiter chaque type de document
    const documentTypes = ['identite', 'assurance', 'vehicule'];
    
    for (const type of documentTypes) {
      if (req.files[type]) {
        const file = req.files[type];
        
        // Vérifier le type de fichier (PDF ou image)
        if (!file.mimetype.startsWith('image') && file.mimetype !== 'application/pdf') {
          return res.status(400).json({
            success: false,
            message: `Le document ${type} doit être une image ou un PDF`
          });
        }
        
        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: `Le document ${type} doit faire moins de 5MB`
          });
        }
        
        // Générer un nom de fichier unique
        const fileName = `${type}-${Date.now()}${path.extname(file.name)}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Déplacer le fichier
        await file.mv(filePath);
        
        // Mettre à jour le chemin du document
        updatedDocuments[type] = `/uploads/documents/${req.user.id}/${fileName}`;
      }
    }
    
    // Mettre à jour les documents de l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { documents: updatedDocuments },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');
    
    res.json({
      success: true,
      message: 'Documents téléchargés avec succès',
      data: user
    });
  } catch (err) {
    console.error('Erreur lors du téléchargement des documents:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement des documents',
      error: err.message
    });
  }
};

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/users/profile/update-password
// @access  Privé
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user.id).select('+password');
    
    // Vérifier si le mot de passe actuel est correct
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du mot de passe:', err);
    
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
      message: 'Erreur lors de la mise à jour du mot de passe',
      error: err.message
    });
  }
};