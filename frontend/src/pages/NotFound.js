import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="text-teal-600 text-8xl font-bold mb-4">404</div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Page introuvable
        </h1>
        
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button
              type="button"
              variant="primary"
              className="inline-flex items-center"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          
          <Link to="/contact">
            <Button
              type="button"
              variant="outline"
            >
              Nous contacter
            </Button>
          </Link>
        </div>
        
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Liens utiles
          </h2>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link to="/" className="text-teal-600 hover:text-teal-800">
              Accueil
            </Link>
            <Link to="/login" className="text-teal-600 hover:text-teal-800">
              Connexion
            </Link>
            <Link to="/register" className="text-teal-600 hover:text-teal-800">
              Inscription
            </Link>
            <Link to="/a-propos" className="text-teal-600 hover:text-teal-800">
              À propos
            </Link>
            <Link to="/contact" className="text-teal-600 hover:text-teal-800">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;