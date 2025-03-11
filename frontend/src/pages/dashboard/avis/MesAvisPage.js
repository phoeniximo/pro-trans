import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import avisService from '../../../services/avisService';
import Button from '../../../components/ui/Button';
import { StarRating } from '../../../components/reviews/RatingAndReviewsComponent';
import { formatDate } from '../../../utils/formatters';

const MesAvisPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recus');
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAvis, setTotalAvis] = useState(0);
  const limit = 10;

  // Chargement des avis
  useEffect(() => {
    const fetchAvis = async () => {
      try {
        setLoading(true);
        let response;
        
        if (activeTab === 'recus') {
          response = await avisService.getAvisRecus(page, limit);
        } else {
          response = await avisService.getAvisDonnes(page, limit);
        }
        
        // Vérifier si response.data existe et a la structure attendue
        if (response && response.data) {
          setAvis(response.data.data || []);
          setTotalPages(response.data.pages || 1);
          setTotalAvis(response.data.total || 0);
          setError(null);
        } else {
          throw new Error('Format de réponse inattendu');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des avis:', err);
        setError('Impossible de charger les avis');
        toast.error('Erreur lors du chargement des avis');
        // S'assurer que l'état des avis est toujours un tableau même en cas d'erreur
        setAvis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvis();
  }, [activeTab, page]);

  // Changement d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // Réinitialiser la pagination lors du changement d'onglet
  };

  // Affichage du statut de l'avis
  const renderAvisStatus = (avu) => {
    if (!avu.annonce) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Annonce supprimée
        </span>
      );
    }
    
    return (
      <Link 
        to={`/dashboard/annonces/${avu.annonce._id}`} 
        className="inline-flex items-center text-sm text-teal-600 hover:text-teal-800"
      >
        Voir l'annonce
      </Link>
    );
  };

  // Fonction pour rafraîchir les avis
  const refreshAvis = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'recus') {
        response = await avisService.getAvisRecus(1, limit);
      } else {
        response = await avisService.getAvisDonnes(1, limit);
      }
      
      // Vérifier si response.data existe et a la structure attendue
      if (response && response.data) {
        setAvis(response.data.data || []);
        setTotalPages(response.data.pages || 1);
        setTotalAvis(response.data.total || 0);
        setError(null);
        toast.success('Avis actualisés');
      } else {
        throw new Error('Format de réponse inattendu');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des avis:', err);
      setError('Impossible de charger les avis');
      toast.error('Erreur lors du chargement des avis');
      // S'assurer que l'état des avis est toujours un tableau même en cas d'erreur
      setAvis([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Mes avis
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les avis que vous avez reçus et donnés
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            variant="outline"
            onClick={() => {
              setPage(1);
              refreshAvis();
            }}
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recus'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabChange('recus')}
          >
            Avis reçus
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'donnes'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabChange('donnes')}
          >
            Avis donnés
          </button>
        </nav>
      </div>

      {/* Liste des avis */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {activeTab === 'recus' ? 'Avis reçus' : 'Avis donnés'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'recus' 
              ? `Avis laissés par vos clients (${totalAvis})`
              : `Avis que vous avez laissés aux transporteurs (${totalAvis})`}
          </p>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
            <p className="mt-2 text-sm text-gray-500">Chargement des avis...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-center">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPage(1);
                  refreshAvis();
                }}
              >
                Réessayer
              </Button>
            </div>
          </div>
        ) : avis.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun avis</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'recus' 
                ? "Vous n'avez pas encore reçu d'avis"
                : "Vous n'avez pas encore donné d'avis"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {avis.map((avu) => (
              <li key={avu._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-1">
                    {activeTab === 'recus' && avu.auteur ? (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {avu.auteur.photo ? (
                          <img 
                            src={avu.auteur.photo} 
                            alt={`${avu.auteur.prenom} ${avu.auteur.nom}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <StarIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    ) : avu.destinataire ? (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {avu.destinataire.photo ? (
                          <img 
                            src={avu.destinataire.photo} 
                            alt={`${avu.destinataire.prenom} ${avu.destinataire.nom}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <StarIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <StarIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {activeTab === 'recus' && avu.auteur
                            ? `${avu.auteur.prenom || ''} ${avu.auteur.nom || ''}`
                            : avu.destinataire
                              ? `${avu.destinataire.prenom || ''} ${avu.destinataire.nom || ''}`
                              : 'Utilisateur inconnu'}
                        </h4>
                        <div className="mt-1 flex items-center">
                          <StarRating rating={avu.note} size="sm" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {avu.createdAt ? formatDate(avu.createdAt, 'dd MMM yyyy') : 'Date inconnue'}
                      </p>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600">
                      {avu.commentaire}
                    </p>
                    
                    <div className="mt-2 text-sm">
                      {renderAvisStatus(avu)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de la page <span className="font-medium">{page}</span> sur <span className="font-medium">{totalPages}</span>
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
      </div>

      {/* Importance des avis */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-3">Importance des avis pour votre réputation</h3>
        <p className="text-blue-700 mb-4">
          Les avis sont essentiels pour établir votre réputation sur Pro-Trans. Ils aident les nouveaux clients à faire confiance à vos services et à prendre une décision éclairée.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h4 className="font-medium text-blue-800 mb-2">Comment améliorer vos avis ?</h4>
            <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
              <li>Communiquez clairement avec vos clients</li>
              <li>Respectez les délais convenus</li>
              <li>Soyez professionnel et courtois</li>
              <li>Prenez soin des marchandises transportées</li>
              <li>Résolvez rapidement les problèmes éventuels</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h4 className="font-medium text-blue-800 mb-2">Que faire en cas d'avis négatif ?</h4>
            <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
              <li>Ne réagissez pas à chaud</li>
              <li>Contactez le client pour comprendre son insatisfaction</li>
              <li>Proposez une solution concrète au problème signalé</li>
              <li>Apprenez de cette expérience pour l'avenir</li>
              <li>Contactez notre service client si vous estimez l'avis injustifié</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesAvisPage;