// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const connectDB = require('./config/database');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const annonceRoutes = require('./routes/annonceRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const devisRoutes = require('./routes/devisRoutes');
const avisRoutes = require('./routes/avisRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Configuration Express
const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour l'upload de fichiers
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
  createParentPath: true
}));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/dashboard', dashboardRoutes);

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