// frontend/src/utils/constants.js
// Types d'annonces
export const TYPE_TRANSPORT = {
  COLIS: 'colis',
  MEUBLE: 'meuble',
  MARCHANDISE: 'marchandise',
  PALETTE: 'palette',
  DEMENAGEMENT: 'demenagement',
  VEHICULE: 'vehicule',
  AUTRE: 'autre'
};

// Libellés des types de transport
export const TYPE_TRANSPORT_LABELS = {
  [TYPE_TRANSPORT.COLIS]: 'Colis',
  [TYPE_TRANSPORT.MEUBLE]: 'Meuble',
  [TYPE_TRANSPORT.MARCHANDISE]: 'Marchandise',
  [TYPE_TRANSPORT.PALETTE]: 'Palette',
  [TYPE_TRANSPORT.DEMENAGEMENT]: 'Déménagement',
  [TYPE_TRANSPORT.VEHICULE]: 'Véhicule',
  [TYPE_TRANSPORT.AUTRE]: 'Autre'
};

// Statuts des annonces
export const STATUT_ANNONCE = {
  DISPONIBLE: 'disponible',
  EN_ATTENTE: 'en_attente',
  EN_COURS: 'en_cours',
  TERMINE: 'termine',
  ANNULE: 'annule'
};

// Libellés des statuts d'annonce
export const STATUT_ANNONCE_LABELS = {
  [STATUT_ANNONCE.DISPONIBLE]: 'Disponible',
  [STATUT_ANNONCE.EN_ATTENTE]: 'En attente',
  [STATUT_ANNONCE.EN_COURS]: 'En cours',
  [STATUT_ANNONCE.TERMINE]: 'Terminé',
  [STATUT_ANNONCE.ANNULE]: 'Annulé'
};

// Couleurs des statuts d'annonce
export const STATUT_ANNONCE_COLORS = {
  [STATUT_ANNONCE.DISPONIBLE]: 'bg-green-100 text-green-800',
  [STATUT_ANNONCE.EN_ATTENTE]: 'bg-blue-100 text-blue-800',
  [STATUT_ANNONCE.EN_COURS]: 'bg-yellow-100 text-yellow-800',
  [STATUT_ANNONCE.TERMINE]: 'bg-gray-100 text-gray-800',
  [STATUT_ANNONCE.ANNULE]: 'bg-red-100 text-red-800'
};

// Statuts des devis
export const STATUT_DEVIS = {
  EN_ATTENTE: 'en_attente',
  ACCEPTE: 'accepte',
  REFUSE: 'refuse',
  ANNULE: 'annule',
  EXPIRE: 'expire',
  EN_COURS: 'en_cours',
  TERMINE: 'termine'
};

// Libellés des statuts de devis
export const STATUT_DEVIS_LABELS = {
  [STATUT_DEVIS.EN_ATTENTE]: 'En attente',
  [STATUT_DEVIS.ACCEPTE]: 'Accepté',
  [STATUT_DEVIS.REFUSE]: 'Refusé',
  [STATUT_DEVIS.ANNULE]: 'Annulé',
  [STATUT_DEVIS.EXPIRE]: 'Expiré',
  [STATUT_DEVIS.EN_COURS]: 'En cours',
  [STATUT_DEVIS.TERMINE]: 'Terminé'
};

// Couleurs des statuts de devis
export const STATUT_DEVIS_COLORS = {
  [STATUT_DEVIS.EN_ATTENTE]: 'bg-blue-100 text-blue-800',
  [STATUT_DEVIS.ACCEPTE]: 'bg-green-100 text-green-800',
  [STATUT_DEVIS.REFUSE]: 'bg-red-100 text-red-800',
  [STATUT_DEVIS.ANNULE]: 'bg-gray-100 text-gray-800',
  [STATUT_DEVIS.EXPIRE]: 'bg-yellow-100 text-yellow-800',
  [STATUT_DEVIS.EN_COURS]: 'bg-indigo-100 text-indigo-800',
  [STATUT_DEVIS.TERMINE]: 'bg-teal-100 text-teal-800'
};

// Statuts de suivi
export const STATUT_SUIVI = {
  EN_ATTENTE: 'en_attente',
  PRIS_EN_CHARGE: 'pris_en_charge',
  EN_TRANSIT: 'en_transit',
  EN_LIVRAISON: 'en_livraison',
  LIVRE: 'livre',
  PROBLEME: 'probleme'
};

