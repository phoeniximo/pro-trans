// backend/src/utils/geocode.js
const axios = require('axios');
const logger = require('./logger');

/**
 * Service de géocodage pour convertir des adresses en coordonnées
 */
class GeocodeService {
  constructor() {
    this.apiKey = process.env.GEOCODING_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    this.cache = new Map(); // Cache simple pour les résultats récents
  }

  /**
   * Convertit une adresse en coordonnées géographiques
   * @param {string} address - Adresse à géocoder
   * @returns {Promise<Object>} - Coordonnées {lat, lng} et informations supplémentaires
   */
  async geocode(address) {
    // Vérifier le cache
    const cacheKey = address.toLowerCase().trim();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      // Appeler l'API de géocodage
      const response = await axios.get(this.baseUrl, {
        params: {
          address,
          key: this.apiKey
        }
      });
      
      // Vérifier si la requête a réussi
      if (response.data.status !== 'OK') {
        logger.warn('Erreur de géocodage', { 
          address, 
          status: response.data.status,
          error: response.data.error_message 
        });
        return null;
      }
      
      // Extraire les données pertinentes
      const result = response.data.results[0];
      const { lat, lng } = result.geometry.location;
      
      // Extraire des informations complémentaires
      const components = {};
      result.address_components.forEach(component => {
        const type = component.types[0];
        components[type] = component.long_name;
      });
      
      // Créer l'objet de résultat
      const geocodeResult = {
        coordinates: { lat, lng },
        formattedAddress: result.formatted_address,
        components,
        placeId: result.place_id
      };
      
      // Stocker dans le cache
      this.cache.set(cacheKey, geocodeResult);
      
      return geocodeResult;
    } catch (error) {
      logger.error('Erreur lors du géocodage', { address, error: error.message });
      return null;
    }
  }

  /**
   * Calcule la distance entre deux points géographiques
   * @param {Object} point1 - Point de départ {lat, lng}
   * @param {Object} point2 - Point d'arrivée {lat, lng}
   * @returns {number} - Distance en kilomètres
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLng = this.deg2rad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance en km
    
    return parseFloat(distance.toFixed(2));
  }

  /**
   * Convertit des degrés en radians
   * @param {number} deg - Degrés
   * @returns {number} - Radians
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }
}

module.exports = new GeocodeService();