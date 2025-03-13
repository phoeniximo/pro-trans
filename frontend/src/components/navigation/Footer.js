// src/components/navigation/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TruckIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaWhatsapp 
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      {/* Section principale du footer */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et à propos */}
          <div>
            <div className="flex items-center">
              <TruckIcon className="h-8 w-8 text-teal-400" />
              <h2 className="ml-2 text-xl font-bold text-white">Pro-Trans</h2>
            </div>
            <p className="mt-4 text-gray-300 text-sm">
              Pro-Trans est la plateforme de référence au Maroc pour connecter les clients ayant besoin de transporter leurs biens avec des transporteurs professionnels.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-teal-400">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-teal-400">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-teal-400">
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-teal-400">
                <FaLinkedin size={20} />
              </a>
              <a href="https://wa.me/212612345678" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-400 hover:text-teal-400">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Accueil
                </Link>
              </li>
              <li>
                <Link to="/transporteurs" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Trouver un transporteur
                </Link>
              </li>
              <li>
                <Link to="/annonces/create" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Publier une annonce
                </Link>
              </li>
              <li>
                <Link to="/annonces" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Annonces de transport
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Devenir transporteur
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> À propos de nous
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Nos services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services/demenagement" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Déménagement
                </Link>
              </li>
              <li>
                <Link to="/services/transport-meubles" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Transport de meubles
                </Link>
              </li>
              <li>
                <Link to="/services/transport-colis" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Transport de colis
                </Link>
              </li>
              <li>
                <Link to="/services/transport-marchandises" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Transport de marchandises
                </Link>
              </li>
              <li>
                <Link to="/services/transport-vehicules" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Transport de véhicules
                </Link>
              </li>
              <li>
                <Link to="/services/transport-international" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Transport international
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <span className="ml-3 text-gray-300">
                  123 Boulevard Mohammed V, Casablanca 20250, Maroc
                </span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-teal-400 flex-shrink-0" />
                <span className="ml-3 text-gray-300">+212 5 22 12 34 56</span>
              </li>
              <li className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-teal-400 flex-shrink-0" />
                <span className="ml-3 text-gray-300">contact@pro-trans.ma</span>
              </li>
              <li className="flex items-center">
                <ClockIcon className="h-5 w-5 text-teal-400 flex-shrink-0" />
                <span className="ml-3 text-gray-300">
                  Lun - Ven: 9h00 - 18h00<br />
                  Sam: 9h00 - 13h00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barre d'informations */}
      <div className="bg-gray-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap justify-center mb-4 md:mb-0 space-x-4">
              <Link to="/cgu" className="text-sm text-gray-400 hover:text-teal-400 transition-colors flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                Conditions d'utilisation
              </Link>
              <Link to="/confidentialite" className="text-sm text-gray-400 hover:text-teal-400 transition-colors flex items-center">
                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                Politique de confidentialité
              </Link>
              <Link to="/paiement" className="text-sm text-gray-400 hover:text-teal-400 transition-colors flex items-center">
                <CreditCardIcon className="h-4 w-4 mr-1" />
                Méthodes de paiement
              </Link>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Pro-Trans. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;