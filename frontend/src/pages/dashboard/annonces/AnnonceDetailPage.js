import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  TruckIcon, 
  MapPinIcon, 
  CalendarIcon, 
  PencilIcon, 
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../api/client';
import annonceService from '../../../services/annonceService';
import Button from '../../../components/ui/Button';
import TrackingComponent from '../../../components/transport/TrackingComponent';
import ConversationComponent from '../../../components/messaging/ConversationComponent';
import { formatDate } from '../../../utils/formatters';
import { STATUT_ANNONCE_LABELS, STATUT_ANNONCE_COLORS } from '../../../utils/constants';

const AnnonceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [annonce, setAnnonce] = useState(null);
  const [devis, setDevis] = useState([]);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAcceptDevisModal, setShowAcceptDevisModal] = useState(false);
  const [devisToAccept, setDevisToAccept] = useState(null);
  const [showRejectDevisModal, setShowRejectDevisModal] = useState(false);
  const [devisToReject, setDevisToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [processingAction, setProcessingAction] = useState(false);

  // Récupérer l'annonce et les devis associés
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les détails de l'annonce
        const annonceResponse = await apiClient.get(`/annonces/${id}`);
        setAnnonce(annonceResponse.data.data);
        
        // Récupérer les devis associés à l'annonce
        const devisResponse = await apiClient.get(`/devis/annonce/${id}`);
        setDevis(devisResponse.data.data);
        
        // Si un devis a été accepté, le sélectionner
        const acceptedDevis = devisResponse.data.data.find(devis => devis.statut === 'accepte' || devis.statut === 'en_cours' || devis.statut === 'termine');
        if (acceptedDevis) {
          setSelectedDevis(acceptedDevis);
        }
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les détails de l\'annonce');
        toast.error('Erreur lors du chargement des détails de l\'annonce');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Supprimer l'annonce
  const handleDelete = async () => {
    try {
      setProcessingAction(true);
      await annonceService.deleteAnnonce(id);
      
      toast.success('Annonce supprimée avec succès');
      navigate('/dashboard/annonces');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'annonce:', error);
      toast.error(error.message || 'Erreur lors de la suppression de l\'annonce');
    } finally {
      setProcessingAction(false);
      setShowDeleteModal(false);
    }
  };

  // Accepter un devis
  const handleAcceptDevis = async () => {
    if (!devisToAccept) return;
    
    try {
      setProcessingAction(true);
      await apiClient.put(`/devis/${devisToAccept._id}/accepter`);
      
      toast.success('Devis accepté avec succès');
      
      // Rafraîchir les données
      const annonceResponse = await apiClient.get(`/annonces/${id}`);
      setAnnonce(annonceResponse.data.data);
      
      const devisResponse = await apiClient.get(`/devis/annonce/${id}`);
      setDevis(devisResponse.data.data);
      
      const updatedDevis = devisResponse.data.data.find(d => d._id === devisToAccept._id);
      setSelectedDevis(updatedDevis);
      
      // Fermer le modal
      setShowAcceptDevisModal(false);
      setDevisToAccept(null);
      
      // Passer à l'onglet de suivi
      setActiveTab('suivi');
    } catch (error) {
      console.error('Erreur lors de l\'acceptation du devis:', error);
      toast.error(error.message || 'Erreur lors de l\'acceptation du devis');
    } finally {
      setProcessingAction(false);
    }
  };

  // Refuser un devis
  const handleRejectDevis = async () => {
    if (!devisToReject) return;
    
    try {
      setProcessingAction(true);
      await apiClient.put(`/devis/${devisToReject._id}/refuser`, { raison: rejectReason });
      
      toast.success('Devis refusé avec succès');
      
      // Rafraîchir les données
      const devisResponse = await apiClient.get(`/devis/annonce/${id}`);
      setDevis(devisResponse.data.data);
      
      // Fermer le modal
      setShowRejectDevisModal(false);
      setDevisToReject(null);
      setRejectReason('');
    } catch (error) {
      console.error('Erreur lors du refus du devis:', error);
      toast.error(error.message || 'Erreur lors du refus du devis');
    } finally {
      setProcessingAction(false);
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

  // Vérifier si l'utilisateur est le propriétaire de l'annonce
  const isOwner = user && annonce && user.id === annonce.client?._id;

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error || !annonce) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Erreur</h3>
              <p className="mt-1 text-sm text-gray-500">
                {error || "Cette annonce n'existe pas ou a été supprimée."}
              </p>
              <div className="mt-6">
                <Button
                  to="/dashboard/annonces"
                  variant="primary"
                >
                  Retour à mes annonces
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {annonce.titre}
          </h1>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-4">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <TruckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span className="capitalize">{annonce.typeTransport || 'Transport'}</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              {annonce.villeDepart} ? {annonce.villeArrivee}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              {formatDate(annonce.dateDepart)}
            </div>
            <div className="mt-2 flex items-center text-sm">
              {renderStatus(annonce.statut)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {isOwner && annonce.statut === 'disponible' && (
            <>
              <Button
                to={`/dashboard/annonces/${id}/edit`}
                variant="outline"
                className="mr-3"
              >
                <PencilIcon className="h-5 w-5 mr-1" />
                Modifier
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
              >
                <TrashIcon className="h-5 w-5 mr-1" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Détails
          </button>
          {isOwner && (
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'devis'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('devis')}
            >
              Devis {devis.length > 0 && `(${devis.length})`}
            </button>
          )}
          {(selectedDevis || annonce.statut !== 'disponible') && (
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suivi'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('suivi')}
            >
              Suivi
            </button>
          )}
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'messages'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </nav>
      </div>

      {/* Contenu de l'onglet sélectionné */}
      {activeTab === 'details' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              Détails de l'annonce
            </h2>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  {annonce.description}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Client</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {annonce.client ? (
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                        {annonce.client.photo ? (
                          <img 
                            src={annonce.client.photo} 
                            alt={`${annonce.client.prenom} ${annonce.client.nom}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{annonce.client.prenom} {annonce.client.nom}</p>
                        {annonce.client.averageRating && (
                          <div className="flex items-center mt-1">
                            <StarIcon className="h-4 w-4 text-yellow-400" />
                            <span className="ml-1 text-xs text-gray-500">
                              {annonce.client.averageRating.toFixed(1)} ({annonce.client.reviewCount} avis)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    'Information non disponible'
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Type de transport</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                  {annonce.typeTransport}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Trajet</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{annonce.villeDepart}</p>
                    </div>
                    <div className="h-px w-4 bg-gray-300 mx-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{annonce.villeArrivee}</p>
                    </div>
                  </div>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date de départ</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(annonce.dateDepart)}
                </dd>
              </div>
              {annonce.poids && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Poids</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {annonce.poids} kg
                  </dd>
                </div>
              )}
              {annonce.volume && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Volume</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {annonce.volume} m³
                  </dd>
                </div>
              )}
              {annonce.dimensions && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {annonce.dimensions}
                  </dd>
                </div>
              )}
              {annonce.valeurDeclaree && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Valeur déclarée</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {annonce.valeurDeclaree} €
                  </dd>
                </div>
              )}
              {annonce.isUrgent && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Urgence</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Demande urgente
                    </span>
                  </dd>
                </div>
              )}
              {annonce.instructionsSpeciales && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Instructions spéciales</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                    {annonce.instructionsSpeciales}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Images de l'annonce */}
          {annonce.images && annonce.images.length > 0 && (
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Images</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {annonce.images.map((image) => (
                  <div key={image._id} className="relative">
                    <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src={image.url}
                        alt="Image de l'annonce"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onglet des devis (visible uniquement pour le propriétaire) */}
      {activeTab === 'devis' && isOwner && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              Devis reçus ({devis.length})
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Comparez les offres des transporteurs et sélectionnez celle qui vous convient le mieux.
            </p>
          </div>
          
          {devis.length === 0 ? (
            <div className="px-4 py-12 text-center border-t border-gray-200">
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun devis</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore reçu de devis pour cette annonce.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transporteur
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livraison prévue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devis.map((devis) => (
                    <tr key={devis._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {devis.transporteur?.photo ? (
                              <img 
                                src={devis.transporteur.photo} 
                                alt={`${devis.transporteur.prenom} ${devis.transporteur.nom}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {devis.transporteur?.prenom} {devis.transporteur?.nom}
                            </div>
                            {devis.transporteur?.averageRating && (
                              <div className="flex items-center">
                                <StarIcon className="h-4 w-4 text-yellow-400" />
                                <span className="ml-1 text-xs text-gray-500">
                                  {devis.transporteur.averageRating.toFixed(1)} ({devis.transporteur.reviewCount} avis)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{devis.montant} €</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(devis.delaiLivraison)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          devis.statut === 'en_attente' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : devis.statut === 'accepte' || devis.statut === 'en_cours'
                              ? 'bg-green-100 text-green-800'
                              : devis.statut === 'refuse'
                                ? 'bg-red-100 text-red-800'
                                : devis.statut === 'termine'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}>
                          {devis.statut === 'en_attente' 
                            ? 'En attente' 
                            : devis.statut === 'accepte'
                              ? 'Accepté'
                              : devis.statut === 'en_cours'
                                ? 'En cours'
                                : devis.statut === 'refuse'
                                  ? 'Refusé'
                                  : devis.statut === 'termine'
                                    ? 'Terminé'
                                    : devis.statut === 'annule'
                                      ? 'Annulé'
                                      : devis.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            to={`/dashboard/devis/${devis._id}`}
                            variant="outline"
                            size="sm"
                          >
                            Détails
                          </Button>
                          
                          {devis.statut === 'en_attente' && annonce.statut === 'disponible' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setDevisToAccept(devis);
                                  setShowAcceptDevisModal(true);
                                }}
                              >
                                Accepter
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setDevisToReject(devis);
                                  setShowRejectDevisModal(true);
                                }}
                              >
                                Refuser
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Onglet de suivi */}
      {activeTab === 'suivi' && (
        <div className="space-y-6">
          <TrackingComponent annonceId={id} />
          
          {/* Informations sur le devis accepté */}
          {selectedDevis && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Détails du transport
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Informations sur le transporteur et les conditions du transport
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Transporteur</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                          {selectedDevis.transporteur?.photo ? (
                            <img 
                              src={selectedDevis.transporteur.photo} 
                              alt={`${selectedDevis.transporteur.prenom} ${selectedDevis.transporteur.nom}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {selectedDevis.transporteur?.prenom} {selectedDevis.transporteur?.nom}
                          </p>
                          {selectedDevis.transporteur?.averageRating && (
                            <div className="flex items-center mt-1">
                              <StarIcon className="h-4 w-4 text-yellow-400" />
                              <span className="ml-1 text-xs text-gray-500">
                                {selectedDevis.transporteur.averageRating.toFixed(1)} ({selectedDevis.transporteur.reviewCount} avis)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Montant</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="font-semibold">{selectedDevis.montant} €</span>
                    </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Livraison prévue</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(selectedDevis.delaiLivraison)}
                    </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Message du transporteur</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                      {selectedDevis.message}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onglet des messages */}
      {activeTab === 'messages' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg h-[600px]">
          {annonce.client && (
            <ConversationComponent 
              annonceId={id}
              recipientId={isOwner ? null : annonce.client._id}
            />
          )}
        </div>
      )}

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
                  isLoading={processingAction}
                  disabled={processingAction}
                  className="sm:ml-3"
                >
                  Supprimer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={processingAction}
                  className="mt-3 sm:mt-0"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation d'acceptation de devis */}
      {showAcceptDevisModal && devisToAccept && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Accepter le devis
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Vous êtes sur le point d'accepter le devis de {devisToAccept.transporteur?.prenom} {devisToAccept.transporteur?.nom} pour un montant de {devisToAccept.montant} €.
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Une fois accepté, vous ne pourrez plus revenir en arrière ni accepter d'autres devis pour cette annonce.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAcceptDevis}
                  isLoading={processingAction}
                  disabled={processingAction}
                  className="sm:ml-3"
                >
                  Confirmer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAcceptDevisModal(false);
                    setDevisToAccept(null);
                  }}
                  disabled={processingAction}
                  className="mt-3 sm:mt-0"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de refus de devis */}
      {showRejectDevisModal && devisToReject && (
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
                    <XMarkIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Refuser le devis
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Vous êtes sur le point de refuser le devis de {devisToReject.transporteur?.prenom} {devisToReject.transporteur?.nom}.
                      </p>
                      <div className="mt-4">
                        <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700">
                          Motif du refus (optionnel)
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="rejectReason"
                            name="rejectReason"
                            rows={3}
                            className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                            placeholder="Indiquez la raison de votre refus..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleRejectDevis}
                  isLoading={processingAction}
                  disabled={processingAction}
                  className="sm:ml-3"
                >
                  Refuser le devis
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRejectDevisModal(false);
                    setDevisToReject(null);
                    setRejectReason('');
                  }}
                  disabled={processingAction}
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

export default AnnonceDetailPage;