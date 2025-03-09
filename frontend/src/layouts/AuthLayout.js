import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Layout pour les pages d'authentification
 */
const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img 
            className="mx-auto h-16 w-auto" 
            src="/assets/images/logo.png" 
            alt="Pro-Trans Logo" 
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Connexion à votre compte
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet context={[isAuthenticated]} />
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-600">
        <Link to="/" className="font-medium text-teal-600 hover:text-teal-500">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default AuthLayout;