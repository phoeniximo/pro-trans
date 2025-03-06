import React, { createContext, useState, useEffect } from 'react';

// Création du contexte pour le thème
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // État pour stocker le thème actuel
  const [theme, setTheme] = useState('light');
  
  // Effet pour récupérer le thème depuis le localStorage au chargement
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Utiliser les préférences système si aucun thème n'est enregistré
      setTheme('dark');
    }
    
    // Appliquer la classe correspondante au thème
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);
  
  // Fonction pour changer de thème
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  // Fonction pour définir un thème spécifique
  const setThemeMode = (mode) => {
    if (mode !== 'light' && mode !== 'dark') return;
    
    setTheme(mode);
    localStorage.setItem('theme', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  };

  // Valeurs fournies par le contexte
  const value = {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isDark: theme === 'dark'
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;