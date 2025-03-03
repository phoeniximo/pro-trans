// frontend/src/app/annonces/page.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Annonces() {
  const [annonces, setAnnonces] = useState([]);
  const [filtres, setFiltres] = useState({
    typeTransport: '',
    villeDepart: '',
    villeArrivee: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnonces();
  }, [filtres]);

  const fetchAnnonces = async () => {
    try {
      let url = 'http://localhost:5000/api/annonces';
      const queryParams = new URLSearchParams();
      
      if (filtres.typeTransport) queryParams.append('typeTransport', filtres.typeTransport);
      if (filtres.villeDepart) queryParams.append('villeDepart', filtres.villeDepart);
      if (filtres.villeArrivee) queryParams.append('villeArrivee', filtres.villeArrivee);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setAnnonces(data);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltreChange = (e) => {
    const { name, value } = e.target;
    setFiltres(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Annonces de transport</h1>
        <Link 
          href="/annonces/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nouvelle annonce
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="typeTransport"
            value={filtres.typeTransport}
            onChange={handleFiltreChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Type de transport</option>
            <option value="meuble">Meubles</option>
            <option value="marchandise">Marchandises</option>
            <option value="bagage">Bagages</option>
            <option value="palette">Palettes</option>
            <option value="demenagement">Déménagement</option>
          </select>

          <input
            type="text"
            name="villeDepart"
            placeholder="Ville de départ"
            value={filtres.villeDepart}
            onChange={handleFiltreChange}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="villeArrivee"
            placeholder="Ville d'arrivée"
            value={filtres.villeArrivee}
            onChange={handleFiltreChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Liste des annonces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {annonces.map((annonce) => (
          <Link href={`/annonces/${annonce._id}`} key={annonce._id}>
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
              <h2 className="text-xl font-semibold mb-2">{annonce.titre}</h2>
              <div className="text-gray-600 mb-2">
                {annonce.villeDepart} → {annonce.villeArrivee}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Type: {annonce.typeTransport}
              </div>
              <div className="text-sm text-gray-500">
                Date de départ: {new Date(annonce.dateDepart).toLocaleDateString()}
              </div>
              {annonce.budget && (
                <div className="mt-2 text-blue-600 font-semibold">
                  Budget: {annonce.budget} DH
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {annonces.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          Aucune annonce ne correspond à vos critères
        </div>
      )}
    </div>
  );
}