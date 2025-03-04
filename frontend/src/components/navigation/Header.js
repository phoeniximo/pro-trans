// src/components/navigation/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-teal-600">Pro-Trans</span>
            </Link>
          </div>
          <div className="flex items-center">
            <Link to="/login" className="mr-4 text-gray-600 hover:text-teal-600">
              Connexion
            </Link>
            <Link to="/register" className="bg-teal-600 text-white px-4 py-2 rounded-md">
              Inscription
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;