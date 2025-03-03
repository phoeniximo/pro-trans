import Link from 'next/link';
import TransporteurRibbon from '../components/TransporteurRibbon';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Trouvez un transport pour vos biens
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connectez-vous avec des transporteurs fiables pour vos besoins de transport. 
          Économisez sur les coûts en utilisant des espaces disponibles lors de trajets existants.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/annonces/create"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Publier une annonce
          </Link>
          <Link 
            href="/annonces"
            className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            Voir les annonces
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4">Pour les particuliers</h3>
          <p className="text-gray-600">
            Publiez gratuitement vos besoins en transport et recevez des propositions de transporteurs professionnels.
            Économisez jusqu'à 50% sur vos frais de transport.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4">Pour les transporteurs</h3>
          <p className="text-gray-600">
            Trouvez des clients sur votre trajet et optimisez vos déplacements en évitant les retours à vide.
            Augmentez votre chiffre d'affaires sans frais supplémentaires.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4">Simple et sécurisé</h3>
          <p className="text-gray-600">
            Système de notation, messagerie intégrée et suivi des transports en temps réel.
            Tous les transporteurs sont vérifiés pour garantir la qualité de service.
          </p>
        </div>
      </section>

      {/* TransporteurRibbon Component */}
      <TransporteurRibbon />

      {/* How it works Section */}
      <section className="bg-white p-8 rounded-lg shadow mt-8 mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Inscription</h3>
            <p className="text-gray-600">Créez votre compte gratuitement en quelques clics</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">Publication</h3>
            <p className="text-gray-600">Publiez votre annonce de transport</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Devis</h3>
            <p className="text-gray-600">Recevez et acceptez le meilleur devis</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-blue-600">4</span>
            </div>
            <h3 className="font-semibold mb-2">Transport</h3>
            <p className="text-gray-600">Finalisez votre transport et notez le transporteur</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white rounded-lg p-8 mx-4 my-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl mb-8">
            Rejoignez notre communauté et trouvez une solution de transport adaptée à vos besoins.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Créer un compte
            </Link>
            <Link 
              href="/annonces"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Explorer les annonces
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}