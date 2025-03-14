// backend/src/controllers/paymentController.js
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Annonce = require('../models/Annonce');
const Devis = require('../models/Devis');
const User = require('../models/User');
const Paiement = require('../models/Paiement');
const Facture = require('../models/Facture');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sendPaymentConfirmationEmail } = require('../utils/emailService');

// Fonction pour générer une référence unique pour le paiement
const generatePaymentReference = () => {
  return 'PAY-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

// Fonction pour générer une référence unique pour la facture
const generateInvoiceReference = () => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `F${year}${month}-${random}`;
};

// @desc    Créer un paiement
// @route   POST /api/payments
// @access  Privé
exports.createPayment = async (req, res) => {
  try {
    const { devisId, montant, methodePaiement, carte } = req.body;
    
    // Vérifier si l'ID du devis est valide
    if (!mongoose.Types.ObjectId.isValid(devisId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de devis invalide'
      });
    }
    
    // Récupérer le devis
    const devis = await Devis.findById(devisId)
      .populate({
        path: 'annonce',
        populate: { path: 'utilisateur', select: 'nom prenom email' }
      })
      .populate('transporteur', 'nom prenom email');
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est bien le client concerné par l'annonce
    if (devis.annonce.utilisateur._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à effectuer ce paiement'
      });
    }
    
    // Vérifier si le devis est accepté
    if (devis.statut !== 'accepte') {
      return res.status(400).json({
        success: false,
        message: 'Le devis doit être accepté pour pouvoir effectuer un paiement'
      });
    }
    
    // Vérifier le montant du paiement
    if (montant !== devis.montant) {
      return res.status(400).json({
        success: false,
        message: 'Le montant du paiement ne correspond pas au montant du devis'
      });
    }
    
    // Générer une référence de paiement
    const reference = generatePaymentReference();
    
    let paymentId, paymentMethod, paymentStatus;
    
    // Traitement en fonction de la méthode de paiement
    switch (methodePaiement) {
      case 'carte':
        try {
          // Si une carte sauvegardée est utilisée
          if (carte && carte.id) {
            // Récupérer les méthodes de paiement sauvegardées de l'utilisateur
            const customer = await User.findById(req.user.id).select('stripeCustomerId');
            
            if (!customer.stripeCustomerId) {
              return res.status(400).json({
                success: false,
                message: 'Aucun compte client Stripe associé'
              });
            }
            
            // Créer un paiement avec Stripe
            const paymentIntent = await stripe.paymentIntents.create({
              amount: Math.round(montant * 100), // Montant en centimes
              currency: 'eur',
              customer: customer.stripeCustomerId,
              payment_method: carte.id,
              off_session: true,
              confirm: true,
              description: `Paiement pour l'annonce: ${devis.annonce.titre}`,
              metadata: {
                devisId: devis._id.toString(),
                annonceId: devis.annonce._id.toString(),
                userId: req.user.id
              }
            });
            
            paymentId = paymentIntent.id;
            paymentMethod = carte.id;
            paymentStatus = paymentIntent.status === 'succeeded' ? 'paye' : 'en_attente';
          } else if (carte && carte.numero) {
            // Créer un token de carte avec Stripe (pour une nouvelle carte)
            const token = await stripe.tokens.create({
              card: {
                number: carte.numero,
                exp_month: parseInt(carte.expiration.split('/')[0]),
                exp_year: parseInt('20' + carte.expiration.split('/')[1]),
                cvc: carte.cvc
              }
            });
            
            // Si l'utilisateur veut sauvegarder sa carte
            if (carte.sauvegarder) {
              // Vérifier si l'utilisateur a déjà un compte client Stripe
              let customer = await User.findById(req.user.id).select('stripeCustomerId');
              
              // Si l'utilisateur n'a pas de compte client Stripe, en créer un
              if (!customer.stripeCustomerId) {
                const newCustomer = await stripe.customers.create({
                  email: req.user.email,
                  name: `${req.user.prenom} ${req.user.nom}`,
                  metadata: {
                    userId: req.user.id
                  }
                });
                
                customer.stripeCustomerId = newCustomer.id;
                await customer.save();
              }
              
              // Ajouter la carte au compte client
              const paymentMethod = await stripe.paymentMethods.create({
                type: 'card',
                card: {
                  token: token.id
                }
              });
              
              await stripe.paymentMethods.attach(paymentMethod.id, {
                customer: customer.stripeCustomerId
              });
              
              // Créer un paiement avec Stripe
              const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(montant * 100), // Montant en centimes
                currency: 'eur',
                customer: customer.stripeCustomerId,
                payment_method: paymentMethod.id,
                confirm: true,
                description: `Paiement pour l'annonce: ${devis.annonce.titre}`,
                metadata: {
                  devisId: devis._id.toString(),
                  annonceId: devis.annonce._id.toString(),
                  userId: req.user.id
                }
              });
              
              paymentId = paymentIntent.id;
              paymentMethod = paymentMethod.id;
              paymentStatus = paymentIntent.status === 'succeeded' ? 'paye' : 'en_attente';
            } else {
              // Créer un paiement avec Stripe sans sauvegarder la carte
              const charge = await stripe.charges.create({
                amount: Math.round(montant * 100), // Montant en centimes
                currency: 'eur',
                source: token.id,
                description: `Paiement pour l'annonce: ${devis.annonce.titre}`,
                metadata: {
                  devisId: devis._id.toString(),
                  annonceId: devis.annonce._id.toString(),
                  userId: req.user.id
                }
              });
              
              paymentId = charge.id;
              paymentMethod = 'carte';
              paymentStatus = charge.status === 'succeeded' ? 'paye' : 'en_attente';
            }
          } else {
            return res.status(400).json({
              success: false,
              message: 'Informations de carte invalides'
            });
          }
        } catch (stripeError) {
          console.error('Erreur Stripe:', stripeError);
          return res.status(400).json({
            success: false,
            message: 'Erreur lors du traitement du paiement',
            error: stripeError.message
          });
        }
        break;
        
      case 'virement':
        // Pour les virements bancaires, le statut est "en attente"
        paymentId = 'virement-' + reference;
        paymentMethod = 'virement';
        paymentStatus = 'en_attente';
        break;
        
      case 'paypal':
        // Pour PayPal, vous devriez avoir une intégration avec l'API PayPal
        // Ceci est un exemple simplifié
        paymentId = 'paypal-' + reference;
        paymentMethod = 'paypal';
        paymentStatus = 'en_attente';
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Méthode de paiement non supportée'
        });
    }
    
    // Créer l'enregistrement de paiement dans la base de données
    const paiement = new Paiement({
      utilisateur: req.user.id,
      devis: devis._id,
      annonce: devis.annonce._id,
      transporteur: devis.transporteur._id,
      montant,
      methode: methodePaiement,
      reference,
      statut: paymentStatus,
      paiementId: paymentId,
      paiementMethode: paymentMethod,
      dateTransaction: new Date()
    });
    
    await paiement.save();
    
    // Si le paiement est réussi, mettre à jour l'annonce
    if (paymentStatus === 'paye') {
      // Mettre à jour le statut de paiement de l'annonce
      await Annonce.findByIdAndUpdate(devis.annonce._id, {
        'paiement.statut': 'paye',
        'paiement.montantPaye': montant,
        'paiement.methode': methodePaiement,
        'paiement.dateTransaction': new Date(),
        'paiement.referenceTransaction': reference
      });
      
      // Générer une facture
      const factureReference = generateInvoiceReference();
      
      const facture = new Facture({
        utilisateur: req.user.id,
        transporteur: devis.transporteur._id,
        annonce: devis.annonce._id,
        devis: devis._id,
        paiement: paiement._id,
        reference: factureReference,
        montantHT: parseFloat((montant / 1.2).toFixed(2)),
        montantTVA: parseFloat((montant - (montant / 1.2)).toFixed(2)),
        montantTTC: montant,
        tauxTVA: 20,
        dateEmission: new Date(),
        statut: 'emise'
      });
      
      await facture.save();
      
      // Générer le PDF de la facture
      await generateInvoicePDF(facture._id);
      
      // Envoyer un email de confirmation de paiement
      try {
        await sendPaymentConfirmationEmail(
          req.user.email,
          req.user.prenom,
          devis.annonce,
          {
            amount: montant,
            date: new Date(),
            reference,
            method: methodePaiement,
            invoiceId: facture._id
          }
        );
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation de paiement:', emailError);
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Paiement créé avec succès',
      data: {
        _id: paiement._id,
        reference,
        montant,
        statut: paymentStatus,
        methode: methodePaiement,
        dateTransaction: paiement.dateTransaction
      }
    });
  } catch (err) {
    console.error('Erreur lors de la création du paiement:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement',
      error: err.message
    });
  }
};

