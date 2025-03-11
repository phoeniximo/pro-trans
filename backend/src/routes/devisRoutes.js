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

// Obtenir mes devis reçus (client)
router.get('/recus', devisController.getMesDevisRecus);

// Obtenir un devis par son ID
router.get('/:id', devisController.getDevisById);

// Accepter un devis (annonceur)
router.put('/:devisId/accepter', devisController.accepterDevis);

// Refuser un devis (annonceur)
router.put('/:devisId/refuser', devisController.refuserDevis);

// Annuler un devis (transporteur)
router.put('/:devisId/annuler', devisController.annulerDevis);

// Mettre à jour le statut d'un transport en cours
router.put('/:devisId/statut', devisController.updateStatutTransport);

// Modifier un devis
router.put('/:devisId', devisController.updateDevis);

module.exports = router;