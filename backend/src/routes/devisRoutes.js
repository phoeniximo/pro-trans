// backend/src/routes/devisRoutes.js
const express = require('express');
const router = express.Router();
const devisController = require('../controllers/devisController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Créer un nouveau devis (transporteur)
router.post('/', devisController.createDevis);

// Obtenir les devis pour une annonce (annonceur)
router.get('/annonce/:annonceId', devisController.getDevisForAnnonce);

// Obtenir mes devis envoyés (transporteur)
router.get('/mes-devis', devisController.getMesDevisEnvoyes);

// Accepter un devis (annonceur)
router.put('/:devisId/accepter', devisController.accepterDevis);

// Refuser un devis (annonceur)
router.put('/:devisId/refuser', devisController.refuserDevis);

module.exports = router;