const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importe le module CORS
const fileUpload = require('express-fileupload');
const path = require('path');
const annonceRoutes = require('./routes/annonceRoutes');

const app = express();

// Middleware CORS
app.use(cors({
  origin: 'http://localhost:3000', // Remplace par l'URL de ton frontend
  credentials: true,
}));

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour l'upload de fichiers
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
  createParentPath: true
}));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/annonces', annonceRoutes);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/transport-annonces', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connecté à MongoDB'))
.catch((err) => console.error('Erreur de connexion à MongoDB:', err));

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));