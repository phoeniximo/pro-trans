import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';

// Création du contexte d'authentification
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Effet pour vérifier l'état d'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Vérifier si un token existe dans le localStorage
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (token) {
          // Vérifier si le token est valide
          try {
            const decoded = jwtDecode(token);
            
            // Vérifier si le token est expiré
            if (decoded.exp * 1000 < Date.now()) {
              // Token expiré - déconnexion
              logout();
              setError('Votre session a expiré. Veuillez vous reconnecter.');
            } else {
              // Token valide - récupérer les informations utilisateur depuis l'API
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
              setIsAuthenticated(true);
            }
          } catch (decodeError) {
            // Erreur de décodage - token invalide
            logout();
            setError('Session invalide. Veuillez vous reconnecter.');
          }
        } else if (storedUser) {
          // Si user existe mais pas de token - nettoyer le localStorage
          logout();
        }
      } catch (err) {
        console.error('Erreur d\'initialisation de l\'authentification:', err);
        logout();
        setError('Erreur de connexion au serveur.');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Méthode de connexion
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || 'Échec de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Méthode d'inscription
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || 'Échec de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Méthode de déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Méthode de mise à jour du profil utilisateur
  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Valeurs fournies par le contexte
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};