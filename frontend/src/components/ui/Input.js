import React, { forwardRef } from 'react';

/**
 * Composant Input réutilisable
 * @param {string} id - ID de l'input
 * @param {string} name - Nom de l'input
 * @param {string} type - Type d'input (text, email, password, etc.)
 * @param {string} label - Label de l'input
 * @param {string} placeholder - Placeholder de l'input
 * @param {string} value - Valeur de l'input
 * @param {boolean} disabled - Input désactivé ou non
 * @param {boolean} required - Input requis ou non
 * @param {Function} onChange - Fonction de changement
 * @param {Function} onBlur - Fonction de blur
 * @param {string} error - Message d'erreur
 * @param {boolean} touched - Champ touché ou non
 * @param {string} className - Classes CSS supplémentaires
 * @param {string} helperText - Texte d'aide
 * @param {ReactNode} icon - Icône à afficher
 * @param {string} iconPosition - Position de l'icône (left, right)
 */
const Input = forwardRef(({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  disabled = false,
  required = false,
  onChange,
  onBlur,
  error,
  touched,
  className = '',
  helperText,
  icon,
  iconPosition = 'left',
  ...rest
}, ref) => {
  // Définir les classes CSS de base
  const baseInputClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm';
  
  // Classes pour les états spéciaux
  const errorClasses = error && touched ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  const iconClasses = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';
  
  // Combiner toutes les classes
  const inputClasses = `${baseInputClasses} ${errorClasses} ${disabledClasses} ${iconClasses} ${className}`;
  
  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Conteneur pour l'input avec icône */}
      <div className="relative">
        {/* Icône à gauche */}
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          id={id || name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClasses}
          aria-invalid={error && touched ? 'true' : 'false'}
          aria-describedby={error && touched ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          {...rest}
        />
        
        {/* Icône à droite */}
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      
      {/* Message d'erreur */}
      {error && touched && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {/* Texte d'aide */}
      {helperText && !error && (
        <p id={`${name}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;