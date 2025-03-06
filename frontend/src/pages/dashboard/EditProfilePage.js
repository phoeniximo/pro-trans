import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  LockClosedIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../hooks/useAuth';
import userService from '../../services/userService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const EditProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [specialites, setSpecialites] = useState([]);
  const [newSpecialite, setNewSpecialite] = useState('');

  // Sch�ma de validation pour l'information personnelle
  const validationSchema = Yup.object({
    prenom: Yup.string()
      .required('Le pr�nom est obligatoire')
      .min(2, 'Le pr�nom doit comporter au moins 2 caract�res')
      .max(50, 'Le pr�nom ne doit pas d�passer 50 caract�res'),
    nom: Yup.string()
      .required('Le nom est obligatoire')
      .min(2, 'Le nom doit comporter au moins 2 caract�res')
      .max(50, 'Le nom ne doit pas d�passer 50 caract�res'),
    telephone: Yup.string()
      .required('Le num�ro de t�l�phone est obligatoire')
      .matches(
        /^((\+)33|0)[1-9](\d{2}){4}$/,
        'Le format du num�ro de t�l�phone est invalide (ex: 0612345678 ou +33612345678)'
      ),
    'adresse.rue': Yup.string()
      .required('L\'adresse est obligatoire'),
    'adresse.codePostal': Yup.string()
      .required('Le code postal est obligatoire')
      .matches(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres'),
    'adresse.ville': Yup.string()
      .required('La ville est obligatoire'),
    'adresse.pays': Yup.string()
      .required('Le pays est obligatoire'),
    aboutMe: Yup.string()
      .max(500, 'La description ne doit pas d�passer 500 caract�res')
  });

  // Sch�ma de validation pour le changement de mot de passe
  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string()
      .required('Le mot de passe actuel est obligatoire'),
    newPassword: Yup.string()
      .required('Le nouveau mot de passe est obligatoire')
      .min(8, 'Le mot de passe doit contenir au moins 8 caract�res')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    confirmPassword: Yup.string()
      .required('La confirmation du mot de passe est obligatoire')
      .oneOf([Yup.ref('newPassword'), null], 'Les mots de passe ne correspondent pas')
  });

  // Initialiser le formulaire avec les valeurs de l'utilisateur
  const formik = useFormik({
    initialValues: {
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      adresse: {
        rue: user?.adresse?.rue || '',
        codePostal: user?.adresse?.codePostal || '',
        ville: user?.adresse?.ville || '',
        pays: user?.adresse?.pays || 'France'
      },
      aboutMe: user?.aboutMe || '',
      disponibilite: user?.disponibilite || '',
      typeTransporteur: user?.typeTransporteur || ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await userService.updateProfile(values);
        
        // Mettre � jour le contexte d'authentification
        updateUserProfile(response.data.data);
        
        toast.success('Profil mis � jour avec succ�s');
        navigate('/profile');
      } catch (error) {
        console.error('Erreur lors de la mise � jour du profil:', error);
        toast.error(error.message || 'Erreur lors de la mise � jour du profil');
      } finally {
        setLoading(false);
      }
    }
  });

  // Formulaire pour le changement de mot de passe
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await userService.updatePassword({
          passwordCurrent: values.currentPassword,
          password: values.newPassword,
          passwordConfirm: values.confirmPassword
        });
        
        toast.success('Mot de passe mis � jour avec succ�s');
        passwordFormik.resetForm();
      } catch (error) {
        console.error('Erreur lors de la mise � jour du mot de passe:', error);
        toast.error(error.message || 'Erreur lors de la mise � jour du mot de passe');
      } finally {
        setLoading(false);
      }
    }
  });

  // Initialiser les sp�cialit�s
  useEffect(() => {
    if (user && user.specialites) {
      setSpecialites(user.specialites);
    }
  }, [user]);

  // Configuration de react-dropzone pour la photo de profil
  const { getRootProps: getPhotoRootProps, getInputProps: getPhotoInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setProfilePhoto(file);
        
        // Cr�er une URL pour pr�visualiser l'image
        const previewUrl = URL.createObjectURL(file);
        formik.setFieldValue('photoPreview', previewUrl);
        
        // Uploader la photo imm�diatement
        await handlePhotoUpload(file);
      }
    },
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const { errors } = rejectedFiles[0];
        if (errors.some(e => e.code === 'file-too-large')) {
          toast.error('L\'image est trop volumineuse. Taille maximale: 5MB');
        } else {
          toast.error('Format de fichier non accept�. Utilisez JPG, PNG ou GIF');
        }
      }
    }
  });

  // Configuration de react-dropzone pour les documents
  const { getRootProps: getDocumentRootProps, getInputProps: getDocumentInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10485760, // 10MB
    onDrop: (acceptedFiles) => {
      // Ajouter les nouveaux fichiers � la liste existante
      const newDocuments = [...documents, ...acceptedFiles.map(file => ({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        name: file.name,
        uploading: false,
        uploaded: false,
        error: null
      }))];
      
      setDocuments(newDocuments);
    },
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const { errors } = rejectedFiles[0];
        if (errors.some(e => e.code === 'file-too-large')) {
          toast.error('Le document est trop volumineux. Taille maximale: 10MB');
        } else {
          toast.error('Format de fichier non accept�. Utilisez PDF, JPG, PNG, DOC ou DOCX');
        }
      }
    }
  });

  // Uploader la photo de profil
  const handlePhotoUpload = async (file) => {
    try {
      setUploadingPhoto(true);
      
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await userService.uploadProfilePhoto(formData);
      
      // Mettre � jour le contexte d'authentification avec la nouvelle photo
      updateUserProfile({
        ...user,
        photo: response.data.photo
      });
      
      toast.success('Photo de profil mise � jour avec succ�s');
    } catch (error) {
      console.error('Erreur lors du t�l�chargement de la photo:', error);
      toast.error(error.message || 'Erreur lors du t�l�chargement de la photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Uploader les documents
  const handleDocumentsUpload = async () => {
    if (documents.length === 0) {
      toast.error('Aucun document � t�l�charger');
      return;
    }
    
    try {
      setUploadingDocuments(true);
      
      const formData = new FormData();
      documents.forEach((doc, index) => {
        if (!doc.uploaded && !doc.uploading) {
          formData.append(`documents`, doc.file);
          
          // Marquer le document comme en cours de t�l�chargement
          setDocuments(prev => 
            prev.map((d, i) => 
              i === index ? { ...d, uploading: true } : d
            )
          );
        }
      });
      
      const response = await userService.uploadDocuments(formData);
      
      // Mettre � jour le statut des documents
      setDocuments(prev => 
        prev.map(doc => {
          const uploadedDoc = response.data.documents.find(d => d.originalname === doc.name);
          if (uploadedDoc) {
            return { ...doc, uploading: false, uploaded: true, url: uploadedDoc.path };
          }
          return doc;
        })
      );
      
      toast.success('Documents t�l�charg�s avec succ�s');
    } catch (error) {
      console.error('Erreur lors du t�l�chargement des documents:', error);
      toast.error(error.message || 'Erreur lors du t�l�chargement des documents');
      
      // R�initialiser le statut des documents en cours de t�l�chargement
      setDocuments(prev => 
        prev.map(doc => doc.uploading ? { ...doc, uploading: false, error: 'Echec du t�l�chargement' } : doc)
      );
    } finally {
      setUploadingDocuments(false);
    }
  };

  // Supprimer un document de la liste
  const removeDocument = (index) => {
    const doc = documents[index];
    
    // Si le document a une pr�visualisation, lib�rer la m�moire
    if (doc.preview) {
      URL.revokeObjectURL(doc.preview);
    }
    
    // Supprimer le document de la liste
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Ajouter une sp�cialit�
  const addSpecialite = () => {
    if (newSpecialite.trim() === '') return;
    
    if (!specialites.includes(newSpecialite)) {
      setSpecialites([...specialites, newSpecialite]);
      formik.setFieldValue('specialites', [...specialites, newSpecialite]);
    }
    
    setNewSpecialite('');
  };

  // Supprimer une sp�cialit�
  const removeSpecialite = (index) => {
    const newSpecialites = [...specialites];
    newSpecialites.splice(index, 1);
    setSpecialites(newSpecialites);
    formik.setFieldValue('specialites', newSpecialites);
  };

  // Nettoyer les pr�visualisations lors du d�montage du composant
  useEffect(() => {
    return () => {
      // Nettoyer les pr�visualisations de documents
      documents.forEach(doc => {
        if (doc.preview) {
          URL.revokeObjectURL(doc.preview);
        }
      });
      
      // Nettoyer la pr�visualisation de la photo de profil
      if (formik.values.photoPreview) {
        URL.revokeObjectURL(formik.values.photoPreview);
      }
    };
  }, [documents, formik.values.photoPreview]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Modifier mon profil
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            to="/profile"
            variant="outline"
          >
            Annuler
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Informations personnelles
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Changer le mot de passe
          </button>
          {user?.role === 'transporteur' && (
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              Documents et v�rification
            </button>
          )}
        </nav>
      </div>

      {/* Formulaire du profil */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Photo de profil */}
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Photo de profil</label>
                  <div className="mt-2 flex items-center">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                      {formik.values.photoPreview ? (
                        <img
                          src={formik.values.photoPreview}
                          alt="Pr�visualisation"
                          className="h-full w-full object-cover"
                        />
                      ) : user?.photo ? (
                        <img
                          src={user.photo}
                          alt={`${user.prenom} ${user.nom}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-full w-full text-gray-300 p-4" />
                      )}
                    </div>
                    <div {...getPhotoRootProps()} className="ml-5">
                      <input {...getPhotoInputProps()} />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingPhoto}
                      >
                        {uploadingPhoto ? 'T�l�chargement...' : 'Changer'}
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    JPG, PNG ou GIF. 5 MB maximum.
                  </p>
                </div>

                {/* Pr�nom */}
                <div className="sm:col-span-3">
                  <Input
                    id="prenom"
                    name="prenom"
                    type="text"
                    label="Pr�nom"
                    value={formik.values.prenom}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.prenom && formik.errors.prenom}
                    touched={formik.touched.prenom}
                    icon={<UserIcon className="h-5 w-5 text-gray-400" />}
                    required
                  />
                </div>

                {/* Nom */}
                <div className="sm:col-span-3">
                  <Input
                    id="nom"
                    name="nom"
                    type="text"
                    label="Nom"
                    value={formik.values.nom}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.nom && formik.errors.nom}
                    touched={formik.touched.nom}
                    icon={<UserIcon className="h-5 w-5 text-gray-400" />}
                    required
                  />
                </div>

                {/* Email */}
                <div className="sm:col-span-3">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Adresse email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled
                    icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                    helperText="Vous ne pouvez pas modifier votre adresse email"
                  />
                </div>

                {/* T�l�phone */}
                <div className="sm:col-span-3">
                  <Input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    label="Num�ro de t�l�phone"
                    value={formik.values.telephone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.telephone && formik.errors.telephone}
                    touched={formik.touched.telephone}
                    icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
                    required
                  />
                </div>

                {/* Adresse */}
                <div className="sm:col-span-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Adresse</h3>
                </div>

                {/* Rue */}
                <div className="sm:col-span-6">
                  <Input
                    id="adresse.rue"
                    name="adresse.rue"
                    type="text"
                    label="Adresse"
                    value={formik.values.adresse.rue}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.adresse?.rue && formik.errors.adresse?.rue
                    }
                    touched={formik.touched.adresse?.rue}
                    icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
                    required
                  />
                </div>

                {/* Code postal */}
                <div className="sm:col-span-2">
                  <Input
                    id="adresse.codePostal"
                    name="adresse.codePostal"
                    type="text"
                    label="Code postal"
                    value={formik.values.adresse.codePostal}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.adresse?.codePostal && formik.errors.adresse?.codePostal
                    }
                    touched={formik.touched.adresse?.codePostal}
                    required
                  />
                </div>

                {/* Ville */}
                <div className="sm:col-span-2">
                  <Input
                    id="adresse.ville"
                    name="adresse.ville"
                    type="text"
                    label="Ville"
                    value={formik.values.adresse.ville}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.adresse?.ville && formik.errors.adresse?.ville
                    }
                    touched={formik.touched.adresse?.ville}
                    required
                  />
                </div>

                {/* Pays */}
                <div className="sm:col-span-2">
                  <Input
                    id="adresse.pays"
                    name="adresse.pays"
                    type="text"
                    label="Pays"
                    value={formik.values.adresse.pays}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.adresse?.pays && formik.errors.adresse?.pays
                    }
                    touched={formik.touched.adresse?.pays}
                    required
                  />
                </div>

                {/* A propos de moi */}
                <div className="sm:col-span-6">
                  <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700">
                    A propos de moi
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="aboutMe"
                      name="aboutMe"
                      rows="3"
                      className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formik.values.aboutMe}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    ></textarea>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Une br�ve description de vous-m�me. {formik.values.aboutMe?.length || 0}/500 caract�res.
                  </p>
                  {formik.touched.aboutMe && formik.errors.aboutMe && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.aboutMe}</p>
                  )}
                </div>

                {/* Champs sp�cifiques aux transporteurs */}
                {user?.role === 'transporteur' && (
                  <>
                    <div className="sm:col-span-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Informations professionnelles</h3>
                    </div>

                    {/* Type de transporteur */}
                    <div className="sm:col-span-3">
                      <label htmlFor="typeTransporteur" className="block text-sm font-medium text-gray-700">
                        Type de transporteur
                      </label>
                      <select
                        id="typeTransporteur"
                        name="typeTransporteur"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                        value={formik.values.typeTransporteur}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <option value="">S�lectionnez un type</option>
                        <option value="independant">Ind�pendant</option>
                        <option value="entreprise">Entreprise</option>
                        <option value="autoentrepreneur">Auto-entrepreneur</option>
                      </select>
                    </div>

                    {/* Disponibilit� */}
                    <div className="sm:col-span-3">
                      <label htmlFor="disponibilite" className="block text-sm font-medium text-gray-700">
                        Disponibilit�
                      </label>
                      <select
                        id="disponibilite"
                        name="disponibilite"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                        value={formik.values.disponibilite}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <option value="">S�lectionnez une disponibilit�</option>
                        <option value="temps_plein">Temps plein</option>
                        <option value="temps_partiel">Temps partiel</option>
                        <option value="weekends">Weekends uniquement</option>
                        <option value="sur_demande">Sur demande</option>
                      </select>
                    </div>

                    {/* Sp�cialit�s */}
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">
                        Sp�cialit�s
                      </label>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {specialites.map((specialite, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                            >
                              {specialite}
                              <button
                                type="button"
                                onClick={() => removeSpecialite(index)}
                                className="ml-1.5 h-5 w-5 inline-flex items-center justify-center rounded-full text-teal-500 hover:bg-teal-200 hover:text-teal-600 focus:outline-none"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            value={newSpecialite}
                            onChange={(e) => setNewSpecialite(e.target.value)}
                            placeholder="Ajouter une sp�cialit�"
                            className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={addSpecialite}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Indiquez vos domaines d'expertise (ex: d�m�nagement, transport de meuble, international...)
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/profile')}
                    className="mr-3"
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulaire de changement de mot de passe */}
      {activeTab === 'password' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={passwordFormik.handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Changer le mot de passe</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Assurez-vous d'utiliser un mot de passe fort et unique que vous n'utilisez pas pour d'autres sites.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Mot de passe actuel */}
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    label="Mot de passe actuel"
                    value={passwordFormik.values.currentPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    error={
                      passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword
                    }
                    touched={passwordFormik.touched.currentPassword}
                    icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                    required
                  />

                  {/* Nouveau mot de passe */}
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    label="Nouveau mot de passe"
                    value={passwordFormik.values.newPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    error={
                      passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                    }
                    touched={passwordFormik.touched.newPassword}
                    icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                    required
                    helperText="Au moins 8 caract�res, incluant une majuscule, une minuscule et un chiffre."
                  />

                  {/* Confirmation du mot de passe */}
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Confirmer le mot de passe"
                    value={passwordFormik.values.confirmPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    error={
                      passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword
                    }
                    touched={passwordFormik.touched.confirmPassword}
                    icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                    required
                  />
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => passwordFormik.resetForm()}
                      className="mr-3"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={loading}
                      disabled={loading}
                    >
                      Mettre � jour le mot de passe
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section documents et v�rification pour les transporteurs */}
      {activeTab === 'documents' && user?.role === 'transporteur' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Documents et v�rification</h3>
              <p className="mt-1 text-sm text-gray-500">
                T�l�chargez vos documents professionnels pour la v�rification de votre compte. Cela augmentera votre visibilit� et la confiance des clients.
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                T�l�charger des documents
              </label>
              <div className="mt-2">
                <div
                  {...getDocumentRootProps()}
                  className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
                        <span>T�l�charger un fichier</span>
                        <input {...getDocumentInputProps()} />
                      </label>
                      <p className="pl-1">ou glisser-d�poser</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, JPG, DOC jusqu'� 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des documents */}
            {documents.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700">Documents � t�l�charger</h4>
                <ul className="mt-3 divide-y divide-gray-200">
                  {documents.map((doc, index) => (
                    <li key={index} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        {doc.preview ? (
                          <img
                            src={doc.preview}
                            alt={doc.name}
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded">
                            <svg
                              className="h-6 w-6 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 truncate" style={{ maxWidth: '200px' }}>
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.uploading
                              ? 'T�l�chargement en cours...'
                              : doc.uploaded
                              ? 'T�l�charg� avec succ�s'
                              : doc.error
                              ? doc.error
                              : 'En attente de t�l�chargement'}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {doc.uploading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-teal-500"></div>
                        ) : doc.uploaded ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {documents.some(doc => !doc.uploaded && !doc.uploading) && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleDocumentsUpload}
                      isLoading={uploadingDocuments}
                      disabled={uploadingDocuments}
                    >
                      T�l�charger les documents
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Documents d�j� t�l�charg�s */}
            {user?.documents && user.documents.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-700">Documents t�l�charg�s</h4>
                <ul className="mt-3 divide-y divide-gray-200">
                  {user.documents.map((doc, index) => (
                    <li key={index} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded">
                          <svg
                            className="h-6 w-6 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {doc.name || `Document ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                            {doc.verified && ' - V�rifi�'}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {doc.verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            V�rifi�
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            En attente
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfilePage;