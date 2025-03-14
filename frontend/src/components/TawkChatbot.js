// src/components/TawkChatbot.js
import React, { useEffect } from 'react';

const TawkChatbot = () => {
  useEffect(() => {
    // Script d'intégration Tawk.to
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/VOTRE_ID_TAWK/VOTRE_WIDGET_ID';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    document.body.appendChild(script);
    
    // Nettoyage lors du démontage du composant
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // Ce composant n'affiche rien directement
};

export default TawkChatbot;