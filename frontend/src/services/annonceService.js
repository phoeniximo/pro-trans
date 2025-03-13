import apiClient from '../api/client';

// Fonction utilitaire pour construire les URLs correctes des images
const fixImagePath = (photoPath) => {
  if (!photoPath) return '/images/default.jpg';
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (photoPath.startsWith('http')) return photoPath;
  
  // Si c'est un chemin relatif qui commence par /uploads
  if (photoPath.startsWith('/uploads/')) {
    // Utiliser HTTP au lieu de HTTPS pour éviter les erreurs SSL
    return `http://localhost:5000${photoPath}`;
  }
  
  // Pour tout autre chemin, retourner tel quel
  return photoPath;
};

// Service pour la gestion des annonces
const annonceService = {
  // Fonction utilitaire exportée pour être utilisée ailleurs
  fixImagePath,

  // Récupérer toutes les annonces avec filtres optionnels
  getAnnonces: async (filters = {}) => {
    try {
      console.log("Appel API getAnnonces avec filtres:", filters);
      const response = await apiClient.get('/annonces', { params: filters });
      
      // Corriger les chemins d'images si nécessaire
      if (response.data && response.data.data) {
        response.data.data = response.data.data.map(annonce => {
          if (annonce.photos) {
            annonce.photos = annonce.photos.map(photo => fixImagePath(photo));
          }
          if (annonce.utilisateur && annonce.utilisateur.photo) {
            annonce.utilisateur.photo = fixImagePath(annonce.utilisateur.photo);
          }
          return annonce;
        });
      }
      
      return response.data;
    } catch (error) {
      console.error("Erreur dans getAnnonces:", error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des annonces' };
    }
  },

  // Récupérer une annonce par son ID
  getAnnonceById: async (id) => {
    try {
      // MODIFICATION: Cas spécial pour la route de création d'annonce
      if (id === 'create') {
        console.log('Détection de la route de création - pas de requête API nécessaire');
        return {
          data: {
            success: true,
            data: { isNew: true, mode: 'creation' }
          }
        };
      }
      
      console.log(`Récupération de l'annonce ${id}`);
      const response = await apiClient.get(`/annonces/${id}`);
      
      // Corriger les chemins d'images si l'annonce a des photos
      if (response.data && response.data.data) {
        if (response.data.data.photos) {
          response.data.data.photos = response.data.data.photos.map(photo => fixImagePath(photo));
        }
        
        // Si l'annonce a un utilisateur avec une photo, corriger aussi ce chemin
        if (response.data.data.utilisateur && response.data.data.utilisateur.photo) {
          response.data.data.utilisateur.photo = fixImagePath(response.data.data.utilisateur.photo);
        }
        
        // Correction des photos dans les devis si présents
        if (response.data.data.devis && Array.isArray(response.data.data.devis)) {
          response.data.data.devis = response.data.data.devis.map(devis => {
            if (devis.transporteur && devis.transporteur.photo) {
              devis.transporteur.photo = fixImagePath(devis.transporteur.photo);
            }
            return devis;
          });
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'annonce ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'annonce' };
    }
  },

  // Créer une nouvelle annonce
  createAnnonce: async (annonceData) => {
    try {
      // Préparation des données pour l'API
      // S'assurer que les valeurs numériques sont bien des nombres
      const cleanedData = {
        ...annonceData,
        poids: annonceData.poids !== undefined ? Number(annonceData.poids) : undefined,
        volume: annonceData.volume !== undefined ? Number(annonceData.volume) : undefined,
        budget: annonceData.budget !== undefined ? Number(annonceData.budget) : undefined,
        nombreColis: annonceData.nombreColis !== undefined ? Number(annonceData.nombreColis) : undefined
      };

      // Nettoyer les dimensions si présentes
      if (cleanedData.dimensions) {
        cleanedData.dimensions = {
          longueur: Number(cleanedData.dimensions.longueur) || 0,
          largeur: Number(cleanedData.dimensions.largeur) || 0,
          hauteur: Number(cleanedData.dimensions.hauteur) || 0,
          unite: cleanedData.dimensions.unite
        };
      }
      
      // Log des données envoyées en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('Création d\'annonce - données envoyées:', cleanedData);
      }
      
      console.log('Envoi de la requête POST /annonces');
      const response = await apiClient.post('/annonces', cleanedData);
      console.log('Réponse de création d\'annonce:', response.data);
      return response.data;
    } catch (error) {
      // Log détaillé des erreurs pour faciliter le débogage
      console.error('Erreur détaillée lors de la création:', error);
      if (error.response) {
        console.error('Réponse d\'erreur du serveur:', error.response.data);
        console.error('Statut d\'erreur:', error.response.status);
      }
      
      // Amélioration de la gestion des erreurs de validation
      if (error.response?.data) {
        console.error('Erreurs de validation complètes:', error.response.data);
        throw error.response.data;
      } else {
        throw { message: 'Erreur lors de la création de l\'annonce' };
      }
    }
  },

  // Mettre à jour une annonce existante
  updateAnnonce: async (id, annonceData) => {
    try {
      console.log(`Mise à jour de l'annonce ${id}:`, annonceData);
      const response = await apiClient.put(`/annonces/${id}`, annonceData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'annonce ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'annonce' };
    }
  },

  // Supprimer une annonce
  deleteAnnonce: async (id) => {
    try {
      console.log(`Suppression de l'annonce ${id}`);
      const response = await apiClient.delete(`/annonces/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'annonce ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la suppression de l\'annonce' };
    }
  },

  // Récupérer les annonces de l'utilisateur connecté
  getMesAnnonces: async (filters = {}) => {
    try {
      console.log('Récupération de mes annonces avec filtres:', filters);
      const response = await apiClient.get('/annonces/user/mes-annonces', { params: filters });
      console.log('Réponse de getMesAnnonces:', response);
      
      // Corriger les chemins d'images si nécessaire
      if (response.data && response.data.data) {
        response.data.data = response.data.data.map(annonce => {
          if (annonce.photos) {
            annonce.photos = annonce.photos.map(photo => fixImagePath(photo));
          }
          return annonce;
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur détaillée lors de getMesAnnonces:', error);
      
      // Logs détaillés pour le débogage
      if (error.response) {
        console.error('Statut d\'erreur getMesAnnonces:', error.response.status);
        console.error('Données d\'erreur getMesAnnonces:', error.response.data);
      } else if (error.request) {
        console.error('Pas de réponse du serveur pour getMesAnnonces:', error.request);
      } else {
        console.error('Erreur de configuration pour getMesAnnonces:', error.message);
      }
      
      throw error.response?.data || { message: 'Erreur lors de la récupération de vos annonces' };
    }
  },

  // Uploader des images pour une annonce - FONCTION AMÉLIORÉE
  uploadImages: async (id, formData) => {
    try {
      console.log(`Upload d'images pour l'annonce ${id}`);
      
      // Essayer différents chemins d'API possibles
      let response;
      const possibleEndpoints = [
        `/annonces/${id}/upload`,
        `/annonces/${id}/images`,
        `/upload/annonces/${id}`
      ];
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Tentative d'upload sur ${endpoint}`);
          response = await apiClient.post(endpoint, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          // Si on arrive ici, la requête a réussi
          console.log(`Upload réussi sur ${endpoint}`);
          return response.data;
        } catch (endpointError) {
          console.log(`Échec sur ${endpoint} (${endpointError.response?.status || 'erreur'})`);
          // Continuer avec le prochain endpoint
        }
      }
      
      // Si on arrive ici, aucun endpoint n'a fonctionné
      console.error(`Aucun endpoint d'upload d'images n'a fonctionné pour l'annonce ${id}`);
      return { success: false, message: "L'annonce a été créée mais l'upload des photos a échoué" };
      
    } catch (error) {
      console.error(`Erreur lors de l'upload d'images pour l'annonce ${id}:`, error);
      // Ne pas bloquer le processus, retourner un message d'erreur
      return { success: false, message: 'Erreur lors du téléchargement des images, mais l\'annonce a été créée' };
    }
  },
};

export default annonceService;