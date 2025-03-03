'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AnnonceurDashboard({ user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('annonces');
  const [mesAnnonces, setMesAnnonces] = useState([]);
  const [devisRecus, setDevisRecus] = useState([]);
  const [avisDonnes, setAvisDonnes] = useState([]);
  const [selectedAnnonceId, setSelectedAnnonceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalAnnonces: 0,
    annoncesActives: 0,
    annoncesTerminees: 0,
    annoncesSansDevis: 0
  });

  useEffect(() => {
    if (activeTab === 'annonces') {
      loadAnnonces();
    } else if (activeTab === 'devis' && selectedAnnonceId) {
      loadDevis(selectedAnnonceId);
    } else if (activeTab === 'devis') {
      loadAnnonces();
    } else if (activeTab === 'avis') {
      loadAvis();
    }
  }, [activeTab, selectedAnnonceId]);

  const loadAnnonces = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/annonces/user/mes-annonces', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des annonces');
      }

      const data = await response.json();
      setMesAnnonces(data);

      // Calculer les statistiques
      const totalAnnonces = data.length;
      const annoncesActives = data.filter(a => a.statut === 'active').length;
      const annoncesTerminees = data.filter(a => a.statut === 'terminee').length;
      const annoncesSansDevis = data.filter(a => a.statut === 'active' && !a.devisRecus).length;

      setStats({
        totalAnnonces,
        annoncesActives,
        annoncesTerminees,
        annoncesSansDevis
      });

      if (activeTab === 'devis' && !selectedAnnonceId && data.length > 0) {
        // Sélectionner la première annonce par défaut pour l'onglet devis
        const annonceAvecDevis = data.find(a => a.statut === 'devis_recu') || data[0];
        setSelectedAnnonceId(annonceAvecDevis._id);
        loadDevis(annonceAvecDevis._id);
      }
    } catch (error) {
      console.error('Erreur loadAnnonces:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDevis = async (annonceId) => {
    if (!annonceId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/devis/annonce/${annonceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des devis');
      }

      const data = await response.json();
      setDevisRecus(data);
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
      const response = await fetch('http://localhost:5000/api/avis/donnes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des avis');
      }

      const data = await response.json();
      setAvisDonnes(data);
    } catch (error) {
      console.error('Erreur loadAvis:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnonce = async (annonceId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/annonces/${annonceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'annonce');
      }

      loadAnnonces();
    } catch (error) {
      setError(error.message);
    }
  };

  const accepterDevis = async (devisId) => {
    if (!confirm('Êtes-vous sûr de vouloir accepter ce devis ? Cette action est irréversible.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/devis/${devisId}/accepter`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'acceptation du devis');
      }

      // Recharger les devis et les annonces
      loadDevis(selectedAnnonceId);
      loadAnnonces();
    } catch (error) {
      setError(error.message);
    }
  };

  const refuserDevis = async (devisId) => {
    if (!confirm('Êtes-vous sûr de vouloir refuser ce devis ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/devis/${devisId}/refuser`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du refus du devis');
      }

      loadDevis(selectedAnnonceId);
    } catch (error) {
      setError(error.message);
    }
  };

  const terminerAnnonce = async (annonceId) => {
    if (!confirm('Êtes-vous sûr que le transport est terminé ? Vous pourrez ensuite donner votre avis au transporteur.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/annonces/${annonceId}/terminer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la finalisation du transport');
      }

      loadAnnonces();
    } catch (error) {
      setError(error.message);
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

  // Fonction pour obtenir le statut affiché
  const getStatusDisplay = (statut) => {
    switch(statut) {
      case 'active': return { text: 'Active', color: 'bg-green-100 text-green-800' };
      case 'devis_recu': return { text: 'Devis reçus', color: 'bg-blue-100 text-blue-800' };
      case 'devis_accepte': return { text: 'En cours', color: 'bg-yellow-100 text-yellow-800' };
      case 'terminee': return { text: 'Terminée', color: 'bg-gray-100 text-gray-800' };
      default: return { text: statut, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
      {/* Statistiques de l'annonceur */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Total annonces</div>
          <div className="text-2xl font-bold">{stats.totalAnnonces}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Annonces actives</div>
          <div className="text-2xl font-bold">{stats.annoncesActives}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Annonces terminées</div>
          <div className="text-2xl font-bold">{stats.annoncesTerminees}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Mes avis</div>
          <div className="text-2xl font-bold">{avisDonnes?.length || 0}</div>
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
            Mes Annonces
          </button>
          <button
            onClick={() => setActiveTab('devis')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'devis'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Devis reçus
          </button>
          <button
            onClick={() => setActiveTab('avis')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'avis'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Avis donnés
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Mes Annonces</h2>
              <Link 
                href="/annonces/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Nouvelle Annonce
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Chargement des annonces...</p>
              </div>
            ) : mesAnnonces.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Vous n'avez pas encore créé d'annonces.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trajet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mesAnnonces.map((annonce) => {
                      const status = getStatusDisplay(annonce.statut);
                      return (
                        <tr key={annonce._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {annonce.titre}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {annonce.villeDepart} → {annonce.villeArrivee}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(annonce.dateDepart).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                              {status.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link 
                                href={`/annonces/${annonce._id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Voir
                              </Link>
                              
                              {annonce.statut === 'active' && (
                                <button
                                  onClick={() => handleDeleteAnnonce(annonce._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Supprimer
                                </button>
                              )}
                              
                              {annonce.statut === 'devis_recu' && (
                                <button
                                  onClick={() => {
                                    setSelectedAnnonceId(annonce._id);
                                    setActiveTab('devis');
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Voir les devis
                                </button>
                              )}

                              {annonce.statut === 'devis_accepte' && (
                                <button
                                  onClick={() => terminerAnnonce(annonce._id)}
                                  className="text-orange-600 hover:text-orange-900"
                                >
                                  Marquer terminé
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'devis' && (
          <div>
            <div className="flex flex-wrap items-center mb-6">
              <h2 className="text-xl font-semibold mr-4">Devis reçus</h2>
              {mesAnnonces.length > 0 && (
                <select 
                  value={selectedAnnonceId || ''} 
                  onChange={(e) => setSelectedAnnonceId(e.target.value)}
                  className="border rounded-md px-3 py-1.5 text-sm bg-white"
                >
                  <option value="">Sélectionnez une annonce</option>
                  {mesAnnonces.map(annonce => (
                    <option key={annonce._id} value={annonce._id}>
                      {annonce.titre} ({annonce.villeDepart} → {annonce.villeArrivee})
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Chargement des devis...</p>
              </div>
            ) : !selectedAnnonceId ? (
              <div className="text-center py-8 text-gray-500">
                Veuillez sélectionner une annonce pour voir les devis associés.
              </div>
            ) : devisRecus.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun devis reçu pour cette annonce.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {devisRecus.map((devis) => (
                  <div key={devis._id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Devis de {devis.transporteur.nom}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          devis.statut === 'accepte' ? 'bg-green-100 text-green-800' : 
                          devis.statut === 'refuse' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {devis.statut === 'accepte' ? 'Accepté' : 
                           devis.statut === 'refuse' ? 'Refusé' : 
                           'En attente'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Proposé le {new Date(devis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="mb-4">
                        <div className="font-medium text-lg text-blue-600">
                          {devis.montant} DH
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Transporteur:</span> {devis.transporteur.nom}
                        </div>
                        {devis.transporteur.note > 0 && (
                          <div className="flex items-center mt-1">
                            {renderStars(devis.transporteur.note)}
                            <span className="ml-2 text-sm text-gray-600">
                              ({devis.transporteur.nombreAvis} avis)
                            </span>
                          </div>
                        )}
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Téléphone:</span> {devis.transporteur.telephone}
                        </div>
                      </div>
                      <div className="mt-3 border-t pt-3">
                        <div className="text-sm font-medium mb-1">Description:</div>
                        <p className="text-gray-700 text-sm">{devis.description}</p>
                      </div>
                      
                      {devis.statut === 'en_attente' && (
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => accepterDevis(devis._id)}
                            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => refuserDevis(devis._id)}
                            className="flex-1 bg-red-100 text-red-800 py-2 rounded hover:bg-red-200"
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                      
                      {devis.statut === 'accepte' && (
                        <div className="mt-4">
                          <Link 
                            href={`/messages`}
                            className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700"
                          >
                            Contacter le transporteur
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'avis' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Avis donnés</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Chargement des avis...</p>
              </div>
            ) : avisDonnes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Vous n'avez pas encore donné d'avis.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {avisDonnes.map((avis) => (
                  <div key={avis._id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500">
                          Pour: <span className="font-medium text-gray-900">{avis.destinataire.nom}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Annonce: {avis.annonce.titre}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(avis.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>{renderStars(avis.note)}</div>
                    </div>
                    <p className="text-gray-700 mt-3 border-t pt-3">{avis.commentaire}</p>
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