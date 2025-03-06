import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  TruckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../../api/client';
import Button from '../../../components/ui/Button';
import ConversationComponent from '../../../components/messaging/ConversationComponent';

const ConversationPage = () => {
  const { conversationId } = useParams();
  const [annonceDetails, setAnnonceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extraire annonceId et contactId du conversationId (format: "annonceId_contactId")
  const annonceId = conversationId?.split('_')[0];
  const contactId = conversationId?.split('_')[1];

  useEffect(() => {
    const fetchAnnonceDetails = async () => {
      if (!annonceId) return;
      
      try {
        setLoading(true);
        const response = await apiClient.get(`/annonces/${annonceId}`);
        setAnnonceDetails(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des détails de l\'annonce:', err);
        setError('Erreur lors du chargement des détails de l\'annonce');
        toast.error('Erreur lors du chargement des détails de l\'annonce');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonceDetails();
  }, [annonceId]);

  if (!conversationId || !annonceId || !contactId) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
            <div>
              <p className="text-red-700">Conversation non valide ou introuvable</p>
              <Button 
                to="/dashboard/messages"
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Retour aux messages
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button
          to="/dashboard/messages"
          variant="outline"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux conversations
        </Button>
      </div>

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
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* En-tête avec les détails de l'annonce */}
          {annonceDetails && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TruckIcon className="h-6 w-6 text-gray-400 mr-2" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {annonceDetails.titre}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {annonceDetails.villeDepart} ? {annonceDetails.villeArrivee}
                    </p>
                  </div>
                </div>
                <Link 
                  to={`/dashboard/annonces/${annonceId}`}
                  className="text-sm font-medium text-teal-600 hover:text-teal-500"
                >
                  Voir l'annonce
                </Link>
              </div>
            </div>
          )}
          
          {/* Composant de conversation */}
          <div className="h-[calc(80vh-100px)]">
            <ConversationComponent 
              annonceId={annonceId} 
              recipientId={contactId} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationPage;