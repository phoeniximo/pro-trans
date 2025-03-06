import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  StarIcon, 
  TruckIcon,
  MapPinIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';

const TransporteurListPage = () => {
  const [transporteurs, setTransporteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Etat des filtres
  const [filters, setFilters] = useState({
    specialite: '',
    localisation: '',
    noteMin: '',
    typeVehicule: ''
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Options pour les filtres
  const specialites = [
    'Colis', 'Meubles', 'Déménagement', 'Marchandises', 'Véhicules', 'Palette', 'International'
  ];
  
  const typesVehicules = [
    'Utilitaire', 'Camion', 'Camionnette', 'Poids lourd', 'Fourgon', 'Porte-voiture'
  ];

  // Chargement des transporteurs
  useEffect(() => {
    const fetchTransporteurs = async () => {
      try {
        setLoading(true);
        
        // Préparer les paramètres de requête
        const params = {
          page,
          limit: 10,
          search: searchTerm,
          ...filters
        };
        
        // Nettoyer les paramètres vides
        Object.keys(params).forEach(key => 
          (params[key] === '' || params[key] === null) && delete params[key]
        );
        
        const response = await apiClient.get('/users/transporteurs', { params });
        setTransporteurs(response.data.data);
        setTotalPages(response.data.pages || 1);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des transporteurs:', err);
        setError('Impossible de charger la liste des transporteurs');
      } finally {
        setLoading(false);
      }
    };

    fetchTransporteurs();
  }, [page, searchTerm, filters]);

  // Gestion du changement des filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Réinitialiser la pagination lors d'un changement de filtre
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      specialite: '',
      localisation: '',
      noteMin: '',
      typeVehicule: ''
    });
    setSearchTerm('');
    setPage(1);
  };

  // Gestion de la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trouvez un transporteur professionnel
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Des centaines de transporteurs vérifiés prêts à livrer vos marchandises
          </p>
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-4">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un transporteur..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Rechercher
                  </Button>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FunnelIcon className="h-5 w-5 mr-1" />
                    Filtres
                  </Button>
                </div>
              </div>

              {/* Filtres avancés */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filtres avancés</h3>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-sm text-teal-600 hover:text-teal-500 flex items-center"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Réinitialiser
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="specialite" className="block text-sm font-medium text-gray-700 mb-1">
                        Spécialité
                      </label>
                      <select
                        id="specialite"
                        name="specialite"
                        value={filters.specialite}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                      >
                        <option value="">Toutes les spécialités</option>
                        {specialites.map((specialite) => (
                          <option key={specialite} value={specialite.toLowerCase()}>
                            {specialite}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="localisation" className="block text-sm font-medium text-gray-700 mb-1">
                        Localisation
                      </label>
                      <input
                        type="text"
                        id="localisation"
                        name="localisation"
                        value={filters.localisation}
                        onChange={handleFilterChange}
                        placeholder="Ville ou département"
                        className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="noteMin" className="block text-sm font-medium text-gray-700 mb-1">
                        Note minimum
                      </label>
                      <select
                        id="noteMin"
                        name="noteMin"
                        value={filters.noteMin}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                      >
                        <option value="">Toutes les notes</option>
                        <option value="3">3 étoiles et plus</option>
                        <option value="4">4 étoiles et plus</option>
                        <option value="4.5">4.5 étoiles et plus</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="typeVehicule" className="block text-sm font-medium text-gray-700 mb-1">
                        Type de véhicule
                      </label>
                      <select
                        id="typeVehicule"
                        name="typeVehicule"
                        value={filters.typeVehicule}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                      >
                        <option value="">Tous les véhicules</option>
                        {typesVehicules.map((type) => (
                          <option key={type} value={type.toLowerCase()}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Liste des transporteurs */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : transporteurs.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun transporteur trouvé</h3>
            <p className="text-gray-500 mb-4">
              Aucun transporteur ne correspond à vos critères de recherche.
            </p>
            <Button onClick={resetFilters} variant="outline">
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {transporteurs.map((transporteur) => (
              <div key={transporteur._id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex items-center mb-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {transporteur.photo ? (
                        <img
                          src={transporteur.photo}
                          alt={`${transporteur.prenom} ${transporteur.nom}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <TruckIcon className="h-8 w-8 text-gray-400 m-4" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {transporteur.prenom} {transporteur.nom}
                      </h3>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, index) => (
                            <StarIcon
                              key={index}
                              className={`h-4 w-4 ${
                                (transporteur.rating || 0) > index
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-500">
                          ({transporteur.nbAvis || 0} avis)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {transporteur.specialites && transporteur.specialites.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {transporteur.specialites.slice(0, 3).map((specialite, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                          >
                            {specialite}
                          </span>
                        ))}
                        {transporteur.specialites.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{transporteur.specialites.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {transporteur.adresse && transporteur.adresse.ville && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {transporteur.adresse.ville}, {transporteur.adresse.pays || 'France'}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <TruckIcon className="h-4 w-4 text-gray-400 mr-1" />
                      {transporteur.nbLivraisons || 0} livraisons effectuées
                    </div>
                  </div>
                  
                  {transporteur.aboutMe && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {transporteur.aboutMe}
                    </p>
                  )}
                  
                  <div className="mt-4">
                    <Button
                      to={`/transporteurs/${transporteur._id}`}
                      variant="outline"
                      fullWidth
                    >
                      Voir le profil
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && transporteurs.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
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
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Afficher seulement certaines pages pour ne pas surcharger
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= page - 1 && pageNumber <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNumber
                          ? 'z-10 bg-teal-50 border-teal-500 text-teal-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  (pageNumber === 2 && page > 3) ||
                  (pageNumber === totalPages - 1 && page < totalPages - 2)
                ) {
                  return (
                    <span
                      key={pageNumber}
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
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        )}

        {/* CTA pour devenir transporteur */}
        <div className="mt-16 bg-teal-700 rounded-lg shadow-xl overflow-hidden">
          <div className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Vous êtes transporteur ?
              </h2>
              <p className="mt-3 text-lg text-teal-100">
                Rejoignez notre réseau de transporteurs et développez votre activité avec de nouveaux clients chaque jour.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <Button
                to="/register?role=transporteur"
                variant="primary"
                size="lg"
                className="bg-white text-teal-700 hover:bg-gray-100"
              >
                Devenir transporteur
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporteurListPage;