import React from 'react';

// Pages publiques
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import FAQPage from './pages/public/FAQPage';
import ContactPage from './pages/public/ContactPage';
import AnnonceListPage from './pages/public/AnnonceListPage';
import AnnonceDetailPage from './pages/public/AnnonceDetailPage';
import TransporteurListPage from './pages/public/TransporteurListPage';
import TransporteurDetailPage from './pages/public/TransporteurDetailPage';

// Pages d'authentification
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Pages du tableau de bord (protégées)
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import EditProfilePage from './pages/dashboard/EditProfilePage';
import NotificationsPage from './pages/dashboard/NotificationsPage';

// Pages des annonces (protégées)
import MesAnnoncesPage from './pages/dashboard/annonces/MesAnnoncesPage';
import CreateAnnoncePage from './pages/dashboard/annonces/CreateAnnoncePage';
import EditAnnoncePage from './pages/dashboard/annonces/EditAnnoncePage';
import AnnonceDetailDashboardPage from './pages/dashboard/annonces/AnnonceDetailPage';

// Pages des devis (protégées)
import MesDevisPage from './pages/dashboard/devis/MesDevisPage';
import CreateDevisPage from './pages/dashboard/devis/CreateDevisPage';
import DevisDetailPage from './pages/dashboard/devis/DevisDetailPage';

// Pages des messages (protégées)
import MessagesPage from './pages/dashboard/messages/MessagesPage';
import ConversationPage from './pages/dashboard/messages/ConversationPage';

// Pages des avis (protégées)
import MesAvisPage from './pages/dashboard/avis/MesAvisPage';
import CreateAvisPage from './pages/dashboard/avis/CreateAvisPage';

export const routes = {
  // Routes accessibles à tous
  public: [
    {
      path: '/',
      element: <HomePage />,
      exact: true,
    },
    {
      path: '/a-propos',
      element: <AboutPage />,
      exact: true,
    },
    {
      path: '/faq',
      element: <FAQPage />,
      exact: true,
    },
    {
      path: '/contact',
      element: <ContactPage />,
      exact: true,
    },
    {
      path: '/annonces',
      element: <AnnonceListPage />,
      exact: true,
    },
    {
      path: '/annonces/:id',
      element: <AnnonceDetailPage />,
      exact: true,
    },
    {
      path: '/transporteurs',
      element: <TransporteurListPage />,
      exact: true,
    },
    {
      path: '/transporteurs/:id',
      element: <TransporteurDetailPage />,
      exact: true,
    },
  ],

  // Routes d'authentification
  auth: [
    {
      path: '/login',
      element: <LoginPage />,
      exact: true,
    },
    {
      path: '/register',
      element: <RegisterPage />,
      exact: true,
    },
    {
      path: '/forgot-password',
      element: <ForgotPasswordPage />,
      exact: true,
    },
    {
      path: '/reset-password/:token',
      element: <ResetPasswordPage />,
      exact: true,
    },
    {
      path: '/verify-email/:token',
      element: <VerifyEmailPage />,
      exact: true,
    },
  ],

  // Routes protégées (nécessitant une authentification)
  protected: [
    // Dashboard général
    {
      path: '/dashboard',
      element: <DashboardPage />,
      roles: ['client', 'transporteur', 'admin'],
      exact: true,
    },
    {
      path: '/profile',
      element: <ProfilePage />,
      roles: ['client', 'transporteur', 'admin'],
      exact: true,
    },
    {
      path: '/profile/edit',
      element: <EditProfilePage />,
      roles: ['client', 'transporteur', 'admin'],
      exact: true,
    },
    {
      path: '/dashboard/notifications',
      element: <NotificationsPage />,
      roles: ['client', 'transporteur', 'admin'],
      exact: true,
    },

    // Annonces
    {
      path: '/dashboard/annonces',
      element: <MesAnnoncesPage />,
      roles: ['client'],
      exact: true,
    },
    {
      path: '/dashboard/annonces/create',
      element: <CreateAnnoncePage />,
      roles: ['client'],
      exact: true,
    },
    {
      path: '/dashboard/annonces/:id',
      element: <AnnonceDetailDashboardPage />,
      roles: ['client', 'transporteur'],
      exact: true,
    },
    {
      path: '/dashboard/annonces/:id/edit',
      element: <EditAnnoncePage />,
      roles: ['client'],
      exact: true,
    },

    // Devis
    {
      path: '/dashboard/devis',
      element: <MesDevisPage />,
      roles: ['client', 'transporteur'],
      exact: true,
    },
    {
      path: '/dashboard/devis/create/:annonceId',
      element: <CreateDevisPage />,
      roles: ['transporteur'],
      exact: true,
    },
    {
      path: '/dashboard/devis/:id',
      element: <DevisDetailPage />,
      roles: ['client', 'transporteur'],
      exact: true,
    },

    // Messages
    {
      path: '/dashboard/messages',
      element: <MessagesPage />,
      roles: ['client', 'transporteur'],
      exact: true,
    },
    {
      path: '/dashboard/messages/:conversationId',
      element: <ConversationPage />,
      roles: ['client', 'transporteur'],
      exact: true,
    },

    // Avis
    {
      path: '/dashboard/avis',
      element: <MesAvisPage />,
      roles: ['client', 'transporteur'],
      exact: true,
    },
    {
      path: '/dashboard/avis/create/:userId/:annonceId',
      element: <CreateAvisPage />,
      roles: ['client', 'transporteur'],
      exact: true,
    },
  ],
};