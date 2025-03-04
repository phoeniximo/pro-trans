// backend/src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pro-trans', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`📊 MongoDB connectée: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;