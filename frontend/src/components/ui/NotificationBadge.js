import React, { useEffect, useState } from 'react';
import { useMessage } from '../../hooks/useMessage';
import { BellIcon } from '@heroicons/react/24/outline';

const NotificationBadge = () => {
  const { unreadCount, fetchConversations } = useMessage();
  const [hasPlayed, setHasPlayed] = useState(false);
  
  // Jouer un son lorsque de nouveaux messages non lus arrivent
  useEffect(() => {
    if (unreadCount > 0 && !hasPlayed) {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().then(() => {
          setHasPlayed(true);
          // Réinitialiser hasPlayed après un certain délai pour permettre de futures notifications
          setTimeout(() => setHasPlayed(false), 60000); // 1 minute
        }).catch(e => console.log('Impossible de jouer le son de notification:', e));
      } catch (error) {
        console.error('Erreur lors de la lecture du son de notification:', error);
      }
    }
  }, [unreadCount, hasPlayed]);

  // Rafraîchir le compteur périodiquement
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchConversations();
    }, 60000); // Toutes les minutes
    
    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  if (unreadCount === 0) return null;

  return (
    <div className="relative">
      <BellIcon className="h-6 w-6 text-teal-500" />
      <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 flex items-center justify-center text-xs text-white font-bold animate-pulse">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </div>
  );
};

export default NotificationBadge;