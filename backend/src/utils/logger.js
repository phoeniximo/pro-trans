// backend/src/utils/logger.js
const fs = require('fs');
const path = require('path');

/**
 * Système de journalisation simple
 */
class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'info';
    this.logToFile = options.logToFile || false;
    this.logDir = options.logDir || path.join(__dirname, '../../logs');
    
    // Créer le répertoire des logs s'il n'existe pas
    if (this.logToFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // Niveaux de journalisation
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4
    };
  }

  /**
   * Journalise un message
   * @param {string} level - Niveau de log
   * @param {string} message - Message à journaliser
   * @param {Object} meta - Métadonnées supplémentaires
   */
  log(level, message, meta = {}) {
    // Vérifier si le niveau de log est suffisant
    if (this.levels[level] > this.levels[this.logLevel]) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...meta
    };
    
    // Formater le message de log
    const formattedMessage = JSON.stringify(logData);
    
    // Afficher dans la console
    if (level === 'error') {
      console.error(formattedMessage);
    } else if (level === 'warn') {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
    
    // Enregistrer dans un fichier si activé
    if (this.logToFile) {
      const date = timestamp.split('T')[0];
      const logFile = path.join(this.logDir, `${date}.log`);
      
      fs.appendFileSync(logFile, formattedMessage + '\n');
    }
  }

  // Méthodes pour chaque niveau de log
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  http(message, meta = {}) {
    this.log('http', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
}

// Créer une instance par défaut
const logger = new Logger({
  logLevel: process.env.LOG_LEVEL || 'info',
  logToFile: process.env.NODE_ENV === 'production'
});

module.exports = logger;