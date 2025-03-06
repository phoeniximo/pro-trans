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

  // Cat�gories de FAQ
  const categories = [
    { id: 'general', name: 'Informations g�n�rales' },
    { id: 'client', name: 'Pour les clients' },
    { id: 'transporteur', name: 'Pour les transporteurs' },
    { id: 'payment', name: 'Paiements et tarifs' },
    { id: 'security', name: 'S�curit� et assurances' }
  ];

  // Questions et r�ponses par cat�gorie
  const faqItems = {
    general: [
      {
        question: "Qu'est-ce que Pro-Trans ?",
        answer: "Pro-Trans est une plateforme de mise en relation entre particuliers et professionnels du transport. Nous permettons aux personnes ayant besoin de transporter des marchandises de trouver facilement des transporteurs fiables, et aux transporteurs d'optimiser leurs trajets et de trouver de nouveaux clients."
      },
      {
        question: "Comment fonctionne Pro-Trans ?",
        answer: "C'est simple ! Les clients publient des annonces d�taillant ce qu'ils souhaitent transporter, d'o� � o�, et quand. Les transporteurs consultent ces annonces et envoient des devis. Le client choisit le transporteur qui lui convient le mieux, effectue le paiement via notre plateforme s�curis�e, et peut suivre sa livraison en temps r�el."
      },
      {
        question: "Qui peut utiliser Pro-Trans ?",
        answer: "Notre plateforme est ouverte � tous : particuliers souhaitant transporter des biens, professionnels ayant des besoins r�guliers ou ponctuels de transport, transporteurs ind�pendants ou soci�t�s de transport. Tous les utilisateurs doivent s'inscrire et cr�er un compte pour acc�der � nos services."
      },
      {
        question: "Quels types de transports peut-on effectuer sur Pro-Trans ?",
        answer: "Pro-Trans couvre une large gamme de besoins : transport de colis, de meubles, de marchandises diverses, de palettes, d�m�nagements, transport de v�hicules, et bien plus. Que vous ayez besoin de d�placer un simple colis ou de r�aliser un d�m�nagement complet, vous trouverez des transporteurs adapt�s � vos besoins."
      }
    ],
    client: [
      {
        question: "Comment cr�er une annonce de transport ?",
        answer: "Pour cr�er une annonce, connectez-vous � votre compte, cliquez sur 'Publier une annonce' et remplissez le formulaire en d�taillant ce que vous souhaitez transporter, l'adresse de d�part et d'arriv�e, la date souhait�e et toute information pertinente. Vous pouvez �galement ajouter des photos pour aider les transporteurs � �valuer votre demande."
      },
      {
        question: "Comment choisir le meilleur transporteur ?",
        answer: "Lorsque vous recevez des devis, consultez le profil des transporteurs, leurs �valuations et avis laiss�s par d'autres clients. Comparez les prix, les d�lais propos�s et les services inclus. N'h�sitez pas � poser des questions via notre messagerie int�gr�e avant de faire votre choix."
      },
      {
        question: "Que faire si ma livraison est endommag�e ou perdue ?",
        answer: "Si votre bien est endommag� ou perdu, signalez-le imm�diatement via la plateforme. Notre �quipe de m�diation interviendra pour trouver une solution. Tous les transports effectu�s via Pro-Trans b�n�ficient d'une assurance de base. Pour les objets de valeur, nous recommandons de souscrire � notre assurance premium."
      },
      {
        question: "Puis-je annuler mon annonce ou un devis accept� ?",
        answer: "Vous pouvez annuler votre annonce tant qu'aucun devis n'a �t� accept�. Si vous avez d�j� accept� un devis, une annulation peut entra�ner des frais selon notre politique d'annulation, qui d�pend du d�lai restant avant la date de transport pr�vue."
      }
    ],
    transporteur: [
      {
        question: "Comment devenir transporteur sur Pro-Trans ?",
        answer: "Pour devenir transporteur, inscrivez-vous en choisissant le profil 'Transporteur', compl�tez votre profil avec vos informations professionnelles, et t�l�chargez les documents requis (assurance, licence de transport si applicable). Notre �quipe v�rifiera vos informations et vous donnera acc�s aux annonces disponibles."
      },
      {
        question: "Comment trouver des annonces adapt�es � mon v�hicule ?",
        answer: "Utilisez nos filtres de recherche pour trouver des annonces correspondant � votre v�hicule et � vos trajets habituels. Vous pouvez filtrer par lieu, date, type de transport, poids, volume, etc. Vous pouvez �galement configurer des alertes pour �tre notifi� des nouvelles annonces correspondant � vos crit�res."
      },
      {
        question: "Comment sont calcul�s les frais de service pour les transporteurs ?",
        answer: "Pro-Trans pr�l�ve une commission sur chaque transport effectu� via notre plateforme. Cette commission est calcul�e en pourcentage du montant total du devis accept�. Le pourcentage exact d�pend de votre statut (transporteur occasionnel ou professionnel) et de votre volume d'activit� sur la plateforme."
      },
      {
        question: "Quand et comment suis-je pay� pour mes transports ?",
        answer: "Le client effectue le paiement sur la plateforme au moment d'accepter votre devis. L'argent est conserv� en s�questre et vous est vers� 24 heures apr�s la confirmation de livraison par le client. Vous pouvez suivre vos revenus et demander des virements vers votre compte bancaire depuis votre espace transporteur."
      }
    ],
    payment: [
      {
        question: "Quels moyens de paiement sont accept�s ?",
        answer: "Pro-Trans accepte les cartes bancaires (Visa, Mastercard), les virements bancaires et PayPal. Tous les paiements sont s�curis�s et trait�s par des prestataires de confiance conformes aux normes PCI DSS."
      },
      {
        question: "Comment fonctionne le syst�me de s�questre ?",
        answer: "Lorsqu'un client accepte un devis, le paiement est imm�diatement d�bit� mais conserv� en s�questre. L'argent n'est vers� au transporteur que 24 heures apr�s la confirmation de livraison par le client, garantissant ainsi la s�curit� des deux parties."
      },
      {
        question: "Quels sont les frais de service de Pro-Trans ?",
        answer: "Les frais de service varient selon le montant du transport et le statut de l'utilisateur. Pour les clients, ils repr�sentent g�n�ralement entre 5% et 10% du montant du transport. Pour les transporteurs, ils varient entre 8% et 15%. Ces frais couvrent l'utilisation de la plateforme, le service client, le syst�me de paiement s�curis� et l'assurance de base."
      },
      {
        question: "Comment obtenir une facture pour mes transactions ?",
        answer: "Toutes les factures sont automatiquement g�n�r�es et disponibles dans votre espace personnel. Vous pouvez les consulter, les t�l�charger au format PDF ou les recevoir par email. Les factures sont conformes � la l�gislation fran�aise et incluent toutes les informations n�cessaires pour votre comptabilit�."
      }
    ],
    security: [
      {
        question: "Comment Pro-Trans garantit-il la s�curit� des transactions ?",
        answer: "Pro-Trans utilise un syst�me de paiement s�curis� conforme aux normes PCI DSS. Le syst�me de s�questre prot�ge � la fois les clients et les transporteurs. Toutes les communications sont crypt�es et nous ne stockons jamais les donn�es sensibles de paiement sur nos serveurs."
      },
      {
        question: "Les transports sont-ils assur�s ?",
        answer: "Oui, tous les transports effectu�s via Pro-Trans b�n�ficient d'une assurance de base couvrant jusqu'� 1000� de dommages. Pour les objets de plus grande valeur, nous proposons une assurance premium optionnelle avec diff�rents niveaux de couverture. Les transporteurs doivent �galement disposer de leur propre assurance professionnelle."
      },
      {
        question: "Comment sont v�rifi�s les transporteurs ?",
        answer: "Tous les transporteurs doivent compl�ter un processus de v�rification qui inclut la validation de leur identit�, la v�rification de leurs documents professionnels (assurance, licence de transport si applicable) et la confirmation de leurs coordonn�es. Nous surveillons �galement les �valuations et pouvons suspendre les transporteurs ne respectant pas nos standards de qualit�."
      },
      {
        question: "Que faire en cas de litige avec un transporteur ou un client ?",
        answer: "En cas de litige, contactez notre service de m�diation via votre espace personnel ou par email � mediation@pro-trans.fr. Notre �quipe analysera la situation et interviendra pour trouver une solution �quitable. Si n�cessaire, nous pouvons geler les fonds en s�questre le temps de r�soudre le conflit."
      }
    ]
  };

  // Fonction pour basculer l'�tat d'ouverture d'un �l�ment FAQ
  const toggleItem = (itemId) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Filtrer les questions en fonction de la recherche
  const filteredFaqItems = {};
  if (searchQuery.trim() !== '') {
    // Recherche dans toutes les cat�gories
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
    // Sans recherche, afficher uniquement la cat�gorie active
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
            Trouvez rapidement des r�ponses � vos questions sur Pro-Trans
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
          {/* Cat�gories - visible uniquement en desktop et quand pas de recherche */}
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

          {/* Liste de cat�gories mobile - visible uniquement quand pas de recherche */}
          {!searchQuery && (
            <div className="lg:hidden mb-8">
              <label htmlFor="category" className="sr-only">
                Cat�gorie
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

          {/* Questions et r�ponses */}
          <div className={`${searchQuery ? 'lg:col-span-12' : 'lg:col-span-9'}`}>
            {Object.keys(filteredFaqItems).length === 0 ? (
              <div className="text-center py-12">
                <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun r�sultat trouv�</h3>
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
                {/* Afficher le titre de la cat�gorie uniquement s'il n'y a pas de recherche */}
                {!searchQuery && (
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {categories.find(c => c.id === activeCategory)?.name}
                  </h2>
                )}
                
                {/* Si recherche, afficher les r�sultats par cat�gorie */}
                {searchQuery && Object.keys(filteredFaqItems).length > 0 && (
                  <p className="text-sm text-gray-500 mb-6">
                    {Object.values(filteredFaqItems).flat().length} r�sultat(s) pour "{searchQuery}"
                  </p>
                )}

                <div className="space-y-6">
                  {/* Si recherche, afficher toutes les cat�gories avec des r�sultats */}
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

        {/* Section d'aide suppl�mentaire */}
        <div className="mt-16 bg-teal-50 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10 sm:pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold text-teal-900">
                  Vous n'avez pas trouv� de r�ponse � votre question ?
                </h3>
                <p className="mt-2 text-base text-teal-700">
                  Notre �quipe de support est disponible pour vous aider. Contactez-nous par email, t�l�phone ou via le formulaire de contact.
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
                    R�ponse sous 24h ouvr�es
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-teal-900">Par t�l�phone</h4>
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