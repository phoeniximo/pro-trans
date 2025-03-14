// backend/src/utils/emailService.js
const nodemailer = require('nodemailer');

// Créer un transporteur pour l'envoi d'emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password'
  }
});

/**
 * Envoyer un email
 * @param {Object} options - Options de l'email
 * @param {string} options.to - Adresse email du destinataire
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.html - Contenu HTML de l'email
 * @param {string} [options.text] - Contenu texte de l'email
 * @returns {Promise} - Promesse résolue avec les informations d'envoi
 */
exports.sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Pro-Trans <noreply@pro-trans.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || ''
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Envoyer un email de bienvenue
 * @param {string} email - Adresse email du destinataire
 * @param {string} name - Prénom du destinataire
 * @param {string} verificationLink - Lien de vérification d'email
 * @returns {Promise} - Promesse résolue avec les informations d'envoi
 */
exports.sendWelcomeEmail = async (email, name, verificationLink) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://pro-trans.com/logo.png" alt="Pro-Trans Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #0f766e;">Bienvenue sur Pro-Trans !</h2>
      <p>Bonjour ${name},</p>
      <p>Nous sommes ravis de vous accueillir sur Pro-Trans, la plateforme qui simplifie vos transports.</p>
      <p>Veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Vérifier mon email</a>
      </div>
      <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller ce lien dans votre navigateur :</p>
      <p style="word-break: break-all;">${verificationLink}</p>
      <p>À très bientôt sur Pro-Trans !</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>Si vous n'avez pas créé de compte sur Pro-Trans, veuillez ignorer cet email.</p>
        <p>© ${new Date().getFullYear()} Pro-Trans. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await exports.sendEmail({
    to: email,
    subject: 'Bienvenue sur Pro-Trans - Confirmez votre email',
    html,
    text: `Bienvenue sur Pro-Trans ! Veuillez confirmer votre email en visitant ce lien : ${verificationLink}`
  });
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 * @param {string} email - Adresse email du destinataire
 * @param {string} name - Prénom du destinataire
 * @param {string} resetLink - Lien de réinitialisation du mot de passe
 * @returns {Promise} - Promesse résolue avec les informations d'envoi
 */
exports.sendPasswordResetEmail = async (email, name, resetLink) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://pro-trans.com/logo.png" alt="Pro-Trans Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #0f766e;">Réinitialisation de votre mot de passe</h2>
      <p>Bonjour ${name},</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Réinitialiser mon mot de passe</a>
      </div>
      <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller ce lien dans votre navigateur :</p>
      <p style="word-break: break-all;">${resetLink}</p>
      <p>Ce lien est valable pendant 10 minutes. Si vous n'avez pas demandé à réinitialiser votre mot de passe, veuillez ignorer cet email.</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} Pro-Trans. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await exports.sendEmail({
    to: email,
    subject: 'Pro-Trans - Réinitialisation de votre mot de passe',
    html,
    text: `Vous avez demandé à réinitialiser votre mot de passe. Veuillez cliquer sur ce lien pour en créer un nouveau : ${resetLink}`
  });
};

/**
 * Envoyer une notification de nouveau devis
 * @param {string} email - Adresse email du destinataire
 * @param {string} name - Prénom du destinataire
 * @param {Object} annonce - Informations sur l'annonce
 * @param {Object} devis - Informations sur le devis
 * @param {Object} transporteur - Informations sur le transporteur
 * @returns {Promise} - Promesse résolue avec les informations d'envoi
 */
