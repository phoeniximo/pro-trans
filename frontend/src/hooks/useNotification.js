import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * Hook personnalisé pour accéder au contexte de notifications
 * @returns {Object} Contexte de notifications
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification doit être utilisé à l\'intérieur d\'un NotificationProvider');
  }
  
  return context;
};

export default useNotification;