// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');

// Import des routes
const authRoutes = require('./src/routes/authRoutes');
const annonceRoutes = require('./src/routes/annonceRoutes');
const userRoutes = require('./src/routes/userRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const devisRoutes = require('./src/routes/devisRoutes');
const avisRoutes = require('./src/routes/avisRoutes');

// Configuration Express
const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connexion à MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/annonces', annonceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/avis', avisRoutes);

// Route racine
app.get('/', (req, res) => {
  res.send('API Pro-Trans fonctionnelle');
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});