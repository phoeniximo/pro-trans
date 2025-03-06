import { useState, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook personnalisé pour gérer les téléchargements de fichiers
 * @returns {Object} Fonctions et états pour gérer les téléchargements
 */
export const useUpload = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  /**
   * Télécharge un ou plusieurs fichiers
   * @param {string} url - URL pour le téléchargement
   * @param {FileList|File[]} files - Fichiers à télécharger
   * @param {Object} additionalData - Données supplémentaires à envoyer avec les fichiers
   * @param {string} fileFieldName - Nom du champ pour les fichiers (défaut: 'file')
   * @returns {Promise} Promesse résolue avec les données de la réponse
   */
  const uploadFiles = useCallback(async ({
    url,
    files,
    additionalData = {},
    fileFieldName = 'file'
  }) => {
    setLoading(true);
    setProgress(0);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Ajouter les fichiers au FormData
      if (files instanceof FileList || Array.isArray(files)) {
        Array.from(files).forEach((file, index) => {
          formData.append(`${fileFieldName}${files.length > 1 ? `[${index}]` : ''}`, file);
        });
      } else if (files instanceof File) {
        formData.append(fileFieldName, files);
      } else {
        throw new Error('Le paramètre files doit être un File, un FileList ou un tableau de File');
      }
      
      // Ajouter les données supplémentaires
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Configurer la requête avec progression
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      
      // Mettre à jour l'état des fichiers téléchargés
      const newUploadedFiles = response.data?.data?.files || response.data?.data || [];
      setUploadedFiles(prevFiles => [...prevFiles, ...newUploadedFiles]);
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      
      // Extraire le message d'erreur
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du téléchargement';
      setError(errorMessage);
      
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Réinitialise l'état du hook
   */
  const resetUpload = useCallback(() => {
    setLoading(false);
    setProgress(0);
    setError(null);
    setUploadedFiles([]);
  }, []);

  return {
    loading,
    progress,
    error,
    uploadedFiles,
    uploadFiles,
    resetUpload
  };
};