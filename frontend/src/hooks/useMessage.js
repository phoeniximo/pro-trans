import { useContext } from 'react';
import { MessageContext } from '../context/MessageContext';

/**
 * Hook personnalisé pour accéder au contexte de messages
 * @returns {Object} Contexte de messages
 */
export const useMessage = () => {
  const context = useContext(MessageContext);
  
  if (!context) {
    throw new Error('useMessage doit être utilisé à l\'intérieur d\'un MessageProvider');
  }
  
  return context;
};

export default useMessage;