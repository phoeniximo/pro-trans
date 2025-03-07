import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  TruckIcon, 
  CalendarIcon, 
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Button from '../ui/Button';

/**
 * Carte de devis réutilisable pour les listes de devis
 * @param {Object} devis - Données du devis
 * @param {boolean} isDashboard - Si la carte est affichée dans le tableau de bord
 * @param {string} userRole - Rôle de l'utilisateur (client, transporteur)
 */
const DevisCard = ({ devis, isDashboard = false, userRole = 'client' }) => {
  const displayDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  // Statut formaté et couleur correspondante
  const getStatusDisplay = (statut) => {
    const statusConfig = {
      en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      accepte: { label: 'Accepté', color: 'bg-green-100 text-green-800' },
      refuse: { label: 'Refusé', color: 'bg-red-100 text-red-800' },
      annule: { label: 'Annulé', color: 'bg-gray-100 text-gray-800' },
      termine: { label: 'Terminé', color: 'bg-purple-100 text-purple-800' }
    };

    return statusConfig[statut] || { label: 'Inconnu', color: 'bg-gray-100 text-gray-800' };
  };

  const status = getStatusDisplay(devis.statut);
  
  // Information à afficher selon le rôle
  const userInfo = userRole === 'client' 
    ? devis.transporteur 
    : devis.client;
  
  // Construire l'URL appropriée
  const getDevisUrl = () => {
    return `/dashboard/devis/${devis._id}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* En-tête du devis */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {devis.annonce?.titre || 'Devis'}
            </h3>
            <div className="text-sm text-gray-500">
              Ref: {devis._id.substring(0, 8)}
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Prix */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-teal-600">
            {devis.montant.toFixed(2)} €
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            Livraison en {devis.delaiLivraison} jour{devis.delaiLivraison > 1 ? 's' : ''}
          </div>
        </div>

        {/* Période et véhicule */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span>Du {displayDate(devis.dateDebut)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span>Au {displayDate(devis.dateFin)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 col-span-2">
            <TruckIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span>Véhicule: {devis.vehiculeType}</span>
          </div>
        </div>

        {/* Utilisateur */}
        {userInfo && (
          <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {userInfo.photo ? (
                <img
                  src={userInfo.photo}
                  alt={`${userInfo.prenom} ${userInfo.nom}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-teal-500 text-white">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium">
                {userInfo.prenom} {userInfo.nom}
              </div>
              {userInfo.rating && (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(userInfo.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-gray-500">
                    ({userInfo.nbAvis || 0})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Commentaire (tronqué) */}
        {devis.commentaire && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">{devis.commentaire}</p>
          </div>
        )}

        {/* Bouton de détail */}
        <div className="mt-2">
          <Button
            to={getDevisUrl()}
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

export default DevisCard;