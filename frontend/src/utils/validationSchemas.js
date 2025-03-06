import * as Yup from 'yup';

// Schéma de validation pour l'inscription
export const registerSchema = Yup.object({
  nom: Yup.string()
    .required('Le nom est obligatoire')
    .min(2, 'Le nom doit comporter au moins 2 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
  
  prenom: Yup.string()
    .required('Le prénom est obligatoire')
    .min(2, 'Le prénom doit comporter au moins 2 caractères')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),
  
  email: Yup.string()
    .required('L\'email est obligatoire')
    .email('Format d\'email invalide'),
  
  password: Yup.string()
    .required('Le mot de passe est obligatoire')
    .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  
  passwordConfirm: Yup.string()
    .required('La confirmation du mot de passe est obligatoire')
    .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas'),
  
  telephone: Yup.string()
    .required('Le numéro de téléphone est obligatoire')
    .matches(
      /^(\+33|0)[1-9](\d{2}){4}$/, 
      'Format de téléphone invalide (ex: 0612345678 ou +33612345678)'
    ),
  
  role: Yup.string()
    .required('Le rôle est obligatoire')
    .oneOf(['client', 'transporteur'], 'Rôle invalide')
});

// Schéma de validation pour la connexion
export const loginSchema = Yup.object({
  email: Yup.string()
    .required('L\'email est obligatoire')
    .email('Format d\'email invalide'),
  
  password: Yup.string()
    .required('Le mot de passe est obligatoire')
});

// Schéma de validation pour la création d'annonce
export const annonceSchema = Yup.object({
  titre: Yup.string()
    .required('Le titre est obligatoire')
    .min(5, 'Le titre doit comporter au moins 5 caractères')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères'),
  
  description: Yup.string()
    .required('La description est obligatoire')
    .min(20, 'La description doit comporter au moins 20 caractères'),
  
  typeTransport: Yup.string()
    .required('Le type de transport est obligatoire')
    .oneOf(
      ['colis', 'meuble', 'marchandise', 'palette', 'demenagement', 'vehicule', 'autre'], 
      'Type de transport invalide'
    ),
  
  villeDepart: Yup.string()
    .required('La ville de départ est obligatoire'),
  
  villeArrivee: Yup.string()
    .required('La ville d\'arrivée est obligatoire'),
  
  dateDepart: Yup.date()
    .required('La date de départ est obligatoire')
    .min(new Date(), 'La date de départ doit être dans le futur'),
  
  poids: Yup.number()
    .when('typeTransport', {
      is: (type) => ['colis', 'marchandise', 'palette'].includes(type),
      then: () => Yup.number().required('Le poids est obligatoire').positive('Le poids doit être positif')
    }),
  
  volume: Yup.number()
    .when('typeTransport', {
      is: (type) => ['meuble', 'demenagement'].includes(type),
      then: () => Yup.number().required('Le volume est obligatoire').positive('Le volume doit être positif')
    })
});

// Schéma de validation pour la création de devis
export const devisSchema = Yup.object({
  annonceId: Yup.string()
    .required('L\'annonce est obligatoire'),
  
  montant: Yup.number()
    .required('Le montant est obligatoire')
    .positive('Le montant doit être positif'),
  
  message: Yup.string()
    .required('Le message est obligatoire')
    .min(20, 'Le message doit comporter au moins 20 caractères'),
  
  delaiLivraison: Yup.date()
    .required('Le délai de livraison est obligatoire')
    .min(new Date(), 'Le délai de livraison doit être dans le futur')
});

// Schéma de validation pour la création d'avis
export const avisSchema = Yup.object({
  note: Yup.number()
    .required('La note est obligatoire')
    .min(1, 'La note minimum est 1')
    .max(5, 'La note maximum est 5'),
  
  commentaire: Yup.string()
    .required('Le commentaire est obligatoire')
    .min(10, 'Le commentaire doit comporter au moins 10 caractères')
});

// Schéma de validation pour la mise à jour du profil
export const profileSchema = Yup.object({
  nom: Yup.string()
    .required('Le nom est obligatoire')
    .min(2, 'Le nom doit comporter au moins 2 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
  
  prenom: Yup.string()
    .required('Le prénom est obligatoire')
    .min(2, 'Le prénom doit comporter au moins 2 caractères')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),
  
  telephone: Yup.string()
    .required('Le numéro de téléphone est obligatoire')
    .matches(
      /^(\+33|0)[1-9](\d{2}){4}$/, 
      'Format de téléphone invalide (ex: 0612345678 ou +33612345678)'
    ),
  
  adresse: Yup.object().shape({
    rue: Yup.string()
      .required('La rue est obligatoire'),
    
    codePostal: Yup.string()
      .required('Le code postal est obligatoire')
      .matches(/^\d{5}$/, 'Le code postal doit comporter 5 chiffres'),
    
    ville: Yup.string()
      .required('La ville est obligatoire'),
    
    pays: Yup.string()
      .required('Le pays est obligatoire')
  })
});

// Schéma de validation pour le changement de mot de passe
export const passwordChangeSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Le mot de passe actuel est obligatoire'),
  
  newPassword: Yup.string()
    .required('Le nouveau mot de passe est obligatoire')
    .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  
  confirmPassword: Yup.string()
    .required('La confirmation du mot de passe est obligatoire')
    .oneOf([Yup.ref('newPassword'), null], 'Les mots de passe ne correspondent pas')
});

// Schéma de validation pour les paiements
export const paymentSchema = Yup.object({
  devisId: Yup.string()
    .required('Le devis est obligatoire'),
  
  montant: Yup.number()
    .required('Le montant est obligatoire')
    .positive('Le montant doit être positif'),
  
  methodePaiement: Yup.string()
    .required('La méthode de paiement est obligatoire')
    .oneOf(['carte', 'virement', 'paypal'], 'Méthode de paiement invalide')
});

// Schéma de validation pour le formulaire de contact
export const contactSchema = Yup.object({
  nom: Yup.string()
    .required('Le nom est obligatoire')
    .min(2, 'Le nom doit comporter au moins 2 caractères'),
  
  email: Yup.string()
    .required('L\'email est obligatoire')
    .email('Format d\'email invalide'),
  
  sujet: Yup.string()
    .required('Le sujet est obligatoire')
    .min(5, 'Le sujet doit comporter au moins 5 caractères'),
  
  message: Yup.string()
    .required('Le message est obligatoire')
    .min(20, 'Le message doit comporter au moins 20 caractères')
});

// Schéma de validation pour les messages
export const messageSchema = Yup.object({
  contenu: Yup.string()
    .required('Le message est obligatoire')
    .min(1, 'Le message ne peut pas être vide'),
  
  destinataire: Yup.string()
    .required('Le destinataire est obligatoire'),
  
  annonce: Yup.string()
    .required('L\'annonce est obligatoire')
});