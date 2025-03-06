import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  PencilSquareIcon,
  TruckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import RatingAndReviewsComponent from '../../components/reviews/RatingAndReviewsComponent';
import apiClient from '../../api/client';
import { formatDate } from '../../utils/dateUtils';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/users/profile');
        setProfile(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        setError('Erreur lors du chargement du profil');
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune information de profil disponible</p>
      </div>
    );
  }

  const TransporteurInfo = () => {
    if (user.role !== 'transporteur') return null;

    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Information transporteur</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Détails de votre activité de transport</p>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type de véhicule</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.transporteur?.typeVehicule || 'Non spécifié'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Capacité (poids)</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.transporteur?.capacitePoids 
                  ? `${profile.transporteur.capacitePoids} kg` 
                  : 'Non spécifié'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Capacité (volume)</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.transporteur?.capaciteVolume 
                  ? `${profile.transporteur.capaciteVolume} m³` 
                  : 'Non spécifié'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Zones desservies</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.transporteur?.zonesDesservies?.join(', ') || 'Non spécifié'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Assurance</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.transporteur?.assurance ? 'Vérifié' : 'Non vérifié'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Statut de vérification</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  profile.transporteur?.verifie 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.transporteur?.verifie ? 'Vérifié' : 'En attente de vérification'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <Button to="/profile/edit" variant="primary">
          <PencilSquareIcon className="h-5 w-5 mr-2" />
          Modifier mon profil
        </Button>
      </div>

      {/* Section d'informations personnelles */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-start">
          <div className="flex-shrink-0 h-20 w-20 rounded-full overflow-hidden bg-gray-200 mr-4">
            {profile.photo ? (
              <img 
                src={profile.photo} 
                alt={`${profile.prenom} ${profile.nom}`} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-teal-500 text-white">
                <UserIcon className="h-10 w-10" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {profile.prenom} {profile.nom}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 flex items-center">
              <span className={`mr-2 px-2 py-1 text-xs font-medium rounded-full ${
                profile.role === 'transporteur' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {profile.role === 'transporteur' ? 'Transporteur' : 'Client'}
              </span>
              <span>Membre depuis {formatDate(profile.createdAt, 'MMMM yyyy')}</span>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.email}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                Téléphone
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.telephone}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                Adresse
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.adresse ? (
                  <>
                    {profile.adresse.rue}<br />
                    {profile.adresse.codePostal} {profile.adresse.ville}<br />
                    {profile.adresse.pays}
                  </>
                ) : (
                  'Non spécifiée'
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <IdentificationIcon className="h-5 w-5 mr-2 text-gray-400" />
                SIRET (si professionnel)
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.siret || 'Non spécifié'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                {profile.description || 'Aucune description'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Section d'informations transporteur */}
      <TransporteurInfo />

      {/* Section des avis */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
          Avis et évaluations
        </h3>
        <RatingAndReviewsComponent userId={user.id} />
      </div>
    </div>
  );
};

export default ProfilePage;