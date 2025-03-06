import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TruckIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  GlobeEuropeAfricaIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';

const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-teal-700 py-16 sm:py-24">
        <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:gap-24 lg:items-start">
          <div className="relative sm:py-16 lg:py-0">
            <div className="relative mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-0 lg:max-w-none">
              <div className="relative rounded-2xl shadow-xl overflow-hidden">
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src="/assets/images/about-hero.jpg"
                  alt="Equipe Pro-Trans"
                />
                <div className="absolute inset-0 bg-teal-500 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-800 via-teal-700 opacity-40" />
                <div className="relative px-8 py-72">
                  <div className="absolute bottom-8 left-8">
                    <blockquote className="mt-4">
                      <div className="relative text-lg font-medium text-white md:flex-grow">
                        <p className="relative">
                          Notre mission : révolutionner le transport de marchandises en France
                        </p>
                      </div>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-0">
            <div className="pt-12 sm:pt-16 lg:pt-20">
              <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                A propos de Pro-Trans
              </h2>
              <div className="mt-6 text-gray-200 space-y-6">
                <p className="text-lg">
                  Pro-Trans est née en 2022 d'une idée simple : simplifier et rendre plus accessible le transport de marchandises pour les particuliers et les professionnels.
                </p>
                <p className="text-lg">
                  Notre plateforme met en relation les personnes ayant besoin de transporter des biens avec des transporteurs professionnels ou indépendants, offrant ainsi une solution pratique, économique et respectueuse de l'environnement.
                </p>
                <p className="text-lg">
                  Grâce à notre système de mise en relation directe, nos utilisateurs économisent en moyenne 40% sur leurs frais de transport, tandis que les transporteurs optimisent leurs trajets et augmentent leur rentabilité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our values section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Nos valeurs</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Des principes qui guident chacune de nos actions et décisions.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-md shadow-lg">
                        <ShieldCheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Confiance et Sécurité</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Nous vérifions rigoureusement l'identité et les qualifications de tous nos transporteurs. Notre système d'évaluation et notre garantie de remboursement assurent votre tranquillité d'esprit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-md shadow-lg">
                        <GlobeEuropeAfricaIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Responsabilité Environnementale</h3>
                    <p className="mt-5 text-base text-gray-500">
                      En optimisant les trajets et en réduisant les déplacements à vide, nous contribuons activement à la réduction de l'empreinte carbone du secteur du transport.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-md shadow-lg">
                        <UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Communauté et Partage</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Nous valorisons l'esprit de communauté et encourageons le partage d'expériences entre utilisateurs pour améliorer constamment notre service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Notre équipe</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Des passionnés qui travaillent chaque jour pour améliorer votre expérience.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Team member 1 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center">
                  <img
                    className="inline-block h-32 w-32 rounded-full object-cover"
                    src="/assets/images/team-1.jpg"
                    alt="Thomas Martin"
                  />
                  <h3 className="mt-6 text-lg font-medium text-gray-900">Thomas Martin</h3>
                  <p className="text-sm text-gray-500">Co-fondateur & CEO</p>
                  <p className="mt-3 text-base text-gray-600">
                    Ancien consultant en logistique, Thomas a créé Pro-Trans pour révolutionner le secteur du transport de marchandises.
                  </p>
                </div>
              </div>
            </div>

            {/* Team member 2 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center">
                  <img
                    className="inline-block h-32 w-32 rounded-full object-cover"
                    src="/assets/images/team-2.jpg"
                    alt="Sophie Dubois"
                  />
                  <h3 className="mt-6 text-lg font-medium text-gray-900">Sophie Dubois</h3>
                  <p className="text-sm text-gray-500">Co-fondatrice & CTO</p>
                  <p className="mt-3 text-base text-gray-600">
                    Ingénieure en informatique, Sophie dirige le développement technique de la plateforme Pro-Trans.
                  </p>
                </div>
              </div>
            </div>

            {/* Team member 3 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center">
                  <img
                    className="inline-block h-32 w-32 rounded-full object-cover"
                    src="/assets/images/team-3.jpg"
                    alt="Antoine Lefèvre"
                  />
                  <h3 className="mt-6 text-lg font-medium text-gray-900">Antoine Lefèvre</h3>
                  <p className="text-sm text-gray-500">Directeur des Opérations</p>
                  <p className="mt-3 text-base text-gray-600">
                    Avec 15 ans d'expérience dans le secteur du transport, Antoine s'assure du bon fonctionnement de notre réseau.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-teal-700 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Pro-Trans en chiffres
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <span className="text-5xl font-extrabold text-white">5,000+</span>
              <p className="mt-2 text-xl font-medium text-teal-100">Transporteurs actifs</p>
            </div>
            <div className="text-center">
              <span className="text-5xl font-extrabold text-white">15,000+</span>
              <p className="mt-2 text-xl font-medium text-teal-100">Clients satisfaits</p>
            </div>
            <div className="text-center">
              <span className="text-5xl font-extrabold text-white">30,000+</span>
              <p className="mt-2 text-xl font-medium text-teal-100">Livraisons réussies</p>
            </div>
            <div className="text-center">
              <span className="text-5xl font-extrabold text-white">40%</span>
              <p className="mt-2 text-xl font-medium text-teal-100">Economie moyenne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our investors */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Nos investisseurs</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Ils nous font confiance et soutiennent notre vision.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex justify-center items-center">
              <img
                className="h-16 grayscale hover:grayscale-0 transition-all"
                src="/assets/images/investor-1.svg"
                alt="Investor 1"
              />
            </div>
            <div className="flex justify-center items-center">
              <img
                className="h-16 grayscale hover:grayscale-0 transition-all"
                src="/assets/images/investor-2.svg"
                alt="Investor 2"
              />
            </div>
            <div className="flex justify-center items-center">
              <img
                className="h-16 grayscale hover:grayscale-0 transition-all"
                src="/assets/images/investor-3.svg"
                alt="Investor 3"
              />
            </div>
            <div className="flex justify-center items-center">
              <img
                className="h-16 grayscale hover:grayscale-0 transition-all"
                src="/assets/images/investor-4.svg"
                alt="Investor 4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact us section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="relative sm:py-16">
          <div aria-hidden="true" className="hidden sm:block">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-teal-700 rounded-r-3xl"></div>
            <svg className="absolute top-8 left-1/2 -ml-3" width="404" height="392" fill="none" viewBox="0 0 404 392">
              <defs>
                <pattern
                  id="8228f071-bcee-4ec8-905a-2a059a2cc4fb"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect x="0" y="0" width="4" height="4" className="text-teal-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="392" fill="url(#8228f071-bcee-4ec8-905a-2a059a2cc4fb)" />
            </svg>
          </div>
          <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="relative rounded-2xl px-6 py-10 bg-teal-600 overflow-hidden shadow-xl sm:px-12 sm:py-20">
              <div aria-hidden="true" className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0">
                <svg
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 1463 360"
                >
                  <path
                    className="text-teal-500 text-opacity-40"
                    fill="currentColor"
                    d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z"
                  />
                  <path
                    className="text-teal-700 text-opacity-40"
                    fill="currentColor"
                    d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z"
                  />
                </svg>
              </div>
              <div className="relative">
                <div className="sm:text-center">
                  <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                    Besoin d'en savoir plus ?
                  </h2>
                  <p className="mt-6 mx-auto max-w-2xl text-lg text-teal-100">
                    Notre équipe est à votre disposition pour répondre à toutes vos questions concernant Pro-Trans ou pour vous aider dans vos démarches.
                  </p>
                </div>
                <div className="mt-12 sm:mx-auto sm:max-w-lg sm:flex">
                  <div className="mt-4 sm:mt-0 sm:ml-3 w-full">
                    <Button 
                      to="/contact" 
                      variant="primary" 
                      className="w-full bg-white text-teal-600 hover:bg-gray-100"
                      size="lg"
                    >
                      Contactez-nous
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Us CTA */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Rejoignez l'aventure Pro-Trans</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Que vous soyez client ou transporteur, devenez acteur de la révolution du transport.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-teal-100">
                  <BuildingOfficeIcon className="h-12 w-12 text-teal-600" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-medium text-gray-900">Pour les clients</h3>
                <p className="mt-3 text-lg text-gray-600">
                  Economisez jusqu'à 40% sur vos frais de transport et trouvez le transporteur idéal en quelques clics.
                </p>
                <div className="mt-8">
                  <Button
                    to="/register"
                    variant="primary"
                    size="lg"
                  >
                    S'inscrire comme client
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-teal-100">
                  <TruckIcon className="h-12 w-12 text-teal-600" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-medium text-gray-900">Pour les transporteurs</h3>
                <p className="mt-3 text-lg text-gray-600">
                  Optimisez vos trajets, trouvez de nouveaux clients et augmentez votre chiffre d'affaires.
                </p>
                <div className="mt-8">
                  <Button
                    to="/register?role=transporteur"
                    variant="primary"
                    size="lg"
                  >
                    S'inscrire comme transporteur
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;