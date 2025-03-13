import React from 'react';
import { 
  DocumentTextIcon, 
  TruckIcon, 
  ChatBubbleLeftRightIcon, 
  StarIcon,
  ArrowRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useMessage } from '../../hooks/useMessage';

const StatsCard = ({ icon: Icon, bgColor, title, value, link, subValue, isLoading }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                {isLoading ? (
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="text-2xl font-semibold text-gray-900">
                    {value}
                    {subValue && (
                      <span className="ml-2 text-sm font-semibold text-green-600">
                        {subValue}
                      </span>
                    )}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {link && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link to={link.url} className="font-medium text-teal-700 hover:text-teal-900 flex items-center">
              {link.text}
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardStatsComponent = ({ stats, role, isLoading }) => {
  const { unreadCount } = useMessage();
  
  // Utiliser unreadCount du contexte de message pour être sûr d'avoir la valeur à jour
  const messageCount = unreadCount || stats?.messages?.nonLus || 0;
  
  if (role === 'client') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Annonces */}
        <StatsCard 
          icon={DocumentTextIcon}
          bgColor="bg-teal-500"
          title="Annonces Actives"
          value={stats?.annonces?.actives || 0}
          link={{ url: "/dashboard/annonces", text: "Voir toutes mes annonces" }}
          isLoading={isLoading}
        />

        {/* Devis */}
        <StatsCard 
          icon={TruckIcon}
          bgColor="bg-blue-500"
          title="Devis en Attente"
          value={stats?.devis?.enAttente || 0}
          link={{ url: "/dashboard/devis", text: "Voir tous mes devis" }}
          isLoading={isLoading}
        />

        {/* Messages */}
        <StatsCard 
          icon={ChatBubbleLeftRightIcon}
          bgColor="bg-indigo-500"
          title="Messages non lus"
          value={messageCount}
          link={{ url: "/dashboard/messages", text: "Voir tous mes messages" }}
          isLoading={isLoading}
        />

        {/* Avis */}
        <StatsCard 
          icon={StarIcon}
          bgColor="bg-yellow-500"
          title="Avis Donnés"
          value={stats?.avis?.total || 0}
          subValue={stats?.avis?.note ? `${stats.avis.note.toFixed(1)}/5` : null}
          link={{ url: "/dashboard/avis", text: "Voir tous mes avis" }}
          isLoading={isLoading}
        />
      </div>
    );
  } else if (role === 'transporteur') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Devis */}
        <StatsCard 
          icon={TruckIcon}
          bgColor="bg-blue-500"
          title="Devis Envoyés"
          value={stats?.devis?.envoyes || 0}
          link={{ url: "/dashboard/devis", text: "Voir tous mes devis" }}
          isLoading={isLoading}
        />

        {/* Transports en cours */}
        <StatsCard 
          icon={ClockIcon}
          bgColor="bg-indigo-500"
          title="Transports en cours"
          value={stats?.transports?.enCours || 0}
          link={{ url: "/dashboard/devis?statut=en_cours", text: "Voir les transports en cours" }}
          isLoading={isLoading}
        />

        {/* Messages */}
        <StatsCard 
          icon={ChatBubbleLeftRightIcon}
          bgColor="bg-purple-500"
          title="Messages non lus"
          value={messageCount}
          link={{ url: "/dashboard/messages", text: "Voir tous mes messages" }}
          isLoading={isLoading}
        />

        {/* Avis */}
        <StatsCard 
          icon={StarIcon}
          bgColor="bg-yellow-500"
          title="Avis Reçus"
          value={stats?.avis?.total || 0}
          subValue={stats?.avis?.note ? `${stats.avis.note.toFixed(1)}/5` : null}
          link={{ url: "/dashboard/avis", text: "Voir tous mes avis" }}
          isLoading={isLoading}
        />
      </div>
    );
  }
  
  // Version par défaut
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard 
        icon={UserIcon}
        bgColor="bg-gray-500"
        title="Utilisateurs"
        value={stats?.utilisateurs?.total || 0}
        isLoading={isLoading}
      />
      <StatsCard 
        icon={DocumentTextIcon}
        bgColor="bg-teal-500"
        title="Annonces"
        value={stats?.annonces?.total || 0}
        isLoading={isLoading}
      />
      <StatsCard 
        icon={TruckIcon}
        bgColor="bg-blue-500"
        title="Transports"
        value={stats?.transports?.total || 0}
        isLoading={isLoading}
      />
      <StatsCard 
        icon={CurrencyDollarIcon}
        bgColor="bg-green-500"
        title="Revenus (DH)"
        value={stats?.revenus?.total || 0}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardStatsComponent;