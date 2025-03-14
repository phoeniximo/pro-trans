// src/components/navigation/Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TruckIcon, 
  UserIcon, 
  PhoneIcon, 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import NotificationCenter from '../notifications/NotificationCenter';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Vérifier quelle page est active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo et navigation principale */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <TruckIcon className="h-8 w-8 text-teal-600" />
              <span className="ml-2 font-bold text-xl text-teal-800">Pro-Trans</span>
            </Link>
            
            {/* Navigation desktop */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link to="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/') ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <HomeIcon className="mr-1 h-5 w-5" />
                Accueil
              </Link>
              <Link to="/transporteurs" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/transporteurs') ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <TruckIcon className="mr-1 h-5 w-5" />
                Transporteurs
              </Link>
              <Link to="/annonces" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/annonces') ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <InformationCircleIcon className="mr-1 h-5 w-5" />
                Annonces
              </Link>
              <Link to="/a-propos" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/a-propos') ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <QuestionMarkCircleIcon className="mr-1 h-5 w-5" />
                À propos
              </Link>
              <Link to="/contact" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/contact') ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <EnvelopeIcon className="mr-1 h-5 w-5" />
                Contact
              </Link>
            </nav>
          </div>
          
          {/* Boutons de connexion/inscription ou interface utilisateur connecté */}
          <div className="hidden md:flex md:items-center space-x-4">
            {user ? (
              <>
                <NotificationCenter />
                <Link to="/dashboard" className="text-gray-600 hover:text-teal-600 flex items-center">
                  <UserIcon className="mr-1 h-5 w-5" />
                  <span>Tableau de bord</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="mr-4 inline-flex items-center text-base font-medium text-teal-600 hover:text-teal-700 transition-colors">
                  <UserIcon className="mr-1 h-5 w-5" />
                  Connexion
                </Link>
                <Link to="/register" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
                  Inscription
                </Link>
              </>
            )}
          </div>
          
          {/* Bouton menu mobile */}
          <div className="flex items-center md:hidden">
            {user && <NotificationCenter />}
            <button
              type="button"
              className="bg-white ml-2 p-2 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className={`${isActive('/') ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Accueil
            </Link>
            <Link to="/transporteurs" className={`${isActive('/transporteurs') ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Transporteurs
            </Link>
            <Link to="/annonces" className={`${isActive('/annonces') ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Annonces
            </Link>
            <Link to="/a-propos" className={`${isActive('/a-propos') ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              À propos
            </Link>
            <Link to="/contact" className={`${isActive('/contact') ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Contact
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.name || 'Utilisateur'}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link to="/dashboard" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Tableau de bord
                  </Link>
                  <Link to="/dashboard/notifications" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Notifications
                  </Link>
                  <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Mon profil
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">Espace utilisateur</div>
                    <div className="text-sm font-medium text-gray-500">Connexion ou inscription</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link to="/login" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Connexion
                  </Link>
                  <Link to="/register" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Inscription
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Bannière d'information */}
      <div className="bg-teal-600 text-white px-4 py-1 text-center text-sm hidden md:block">
        <div className="flex justify-center items-center">
          <PhoneIcon className="h-4 w-4 mr-1" />
          <span>Besoin d'aide ? Contactez-nous au 06 12 34 56 78</span>
        </div>
      </div>
    </header>
  );
};

export default Header;