exports.sendNewQuoteEmail = async (email, name, annonce, devis, transporteur) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://pro-trans.com/logo.png" alt="Pro-Trans Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #0f766e;">Vous avez reçu un nouveau devis !</h2>
      <p>Bonjour ${name},</p>
      <p>Bonne nouvelle ! Vous avez reçu un nouveau devis pour votre annonce "${annonce.titre}".</p>
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Détails du devis</h3>
        <p><strong>Transporteur :</strong> ${transporteur.prenom} ${transporteur.nom}</p>
        <p><strong>Montant :</strong> ${devis.montant} DH</p>
        <p><strong>Délai de livraison :</strong> ${new Date(devis.delaiLivraison).toLocaleDateString('fr-FR')}</p>
        <p><strong>Message :</strong> ${devis.message}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://pro-trans.com/dashboard/annonces/${annonce._id}" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Voir le devis</a>
      </div>
      <p>N'oubliez pas de comparer les différentes offres avant de faire votre choix !</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} Pro-Trans. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await exports.sendEmail({
    to: email,
    subject: `Pro-Trans - Nouveau devis pour votre annonce "${annonce.titre}"`,
    html,
    text: `Bonjour ${name}, vous avez reçu un nouveau devis de ${transporteur.prenom} ${transporteur.nom} pour votre annonce "${annonce.titre}". Montant : ${devis.montant} DH. Délai de livraison : ${new Date(devis.delaiLivraison).toLocaleDateString('fr-FR')}. Connectez-vous à votre compte pour voir les détails.`
  });
};

/**
 * Envoyer une notification de devis accepté
 * @param {string} email - Adresse email du destinataire
 * @param {string} name - Prénom du destinataire
 * @param {Object} annonce - Informations sur l'annonce
 * @param {Object} devis - Informations sur le devis
 * @param {Object} client - Informations sur le client
 * @returns {Promise} - Promesse résolue avec les informations d'envoi
 */
exports.sendQuoteAcceptedEmail = async (email, name, annonce, devis, client) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://pro-trans.com/logo.png" alt="Pro-Trans Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #0f766e;">Votre devis a été accepté !</h2>
      <p>Bonjour ${name},</p>
      <p>Félicitations ! ${client.prenom} ${client.nom} a accepté votre devis pour l'annonce "${annonce.titre}".</p>
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Détails du transport</h3>
        <p><strong>Annonce :</strong> ${annonce.titre}</p>
        <p><strong>De :</strong> ${annonce.villeDepart}</p>
        <p><strong>À :</strong> ${annonce.villeArrivee}</p>
        <p><strong>Date de départ :</strong> ${new Date(annonce.dateDepart).toLocaleDateString('fr-FR')}</p>
        <p><strong>Montant :</strong> ${devis.montant} DH</p>
        <p><strong>Délai de livraison prévu :</strong> ${new Date(devis.delaiLivraison).toLocaleDateString('fr-FR')}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://pro-trans.com/dashboard/devis/${devis._id}" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Voir les détails</a>
      </div>
      <p>Vous pouvez dès maintenant contacter le client pour organiser le transport.</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} Pro-Trans. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await exports.sendEmail({
    to: email,
    subject: `Pro-Trans - Votre devis a été accepté pour "${annonce.titre}"`,
    html,
    text: `Bonjour ${name}, ${client.prenom} ${client.nom} a accepté votre devis pour l'annonce "${annonce.titre}". Connectez-vous à votre compte pour voir les détails et organiser le transport.`
  });
};

/**
 * Envoyer une notification de paiement réussi
 * @param {string} email - Adresse email du destinataire
 * @param {string} name - Prénom du destinataire
 * @param {Object} annonce - Informations sur l'annonce
 * @param {Object} payment - Informations sur le paiement
 * @returns {Promise} - Promesse résolue avec les informations d'envoi
 */
exports.sendPaymentConfirmationEmail = async (email, name, annonce, payment) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://pro-trans.com/logo.png" alt="Pro-Trans Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #0f766e;">Confirmation de paiement</h2>
      <p>Bonjour ${name},</p>
      <p>Nous vous confirmons que votre paiement pour l'annonce "${annonce.titre}" a bien été reçu et traité.</p>
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Détails du paiement</h3>
        <p><strong>Montant :</strong> ${payment.amount} DH</p>
        <p><strong>Date :</strong> ${new Date(payment.date).toLocaleDateString('fr-FR')}</p>
        <p><strong>Référence :</strong> ${payment.reference}</p>
        <p><strong>Moyen de paiement :</strong> ${payment.method === 'card' ? 'Carte bancaire' : payment.method === 'virement' ? 'Virement bancaire' : 'PayPal'}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://pro-trans.com/dashboard/factures/${payment.invoiceId}" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Voir la facture</a>
      </div>
      <p>Vous recevrez bientôt des informations sur le suivi de votre transport.</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} Pro-Trans. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await exports.sendEmail({
    to: email,
    subject: 'Pro-Trans - Confirmation de paiement',
    html,
    text: `Bonjour ${name}, nous vous confirmons que votre paiement de ${payment.amount} DH pour l'annonce "${annonce.titre}" a bien été reçu et traité. Référence : ${payment.reference}.`
  });
};