// @desc    Obtenir les méthodes de paiement sauvegardées
// @route   GET /api/payments/payment-methods
// @access  Privé
exports.getPaymentMethods = async (req, res) => {
  try {
    // Récupérer l'utilisateur avec son ID client Stripe
    const user = await User.findById(req.user.id).select('stripeCustomerId');
    
    // Si l'utilisateur n'a pas de compte client Stripe, retourner un tableau vide
    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Récupérer les méthodes de paiement sauvegardées chez Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card'
    });
    
    // Formater les données
    const formattedPaymentMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year
    }));
    
    res.json({
      success: true,
      data: formattedPaymentMethods
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des méthodes de paiement:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des méthodes de paiement',
      error: err.message
    });
  }
};

// @desc    Ajouter une nouvelle méthode de paiement
// @route   POST /api/payments/payment-methods
// @access  Privé
exports.addPaymentMethod = async (req, res) => {
  try {
    const { numero, nom, expiration, cvc } = req.body;
    
    // Valider les informations de la carte
    if (!numero || !nom || !expiration || !cvc) {
      return res.status(400).json({
        success: false,
        message: 'Toutes les informations de la carte sont requises'
      });
    }
    
    // Créer un token de carte avec Stripe
    const token = await stripe.tokens.create({
      card: {
        number: numero,
        exp_month: parseInt(expiration.split('/')[0]),
        exp_year: parseInt('20' + expiration.split('/')[1]),
        cvc,
        name: nom
      }
    });
    
    // Récupérer l'utilisateur avec son ID client Stripe
    let user = await User.findById(req.user.id).select('stripeCustomerId');
    
    // Si l'utilisateur n'a pas de compte client Stripe, en créer un
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.prenom} ${req.user.nom}`,
        metadata: {
          userId: req.user.id
        }
      });
      
      user.stripeCustomerId = customer.id;
      await user.save();
    }
    
    // Créer une méthode de paiement et l'attacher au compte client
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: token.id
      },
      billing_details: {
        name: nom,
        email: req.user.email
      }
    });
    
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: user.stripeCustomerId
    });
    
    res.status(201).json({
      success: true,
      message: 'Méthode de paiement ajoutée avec succès',
      data: {
        id: paymentMethod.id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year
      }
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la méthode de paiement:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la méthode de paiement',
      error: err.message
    });
  }
};

// @desc    Supprimer une méthode de paiement
// @route   DELETE /api/payments/payment-methods/:id
// @access  Privé
exports.deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'utilisateur avec son ID client Stripe
    const user = await User.findById(req.user.id).select('stripeCustomerId');
    
    // Si l'utilisateur n'a pas de compte client Stripe, retourner une erreur
    if (!user.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: 'Aucun compte client Stripe associé'
      });
    }
    
    // Vérifier si la méthode de paiement appartient bien à l'utilisateur
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card'
    });
    
    const paymentMethod = paymentMethods.data.find(pm => pm.id === id);
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Méthode de paiement non trouvée ou n\'appartenant pas à l\'utilisateur'
      });
    }
    
    // Détacher la méthode de paiement du compte client
    await stripe.paymentMethods.detach(id);
    
    res.json({
      success: true,
      message: 'Méthode de paiement supprimée avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de la suppression de la méthode de paiement:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la méthode de paiement',
      error: err.message
    });
  }
};

// @desc    Vérifier le statut d'un paiement
// @route   GET /api/payments/:id
// @access  Privé
exports.getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paiement invalide'
      });
    }
    
    // Récupérer le paiement
    const paiement = await Paiement.findById(id)
      .populate('devis', 'montant delaiLivraison')
      .populate('annonce', 'titre villeDepart villeArrivee')
      .populate('transporteur', 'nom prenom');
    
    if (!paiement) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur est autorisé à voir ce paiement
    if (paiement.utilisateur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir ce paiement'
      });
    }
    
    // Récupérer la facture associée au paiement
    const facture = await Facture.findOne({ paiement: id });
    
    res.json({
      success: true,
      data: {
        _id: paiement._id,
        reference: paiement.reference,
        montant: paiement.montant,
        statut: paiement.statut,
        methode: paiement.methode,
        dateTransaction: paiement.dateTransaction,
        devis: paiement.devis,
        annonce: paiement.annonce,
        transporteur: paiement.transporteur,
        facture: facture ? {
          _id: facture._id,
          reference: facture.reference,
          dateEmission: facture.dateEmission
        } : null
      }
    });
  } catch (err) {
    console.error('Erreur lors de la vérification du statut du paiement:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut du paiement',
      error: err.message
    });
  }
};

// @desc    Traiter les webhooks de paiement
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Il faut configurer Express pour récupérer le corps brut
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Erreur de signature du webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Traiter l'événement
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
      
    default:
      console.log(`Événement non géré: ${event.type}`);
  }
  
  // Retourner une réponse 200 pour confirmer la réception
  res.json({ received: true });
};

// Fonction pour gérer un paiement réussi
const handleSuccessfulPayment = async (paymentIntent) => {
  try {
    // Récupérer les métadonnées
    const { devisId, annonceId, userId } = paymentIntent.metadata;
    
    // Chercher le paiement correspondant
    const paiement = await Paiement.findOne({
      paiementId: paymentIntent.id
    });
    
    if (!paiement) {
      console.error('Paiement non trouvé pour le PaymentIntent:', paymentIntent.id);
      return;
    }
    
    // Mettre à jour le statut du paiement
    paiement.statut = 'paye';
    await paiement.save();
    
    // Mettre à jour le statut de paiement de l'annonce
    await Annonce.findByIdAndUpdate(annonceId, {
      'paiement.statut': 'paye',
      'paiement.montantPaye': paiement.montant,
      'paiement.methode': paiement.methode,
      'paiement.dateTransaction': new Date(),
      'paiement.referenceTransaction': paiement.reference
    });
    
    // Mettre à jour le statut de la facture
    const facture = await Facture.findOne({ paiement: paiement._id });
    
    if (facture) {
      facture.statut = 'payee';
      await facture.save();
    } else {
      // Générer une facture si elle n'existe pas encore
      const factureReference = generateInvoiceReference();
      
      const nouvelleFacture = new Facture({
        utilisateur: userId,
        transporteur: paiement.transporteur,
        annonce: annonceId,
        devis: devisId,
        paiement: paiement._id,
        reference: factureReference,
        montantHT: parseFloat((paiement.montant / 1.2).toFixed(2)),
        montantTVA: parseFloat((paiement.montant - (paiement.montant / 1.2)).toFixed(2)),
        montantTTC: paiement.montant,
        tauxTVA: 20,
        dateEmission: new Date(),
        statut: 'payee'
      });
      
      await nouvelleFacture.save();
      
      // Générer le PDF de la facture
      await generateInvoicePDF(nouvelleFacture._id);
    }
    
    // Envoyer un email de confirmation de paiement
    const user = await User.findById(userId);
    const annonce = await Annonce.findById(annonceId);
    
    if (user && annonce) {
      try {
        await sendPaymentConfirmationEmail(
          user.email,
          user.prenom,
          annonce,
          {
            amount: paiement.montant,
            date: new Date(),
            reference: paiement.reference,
            method: paiement.methode,
            invoiceId: facture ? facture._id : nouvelleFacture._id
          }
        );
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation de paiement:', emailError);
      }
    }
  } catch (err) {
    console.error('Erreur lors du traitement du paiement réussi:', err);
  }
};

// Fonction pour gérer un paiement échoué
const handleFailedPayment = async (paymentIntent) => {
  try {
    // Chercher le paiement correspondant
    const paiement = await Paiement.findOne({
      paiementId: paymentIntent.id
    });
    
    if (!paiement) {
      console.error('Paiement non trouvé pour le PaymentIntent:', paymentIntent.id);
      return;
    }
    
    // Mettre à jour le statut du paiement
    paiement.statut = 'echec';
    paiement.detailsEchec = {
      code: paymentIntent.last_payment_error?.code,
      message: paymentIntent.last_payment_error?.message,
      date: new Date()
    };
    
    await paiement.save();
    
    // Envoyer un email de notification d'échec de paiement
    const user = await User.findById(paiement.utilisateur);
    
    if (user) {
      // Envoyer un email de notification d'échec (à implémenter)
    }
  } catch (err) {
    console.error('Erreur lors du traitement du paiement échoué:', err);
  }
};

// @desc    Obtenir les factures de l'utilisateur
// @route   GET /api/payments/factures
// @access  Privé
exports.getUserInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Compter le nombre total de factures
    const total = await Facture.countDocuments({ utilisateur: req.user.id });
    
    // Récupérer les factures
    const factures = await Facture.find({ utilisateur: req.user.id })
      .populate('annonce', 'titre villeDepart villeArrivee')
      .populate('transporteur', 'nom prenom')
      .sort({ dateEmission: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: factures.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: factures
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des factures:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures',
      error: err.message
    });
  }
};

// @desc    Obtenir une facture spécifique
// @route   GET /api/payments/factures/:id
// @access  Privé
exports.getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de facture invalide'
      });
    }
    
    // Récupérer la facture
    const facture = await Facture.findById(id)
      .populate('annonce', 'titre villeDepart villeArrivee dateDepart typeTransport poids volume')
      .populate('transporteur', 'nom prenom email telephone adresse')
      .populate('devis', 'detailTarifs');
    
    if (!facture) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }
    
    // Vérifier si l'utilisateur est autorisé à voir cette facture
    if (facture.utilisateur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir cette facture'
      });
    }
    
    res.json({
      success: true,
      data: facture
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de la facture:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la facture',
      error: err.message
    });
  }
};

// @desc    Télécharger une facture au format PDF
// @route   GET /api/payments/factures/:id/download
// @access  Privé
exports.downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de facture invalide'
      });
    }
    
    // Récupérer la facture
    const facture = await Facture.findById(id)
      .populate('annonce', 'titre villeDepart villeArrivee dateDepart typeTransport')
      .populate('transporteur', 'nom prenom email telephone adresse')
      .populate('utilisateur', 'nom prenom email telephone adresse');
    
    if (!facture) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }
    
    // Vérifier si l'utilisateur est autorisé à télécharger cette facture
    if (facture.utilisateur._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à télécharger cette facture'
      });
    }
    
    // Chemin du fichier PDF
    const pdfFilePath = path.join(__dirname, '..', '..', 'uploads', 'factures', `facture-${facture._id}.pdf`);
    
    // Vérifier si le fichier PDF existe, sinon le générer
    if (!fs.existsSync(pdfFilePath)) {
      await generateInvoicePDF(facture._id);
    }
    
    // Envoyer le fichier PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${facture.reference}.pdf`);
    
    const fileStream = fs.createReadStream(pdfFilePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Erreur lors du téléchargement de la facture:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement de la facture',
      error: err.message
    });
  }
};

