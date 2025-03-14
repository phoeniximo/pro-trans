import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import useNotification from '../../hooks/useNotification';

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotification();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Jouer un son pour les nouvelles notifications
  useEffect(() => {
    if (unreadCount > 0) {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(e => console.log('Impossible de jouer le son de notification:', e));
      } catch (error) {
        console.error('Erreur lors de la lecture du son de notification:', error);
      }
    }
  }, [unreadCount]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'annonce':
        return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">📦</div>;
      case 'devis':
        return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">💼</div>;
      case 'message':
        return <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">✉️</div>;
      case 'avis':
        return <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">⭐</div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">🔔</div>;
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
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 flex items-center justify-center text-xs text-white font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 divide-y divide-gray-100">
            <div className="px-4 py-3 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  Aucune notification pour le moment
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <Link
                    key={notification._id}
                    to={getNotificationLink(notification)}
                    className={`px-4 py-3 flex items-start hover:bg-gray-50 ${!notification.read ? 'bg-teal-50' : ''}`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification._id);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-500">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notification.createdAt), 'dd MMM HH:mm', { locale: fr })}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                        className="ml-2 text-teal-600 hover:text-teal-800"
                        aria-label="Marquer comme lu"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </Link>
                ))
              )}
            </div>

            <div className="px-4 py-2 text-center">
              <Link
                to="/dashboard/notifications"
                className="text-sm font-medium text-teal-600 hover:text-teal-800"
                onClick={() => setIsOpen(false)}
              >
                Voir toutes les notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;