/**
 * Envoyer une mise à jour de suivi
 * @param {string} email - Adresse email du destinataire
 * @param {string} name - Prénom du destinataire
 * @param {string} trackingCode - Code de suivi
 * @param {string} annonceTitle - Titre de l'annonce
 * @param {string} status - Statut du suivi
 * @param {string} message - Message complémentaire
 * @returns {Promise} - Promesse résolue avec les informations d'envoi
 */
exports.sendTrackingUpdateEmail = async (email, name, trackingCode, annonceTitle, status, message) => {
  // Traduction du statut pour l'affichage
  const statusLabels = {
    en_attente: 'En attente de prise en charge',
    pris_en_charge: 'Pris en charge',
    en_transit: 'En transit',
    en_livraison: 'En cours de livraison',
    livre: 'Livré',
    probleme: 'Problème signalé'
  };

  // Couleur en fonction du statut
  const statusColors = {
    en_attente: '#f59e0b',     // Amber
    pris_en_charge: '#3b82f6',  // Blue
    en_transit: '#6366f1',     // Indigo
    en_livraison: '#8b5cf6',   // Purple
    livre: '#10b981',          // Green
    probleme: '#ef4444'        // Red
  };

  const statusLabel = statusLabels[status] || status;
  const statusColor = statusColors[status] || '#6b7280';  // Gray default

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://pro-trans.com/logo.png" alt="Pro-Trans Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #0f766e;">Mise à jour de votre transport</h2>
      <p>Bonjour ${name},</p>
      <p>Voici une mise à jour concernant votre transport "${annonceTitle}" :</p>
      <div style="background-color: ${statusColor}; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <h3 style="margin: 0; font-size: 20px;">${statusLabel}</h3>
      </div>
      ${message ? `<p><strong>Message du transporteur :</strong> ${message}</p>` : ''}
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://pro-trans.com/tracking/${trackingCode}" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Suivre mon transport</a>
      </div>
      <p>Code de suivi : <strong>${trackingCode}</strong></p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} Pro-Trans. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await exports.sendEmail({
    to: email,
    subject: `Pro-Trans - Mise à jour de votre transport ${statusLabel}`,
    html,
    text: `Bonjour ${name}, votre transport "${annonceTitle}" est maintenant ${statusLabel.toLowerCase()}. ${message ? 'Message du transporteur : ' + message : ''} Code de suivi : ${trackingCode}`
  });
};

/**
 * Envoyer une demande d'avis
 * @param {string} email - Adresse email du destinataire
 * @param {string} name - Prénom du destinataire
 * @param {Object} annonce - Informations sur l'annonce
 * @param {Object} transporteur - Informations sur le transporteur
 * @returns {Promise} - Promesse résolue avec les informations d'envoi
 */
exports.sendReviewRequestEmail = async (email, name, annonce, transporteur) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://pro-trans.com/logo.png" alt="Pro-Trans Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #0f766e;">Comment s'est passé votre transport ?</h2>
      <p>Bonjour ${name},</p>
      <p>Votre transport "${annonce.titre}" avec ${transporteur.prenom} ${transporteur.nom} a été livré.</p>
      <p>Pourriez-vous prendre un moment pour laisser un avis sur votre expérience ? Cela aidera d'autres utilisateurs et contribuera à améliorer notre service.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://pro-trans.com/dashboard/avis/create/${transporteur._id}/${annonce._id}" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Laisser un avis</a>
      </div>
      <p>Merci pour votre confiance et à bientôt sur Pro-Trans !</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} Pro-Trans. Tous droits réservés.</p>
      </div>
    </div>
  `;

  return await exports.sendEmail({
    to: email,
    subject: 'Pro-Trans - Comment s\'est passé votre transport ?',
    html,
    text: `Bonjour ${name}, votre transport "${annonce.titre}" avec ${transporteur.prenom} ${transporteur.nom} a été livré. Pourriez-vous prendre un moment pour laisser un avis sur votre expérience ? Connectez-vous à votre compte pour laisser un avis.`
  });
};