import React from 'react';
import { Link } from 'react-router-dom';
import { TruckIcon, ClockIcon, ShieldCheckIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';
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
              Trouvez des transporteurs professionnels près de chez vous. Économisez jusqu'à 40% sur vos frais de transport.
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

      {/* CTA Section */}
      <div className="bg-teal-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Prêt à simplifier vos transports ?</span>
            <span className="block text-teal-300">Rejoignez Pro-Trans aujourd'hui.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button
                to="/register"
                variant="primary"
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100"
              >
                S'inscrire gratuitement
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