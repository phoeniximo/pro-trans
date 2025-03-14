import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { 
  CheckIcon, 
  FunnelIcon, 
  ArrowPathIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import useNotification from '../../hooks/useNotification';
import Button from '../../components/ui/Button';

const NotificationsPage = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    fetchNotifications 
  } = useNotification();
  
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'annonce':
        return <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">📦</div>;
      case 'devis':
        return <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">💼</div>;
      case 'message':
        return <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">✉️</div>;
      case 'avis':
        return <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">⭐</div>;
      default:
        return <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">🔔</div>;
    }
  };

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case 'annonce':
        return `/dashboard/annonces/${notification.referenceId}`;
      case 'devis':
        return `/dashboard/devis/${notification.referenceId}`;
      case 'message':
        return `/dashboard/messages/${notification.referenceId}`;
      case 'avis':
        return `/dashboard/avis`;
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Mes notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0 
              ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Aucune notification non lue'}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button
            variant="outline"
            onClick={fetchNotifications}
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            Actualiser
          </Button>
          
          {unreadCount > 0 && (
            <Button 
              variant="primary"
              onClick={markAllAsRead}
            >
              <CheckIcon className="h-5 w-5 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('all')}
          >
            Toutes
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'unread'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('unread')}
          >
            Non lues
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'read'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('read')}
          >
            Lues
          </button>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {filteredNotifications.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune notification</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "Vous n'avez pas de notifications pour le moment." 
                : filter === 'unread' 
                  ? "Vous n'avez pas de notifications non lues." 
                  : "Vous n'avez pas de notifications lues."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <li key={notification._id} className={`hover:bg-gray-50 ${!notification.read ? 'bg-teal-50' : ''}`}>
                <div className="px-4 py-4 sm:px-6 flex items-start">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {format(new Date(notification.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-teal-600 hover:text-teal-900"
                            title="Marquer comme lu"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                        )}
                        
                        <Link
                          to={getNotificationLink(notification)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir les détails"
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;