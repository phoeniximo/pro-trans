// backend/src/config/database.js
const mongoose = require('mongoose');

// URI MongoDB Atlas fournie
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://phxsimo1:IJXQ2j1CuL9MQs5z@cluster0.nt4er.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
    try {
        // Options de connexion mises à jour (certaines options sont désormais obsolètes)
        const options = {
            // useNewUrlParser et useUnifiedTopology sont désormais par défaut à true
            // et ne sont plus nécessaires en tant qu'options explicites
        };

        const conn = await mongoose.connect(MONGODB_URI, options);
        console.log(`📊 MongoDB connectée: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
        // Afficher plus de détails pour faciliter le débogage
        if (error.name === 'MongoServerSelectionError') {
            console.error('Vérifiez votre connexion internet ou les informations d\'identification MongoDB');
        }
        process.exit(1);
    }
};

module.exports = connectDB;