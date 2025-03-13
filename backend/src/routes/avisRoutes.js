// backend/src/routes/avisRoutes.js
const express = require('express');
const router = express.Router();
const avisController = require('../controllers/avisController');
const { protect } = require('../middleware/auth');

// Protection de toutes les routes avec authentification
router.use(protect);

// Création d'un avis
router.post('/', avisController.createAvis);

// Obtenir les avis d'un utilisateur spécifique
router.get('/utilisateur/:userId', avisController.getAvisUtilisateur);

// Obtenir les avis donnés par l'utilisateur connecté
router.get('/donnes', avisController.getAvisDonnes);

// Obtenir les avis reçus par l'utilisateur connecté
router.get('/recus', avisController.getAvisRecus);

// Vérifier si un avis existe déjà
router.get('/check/:destinataireId/:annonceId', avisController.checkAvisExists);

module.exports = router;