// backend/src/utils/sendEmail.js
const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Configuration du transporteur d'emails
 */
let transporter;

/**
 * Initialise le transporteur d'emails
 */
const initEmailTransporter = () => {
  // Configurer le transporteur une seule fois
  if (transporter) return;

  // Créer un transporteur SMTP
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Vérifier la configuration
  if (process.env.NODE_ENV === 'development') {
    transporter.verify((error, success) => {
      if (error) {
        logger.error('Erreur lors de la configuration du service d\'email:', error);
      } else {
        logger.info('Service d\'email configuré avec succès');
      }
    });
  }
};

/**
 * Envoie un email
 * @param {Object} options - Options de l'email
 * @param {string} options.to - Destinataire
 * @param {string} options.subject - Sujet
 * @param {string} options.html - Contenu HTML
 * @param {string} [options.text] - Contenu texte (facultatif)
 * @param {Array} [options.attachments] - Pièces jointes (facultatif)
 * @param {string} [options.from] - Expéditeur (facultatif, utilise la valeur par défaut si non spécifié)
 * @param {string} [options.cc] - Copie carbone (facultatif)
 * @param {string} [options.bcc] - Copie carbone cachée (facultatif)
 * @returns {Promise<Object>} - Informations sur l'envoi de l'email
 */
const sendEmail = async (options) => {
  // Initialiser le transporteur s'il n'est pas déjà configuré
  initEmailTransporter();

  // Vérifier que les champs obligatoires sont présents
  if (!options.to || !options.subject || (!options.html && !options.text)) {
    throw new Error('Destinataire, sujet et contenu (html ou text) sont obligatoires');
  }

  // Configurer les options d'envoi
  const mailOptions = {
    from: options.from || `${process.env.EMAIL_FROM_NAME || 'Pro-Trans'} <${process.env.EMAIL_FROM || 'noreply@pro-trans.fr'}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || '',
  };

  // Ajouter les champs optionnels s'ils sont présents
  if (options.cc) mailOptions.cc = options.cc;
  if (options.bcc) mailOptions.bcc = options.bcc;
  if (options.attachments) mailOptions.attachments = options.attachments;

  try {
    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email envoyé: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

module.exports = sendEmail;