import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  TruckIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MapPinIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/client';
import trackingService from '../../services/trackingService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

const TrackingComponent = ({ annonceId, devisId }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [signature, setSignature] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const { id } = useParams(); // If component is used in a route with annonceId parameter
  const { user } = useAuth();

  // Use either the passed prop or the URL parameter
  const effectiveAnnonceId = annonceId || id;
  
  // Check if user is a transporter
  const isTransporter = user && user.role === 'transporteur';

  // Define tracking statuses that the transporter can update to
  const trackingStatusOptions = [
    { value: 'pris_en_charge', label: 'Prise en charge', icon: <CheckCircleIcon className="h-5 w-5 mr-2" /> },
    { value: 'en_transit', label: 'En transit', icon: <TruckIcon className="h-5 w-5 mr-2" /> },
    { value: 'en_livraison', label: 'En livraison', icon: <MapPinIcon className="h-5 w-5 mr-2" /> },
    { value: 'livre', label: 'Livré', icon: <CheckCircleIcon className="h-5 w-5 mr-2" /> }
  ];

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/tracking/${effectiveAnnonceId}`);
        setTrackingData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tracking data:', err);
        setError('Impossible de récupérer les informations de suivi.');
        setLoading(false);
      }
    };

    if (effectiveAnnonceId) {
      fetchTrackingData();
    }
  }, [effectiveAnnonceId]);

  // Function to handle delivery form submission
  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    
    if (!signature) {
      toast.error('Une signature est requise pour confirmer la livraison');
      return;
    }
    
    try {
      setUpdatingStatus(true);
      
      // Use markAsDelivered for the "livre" status - this will also update the devis status
      await trackingService.markAsDelivered(effectiveAnnonceId, {
        signatureBase64: signature,
        signatureName: signatureName || 'Client',
        commentaire: 'Livraison effectuée et signée'
      });
      
      // Refresh the tracking data
      const response = await apiClient.get(`/tracking/${effectiveAnnonceId}`);
      setTrackingData(response.data.data);
      
      // Hide the form and show success message
      setShowDeliveryForm(false);
      toast.success('Colis marqué comme livré avec succès');
    } catch (err) {
      console.error('Erreur lors de la confirmation de livraison:', err);
      toast.error('Erreur lors de la confirmation de livraison');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Function to update tracking status
  const handleUpdateStatus = async (status) => {
    // For "livre" status, we need to show the delivery form with signature
    if (status === 'livre') {
      setShowDeliveryForm(true);
      return;
    }
    
    try {
      setUpdatingStatus(true);
      
      let commentaire = '';
      let localisation = '';
      
      switch(status) {
        case 'pris_en_charge':
          commentaire = 'Le transporteur a pris en charge votre colis';
          localisation = trackingData.villeDepart || '';
          break;
        case 'en_transit':
          commentaire = 'Votre colis est en transit';
          localisation = 'En route';
          break;
        case 'en_livraison':
          commentaire = 'Votre colis est en cours de livraison';
          localisation = trackingData.villeArrivee || '';
          break;
        default:
          commentaire = 'Mise à jour du statut';
      }

      // Use trackingService to update the status
      // This will also automatically update the devis status
      await trackingService.updateTrackingStatus(
        effectiveAnnonceId,
        status,
        commentaire,
        localisation
      );

      // NO NEED to update devis separately - it causes duplicate history entries

      // Refresh the tracking data
      const response = await apiClient.get(`/tracking/${effectiveAnnonceId}`);
      setTrackingData(response.data.data);
      
      toast.success('Statut mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  // If there's no tracking data yet, show a placeholder
  if (!trackingData || !trackingData.tracking) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <ClockIcon className="h-12 w-12 text-gray-400" />
        </div>
        <p className="text-center text-gray-600 mt-4">
          Le suivi de ce transport n'est pas encore disponible. Il sera activé dès que le transporteur aura pris en charge votre demande.
        </p>
        
        {/* Show initial status update button for transporters */}
        {isTransporter && devisId && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="primary"
              onClick={() => handleUpdateStatus('pris_en_charge')}
              disabled={updatingStatus}
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Prendre en charge ce transport
            </Button>
          </div>
        )}
      </div>
    );
  }

  const { tracking, statut: annonceStatut } = trackingData;

  // Define status details for display
  const statusDetails = {
    en_attente: { 
      label: 'En attente de prise en charge', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: ClockIcon,
      description: 'Le transporteur n\'a pas encore commencé le transport.'
    },
    pris_en_charge: { 
      label: 'Pris en charge', 
      color: 'bg-blue-100 text-blue-800', 
      icon: CheckCircleIcon,
      description: 'Le transporteur a accepté votre demande et va préparer le transport.'
    },
    en_transit: { 
      label: 'En transit', 
      color: 'bg-indigo-100 text-indigo-800', 
      icon: TruckIcon,
      description: 'Votre colis est en cours de transport.'
    },
    en_livraison: { 
      label: 'En cours de livraison', 
      color: 'bg-purple-100 text-purple-800', 
      icon: TruckIcon,
      description: 'La livraison est en cours à l\'adresse de destination.'
    },
    livre: { 
      label: 'Livré', 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircleIcon,
      description: 'Votre colis a été livré avec succès.'
    },
    probleme: { 
      label: 'Problème', 
      color: 'bg-red-100 text-red-800', 
      icon: ExclamationCircleIcon,
      description: 'Un problème est survenu durant le transport. Le transporteur va vous contacter.'
    }
  };

  const currentStatus = statusDetails[tracking.statut] || statusDetails.en_attente;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Current Status Header */}
      <div className={`px-6 py-4 ${currentStatus.color} flex items-center justify-between`}>
        <div className="flex items-center">
          <StatusIcon className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-semibold">{currentStatus.label}</h3>
        </div>
        {tracking.codeTracking && (
          <div className="text-sm">
            Code de suivi: <span className="font-mono font-medium">{tracking.codeTracking}</span>
          </div>
        )}
      </div>

      {/* Status Description */}
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="text-gray-600">{currentStatus.description}</p>
      </div>

      {/* Delivery Form (shown when marking as delivered) */}
      {showDeliveryForm && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Confirmation de livraison</h4>
          <form onSubmit={handleDeliverySubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">
                  Signature (requis)
                </label>
                <textarea
                  id="signature"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Veuillez coller la signature du client (base64) ou écrire 'SIGNÉ' pour simuler"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  La signature est requise pour confirmer la livraison.
                </p>
              </div>
              
              <div>
                <label htmlFor="signatureName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du signataire
                </label>
                <input
                  type="text"
                  id="signatureName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Nom de la personne qui a signé"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeliveryForm(false)}
                  disabled={updatingStatus}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!signature || updatingStatus}
                >
                  {updatingStatus ? 'Traitement en cours...' : 'Confirmer la livraison'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Progress Steps */}
      <div className="px-6 py-4">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="h-0.5 w-full bg-gray-200"></div>
          </div>

          {/* Progress Steps */}
          <div className="relative flex justify-between">
            {/* Step 1: En attente */}
            <div className={`flex flex-col items-center`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                ['pris_en_charge', 'en_transit', 'en_livraison', 'livre'].includes(tracking.statut) 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}>
                1
              </div>
              <div className="text-xs text-center mt-1">Prise en charge</div>
            </div>

            {/* Step 2: En transit */}
            <div className={`flex flex-col items-center`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                ['en_transit', 'en_livraison', 'livre'].includes(tracking.statut) 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}>
                2
              </div>
              <div className="text-xs text-center mt-1">En transit</div>
            </div>

            {/* Step 3: En livraison */}
            <div className={`flex flex-col items-center`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                ['en_livraison', 'livre'].includes(tracking.statut) 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}>
                3
              </div>
              <div className="text-xs text-center mt-1">En livraison</div>
            </div>

            {/* Step 4: Livré */}
            <div className={`flex flex-col items-center`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                tracking.statut === 'livre' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}>
                4
              </div>
              <div className="text-xs text-center mt-1">Livré</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Buttons for Transporters */}
      {isTransporter && devisId && tracking.statut !== 'livre' && !showDeliveryForm && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Mettre à jour le statut du transport</h4>
          <div className="grid grid-cols-2 gap-3">
            {trackingStatusOptions.map((option) => {
              // Only show status options that are next in sequence or the current status
              const currentIndex = Object.keys(statusDetails).findIndex(key => key === tracking.statut);
              const optionIndex = Object.keys(statusDetails).findIndex(key => key === option.value);
              
              // Allow current status or next status only (prevents skipping steps)
              const isAllowed = optionIndex === currentIndex || optionIndex === currentIndex + 1;
              
              // Don't show options that are before the current status
              if (optionIndex < currentIndex) return null;
              
              return (
                <Button
                  key={option.value}
                  variant={tracking.statut === option.value ? "primary" : "outline"}
                  onClick={() => handleUpdateStatus(option.value)}
                  disabled={updatingStatus || !isAllowed}
                  className="flex items-center justify-center"
                >
                  {option.icon}
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracking History */}
      {tracking.historique && tracking.historique.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Historique du suivi</h4>
          <div className="space-y-4">
            {tracking.historique.map((event, index) => {
              const eventStatus = statusDetails[event.statut] || {};
              const EventIcon = eventStatus.icon || ClockIcon;

              return (
                <div key={index} className="flex items-start">
                  <div className={`rounded-full h-6 w-6 flex items-center justify-center ${eventStatus.color || 'bg-gray-100'} mr-3`}>
                    <EventIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">{eventStatus.label || event.statut}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(event.date), 'dd MMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                    {(event.commentaire || event.localisation) && (
                      <div className="mt-1 text-sm text-gray-600">
                        {event.commentaire && <p>{event.commentaire}</p>}
                        {event.localisation && (
                          <p className="text-xs text-gray-500 mt-1">Localisation: {event.localisation}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingComponent;