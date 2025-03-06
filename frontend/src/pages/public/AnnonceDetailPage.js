import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  MapPinIcon, 
  CalendarIcon, 
  TruckIcon,
  UserIcon,
  ScaleIcon,
  CubeIcon,
  CurrencyEuroIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/client';
import { TYPE_TRANSPORT_LABELS, STATUT_ANNONCE_COLORS } from '../../utils/constants';

const AnnonceDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Etat pour le formulaire de message
  const [message, setMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Etats pour le formulaire de devis (transporteurs uniquement)
  const [showDevisForm, setShowDevisForm] = useState(false);
  const [devisData, setDevisData] = useState({
    montant: '',
    message: '',
    delaiLivraison: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // par défaut : dans 7 jours
  });
  const [isSendingDevis, setIsSendingDevis] = useState(false);

  // Chargement des données de l'annonce
  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/annonces/${id}`);
        setAnnonce(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'annonce:', err);
        setError('Erreur lors du chargement de l\'annonce. Veuillez réessayer.');
        toast.error('Erreur lors du chargement de l\'annonce');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonce();
  }, [id]);

  // Gérer l'envoi d'un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour envoyer un message');
      navigate('/login', { state: { from: `/annonces/${id}` } });
      return;
    }
    
    if (!message.trim()) {
      toast.error('Veuillez entrer un message');
      return;
    }
    
    try {
      setIsSendingMessage(true);
      
      await apiClient.post('/messages', {
        contenu: message,
        destinataire: annonce.utilisateur._id,
        annonce: annonce._id
      });
      
      toast.success('Message envoyé avec succès');
      setMessage('');
      
      // Rediriger vers la page de conversation
      navigate(`/dashboard/messages/${annonce._id}_${annonce.utilisateur._id}`);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Gérer l'envoi d'un devis (pour les transporteurs)
  const handleSendDevis = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || user.role !== 'transporteur') {
      toast.error('Vous devez être connecté en tant que transporteur pour envoyer un devis');
      return;
    }
    
    if (!devisData.montant || !devisData.message || !devisData.delaiLivraison) {
      toast.error('Veuillez remplir tous les champs du devis');
      return;
    }
    
    try {
      setIsSendingDevis(true);
      
      await apiClient.post('/devis', {
        annonce: annonce._id,
        montant: parseFloat(devisData.montant),
        message: devisData.message,
        delaiLivraison: devisData.delaiLivraison
      });
      
      toast.success('Devis envoyé avec succès');
      setShowDevisForm(false);
      setDevisData({
        montant: '',
        message: '',
        delaiLivraison: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      
      // Rediriger vers la page des devis
      navigate('/dashboard/devis');
    } catch (err) {
      console.error('Erreur lors de l\'envoi du devis:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi du devis');
    } finally {
      setIsSendingDevis(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error || !annonce) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
            <div>
              <p className="text-red-700">{error || 'Annonce non trouvée'}</p>
              <Button 
                to="/annonces"
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Retour aux annonces
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formater la date
  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  // Déterminer si l'utilisateur connecté est le propriétaire de l'annonce
  const isOwner = isAuthenticated && user.id === annonce.utilisateur._id;
  
  // Déterminer si l'utilisateur peut envoyer un devis (transporteur et pas propriétaire)
  const canSendDevis = isAuthenticated && user.role === 'transporteur' && !isOwner && annonce.statut === 'disponible';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Bouton de retour et statut */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <Button
          to="/annonces"
          variant="outline"
          className="mb-4 sm:mb-0"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux annonces
        </Button>
        
        <div className="flex items-center">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${STATUT_ANNONCE_COLORS[annonce.statut]}`}>
            {annonce.statut === 'disponible' ? 'Disponible' : 
             annonce.statut === 'en_attente' ? 'En attente' : 
             annonce.statut === 'en_cours' ? 'En cours' : 
             annonce.statut === 'termine' ? 'Terminé' : 'Annulé'}
          </span>
          
          {annonce.isUrgent && (
            <span className="ml-2 px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
              Urgent
            </span>
          )}
        </div>
      </div>
      
      {/* Bandeau d'information pour le propriétaire */}
      {isOwner && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Vous êtes le propriétaire de cette annonce. 
                <Link 
                  to={`/dashboard/annonces/${annonce._id}`} 
                  className="font-medium text-blue-700 underline ml-1"
                >
                  Gérer cette annonce
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Détails de l'annonce */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {/* Titre et informations principales */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{annonce.titre}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-2">
                <div className="flex items-center mr-6 mb-2 sm:mb-0">
                  <TruckIcon className="h-5 w-5 text-gray-400 mr-1" />
                  <span>{TYPE_TRANSPORT_LABELS[annonce.typeTransport] || annonce.typeTransport}</span>
                </div>
                <div className="flex items-center mr-6 mb-2 sm:mb-0">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-1" />
                  <span>{formatDate(annonce.dateDepart)}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-1" />
                  <span>{annonce.villeDepart} ? {annonce.villeArrivee}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{annonce.description}</p>
            </div>
            
            {/* Photos */}
            {annonce.images && annonce.images.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-3">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {annonce.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative h-40 bg-gray-100 rounded-lg overflow-hidden shadow-sm"
                    >
                      <img 
                        src={image} 
                        alt={`Photo ${index + 1}`} 
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Détails du transport */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Détails du transport</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Adresse de départ</h3>
                  <p className="mt-1 text-gray-900 whitespace-pre-line">{annonce.adresseDepart}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Adresse d'arrivée</h3>
                  <p className="mt-1 text-gray-900 whitespace-pre-line">{annonce.adresseArrivee}</p>
                </div>
              </div>
            </div>
            
            {/* Caractéristiques */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Caractéristiques</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {annonce.poids && (
                  <div className="flex items-center">
                    <ScaleIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Poids</h3>
                      <p className="text-gray-900">{annonce.poids} kg</p>
                    </div>
                  </div>
                )}
                
                {annonce.volume && (
                  <div className="flex items-center">
                    <CubeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Volume</h3>
                      <p className="text-gray-900">{annonce.volume} m³</p>
                    </div>
                  </div>
                )}
                
                {(annonce.longueur || annonce.largeur || annonce.hauteur) && (
                  <div className="flex items-center">
                    <div className="h-5 w-5 flex items-center justify-center text-gray-400 mr-2">
                      <span className="text-sm font-semibold">3D</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Dimensions</h3>
                      <p className="text-gray-900">
                        {annonce.longueur ? `L: ${annonce.longueur} cm` : ''} 
                        {annonce.largeur ? ` l: ${annonce.largeur} cm` : ''} 
                        {annonce.hauteur ? ` H: ${annonce.hauteur} cm` : ''}
                      </p>
                    </div>
                  </div>
                )}
                
                {annonce.prixMax && (
                  <div className="flex items-center">
                    <CurrencyEuroIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Prix maximum</h3>
                      <p className="text-gray-900">{annonce.prixMax} €</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                    <p className="text-gray-900">{formatDate(annonce.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              {annonce.instructions && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">Instructions particulières</h3>
                  <p className="mt-1 text-gray-900 whitespace-pre-line">{annonce.instructions}</p>
                </div>
              )}
            </div>
            
            {/* Formulaire de devis (pour les transporteurs) */}
            {canSendDevis && (
              <div className="px-6 py-4">
                {!showDevisForm ? (
                  <Button 
                    variant="primary" 
                    onClick={() => setShowDevisForm(true)}
                    fullWidth
                  >
                    <TruckIcon className="h-5 w-5 mr-2" />
                    Proposer un devis
                  </Button>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Proposer un devis</h3>
                    <form onSubmit={handleSendDevis} className="space-y-4">
                      <div>
                        <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-1">
                          Montant (€) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CurrencyEuroIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="montant"
                            id="montant"
                            step="0.01"
                            min="0"
                            required
                            className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            placeholder="0.00"
                            value={devisData.montant}
                            onChange={(e) => setDevisData({ ...devisData, montant: e.target.value })}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">EUR</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="delaiLivraison" className="block text-sm font-medium text-gray-700 mb-1">
                          Date de livraison estimée <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="delaiLivraison"
                            id="delaiLivraison"
                            required
                            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            value={devisData.delaiLivraison ? format(new Date(devisData.delaiLivraison), 'yyyy-MM-dd') : ''}
                            onChange={(e) => setDevisData({ ...devisData, delaiLivraison: new Date(e.target.value) })}
                            min={format(new Date(), 'yyyy-MM-dd')}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={4}
                          required
                          className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Présentez votre offre en détail..."
                          value={devisData.message}
                          onChange={(e) => setDevisData({ ...devisData, message: e.target.value })}
                        ></textarea>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowDevisForm(false)}
                          disabled={isSendingDevis}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isSendingDevis}
                          disabled={isSendingDevis}
                        >
                          Envoyer le devis
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar - Informations sur l'utilisateur et contact */}
        <div>
          {/* Carte utilisateur */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">A propos du client</h2>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {annonce.utilisateur.photo ? (
                    <img 
                      src={annonce.utilisateur.photo} 
                      alt={`${annonce.utilisateur.prenom} ${annonce.utilisateur.nom}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-teal-500 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {annonce.utilisateur.prenom} {annonce.utilisateur.nom}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Membre depuis {format(new Date(annonce.utilisateur.createdAt), 'MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              
              {/* Note et avis */}
              {annonce.utilisateur.noteMoyenne && (
                <div className="mt-4 flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(annonce.utilisateur.noteMoyenne)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="ml-2 text-sm text-gray-700">
                    {annonce.utilisateur.noteMoyenne.toFixed(1)} ({annonce.utilisateur.nbAvis || 0} avis)
                  </p>
                </div>
              )}
              
              {/* Badges de confiance */}
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-1" />
                  <span>Identité vérifiée</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-1" />
                  <span>Email vérifié</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-1" />
                  <span>Téléphone vérifié</span>
                </div>
              </div>
              
              {/* Lien vers le profil */}
              <div className="mt-6">
                <Button 
                  to={`/transporteurs/${annonce.utilisateur._id}`} 
                  variant="outline"
                  fullWidth
                >
                  Voir le profil
                </Button>
              </div>
            </div>
          </div>
          
          {/* Formulaire de contact */}
          {!isOwner && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Contacter le client</h2>
              </div>
              
              <div className="px-6 py-4">
                {!isAuthenticated ? (
                  <div className="text-center py-4">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Connectez-vous pour contacter le client
                    </p>
                    <Button 
                      to={`/login?redirect=/annonces/${annonce._id}`} 
                      variant="primary"
                    >
                      Se connecter
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="contact-message"
                        rows={4}
                        required
                        className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Posez vos questions au client..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isLoading={isSendingMessage}
                      disabled={isSendingMessage || !message.trim()}
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                      Envoyer un message
                    </Button>
                  </form>
                )}
                
                {/* Note d'information */}
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700">
                    En contactant le client, vous acceptez de respecter les règles de notre plateforme. 
                    Les négociations et paiements doivent être effectués via Pro-Trans pour votre sécurité.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnonceDetailPage;