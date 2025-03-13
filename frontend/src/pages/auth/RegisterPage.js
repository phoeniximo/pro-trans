// src/pages/auth/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  PhoneIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Commencer à l'étape 0 pour le choix du rôle
  const [selectedRole, setSelectedRole] = useState('client');
  const [businessType, setBusinessType] = useState('societe');
  const [acceptedPackagingTypes, setAcceptedPackagingTypes] = useState([]);
  const [vehicleImage, setVehicleImage] = useState(null);
  const [vehicleImagePreview, setVehicleImagePreview] = useState(null);

  // Liste des villes marocaines avec leurs codes postaux
  const moroccanCitiesWithPostalCodes = {
    'Casablanca': '20000',
    'Rabat': '10000',
    'Fès': '30000',
    'Marrakech': '40000',
    'Tanger': '90000',
    'Agadir': '80000',
    'Meknès': '50000',
    'Oujda': '60000',
    'Kenitra': '14000',
    'Tétouan': '93000',
    'Safi': '46000',
    'El Jadida': '24000',
    'Nador': '62000',
    'Laâyoune': '70000',
    'Béni Mellal': '23000',
    'Mohammédia': '28800',
    'Khouribga': '25000',
    'Inezgane': '86350',
    'Settat': '26000',
    'Berrechid': '26100',
    'Ksar El Kebir': '92150',
    'Taourirt': '65800',
    'Essaouira': '44000',
    'Guelmim': '81000',
    'Guercif': '35100',
    'Sidi Bennour': '24350',
    'Dakhla': '73000',
    'Errachidia': '52000',
    'Sidi Kacem': '16000',
    'Youssoufia': '46300',
    'Al Hoceima': '32000',
    'Taza': '35000',
    'Larache': '92000',
    'Ouarzazate': '45000',
    'Berkane': '60300',
    'Tiflet': '15400',
    'Tan-Tan': '82000',
    'Sidi Slimane': '14200',
    'Zagora': '47900',
    'Midelt': '54350',
    'Oued Zem': '25350',
    'Tinghir': '45800',
    'Azrou': '53100',
    'Boujdour': '71000',
    'Sefrou': '31000',
    'Taroudant': '83000',
    'Chichaoua': '41000',
    'Chefchaouen': '91000',
    'Oulad Teima': '83350',
    'Ait Melloul': '86150',
    'Ifrane': '53000',
    'Tiznit': '85000',
    'Martil': '93150',
    'Fnideq': '93100',
    'Bouznika': '13100',
    'Temara': '12000',
    'Assilah': '90050',
    'Taounate': '34000',
    'El Kelaa des Sraghna': '43000',
    'Bouarfa': '61200',
    'Bouskoura': '27182',
    'Rissani': '52450',
    'Sidi Ifni': '85200',
    'Fquih Ben Salah': '23200',
    'Azemmour': '24100',
    'Skhirat': '12050',
    'Imzouren': '32250',
    'Ain Harrouda': '28630',
    'Ait Baha': '87100',
    'Missour': '33250',
    'Demnate': '22300',
    'El Hajeb': '51000',
    'Ain Taoujdate': '51100',
    'Boulemane': '33250',
    'Tafraout': '85450',
    'Sidi Yahya El Gharb': '14250',
    'Aghbalou': '23050',
    'M\'diq': '93200',
    'Alnif': '52450',
    'Tamesna': '12047',
    'Bouknadel': '11000',
    'Moulay Idriss Zerhoun': '50070',
    'Bin El Ouidane': '22350',
    'Aoulouz': '83050',
    'Sidi Bou Othmane': '40150',
    'Smara': '72000',
    'Bni Bouayach': '32050',
    'Debdou': '65900',
    'Lqliaa': '86356',
    'Oulad Mbarek': '25122',
    'Tahannaout': '40000'
  };
  
  // Liste des villes marocaines (uniquement les noms)
  const moroccanCities = Object.keys(moroccanCitiesWithPostalCodes);
  // Liste des types de conditionnements
  const packagingTypes = [
    { id: 'palettes', label: 'Palettes' },
    { id: 'caisses', label: 'Caisses/Cartons' },
    { id: 'colis', label: 'Colis' },
    { id: 'bagages', label: 'Bagages' },
    { id: 'vrac', label: 'Matériels sans conditionnement (vrac)' },
    { id: 'horsGabarit', label: 'Matériel hors gabarit (piscine, citerne...)' },
    { id: 'meuble', label: 'Meuble, appareil ménager...' },
    { id: 'voitures', label: 'Voitures' },
    { id: 'motos', label: 'Motos et vélos' },
    { id: 'bateaux', label: 'Bateaux' },
    { id: 'autresVehicules', label: 'Autres véhicules' },
    { id: 'demenagements', label: 'Déménagements' },
    { id: 'marchandises', label: 'Marchandises' },
    { id: 'piecesAuto', label: 'Pièces automobile' },
    { id: 'machines', label: 'Machine et équipement' },
    { id: 'fragile', label: 'Marchandise fragile' },
    { id: 'autresLivraisons', label: 'Autres livraisons' }
  ];
  // Schéma de validation avec Yup - Étape 1 (informations société pour transporteurs)
  const validationSchemaStep1 = Yup.object().shape({
    businessType: Yup.string()
      .required('Le type d\'entreprise est obligatoire')
      .oneOf(['societe', 'autoEntrepreneur', 'transporteurPrive'], 'Type d\'entreprise invalide'),
    
    ...(selectedRole === 'transporteur' && {
      societe: Yup.string()
        .when('businessType', {
          is: 'societe',
          then: () => Yup.string().required('Le nom de l\'entreprise est obligatoire')
        }),
    }),
    
    ...(selectedRole === 'transporteur' && {
      customCity: Yup.boolean(),
      adresse: Yup.object().shape({
        rue: Yup.string().required('L\'adresse est obligatoire'),
        ville: Yup.string().required('La ville est obligatoire'),
        codePostal: Yup.string()
          .when('$customCity', {
            is: true,
            then: () => Yup.string().notRequired(),
            otherwise: () => Yup.string()
              .required('Le code postal est obligatoire')
              .matches(/^[0-9]{5}$/, 'Le code postal doit être composé de 5 chiffres')
          }),
        pays: Yup.string().required('Le pays est obligatoire').default('Maroc')
      }, [['$customCity', 'customCity']])
    })
  });
  
  // Schéma de validation - Étape 2 (conditionnements pour transporteurs)
  const validationSchemaStep2 = Yup.object().shape({
    ...(selectedRole === 'transporteur' && {
      acceptedPackagingTypes: Yup.array()
        .min(1, 'Veuillez sélectionner au moins un type de conditionnement')
    })
  });
  
  // Schéma de validation - Étape 3 (informations personnelles)
  const validationSchemaStep3 = Yup.object({
    nom: Yup.string()
      .required('Le nom est obligatoire')
      .min(2, 'Le nom doit comporter au moins 2 caractères')
      .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
    
    prenom: Yup.string()
      .required('Le prénom est obligatoire')
      .min(2, 'Le prénom doit comporter au moins 2 caractères')
      .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),
    
    email: Yup.string()
      .required('L\'email est obligatoire')
      .email('Format d\'email invalide'),
    
    telephone: Yup.string()
      .required('Le numéro de téléphone est obligatoire')
      .matches(
        /^(\+212|0)[5-7](\d{2}){4}$/, 
        'Format de téléphone invalide (ex: 0612345678 ou +212612345678)'
      ),
    
    password: Yup.string()
      .required('Le mot de passe est obligatoire')
      .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    
    passwordConfirm: Yup.string()
      .required('La confirmation du mot de passe est obligatoire')
      .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas'),
    
    acceptTerms: Yup.boolean()
      .required('Vous devez accepter les conditions générales')
      .oneOf([true], 'Vous devez accepter les conditions générales')
  });
  
  // Initialisation du formulaire Step 1 (informations société)
  const formikStep1 = useFormik({
    initialValues: {
      businessType: businessType,
      societe: '',
      adresse: {
        rue: '',
        ville: '',
        codePostal: '',
        pays: 'Maroc'
      },
      customCity: false // Indique si l'utilisateur a entré une ville personnalisée
    },
    validationSchema: validationSchemaStep1,
    onSubmit: (values) => {
      if (selectedRole === 'client' || currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      }
    }
  });
  
  // Filtrer les villes en fonction de la saisie
  const [filteredCities, setFilteredCities] = useState([]);
  
  // Gérer la saisie dans le champ ville
  const handleCityInputChange = (e) => {
    const value = e.target.value;
    formikStep1.setFieldValue('adresse.ville', value);
    formikStep1.setFieldValue('customCity', true);
    
    // Filtrer les villes qui commencent par la valeur saisie
    if (value.length > 0) {
      const filtered = moroccanCities.filter(city => 
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredCities(filtered.slice(0, 5)); // Limiter à 5 suggestions
    } else {
      setFilteredCities([]);
    }
    
    // Effacer le code postal si la ville est modifiée
    formikStep1.setFieldValue('adresse.codePostal', '');
  };
  
  // Sélectionner une ville dans la liste de suggestions
  const handleCitySelect = (city) => {
    formikStep1.setFieldValue('adresse.ville', city);
    formikStep1.setFieldValue('customCity', false);
    formikStep1.setFieldValue('adresse.codePostal', moroccanCitiesWithPostalCodes[city] || '');
    setFilteredCities([]);
  };
  
  // Initialisation du formulaire Step 2 (conditionnements)
  const formikStep2 = useFormik({
    initialValues: {
      acceptedPackagingTypes: acceptedPackagingTypes
    },
    validationSchema: validationSchemaStep2,
    onSubmit: () => {
      setCurrentStep(3);
    }
  });
  
  // Initialisation du formulaire Step 3 (informations personnelles)
  const formikStep3 = useFormik({
    initialValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
      passwordConfirm: '',
      acceptTerms: false
    },
    validationSchema: validationSchemaStep3,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        
        // Construire l'objet pour l'inscription
        const userData = {
          nom: values.nom,
          prenom: values.prenom,
          email: values.email,
          telephone: values.telephone,
          password: values.password,
          role: selectedRole,
          acceptTerms: values.acceptTerms
        };
        
        // Ajouter les informations spécifiques aux transporteurs
        if (selectedRole === 'transporteur') {
          userData.businessType = formikStep1.values.businessType;
          
          if (formikStep1.values.businessType === 'societe') {
            userData.societe = formikStep1.values.societe;
          }
          
          userData.adresse = formikStep1.values.adresse;
          userData.acceptedPackagingTypes = formikStep2.values.acceptedPackagingTypes;
          
          // Ajouter l'image du véhicule si disponible
          if (vehicleImage) {
            // Dans une application réelle, nous utiliserions FormData pour envoyer l'image
            // Exemple: const formData = new FormData(); formData.append('vehicleImage', vehicleImage);
            // Puis envoi séparé avec apiClient.post('/users/vehicle-image', formData, { headers: {'Content-Type': 'multipart/form-data'} });
            
            userData.hasVehicleImage = true; // Juste pour indiquer que l'utilisateur a fourni une image
          }
        }
        
        await register(userData);
        toast.success('Inscription réussie ! Bienvenue sur Pro-Trans');
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.message || 'Échec de l\'inscription');
        console.error('Erreur d\'inscription:', error);
      } finally {
        setIsLoading(false);
      }
    }
  });
  
  // Gérer le changement de rôle
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === 'client') {
      // Si c'est un client, sauter à l'étape 3 (coordonnées personnelles)
      setCurrentStep(3);
    } else {
      // Si c'est un transporteur, commencer par l'étape 1 (informations société)
      setCurrentStep(1);
    }
  };
  
  // Gérer le changement de type d'entreprise
  const handleBusinessTypeChange = (type) => {
    setBusinessType(type);
    formikStep1.setFieldValue('businessType', type);
  };
  
  // Gérer le changement des types de conditionnements
  const handlePackagingTypeChange = (type) => {
    const currentTypes = [...formikStep2.values.acceptedPackagingTypes];
    const index = currentTypes.indexOf(type);
    
    if (index === -1) {
      currentTypes.push(type);
    } else {
      currentTypes.splice(index, 1);
    }
    
    setAcceptedPackagingTypes(currentTypes);
    formikStep2.setFieldValue('acceptedPackagingTypes', currentTypes);
  };
  
  // Gérer le téléchargement d'image de véhicule
  const handleVehicleImageChange = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      // Vérifier le type de fichier
      if (!file.type.match('image.*')) {
        toast.error('Veuillez sélectionner une image (JPG, PNG, etc.)');
        return;
      }
      
      setVehicleImage(file);
      
      // Créer une URL pour la prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setVehicleImagePreview(previewUrl);
    }
  };
  
  // Supprimer l'image de véhicule
  const removeVehicleImage = () => {
    if (vehicleImagePreview) {
      URL.revokeObjectURL(vehicleImagePreview);
    }
    setVehicleImage(null);
    setVehicleImagePreview(null);
  };
  
  // Passer à l'étape précédente
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Rendu du formulaire pour le choix du rôle
  const renderRoleSelection = () => (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Je m'inscris en tant que</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedRole === 'client'
              ? 'border-teal-500 bg-teal-50 text-teal-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleRoleChange('client')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="role"
              id="role-client"
              value="client"
              checked={selectedRole === 'client'}
              onChange={() => handleRoleChange('client')}
              className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
            />
            <label 
              htmlFor="role-client" 
              className="ml-3 block font-medium cursor-pointer"
            >
              Client
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500 ml-7">
            Je souhaite faire transporter des marchandises
          </p>
        </div>
        
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedRole === 'transporteur'
              ? 'border-teal-500 bg-teal-50 text-teal-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleRoleChange('transporteur')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="role"
              id="role-transporteur"
              value="transporteur"
              checked={selectedRole === 'transporteur'}
              onChange={() => handleRoleChange('transporteur')}
              className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
            />
            <label 
              htmlFor="role-transporteur" 
              className="ml-3 block font-medium cursor-pointer"
            >
              Transporteur
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500 ml-7">
            Je propose des services de transport
          </p>
        </div>
      </div>
      
      {selectedRole === 'client' ? (
        <Button
          type="button"
          variant="primary"
          fullWidth
          onClick={() => setCurrentStep(3)}
        >
          Continuer
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          fullWidth
          onClick={() => setCurrentStep(1)}
        >
          Continuer
        </Button>
      )}
    </div>
  );
  
  // Rendu du formulaire pour l'étape 1 (informations société)
  const renderStep1 = () => (
    <form className="mt-8 space-y-6" onSubmit={formikStep1.handleSubmit}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">1. Données sur la société</h3>
          <div className="text-sm text-gray-500">Étape 1/3</div>
        </div>
        
        <div className="mt-6 mb-8">
          <h4 className="font-medium text-gray-700 mb-4">Type d'entreprise</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`border rounded-lg cursor-pointer transition-colors relative ${
                formikStep1.values.businessType === 'societe'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleBusinessTypeChange('societe')}
            >
              <div className="absolute top-3 left-3">
                <input
                  type="radio"
                  name="businessType"
                  id="type-societe"
                  value="societe"
                  checked={formikStep1.values.businessType === 'societe'}
                  onChange={() => handleBusinessTypeChange('societe')}
                  className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
              </div>
              <div className="p-4 pt-10 flex items-center justify-center h-24">
                <label 
                  htmlFor="type-societe" 
                  className="font-medium text-center cursor-pointer"
                >
                  Société de transport
                </label>
              </div>
            </div>
            
            <div
              className={`border rounded-lg cursor-pointer transition-colors relative ${
                formikStep1.values.businessType === 'autoEntrepreneur'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleBusinessTypeChange('autoEntrepreneur')}
            >
              <div className="absolute top-3 left-3">
                <input
                  type="radio"
                  name="businessType"
                  id="type-auto"
                  value="autoEntrepreneur"
                  checked={formikStep1.values.businessType === 'autoEntrepreneur'}
                  onChange={() => handleBusinessTypeChange('autoEntrepreneur')}
                  className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
              </div>
              <div className="p-4 pt-10 flex items-center justify-center h-24">
                <label 
                  htmlFor="type-auto" 
                  className="font-medium text-center cursor-pointer"
                >
                  Auto-entrepreneur
                </label>
              </div>
            </div>
            
            <div
              className={`border rounded-lg cursor-pointer transition-colors relative ${
                formikStep1.values.businessType === 'transporteurPrive'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleBusinessTypeChange('transporteurPrive')}
            >
              <div className="absolute top-3 left-3">
                <input
                  type="radio"
                  name="businessType"
                  id="type-prive"
                  value="transporteurPrive"
                  checked={formikStep1.values.businessType === 'transporteurPrive'}
                  onChange={() => handleBusinessTypeChange('transporteurPrive')}
                  className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
              </div>
              <div className="p-4 pt-10 flex items-center justify-center h-24">
                <label 
                  htmlFor="type-prive" 
                  className="font-medium text-center cursor-pointer"
                >
                  Transporteur privé
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {formikStep1.values.businessType === 'societe' && (
          <div className="mb-6">
            <Input
              id="societe"
              name="societe"
              type="text"
              label="Nom de l'entreprise"
              placeholder="Nom de votre entreprise"
              value={formikStep1.values.societe}
              onChange={formikStep1.handleChange}
              onBlur={formikStep1.handleBlur}
              error={formikStep1.touched.societe && formikStep1.errors.societe}
              touched={formikStep1.touched.societe}
              required
              icon={<BuildingOfficeIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-4">Adresse professionnelle</h4>
          
          <div className="space-y-4">
            <Input
              id="adresse.rue"
              name="adresse.rue"
              type="text"
              label="Adresse"
              placeholder="Numéro et nom de rue"
              value={formikStep1.values.adresse.rue}
              onChange={formikStep1.handleChange}
              onBlur={formikStep1.handleBlur}
              error={formikStep1.touched.adresse?.rue && formikStep1.errors.adresse?.rue}
              touched={formikStep1.touched.adresse?.rue}
              required
              icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adresse.ville" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="adresse.ville"
                    name="adresse.ville"
                    value={formikStep1.values.adresse.ville}
                    onChange={handleCityInputChange}
                    onBlur={() => {
                      formikStep1.handleBlur({ target: { name: 'adresse.ville' } });
                      // Fermer la liste après un court délai pour permettre la sélection
                      setTimeout(() => setFilteredCities([]), 200);
                    }}
                    placeholder="Saisissez votre ville"
                    className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                      formikStep1.touched.adresse?.ville && formikStep1.errors.adresse?.ville
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                    }`}
                    required
                  />
                  
                  {/* Liste des suggestions de villes */}
                  {filteredCities.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                      {filteredCities.map((city) => (
                        <li
                          key={city}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-teal-50 text-gray-900"
                          onClick={() => handleCitySelect(city)}
                        >
                          {city}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {formikStep1.touched.adresse?.ville && formikStep1.errors.adresse?.ville && (
                  <p className="mt-1 text-sm text-red-600">{formikStep1.errors.adresse.ville}</p>
                )}
              </div>
              
              <Input
                id="adresse.codePostal"
                name="adresse.codePostal"
                type="text"
                label={`Code postal ${formikStep1.values.customCity ? '' : '*'}`}
                placeholder="Ex: 20000"
                value={formikStep1.values.adresse.codePostal}
                onChange={formikStep1.handleChange}
                onBlur={formikStep1.handleBlur}
                error={formikStep1.touched.adresse?.codePostal && formikStep1.errors.adresse?.codePostal}
                touched={formikStep1.touched.adresse?.codePostal}
                required={!formikStep1.values.customCity}
              />
            </div>
            
            <Input
              id="adresse.pays"
              name="adresse.pays"
              type="text"
              label="Pays"
              value={formikStep1.values.adresse.pays}
              onChange={formikStep1.handleChange}
              onBlur={formikStep1.handleBlur}
              error={formikStep1.touched.adresse?.pays && formikStep1.errors.adresse?.pays}
              touched={formikStep1.touched.adresse?.pays}
              disabled
              required
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" variant="primary">
          Suivant
        </Button>
      </div>
    </form>
  );
  
  // Rendu du formulaire pour l'étape 2 (conditionnements et véhicule)
  const renderStep2 = () => (
    <form className="mt-8 space-y-6" onSubmit={formikStep2.handleSubmit}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">2. Types de conditionnements et véhicule</h3>
          <div className="text-sm text-gray-500">Étape 2/3</div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-4">
            Sélectionnez les types de conditionnements que vous acceptez de transporter
          </p>
          
          <div className="space-y-2">
            {packagingTypes.map((type) => (
              <div key={type.id} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={type.id}
                    name="acceptedPackagingTypes"
                    type="checkbox"
                    checked={formikStep2.values.acceptedPackagingTypes.includes(type.id)}
                    onChange={() => handlePackagingTypeChange(type.id)}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={type.id} className="font-medium text-gray-700 cursor-pointer">
                    {type.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
          
          {formikStep2.touched.acceptedPackagingTypes && formikStep2.errors.acceptedPackagingTypes && (
            <p className="mt-2 text-sm text-red-600">{formikStep2.errors.acceptedPackagingTypes}</p>
          )}
        </div>
        
        {/* Section d'upload d'image de véhicule */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">Photo de votre véhicule</h4>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Les transporteurs avec photo de véhicule reçoivent <strong>40% plus de demandes</strong> des clients. Bien que facultative, cette étape est fortement recommandée.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            {vehicleImagePreview ? (
              <div className="space-y-4">
                <div className="mt-2 relative rounded-lg overflow-hidden border border-gray-200 h-48">
                  <img
                    src={vehicleImagePreview}
                    alt="Aperçu du véhicule"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeVehicleImage}
                  >
                    Supprimer l'image
                  </Button>
                  
                  <label className="cursor-pointer">
                    <span className="inline-block">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                      >
                        Changer l'image
                      </Button>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleVehicleImageChange}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <label className="flex flex-col items-center px-4 py-6 bg-white text-gray-500 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="mt-2 text-sm font-medium">Ajouter une photo de votre véhicule</span>
                  <span className="mt-1 text-xs text-gray-500">PNG, JPG jusqu'à 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleVehicleImageChange}
                  />
                </label>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Vous pourrez également ajouter ou modifier cette image plus tard dans votre profil.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handlePrevStep}>
          Précédent
        </Button>
        <Button type="submit" variant="primary">
          Suivant
        </Button>
      </div>
    </form>
  );
  
  // Rendu du formulaire pour l'étape 3 (informations personnelles)
  const renderStep3 = () => (
    <form className="mt-8 space-y-6" onSubmit={formikStep3.handleSubmit}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">3. Vos coordonnées</h3>
          {selectedRole === 'transporteur' && (
            <div className="text-sm text-gray-500">Étape 3/3</div>
          )}
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="prenom"
              name="prenom"
              type="text"
              label="Prénom"
              placeholder="Votre prénom"
              value={formikStep3.values.prenom}
              onChange={formikStep3.handleChange}
              onBlur={formikStep3.handleBlur}
              error={formikStep3.touched.prenom && formikStep3.errors.prenom}
              touched={formikStep3.touched.prenom}
              required
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            />
            
            <Input
              id="nom"
              name="nom"
              type="text"
              label="Nom"
              placeholder="Votre nom"
              value={formikStep3.values.nom}
              onChange={formikStep3.handleChange}
              onBlur={formikStep3.handleBlur}
              error={formikStep3.touched.nom && formikStep3.errors.nom}
              touched={formikStep3.touched.nom}
              required
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>
          
          <Input
            id="email"
            name="email"
            type="email"
            label="Adresse email"
            placeholder="Votre adresse email"
            value={formikStep3.values.email}
            onChange={formikStep3.handleChange}
            onBlur={formikStep3.handleBlur}
            error={formikStep3.touched.email && formikStep3.errors.email}
            touched={formikStep3.touched.email}
            required
            icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
          />
          
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            label="Téléphone"
            placeholder="Votre numéro de téléphone"
            value={formikStep3.values.telephone}
            onChange={formikStep3.handleChange}
            onBlur={formikStep3.handleBlur}
            error={formikStep3.touched.telephone && formikStep3.errors.telephone}
            touched={formikStep3.touched.telephone}
            required
            icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
            helperText="Format: 0612345678 ou +212612345678"
          />
          
          <Input
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            placeholder="Votre mot de passe"
            value={formikStep3.values.password}
            onChange={formikStep3.handleChange}
            onBlur={formikStep3.handleBlur}
            error={formikStep3.touched.password && formikStep3.errors.password}
            touched={formikStep3.touched.password}
            required
            icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
            helperText="Min. 8 caractères avec au moins 1 majuscule, 1 minuscule et 1 chiffre"
          />
          
          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            label="Confirmer le mot de passe"
            placeholder="Confirmez votre mot de passe"
            value={formikStep3.values.passwordConfirm}
            onChange={formikStep3.handleChange}
            onBlur={formikStep3.handleBlur}
            error={formikStep3.touched.passwordConfirm && formikStep3.errors.passwordConfirm}
            touched={formikStep3.touched.passwordConfirm}
            required
            icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          />
          
          {/* Conditions générales */}
          <div className="flex items-center mt-4">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formikStep3.values.acceptTerms}
              onChange={formikStep3.handleChange}
              onBlur={formikStep3.handleBlur}
              className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
              J'accepte les{' '}
              <Link to="/cgu" className="font-medium text-teal-600 hover:text-teal-500">
                conditions générales d'utilisation
              </Link>{' '}
              et la{' '}
              <Link to="/politique-confidentialite" className="font-medium text-teal-600 hover:text-teal-500">
                politique de confidentialité
              </Link>
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {formikStep3.touched.acceptTerms && formikStep3.errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">{formikStep3.errors.acceptTerms}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        {selectedRole === 'transporteur' && (
          <Button type="button" variant="outline" onClick={handlePrevStep}>
            Précédent
          </Button>
        )}
        <div className={selectedRole === 'transporteur' ? '' : 'w-full'}>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Créer mon compte
          </Button>
        </div>
      </div>
    </form>
  );
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-teal-600 text-white p-6 rounded-t-lg shadow-md">
        <h2 className="text-center text-3xl font-extrabold">
          Créer votre compte
        </h2>
        <p className="mt-2 text-center text-teal-100">
          Ou{' '}
          <Link to="/login" className="font-medium text-white hover:text-teal-200 underline">
            connectez-vous à votre compte existant
          </Link>
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-b-lg shadow-md">
        {currentStep === 0 && renderRoleSelection()}
        {currentStep === 1 && selectedRole === 'transporteur' && renderStep1()}
        {currentStep === 2 && selectedRole === 'transporteur' && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default RegisterPage;