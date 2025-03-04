import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateAnnoncePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

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

  // Schéma de validation avec Yup
  const validationSchema = Yup.object({
    titre: Yup.string()
      .required('Le titre est obligatoire')
      .max(100, 'Maximum 100 caractères'),
    description: Yup.string()
      .required('La description est obligatoire')
      .min(20, 'Minimum 20 caractères'),
    typeTransport: Yup.string()
      .required('Le type de transport est obligatoire')
      .oneOf(['colis', 'meuble', 'marchandise', 'palette', 'demenagement', 'vehicule', 'autre'], 'Type invalide'),
    villeDepart: Yup.string()
      .required('La ville de départ est obligatoire'),
    'adresseDepart.rue': Yup.string()
      .required('L\'adresse de départ est obligatoire'),
    'adresseDepart.codePostal': Yup.string()
      .required('Le code postal de départ est obligatoire')
      .matches(/^[0-9]{5}$/, 'Le code postal doit contenir 5 chiffres'),
    'adresseDepart.ville': Yup.string()
      .required('La ville de départ est obligatoire'),
    villeArrivee: Yup.string()
      .required('La ville d\'arrivée est obligatoire'),
    'adresseArrivee.rue': Yup.string()
      .required('L\'adresse d\'arrivée est obligatoire'),
    'adresseArrivee.codePostal': Yup.string()
      .required('Le code postal d\'arrivée est obligatoire')
      .matches(/^[0-9]{5}$/, 'Le code postal doit contenir 5 chiffres'),
    'adresseArrivee.ville': Yup.string()
      .required('La ville d\'arrivée est obligatoire'),
    dateDepart: Yup.date()
      .required('La date de départ est obligatoire')
      .min(new Date(), 'La date doit être dans le futur'),
    flexibiliteDate: Yup.boolean(),
    poids: Yup.number()
      .positive('Le poids doit être positif'),
    unite_poids: Yup.string()
      .oneOf(['kg', 'tonnes'], 'Unité de poids invalide'),
    volume: Yup.number()
      .positive('Le volume doit être positif'),
    'dimensions.longueur': Yup.number()
      .when('typeTransport', {
        is: (val) => ['colis', 'meuble', 'marchandise', 'palette'].includes(val),
        then: Yup.number().required('La longueur est obligatoire').positive()
      }),
    'dimensions.largeur': Yup.number()
      .when('typeTransport', {
        is: (val) => ['colis', 'meuble', 'marchandise', 'palette'].includes(val),
        then: Yup.number().required('La largeur est obligatoire').positive()
      }),
    'dimensions.hauteur': Yup.number()
      .when('typeTransport', {
        is: (val) => ['colis', 'meuble', 'marchandise', 'palette'].includes(val),
        then: Yup.number().required('La hauteur est obligatoire').positive()
      }),
    'dimensions.unite': Yup.string()
      .oneOf(['cm', 'm'], 'Unité de dimension invalide'),
    nombreColis: Yup.number()
      .when('typeTransport', {
        is: 'colis',
        then: Yup.number().required('Le nombre de colis est obligatoire').positive().integer()
      }),
    budget: Yup.number()
      .positive('Le budget doit être positif'),
    valeurDeclaree: Yup.number()
      .positive('La valeur déclarée doit être positive'),
    isUrgent: Yup.boolean(),
    'optionsTransport.chargement': Yup.boolean(),
    'optionsTransport.dechargement': Yup.boolean(),
    'optionsTransport.montage': Yup.boolean(),
    'optionsTransport.demontage': Yup.boolean(),
    'optionsTransport.emballage': Yup.boolean(),
    'optionsTransport.assurance': Yup.boolean(),
    commentairesTransporteur: Yup.string()
  });

  // Initialisation du formulaire avec Formik
  const formik = useFormik({
    initialValues: {
      titre: '',
      description: '',
      typeTransport: '',
      villeDepart: '',
      adresseDepart: {
        rue: '',
        codePostal: '',
        ville: '',
        pays: 'France'
      },
      villeArrivee: '',
      adresseArrivee: {
        rue: '',
        codePostal: '',
        ville: '',
        pays: 'France'
      },
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
      valeurDeclaree: 0,
      budget: '',
      optionsTransport: {
        chargement: false,
        dechargement: false,
        montage: false,
        demontage: false,
        emballage: false,
        assurance: false
      },
      commentairesTransporteur: '',
      isUrgent: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // Créer l'annonce
        const response = await annonceService.createAnnonce(values);
        const annonceId = response.data._id;
        
        // Si des photos ont été ajoutées, les uploader
        if (photos.length > 0) {
          const formData = new FormData();
          photos.forEach(photo => {
            formData.append('photos', photo);
          });
          
          await annonceService.uploadImages(annonceId, formData);
        }
        
        toast.success('Annonce créée avec succès');
        navigate(`/dashboard/annonces/${annonceId}`);
      } catch (error) {
        toast.error(error.message || 'Erreur lors de la création de l\'annonce');
        console.error('Erreur de création d\'annonce:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // Validation spécifique à l'étape en cours
  const validateStep = () => {
    let errors = {};
    
    if (step === 1) {
      if (!formik.values.titre) errors.titre = 'Le titre est obligatoire';
      if (!formik.values.description) errors.description = 'La description est obligatoire';
      if (!formik.values.typeTransport) errors.typeTransport = 'Le type de transport est obligatoire';
    } else if (step === 2) {
      if (!formik.values.villeDepart) errors.villeDepart = 'La ville de départ est obligatoire';
      if (!formik.values.adresseDepart.rue) errors['adresseDepart.rue'] = 'L\'adresse de départ est obligatoire';
      if (!formik.values.adresseDepart.codePostal) errors['adresseDepart.codePostal'] = 'Le code postal de départ est obligatoire';
      if (!formik.values.adresseDepart.ville) errors['adresseDepart.ville'] = 'La ville de départ est obligatoire';
      if (!formik.values.villeArrivee) errors.villeArrivee = 'La ville d\'arrivée est obligatoire';
      if (!formik.values.adresseArrivee.rue) errors['adresseArrivee.rue'] = 'L\'adresse d\'arrivée est obligatoire';
      if (!formik.values.adresseArrivee.codePostal) errors['adresseArrivee.codePostal'] = 'Le code postal d\'arrivée est obligatoire';
      if (!formik.values.adresseArrivee.ville) errors['adresseArrivee.ville'] = 'La ville d\'arrivée est obligatoire';
    }
    
    return Object.keys(errors).length === 0;
  };

  // Passer à l'étape suivante
  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      toast.error('Veuillez remplir tous les champs obligatoires');
    }
  };

  // Revenir à l'étape précédente
  const prevStep = () => {
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
              <span className="ml-2 text-sm font-medium">Adresses</span>
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

      <form onSubmit={formik.handleSubmit} className="card shadow-md rounded-lg">
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
                  placeholder="Ex: Transport d'un canapé de Paris à Lyon"
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
                    <span className="text-red-500 ml-1">*</span>
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
                    <option value="colis">Colis</option>
                    <option value="meuble">Meuble</option>
                    <option value="marchandise">Marchandise</option>
                    <option value="palette">Palette</option>
                    <option value="demenagement">Déménagement</option>
                    <option value="vehicule">Véhicule</option>
                    <option value="autre">Autre</option>
                  </select>
                  {formik.touched.typeTransport && formik.errors.typeTransport && (
                    <p className="form-error">{formik.errors.typeTransport}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Etape 2: Adresses */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Adresses de départ et d'arrivée</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Adresse de départ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="adresseDepart.rue"
                    name="adresseDepart.rue"
                    label="Adresse"
                    placeholder="Rue et numéro"
                    value={formik.values.adresseDepart.rue}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.adresseDepart?.rue && formik.errors.adresseDepart?.rue}
                    touched={formik.touched.adresseDepart?.rue}
                    required
                  />
                  
                  <Input
                    id="adresseDepart.codePostal"
                    name="adresseDepart.codePostal"
                    label="Code postal"
                    placeholder="Ex: 75001"
                    value={formik.values.adresseDepart.codePostal}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.adresseDepart?.codePostal && formik.errors.adresseDepart?.codePostal}
                    touched={formik.touched.adresseDepart?.codePostal}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    id="adresseDepart.ville"
                    name="adresseDepart.ville"
                    label="Ville"
                    placeholder="Ex: Paris"
                    value={formik.values.adresseDepart.ville}
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldValue('villeDepart', e.target.value);
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.adresseDepart?.ville && formik.errors.adresseDepart?.ville}
                    touched={formik.touched.adresseDepart?.ville}
                    required
                  />
                  
                  <Input
                    id="adresseDepart.pays"
                    name="adresseDepart.pays"
                    label="Pays"
                    placeholder="Ex: France"
                    value={formik.values.adresseDepart.pays}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.adresseDepart?.pays && formik.errors.adresseDepart?.pays}
                    touched={formik.touched.adresseDepart?.pays}
                  />
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-3">Adresse d'arrivée</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="adresseArrivee.rue"
                    name="adresseArrivee.rue"
                    label="Adresse"
                    placeholder="Rue et numéro"
                    value={formik.values.adresseArrivee.rue}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.adresseArrivee?.rue && formik.errors.adresseArrivee?.rue}
                    touched={formik.touched.adresseArrivee?.rue}
                    required
                  />
                  
                  <Input
                    id="adresseArrivee.codePostal"
                    name="adresseArrivee.codePostal"
                    label="Code postal"
                    placeholder="Ex: 69001"
                    value={formik.values.adresseArrivee.codePostal}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.adresseArrivee?.codePostal && formik.errors.adresseArrivee?.codePostal}
                    touched={formik.touched.adresseArrivee?.codePostal}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    id="adresseArrivee.ville"
                    name="adresseArrivee.ville"
                    label="Ville"
                    placeholder="Ex: Lyon"
                    value={formik.values.adresseArrivee.ville}
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldValue('villeArrivee', e.target.value);
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.adresseArrivee?.ville && formik.errors.adresseArrivee?.ville}
                    touched={formik.touched.adresseArrivee?.ville}
                    required
                  />
                  
                  <Input
                    id="adresseArrivee.pays"
                    name="adresseArrivee.pays"
                    label="Pays"
                    placeholder="Ex: France"
                    value={formik.values.adresseArrivee.pays}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.adresseArrivee?.pays && formik.errors.adresseArrivee?.pays}
                    touched={formik.touched.adresseArrivee?.pays}
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
              
              {['colis', 'meuble', 'marchandise', 'palette'].includes(formik.values.typeTransport) && (
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
              
              {formik.values.typeTransport === 'colis' && (
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
                  id="valeurDeclaree"
                  name="valeurDeclaree"
                  type="number"
                  label="Valeur déclarée (€)"
                  placeholder="Ex: 200"
                  helperText="Renseignez la valeur de vos biens pour l'assurance."
                  value={formik.values.valeurDeclaree}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.valeurDeclaree && formik.errors.valeurDeclaree}
                  touched={formik.touched.valeurDeclaree}
                />
              </div>
              
              <div className="mt-4">
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  label="Budget estimé (€)"
                  placeholder="Ex: 150"
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
                          id="optionsTransport.assurance"
                          name="optionsTransport.assurance"
                          type="checkbox"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          checked={formik.values.optionsTransport.assurance}
                          onChange={formik.handleChange}
                        />
                        <label htmlFor="optionsTransport.assurance" className="ml-2 block text-sm text-gray-900">
                          Assurance complémentaire
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
                    <p>{formik.values.typeTransport === 'colis' ? 'Colis' : 
                        formik.values.typeTransport === 'meuble' ? 'Meuble' : 
                        formik.values.typeTransport === 'marchandise' ? 'Marchandise' :
                        formik.values.typeTransport === 'palette' ? 'Palette' :
                        formik.values.typeTransport === 'demenagement' ? 'Déménagement' :
                        formik.values.typeTransport === 'vehicule' ? 'Véhicule' : 'Autre'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">Trajet</h4>
                    <p>{formik.values.adresseDepart.ville} ? {formik.values.adresseArrivee.ville}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">Date de départ</h4>
                    <p>{formik.values.dateDepart ? formik.values.dateDepart.toLocaleDateString('fr-FR') : '-'}</p>
                  </div>
                  
                  {formik.values.budget && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700">Budget</h4>
                      <p>{formik.values.budget} €</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation des étapes */}
          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
              >
                Précédent
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={nextStep}
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="submit"
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