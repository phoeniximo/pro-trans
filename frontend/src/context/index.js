import { AuthProvider } from './AuthContext';

/**
 * Combine tous les fournisseurs de contexte dans un seul composant
 * @param {Object} props - Props du composant
 * @returns {JSX.Element} Composant avec tous les fournisseurs de contexte
 */
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default AppProviders;