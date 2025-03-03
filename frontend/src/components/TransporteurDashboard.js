'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TransporteurDashboard({ user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('annonces');
  const [annonces, setAnnonces] = useState([]);
  const [mesDevis, setMesDevis] = useState([]);
  const [avisRecus, setAvisRecus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalDevis: 0,
    devisAcceptes: 0,
    devisEnAttente: 0,
    devisRefuses: 0,
    tauxAcceptation: 0,
    noteMoyenne: user.note || 0
  });

  useEffect(() => {
    if (activeTab === 'annonces') {
      loadAnnonces();
    } else if (activeTab === 'devis') {
      loadDevis();
    } else if (activeTab === 'avis') {
      loadAvis();
    }
  }, [activeTab]);

  const loadAnnonces = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/annonces', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des annonces');
      }

      const data = await response.json();
      setAnnonces(data.filter(annonce => 
        // Afficher uniquement les annonces actives
        annonce.statut === 'active' &&
        // Ne pas montrer ses propres annonces
        annonce.auteur._id !== user.id
      ));
    } catch (error) {
      console.error('Erreur loadAnnonces:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDevis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/devis/mes-devis', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des devis');
      }

      const data = await response.json();
      setMesDevis(data);

      // Calculer les statistiques
      const totalDevis = data.length;
      const devisAcceptes = data.filter(d => d.statut === 'accepte').length;
      const devisEnAttente = data.filter(d => d.statut === 'en_attente').length;
      const devisRefuses = data.filter(d => d.statut === 'refuse').length;
      const tauxAcceptation = totalDevis > 0 
        ? ((devisAcceptes / totalDevis) * 100).toFixed(1) 
        : 0;

      setStats({
        totalDevis,
        devisAcceptes,
        devisEnAttente,
        devisRefuses,
        tauxAcceptation,
        noteMoyenne: user.note || 0
      });
    } catch (error) {
      console.error('Erreur loadDevis:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAvis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/avis/recus', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des avis');
      }

      const data = await response.json();
      setAvisRecus(data);
    } catch (error) {
      console.error('Erreur loadAvis:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (note) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-xl ${index < note ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
      {/* Statistiques du transporteur */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Taux d'acceptation</div>
          <div className="text-2xl font-bold">{stats.tauxAcceptation}%</div>
          <div className="text-sm text-gray-500">{stats.devisAcceptes} devis acceptés sur {stats.totalDevis}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Devis en attente</div>
          <div className="text-2xl font-bold">{stats.devisEnAttente}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Note moyenne</div>
          <div className="flex items-center">
            {renderStars(stats.noteMoyenne)}
            <span className="ml-2 font-bold">
              {stats.noteMoyenne.toFixed(1)}/5
            </span>
          </div>
          <div className="text-sm text-gray-500">{user.nombreAvis} avis</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Statut</div>
          <div className="mt-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Actif
            </span>
          </div>
        </div>
      </div>
      
      {/* Onglets */}
      <div className="border-b">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('annonces')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'annonces'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Annonces disponibles
          </button>
          <button
            onClick={() => setActiveTab('devis')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'devis'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mes devis
          </button>
          <button
            onClick={() => setActiveTab('avis')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'avis'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Avis reçus
          </button>
          <button
            onClick={() => setActiveTab('profil')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'profil'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mon profil
          </button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="p-6">
        {activeTab === 'annonces' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Annonces disponibles</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Chargement des annonces...</p>
              </div>
            ) : annonces.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune annonce disponible pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {annonces.map((annonce) => (
                  <div key={annonce._id} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-lg truncate">{annonce.titre}</h3>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-600">
                          {new Date(annonce.dateDepart).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {annonce.budget ? `${annonce.budget} DH` : 'À négocier'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-3">
                        <span>{annonce.villeDepart}</span>
                        <span>→</span>
                        <span>{annonce.villeArrivee}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {annonce.description}
                      </p>
                      <div className="flex justify-end">
                        <Link 
                          href={`/annonces/${annonce._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Voir détails →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'devis' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Mes devis proposés</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Chargement des devis...</p>
              </div>
            ) : mesDevis.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Vous n'avez pas encore proposé de devis.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annonce</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trajet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mesDevis.map((devis) => (
                      <tr key={devis._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {devis.annonce.titre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {devis.annonce.villeDepart} → {devis.annonce.villeArrivee}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {devis.montant} DH
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(devis.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${devis.statut === 'accepte' ? 'bg-green-100 text-green-800' : 
                              devis.statut === 'refuse' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {devis.statut === 'accepte' ? 'Accepté' : 
                             devis.statut === 'refuse' ? 'Refusé' : 
                             'En attente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link 
                            href={`/annonces/${devis.annonce._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Voir l'annonce
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'avis' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Avis reçus</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Chargement des avis...</p>
              </div>
            ) : avisRecus.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Vous n'avez pas encore reçu d'avis.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {avisRecus.map((avis) => (
                  <div key={avis._id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{avis.auteur.nom}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(avis.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>{renderStars(avis.note)}</div>
                    </div>
                    <div className="mt-3">
                      <div className="text-sm text-gray-500 mb-1">
                        Annonce : {avis.annonce.titre}
                      </div>
                      <p className="text-gray-700 mt-2">{avis.commentaire}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profil' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Mon profil</h2>
            
            <div className="bg-white rounded-lg border p-6 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nom</label>
                  <div className="text-gray-900 border-b pb-2">{user.nom}</div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <div className="text-gray-900 border-b pb-2">{user.email}</div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Type de compte</label>
                  <div className="text-gray-900 border-b pb-2 capitalize">{user.type}</div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Téléphone</label>
                  <div className="text-gray-900 border-b pb-2">{user.telephone}</div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Ville</label>
                  <div className="text-gray-900 border-b pb-2">{user.ville}</div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Entreprise</label>
                  <div className="text-gray-900 border-b pb-2">{user.entreprise || 'Non renseigné'}</div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Note moyenne</label>
                  <div className="text-gray-900 border-b pb-2 flex items-center">
                    {renderStars(user.note)}
                    <span className="ml-2">
                      {user.note.toFixed(1)}/5 ({user.nombreAvis} avis)
                    </span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={() => router.push('/profile/edit')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Modifier mon profil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}