// @desc    Obtenir les statistiques de paiement
// @route   GET /api/payments/statistics
// @access  Privé
exports.getPaymentStatistics = async (req, res) => {
  try {
    // Statistiques des paiements de l'utilisateur
    const paiements = await Paiement.find({ utilisateur: req.user.id });
    
    const totalPaye = paiements
      .filter(p => p.statut === 'paye')
      .reduce((sum, p) => sum + p.montant, 0);
    
    const totalEnAttente = paiements
      .filter(p => p.statut === 'en_attente')
      .reduce((sum, p) => sum + p.montant, 0);
    
    const paiementsParMois = {};
    paiements.forEach(p => {
      const date = new Date(p.dateTransaction);
      const moisAnnee = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!paiementsParMois[moisAnnee]) {
        paiementsParMois[moisAnnee] = {
          mois: moisAnnee,
          montant: 0,
          nombre: 0
        };
      }
      
      if (p.statut === 'paye') {
        paiementsParMois[moisAnnee].montant += p.montant;
        paiementsParMois[moisAnnee].nombre += 1;
      }
    });
    
    // Formatage des données pour le graphique
    const statistiquesParMois = Object.values(paiementsParMois).sort((a, b) => a.mois.localeCompare(b.mois));
    
    res.json({
      success: true,
      data: {
        totalPaye,
        totalEnAttente,
        nombrePaiements: paiements.filter(p => p.statut === 'paye').length,
        statistiquesParMois
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques de paiement:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques de paiement',
      error: err.message
    });
  }
};

