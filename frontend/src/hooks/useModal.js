import { useContext } from 'react';
import { ModalContext } from '../context/ModalContext';

/**
 * Hook personnalisé pour accéder au contexte de modales
 * @returns {Object} Contexte de modales
 */
export const useModal = () => {
  const context = useContext(ModalContext);
  
  if (!context) {
    throw new Error('useModal doit être utilisé à l\'intérieur d\'un ModalProvider');
  }
  
  return context;
};

export default useModal;