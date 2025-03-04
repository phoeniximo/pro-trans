// src/components/navigation/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Pro-Trans</h2>
            <p className="mt-2 text-gray-300">Transport et livraison</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Liens rapides</h3>
            <ul>
              <li><Link to="/" className="text-gray-300 hover:text-white">Accueil</Link></li>
              <li><Link to="/a-propos" className="text-gray-300 hover:text-white">À propos</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Pro-Trans. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;