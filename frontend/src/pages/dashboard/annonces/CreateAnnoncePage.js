import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useDropzone } from 'react-dropzone';

import annonceService from '../../../services/annonceService';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

// List of Moroccan cities for autocomplete
const moroccanCities = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", 
  "Kénitra", "Tétouan", "Salé", "Nador", "Mohammédia", "El Jadida", "Béni Mellal", 
  "Taza", "Khémisset", "Taourirt", "Settat", "Berkane", "Khouribga", "Ouarzazate", 
  "Larache", "Guelmim", "Khénifra", "Safi", "Essaouira", "Taroudant", "Tiznit", 
  "Asilah", "Chefchaouen", "Ifrane", "Azrou", "Midelt", "Errachidia", "Zagora", 
  "Tinghir", "Figuig", "Al Hoceima", "Dakhla", "Laâyoune", "Tata", "Tan-Tan", 
  "Azemmour", "Martil", "Fnideq", "M'diq", "Temara", "Skhirat", "Berrechid", 
  "Benslimane", "Youssoufia", "Azilal", "Demnat", "Sefrou", "Taounate", "Ouazzane",
  "Chichaoua", "Imzouren", "Beni Ansar", "Al Aroui", "Saidia", "Ahfir", "Jerada", 
  "Guercif", "Bouarfa", "Ifni", "Imilchil", "Merzouga", "Tafraoute", "Amizmiz", 
  "Imlil", "Asni", "Oualidia", "Moulay Bousselham", "Aït Ben Haddou", "Erfoud", 
  "Rissani", "Tamegroute", "Mirleft", "Sidi Ifni", "Tarfaya", "Smara", "Boujdour", 
  "Guerguerat", "Assa", "Zag", "Akka", "Akhfenir", "Tafraout", "Bab Taza", "Debdou", 
  "Taourirt", "Tahla", "Aïn Leuh", "Zaouiat Cheikh", "El Hajeb", "Mrirt", "Ain Taoujdate", 
  "Souk El Arbaa", "Had Kourt", "Taza", "Oued Amlil", "Missour", "Outat El Haj", 
  "Boulemane", "Imouzzer Kandar", "El Menzel", "Ribat El Kheir", "Ain Cheggag", 
  "Bhalil", "Moulay Yacoub", "Beni Mellal", "El Ksiba", "Kasba Tadla", "Fquih Ben Salah", 
  "Souk Sebt Oulad Nemma", "Kasbat Oulad Ayad", "Boujniba", "Hattane", "Oued Zem", 
  "Aguelmous", "Tiflet", "Sidi Allal El Bahraoui", "Sidi Kacem", "Mechra Bel Ksiri", 
  "Sidi Slimane", "Sidi Yahia El Gharb", "El Ksar El Kebir", "Assilah", "Ksar El Kebir", 
  "Moulay Idriss Zerhoun", "Rommani", "Timahdite", "Toulal", "Zemamra", "Sidi Bennour", 
  "Had Soualem", "Bouskoura", "Deroua", "Sidi Rahal"
];

// City Autocomplete Component
const CityAutoComplete = ({ name, label, value, onChange, error, touched, required, placeholder }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Filter cities that match the input
    if (value.trim()) {
      const filtered = moroccanCities.filter(
        city => city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onChange({ target: { name, value: suggestion } });
    setShowSuggestions(false);
  };

  return (
    <div className="form-group relative">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        className={`form-control ${touched && error ? 'border-red-300' : ''}`}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={() => {
          // Close suggestions after a short delay to allow clicks
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        onFocus={() => {
          if (inputValue.trim()) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
      />
      {touched && error && (
        <p className="form-error">{error}</p>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CreateAnnoncePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  // Mappage des types de transport du formulaire vers les valeurs acceptées par l'API
  const mapTypeTransport = (displayType) => {
    // Table de correspondance entre l'affichage et les valeurs API
    const typeMapping = {
      'Déménagements': 'demenagement',
      'Meuble, appareil ménager...': 'meuble',
      'Caisses/Cartons': 'carton',
      'Bagages': 'bagage',
      'Marchandises': 'marchandise',
      'Colis': 'colis',
      'Palettes': 'palette',
      'Motos et vélos': 'moto_velo',
      'Pièces automobile': 'piece_auto',
      'Marchandise fragile': 'fragile',
      'Voitures': 'voiture',
      'Conteneur maritime': 'conteneur',
      'Machine et équipement': 'machine',
      'Matériels sans conditionnement (vrac)': 'vrac',
      'Matériel hors gabarit (piscine, citerne...)': 'hors_gabarit',
      'Autres véhicules': 'autre_vehicule',
      'Bateaux': 'bateau',
      'Autres livraisons': 'autre'
    };
    
    return typeMapping[displayType] || displayType.toLowerCase().replace(/\s+/g, '_');
  };

  // Configuration de la dropzone pour les photos
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 5242880, // 5MB
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      // Ajouter les nouveaux fichiers à la liste
      setPhotos([...photos, ...acceptedFiles]);
      
      // Créer des URLs pour la prévisualisation
      const newPreviews = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      setPreviewPhotos([...previewPhotos, ...newPreviews]);
    }
  });

  // Supprimer une photo
  const removePhoto = (index) => {
    const newPhotos = [...photos];
    const newPreviews = [...previewPhotos];
    
    // Révoquer l'URL de prévisualisation pour éviter les fuites de mémoire
    URL.revokeObjectURL(previewPhotos[index].preview);
    
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setPhotos(newPhotos);
    setPreviewPhotos(newPreviews);
  };

  // Schéma de validation avec Yup - CORRIGÉ COMPLÈTEMENT
  const validationSchema = Yup.object({
    titre: Yup.string()
      .required('Le titre est obligatoire')
      .max(100, 'Maximum 100 caractères'),
    description: Yup.string()
      .max(1000, 'Maximum 1000 caractères'), // Suppression de required() et min()
    typeTransport: Yup.string()
      .required('Le type de transport est obligatoire'),
  villeDepart: Yup.string()
    .required('La ville de départ est obligatoire'),
  villeArrivee: Yup.string()
    .required('La ville d\'arrivée est obligatoire'),
  dateDepart: Yup.date()
    .required('La date de départ est obligatoire')
    .min(new Date(), 'La date doit être dans le futur'),
  flexibiliteDate: Yup.boolean(),
  poids: Yup.number()
    .nullable()
    .transform((value, originalValue) => 
      originalValue === '' || isNaN(originalValue) ? null : value)
    .positive('Le poids doit être positif'),
  unite_poids: Yup.string()
    .oneOf(['kg', 'tonnes'], 'Unité de poids invalide'),
  volume: Yup.number()
    .nullable()
    .transform((value, originalValue) => 
      originalValue === '' || isNaN(originalValue) ? null : value)
    .positive('Le volume doit être positif'),
  'dimensions.longueur': Yup.number()
    .when('typeTransport', {
      is: (val) => ['Colis', 'Palettes', 'Caisses/Cartons', 'Marchandise fragile'].includes(val),
      then: () => Yup.number().nullable().transform((value, originalValue) => 
        originalValue === '' || isNaN(originalValue) ? null : value).positive('La longueur doit être positive')
    }),
  'dimensions.largeur': Yup.number()
    .when('typeTransport', {
      is: (val) => ['Colis', 'Palettes', 'Caisses/Cartons', 'Marchandise fragile'].includes(val),
      then: () => Yup.number().nullable().transform((value, originalValue) => 
        originalValue === '' || isNaN(originalValue) ? null : value).positive('La largeur doit être positive')
    }),
  'dimensions.hauteur': Yup.number()
    .when('typeTransport', {
      is: (val) => ['Colis', 'Palettes', 'Caisses/Cartons', 'Marchandise fragile'].includes(val),
      then: () => Yup.number().nullable().transform((value, originalValue) => 
        originalValue === '' || isNaN(originalValue) ? null : value).positive('La hauteur doit être positive')
    }),
  'dimensions.unite': Yup.string()
    .oneOf(['cm', 'm'], 'Unité de dimension invalide'),
  nombreColis: Yup.number()
    .when('typeTransport', {
      is: 'Colis',
      then: () => Yup.number().nullable().transform((value, originalValue) => 
        originalValue === '' || isNaN(originalValue) ? null : value).positive().integer()
    }),
  budget: Yup.number()
    .nullable()
    .transform((value, originalValue) => 
      originalValue === '' || isNaN(originalValue) ? null : value)
    .positive('Le budget doit être positif'),
  isUrgent: Yup.boolean(),
  'optionsTransport.chargement': Yup.boolean(),
  'optionsTransport.dechargement': Yup.boolean(),
  'optionsTransport.montage': Yup.boolean(),
  'optionsTransport.demontage': Yup.boolean(),
  'optionsTransport.emballage': Yup.boolean(),
  commentairesTransporteur: Yup.string()
});

  // Initialisation du formulaire avec Formik
  const formik = useFormik({
    initialValues: {
      titre: '',
      description: '',
      typeTransport: '',
      villeDepart: '',
      villeArrivee: '',
      dateDepart: new Date(Date.now() + 86400000), // Demain
      dateArrivee: null,
      flexibiliteDate: false,
      poids: '',
      unite_poids: 'kg',
      volume: '',
      dimensions: {
        longueur: '',
        largeur: '',
        hauteur: '',
        unite: 'cm'
      },
      nombreColis: 1,
      contenuColis: [],
      budget: '',
      optionsTransport: {
        chargement: false,
        dechargement: false,
        montage: false,
        demontage: false,
        emballage: false
      },
      commentairesTransporteur: '',
      isUrgent: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Si nous ne sommes pas à l'étape finale, ne pas soumettre
        if (step !== 4) {
          console.log("Tentative de soumission à l'étape", step, "- ignorée");
          return;
        }
        
        setIsSubmitting(true);
        console.log("Soumission du formulaire à l'étape 4");
        
        // Préparation des données pour le format attendu par l'API
        const annonceData = {
          titre: values.titre,
          description: values.description,
          typeTransport: mapTypeTransport(values.typeTransport),
          villeDepart: values.villeDepart,
          villeArrivee: values.villeArrivee,
          dateDepart: values.dateDepart instanceof Date ? values.dateDepart.toISOString() : values.dateDepart,
          dateArrivee: values.dateArrivee instanceof Date ? values.dateArrivee.toISOString() : undefined,
          flexibiliteDate: Boolean(values.flexibiliteDate),
          poids: values.poids ? Number(values.poids) : undefined,
          unite_poids: values.unite_poids || 'kg',
          volume: values.volume ? Number(values.volume) : undefined,
          statut: 'disponible',
          isUrgent: Boolean(values.isUrgent),
          budget: values.budget ? Number(values.budget) : undefined
        };

        // Ajouter les dimensions si pertinent
        if (['Colis', 'Palettes', 'Caisses/Cartons', 'Marchandise fragile'].includes(values.typeTransport)) {
          const mappedType = mapTypeTransport(values.typeTransport);
          if (['colis', 'palette', 'carton', 'fragile'].includes(mappedType)) {
            annonceData.dimensions = {
              longueur: values.dimensions.longueur ? Number(values.dimensions.longueur) : undefined,
              largeur: values.dimensions.largeur ? Number(values.dimensions.largeur) : undefined,
              hauteur: values.dimensions.hauteur ? Number(values.dimensions.hauteur) : undefined,
              unite: values.dimensions.unite
            };
          }
        }

        // Ajouter le nombre de colis si c'est un colis
        if (values.typeTransport === 'Colis') {
          annonceData.nombreColis = Number(values.nombreColis) || 1;
        }

        // Ajouter les options de transport
        annonceData.optionsTransport = {
          chargement: values.optionsTransport.chargement,
          dechargement: values.optionsTransport.dechargement,
          montage: values.optionsTransport.montage,
          demontage: values.optionsTransport.demontage,
          emballage: values.optionsTransport.emballage
        };

        // Ajouter les commentaires si présents
        if (values.commentairesTransporteur) {
          annonceData.commentairesTransporteur = values.commentairesTransporteur;
        }
        
        // Créer l'annonce
        console.log('Données envoyées à l\'API:', annonceData);
        const responseData = await annonceService.createAnnonce(annonceData);
        console.log("Réponse de la création d'annonce:", responseData);
        const annonceId = responseData.data._id;
        
        // Si des photos ont été ajoutées, les uploader
        if (photos.length > 0) {
          console.log(`Chargement de ${photos.length} photos pour l'annonce ${annonceId}`);
          const formData = new FormData();
          photos.forEach(photo => {
            formData.append('photos', photo);
          });
          
          await annonceService.uploadImages(annonceId, formData);
        }
        
        toast.success('Annonce créée avec succès');
        navigate(`/dashboard/annonces/${annonceId}`);
      } catch (error) {
        console.error('Erreur détaillée:', error);
        
        // Amélioration de l'affichage des erreurs de validation
        let errorMessage = 'Erreur lors de la création de l\'annonce';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        // Affichage des erreurs spécifiques de validation si disponibles
        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          errorMessage = `Erreur de validation: ${error.errors.join(', ')}`;
          console.error('Erreurs de validation spécifiques:', error.errors);
          
          // Afficher chaque erreur de validation séparément
          error.errors.forEach(err => {
            toast.error(err);
          });
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // Récupérer les paramètres d'URL à l'initialisation
  useEffect(() => {
    // Récupérer les paramètres d'URL
    const queryParams = new URLSearchParams(location.search);
    
    // Préremplir les champs du formulaire si les paramètres sont présents
    const villeDepart = queryParams.get('villeDepart');
    const villeArrivee = queryParams.get('villeArrivee');
    const typeTransport = queryParams.get('typeTransport');
    
    if (villeDepart) {
      formik.setFieldValue('villeDepart', villeDepart);
    }
    
    if (villeArrivee) {
      formik.setFieldValue('villeArrivee', villeArrivee);
    }
    
    if (typeTransport) {
      formik.setFieldValue('typeTransport', typeTransport);
    }
  }, [location.search]); // Dépendance à location.search pour réagir aux changements d'URL

  // Validation spécifique à l'étape en cours - MODIFIÉ pour simplifier la validation
  const validateStep = () => {
    let errors = {};
    
    if (step === 1) {
      if (!formik.values.titre) errors.titre = 'Le titre est obligatoire';
      if (!formik.values.typeTransport) errors.typeTransport = 'Le type de transport est obligatoire';
    } else if (step === 2) {
      if (!formik.values.villeDepart) errors.villeDepart = 'La ville de départ est obligatoire';
      if (!formik.values.villeArrivee) errors.villeArrivee = 'La ville d\'arrivée est obligatoire';
    } else if (step === 3) {
      // Validation de base pour l'étape 3 
      if (!formik.values.dateDepart) errors.dateDepart = 'La date de départ est obligatoire';
      
      // Pour le débogage
      console.log("Validation de l'étape 3 - Erreurs:", Object.keys(errors).length > 0 ? errors : "Aucune erreur");
    }
    
    return Object.keys(errors).length === 0;
  };

  // Passer à l'étape suivante
  const nextStep = () => {
    console.log("Tentative de passage à l'étape suivante, actuellement à l'étape", step);
    if (validateStep()) {
      console.log("Validation réussie, passage à l'étape", step + 1);
      setStep(step + 1);
    } else {
      console.warn("Validation échouée, reste à l'étape", step);
      toast.error('Veuillez remplir tous les champs obligatoires');
    }
  };

  // Revenir à l'étape précédente
  const prevStep = () => {
    console.log("Retour à l'étape", step - 1);
    setStep(step - 1);
  };

  // Gérer le changement de date de départ
  const handleDateDepartChange = (date) => {
    formik.setFieldValue('dateDepart', date);
  };

  // Gérer le changement de date d'arrivée
  const handleDateArriveeChange = (date) => {
    formik.setFieldValue('dateArrivee', date);
  };

  // Nettoyer les URLs de prévisualisation avant le démontage du composant
  React.useEffect(() => {
    return () => {
      previewPhotos.forEach(photo => URL.revokeObjectURL(photo.preview));
    };
  }, [previewPhotos]);

  // Handler de soumission manuelle
  const handleManualSubmit = (e) => {
    console.log("handleManualSubmit appelé à l'étape", step);
    if (step !== 4) {
      e.preventDefault();
      console.log("Soumission empêchée car pas à l'étape 4");
      return false;
    }
    e.preventDefault();
    formik.handleSubmit();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Publier une annonce</h1>
        <p className="mt-2 text-gray-600">
          Décrivez votre besoin de transport en détail pour recevoir les meilleurs devis.
        </p>
      </div>

      {/* Etapes de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex-1 ${step >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className="flex items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 1 ? 'border-teal-600 bg-teal-100' : 'border-gray-300'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Informations générales</span>
            </div>
          </div>
          <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
          <div className={`flex-1 ${step >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className="flex items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 2 ? 'border-teal-600 bg-teal-100' : 'border-gray-300'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Villes</span>
            </div>
          </div>
          <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
          <div className={`flex-1 ${step >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className="flex items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 3 ? 'border-teal-600 bg-teal-100' : 'border-gray-300'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Détails et options</span>
            </div>
          </div>
          <div className={`h-1 flex-1 mx-2 ${step >= 4 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
          <div className={`flex-1 ${step >= 4 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className="flex items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 4 ? 'border-teal-600 bg-teal-100' : 'border-gray-300'}`}>
                4
              </div>
              <span className="ml-2 text-sm font-medium">Photos</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODIFICATION: contrôle plus strict de la soumission du formulaire */}
      <form 
        onSubmit={(e) => {
          // Ne soumettre que si nous sommes à l'étape 4
          if (step !== 4) {
            e.preventDefault();
            console.log("Soumission empêchée à l'étape", step);
            return false;
          }
          console.log("Formulaire soumis à l'étape 4");
          handleManualSubmit(e);
        }} 
        className="card shadow-md rounded-lg"
      >
        <div className="card-body">
          {/* Etape 1: Informations générales */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
              
              <div className="space-y-4">
                <Input
                  id="titre"
                  name="titre"
                  label="Titre de l'annonce"
                  placeholder="Ex: Transport d'un canapé de Casablanca à Rabat"
                  value={formik.values.titre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.titre && formik.errors.titre}
                  touched={formik.touched.titre}
                  required
                />
                
                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description détaillée
                    {/* La description n'est plus obligatoire, donc on a supprimé l'astérisque */}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="5"
                    placeholder="Décrivez en détail ce que vous souhaitez transporter, avec toutes les informations utiles pour le transporteur."
                    className={`form-control ${formik.touched.description && formik.errors.description ? 'border-red-300' : ''}`}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  ></textarea>
                  {formik.touched.description && formik.errors.description && (
                    <p className="form-error">{formik.errors.description}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="typeTransport" className="form-label">
                    Type de transport
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    id="typeTransport"
                    name="typeTransport"
                    className={`form-control ${formik.touched.typeTransport && formik.errors.typeTransport ? 'border-red-300' : ''}`}
                    value={formik.values.typeTransport}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Sélectionnez un type</option>
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
                    <option value="Conteneur maritime">Conteneur maritime</option>
                    <option value="Machine et équipement">Machine et équipement</option>
                    <option value="Matériels sans conditionnement (vrac)">Matériels sans conditionnement (vrac)</option>
                    <option value="Matériel hors gabarit (piscine, citerne...)">Matériel hors gabarit (piscine, citerne...)</option>
                    <option value="Autres véhicules">Autres véhicules</option>
                    <option value="Bateaux">Bateaux</option>
                    <option value="Autres livraisons">Autres livraisons</option>
                  </select>
                  {formik.touched.typeTransport && formik.errors.typeTransport && (
                    <p className="form-error">{formik.errors.typeTransport}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Etape 2: Villes */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Villes de départ et d'arrivée</h2>
              
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CityAutoComplete
                    name="villeDepart"
                    label="Ville de départ"
                    placeholder="Entrez la ville de départ"
                    value={formik.values.villeDepart}
                    onChange={(e) => formik.setFieldValue('villeDepart', e.target.value)}
                    error={formik.errors.villeDepart}
                    touched={formik.touched.villeDepart}
                    required
                  />
                  
                  <CityAutoComplete
                    name="villeArrivee"
                    label="Ville d'arrivée"
                    placeholder="Entrez la ville d'arrivée"
                    value={formik.values.villeArrivee}
                    onChange={(e) => formik.setFieldValue('villeArrivee', e.target.value)}
                    error={formik.errors.villeArrivee}
                    touched={formik.touched.villeArrivee}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etape 3: Détails et options */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Détails du transport</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">
                    Date de départ souhaitée
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <DatePicker
                    selected={formik.values.dateDepart}
                    onChange={handleDateDepartChange}
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    placeholderText="Sélectionnez une date"
                  />
                  {formik.touched.dateDepart && formik.errors.dateDepart && (
                    <p className="form-error">{formik.errors.dateDepart}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Date d'arrivée souhaitée
                  </label>
                  <DatePicker
                    selected={formik.values.dateArrivee}
                    onChange={handleDateArriveeChange}
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    minDate={formik.values.dateDepart || new Date()}
                    placeholderText="Sélectionnez une date"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    id="flexibiliteDate"
                    name="flexibiliteDate"
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    checked={formik.values.flexibiliteDate}
                    onChange={formik.handleChange}
                  />
                  <label htmlFor="flexibiliteDate" className="ml-2 block text-sm text-gray-900">
                    Je suis flexible sur les dates (± 2 jours)
                  </label>
                </div>
              </div>
              
              <hr className="my-6" />
              
              <h3 className="text-lg font-medium mb-4">Caractéristiques de l'envoi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  id="poids"
                  name="poids"
                  type="number"
                  label="Poids"
                  placeholder="Ex: 20"
                  value={formik.values.poids}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.poids && formik.errors.poids}
                  touched={formik.touched.poids}
                />
                
                <div className="form-group">
                  <label htmlFor="unite_poids" className="form-label">
                    Unité de poids
                  </label>
                  <select
                    id="unite_poids"
                    name="unite_poids"
                    className="form-control"
                    value={formik.values.unite_poids}
                    onChange={formik.handleChange}
                  >
                    <option value="kg">Kilogrammes (kg)</option>
                    <option value="tonnes">Tonnes (t)</option>
                  </select>
                </div>
                
                <Input
                  id="volume"
                  name="volume"
                  type="number"
                  label="Volume (m³)"
                  placeholder="Ex: 1.5"
                  value={formik.values.volume}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.volume && formik.errors.volume}
                  touched={formik.touched.volume}
                />
              </div>
              
              {['Colis', 'Palettes', 'Caisses/Cartons', 'Marchandise fragile'].includes(formik.values.typeTransport) && (
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-2">Dimensions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      id="dimensions.longueur"
                      name="dimensions.longueur"
                      type="number"
                      label="Longueur"
                      placeholder="Ex: 100"
                      value={formik.values.dimensions.longueur}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.dimensions?.longueur && formik.errors.dimensions?.longueur}
                      touched={formik.touched.dimensions?.longueur}
                    />
                    
                    <Input
                      id="dimensions.largeur"
                      name="dimensions.largeur"
                      type="number"
                      label="Largeur"
                      placeholder="Ex: 80"
                      value={formik.values.dimensions.largeur}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.dimensions?.largeur && formik.errors.dimensions?.largeur}
                      touched={formik.touched.dimensions?.largeur}
                    />
                    
                    <Input
                      id="dimensions.hauteur"
                      name="dimensions.hauteur"
                      type="number"
                      label="Hauteur"
                      placeholder="Ex: 50"
                      value={formik.values.dimensions.hauteur}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.dimensions?.hauteur && formik.errors.dimensions?.hauteur}
                      touched={formik.touched.dimensions?.hauteur}
                    />
                    
                    <div className="form-group">
                      <label htmlFor="dimensions.unite" className="form-label">
                        Unité
                      </label>
                      <select
                        id="dimensions.unite"
                        name="dimensions.unite"
                        className="form-control"
                        value={formik.values.dimensions.unite}
                        onChange={formik.handleChange}
                      >
                        <option value="cm">Centimètres (cm)</option>
                        <option value="m">Mètres (m)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              {formik.values.typeTransport === 'Colis' && (
                <div className="mt-4">
                  <Input
                    id="nombreColis"
                    name="nombreColis"
                    type="number"
                    label="Nombre de colis"
                    placeholder="Ex: 3"
                    value={formik.values.nombreColis}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.nombreColis && formik.errors.nombreColis}
                    touched={formik.touched.nombreColis}
                  />
                </div>
              )}
              
              <div className="mt-4">
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  label="Budget estimé (DH)"
                  placeholder="Ex: 1500"
                  helperText="Facultatif. Indiquez votre budget pour recevoir des devis adaptés."
                  value={formik.values.budget}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.budget && formik.errors.budget}
                  touched={formik.touched.budget}
                />
              </div>
              
              <hr className="my-6" />
              
              <div className="mt-4">
                <button 
                  type="button"
                  className="text-teal-600 font-medium"
                  onClick={() => setShowOptions(!showOptions)}
                >
                  {showOptions ? '- Masquer les options supplémentaires' : '+ Afficher les options supplémentaires'}
                </button>
                
                {showOptions && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-3">Options supplémentaires</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="optionsTransport.chargement"
                          name="optionsTransport.chargement"
                          type="checkbox"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          checked={formik.values.optionsTransport.chargement}
                          onChange={formik.handleChange}
                        />
                        <label htmlFor="optionsTransport.chargement" className="ml-2 block text-sm text-gray-900">
                          Aide au chargement
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="optionsTransport.dechargement"
                          name="optionsTransport.dechargement"
                          type="checkbox"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          checked={formik.values.optionsTransport.dechargement}
                          onChange={formik.handleChange}
                        />
                        <label htmlFor="optionsTransport.dechargement" className="ml-2 block text-sm text-gray-900">
                          Aide au déchargement
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="optionsTransport.montage"
                          name="optionsTransport.montage"
                          type="checkbox"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          checked={formik.values.optionsTransport.montage}
                          onChange={formik.handleChange}
                        />
                        <label htmlFor="optionsTransport.montage" className="ml-2 block text-sm text-gray-900">
                          Montage des meubles
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="optionsTransport.demontage"
                          name="optionsTransport.demontage"
                          type="checkbox"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          checked={formik.values.optionsTransport.demontage}
                          onChange={formik.handleChange}
                        />
                        <label htmlFor="optionsTransport.demontage" className="ml-2 block text-sm text-gray-900">
                          Démontage des meubles
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="optionsTransport.emballage"
                          name="optionsTransport.emballage"
                          type="checkbox"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          checked={formik.values.optionsTransport.emballage}
                          onChange={formik.handleChange}
                        />
                        <label htmlFor="optionsTransport.emballage" className="ml-2 block text-sm text-gray-900">
                          Emballage des objets
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="isUrgent"
                          name="isUrgent"
                          type="checkbox"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          checked={formik.values.isUrgent}
                          onChange={formik.handleChange}
                        />
                        <label htmlFor="isUrgent" className="ml-2 block text-sm text-gray-900">
                          Transport urgent
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="form-group">
                        <label htmlFor="commentairesTransporteur" className="form-label">
                          Instructions pour le transporteur
                        </label>
                        <textarea
                          id="commentairesTransporteur"
                          name="commentairesTransporteur"
                          rows="3"
                          placeholder="Ex: Code immeuble, étage, présence d'ascenseur, accès difficile, etc."
                          className="form-control"
                          value={formik.values.commentairesTransporteur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Etape 4: Photos */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Photos</h2>
              <p className="text-gray-600 mb-4">
                Ajoutez des photos pour aider les transporteurs à mieux évaluer votre demande. (Max 5 photos, 5MB par photo)
              </p>
              
              <div {...getRootProps({ className: 'border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-teal-500' })}>
                <input {...getInputProps()} />
                <div className="space-y-1 text-center">
                  <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <p className="pl-1">Glissez-déposez des photos ici, ou cliquez pour sélectionner des photos</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG jusqu'à 5MB</p>
                </div>
              </div>
              
              {previewPhotos.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2">Photos sélectionnées</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {previewPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo.preview}
                          alt={`Photo ${index + 1}`}
                          className="h-32 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          onClick={() => removePhoto(index)}
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-8 bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Récapitulatif</h3>
                <p className="text-gray-600 mb-4">
                  Vérifiez les informations de votre annonce avant de la publier.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">Type de transport</h4>
                    <p>{formik.values.typeTransport || '-'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">Trajet</h4>
                    <p>{formik.values.villeDepart} → {formik.values.villeArrivee}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">Date de départ</h4>
                    <p>{formik.values.dateDepart ? formik.values.dateDepart.toLocaleDateString('fr-FR') : '-'}</p>
                  </div>
                  
                  {formik.values.budget && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700">Budget</h4>
                      <p>{formik.values.budget} DH</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation des étapes - MODIFICATION: ajout de type="button" explicite et preventDefault */}
          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <Button
                type="button" // Explicitement de type button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault(); // Empêche toute soumission accidentelle
                  prevStep();
                }}
              >
                Précédent
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < 4 ? (
              <Button
                type="button" // Explicitement de type button
                variant="primary"
                onClick={(e) => {
                  e.preventDefault(); // Empêche toute soumission accidentelle
                  nextStep();
                }}
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="submit" // Seul ce bouton est de type submit
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Publier l'annonce
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnoncePage;