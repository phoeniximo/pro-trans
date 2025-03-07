import React, { useState, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  XMarkIcon,
  TruckIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/client';

/**
 * Formulaire de modification de profil utilisateur
 * @param {Object} initialValues - Valeurs initiales du profil
 * @param {Function} onSuccess - Callback appelé après soumission réussie
 */
const ProfileForm = ({ initialValues = null, onSuccess }) => {
  const navigate = useNavigate();
  const { user, updateUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialValues?.photo || null);

  // Schéma de validation
  const validationSchema = Yup.object({
    prenom: Yup.string()
      .required('Le prénom est requis')
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),
    nom: Yup.string()
      .required('Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'email est requis'),
    telephone: Yup.string()
      .nullable()
      .matches(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
    adresse: Yup.object().shape({
      rue: Yup.string().required('L\'adresse est requise'),
      codePostal: Yup.string()
        .required('Le code postal est requis')
        .matches(/^[0-9]{5}$/, 'Code postal invalide'),
      ville: Yup.string().required('La ville est requise'),
      pays: Yup.string().required('Le pays est requis'),
    }),
    // Champs spécifiques aux transporteurs
    ...(user.role === 'transporteur' ? {
      societe: Yup.string(),
      siret: Yup.string()
        .nullable()
        .matches(/^[0-9]{14}$/, 'Numéro SIRET invalide (14 chiffres)'),
      specialites: Yup.array()
        .of(Yup.string())
        .min(1, 'Sélectionnez au moins une spécialité'),
      aboutMe: Yup.string()
        .max(500, 'La description ne doit pas dépasser 500 caractères'),
    } : {}),
  });

  // Spécialités disponibles pour les transporteurs
  const specialites = [
    'Colis',
    'Meubles',
    'Déménagement',
    'Marchandises',
    'Véhicules',
    'Palette',
    'International'
  ];

  // Initialisation de Formik
  const formik = useFormik({
    initialValues: initialValues || {
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      adresse: user?.adresse || {
        rue: '',
        codePostal: '',
        ville: '',
        pays: 'France',
      },
      // Champs spécifiques aux transporteurs
      ...(user.role === 'transporteur' ? {
        societe: user?.societe || '',
        siret: user?.siret || '',
        specialites: user?.specialites || [],
        aboutMe: user?.aboutMe || '',
      } : {}),
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Préparer les données du profil
        const profileData = {
          ...values,
        };
        
        // Mise à jour du profil
        const response = await apiClient.put('/users/profile', profileData);
        
        // Traitement de la photo de profil si présente
        if (photo) {
          const formData = new FormData();
          formData.append('photo', photo);
          
          await apiClient.post('/users/profile/photo', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
        
        toast.success('Profil mis à jour avec succès!');
        
        // Mettre à jour les données utilisateur dans le contexte
        updateUserData(response.data.data);
        
        // Appel du callback si fourni, sinon redirection
        if (onSuccess) {
          onSuccess(response.data.data);
        } else {
          navigate('/profile');
        }
        
      } catch (err) {
        console.error('Erreur lors de la mise à jour du profil:', err);
        toast.error(
          err.response?.data?.message || 
          'Une erreur est survenue lors de la sauvegarde du profil'
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Configuration de dropzone pour la photo
  const onDrop = useCallback(acceptedFiles => {
    // Vérifier la taille du fichier (max 5MB)
    const file = acceptedFiles[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5MB');
      return;
    }
    
    // Ajouter le fichier
    setPhoto(file);
    
    // Créer une prévisualisation
    const previewUrl = URL.createObjectURL(file);
    if (photoPreview && photoPreview !== initialValues?.photo) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(previewUrl);
  }, [photoPreview, initialValues]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1,
  });

  // Supprimer la photo
  const removePhoto = () => {
    if (photoPreview && photoPreview !== initialValues?.photo) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhoto(null);
    setPhotoPreview(null);
  };

  // Gérer la sélection des spécialités pour les transporteurs
  const handleSpecialiteChange = (specialite) => {
    const currentSpecialites = formik.values.specialites || [];
    if (currentSpecialites.includes(specialite)) {
      // Si la spécialité est déjà sélectionnée, la retirer
      formik.setFieldValue(
        'specialites',
        currentSpecialites.filter(s => s !== specialite)
      );
    } else {
      // Sinon, l'ajouter
      formik.setFieldValue('specialites', [...currentSpecialites, specialite]);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Modifier mon profil
        </h2>
        
        {/* Photo de profil */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Photo de profil
          </label>
          
          <div className="flex items-center">
            {/* Aperçu ou placeholder */}
            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Prévisualisation"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <UserIcon className="h-10 w-10" />
                </div>
              )}
            </div>
            
            {/* Zone de dépôt ou boutons */}
            <div className="ml-5">
              {photoPreview ? (
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removePhoto}
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                    >
                      Changer
                    </Button>
                  </div>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                  >
                    Ajouter une photo
                  </Button>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP jusqu'à 5MB</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Informations personnelles */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">Informations personnelles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="prenom"
              name="prenom"
              label="Prénom"
              value={formik.values.prenom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.prenom && formik.errors.prenom}
              touched={formik.touched.prenom}
              required
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            />
            
            <Input
              id="nom"
              name="nom"
              label="Nom"
              value={formik.values.nom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nom && formik.errors.nom}
              touched={formik.touched.nom}
              required
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            />
            
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && formik.errors.email}
              touched={formik.touched.email}
              required
              icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
            />
            
            <Input
              id="telephone"
              name="telephone"
              label="Téléphone"
              placeholder="Ex: 0612345678"
              value={formik.values.telephone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.telephone && formik.errors.telephone}
              touched={formik.touched.telephone}
              icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>
        </div>
        
        {/* Adresse */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">Adresse</h3>
          
          <div className="space-y-4">
            <Input
              id="adresse.rue"
              name="adresse.rue"
              label="Adresse"
              value={formik.values.adresse.rue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.adresse?.rue && formik.errors.adresse?.rue}
              touched={formik.touched.adresse?.rue}
              required
              icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="adresse.codePostal"
                name="adresse.codePostal"
                label="Code postal"
                value={formik.values.adresse.codePostal}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.adresse?.codePostal && formik.errors.adresse?.codePostal}
                touched={formik.touched.adresse?.codePostal}
                required
              />
              
              <Input
                id="adresse.ville"
                name="adresse.ville"
                label="Ville"
                value={formik.values.adresse.ville}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.adresse?.ville && formik.errors.adresse?.ville}
                touched={formik.touched.adresse?.ville}
                required
              />
            </div>
            
            <Input
              id="adresse.pays"
              name="adresse.pays"
              label="Pays"
              value={formik.values.adresse.pays}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.adresse?.pays && formik.errors.adresse?.pays}
              touched={formik.touched.adresse?.pays}
              required
            />
          </div>
        </div>
        
        {/* Informations professionnelles (pour les transporteurs) */}
        {user.role === 'transporteur' && (
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Informations professionnelles</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="societe"
                  name="societe"
                  label="Société (optionnel)"
                  value={formik.values.societe}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.societe && formik.errors.societe}
                  touched={formik.touched.societe}
                  icon={<BuildingOfficeIcon className="h-5 w-5 text-gray-400" />}
                />
                
                <Input
                  id="siret"
                  name="siret"
                  label="Numéro SIRET (optionnel)"
                  value={formik.values.siret}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.siret && formik.errors.siret}
                  touched={formik.touched.siret}
                  icon={<IdentificationIcon className="h-5 w-5 text-gray-400" />}
                />
              </div>
              
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialités
                  {formik.touched.specialites && formik.errors.specialites && (
                    <span className="ml-1 text-sm text-red-600">
                      ({formik.errors.specialites})
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {specialites.map((specialite) => (
                    <button
                      key={specialite}
                      type="button"
                      onClick={() => handleSpecialiteChange(specialite)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        formik.values.specialites?.includes(specialite)
                          ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <TruckIcon className="h-4 w-4 mr-1" />
                      {specialite}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-1">
                  À propos (optionnel)
                </label>
                <textarea
                  id="aboutMe"
                  name="aboutMe"
                  rows="4"
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    formik.touched.aboutMe && formik.errors.aboutMe
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                  placeholder="Présentez-vous, vos services, votre expérience..."
                  value={formik.values.aboutMe}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={500}
                />
                {formik.touched.aboutMe && formik.errors.aboutMe ? (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.aboutMe}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    {500 - (formik.values.aboutMe?.length || 0)} caractères restants
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/profile')}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={loading}
        >
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;