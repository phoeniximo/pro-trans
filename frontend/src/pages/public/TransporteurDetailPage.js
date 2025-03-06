import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  UserIcon, 
  TruckIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import RatingAndReviewsComponent from '../../components/reviews/RatingAndReviewsComponent';
import { useAuth } from '../../hooks/useAuth';

const TransporteurDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [transporteur, setTransporteur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentAnnonces, setRecentAnnonces] = useState([]);

  useEffect(() => {
    const fetchTransporteur = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/users/profile/${id}`);
        setTransporteur(response.data.data);
        
        // Récupérer les annonces récentes où ce transporteur a été choisi
        if (response.data.data.recentDeliveries) {
          setRecentAnnonces(response.data.data.recentDeliveries);
        }
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du profil transporteur:', err);
        setError('Impossible de charger les informations du transporteur');
        toast.error('Erreur lors du chargement du profil transporteur');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTransporteur();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error || !transporteur) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || "Ce transporteur n'existe pas ou a été supprimé."}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Button
            to="/transporteurs"
            variant="primary"
          >
            Retour à la liste des transporteurs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête du transporteur */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {transporteur.photo ? (
                  <img
                    src={transporteur.photo}
                    alt={`${transporteur.prenom} ${transporteur.nom}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-12 w-12 text-gray-400 m-4" />
                )}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {transporteur.prenom} {transporteur.nom}
                </h1>
                <p className="text-sm text-gray-500">Membre depuis {new Date(transporteur.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>
              </div>
            </div>
            {isAuthenticated && user?.id !== id && (
              <Button
                to={`/messages/nouveau/${id}`}
                variant="outline"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Contacter
              </Button>
            )}
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-1 text-gray-400" />
                  Type de transporteur
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {transporteur.typeTransporteur || 'Indépendant'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-1 text-gray-400" />
                  Localisation
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {transporteur.adresse?.ville || 'Non spécifié'}, {transporteur.adresse?.pays || 'France'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-1 text-gray-400" />
                  Disponibilité
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {transporteur.disponibilite || 'Flexible'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Transports effectués</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {transporteur.nbLivraisons || '0'}
                </dd>
              </div>
              {transporteur.specialites && transporteur.specialites.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Spécialités</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-2">
                      {transporteur.specialites.map((specialite, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                        >
                          {specialite}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
              {transporteur.aboutMe && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">A propos</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {transporteur.aboutMe}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Types de véhicules */}
        {transporteur.vehicules && transporteur.vehicules.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Véhicules</h2>
              <p className="mt-1 text-sm text-gray-500">
                Liste des véhicules utilisés pour le transport
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {transporteur.vehicules.map((vehicule, index) => (
                    <li key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <TruckIcon className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-base font-medium text-gray-900">
                            {vehicule.type || 'Véhicule'} - {vehicule.marque} {vehicule.modele}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {vehicule.annee || ''}
                            {vehicule.capacite && ` - Capacité: ${vehicule.capacite}`}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Livraisons récentes */}
        {recentAnnonces && recentAnnonces.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Livraisons récentes</h2>
              <p className="mt-1 text-sm text-gray-500">
                Aperçu des dernières livraisons effectuées
              </p>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {recentAnnonces.map((annonce) => (
                  <li key={annonce._id} className="px-4 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {annonce.villeDepart} ? {annonce.villeArrivee}
                        </p>
                        <p className="text-sm text-gray-500">
                          {annonce.typeTransport} - {new Date(annonce.dateDepart).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        {annonce.rating && (
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">?</span>
                            <span className="text-sm text-gray-600">{annonce.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Avis sur le transporteur */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Avis et évaluations</h2>
            <p className="mt-1 text-sm text-gray-500">
              Ce que disent les clients de {transporteur.prenom}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <RatingAndReviewsComponent 
                userId={id}
                showSubmitForm={isAuthenticated && user?.id !== id} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporteurDetailPage;