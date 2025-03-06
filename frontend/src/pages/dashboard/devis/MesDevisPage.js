import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  TruckIcon, 
  ClockIcon, 
  DocumentTextIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  UserIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import Button from '../../../components/ui/Button';
import apiClient from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';
import { STATUT_DEVIS_COLORS, STATUT_DEVIS_LABELS } from '../../../utils/constants';

const MesDevisPage = () => {
  const { user } = useAuth();
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtres
  const [filters, setFilters] = useState({
    statut: '',
    dateDebut: '',
    dateFin: '',
    tri: 'recent'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Charger les devis
  useEffect(() => {
    const fetchDevis = async () => {
      try {
        setLoading(true);
        
        const endpoint = user.role === 'transporteur' 
          ? '/devis/mes-devis' 
          : '/devis/recus';
        
        const params = {
          page: currentPage,
          limit: 10,
          ...filters
        };
        
        const response = await apiClient.get(endpoint, { params });
        setDevis(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des devis:', err);
        setError('Erreur lors du chargement des devis. Veuillez réessayer.');
        toast.error('Erreur lors du chargement des devis');
      } finally {
        setLoading(false);
      }
    };

    fetchDevis();
  }, [user.role, currentPage, filters]);

  // Rafraîchir les devis
  const refreshDevis = () => {
    setCurrentPage(1);
    fetchDevis();
  };

  // Gérer le changement de page
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Appliquer les filtres
  const applyFilters = () => {
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      statut: '',
      dateDebut: '',
      dateFin: '',
      tri: 'recent'
    });
    setCurrentPage(1);
  };

  // Accepter un devis (pour les clients)
  const handleAcceptDevis = async (devisId) => {
    try {
      await apiClient.put(`/devis/${devisId}/accepter`);
      toast.success('Devis accepté avec succès');
      
      // Mettre à jour la liste des devis
      setDevis(prevDevis => 
        prevDevis.map(d => 
          d._id === devisId ? { ...d, statut: 'accepte' } : d
        )
      );
    } catch (err) {
      console.error('Erreur lors de l\'acceptation du devis:', err);
      toast.error('Erreur lors de l\'acceptation du devis');
    }
  };

  // Refuser un devis (pour les clients)
  const handleRefuseDevis = async (devisId) => {
    try {
      await apiClient.put(`/devis/${devisId}/refuser`, { 
        raison: 'Refusé par le client' 
      });
      toast.success('Devis refusé avec succès');
      
      // Mettre à jour la liste des devis
      setDevis(prevDevis => 
        prevDevis.map(d => 
          d._id === devisId ? { ...d, statut: 'refuse' } : d
        )
      );
    } catch (err) {
      console.error('Erreur lors du refus du devis:', err);
      toast.error('Erreur lors du refus du devis');
    }
  };

  // Annuler un devis (pour les transporteurs)
  const handleCancelDevis = async (devisId) => {
    try {
      await apiClient.put(`/devis/${devisId}/annuler`, { 
        raison: 'Annulé par le transporteur' 
      });
      toast.success('Devis annulé avec succès');
      
      // Mettre à jour la liste des devis
      setDevis(prevDevis => 
        prevDevis.map(d => 
          d._id === devisId ? { ...d, statut: 'annule' } : d
        )
      );
    } catch (err) {
      console.error('Erreur lors de l\'annulation du devis:', err);
      toast.error('Erreur lors de l\'annulation du devis');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.role === 'transporteur' ? 'Mes devis envoyés' : 'Devis reçus'}
        </h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtres
          </Button>
          <Button
            variant="outline"
            onClick={refreshDevis}
            disabled={loading}
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Filtrer les devis</h2>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setShowFilters(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="statut"
                name="statut"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              >
                <option value="">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="accepte">Accepté</option>
                <option value="refuse">Refusé</option>
                <option value="annule">Annulé</option>
                <option value="expire">Expiré</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                value={filters.dateDebut}
                onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                value={filters.dateFin}
                onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="tri" className="block text-sm font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <select
                id="tri"
                name="tri"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                value={filters.tri}
                onChange={(e) => setFilters({ ...filters, tri: e.target.value })}
              >
                <option value="recent">Plus récents</option>
                <option value="ancien">Plus anciens</option>
                <option value="montant_asc">Montant croissant</option>
                <option value="montant_desc">Montant décroissant</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={resetFilters}
            >
              Réinitialiser
            </Button>
            <Button
              variant="primary"
              onClick={applyFilters}
            >
              Appliquer
            </Button>
          </div>
        </div>
      )}

      {/* Liste des devis */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
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
                onClick={refreshDevis}
              >
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      ) : devis.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {user.role === 'transporteur' 
              ? 'Vous n\'avez pas encore envoyé de devis' 
              : 'Vous n\'avez pas encore reçu de devis'}
          </h3>
          <p className="text-gray-500 mb-6">
            {user.role === 'transporteur' 
              ? 'Parcourez les annonces pour proposer vos services de transport.' 
              : 'Créez une annonce pour recevoir des devis de transporteurs.'}
          </p>
          <Button
            to={user.role === 'transporteur' ? '/annonces' : '/dashboard/annonces/create'}
            variant="primary"
          >
            {user.role === 'transporteur' ? 'Parcourir les annonces' : 'Créer une annonce'}
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {devis.map((devis) => {
              const otherParty = user.role === 'transporteur' ? devis.client : devis.transporteur;
              const annonce = devis.annonce;
              
              return (
                <li key={devis._id} className="hover:bg-gray-50">
                  <div className="px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {otherParty.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={otherParty.photo}
                              alt={`${otherParty.prenom} ${otherParty.nom}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {otherParty.prenom} {otherParty.nom}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {user.role === 'transporteur' ? 'Client' : 'Transporteur'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {devis.montant.toFixed(2)} €
                        </span>
                        <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${STATUT_DEVIS_COLORS[devis.statut]}`}>
                          {STATUT_DEVIS_LABELS[devis.statut]}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-1.5" />
                          <h4 className="text-sm font-medium text-gray-700">Annonce</h4>
                        </div>
                        <div className="mt-1.5">
                          <p className="text-sm font-medium text-gray-900">{annonce.titre}</p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {annonce.villeDepart} ? {annonce.villeArrivee}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 text-gray-400 mr-1.5" />
                          <h4 className="text-sm font-medium text-gray-700">Dates</h4>
                        </div>
                        <div className="mt-1.5 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">Départ demandé</p>
                            <p className="text-sm text-gray-900">
                              {format(new Date(annonce.dateDepart), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Livraison estimée</p>
                            <p className="text-sm text-gray-900">
                              {format(new Date(devis.delaiLivraison), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center">
                        <div className="flex-1 text-sm text-gray-500">
                          Devis créé le {format(new Date(devis.createdAt), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            to={`/dashboard/devis/${devis._id}`}
                            variant="outline"
                            size="sm"
                          >
                            Voir les détails
                          </Button>
                          
                          {/* Boutons d'action basés sur le rôle et le statut */}
                          {user.role === 'client' && devis.statut === 'en_attente' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAcceptDevis(devis._id)}
                              >
                                Accepter
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRefuseDevis(devis._id)}
                              >
                                Refuser
                              </Button>
                            </>
                          )}
                          
                          {user.role === 'transporteur' && devis.statut === 'en_attente' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancelDevis(devis._id)}
                            >
                              Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-md shadow">
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
                
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Afficher la première page, la dernière, et les pages autour de la page courante
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
                          pageNumber === currentPage
                            ? 'bg-teal-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  
                  // Afficher des points de suspension pour les sauts de pages
                  if (
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
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

export default MesDevisPage;