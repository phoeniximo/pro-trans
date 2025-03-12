import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EyeIcon, PencilIcon, ArrowLeftIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

import annonceService from '../../../services/annonceService';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { STATUT_ANNONCE_LABELS, STATUT_ANNONCE_COLORS } from '../../../utils/constants';
import Button from '../../../components/ui/Button';

// Fonction utilitaire pour la vérification des dates avant formatage - CORRIGÉE
const safeFormatDate = (dateValue, formatString = 'dd MMMM yyyy') => {
  if (!dateValue) {
    return 'Date non spécifiée';
  }
  
  try {
    // Conversion en objet Date
    let dateObj;
    if (typeof dateValue === 'string') {
      dateObj = new Date(dateValue);
    } else {
      dateObj = dateValue;
    }
    
    // Vérification approfondie de la validité
    if (isNaN(dateObj.getTime())) {
      console.warn(`Date invalide détectée: "${dateValue}"`);
      return 'Date non disponible';
    }
    
    // Utiliser la fonction format de date-fns directement
    return format(dateObj, formatString, { locale: fr });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error, dateValue);
    return 'Date invalide';
  }
};

const AnnonceDetailPage = () => {
  const { id } = useParams();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Récupérer les détails de l'annonce
  useEffect(() => {
    const fetchAnnonceDetails = async () => {
      try {
        setLoading(true);
        const response = await annonceService.getAnnonceById(id);
        
        // Debug logs améliorés
        console.log("Réponse complète de l'annonce:", response);
        
        // Vérification spécifique des formats de date pour le débogage
        if (response.data) {
          console.log("Formats des dates dans l'annonce:", {
            createdAt: response.data.createdAt,
            dateDepart: response.data.dateDepart,
            dateArrivee: response.data.dateArrivee,
          });
        }
        
        if (response.success) {
          // Nettoyage des dates potentiellement problématiques
          if (response.data) {
            // Si la date n'est pas valide, la définir comme null
            if (response.data.dateDepart && isNaN(new Date(response.data.dateDepart).getTime())) {
              console.warn("Date de départ invalide détectée, nettoyage effectué");
              response.data.dateDepart = null;
            }
            if (response.data.dateArrivee && isNaN(new Date(response.data.dateArrivee).getTime())) {
              console.warn("Date d'arrivée invalide détectée, nettoyage effectué");
              response.data.dateArrivee = null;
            }
            if (response.data.createdAt && isNaN(new Date(response.data.createdAt).getTime())) {
              console.warn("Date de création invalide détectée, nettoyage effectué");
              response.data.createdAt = null;
            }
          }
          
          setAnnonce(response.data);
          setError(null);
        } else {
          setError(response.message || 'Erreur lors de la récupération de l\'annonce');
          toast.error(response.message || 'Erreur lors de la récupération de l\'annonce');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des détails de l\'annonce:', err);
        setError('Impossible de charger les détails de l\'annonce');
        toast.error('Erreur lors de la récupération des détails de l\'annonce');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonceDetails();
  }, [id]);

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Erreur</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-6">
                <Button
                  to="/dashboard/annonces"
                  variant="outline"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1" />
                  Retour à mes annonces
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si aucune annonce n'est trouvée
  if (!annonce) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Annonce non trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                L'annonce que vous recherchez n'existe pas ou a été supprimée.
              </p>
              <div className="mt-6">
                <Button
                  to="/dashboard/annonces"
                  variant="outline"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1" />
                  Retour à mes annonces
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher le statut avec la bonne couleur
  const renderStatus = (statut) => {
    const statusClass = STATUT_ANNONCE_COLORS[statut] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {STATUT_ANNONCE_LABELS[statut] || statut}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* En-tête avec actions */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {annonce.titre}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Référence: {annonce._id} • Créée le: {annonce.createdAt ? safeFormatDate(annonce.createdAt) : 'Date inconnue'}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button
            to="/dashboard/annonces"
            variant="outline"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Retour
          </Button>
          
          {annonce.statut === 'disponible' && (
            <Button
              to={`/dashboard/annonces/${annonce._id}/edit`}
              variant="primary"
            >
              <PencilIcon className="h-5 w-5 mr-1" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Statut et informations importantes */}
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Détails de l'annonce
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {annonce.typeTransport} • {annonce.villeDepart} → {annonce.villeArrivee}
              </p>
            </div>
            <div>
              {renderStatus(annonce.statut)}
            </div>
          </div>
        </div>

        {/* Détails de l'annonce */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{annonce.description || 'Aucune description'}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Ville de départ</dt>
              <dd className="mt-1 text-sm text-gray-900">{annonce.villeDepart}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Ville d'arrivée</dt>
              <dd className="mt-1 text-sm text-gray-900">{annonce.villeArrivee}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Date de départ</dt>
              <dd className="mt-1 text-sm text-gray-900">{annonce.dateDepart ? safeFormatDate(annonce.dateDepart) : 'Date non spécifiée'}</dd>
            </div>

            {annonce.dateArrivee && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Date d'arrivée</dt>
                <dd className="mt-1 text-sm text-gray-900">{safeFormatDate(annonce.dateArrivee)}</dd>
              </div>
            )}

            {annonce.flexibiliteDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Flexibilité</dt>
                <dd className="mt-1 text-sm text-gray-900">Le client est flexible sur les dates (± 2 jours)</dd>
              </div>
            )}

            {annonce.poids && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Poids</dt>
                <dd className="mt-1 text-sm text-gray-900">{annonce.poids} {annonce.unite_poids || 'kg'}</dd>
              </div>
            )}

            {annonce.volume && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Volume</dt>
                <dd className="mt-1 text-sm text-gray-900">{annonce.volume} m³</dd>
              </div>
            )}

            {annonce.dimensions && (annonce.dimensions.longueur || annonce.dimensions.largeur || annonce.dimensions.hauteur) && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {annonce.dimensions.longueur || '-'} × {annonce.dimensions.largeur || '-'} × {annonce.dimensions.hauteur || '-'} {annonce.dimensions.unite || 'cm'}
                </dd>
              </div>
            )}

            {annonce.nombreColis > 1 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre de colis</dt>
                <dd className="mt-1 text-sm text-gray-900">{annonce.nombreColis}</dd>
              </div>
            )}

            {annonce.budget > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Budget estimé</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatCurrency(annonce.budget)} DH</dd>
              </div>
            )}

            {annonce.isUrgent && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Urgence</dt>
                <dd className="mt-1 text-sm text-gray-900">Transport urgent</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Options de transport */}
        {(annonce.optionsTransport && Object.values(annonce.optionsTransport).some(v => v)) && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 mb-3">Options de transport demandées</dt>
            <div className="flex flex-wrap gap-2">
              {annonce.optionsTransport.chargement && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Aide au chargement
                </span>
              )}
              {annonce.optionsTransport.dechargement && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Aide au déchargement
                </span>
              )}
              {annonce.optionsTransport.montage && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Montage des meubles
                </span>
              )}
              {annonce.optionsTransport.demontage && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Démontage des meubles
                </span>
              )}
              {annonce.optionsTransport.emballage && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Emballage des objets
                </span>
              )}
            </div>
          </div>
        )}

        {/* Instructions pour le transporteur */}
        {annonce.commentairesTransporteur && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 mb-1">Instructions pour le transporteur</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{annonce.commentairesTransporteur}</dd>
          </div>
        )}

        {/* Photos */}
        {annonce.photos && annonce.photos.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Photos ({annonce.photos.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {annonce.photos.map((photo, index) => {
                console.log(`Photo ${index}:`, photo);
                
                // Construire l'URL complète
                let photoUrl = '';
                if (typeof photo === 'string') {
                  // Si c'est une URL absolue
                  if (photo.startsWith('http')) {
                    photoUrl = photo;
                  } 
                  // Si c'est un chemin relatif
                  else if (photo.startsWith('/uploads/')) {
                    photoUrl = `${apiBaseUrl}${photo}`;
                  } 
                  // Autre format
                  else {
                    photoUrl = photo;
                  }
                }
                
                return photoUrl ? (
                  <div key={index} className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
                    <img 
                      src={photoUrl} 
                      alt={`Photo ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        console.error(`Erreur de chargement de l'image: ${photoUrl}`);
                        e.target.src = `/images/default.jpg`; // Image par défaut corrigée
                      }}
                    />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Détails du transport */}
        <div className="px-6 py-4 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Détails du transport</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Adresse de départ</h3>
              <p className="mt-1 text-gray-900 whitespace-pre-line">{annonce.villeDepart}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Adresse d'arrivée</h3>
              <p className="mt-1 text-gray-900 whitespace-pre-line">{annonce.villeArrivee}</p>
            </div>
          </div>
        </div>

        {/* Informations sur le client */}
        {annonce.utilisateur && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Informations sur le client</h3>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <img
                  className="h-10 w-10 rounded-full"
                  src={annonce.utilisateur.photo || "/images/default.jpg"}
                  alt={`Photo de ${annonce.utilisateur.prenom}`}
                />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {annonce.utilisateur.nom && annonce.utilisateur.prenom
                    ? `${annonce.utilisateur.prenom} ${annonce.utilisateur.nom}`
                    : "Utilisateur inconnu"}
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  {annonce.utilisateur.email && (
                    <span className="inline-flex items-center mr-3">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      {annonce.utilisateur.email}
                    </span>
                  )}
                  {annonce.utilisateur.telephone && (
                    <span className="inline-flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {annonce.utilisateur.telephone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Devis section - if applicable */}
      {annonce.devis && annonce.devis.length > 0 && (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Devis reçus
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {annonce.devis.length} devis pour cette annonce
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transporteur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Délai
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {annonce.devis.map((devis) => (
                  <tr key={devis._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {devis.transporteur && (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={devis.transporteur.photo || "/images/default.jpg"}
                              alt={`Photo de ${devis.transporteur.prenom}`}
                              onError={(e) => { e.target.src = "/images/default.jpg"; }}
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {devis.transporteur
                              ? `${devis.transporteur.prenom} ${devis.transporteur.nom}`
                              : "Transporteur inconnu"}
                          </div>
                          {devis.transporteur && devis.transporteur.notation && (
                            <div className="text-sm text-gray-500">
                              {Array(5).fill().map((_, i) => (
                                <span key={i} className={(i < Math.round(devis.transporteur.notation)) ? 'text-yellow-400' : 'text-gray-300'}>
                                  ★
                                </span>
                              ))}
                              <span className="ml-1">({devis.transporteur.notation.toFixed(1)})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(devis.montant)} DH</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{devis.delaiLivraison} jours</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {devis.statut === 'accepte' ? 'Accepté' : 
                         devis.statut === 'refuse' ? 'Refusé' : 
                         devis.statut === 'en_attente' ? 'En attente' : 
                         devis.statut === 'termine' ? 'Terminé' : 
                         devis.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/dashboard/devis/${devis._id}`} className="text-blue-600 hover:text-blue-900">
                        Voir détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnonceDetailPage;