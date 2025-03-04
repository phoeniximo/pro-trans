import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Composant Button réutilisable avec différentes variantes
 * @param {string} variant - primary, secondary, outline, danger, success
 * @param {string} size - sm, md, lg
 * @param {boolean} fullWidth - Pleine largeur ou non
 * @param {boolean} disabled - Désactivé ou non
 * @param {boolean} isLoading - En cours de chargement
 * @param {string} type - Type de bouton (button, submit, reset)
 * @param {string} to - Lien interne (utilise React Router)
 * @param {string} href - Lien externe
 * @param {Function} onClick - Fonction de clic
 * @param {ReactNode} children - Contenu du bouton
 * @param {string} className - Classes CSS supplémentaires
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  type = 'button',
  to,
  href,
  onClick,
  children,
  className = '',
  ...rest
}) => {
  // Base classes for all buttons
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50',
    outline: 'bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-50 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50',
    text: 'bg-transparent text-teal-600 hover:text-teal-800 hover:underline',
  };
  
  // Disabled classes
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  // Full width class
  const fullWidthClass = fullWidth ? 'w-full' : '';
  
  // Loading indicator
  const loadingIndicator = isLoading && (
    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  // Combine classes
  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.primary}
    ${disabled || isLoading ? disabledClasses : ''}
    ${fullWidthClass}
    ${className}
  `;
  
  // If it's a Link component
  if (to) {
    return (
      <Link
        to={to}
        className={combinedClasses}
        {...rest}
      >
        {isLoading && loadingIndicator}
        {children}
      </Link>
    );
  }
  
  // If it's an external link
  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {isLoading && loadingIndicator}
        {children}
      </a>
    );
  }
  
  // Default button
  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading && loadingIndicator}
      {children}
    </button>
  );
};

export default Button;