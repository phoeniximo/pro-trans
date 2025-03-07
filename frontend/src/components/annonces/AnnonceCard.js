import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  TruckIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ScaleIcon, 
  CubeIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Button from '../ui/Button';

/**
 * Carte d'annonce réutilisable pour les listes d'annonces
 * @param {Object} annonce - Données de l'annonce
 * @param {boolean} isDashboard - Si la carte est affichée dans le tableau de bord
 * @param {boolean} isDetailed - Si la carte doit afficher plus de détails
 */
const AnnonceCard = ({ annonce, isDashboard = false, isDetailed = false }) => {
  const displayDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  // Statut formaté et couleur correspondante
  const getStatusDisplay = (statut) => {
    const statusConfig = {
      disponible: { label: 'Disponible', color: 'bg-green-100 text-green-800' },
      en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
      termine: { label: 'Terminé', color: 'bg-gray-100 text-gray-800' },
      annule: { label: 'Annulé', color: 'bg-red-100 text-red-800' }
    };

    return statusConfig[statut] || { label: 'Inconnu', color: 'bg-gray-100 text-gray-800' };
  };

  const status = getStatusDisplay(annonce.statut);
  
  // Construire l'URL appropriée selon le contexte
  const getAnnonceUrl = () => {
    return isDashboard 
      ? `/dashboard/annonces/${annonce._id}` 
      : `/annonces/${annonce._id}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* En-tête de l'annonce */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {annonce.titre}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Prix et date */}
        <div className="flex justify-between items-center mb-4">
          {annonce.budget ? (
            <div className="text-xl font-bold text-teal-600">
              {annonce.budget} €
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Budget non précisé
            </div>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {displayDate(annonce.dateDepart)}
          </div>
        </div>

        {/* Trajet */}
        <div className="flex items-center mb-3">
          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div className="flex-1 flex items-center">
            <span className="font-medium">{annonce.villeDepart}</span>
            <ArrowPathIcon className="h-4 w-4 mx-2 text-gray-400" />
            <span className="font-medium">{annonce.villeArrivee}</span>
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <TruckIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span>{annonce.typeTransport || 'Non précisé'}</span>
          </div>
          
          {annonce.poids && (
            <div className="flex items-center text-sm text-gray-600">
              <ScaleIcon className="h-4 w-4 text-gray-400 mr-1" />
              <span>{annonce.poids} kg</span>
            </div>
          )}
          
          {annonce.volume && (
            <div className="flex items-center text-sm text-gray-600">
              <CubeIcon className="h-4 w-4 text-gray-400 mr-1" />
              <span>{annonce.volume} m³</span>
            </div>
          )}
          
          {annonce.isUrgent && (
            <div className="flex items-center text-sm text-red-600">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Urgent</span>
            </div>
          )}
        </div>

        {/* Utilisateur (si détaillé) */}
        {isDetailed && annonce.utilisateur && (
          <div className="flex items-center mt-3 mb-4 pb-3 border-b border-gray-200">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {annonce.utilisateur.photo ? (
                <img
                  src={annonce.utilisateur.photo}
                  alt={`${annonce.utilisateur.prenom} ${annonce.utilisateur.nom}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-teal-500 text-white">
                  {annonce.utilisateur.prenom ? annonce.utilisateur.prenom.charAt(0) : '?'}
                </div>
              )}
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium">
                {annonce.utilisateur.prenom} {annonce.utilisateur.nom}
              </div>
              {annonce.utilisateur.rating && (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(annonce.utilisateur.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-gray-500">
                    ({annonce.utilisateur.nbAvis || 0})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description (si détaillée) */}
        {isDetailed && annonce.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-3">{annonce.description}</p>
          </div>
        )}

        {/* Bouton de détail */}
        <div className="mt-2">
          <Button
            to={getAnnonceUrl()}
            variant="outline"
            fullWidth
          >
            Voir les détails
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnnonceCard;