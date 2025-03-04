import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Composant ProtectedRoute pour protéger les routes nécessitant une authentification
 * @param {boolean} isAuthenticated - Utilisateur authentifié ou non
 * @param {Array} roles - Rôles autorisés pour accéder à la route
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {ReactNode} children - Contenu de la route
 */
const ProtectedRoute = ({ 
  isAuthenticated, 
  roles = [], 
  userRole,
  children 
}) => {
  const location = useLocation();
  
  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Si des rôles sont spécifiés et que l'utilisateur n'a pas le rôle requis
  if (roles.length > 0 && !roles.includes(userRole)) {
    // Rediriger vers le tableau de bord avec un message d'accès refusé
    return <Navigate to="/dashboard" state={{ 
      accessDenied: true, 
      message: "Vous n'avez pas les permissions nécessaires pour accéder à cette page." 
    }} replace />;
  }
  
  // Si l'utilisateur est authentifié et a les permissions nécessaires
  return children;
};

export default ProtectedRoute;