// Fonction pour générer le PDF d'une facture
const generateInvoicePDF = async (factureId) => {
  try {
    // Récupérer la facture avec toutes les informations nécessaires
    const facture = await Facture.findById(factureId)
      .populate('annonce', 'titre villeDepart villeArrivee dateDepart typeTransport poids volume')
      .populate('transporteur', 'nom prenom email telephone adresse')
      .populate('utilisateur', 'nom prenom email telephone adresse')
      .populate('devis', 'detailTarifs');
    
    if (!facture) {
      throw new Error('Facture non trouvée');
    }
    
    // Créer le répertoire de stockage des factures s'il n'existe pas
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const facturesDir = path.join(uploadsDir, 'factures');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    
    if (!fs.existsSync(facturesDir)) {
      fs.mkdirSync(facturesDir);
    }
    
    // Chemin du fichier PDF
    const pdfFilePath = path.join(facturesDir, `facture-${facture._id}.pdf`);
    
    // Créer un nouveau document PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Pipe le résultat dans un fichier
    doc.pipe(fs.createWriteStream(pdfFilePath));
    
    // En-tête
    doc.fontSize(20).text('FACTURE', { align: 'center' });
    doc.moveDown();
    
    // Informations de la facture
    doc.fontSize(12).text(`Référence: ${facture.reference}`);
    doc.text(`Date d'émission: ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`);
    doc.text(`Statut: ${facture.statut === 'payee' ? 'Payée' : 'En attente de paiement'}`);
    doc.moveDown();
    
    // Coordonnées du transporteur
    doc.fontSize(14).text('Transporteur', { underline: true });
    doc.fontSize(12).text(`${facture.transporteur.prenom} ${facture.transporteur.nom}`);
    if (facture.transporteur.adresse) {
      doc.text(`${facture.transporteur.adresse.rue || ''}`);
      doc.text(`${facture.transporteur.adresse.codePostal || ''} ${facture.transporteur.adresse.ville || ''}`);
      doc.text(`${facture.transporteur.adresse.pays || 'France'}`);
    }
    doc.text(`Email: ${facture.transporteur.email}`);
    doc.text(`Téléphone: ${facture.transporteur.telephone}`);
    doc.moveDown();
    
    // Coordonnées du client
    doc.fontSize(14).text('Client', { underline: true });
    doc.fontSize(12).text(`${facture.utilisateur.prenom} ${facture.utilisateur.nom}`);
    if (facture.utilisateur.adresse) {
      doc.text(`${facture.utilisateur.adresse.rue || ''}`);
      doc.text(`${facture.utilisateur.adresse.codePostal || ''} ${facture.utilisateur.adresse.ville || ''}`);
      doc.text(`${facture.utilisateur.adresse.pays || 'France'}`);
    }
    doc.text(`Email: ${facture.utilisateur.email}`);
    doc.text(`Téléphone: ${facture.utilisateur.telephone}`);
    doc.moveDown();
    
    // Détails du transport
    doc.fontSize(14).text('Détails du transport', { underline: true });
    doc.fontSize(12).text(`Annonce: ${facture.annonce.titre}`);
    doc.text(`De: ${facture.annonce.villeDepart}`);
    doc.text(`À: ${facture.annonce.villeArrivee}`);
    doc.text(`Date de départ: ${new Date(facture.annonce.dateDepart).toLocaleDateString('fr-FR')}`);
    doc.text(`Type de transport: ${facture.annonce.typeTransport}`);
    if (facture.annonce.poids) doc.text(`Poids: ${facture.annonce.poids} kg`);
    if (facture.annonce.volume) doc.text(`Volume: ${facture.annonce.volume} m³`);
    doc.moveDown();
    
    // Détails du tarif
    doc.fontSize(14).text('Détails du tarif', { underline: true });
    
    // Tableau des prix
    const tableTop = doc.y + 10;
    const tableLeft = 50;
    
    // En-têtes du tableau
    doc.fontSize(10);
    doc.text('Description', tableLeft, tableTop);
    doc.text('Montant HT', tableLeft + 300, tableTop, { width: 80, align: 'right' });
    
    let tableRow = tableTop + 20;
    
    // Lignes du tableau
    if (facture.devis && facture.devis.detailTarifs) {
      const { detailTarifs } = facture.devis;
      
      // Transport de base
      doc.text('Transport', tableLeft, tableRow);
      doc.text(`${(detailTarifs.prixTransport / 1.2).toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
      tableRow += 20;
      
      // Options supplémentaires
      if (detailTarifs.fraisChargement > 0) {
        doc.text('Frais de chargement', tableLeft, tableRow);
        doc.text(`${(detailTarifs.fraisChargement / 1.2).toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
        tableRow += 20;
      }
      
      if (detailTarifs.fraisDechargement > 0) {
        doc.text('Frais de déchargement', tableLeft, tableRow);
        doc.text(`${(detailTarifs.fraisDechargement / 1.2).toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
        tableRow += 20;
      }
      
      if (detailTarifs.fraisMontage > 0) {
        doc.text('Frais de montage', tableLeft, tableRow);
        doc.text(`${(detailTarifs.fraisMontage / 1.2).toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
        tableRow += 20;
      }
      
      if (detailTarifs.fraisDemontage > 0) {
        doc.text('Frais de démontage', tableLeft, tableRow);
        doc.text(`${(detailTarifs.fraisDemontage / 1.2).toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
        tableRow += 20;
      }
      
      if (detailTarifs.fraisEmballage > 0) {
        doc.text('Frais d\'emballage', tableLeft, tableRow);
        doc.text(`${(detailTarifs.fraisEmballage / 1.2).toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
        tableRow += 20;
      }
      
      if (detailTarifs.fraisAssurance > 0) {
        doc.text('Frais d\'assurance', tableLeft, tableRow);
        doc.text(`${(detailTarifs.fraisAssurance / 1.2).toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
        tableRow += 20;
      }
      
      if (detailTarifs.fraisUrgence > 0) {
        doc.text('Frais d\'urgence', tableLeft, tableRow);
        doc.text(`${(detailTarifs.fraisUrgence / 1.2).toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
        tableRow += 20;
      }
      
      if (detailTarifs.autresFrais > 0) {
        doc.text('Autres frais', tableLeft, tableRow);
        doc.text(`${(detailTarifs.autresFrais / 1.2).toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
        tableRow += 20;
      }
      
      if (detailTarifs.remise > 0) {
        doc.text('Remise', tableLeft, tableRow);
        doc.text(`-${(detailTarifs.remise / 1.2).toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
        tableRow += 20;
      }
    } else {
      // Si pas de détails, afficher le montant total HT directement
      doc.text('Transport', tableLeft, tableRow);
      doc.text(`${facture.montantHT.toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
      tableRow += 20;
    }
    
    // Ligne séparatrice
    tableRow += 10;
    doc.moveTo(tableLeft, tableRow).lineTo(tableLeft + 380, tableRow).stroke();
    tableRow += 10;
    
    // Total HT
    doc.text('Total HT', tableLeft, tableRow);
    doc.text(`${facture.montantHT.toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
    tableRow += 20;
    
    // TVA
    doc.text(`TVA (${facture.tauxTVA}%)`, tableLeft, tableRow);
    doc.text(`${facture.montantTVA.toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
    tableRow += 20;
    
    // Total TTC
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Total TTC', tableLeft, tableRow);
    doc.text(`${facture.montantTTC.toFixed(2)} DH`, tableLeft + 300, tableRow, { width: 80, align: 'right' });
    
    // Pied de page
    doc.fontSize(10).font('Helvetica');
    doc.text(
      'Pro-Trans - SIRET: 12345678901234 - TVA: FR123456789',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
    
    // Finaliser le document
    doc.end();
    
    // Mettre à jour le chemin du fichier de facture dans la base de données
    facture.fichierPDF = pdfFilePath;
    await facture.save();
    
    return pdfFilePath;
  } catch (err) {
    console.error('Erreur lors de la génération du PDF de la facture:', err);
    throw err;
  }
};