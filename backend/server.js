// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const requestLogger = require('./src/middleware/requestLogger');
const errorHandler = require('./src/middleware/errorHandler');

// Import des routes
const authRoutes = require('./src/routes/authRoutes');
const annonceRoutes = require('./src/routes/annonceRoutes');
const userRoutes = require('./src/routes/userRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const devisRoutes = require('./src/routes/devisRoutes');
const avisRoutes = require('./src/routes/avisRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Initialisation de l'application
const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration CORS modifiée
const allowedOrigins = ['http://localhost:3000', 'https://localhost:3001', 'http://localhost:3001'];
app.use(cors({
  origin: function(origin, callback) {
    // Permettre les requêtes sans origine (comme les appels API depuis Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Origine bloquée par CORS: ${origin}`);
      callback(null, false, new Error('Origine non autorisée par CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Route de test pour vérifier la connexion API
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API accessible' });
});

// Middleware pour les uploads de fichiers
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
  abortOnLimit: true,
  responseOnLimit: 'Le fichier est trop volumineux. La taille maximale est de 5MB.'
}));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logger de requêtes
app.use(requestLogger);

// Connexion à MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/annonces', annonceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Route racine
app.get('/', (req, res) => {
  res.send('API Pro-Trans fonctionnelle');
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrage serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

// Gestion de la fermeture propre du serveur
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  console.error('Erreur non gérée:', err);
  server.close(() => process.exit(1));
});

module.exports = app;