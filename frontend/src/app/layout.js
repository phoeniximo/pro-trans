// frontend/src/app/layout.js
'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-8">
                  <Link href="/" className="text-xl font-bold text-blue-600">
                    Transport Annonces
                  </Link>
                  <Link href="/annonces" className="text-gray-700 hover:text-blue-600">
                    Annonces
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  {isLoggedIn ? (
                    <>
                      <Link href="/messages" className="text-gray-700 hover:text-blue-600">
                        Messages
                      </Link>
                      <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                        Tableau de bord
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="text-gray-700 hover:text-blue-600">
                        Connexion
                      </Link>
                      <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Inscription
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}