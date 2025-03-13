import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TruckIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  CurrencyEuroIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Button from '../../components/ui/Button';

// Liste des villes marocaines pour l'autocomplétion
const moroccanCities = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", 
  "Kénitra", "Tétouan", "Salé", "Nador", "Mohammédia", "El Jadida", "Béni Mellal", 
  "Taza", "Khémisset", "Taourirt", "Settat", "Berkane", "Khouribga", "Ouarzazate", 
  "Larache", "Guelmim", "Khénifra", "Safi", "Essaouira", "Taroudant", "Tiznit"
];

const HomePage = () => {
  const navigate = useNavigate();
  const [departCity, setDepartCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [transportType, setTransportType] = useState('');
  const [departSuggestions, setDepartSuggestions] = useState([]);
  const [arrivalSuggestions, setArrivalSuggestions] = useState([]);
  const [showDepartSuggestions, setShowDepartSuggestions] = useState(false);
  const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);

  // Filtrer les suggestions de villes
  const filterCities = (input, setSuggestions) => {
    if (input.trim() === '') {
      setSuggestions([]);
      return;
    }
    
    const filtered = moroccanCities.filter(city => 
      city.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
    
    setSuggestions(filtered);
  };

  // Gestion du changement de ville de départ
  const handleDepartChange = (e) => {
    const value = e.target.value;
    setDepartCity(value);
    filterCities(value, setDepartSuggestions);
    setShowDepartSuggestions(true);
  };

  // Gestion du changement de ville d'arrivée
  const handleArrivalChange = (e) => {
    const value = e.target.value;
    setArrivalCity(value);
    filterCities(value, setArrivalSuggestions);
    setShowArrivalSuggestions(true);
  };

  // Sélection d'une ville de départ dans les suggestions
  const selectDepartCity = (city) => {
    setDepartCity(city);
    setShowDepartSuggestions(false);
  };

  // Sélection d'une ville d'arrivée dans les suggestions
  const selectArrivalCity = (city) => {
    setArrivalCity(city);
    setShowArrivalSuggestions(false);
  };

  // Gestion de la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    
    if (departCity) queryParams.append('villeDepart', departCity);
    if (arrivalCity) queryParams.append('villeArrivee', arrivalCity);
    if (transportType) queryParams.append('typeTransport', transportType);
    
    // Rediriger vers la page de création d'annonce avec les paramètres d'URL
    navigate(`/dashboard/annonces/create?${queryParams.toString()}`);
  };

  // Fermer les suggestions si clic en dehors
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDepartSuggestions(false);
      setShowArrivalSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-600 to-teal-800 overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center md:text-left md:max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Transport de marchandises facile et fiable
            </h1>
            <p className="mt-6 text-xl text-white">
              Trouvez des transporteurs professionnels près de chez vous. Economisez jusqu'à 40% sur vos frais de transport.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/register">
                <button
                  className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-teal-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:w-auto"
                >
                  Publier une annonce
                </button>
              </Link>
              <Link to="/transporteurs">
                <button
                  className="w-full inline-flex justify-center items-center px-6 py-3 border border-white text-base font-medium rounded-md shadow-sm text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white sm:w-auto"
                >
                  Trouver un transporteur
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSearch}>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Ville de départ"
                value={departCity}
                onChange={handleDepartChange}
                onClick={(e) => {
                  e.stopPropagation();
                  if (departCity) setShowDepartSuggestions(true);
                }}
                className="pl-10 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              {showDepartSuggestions && departSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto sm:text-sm">
                  {departSuggestions.map((city, index) => (
                    <li
                      key={index}
                      className="cursor-pointer select-none px-4 py-2 hover:bg-teal-50 text-gray-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectDepartCity(city);
                      }}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Ville d'arrivée"
                value={arrivalCity}
                onChange={handleArrivalChange}
                onClick={(e) => {
                  e.stopPropagation();
                  if (arrivalCity) setShowArrivalSuggestions(true);
                }}
                className="pl-10 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              {showArrivalSuggestions && arrivalSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto sm:text-sm">
                  {arrivalSuggestions.map((city, index) => (
                    <li
                      key={index}
                      className="cursor-pointer select-none px-4 py-2 hover:bg-teal-50 text-gray-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectArrivalCity(city);
                      }}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TruckIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
              >
                <option value="">Type de transport</option>
                <option value="Déménagements">Déménagements</option>
                <option value="Meuble, appareil ménager...">Meuble, appareil ménager...</option>
                <option value="Caisses/Cartons">Caisses/Cartons</option>
                <option value="Bagages">Bagages</option>
                <option value="Marchandises">Marchandises</option>
                <option value="Colis">Colis</option>
                <option value="Palettes">Palettes</option>
                <option value="Motos et vélos">Motos et vélos</option>
                <option value="Pièces automobile">Pièces automobile</option>
                <option value="Marchandise fragile">Marchandise fragile</option>
                <option value="Voitures">Voitures</option>
                <option value="Autres livraisons">Autres livraisons</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 md:w-auto"
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* How it works section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Pro-Trans simplifie le transport de vos biens en vous connectant directement aux transporteurs.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 text-teal-600">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Publiez votre annonce</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Décrivez ce que vous souhaitez transporter, d'où à où, et quand.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 text-teal-600">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Recevez des devis</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Les transporteurs vous envoient leurs propositions de prix et délais.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 text-teal-600">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Confirmez et suivez</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Choisissez le transporteur qui vous convient et suivez votre livraison.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Pourquoi choisir Pro-Trans ?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Notre plateforme vous offre de nombreux avantages pour tous vos besoins de transport.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Benefit 1 */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white">
                  <TruckIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Réseau de confiance</h3>
                <p className="mt-2 text-base text-gray-600">
                  Transporteurs vérifiés et évalués par notre communauté.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white">
                  <ClockIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Rapidité</h3>
                <p className="mt-2 text-base text-gray-600">
                  Recevez des devis en quelques heures et organisez votre transport rapidement.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white">
                  <CurrencyEuroIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Économies</h3>
                <p className="mt-2 text-base text-gray-600">
                  Comparez les offres et économisez jusqu'à 40% sur vos frais de transport.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white">
                  <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Sécurité</h3>
                <p className="mt-2 text-base text-gray-600">
                  Paiement sécurisé et assurance pour vos biens pendant le transport.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Types of transport section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Tous types de transport
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Que ce soit pour un petit colis ou un déménagement complet, trouvez le transporteur adapté à vos besoins.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Type 1 */}
              <div className="relative group">
                <div className="aspect-w-3 aspect-h-2 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src="/assets/images/transport-colis.jpg"
                    alt="Transport de colis"
                    className="object-center object-cover"
                  />
                  <div className="flex items-end p-4 opacity-0 group-hover:opacity-100" aria-hidden="true">
                    <div className="w-full bg-white bg-opacity-75 backdrop-filter backdrop-blur py-2 px-4 rounded-md text-sm font-medium text-gray-900 text-center">
                      Voir les options
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    <Link to="/annonces?type=colis">
                      <span className="absolute inset-0" />
                      Transport de colis
                    </Link>
                  </h3>
                  <p className="text-base text-gray-600">Envoyez vos colis et petits objets partout au Maroc.</p>
                </div>
              </div>

              {/* Type 2 */}
              <div className="relative group">
                <div className="aspect-w-3 aspect-h-2 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src="/assets/images/transport-meuble.jpg"
                    alt="Transport de meubles"
                    className="object-center object-cover"
                  />
                  <div className="flex items-end p-4 opacity-0 group-hover:opacity-100" aria-hidden="true">
                    <div className="w-full bg-white bg-opacity-75 backdrop-filter backdrop-blur py-2 px-4 rounded-md text-sm font-medium text-gray-900 text-center">
                      Voir les options
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    <Link to="/annonces?type=meuble">
                      <span className="absolute inset-0" />
                      Transport de meubles
                    </Link>
                  </h3>
                  <p className="text-base text-gray-600">Faites livrer vos meubles en toute sécurité.</p>
                </div>
              </div>

              {/* Type 3 */}
              <div className="relative group">
                <div className="aspect-w-3 aspect-h-2 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src="/assets/images/demenagement.jpg"
                    alt="Déménagement"
                    className="object-center object-cover"
                  />
                  <div className="flex items-end p-4 opacity-0 group-hover:opacity-100" aria-hidden="true">
                    <div className="w-full bg-white bg-opacity-75 backdrop-filter backdrop-blur py-2 px-4 rounded-md text-sm font-medium text-gray-900 text-center">
                      Voir les options
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    <Link to="/annonces?type=demenagement">
                      <span className="absolute inset-0" />
                      Déménagement
                    </Link>
                  </h3>
                  <p className="text-base text-gray-600">Solutions complètes pour votre déménagement.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/annonces/create">
              <button 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Publier votre annonce maintenant
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Ce que disent nos clients
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les expériences de ceux qui ont déjà utilisé Pro-Trans pour leurs besoins de transport.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="/assets/images/testimonial-1.jpg" alt="Sofia L." className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Sofia L.</h4>
                    <div className="flex text-yellow-400">
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  {`J'ai trouvé un transporteur pour mon canapé en moins de 2 heures ! Le prix était bien inférieur à ce que m'avaient proposé les enseignes traditionnelles.`}
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="/assets/images/testimonial-2.jpg" alt="Mehdi A." className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Mehdi A.</h4>
                    <div className="flex text-yellow-400">
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  {`En tant que transporteur, Pro-Trans m'a permis de trouver facilement des clients et d'optimiser mes trajets entre Casablanca et Rabat. Une excellente plateforme pour développer mon activité.`}
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="/assets/images/testimonial-3.jpg" alt="Amina F." className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Amina F.</h4>
                    <div className="flex text-yellow-400">
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  {`Mon déménagement s'est déroulé parfaitement grâce à Pro-Trans. J'ai pu suivre mon mobilier en temps réel et le transporteur était très professionnel. Je recommande !`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-teal-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Prêt à simplifier vos transports ?</span>
            <span className="block text-teal-300">Rejoignez Pro-Trans aujourd'hui.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/register">
                <button
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  S'inscrire gratuitement
                </button>
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link to="/a-propos">
                <button
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  En savoir plus
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;