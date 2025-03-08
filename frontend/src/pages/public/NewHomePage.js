import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const NewHomePage = () => {
  return (
    <div className="bg-white p-10 text-center">
      <h1 className="text-4xl font-bold">Pro-Trans</h1>
      <p className="my-5">Plateforme de transport et livraison</p>
      <div className="mt-10">
        <Button to="/register" variant="primary">S'inscrire</Button>
      </div>
    </div>
  );
};

export default NewHomePage;