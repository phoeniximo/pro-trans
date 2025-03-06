// backend/src/utils/security.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Génère un mot de passe aléatoire
 * @param {number} length - Longueur du mot de passe
 * @returns {string} - Mot de passe généré
 */
const generateRandomPassword = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Génère un token d'authentification JWT
 * @param {string} userId - ID de l'utilisateur
 * @param {string} [secret] - Secret JWT (utilise la variable d'environnement par défaut)
 * @param {string} [expiresIn] - Durée de validité (utilise la variable d'environnement par défaut)
 * @returns {string} - Token JWT
 */
const generateJwtToken = (userId, secret = process.env.JWT_SECRET, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * Vérifie un token JWT
 * @param {string} token - Token JWT à vérifier
 * @param {string} [secret] - Secret JWT (utilise la variable d'environnement par défaut)
 * @returns {Object} - Payload décodé si le token est valide
 * @throws {Error} - Si le token est invalide ou expiré
 */
const verifyJwtToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

/**
 * Hache un mot de passe
 * @param {string} password - Mot de passe à hacher
 * @param {number} [salt=10] - Niveau de salage
 * @returns {Promise<string>} - Mot de passe haché
 */
const hashPassword = async (password, salt = 10) => {
  return await bcrypt.hash(password, salt);
};

/**
 * Compare un mot de passe avec sa version hachée
 * @param {string} password - Mot de passe à vérifier
 * @param {string} hashedPassword - Mot de passe haché
 * @returns {Promise<boolean>} - True si les mots de passe correspondent
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Génère un token cryptographique aléatoire
 * @param {number} [byteLength=32] - Longueur du token en bytes
 * @returns {string} - Token en hexadécimal
 */
const generateToken = (byteLength = 32) => {
  return crypto.randomBytes(byteLength).toString('hex');
};

/**
 * Hache une valeur avec SHA-256
 * @param {string} value - Valeur à hacher
 * @returns {string} - Valeur hachée (hexadécimal)
 */
const hashValue = (value) => {
  return crypto.createHash('sha256').update(value).digest('hex');
};

module.exports = {
  generateRandomPassword,
  generateJwtToken,
  verifyJwtToken,
  hashPassword,
  comparePassword,
  generateToken,
  hashValue
};