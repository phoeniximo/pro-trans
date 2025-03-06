// frontend/.eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    'react/prop-types': 'off', // Désactive les avertissements de prop-types
    'react/react-in-jsx-scope': 'off', // Désactive l'import React obligatoire avec JSX (pour React 17+)
    'react-hooks/rules-of-hooks': 'error', // Vérifie les règles des Hooks
    'react-hooks/exhaustive-deps': 'warn', // Vérifie les dépendances des effets
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // Avertissement pour les variables non utilisées
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Avertissement pour console.log, mais pas pour warn et error
  },
  settings: {
    react: {
      version: 'detect', // Détecte automatiquement la version de React
    },
  },
};