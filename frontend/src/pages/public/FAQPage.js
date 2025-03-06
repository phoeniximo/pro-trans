import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openItems, setOpenItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Catégories de FAQ
  const categories = [
    { id: 'general', name: 'Informations générales' },
    { id: 'client', name: 'Pour les clients' },
    { id: 'transporteur', name: 'Pour les transporteurs' },
    { id: 'payment', name: 'Paiements et tarifs' },
    { id: 'security', name: 'Sécurité et assurances' }
  ];

  // Questions et réponses par catégorie
  const faqItems = {
    general: [
      {
        question: "Qu'est-ce que Pro-Trans ?",
        answer: "Pro-Trans est une plateforme de mise en relation entre particuliers et professionnels du transport. Nous permettons aux personnes ayant besoin de transporter des marchandises de trouver facilement des transporteurs fiables, et aux transporteurs d'optimiser leurs trajets et de trouver de nouveaux clients."
      },
      {
        question: "Comment fonctionne Pro-Trans ?",
        answer: "C'est simple ! Les clients publient des annonces détaillant ce qu'ils souhaitent transporter, d'où à où, et quand. Les transporteurs consultent ces annonces et envoient des devis. Le client choisit le transporteur qui lui convient le mieux, effectue le paiement via notre plateforme sécurisée, et peut suivre sa livraison en temps réel."
      },
      {
        question: "Qui peut utiliser Pro-Trans ?",
        answer: "Notre plateforme est ouverte à tous : particuliers souhaitant transporter des biens, professionnels ayant des besoins réguliers ou ponctuels de transport, transporteurs indépendants ou sociétés de transport. Tous les utilisateurs doivent s'inscrire et créer un compte pour accéder à nos services."
      },
      {
        question: "Quels types de transports peut-on effectuer sur Pro-Trans ?",
        answer: "Pro-Trans couvre une large gamme de besoins : transport de colis, de meubles, de marchandises diverses, de palettes, déménagements, transport de véhicules, et bien plus. Que vous ayez besoin de déplacer un simple colis ou de réaliser un déménagement complet, vous trouverez des transporteurs adaptés à vos besoins."
      }
    ],
    client: [
      {
        question: "Comment créer une annonce de transport ?",
        answer: "Pour créer une annonce, connectez-vous à votre compte, cliquez sur 'Publier une annonce' et remplissez le formulaire en détaillant ce que vous souhaitez transporter, l'adresse de départ et d'arrivée, la date souhaitée et toute information pertinente. Vous pouvez également ajouter des photos pour aider les transporteurs à évaluer votre demande."
      },
      {
        question: "Comment choisir le meilleur transporteur ?",
        answer: "Lorsque vous recevez des devis, consultez le profil des transporteurs, leurs évaluations et avis laissés par d'autres clients. Comparez les prix, les délais proposés et les services inclus. N'hésitez pas à poser des questions via notre messagerie intégrée avant de faire votre choix."
      },
      {
        question: "Que faire si ma livraison est endommagée ou perdue ?",
        answer: "Si votre bien est endommagé ou perdu, signalez-le immédiatement via la plateforme. Notre équipe de médiation interviendra pour trouver une solution. Tous les transports effectués via Pro-Trans bénéficient d'une assurance de base. Pour les objets de valeur, nous recommandons de souscrire à notre assurance premium."
      },
      {
        question: "Puis-je annuler mon annonce ou un devis accepté ?",
        answer: "Vous pouvez annuler votre annonce tant qu'aucun devis n'a été accepté. Si vous avez déjà accepté un devis, une annulation peut entraîner des frais selon notre politique d'annulation, qui dépend du délai restant avant la date de transport prévue."
      }
    ],
    transporteur: [
      {
        question: "Comment devenir transporteur sur Pro-Trans ?",
        answer: "Pour devenir transporteur, inscrivez-vous en choisissant le profil 'Transporteur', complétez votre profil avec vos informations professionnelles, et téléchargez les documents requis (assurance, licence de transport si applicable). Notre équipe vérifiera vos informations et vous donnera accès aux annonces disponibles."
      },
      {
        question: "Comment trouver des annonces adaptées à mon véhicule ?",
        answer: "Utilisez nos filtres de recherche pour trouver des annonces correspondant à votre véhicule et à vos trajets habituels. Vous pouvez filtrer par lieu, date, type de transport, poids, volume, etc. Vous pouvez également configurer des alertes pour être notifié des nouvelles annonces correspondant à vos critères."
      },
      {
        question: "Comment sont calculés les frais de service pour les transporteurs ?",
        answer: "Pro-Trans prélève une commission sur chaque transport effectué via notre plateforme. Cette commission est calculée en pourcentage du montant total du devis accepté. Le pourcentage exact dépend de votre statut (transporteur occasionnel ou professionnel) et de votre volume d'activité sur la plateforme."
      },
      {
        question: "Quand et comment suis-je payé pour mes transports ?",
        answer: "Le client effectue le paiement sur la plateforme au moment d'accepter votre devis. L'argent est conservé en séquestre et vous est versé 24 heures après la confirmation de livraison par le client. Vous pouvez suivre vos revenus et demander des virements vers votre compte bancaire depuis votre espace transporteur."
      }
    ],
    payment: [
      {
        question: "Quels moyens de paiement sont acceptés ?",
        answer: "Pro-Trans accepte les cartes bancaires (Visa, Mastercard), les virements bancaires et PayPal. Tous les paiements sont sécurisés et traités par des prestataires de confiance conformes aux normes PCI DSS."
      },
      {
        question: "Comment fonctionne le système de séquestre ?",
        answer: "Lorsqu'un client accepte un devis, le paiement est immédiatement débité mais conservé en séquestre. L'argent n'est versé au transporteur que 24 heures après la confirmation de livraison par le client, garantissant ainsi la sécurité des deux parties."
      },
      {
        question: "Quels sont les frais de service de Pro-Trans ?",
        answer: "Les frais de service varient selon le montant du transport et le statut de l'utilisateur. Pour les clients, ils représentent généralement entre 5% et 10% du montant du transport. Pour les transporteurs, ils varient entre 8% et 15%. Ces frais couvrent l'utilisation de la plateforme, le service client, le système de paiement sécurisé et l'assurance de base."
      },
      {
        question: "Comment obtenir une facture pour mes transactions ?",
        answer: "Toutes les factures sont automatiquement générées et disponibles dans votre espace personnel. Vous pouvez les consulter, les télécharger au format PDF ou les recevoir par email. Les factures sont conformes à la législation française et incluent toutes les informations nécessaires pour votre comptabilité."
      }
    ],
    security: [
      {
        question: "Comment Pro-Trans garantit-il la sécurité des transactions ?",
        answer: "Pro-Trans utilise un système de paiement sécurisé conforme aux normes PCI DSS. Le système de séquestre protège à la fois les clients et les transporteurs. Toutes les communications sont cryptées et nous ne stockons jamais les données sensibles de paiement sur nos serveurs."
      },
      {
        question: "Les transports sont-ils assurés ?",
        answer: "Oui, tous les transports effectués via Pro-Trans bénéficient d'une assurance de base couvrant jusqu'à 1000€ de dommages. Pour les objets de plus grande valeur, nous proposons une assurance premium optionnelle avec différents niveaux de couverture. Les transporteurs doivent également disposer de leur propre assurance professionnelle."
      },
      {
        question: "Comment sont vérifiés les transporteurs ?",
        answer: "Tous les transporteurs doivent compléter un processus de vérification qui inclut la validation de leur identité, la vérification de leurs documents professionnels (assurance, licence de transport si applicable) et la confirmation de leurs coordonnées. Nous surveillons également les évaluations et pouvons suspendre les transporteurs ne respectant pas nos standards de qualité."
      },
      {
        question: "Que faire en cas de litige avec un transporteur ou un client ?",
        answer: "En cas de litige, contactez notre service de médiation via votre espace personnel ou par email à mediation@pro-trans.fr. Notre équipe analysera la situation et interviendra pour trouver une solution équitable. Si nécessaire, nous pouvons geler les fonds en séquestre le temps de résoudre le conflit."
      }
    ]
  };

  // Fonction pour basculer l'état d'ouverture d'un élément FAQ
  const toggleItem = (itemId) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Filtrer les questions en fonction de la recherche
  const filteredFaqItems = {};
  if (searchQuery.trim() !== '') {
    // Recherche dans toutes les catégories
    Object.keys(faqItems).forEach(category => {
      const matchingItems = faqItems[category].filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingItems.length > 0) {
        filteredFaqItems[category] = matchingItems;
      }
    });
  } else {
    // Sans recherche, afficher uniquement la catégorie active
    filteredFaqItems[activeCategory] = faqItems[activeCategory];
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Foire aux questions
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Trouvez rapidement des réponses à vos questions sur Pro-Trans
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-xl mx-auto mt-8 mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Catégories - visible uniquement en desktop et quand pas de recherche */}
          {!searchQuery && (
            <div className="hidden lg:block lg:col-span-3">
              <nav className="sticky top-4 space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`${
                      activeCategory === category.id
                        ? 'bg-teal-50 border-teal-500 text-teal-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group w-full flex items-center px-3 py-2 text-sm font-medium border-l-4`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Liste de catégories mobile - visible uniquement quand pas de recherche */}
          {!searchQuery && (
            <div className="lg:hidden mb-8">
              <label htmlFor="category" className="sr-only">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Questions et réponses */}
          <div className={`${searchQuery ? 'lg:col-span-12' : 'lg:col-span-9'}`}>
            {Object.keys(filteredFaqItems).length === 0 ? (
              <div className="text-center py-12">
                <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun résultat trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Essayez avec d'autres termes ou contactez notre support.
                </p>
                <div className="mt-6">
                  <Button to="/contact" variant="primary">
                    Contactez-nous
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {/* Afficher le titre de la catégorie uniquement s'il n'y a pas de recherche */}
                {!searchQuery && (
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {categories.find(c => c.id === activeCategory)?.name}
                  </h2>
                )}
                
                {/* Si recherche, afficher les résultats par catégorie */}
                {searchQuery && Object.keys(filteredFaqItems).length > 0 && (
                  <p className="text-sm text-gray-500 mb-6">
                    {Object.values(filteredFaqItems).flat().length} résultat(s) pour "{searchQuery}"
                  </p>
                )}

                <div className="space-y-6">
                  {/* Si recherche, afficher toutes les catégories avec des résultats */}
                  {searchQuery ? (
                    Object.keys(filteredFaqItems).map(categoryId => (
                      <div key={categoryId} className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          {categories.find(c => c.id === categoryId)?.name}
                        </h3>
                        <dl className="space-y-6 divide-y divide-gray-200">
                          {filteredFaqItems[categoryId].map((item, idx) => {
                            const itemId = `${categoryId}-${idx}`;
                            return (
                              <div key={itemId} className={idx > 0 ? 'pt-6' : ''}>
                                <dt className="text-lg">
                                  <button
                                    onClick={() => toggleItem(itemId)}
                                    className="text-left w-full flex justify-between items-start text-gray-900"
                                  >
                                    <span className="font-medium text-gray-900">{item.question}</span>
                                    <span className="ml-6 h-7 flex items-center">
                                      {openItems[itemId] ? (
                                        <ChevronUpIcon className="h-5 w-5 text-teal-500" />
                                      ) : (
                                        <ChevronDownIcon className="h-5 w-5 text-teal-500" />
                                      )}
                                    </span>
                                  </button>
                                </dt>
                                {openItems[itemId] && (
                                  <dd className="mt-2 pr-12">
                                    <p className="text-base text-gray-600">{item.answer}</p>
                                  </dd>
                                )}
                              </div>
                            );
                          })}
                        </dl>
                      </div>
                    ))
                  ) : (
                    <dl className="space-y-6 divide-y divide-gray-200">
                      {filteredFaqItems[activeCategory].map((item, idx) => {
                        const itemId = `${activeCategory}-${idx}`;
                        return (
                          <div key={itemId} className={idx > 0 ? 'pt-6' : ''}>
                            <dt className="text-lg">
                              <button
                                onClick={() => toggleItem(itemId)}
                                className="text-left w-full flex justify-between items-start text-gray-900"
                              >
                                <span className="font-medium text-gray-900">{item.question}</span>
                                <span className="ml-6 h-7 flex items-center">
                                  {openItems[itemId] ? (
                                    <ChevronUpIcon className="h-5 w-5 text-teal-500" />
                                  ) : (
                                    <ChevronDownIcon className="h-5 w-5 text-teal-500" />
                                  )}
                                </span>
                              </button>
                            </dt>
                            {openItems[itemId] && (
                              <dd className="mt-2 pr-12">
                                <p className="text-base text-gray-600">{item.answer}</p>
                              </dd>
                            )}
                          </div>
                        );
                      })}
                    </dl>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section d'aide supplémentaire */}
        <div className="mt-16 bg-teal-50 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10 sm:pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold text-teal-900">
                  Vous n'avez pas trouvé de réponse à votre question ?
                </h3>
                <p className="mt-2 text-base text-teal-700">
                  Notre équipe de support est disponible pour vous aider. Contactez-nous par email, téléphone ou via le formulaire de contact.
                </p>
              </div>
              <div className="flex justify-center lg:justify-end">
                <Button to="/contact" variant="primary" size="lg">
                  Nous contacter
                </Button>
              </div>
            </div>
          </div>
          <div className="px-6 pt-6 pb-8 bg-teal-100 sm:p-10 sm:pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-medium text-teal-900">Par email</h4>
                <div className="mt-2 text-base text-teal-800">
                  <p>support@pro-trans.fr</p>
                  <p className="mt-1 text-sm text-teal-700">
                    Réponse sous 24h ouvrées
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-teal-900">Par téléphone</h4>
                <div className="mt-2 text-base text-teal-800">
                  <p>01 23 45 67 89</p>
                  <p className="mt-1 text-sm text-teal-700">
                    Du lundi au vendredi, 9h - 18h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;