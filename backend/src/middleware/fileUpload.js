// backend/src/middleware/fileUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configuration du stockage avec Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    // Déterminer le répertoire de destination en fonction du type de fichier
    if (file.fieldname === 'photo') {
      uploadPath = path.join(__dirname, '../../uploads/profile');
    } else if (file.fieldname.includes('document')) {
      uploadPath = path.join(__dirname, '../../uploads/documents', req.user.id);
    } else if (file.fieldname === 'pieceJointe') {
      uploadPath = path.join(__dirname, '../../uploads/messages');
    } else if (file.fieldname.includes('image') || file.fieldname.includes('photo')) {
      uploadPath = path.join(__dirname, '../../uploads/annonces', req.body.annonceId || 'temp');
    } else {
      uploadPath = path.join(__dirname, '../../uploads/others');
    }
    
    // Créer le répertoire s'il n'existe pas
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// Filtre pour limiter les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  // Types MIME autorisés
  const allowedMimeTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  };
  
  // Vérifier si le type MIME du fichier est autorisé
  if (file.fieldname === 'photo' && allowedMimeTypes.image.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname.includes('document') && allowedMimeTypes.document.includes(file.mimetype)) {
    cb(null, true);
  } else if (allowedMimeTypes.all.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non pris en charge. Veuillez télécharger une image ou un document.'), false);
  }
};

// Configuration de l'upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

module.exports = upload;