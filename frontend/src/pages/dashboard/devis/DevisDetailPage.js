import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  TruckIcon, 
  MapPinIcon, 
  CalendarIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import Button from '../../../components/ui/Button';
import TrackingComponent from '../../../components/transport/TrackingComponent';
import PaymentComponent from '../../../components/payment/PaymentComponent';
import apiClient from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';
import { STATUT_DEVIS_COLORS, STATUT_DEVIS_LABELS } from '../../../utils/constants';

const DevisDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Charger les détails du devis
  useEffect(() => {
    const fetchDevisDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/devis/${id}`);
        setDevis(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des détails du devis:', err);
        setError('Erreur lors du chargement des détails du devis. Veuillez réessayer.');
        toast.error('Erreur lors du chargement des détails du devis');
      } finally {
        setLoading(false);
      }
    };

    fetchDevisDetails();
  }, [id]);

  // Gérer l'acceptation du devis (pour les clients)
  const handleAcceptDevis = async () => {
    try {
      await apiClient.put(`/devis/${id}/accepter`);
      toast.success('Devis accepté avec succès !');
      
      // Mettre à jour le devis
      setDevis({ ...devis, statut: 'accepte' });
      
      // Afficher le formulaire de paiement
      setShowPaymentForm(true);
    } catch (err) {
      console.error('Erreur lors de l\'acceptation du devis:', err);
      toast.error('Erreur lors de l\'acceptation du devis');
    }
  };

  // Gérer le refus du devis (pour les clients)
  const handleRefuseDevis = async () => {
    try {
      await apiClient.put(`/devis/${id}/refuser`, { raison: 'Refusé par le client' });
      toast.success('Devis refusé avec succès');
      
      // Mettre à jour le devis
      setDevis({ ...devis, statut: 'refuse' });
    } catch (err) {
      console.error('Erreur lors du refus du devis:', err);
      toast.error('Erreur lors du refus du devis');
    }
  };

  // Gérer l'annulation du devis (pour les transporteurs)
  const handleCancelDevis = async () => {
    try {
      await apiClient.put(`/devis/${id}/annuler`, { raison: 'Annulé par le transporteur' });
      toast.success('Devis annulé avec succès');
      
      // Mettre à jour le devis
      setDevis({ ...devis, statut: 'annule' });
    } catch (err) {
      console.error('Erreur lors de l\'annulation du devis:', err);
      toast.error('Erreur lors de l\'annulation du devis');
    }
  };

  // Gérer la mise à jour du statut de transport (pour les transporteurs)
  const handleUpdateStatus = async (statut, commentaire = '', localisation = '') => {
    try {
      await apiClient.put(`/devis/${id}/statut`, { statut, commentaire, localisation });
      toast.success('Statut mis à jour avec succès');
      
      // Recharger le devis pour avoir les dernières informations
      const response = await apiClient.get(`/devis/${id}`);
      setDevis(response.data.data);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Gérer le paiement complété
  const handlePaymentComplete = (paymentData) => {
    toast.success('Paiement effectué avec succès !');
    setShowPaymentForm(false);
    
    // Recharger le devis pour avoir les dernières informations
    const fetchUpdatedDevis = async () => {
      try {
        const response = await apiClient.get(`/devis/${id}`);
        setDevis(response.data.data);
      } catch (err) {
        console.error('Erreur lors du chargement des détails du devis:', err);
      }
    };
    
    fetchUpdatedDevis();
  };

  // Formater une date
  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error || !devis) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
            <div>
              <p className="text-red-700">{error || 'Devis non trouvé'}</p>
              <Button 
                to="/dashboard/devis"
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Retour aux devis
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Déterminer l'autre partie (client ou transporteur) avec vérification de sécurité
  const otherParty = user.role === 'client' 
    ? (devis.transporteur || {}) 
    : (devis.client || {});
  
  // Déterminer si l'utilisateur peut prendre des actions
  const canAccept = user.role === 'client' && devis.statut === 'en_attente';
  const canRefuse = user.role === 'client' && devis.statut === 'en_attente';
  const canCancel = user.role === 'transporteur' && devis.statut === 'en_attente';
  const canUpdateStatus = user.role === 'transporteur' && devis.statut === 'accepte';
  const needsPayment = user.role === 'client' && devis.statut === 'accepte' && !devis.paiement;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          to="/dashboard/devis"
          variant="outline"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux devis
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Devis #{devis._id.substring(0, 8)}</h1>
            <p className="text-sm text-gray-500">
              Créé le {formatDate(devis.createdAt)}
            </p>
          </div>
          <div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${STATUT_DEVIS_COLORS[devis.statut]}`}>
              {STATUT_DEVIS_LABELS[devis.statut]}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations de base */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informations du devis</h2>
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CurrencyEuroIcon className="h-5 w-5 text-gray-400 mr-1.5" />
                    Montant
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900">{devis.montant.toFixed(2)} €</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-1.5" />
                    Délai de livraison
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(devis.delaiLivraison)}</dd>
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Message</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line bg-gray-50 p-3 rounded-md">
                    {devis.message}
                  </dd>
                </div>
                
                {devis.commentaires && devis.commentaires.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Commentaires</dt>
                    <dd className="mt-1">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {devis.commentaires.map((commentaire, index) => (
                          <li key={index} className="p-3 flex items-start">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {commentaire.auteur === (devis.client?._id || '') 
                                  ? `${devis.client?.prenom || ''} ${devis.client?.nom || ''} (Client)`
                                  : `${devis.transporteur?.prenom || ''} ${devis.transporteur?.nom || ''} (Transporteur)`}
                              </p>
                              <p className="text-sm text-gray-500">{formatDate(commentaire.date)}</p>
                              <p className="mt-1 text-sm text-gray-900">{commentaire.contenu}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
              
              {/* Actions */}
              {(canAccept || canRefuse || canCancel || canUpdateStatus || needsPayment) && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                  
                  <div className="flex flex-wrap gap-3">
                    {canAccept && (
                      <Button
                        variant="primary"
                        onClick={handleAcceptDevis}
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Accepter le devis
                      </Button>
                    )}
                    
                    {canRefuse && (
                      <Button
                        variant="danger"
                        onClick={handleRefuseDevis}
                      >
                        <XMarkIcon className="h-5 w-5 mr-2" />
                        Refuser le devis
                      </Button>
                    )}
                    
                    {canCancel && (
                      <Button
                        variant="danger"
                        onClick={handleCancelDevis}
                      >
                        <XMarkIcon className="h-5 w-5 mr-2" />
                        Annuler le devis
                      </Button>
                    )}
                    
                    {canUpdateStatus && (
                      <div className="w-full space-y-3">
                        <Button
                          variant="primary"
                          onClick={() => handleUpdateStatus('en_cours', 'Transport en cours', devis.annonce.villeDepart)}
                          className="w-full sm:w-auto"
                        >
                          <TruckIcon className="h-5 w-5 mr-2" />
                          Démarrer le transport
                        </Button>
                        
                        {devis.statut === 'en_cours' && (
                          <Button
                            variant="primary"
                            onClick={() => handleUpdateStatus('livre', 'Livraison effectuée', devis.annonce.villeArrivee)}
                            className="w-full sm:w-auto"
                          >
                            <CheckIcon className="h-5 w-5 mr-2" />
                            Marquer comme livré
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {needsPayment && (
                      <Button
                        variant="primary"
                        onClick={() => setShowPaymentForm(true)}
                        className="w-full sm:w-auto"
                      >
                        <CurrencyEuroIcon className="h-5 w-5 mr-2" />
                        Effectuer le paiement
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Paiement */}
              {showPaymentForm && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Paiement</h3>
                  <PaymentComponent 
                    devisId={devis._id} 
                    montant={devis.montant} 
                    onPaymentComplete={handlePaymentComplete} 
                  />
                </div>
              )}
              
              {devis.paiement && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de paiement</h3>
                  
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Statut</dt>
                      <dd className="mt-1">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Payé
                        </span>
                      </dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(devis.paiement.date)}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Montant</dt>
                      <dd className="mt-1 text-sm text-gray-900">{devis.paiement.montant.toFixed(2)} €</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Méthode</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {devis.paiement.methode === 'carte' 
                          ? 'Carte bancaire' 
                          : devis.paiement.methode === 'virement' 
                            ? 'Virement bancaire' 
                            : 'PayPal'}
                      </dd>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Référence</dt>
                      <dd className="mt-1 text-sm text-gray-900">{devis.paiement.reference}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
            
            {/* Informations sur l'autre partie et l'annonce */}
            <div>
              {/* Info sur l'autre partie */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {user.role === 'client' ? 'Transporteur' : 'Client'}
                </h2>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {otherParty && otherParty.photo ? (
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={otherParty.photo}
                        alt={`${otherParty.prenom || ''} ${otherParty.nom || ''}`}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-teal-500 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {otherParty?.prenom || ''} {otherParty?.nom || ''}
                    </h3>
                    {otherParty?.createdAt && (
                      <p className="text-sm text-gray-500">
                        Membre depuis {format(new Date(otherParty.createdAt), 'MMMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>
                
                {otherParty?.note && (
                  <div className="mt-4 flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i}
                          className={`h-5 w-5 ${i < Math.round(otherParty.note) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor" 
                          aria-hidden="true"
                        >
                          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{otherParty.note.toFixed(1)}</span>
                  </div>
                )}
                
                {otherParty && otherParty._id && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      to={`/dashboard/messages/${devis.annonce._id}_${otherParty._id}`}
                      variant="outline"
                      size="sm"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                      Contacter
                    </Button>
                    <Button
                      to={user.role === 'client' 
                        ? `/transporteurs/${otherParty._id}` 
                        : `/clients/${otherParty._id}`}
                      variant="outline"
                      size="sm"
                    >
                      <UserIcon className="h-5 w-5 mr-2" />
                      Voir le profil
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Détails de l'annonce */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Détails de l'annonce</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{devis.annonce.titre}</h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>{devis.annonce.villeDepart} → {devis.annonce.villeArrivee}</p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>Départ prévu le {formatDate(devis.annonce.dateDepart)}</p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <TruckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>
                        {devis.annonce.typeTransport === 'colis' ? 'Colis' :
                         devis.annonce.typeTransport === 'meuble' ? 'Meuble' :
                         devis.annonce.typeTransport === 'marchandise' ? 'Marchandise' :
                         devis.annonce.typeTransport === 'palette' ? 'Palette' :
                         devis.annonce.typeTransport === 'demenagement' ? 'Déménagement' :
                         devis.annonce.typeTransport === 'vehicule' ? 'Véhicule' : 'Autre'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {devis.annonce.description.length > 200 
                        ? devis.annonce.description.substring(0, 200) + '...' 
                        : devis.annonce.description}
                    </p>
                  </div>
                  
                  <div className="flex pt-3 border-t border-gray-200">
                    <Button
                      to={`/dashboard/annonces/${devis.annonce._id}`}
                      variant="outline"
                      size="sm"
                    >
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Voir l'annonce complète
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Suivi du transport */}
      {(devis.statut === 'accepte' || devis.statut === 'en_cours' || devis.statut === 'termine') && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Suivi du transport</h2>
          </div>
          
          <div className="px-6 py-4">
            <TrackingComponent devisId={devis._id} annonceId={devis.annonce._id} />
          </div>
        </div>
      )}
      
      {/* Informations supplémentaires */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Informations supplémentaires</h2>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 flex items-start">
              <ShieldCheckIcon className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Protection acheteur</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Tous les transports effectués via Pro-Trans sont assurés. Votre paiement est sécurisé et n'est versé au transporteur qu'une fois la livraison confirmée.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-800">Conditions du service</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-1.5">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-green-500">✓</span>
                  <span className="ml-2">Transporteur vérifié par nos équipes</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-green-500">✓</span>
                  <span className="ml-2">Suivi en temps réel de votre transport</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-green-500">✓</span>
                  <span className="ml-2">Assurance de base incluse (jusqu'à 1000€)</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-green-500">✓</span>
                  <span className="ml-2">Support client disponible 7j/7</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>
              Pour toute question ou besoin d'assistance, n'hésitez pas à contacter notre service client au 01 23 45 67 89 ou à support@pro-trans.fr.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevisDetailPage;