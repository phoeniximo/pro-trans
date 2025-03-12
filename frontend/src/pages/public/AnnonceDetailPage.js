import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EyeIcon, PencilIcon, ArrowLeftIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

import annonceService from '../../services/annonceService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { STATUT_ANNONCE_LABELS, STATUT_ANNONCE_COLORS } from '../../utils/constants';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';

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
  const { isAuthenticated, user } = useAuth();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Récupérer les détails de l'annonce
  useEffect(() => {
    const fetchAnnonceDetails = async () => {
      try {
        setLoading(true);
        const response = await annonceService.getAnnonceById(id);
        
        // Debug logs pour le développement
        console.log("Réponse de l'annonce:", response);
        
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
          setError('Erreur lors de la récupération de l\'annonce');
          toast.error('Erreur lors de la récupération de l\'annonce');
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
      <div className="container mx-auto py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
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
                to="/annonces"
                variant="outline"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Retour aux annonces
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si aucune annonce n'est trouvée
  if (!annonce) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
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
                to="/annonces"
                variant="outline"
              >
                Retour aux annonces
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStatus = (statut) => {
    const statusClass = STATUT_ANNONCE_COLORS[statut] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {STATUT_ANNONCE_LABELS[statut] || statut}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fil d'Ariane */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">
                  Accueil
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/annonces" className="ml-2 text-gray-500 hover:text-gray-700">
                  Annonces
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-gray-700 font-medium truncate max-w-xs">
                  {annonce.titre}
                </span>
              </li>
            </ol>
          </nav>
        </div>

        {/* En-tête de l'annonce */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900 mr-3">{annonce.titre}</h1>
                  {renderStatus(annonce.statut)}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Publiée le {annonce.createdAt ? safeFormatDate(annonce.createdAt) : 'Date inconnue'}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                {annonce.budget ? (
                  <span className="text-2xl font-bold text-teal-600">{formatCurrency(annonce.budget)} DH</span>
                ) : (
                  <span className="text-md text-gray-500 italic">Budget non précisé</span>
                )}
              </div>
            </div>
          </div>

          {/* Photos */}
          {annonce.photos && annonce.photos.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {annonce.photos.map((photo, index) => {
                  let photoUrl = '';
                  if (typeof photo === 'string') {
                    if (photo.startsWith('http')) {
                      photoUrl = photo;
                    } else if (photo.startsWith('/uploads/')) {
                      photoUrl = `${apiBaseUrl}${photo}`;
                    } else {
                      photoUrl = photo;
                    }
                  }
                  
                  return photoUrl ? (
                    <div key={index} className="aspect-w-16 aspect-h-9 rounded-lg bg-gray-100 overflow-hidden">
                      <img 
                        src={photoUrl} 
                        alt={`Photo ${index + 1} de l'annonce`} 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.error(`Erreur de chargement de l'image: ${photoUrl}`);
                          e.target.src = "/images/default.jpg";
                        }}
                      />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Informations principales */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne de gauche: détails principaux */}
            <div className="lg:col-span-2">
              <div className="prose max-w-none">
                <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
                <div className="text-gray-700 whitespace-pre-line">{annonce.description}</div>
                
                {/* Caractéristiques */}
                <h2 className="text-lg font-medium text-gray-900 mt-6 mb-3">Caractéristiques</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Type de transport</h3>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{annonce.typeTransport}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de transport</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {annonce.dateDepart ? safeFormatDate(annonce.dateDepart) : 'Date non spécifiée'}
                    </p>
                  </div>
                  
                  {annonce.poids && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Poids</h3>
                      <p className="mt-1 text-sm text-gray-900">{annonce.poids} {annonce.unite_poids || 'kg'}</p>
                    </div>
                  )}
                  
                  {annonce.volume && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Volume</h3>
                      <p className="mt-1 text-sm text-gray-900">{annonce.volume} m³</p>
                    </div>
                  )}
                  
                  {annonce.dimensions && (annonce.dimensions.longueur || annonce.dimensions.largeur || annonce.dimensions.hauteur) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Dimensions</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {annonce.dimensions.longueur || '-'} × {annonce.dimensions.largeur || '-'} × {annonce.dimensions.hauteur || '-'} {annonce.dimensions.unite || 'cm'}
                      </p>
                    </div>
                  )}
                  
                  {annonce.nombreColis > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nombre de colis</h3>
                      <p className="mt-1 text-sm text-gray-900">{annonce.nombreColis}</p>
                    </div>
                  )}
                  
                  {annonce.isUrgent && (
                    <div className="sm:col-span-2">
                      <Badge color="red">Transport urgent</Badge>
                    </div>
                  )}
                </div>
                
                {/* Détails du transport */}
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
                
                {/* Options demandées */}
                {annonce.optionsTransport && Object.values(annonce.optionsTransport).some(v => v) && (
                  <>
                    <h2 className="text-lg font-medium text-gray-900 mt-6 mb-3">Options demandées</h2>
                    <div className="flex flex-wrap gap-2">
                      {annonce.optionsTransport.chargement && (
                        <Badge color="blue">Aide au chargement</Badge>
                      )}
                      {annonce.optionsTransport.dechargement && (
                        <Badge color="blue">Aide au déchargement</Badge>
                      )}
                      {annonce.optionsTransport.montage && (
                        <Badge color="blue">Montage des meubles</Badge>
                      )}
                      {annonce.optionsTransport.demontage && (
                        <Badge color="blue">Démontage des meubles</Badge>
                      )}
                      {annonce.optionsTransport.emballage && (
                        <Badge color="blue">Emballage des objets</Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Colonne de droite: contact et actions */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact</h3>
                
                {annonce.utilisateur && (
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      {annonce.utilisateur.photo ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={annonce.utilisateur.photo}
                          alt={`${annonce.utilisateur.prenom} ${annonce.utilisateur.nom}`}
                          onError={(e) => { e.target.src = "/images/default.jpg"; }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                          {annonce.utilisateur.prenom ? annonce.utilisateur.prenom.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        {annonce.utilisateur.prenom} {annonce.utilisateur.nom}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Membre depuis {annonce.utilisateur.createdAt ? 
                          safeFormatDate(annonce.utilisateur.createdAt, 'MMM yyyy') : 
                          'Date inconnue'}
                      </p>
                    </div>
                  </div>
                )}
                
                {isAuthenticated ? (
                  <>
                    {showContactInfo ? (
                      <div className="space-y-3 text-sm">
                        {annonce.utilisateur?.email && (
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span>{annonce.utilisateur.email}</span>
                          </div>
                        )}
                        {annonce.utilisateur?.telephone && (
                          <div className="flex items-center">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span>{annonce.utilisateur.telephone}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        fullWidth 
                        onClick={() => setShowContactInfo(true)}
                      >
                        Afficher les coordonnées
                      </Button>
                    )}
                    
                    {user?.role === 'transporteur' && annonce.statut === 'disponible' && (
                      <Button 
                        to={`/dashboard/devis/create/${annonce._id}`} 
                        variant="primary" 
                        fullWidth
                        className="mt-3"
                      >
                        Proposer un devis
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Connectez-vous pour contacter le client ou proposer un devis
                    </p>
                    <Button to="/login" variant="primary" fullWidth>
                      Se connecter
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Pas encore inscrit ? <Link to="/register" className="text-teal-600 hover:underline">Créer un compte</Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Annonces similaires (optionnel) */}
        {/* Cette section pourrait être ajoutée ultérieurement */}
      </div>
    </div>
  );
};

export default AnnonceDetailPage;