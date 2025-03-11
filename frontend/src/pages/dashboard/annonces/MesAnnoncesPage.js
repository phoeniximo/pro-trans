import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ExclamationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import annonceService from '../../../services/annonceService';
import Button from '../../../components/ui/Button';
import { STATUT_ANNONCE_LABELS, STATUT_ANNONCE_COLORS } from '../../../utils/constants';
import { formatDate } from '../../../utils/formatters';
import Avatar from '../../../components/ui/Avatar';

const MesAnnoncesPage = () => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [annonceToDelete, setAnnonceToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Etats pour la pagination et le filtrage
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');

  // Chargement des annonces
  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        setLoading(true);
        
        // Préparation des filtres
        const filters = { page };
        if (filter !== 'all') {
          filters.statut = filter;
        }
        
        console.log('Récupération des annonces avec filtres:', filters);
        
        const response = await annonceService.getMesAnnonces(filters);
        console.log('Réponse complète getMesAnnonces:', response);
        
        // Vérification de la structure de réponse attendue
        if (response.success === false) {
          console.error('Réponse d\'erreur:', response);
          setError(response.message || 'Erreur lors du chargement des annonces');
          setAnnonces([]);
          toast.error(response.message || 'Erreur lors du chargement des annonces');
          return;
        }
        
        // Vérification plus robuste de la structure de réponse
        if (response && response.data) {
          console.log('Annonces récupérées:', response.data);
          setAnnonces(response.data.data || response.data);
          setTotalPages(response.data.pages || response.pages || 1);
        } else {
          // Si la réponse n'a pas la structure attendue, initialiser avec des valeurs par défaut
          console.warn('Structure de réponse inattendue:', response);
          
          // Tenter d'extraire les données quand même
          if (Array.isArray(response)) {
            console.log('Réponse est un tableau:', response);
            setAnnonces(response);
            setTotalPages(1);
          } else {
            setAnnonces([]);
            setTotalPages(1);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des annonces:', err);
        
        // Logs détaillés pour déboguer
        if (err.response) {
          console.error('Données de réponse d\'erreur:', err.response.data);
          console.error('Statut de l\'erreur:', err.response.status);
        } else if (err.request) {
          console.error('Pas de réponse du serveur:', err.request);
        } else {
          console.error('Erreur de configuration:', err.message);
        }
        
        setError('Impossible de charger vos annonces');
        setAnnonces([]); // Initialiser avec un tableau vide en cas d'erreur
        toast.error('Erreur lors du chargement des annonces');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonces();
  }, [page, filter]);

  // Gérer le changement de filtre
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1); // Réinitialiser la pagination lors du changement de filtre
  };

  // Gérer la suppression d'une annonce
  const handleDelete = async () => {
    if (!annonceToDelete) return;
    
    try {
      setDeleting(true);
      await annonceService.deleteAnnonce(annonceToDelete);
      
      // Rafraîchir la liste des annonces
      setAnnonces(annonces.filter(annonce => annonce._id !== annonceToDelete));
      toast.success('Annonce supprimée avec succès');
      
      // Fermer le modal
      setShowDeleteModal(false);
      setAnnonceToDelete(null);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'annonce:', err);
      toast.error(err.message || 'Erreur lors de la suppression de l\'annonce');
    } finally {
      setDeleting(false);
    }
  };

  // Afficher le statut de l'annonce avec la bonne couleur
  const renderStatus = (statut) => {
    const statusClass = STATUT_ANNONCE_COLORS[statut] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {STATUT_ANNONCE_LABELS[statut] || statut}
      </span>
    );
  };

  // Fonction pour actualiser les annonces
  const refreshAnnonces = async () => {
    try {
      setLoading(true);
      setPage(1);
      
      const filters = { page: 1 };
      if (filter !== 'all') {
        filters.statut = filter;
      }
      
      console.log('Rafraîchissement des annonces avec filtres:', filters);
      const response = await annonceService.getMesAnnonces(filters);
      console.log('Réponse du rafraîchissement:', response);
      
      // Traitement similaire à celui de useEffect
      if (response && response.data) {
        setAnnonces(response.data.data || response.data);
        setTotalPages(response.data.pages || response.pages || 1);
        setError(null);
        toast.success('Annonces actualisées');
      } else {
        setAnnonces([]);
        setTotalPages(1);
        console.warn('Format de réponse inattendu lors du rafraîchissement:', response);
      }
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des annonces:', err);
      setError('Impossible de charger vos annonces');
      setAnnonces([]);
      toast.error('Erreur lors du rafraîchissement des annonces');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Mes annonces
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos demandes de transport
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            variant="outline"
            onClick={refreshAnnonces}
            className="mr-3"
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            Actualiser
          </Button>
          <Button
            to="/dashboard/annonces/create"
            variant="primary"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Nouvelle annonce
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            Toutes
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'disponible'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterChange('disponible')}
          >
            Disponibles
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'en_attente'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterChange('en_attente')}
          >
            En attente
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'en_cours'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterChange('en_cours')}
          >
            En cours
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'termine'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterChange('termine')}
          >
            Terminées
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'annule'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterChange('annule')}
          >
            Annulées
          </button>
        </div>
      </div>

      {/* Liste des annonces */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="px-4 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
            <p className="mt-2 text-sm text-gray-500">Chargement des annonces...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-center">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={refreshAnnonces}
              >
                Réessayer
              </Button>
            </div>
          </div>
        ) : !annonces || annonces.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune annonce</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer une nouvelle annonce.
            </p>
            <div className="mt-6">
              <Button
                to="/dashboard/annonces/create"
                variant="primary"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Nouvelle annonce
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Annonce
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Trajet
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Statut
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Devis
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {annonces.map((annonce) => (
                    <tr key={annonce._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 uppercase">
                              {annonce.typeTransport?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {annonce.titre}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {annonce.typeTransport}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{annonce.villeDepart}</div>
                        <div className="text-sm text-gray-500">{annonce.villeArrivee}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(annonce.dateDepart)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatus(annonce.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {annonce.nbDevis ? (
                          <span className="font-medium text-teal-600">{annonce.nbDevis}</span>
                        ) : (
                          <span>Aucun</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            to={`/dashboard/annonces/${annonce._id}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          
                          {annonce.statut === 'disponible' && (
                            <>
                              <Link 
                                to={`/dashboard/annonces/${annonce._id}/edit`}
                                className="text-teal-600 hover:text-teal-900"
                                title="Modifier l'annonce"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </Link>
                              
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer l'annonce"
                                onClick={() => {
                                  setAnnonceToDelete(annonce._id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de la page <span className="font-medium">{page}</span> sur{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          page === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Précédent</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {/* Pages */}
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        // Afficher seulement les pages pertinentes
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pageNum
                                  ? 'z-10 bg-teal-50 border-teal-500 text-teal-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          (pageNum === 2 && page > 3) ||
                          (pageNum === totalPages - 1 && page < totalPages - 2)
                        ) {
                          return (
                            <span
                              key={pageNum}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          page === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Suivant</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Supprimer l'annonce
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Etes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  isLoading={deleting}
                  disabled={deleting}
                  className="sm:ml-3"
                >
                  Supprimer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAnnonceToDelete(null);
                  }}
                  disabled={deleting}
                  className="mt-3 sm:mt-0"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesAnnoncesPage;