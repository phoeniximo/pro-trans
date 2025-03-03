'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TransporteurDashboard from '../../components/TransporteurDashboard';
import AnnonceurDashboard from '../../components/AnnonceurDashboard';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (!token || !userData) {
        router.push('/login');
        return;
      }
      setUser(JSON.parse(userData));
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center">
        <h2 className="text-xl font-semibold mb-4">Session expirée</h2>
        <p className="mb-4">Veuillez vous reconnecter pour accéder à votre tableau de bord.</p>
        <Link 
          href="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* En-tête du tableau de bord */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white rounded-t-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord</h1>
            <p className="mt-2">
              Bienvenue, {user.nom}
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-white/20 py-2 px-4 rounded-lg">
            <span className="font-semibold">{user.type === 'transporteur' ? 'Transporteur' : 'Particulier'}</span>
            {user.type === 'transporteur' && user.note > 0 && (
              <div className="flex items-center mt-1">
                {renderStars(user.note)}
                <span className="ml-2 text-sm">
                  ({user.nombreAvis} avis)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Afficher le tableau de bord approprié selon le type d'utilisateur */}
      {user.type === 'transporteur' ? (
        <TransporteurDashboard user={user} />
      ) : (
        <AnnonceurDashboard user={user} />
      )}
    </div>
  );
}

// Fonction d'affichage des étoiles
function renderStars(note) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <span key={index} className={`text-xl ${index < Math.round(note) ? 'text-yellow-300' : 'text-gray-400'}`}>
          ★
        </span>
      ))}
    </div>
  );
}