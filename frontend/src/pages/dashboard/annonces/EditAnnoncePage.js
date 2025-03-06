import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { 
  TruckIcon, 
  MapPinIcon, 
  CalendarIcon, 
  PhotoIcon, 
  DocumentTextIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import apiClient from '../../../api/client';
import annonceService from '../../../services/annonceService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { TYPE_TRANSPORT_LABELS } from '../../../utils/constants';

const EditAnnoncePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [annonceLoading, setAnnonceLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Schéma de validation avec Yup
  const validationSchema = Yup.object({
    titre: Yup.string()
      .required('Le titre est obligatoire')
      .min(5, 'Le titre doit comporter au moins 5 caractères')
      .max(100, 'Le titre ne doit pas dépasser 100 caractères'),
    description: Yup.string()
      .required('La description est obligatoire')
      .min(20, 'La description doit comporter au moins 20 caractères')
      .max(1000, 'La description ne doit pas dépasser 1000 caractères'),
    typeTransport: Yup.string()
      .required('Le type de transport est obligatoire'),
    villeDepart: Yup.string()
      .required('La ville de départ est obligatoire'),
    villeArrivee: Yup.string()
      .required('La ville d\'arrivée est obligatoire'),
    dateDepart: Yup.date()
      .required('La date de départ est obligatoire')
      .min(new Date(), 'La date de départ doit être dans le futur'),
    poids: Yup.number()
      .when('typeTransport', {
        is: (type) => ['colis', 'marchandise', 'palette'].includes(type),
        then: () => Yup.number().required('Le poids est obligatoire').positive('Le poids doit être positif'),
        otherwise: () => Yup.number().nullable()
      }),
    volume: Yup.number()
      .when('typeTransport', {
        is: (type) => ['meuble', 'demenagement'].includes(type),
        then: () => Yup.number().required('Le volume est obligatoire').positive('Le volume doit être positif'),
        otherwise: () => Yup.number().nullable()
      }),
    dimensions: Yup.string(),
    valeurDeclaree: Yup.number()
      .nullable()
      .positive('La valeur déclarée doit être positive'),
    isUrgent: Yup.boolean(),
    instructionsSpeciales: Yup.string()
  });

  // Initialisation du formulaire avec Formik
  const formik = useFormik({
    initialValues: {
      titre: '',
      description: '',
      typeTransport: '',
      villeDepart: '',
      villeArrivee: '',
      dateDepart: '',
      poids: '',
      volume: '',
      dimensions: '',
      valeurDeclaree: '',
      isUrgent: false,
      instructionsSpeciales: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Convertir les valeurs numériques
        const annonceData = {
          ...values,
          poids: values.poids ? parseFloat(values.poids) : undefined,
          volume: values.volume ? parseFloat(values.volume) : undefined,
          valeurDeclaree: values.valeurDeclaree ? parseFloat(values.valeurDeclaree) : undefined
        };
        
        // Mettre à jour l'annonce
        await annonceService.updateAnnonce(id, annonceData);
        
        // Si des images ont été ajoutées, les télécharger
        if (images.length > 0) {
          setIsUploading(true);
          
          const formData = new FormData();
          images.forEach((image) => {
            formData.append('images', image);
          });
          
          await annonceService.uploadImages(id, formData);
        }
        
        toast.success('Annonce mise à jour avec succès');
        navigate(`/dashboard/annonces/${id}`);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'annonce:', error);
        toast.error(error.message || 'Erreur lors de la mise à jour de l\'annonce');
      } finally {
        setLoading(false);
        setIsUploading(false);
      }
    }
  });

  // Charger les données de l'annonce
  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        setAnnonceLoading(true);
        
        const response = await apiClient.get(`/annonces/${id}`);
        const annonceData = response.data.data;
        
        // Vérifier si l'annonce peut être modifiée
        if (annonceData.statut !== 'disponible') {
          toast.error('Cette annonce ne peut plus être modifiée');
          navigate(`/dashboard/annonces/${id}`);
          return;
        }
        
        // Formater la date au format attendu par l'input
        let formattedDate = '';
        if (annonceData.dateDepart) {
          const date = new Date(annonceData.dateDepart);
          formattedDate = date.toISOString().split('T')[0];
        }
        
        // Initialiser les valeurs du formulaire
        formik.setValues({
          titre: annonceData.titre || '',
          description: annonceData.description || '',
          typeTransport: annonceData.typeTransport || '',
          villeDepart: annonceData.villeDepart || '',
          villeArrivee: annonceData.villeArrivee || '',
          dateDepart: formattedDate,
          poids: annonceData.poids?.toString() || '',
          volume: annonceData.volume?.toString() || '',
          dimensions: annonceData.dimensions || '',
          valeurDeclaree: annonceData.valeurDeclaree?.toString() || '',
          isUrgent: annonceData.isUrgent || false,
          instructionsSpeciales: annonceData.instructionsSpeciales || ''
        });
        
        // Récupérer les images existantes
        if (annonceData.images && annonceData.images.length > 0) {
          setExistingImages(annonceData.images);
        }
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'annonce:', err);
        setError('Impossible de charger les détails de l\'annonce');
        toast.error('Erreur lors du chargement de l\'annonce');
      } finally {
        setAnnonceLoading(false);
      }
    };

    fetchAnnonce();
  }, [id, navigate]);

  // Configuration de react-dropzone pour l'upload d'images
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      // Créer des prévisualisations pour les images acceptées
      const newImages = acceptedFiles.map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      );
      
      setImages([...images, ...newImages]);
    },
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((file) => {
        if (file.errors[0]?.code === 'file-too-large') {
          toast.error(`${file.file.name} est trop volumineux. Taille maximale: 5MB`);
        } else {
          toast.error(`${file.file.name}: ${file.errors[0]?.message}`);
        }
      });
    }
  });

  // Supprimer une nouvelle image
  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Supprimer une image existante
  const removeExistingImage = async (imageId) => {
    try {
      await apiClient.delete(`/annonces/${id}/images/${imageId}`);
      
      setExistingImages(existingImages.filter(img => img._id !== imageId));
      toast.success('Image supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      toast.error('Erreur lors de la suppression de l\'image');
    }
  };

  // Supprimer l'annonce
  const handleDelete = async () => {
    try {
      setLoading(true);
      await annonceService.deleteAnnonce(id);
      
      toast.success('Annonce supprimée avec succès');
      navigate('/dashboard/annonces');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'annonce:', error);
      toast.error(error.message || 'Erreur lors de la suppression de l\'annonce');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Nettoyer les URL de prévisualisation lors du démontage du composant
  React.useEffect(() => {
    return () => {
      // Nettoyer les URL de prévisualisation
      images.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  // Afficher un indicateur de chargement pendant le chargement de l'annonce
  if (annonceLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si le chargement a échoué
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Erreur</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-6">
                <Button
                  to="/dashboard/annonces"
                  variant="primary"
                >
                  Retour à mes annonces
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Modifier l'annonce
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Mettez à jour votre demande de transport
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            type="button"
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="mr-3"
          >
            <TrashIcon className="h-5 w-5 mr-1" />
            Supprimer
          </Button>
          <Button
            to={`/dashboard/annonces/${id}`}
            variant="outline"
          >
            Annuler
          </Button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Titre */}
              <div className="sm:col-span-6">
                <Input
                  id="titre"
                  name="titre"
                  type="text"
                  label="Titre de l'annonce"
                  placeholder="Ex: Transport de meuble Paris-Lyon"
                  value={formik.values.titre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.titre && formik.errors.titre}
                  touched={formik.touched.titre}
                  icon={<DocumentTextIcon className="h-5 w-5 text-gray-400" />}
                  required
                />
              </div>

              {/* Type de transport */}
              <div className="sm:col-span-3">
                <label htmlFor="typeTransport" className="block text-sm font-medium text-gray-700">
                  Type de transport <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TruckIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="typeTransport"
                    name="typeTransport"
                    className="pl-10 focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formik.values.typeTransport}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Sélectionner un type</option>
                    {Object.entries(TYPE_TRANSPORT_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                {formik.touched.typeTransport && formik.errors.typeTransport && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.typeTransport}</p>
                )}
              </div>

              {/* Ville de départ */}
              <div className="sm:col-span-3">
                <Input
                  id="villeDepart"
                  name="villeDepart"
                  type="text"
                  label="Ville de départ"
                  placeholder="Ex: Paris"
                  value={formik.values.villeDepart}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.villeDepart && formik.errors.villeDepart}
                  touched={formik.touched.villeDepart}
                  icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
                  required
                />
              </div>

              {/* Ville d'arrivée */}
              <div className="sm:col-span-3">
                <Input
                  id="villeArrivee"
                  name="villeArrivee"
                  type="text"
                  label="Ville d'arrivée"
                  placeholder="Ex: Lyon"
                  value={formik.values.villeArrivee}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.villeArrivee && formik.errors.villeArrivee}
                  touched={formik.touched.villeArrivee}
                  icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
                  required
                />
              </div>

              {/* Date de départ */}
              <div className="sm:col-span-3">
                <Input
                  id="dateDepart"
                  name="dateDepart"
                  type="date"
                  label="Date de départ"
                  value={formik.values.dateDepart}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.dateDepart && formik.errors.dateDepart}
                  touched={formik.touched.dateDepart}
                  icon={<CalendarIcon className="h-5 w-5 text-gray-400" />}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Champs conditionnels en fonction du type de transport */}
              {(['colis', 'marchandise', 'palette'].includes(formik.values.typeTransport)) && (
                <div className="sm:col-span-3">
                  <Input
                    id="poids"
                    name="poids"
                    type="number"
                    step="0.1"
                    label="Poids (kg)"
                    placeholder="Ex: 25.5"
                    value={formik.values.poids}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.poids && formik.errors.poids}
                    touched={formik.touched.poids}
                    required
                    min="0"
                  />
                </div>
              )}

              {(['meuble', 'demenagement'].includes(formik.values.typeTransport)) && (
                <div className="sm:col-span-3">
                  <Input
                    id="volume"
                    name="volume"
                    type="number"
                    step="0.1"
                    label="Volume (m³)"
                    placeholder="Ex: 2.5"
                    value={formik.values.volume}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.volume && formik.errors.volume}
                    touched={formik.touched.volume}
                    required
                    min="0"
                  />
                </div>
              )}

              {/* Dimensions (optionnel) */}
              <div className="sm:col-span-3">
                <Input
                  id="dimensions"
                  name="dimensions"
                  type="text"
                  label="Dimensions (optionnel)"
                  placeholder="Ex: 120x80x60 cm"
                  value={formik.values.dimensions}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.dimensions && formik.errors.dimensions}
                  touched={formik.touched.dimensions}
                />
              </div>

              {/* Valeur déclarée (optionnel) */}
              <div className="sm:col-span-3">
                <Input
                  id="valeurDeclaree"
                  name="valeurDeclaree"
                  type="number"
                  step="0.01"
                  label="Valeur déclarée (€) (optionnel)"
                  placeholder="Ex: 500"
                  value={formik.values.valeurDeclaree}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.valeurDeclaree && formik.errors.valeurDeclaree}
                  touched={formik.touched.valeurDeclaree}
                  min="0"
                />
              </div>

              {/* Case à cocher pour les demandes urgentes */}
              <div className="sm:col-span-6">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isUrgent"
                      name="isUrgent"
                      type="checkbox"
                      className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                      checked={formik.values.isUrgent}
                      onChange={formik.handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isUrgent" className="font-medium text-gray-700">
                      Demande urgente
                    </label>
                    <p className="text-gray-500">
                      Cochez cette case si votre demande est urgente et nécessite une attention particulière.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Décrivez en détail ce que vous souhaitez transporter, les conditions particulières, etc."
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {formik.values.description.length}/1000 caractères
                </p>
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.description}</p>
                )}
              </div>

              {/* Instructions spéciales (optionnel) */}
              <div className="sm:col-span-6">
                <label htmlFor="instructionsSpeciales" className="block text-sm font-medium text-gray-700">
                  Instructions spéciales (optionnel)
                </label>
                <div className="mt-1">
                  <textarea
                    id="instructionsSpeciales"
                    name="instructionsSpeciales"
                    rows={3}
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Informations supplémentaires pour le transporteur (accès, horaires, etc.)"
                    value={formik.values.instructionsSpeciales}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>

              {/* Images existantes */}
              {existingImages.length > 0 && (
                <div className="sm:col-span-6">
                  <h3 className="text-sm font-medium text-gray-700">Images existantes</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {existingImages.map((image) => (
                      <div key={image._id} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
                          <img
                            src={image.url}
                            alt="Image de l'annonce"
                            className="object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeExistingImage(image._id)}
                          >
                            <XMarkIcon className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload de nouvelles images */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Ajouter des images (optionnel)
                </label>
                <div
                  {...getRootProps()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                >
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                      >
                        <span>Télécharger des images</span>
                        <input {...getInputProps()} />
                      </label>
                      <p className="pl-1">ou glissez-déposez</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG jusqu'à 5MB
                    </p>
                  </div>
                </div>
                
                {/* Prévisualisation des nouvelles images */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Nouvelles images ({images.length})
                    </h4>
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
                            <img
                              src={image.preview}
                              alt={`Aperçu ${index + 1}`}
                              className="object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <XMarkIcon className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 truncate">
                            {image.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/dashboard/annonces/${id}`)}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading || isUploading}
            disabled={loading || isUploading}
          >
            {isUploading ? `Téléchargement (${uploadProgress}%)` : loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Supprimer l'annonce
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Etes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  isLoading={loading}
                  disabled={loading}
                  className="sm:ml-3"
                >
                  Supprimer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                  className="mt-3 sm:mt-0"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAnnoncePage;