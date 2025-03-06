// backend/src/utils/fileUpload.js
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Assure que le répertoire d'upload existe
 * @param {string} dir - Chemin du répertoire
 */
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Génère un nom de fichier unique
 * @param {string} originalName - Nom original du fichier
 * @returns {string} Nom de fichier unique
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  return `${timestamp}-${randomString}${extension}`;
};

/**
 * Sauvegarde un fichier dans le dossier spécifié
 * @param {Object} file - Objet fichier
 * @param {string} directory - Répertoire de destination
 * @param {string} prefix - Préfixe pour le nom du fichier (optionnel)
 * @returns {Promise<string>} Chemin relatif du fichier sauvegardé
 */
const saveFile = async (file, directory, prefix = '') => {
  // Vérifier si le fichier existe
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  // Créer le répertoire s'il n'existe pas
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', directory);
  ensureDirectoryExists(uploadDir);

  // Générer un nom de fichier unique
  const fileName = prefix 
    ? `${prefix}-${generateUniqueFilename(file.name)}`
    : generateUniqueFilename(file.name);
  const filePath = path.join(uploadDir, fileName);

  // Déplacer le fichier
  await file.mv(filePath);

  // Retourner le chemin relatif du fichier pour le stockage en DB
  return `/uploads/${directory}/${fileName}`;
};

/**
 * Supprime un fichier du système de fichiers
 * @param {string} filePath - Chemin du fichier à supprimer
 * @returns {Promise<boolean>} True si le fichier a été supprimé, False sinon
 */
const deleteFile = async (filePath) => {
  if (!filePath) {
    return false;
  }

  // Transformer le chemin relatif en chemin absolu
  const absolutePath = path.join(__dirname, '..', '..', filePath.replace('/uploads/', 'uploads/'));

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    return false;
  }
};

module.exports = {
  saveFile,
  deleteFile,
  generateUniqueFilename,
  ensureDirectoryExists
};