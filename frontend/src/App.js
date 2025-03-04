import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { routes } from './routes';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Gestion de la redirection automatique en fonction de l'authentification
  useEffect(() => {
    // Si l'utilisateur est sur une page d'authentification mais est déjà connecté
    if (!loading && isAuthenticated && 
        (location.pathname === '/login' || 
         location.pathname === '/register' || 
         location.pathname === '/')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Routes publiques avec MainLayout */}
      <Route element={<MainLayout />}>
        {routes.public.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
            exact={route.exact}
          />
        ))}
      </Route>

      {/* Routes d'authentification avec AuthLayout */}
      <Route element={<AuthLayout />}>
        {routes.auth.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
            exact={route.exact}
          />
        ))}
      </Route>

      {/* Routes protégées avec DashboardLayout */}
      <Route element={<DashboardLayout />}>
        {routes.protected.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute 
                isAuthenticated={isAuthenticated} 
                roles={route.roles}
                userRole={user?.role}
              >
                {route.element}
              </ProtectedRoute>
            }
            exact={route.exact}
          />
        ))}
      </Route>

      {/* Route pour la page 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;