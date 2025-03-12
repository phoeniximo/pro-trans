import React from 'react';

/**
 * Composant Badge pour afficher un statut ou une étiquette
 * @param {Object} props - Propriétés du composant
 * @param {string} props.variant - Variante de couleur (default, primary, success, warning, danger)
 * @param {string} props.children - Texte à afficher
 * @param {string} props.className - Classes CSS additionnelles
 */
const Badge = ({ variant = 'default', children, className = '', ...props }) => {
  // Configuration des couleurs selon la variante
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-teal-100 text-teal-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const classes = `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;