import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  TruckIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import apiClient from '../../api/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TrackingComponent = ({ annonceId, devisId }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // If component is used in a route with annonceId parameter

  // Use either the passed prop or the URL parameter
  const effectiveAnnonceId = annonceId || id;

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
                ['en_attente', 'pris_en_charge', 'en_transit', 'en_livraison', 'livre'].includes(tracking.statut) 
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