// Libellés des statuts de suivi
export const STATUT_SUIVI_LABELS = {
  [STATUT_SUIVI.EN_ATTENTE]: 'En attente',
  [STATUT_SUIVI.PRIS_EN_CHARGE]: 'Pris en charge',
  [STATUT_SUIVI.EN_TRANSIT]: 'En transit',
  [STATUT_SUIVI.EN_LIVRAISON]: 'En livraison',
  [STATUT_SUIVI.LIVRE]: 'Livré',
  [STATUT_SUIVI.PROBLEME]: 'Problème'
};

// Couleurs des statuts de suivi
export const STATUT_SUIVI_COLORS = {
  [STATUT_SUIVI.EN_ATTENTE]: 'bg-gray-100 text-gray-800',
  [STATUT_SUIVI.PRIS_EN_CHARGE]: 'bg-blue-100 text-blue-800',
  [STATUT_SUIVI.EN_TRANSIT]: 'bg-indigo-100 text-indigo-800',
  [STATUT_SUIVI.EN_LIVRAISON]: 'bg-purple-100 text-purple-800',
  [STATUT_SUIVI.LIVRE]: 'bg-green-100 text-green-800',
  [STATUT_SUIVI.PROBLEME]: 'bg-red-100 text-red-800'
};

// Rôles utilisateur
export const ROLES = {
  CLIENT: 'client',
  TRANSPORTEUR: 'transporteur',
  ADMIN: 'admin'
};

// Libellés des rôles
export const ROLES_LABELS = {
  [ROLES.CLIENT]: 'Client',
  [ROLES.TRANSPORTEUR]: 'Transporteur',
  [ROLES.ADMIN]: 'Administrateur'
};

// Méthodes de paiement
export const METHODES_PAIEMENT = {
  CARTE: 'carte',
  VIREMENT: 'virement',
  PAYPAL: 'paypal',
  ESPECES: 'especes',
  CHEQUE: 'cheque',
  AUTRE: 'autre'
};

// Libellés des méthodes de paiement
export const METHODES_PAIEMENT_LABELS = {
  [METHODES_PAIEMENT.CARTE]: 'Carte bancaire',
  [METHODES_PAIEMENT.VIREMENT]: 'Virement bancaire',
  [METHODES_PAIEMENT.PAYPAL]: 'PayPal',
  [METHODES_PAIEMENT.ESPECES]: 'Espèces',
  [METHODES_PAIEMENT.CHEQUE]: 'Chèque',
  [METHODES_PAIEMENT.AUTRE]: 'Autre'
};

// Types de véhicules
export const TYPES_VEHICULES = {
  VOITURE: 'voiture',
  UTILITAIRE: 'utilitaire',
  CAMION: 'camion',
  POIDS_LOURD: 'poids_lourd',
  AUTRE: 'autre'
};

// Libellés des types de véhicules
export const TYPES_VEHICULES_LABELS = {
  [TYPES_VEHICULES.VOITURE]: 'Voiture',
  [TYPES_VEHICULES.UTILITAIRE]: 'Utilitaire',
  [TYPES_VEHICULES.CAMION]: 'Camion',
  [TYPES_VEHICULES.POIDS_LOURD]: 'Poids lourd',
  [TYPES_VEHICULES.AUTRE]: 'Autre'
};

// Unités de mesure
export const UNITES = {
  POIDS: {
    KG: 'kg',
    TONNES: 'tonnes'
  },
  DIMENSIONS: {
    CM: 'cm',
    M: 'm'
  }
};

// Statuts des paiements
export const STATUT_PAIEMENT = {
  NON_PAYE: 'non_paye',
  PAYE_PARTIELLEMENT: 'paye_partiellement',
  PAYE: 'paye',
  REMBOURSE: 'rembourse'
};

// Libellés des statuts de paiement
export const STATUT_PAIEMENT_LABELS = {
  [STATUT_PAIEMENT.NON_PAYE]: 'Non payé',
  [STATUT_PAIEMENT.PAYE_PARTIELLEMENT]: 'Payé partiellement',
  [STATUT_PAIEMENT.PAYE]: 'Payé',
  [STATUT_PAIEMENT.REMBOURSE]: 'Remboursé'
};