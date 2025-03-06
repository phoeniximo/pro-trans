import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ChatBubbleLeftRightIcon, 
  ChevronRightIcon,
  UserIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import apiClient from '../../../api/client';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Chargement des conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/messages/conversations');
        setConversations(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des conversations:', err);
        setError('Erreur lors du chargement des conversations. Veuillez réessayer.');
        toast.error('Erreur lors du chargement des conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Rafraîchir les conversations
  const refreshConversations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/messages/conversations');
      setConversations(response.data.data);
      setError(null);
      toast.success('Conversations mises à jour');
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des conversations:', err);
      toast.error('Erreur lors du rafraîchissement des conversations');
    } finally {
      setLoading(false);
    }
  };

  // Calculer le temps écoulé depuis le dernier message
  const getTimeAgo = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return diffDays === 1 ? 'Hier' : `Il y a ${diffDays} jours`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'A l\'instant';
    }
  };

  // Filtrer les conversations selon la recherche
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.utilisateur;
    const searchLower = searchQuery.toLowerCase();
    
    return (
      otherUser.nom.toLowerCase().includes(searchLower) ||
      otherUser.prenom.toLowerCase().includes(searchLower) ||
      conv.annonce.titre.toLowerCase().includes(searchLower) ||
      (conv.dernierMessage && conv.dernierMessage.contenu.toLowerCase().includes(searchLower))
    );
  });

  // Tronquer le texte s'il est trop long
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <Button
          variant="outline"
          onClick={refreshConversations}
          disabled={loading}
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="Rechercher dans les conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des conversations */}
      {loading && conversations.length === 0 ? (
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
                onClick={refreshConversations}
              >
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucune conversation</h3>
          <p className="mt-2 text-gray-500">
            Vous n'avez pas encore de conversations. Parcourez les annonces pour contacter un utilisateur.
          </p>
          <Button
            to={user.role === 'client' ? '/dashboard/annonces/create' : '/annonces'}
            variant="primary"
            className="mt-4"
          >
            {user.role === 'client' ? 'Créer une annonce' : 'Parcourir les annonces'}
          </Button>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun résultat</h3>
          <p className="mt-2 text-gray-500">
            Aucune conversation ne correspond à votre recherche.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSearchQuery('')}
          >
            Effacer la recherche
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.utilisateur;
              const conversationId = `${conversation.annonce._id}_${otherUser._id}`;
              
              return (
                <li key={conversationId}>
                  <Link 
                    to={`/dashboard/messages/${conversationId}`}
                    className="block hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <div className="px-6 py-4 flex items-center">
                      {/* Avatar de l'utilisateur */}
                      <div className="flex-shrink-0 relative">
                        {otherUser.photo ? (
                          <img
                            src={otherUser.photo}
                            alt={`${otherUser.prenom} ${otherUser.nom}`}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-teal-500 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-white" />
                          </div>
                        )}
                        
                        {/* Badge pour messages non lus */}
                        {conversation.nonLus > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {conversation.nonLus > 9 ? '9+' : conversation.nonLus}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Informations sur la conversation */}
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-medium text-gray-900 truncate">
                              {otherUser.prenom} {otherUser.nom}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <TruckIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{conversation.annonce.titre}</span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500">
                              {conversation.dernierMessage ? getTimeAgo(conversation.dernierMessage.date) : ''}
                            </span>
                            {conversation.dernierMessage && conversation.dernierMessage.expediteur === user.id && (
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <span className="mr-1">
                                  {conversation.dernierMessage.lu ? 'Lu' : 'Envoyé'}
                                </span>
                                {conversation.dernierMessage.lu ? (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                ) : (
                                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Dernier message */}
                        {conversation.dernierMessage && (
                          <p className={`mt-2 text-sm ${conversation.nonLus > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'} truncate`}>
                            {truncateText(conversation.dernierMessage.contenu)}
                          </p>
                        )}
                      </div>
                      
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-2" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;