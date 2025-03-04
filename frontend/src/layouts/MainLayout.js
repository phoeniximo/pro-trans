import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/navigation/Header';
import Footer from '../components/navigation/Footer';

/**
 * Layout principal pour les pages publiques
 */
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;