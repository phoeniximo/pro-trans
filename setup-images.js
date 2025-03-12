// Ce script peut être exécuté avec Node.js pour créer les dossiers et fichiers nécessaires
// Enregistrez-le dans un fichier setup-images.js et exécutez-le avec node setup-images.js

const fs = require('fs');
const path = require('path');

// Chemins des dossiers à créer
const directories = [
  './frontend/public/images',
  './backend/uploads',
  './backend/uploads/profile',
  './backend/uploads/documents'
];

// Création des dossiers s'ils n'existent pas
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Dossier créé: ${dir}`);
  } else {
    console.log(`Le dossier existe déjà: ${dir}`);
  }
});

// Créer une image par défaut simple
const createDefaultImage = (filePath) => {
  // Contenu SVG d'une image par défaut simple
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#EEEEEE"/>
    <text x="100" y="100" font-family="Arial" font-size="14" fill="#888888" text-anchor="middle">Image par défaut</text>
  </svg>`;
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Image créée: ${filePath}`);
};

// Créer les images nécessaires
createDefaultImage('./frontend/public/images/default.jpg');
createDefaultImage('./frontend/public/images/transport-colis.jpg');

console.log('Installation terminée!');