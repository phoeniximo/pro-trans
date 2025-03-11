import React from 'react';
import { UserIcon, TruckIcon } from '@heroicons/react/24/outline';

const Avatar = ({ user, size = 'md', className = '' }) => {
  // Définition des tailles
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  // Style de base
  const baseStyle = `${sizes[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`;

  // Si l'utilisateur a une photo
  if (user?.photo) {
    return (
      <div className={baseStyle}>
        <img 
          src={user.photo} 
          alt={user.prenom ? `${user.prenom} ${user.nom}` : 'Avatar utilisateur'}
          className="h-full w-full object-cover"
          onError={(e) => {
            // En cas d'erreur de chargement, remplacer par l'avatar générique
            e.target.style.display = 'none';
            e.target.parentNode.classList.add(user.role === 'transporteur' ? 'bg-blue-500' : 'bg-teal-500');
            e.target.parentNode.innerHTML += `
              <div class="h-full w-full flex items-center justify-center text-white">
                ${user.role === 'transporteur' 
                  ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>' 
                  : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>'
                }
              </div>`;
          }}
        />
      </div>
    );
  }

  // Si pas de photo, afficher un avatar basé sur le rôle
  return (
    <div className={`${baseStyle} flex items-center justify-center text-white ${user?.role === 'transporteur' ? 'bg-blue-500' : 'bg-teal-500'}`}>
      {user?.role === 'transporteur' ? (
        <TruckIcon className={size === 'sm' ? 'h-4 w-4' : size === 'lg' || size === 'xl' ? 'h-10 w-10' : 'h-6 w-6'} />
      ) : (
        <UserIcon className={size === 'sm' ? 'h-4 w-4' : size === 'lg' || size === 'xl' ? 'h-10 w-10' : 'h-6 w-6'} />
      )}
    </div>
  );
};

export default Avatar;