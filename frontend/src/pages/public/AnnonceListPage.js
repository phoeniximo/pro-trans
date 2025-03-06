import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  TruckIcon, 
  MapPinIcon, 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  PlusIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/dateUtils';
import { TYPE_TRANSPORT_LABELS, STATUT_ANNONCE_COLORS } from '../../utils/constants';
import Button from '../../components/ui/Button';
import AdvancedSearchComponent from '../../components/search/AdvancedSearchComponent';
import apiClient from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

const AnnonceListPage = () => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAnnonces, setTotalAnnonces] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('date_desc');
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Extraire les paramètres de recherche depuis l'URL
  const searchParams = new URLSearchParams(location.search);
  const initialFilters = {
    villeDepart: searchParams.get('villeDepart') || '',
    villeArrivee: searchParams.get('villeArrivee') || '',
    typeTransport: searchParams.get('typeTransport') || '',
    dateDepartMin: searchParams.get('dateDepartMin') ? new Date(searchParams.get('dateDepartMin')) : null,
    dateDepartMax: searchParams.get('dateDepartMax') ? new Date(searchParams.get('dateDepartMax')) : null,
    poids: searchParams.get('poids') || '',
    volume: searchParams.get('volume') || '',
    isUrgent: searchParams.get('isUrgent') === 'true',
  };

  // Charger les annonces
  const fetchAnnonces = async (filters = {}, page = 1, sort = sortBy) => {
    try {
      setLoading(true);
      
      // Construire les paramètres de requête
      const params = {
        page,
        limit: 10,
        sort,
        ...filters
      };
      
      // Filtrer les paramètres vides
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === '') {
          delete params[key];
        }
        
        // Convertir les dates en ISO string
        if (key === 'dateDepartMin' && params[key]) {
          params[key] = params[key].toISOString();
        }
        if (key === 'dateDepartMax' && params[key]) {
          params[key] = params[key].toISOString();
        }
      });
      
      const response = await apiClient.get('/annonces', { params });
      
      setAnnonces(response.data.data);
      setTotalAnnonces(response.data.totalResults);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des annonces:', err);
      setError('Erreur lors du chargement des annonces. Veuillez réessayer.');
      toast.error('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les annonces lorsque les paramètres de recherche changent
  useEffect(() => {
    fetchAnnonces(initialFilters);
  }, [location.search]);

  // Gérer le changement de page
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchAnnonces(initialFilters, newPage, sortBy);
      
      // Scroll vers le haut de la page
      window.scrollTo(0, 0);
    }
  };

  // Gérer le changement de tri
  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    fetchAnnonces(initialFilters, currentPage, newSortBy);
  };

  // Gérer la recherche
  const handleSearch = (filters) => {
    fetchAnnonces(filters, 1, sortBy);
  };

  // Format d'affichage de la date
  const displayDate = (date) => {
    return formatDate(date, 'dd MMMM yyyy');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Annonces de transport</h1>
      
      {/* Composant de recherche avancée */}
      <div className="mb-8">
        <AdvancedSearchComponent 
          onSearch={handleSearch} 
          initialFilters={initialFilters}
        />
      </div>
      
      {/* Options de tri et informations de résultats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm text-gray-700">
            {totalAnnonces > 0 
              ? `${totalAnnonces} annonce${totalAnnonces > 1 ? 's' : ''} trouvée${totalAnnonces > 1 ? 's' : ''}`
              : 'Aucune annonce trouvée'}
          </p>
        </div>
        <div className="flex items-center">
          <label htmlFor="sortBy" className="mr-2 text-sm text-gray-700">Trier par:</label>
          <select
            id="sortBy"
            name="sortBy"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="date_desc">Date (plus récente)</option>
            <option value="date_asc">Date (plus ancienne)</option>
            <option value="depart_asc">Date de départ (plus proche)</option>
            <option value="prix_asc">Prix max (croissant)</option>
            <option value="prix_desc">Prix max (décroissant)</option>
          </select>
        </div>
      </div>
      
      {/* Bouton de création d'annonce */}
      {isAuthenticated && user?.role === 'client' && (
        <div className="mb-6">
          <Button 
            to="/dashboard/annonces/create" 
            variant="primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Créer une nouvelle annonce
          </Button>
        </div>
      )}
      
      {/* Liste des annonces */}
      {loading && annonces.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
            <div>
              <p className="text-red-700">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => fetchAnnonces(initialFilters)}
              >
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      ) : annonces.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucune annonce disponible</h3>
          <p className="mt-2 text-gray-500">
            Aucune annonce ne correspond à vos critères de recherche.
          </p>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                navigate('/annonces');
                fetchAnnonces({});
              }}
            >
              Effacer les filtres
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {annonces.map((annonce) => (
              <li key={annonce._id}>
                <Link to={`/annonces/${annonce._id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-teal-600 truncate">
                          {annonce.titre}
                        </p>
                        <p className="flex items-center mt-2 text-sm text-gray-500">
                          <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span className="truncate">
                            {annonce.villeDepart} ? {annonce.villeArrivee}
                          </span>
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col flex-shrink-0 items-end space-y-1">
                        <p className="text-sm text-gray-900">
                          {annonce.prixMax ? `${annonce.prixMax}€ max` : 'Prix à définir'}
                        </p>
                        <p className="flex-shrink-0">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUT_ANNONCE_COLORS[annonce.statut]}`}>
                            {annonce.statut === 'disponible' ? 'Disponible' : 
                             annonce.statut === 'en_attente' ? 'En attente' : 
                             annonce.statut === 'en_cours' ? 'En cours' : 
                             annonce.statut === 'termine' ? 'Terminé' : 'Annulé'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <TruckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {TYPE_TRANSPORT_LABELS[annonce.typeTransport] || annonce.typeTransport}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {displayDate(annonce.dateDepart)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        {annonce.isUrgent && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-md shadow">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de la page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Précédent</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Pages numbers */}
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  
                  // Afficher uniquement les pages proches de la page actuelle
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          isCurrentPage
                            ? 'bg-teal-600 text-white'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        } focus:z-20 focus:outline-offset-0`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  
                  // Afficher des points de suspension
                  if (
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Suivant</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnonceListPage;