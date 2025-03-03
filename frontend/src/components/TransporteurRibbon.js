'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TransporteurRibbon() {
  const [transporteurs, setTransporteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransporteurs();
  }, []);

  const fetchTransporteurs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/transporteurs');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des transporteurs');
      }
      const data = await response.json();
      setTransporteurs(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les transporteurs');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (note) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`text-xl ${index < Math.round(note) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des transporteurs...</div>;
  }

  if (error) {
    return null; // Ne rien afficher en cas d'erreur
  }

  if (transporteurs.length === 0) {
    return null; // Ne rien afficher s'il n'y a pas de transporteurs
  }

  return (
    <div className="my-12 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Nos Transporteurs de Confiance</h2>
      <div className="relative">
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-6 min-w-full">
            {transporteurs.map((transporteur) => (
              <div key={transporteur._id} className="flex-none w-72">
                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {transporteur.nom.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{transporteur.nom}</h3>
                      <p className="text-sm text-gray-600">{transporteur.entreprise || 'Transporteur indépendant'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      {renderStars(transporteur.note)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({transporteur.nombreAvis} avis)
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Basé à {transporteur.ville}
                    </p>
                    <p className="mt-2 font-medium text-blue-600">
                      Note: {transporteur.note.toFixed(1)}/5
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link 
                      href={`/users/${transporteur._id}`}
                      className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      Voir le profil
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Indicateurs de défilement (optionnels) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <button className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <button className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}