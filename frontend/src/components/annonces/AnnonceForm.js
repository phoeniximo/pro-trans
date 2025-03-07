import React, { useState, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  MapPinIcon,
  TruckIcon,
  PhotoIcon,
  XMarkIcon,
  ScaleIcon,
  CubeIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import Input from '../ui/Input';
import Button from '../ui/Button';
import apiClient from '../../api/client';

/**
 * Formulaire de création/modification d'annonce
 * @param {Object} initialValues - Valeurs initiales pour modification
 * @param {string} mode - 'create' ou 'edit'
 * @param {Function} onSuccess - Callback appelé après soumission réussie
 */
const AnnonceForm = ({ initialValues = null, mode = 'create', onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState(initialValues?.photos || []);
  const [previewPhotos, setPreviewPhotos] = useState(
    initialValues?.photos 
      ? initialValues.photos.map(photo => ({ url: photo, isExisting: true }))
      : []
  );

  // Schéma de validation
  const validationSchema = Yup.object({
    titre: Yup.string()
      .required('Le titre est requis')
      .min(5, 'Le titre doit contenir au moins 5 caractères')
      .max(100, 'Le titre ne doit pas dépasser 100 caractères'),
    description: Yup.string()
      .required('La description est requise')
      .min(20, 'La description doit contenir au moins 20 caractères'),
    villeDepart: Yup.string()
      .required('La ville de départ est requise'),
    villeArrivee: Yup.string()
      .required('La ville d\'arrivée est requise'),
    adresseDepart: Yup.string()
      .required('L\'adresse de départ est requise'),
    adresseArrivee: Yup.string()
      .required('L\'adresse d\'arrivée est requise'),
    dateDepart: Yup.date()
      .required('La date de départ est requise')
      .min(new Date(), 'La date de départ doit être future'),
    typeTransport: Yup.string()
      .required('Le type de transport est requis'),
    budget: Yup.number()
      .nullable()
      .transform((value, originalValue) => originalValue.trim() === '' ? null : value)
      .min(0, 'Le budget ne peut pas être négatif'),
    poids: Yup.number()
      .nullable()
      .transform((value, originalValue) => originalValue.trim() === '' ? null : value)
      .min(0, 'Le poids ne peut pas être négatif'),
    volume: Yup.number()
      .nullable()
      .transform((value, originalValue) => originalValue.trim() === '' ? null : value)
      .min(0, 'Le volume ne peut pas être négatif'),
    isUrgent: Yup.boolean(),
  });

  // Initialisation de Formik
  const formik = useFormik({
    initialValues: initialValues || {
      titre: '',
      description: '',
      villeDepart: '',
      villeArrivee: '',
      adresseDepart: '',
      adresseArrivee: '',
      dateDepart: new Date(Date.now() + 86400000), // Tomorrow
      typeTransport: '',
      budget: '',
      poids: '',
      volume: '',
      isUrgent: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Préparer les données de l'annonce
        const annonceData = {
          ...values,
          photos: [], // Les photos seront traitées séparément
        };
        
        let response;
        
        // Création ou modification de l'annonce selon le mode
        if (mode === 'create') {
          response = await apiClient.post('/annonces', annonceData);
        } else {
          response = await apiClient.put(`/annonces/${initialValues._id}`, annonceData);
        }
        
        const annonceId = response.data.data._id || initialValues?._id;
        
        // Traitement des nouvelles photos si présentes
        if (photos.length > 0) {
          const formData = new FormData();
          photos.forEach(photo => {
            formData.append('photos', photo);
          });
          
          await apiClient.post(`/annonces/${annonceId}/photos`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
        
        // Suppression des photos existantes qui ont été retirées
        if (initialValues?.photos) {
          const existingPhotos = initialValues.photos;
          const remainingPhotos = previewPhotos
            .filter(photo => photo.isExisting)
            .map(photo => photo.url);
          
          const photosToDelete = existingPhotos.filter(photo => !remainingPhotos.includes(photo));
          
          if (photosToDelete.length > 0) {
            await Promise.all(
              photosToDelete.map(photoUrl => {
                const photoId = photoUrl.split('/').pop();
                return apiClient.delete(`/annonces/${annonceId}/photos/${photoId}`);
              })
            );
          }
        }
        
        toast.success(
          mode === 'create' 
            ? 'Annonce créée avec succès!' 
            : 'Annonce mise à jour avec succès!'
        );
        
        // Appel du callback si fourni, sinon redirection
        if (onSuccess) {
          onSuccess(response.data.data);
        } else {
          navigate(`/dashboard/annonces/${annonceId}`);
        }
        
      } catch (err) {
        console.error('Erreur lors de la soumission de l\'annonce:', err);
        toast.error(
          err.response?.data?.message || 
          'Une erreur est survenue lors de la sauvegarde de l\'annonce'
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Configuration de dropzone pour les photos
  const onDrop = useCallback(acceptedFiles => {
    // Vérifier le nombre total de photos (max 5)
    if (previewPhotos.length + acceptedFiles.length > 5) {
      toast.error('Vous ne pouvez pas ajouter plus de 5 photos au total');
      return;
    }
    
    // Vérifier la taille de chaque fichier (max 5MB)
    const validFiles = acceptedFiles.filter(file => file.size <= 5 * 1024 * 1024);
    const invalidFiles = acceptedFiles.filter(file => file.size > 5 * 1024 * 1024);
    
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} fichier(s) dépassent la taille limite de 5MB`);
    }
    
    // Ajouter les fichiers valides
    setPhotos([...photos, ...validFiles]);
    
    // Créer des prévisualisations
    const newPreviews = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      isExisting: false,
      file
    }));
    
    setPreviewPhotos([...previewPhotos, ...newPreviews]);
  }, [photos, previewPhotos]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 5 - previewPhotos.length,
  });

  // Supprimer une photo
  const removePhoto = (index) => {
    // Si c'est une photo existante, la marquer pour suppression
    // sinon, la retirer complètement
    const newPreviewPhotos = [...previewPhotos];
    
    // Révoquer l'URL de prévisualisation si ce n'est pas une photo existante
    if (!newPreviewPhotos[index].isExisting) {
      URL.revokeObjectURL(newPreviewPhotos[index].url);
      
      // Retirer également le fichier des photos à envoyer
      const newPhotos = [...photos];
      const fileToRemove = newPreviewPhotos[index].file;
      const fileIndex = newPhotos.findIndex(file => file === fileToRemove);
      if (fileIndex !== -1) {
        newPhotos.splice(fileIndex, 1);
      }
      setPhotos(newPhotos);
    }
    
    newPreviewPhotos.splice(index, 1);
    setPreviewPhotos(newPreviewPhotos);
  };

  // Types de transport disponibles
  const transportTypes = [
    { value: 'colis', label: 'Colis' },
    { value: 'meuble', label: 'Meuble(s)' },
    { value: 'marchandise', label: 'Marchandise' },
    { value: 'palette', label: 'Palette' },
    { value: 'demenagement', label: 'Déménagement' },
    { value: 'vehicule', label: 'Véhicule' },
    { value: 'autre', label: 'Autre' },
  ];

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {mode === 'create' ? 'Créer une nouvelle annonce' : 'Modifier l\'annonce'}
        </h2>
        
        {/* Informations générales */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">Informations générales</h3>
          
          <div className="space-y-4">
            <Input
              id="titre"
              name="titre"
              label="Titre de l'annonce"
              placeholder="Ex: Transport de meubles de Paris à Lyon"
              value={formik.values.titre}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.titre && formik.errors.titre}
              touched={formik.touched.titre}
              required
            />
            
            <div className="form-group">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description détaillée
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  formik.touched.description && formik.errors.description
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                }`}
                placeholder="Décrivez en détail votre besoin de transport..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.description && formik.errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.description}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="typeTransport"
                name="typeTransport"
                label="Type de transport"
                as="select"
                value={formik.values.typeTransport}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.typeTransport && formik.errors.typeTransport}
                touched={formik.touched.typeTransport}
                required
                icon={<TruckIcon className="h-5 w-5 text-gray-400" />}
              >
                <option value="">Sélectionnez un type</option>
                {transportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Input>
              
              <Input
                id="budget"
                name="budget"
                type="number"
                label="Budget (€)"
                placeholder="Budget estimé (optionnel)"
                value={formik.values.budget}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.budget && formik.errors.budget}
                touched={formik.touched.budget}
                icon={<CurrencyEuroIcon className="h-5 w-5 text-gray-400" />}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="poids"
                name="poids"
                type="number"
                label="Poids (kg)"
                placeholder="Poids total (optionnel)"
                value={formik.values.poids}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.poids && formik.errors.poids}
                touched={formik.touched.poids}
                icon={<ScaleIcon className="h-5 w-5 text-gray-400" />}
                min="0"
                step="0.1"
              />
              
              <Input
                id="volume"
                name="volume"
                type="number"
                label="Volume (m³)"
                placeholder="Volume total (optionnel)"
                value={formik.values.volume}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.volume && formik.errors.volume}
                touched={formik.touched.volume}
                icon={<CubeIcon className="h-5 w-5 text-gray-400" />}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="isUrgent"
                name="isUrgent"
                type="checkbox"
                checked={formik.values.isUrgent}
                onChange={formik.handleChange}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="isUrgent" className="ml-2 block text-sm text-gray-700">
                Transport urgent
              </label>
            </div>
          </div>
        </div>
        
        {/* Adresses */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">Adresses</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="villeDepart"
                name="villeDepart"
                label="Ville de départ"
                placeholder="Ex: Paris"
                value={formik.values.villeDepart}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.villeDepart && formik.errors.villeDepart}
                touched={formik.touched.villeDepart}
                required
                icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
              />
              
              <Input
                id="villeArrivee"
                name="villeArrivee"
                label="Ville d'arrivée"
                placeholder="Ex: Lyon"
                value={formik.values.villeArrivee}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.villeArrivee && formik.errors.villeArrivee}
                touched={formik.touched.villeArrivee}
                required
                icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="adresseDepart"
                name="adresseDepart"
                label="Adresse de départ"
                placeholder="Adresse complète"
                value={formik.values.adresseDepart}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.adresseDepart && formik.errors.adresseDepart}
                touched={formik.touched.adresseDepart}
                required
              />
              
              <Input
                id="adresseArrivee"
                name="adresseArrivee"
                label="Adresse d'arrivée"
                placeholder="Adresse complète"
                value={formik.values.adresseArrivee}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.adresseArrivee && formik.errors.adresseArrivee}
                touched={formik.touched.adresseArrivee}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Date */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">Date</h3>
          
          <div className="form-group">
            <label htmlFor="dateDepart" className="block text-sm font-medium text-gray-700 mb-1">
              Date de départ souhaitée
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <DatePicker
                id="dateDepart"
                name="dateDepart"
                selected={formik.values.dateDepart}
                onChange={(date) => formik.setFieldValue('dateDepart', date)}
                onBlur={formik.handleBlur}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                  formik.touched.dateDepart && formik.errors.dateDepart
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                }`}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                required
              />
            </div>
            {formik.touched.dateDepart && formik.errors.dateDepart && (
              <p className="mt-1 text-sm text-red-600">
                {formik.errors.dateDepart}
              </p>
            )}
          </div>
        </div>
        
        {/* Photos */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Photos (optionnel)</h3>
          
          {/* Zone de dépôt des photos */}
          <div
            {...getRootProps()}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              isDragActive
                ? 'border-teal-300 bg-teal-50'
                : 'border-gray-300 hover:border-teal-400'
            }`}
          >
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none"
                >
                  <span>Télécharger des photos</span>
                  <input {...getInputProps()} className="sr-only" />
                </label>
                <p className="pl-1">ou glisser-déposer</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP jusqu'à 5MB (max 5 photos)
              </p>
            </div>
          </div>
          
          {/* Aperçu des photos */}
          {previewPhotos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {previewPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                    <img
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={loading}
        >
          {mode === 'create' ? 'Créer l\'annonce' : 'Mettre à jour'}
        </Button>
      </div>
    </form>
  );
};

export default AnnonceForm;