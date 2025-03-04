import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  HomeIcon, 
  UserIcon, 
  TruckIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  StarIcon, 
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Layout pour le tableau de bord
 */
const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fonction de déconnexion
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Définition des liens de navigation en fonction du rôle
  const navigationLinks = [
    { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon, roles: ['client', 'transporteur', 'admin'] },
    { name: 'Profil', href: '/profile', icon: UserIcon, roles: ['client', 'transporteur', 'admin'] },
    { name: 'Mes Annonces', href: '/dashboard/annonces', icon: DocumentTextIcon, roles: ['client'] },
    { name: 'Rechercher des annonces', href: '/annonces', icon: DocumentTextIcon, roles: ['transporteur'] },
    { name: 'Mes Devis', href: '/dashboard/devis', icon: TruckIcon, roles: ['client', 'transporteur'] },
    { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, roles: ['client', 'transporteur'] },
    { name: 'Avis', href: '/dashboard/avis', icon: StarIcon, roles: ['client', 'transporteur'] },
  ];
  
  // Filtrer les liens en fonction du rôle de l'utilisateur
  const userLinks = navigationLinks.filter(link => link.roles.includes(user?.role));
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar mobile */}
      <div className={`${sidebarOpen ? 'fixed inset-0 flex z-40 md:hidden' : 'hidden'}`}>
        {/* Overlay d'arrière-plan */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        {/* Contenu de la sidebar */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Fermer la sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <img
                className="h-8 w-auto"
                src="/assets/images/logo.png"
                alt="Pro-Trans Logo"
              />
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {userLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <ArrowLeftOnRectangleIcon
                  className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                Déconnexion
              </button>
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-10 w-10 rounded-full"
                    src={user?.photo || '/assets/images/default-avatar.png'}
                    alt={user?.nom}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.nom} {user?.prenom}
                  </p>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    {user?.role === 'client' ? 'Client' : 'Transporteur'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <img
                  className="h-8 w-auto"
                  src="/assets/images/logo.png"
                  alt="Pro-Trans Logo"
                />
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {userLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <item.icon
                      className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <ArrowLeftOnRectangleIcon
                    className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Déconnexion
                </button>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Link to="/profile" className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <img
                      className="inline-block h-9 w-9 rounded-full"
                      src={user?.photo || '/assets/images/default-avatar.png'}
                      alt={user?.nom}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {user?.nom} {user?.prenom}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                      {user?.role === 'client' ? 'Client' : 'Transporteur'}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir la sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;