import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { 
  DocumentTextIcon, 
  TruckIcon, 
  ChatBubbleLeftRightIcon, 
  StarIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState({
    annonces: [],
    devis: [],
    messages: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Endpoint différent selon le rôle de l'utilisateur
        const endpoint = user.role === 'transporteur' 
          ? '/dashboard/transporteur' 
          : '/dashboard/client';
        
        const response = await apiClient.get(endpoint);
        
        setStats(response.data.data.stats);
        setRecentItems({
          annonces: response.data.data.recentAnnonces || [],
          devis: response.data.data.recentDevis || [],
          messages: response.data.data.recentMessages || []
        });
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du tableau de bord:', err);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.role]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
          <div>
            <p className="text-red-700">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Contenu pour le client
  const ClientDashboard = () => (
    <div className="space-y-6">
      {/* Cartes de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Annonces */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-teal-500 rounded-md p-3">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Annonces Actives</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.annonces?.actives || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/annonces" className="font-medium text-teal-700 hover:text-teal-900 flex items-center">
                Voir toutes mes annonces
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Devis */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Devis en Attente</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.devis?.enAttente || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/devis" className="font-medium text-teal-700 hover:text-teal-900 flex items-center">
                Voir tous mes devis
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Messages non lus</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.messages?.nonLus || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/messages" className="font-medium text-teal-700 hover:text-teal-900 flex items-center">
                Voir tous mes messages
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Avis */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avis Reçus</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.avis?.total || 0}
                    </div>
                    {stats?.avis?.note && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stats.avis.note.toFixed(1)} / 5
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/avis" className="font-medium text-teal-700 hover:text-teal-900 flex items-center">
                Voir tous mes avis
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Actions rapides</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button to="/dashboard/annonces/create" variant="primary">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Créer une nouvelle annonce
            </Button>
            <Button to="/transporteurs" variant="outline">
              <TruckIcon className="h-5 w-5 mr-2" />
              Rechercher un transporteur
            </Button>
          </div>
        </div>
      </div>

      {/* Dernières annonces */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Mes dernières annonces</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentItems.annonces.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm">Vous n'avez pas encore créé d'annonce.</p>
              <Button to="/dashboard/annonces/create" variant="primary" className="mt-3">
                Créer ma première annonce
              </Button>
            </div>
          ) : (
            recentItems.annonces.map((annonce) => (
              <div key={annonce._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <Link 
                      to={`/dashboard/annonces/${annonce._id}`}
                      className="text-lg font-medium text-gray-900 hover:text-teal-600"
                    >
                      {annonce.titre}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">
                      {annonce.villeDepart} → {annonce.villeArrivee}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      annonce.statut === 'disponible' 
                        ? 'bg-green-100 text-green-800' 
                        : annonce.statut === 'en_cours' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {annonce.statut === 'disponible' 
                        ? 'Disponible' 
                        : annonce.statut === 'en_cours' 
                          ? 'En cours' 
                          : 'Terminée'}
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      {format(new Date(annonce.dateDepart), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {recentItems.annonces.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Link 
              to="/dashboard/annonces" 
              className="text-sm font-medium text-teal-600 hover:text-teal-500"
            >
              Voir toutes mes annonces
            </Link>
          </div>
        )}
      </div>

      {/* Derniers devis */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Mes derniers devis</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentItems.devis.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm">Vous n'avez pas encore reçu de devis.</p>
              <Button to="/dashboard/annonces/create" variant="primary" className="mt-3">
                Créer une annonce pour recevoir des devis
              </Button>
            </div>
          ) : (
            recentItems.devis.map((devis) => (
              <div key={devis._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <Link 
                      to={`/dashboard/devis/${devis._id}`}
                      className="text-lg font-medium text-gray-900 hover:text-teal-600"
                    >
                      Devis pour: {devis.annonce.titre}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">
                      Par: {devis.transporteur.prenom} {devis.transporteur.nom}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-gray-900">
                      {devis.montant.toFixed(2)} €
                    </span>
                    <span className={`mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                      devis.statut === 'en_attente' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : devis.statut === 'accepte' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {devis.statut === 'en_attente' 
                        ? 'En attente' 
                        : devis.statut === 'accepte' 
                          ? 'Accepté' 
                          : 'Refusé'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {recentItems.devis.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Link 
              to="/dashboard/devis" 
              className="text-sm font-medium text-teal-600 hover:text-teal-500"
            >
              Voir tous mes devis
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  // Contenu pour le transporteur
  const TransporteurDashboard = () => (
    <div className="space-y-6">
      {/* Cartes de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Devis */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Devis Envoyés</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.devis?.envoyes || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/devis" className="font-medium text-teal-700 hover:text-teal-900 flex items-center">
                Voir tous mes devis
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Transports en cours */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Transports en cours</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.transports?.enCours || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/devis?statut=en_cours" className="font-medium text-teal-700 hover:text-teal-900 flex items-center">
                Voir les transports en cours
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Messages non lus</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.messages?.nonLus || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/messages" className="font-medium text-teal-700 hover:text-teal-900 flex items-center">
                Voir tous mes messages
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Avis */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avis Reçus</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.avis?.total || 0}
                    </div>
                    {stats?.avis?.note && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stats.avis.note.toFixed(1)} / 5
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/avis" className="font-medium text-teal-700 hover:text-teal-900 flex items-center">
                Voir tous mes avis
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Actions rapides</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button to="/annonces" variant="primary">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Rechercher des annonces
            </Button>
            <Button to="/dashboard/profile" variant="outline">
              <TruckIcon className="h-5 w-5 mr-2" />
              Mettre à jour mon profil
            </Button>
          </div>
        </div>
      </div>

      {/* Dernières annonces disponibles */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Dernières annonces disponibles</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentItems.annonces.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm">Aucune annonce disponible pour le moment.</p>
              <Button to="/annonces" variant="primary" className="mt-3">
                Rechercher des annonces
              </Button>
            </div>
          ) : (
            recentItems.annonces.map((annonce) => (
              <div key={annonce._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <Link 
                      to={`/annonces/${annonce._id}`}
                      className="text-lg font-medium text-gray-900 hover:text-teal-600"
                    >
                      {annonce.titre}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">
                      {annonce.villeDepart} → {annonce.villeArrivee}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Disponible
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      {format(new Date(annonce.dateDepart), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {recentItems.annonces.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Link 
              to="/annonces" 
              className="text-sm font-medium text-teal-600 hover:text-teal-500"
            >
              Voir toutes les annonces
            </Link>
          </div>
        )}
      </div>

      {/* Derniers devis */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Mes derniers devis</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentItems.devis.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm">Vous n'avez pas encore envoyé de devis.</p>
              <Button to="/annonces" variant="primary" className="mt-3">
                Rechercher des annonces pour proposer vos services
              </Button>
            </div>
          ) : (
            recentItems.devis.map((devis) => (
              <div key={devis._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <Link 
                      to={`/dashboard/devis/${devis._id}`}
                      className="text-lg font-medium text-gray-900 hover:text-teal-600"
                    >
                      Devis pour: {devis.annonce.titre}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">
                      Client: {devis.client.prenom} {devis.client.nom}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-gray-900">
                      {devis.montant.toFixed(2)} €
                    </span>
                    <span className={`mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                      devis.statut === 'en_attente' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : devis.statut === 'accepte' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {devis.statut === 'en_attente' 
                        ? 'En attente' 
                        : devis.statut === 'accepte' 
                          ? 'Accepté' 
                          : 'Refusé'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {recentItems.devis.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Link 
              to="/dashboard/devis" 
              className="text-sm font-medium text-teal-600 hover:text-teal-500"
            >
              Voir tous mes devis
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>
      
      {/* Message de bienvenue */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 flex items-center">
          <Avatar user={user} size="lg" className="mr-4" />
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              Bienvenue, {user.prenom} !
            </h2>
            <p className="mt-1 text-gray-600">
              {user.role === 'client' 
                ? 'Voici un aperçu de vos activités et des outils pour gérer vos transports.' 
                : 'Voici un aperçu de vos activités et des opportunités de transport disponibles.'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Afficher le contenu spécifique au rôle */}
      {user.role === 'client' ? <ClientDashboard /> : <TransporteurDashboard />}
    </div>
  );
};

export default DashboardPage;