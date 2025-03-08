import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TruckIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  CurrencyEuroIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Button from '../../components/ui/Button';

const HomePage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-500 to-teal-700">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center md:text-left md:max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Transport de marchandises facile et fiable
            </h1>
            <p className="mt-6 text-xl text-white">
              Trouvez des transporteurs professionnels près de chez vous. Economisez jusqu&apos;à 40% sur vos frais de transport.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                to="/register"
                variant="primary"
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100"
              >
                Publier une annonce
              </Button>
              <Button
                to="/transporteurs"
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-teal-600"
              >
                Trouver un transporteur
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form className="flex flex-col md:flex-row gap-4">
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
                className="pl-10 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
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
                placeholder="Ville d&apos;arrivée"
                className="pl-10 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TruckIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Type de transport</option>
                <option value="colis">Colis</option>
                <option value="meuble">Meuble</option>
                <option value="marchandise">Marchandise</option>
                <option value="palette">Palette</option>
                <option value="demenagement">Déménagement</option>
                <option value="vehicule">Véhicule</option>
              </select>
            </div>
            <div>
              <Button type="submit" variant="primary" className="w-full md:w-auto">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Rechercher
              </Button>
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
                    Décrivez ce que vous souhaitez transporter, d&apos;où à où, et quand.
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
                <h3 className="mt-6 text-lg font-medium text-gray-900">Economies</h3>
                <p className="mt-2 text-base text-gray-600">
                  Comparez les offres et économisez jusqu&apos;à 40% sur vos frais de transport.
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
                  <p className="text-base text-gray-600">Envoyez vos colis et petits objets partout en France.</p>
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
            <Button
              to="/annonces/create"
              variant="primary"
              size="lg"
            >
              Publier votre annonce maintenant
            </Button>
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
                    <img src="/assets/images/testimonial-1.jpg" alt="Sophie D." className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Sophie D.</h4>
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
                  {`J&apos;ai trouvé un transporteur pour mon canapé en moins de 2 heures ! Le prix était bien inférieur à ce que m&apos;avaient proposé les enseignes traditionnelles.`}
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="/assets/images/testimonial-2.jpg" alt="Marc L." className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Marc L.</h4>
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
                  {`En tant que transporteur, Pro-Trans m&apos;a permis de trouver facilement des clients et d&apos;optimiser mes trajets. Une excellente plateforme pour développer mon activité.`}
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="/assets/images/testimonial-3.jpg" alt="Emilie F." className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Emilie F.</h4>
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
                  {`Mon déménagement s&apos;est déroulé parfaitement grâce à Pro-Trans. J&apos;ai pu suivre mon mobilier en temps réel et le transporteur était très professionnel. Je recommande !`}
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
            <span className="block text-teal-300">Rejoignez Pro-Trans aujourd&apos;hui.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button
                to="/register"
                variant="primary"
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100"
              >
                S&apos;inscrire gratuitement
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button
                to="/a-propos"
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-teal-600"
              >
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;