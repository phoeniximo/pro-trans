import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Hook personnalisé pour accéder au contexte de thème
 * @returns {Object} Contexte de thème
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  
  return context;
};

export default useTheme;