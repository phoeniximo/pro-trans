import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  CurrencyEuroIcon,
  TruckIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Input from '../ui/Input';
import Button from '../ui/Button';
import apiClient from '../../api/client';

/**
 * Formulaire de création/modification de devis
 * @param {string} annonceId - ID de l'annonce pour laquelle le devis est créé
 * @param {Object} initialValues - Valeurs initiales pour modification
 * @param {string} mode - 'create' ou 'edit'
 * @param {Function} onSuccess - Callback appelé après soumission réussie
 */
const DevisForm = ({ annonceId, initialValues = null, mode = 'create', onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [annonce, setAnnonce] = useState(null);
  const [loadingAnnonce, setLoadingAnnonce] = useState(false);

  // Chargement des détails de l'annonce
  useEffect(() => {
    const fetchAnnonce = async () => {
      if (!annonceId) return;
      
      try {
        setLoadingAnnonce(true);
        const response = await apiClient.get(`/annonces/${annonceId}`);
        setAnnonce(response.data.data);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'annonce:', err);
        toast.error('Impossible de charger les détails de l\'annonce');
      } finally {
        setLoadingAnnonce(false);
      }
    };

    fetchAnnonce();
  }, [annonceId]);

  // Schéma de validation
  const validationSchema = Yup.object({
    montant: Yup.number()
      .required('Le montant est requis')
      .positive('Le montant doit être positif'),
    dateDebut: Yup.date()
      .required('La date de début est requise')
      .min(new Date(), 'La date de début doit être future'),
    dateFin: Yup.date()
      .required('La date de fin est requise')
      .min(
        Yup.ref('dateDebut'),
        'La date de fin doit être postérieure à la date de début'
      ),
    delaiLivraison: Yup.number()
      .required('Le délai de livraison est requis')
      .positive('Le délai doit être positif')
      .integer('Le délai doit être un nombre entier'),
    commentaire: Yup.string()
      .min(10, 'Le commentaire doit contenir au moins 10 caractères')
      .max(1000, 'Le commentaire ne doit pas dépasser 1000 caractères')
      .required('Un commentaire est requis'),
    vehiculeType: Yup.string()
      .required('Le type de véhicule est requis'),
  });

  // Initialisation de Formik
  const formik = useFormik({
    initialValues: initialValues || {
      montant: '',
      dateDebut: annonce?.dateDepart || new Date(Date.now() + 86400000), // Tomorrow
      dateFin: new Date(Date.now() + 172800000), // Day after tomorrow
      delaiLivraison: 1,
      commentaire: '',
      vehiculeType: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Préparer les données du devis
        const devisData = {
          ...values,
          annonceId: annonceId || initialValues?.annonceId,
        };
        
        let response;
        
        // Création ou modification du devis selon le mode
        if (mode === 'create') {
          response = await apiClient.post('/devis', devisData);
          toast.success('Devis envoyé avec succès!');
        } else {
          response = await apiClient.put(`/devis/${initialValues._id}`, devisData);
          toast.success('Devis mis à jour avec succès!');
        }
        
        // Appel du callback si fourni, sinon redirection
        if (onSuccess) {
          onSuccess(response.data.data);
        } else {
          navigate(`/dashboard/devis/${response.data.data._id}`);
        }
        
      } catch (err) {
        console.error('Erreur lors de la soumission du devis:', err);
        toast.error(
          err.response?.data?.message || 
          'Une erreur est survenue lors de la sauvegarde du devis'
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Types de véhicules disponibles
  const vehiculeTypes = [
    { value: 'utilitaire', label: 'Utilitaire' },
    { value: 'camion', label: 'Camion' },
    { value: 'camionnette', label: 'Camionnette' },
    { value: 'fourgon', label: 'Fourgon' },
    { value: 'poids_lourd', label: 'Poids lourd' },
    { value: 'porte_voiture', label: 'Porte-voiture' },
    { value: 'autre', label: 'Autre' },
  ];

  // Afficher un chargement pendant la récupération de l'annonce
  if (loadingAnnonce) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Détails de l'annonce */}
      {annonce && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-md font-medium text-gray-700 mb-3">Détails de l'annonce</h3>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">{annonce.titre}</p>
            
            <div className="flex items-center text-sm text-gray-600">
              <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span>{annonce.typeTransport}</span>
              
              {annonce.budget && (
                <>
                  <span className="px-2">•</span>
                  <CurrencyEuroIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span>Budget: {annonce.budget} DH</span>
                </>
              )}
              
              <span className="px-2">•</span>
              <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
              <span>Date souhaitée: {format(new Date(annonce.dateDepart), 'dd MMMM yyyy', { locale: fr })}</span>
            </div>
            
            <div className="text-sm text-gray-600 line-clamp-2">
              {annonce.description}
            </div>
          </div>
        </div>
      )}
      
      {/* Formulaire */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {mode === 'create' ? 'Proposer un devis' : 'Modifier le devis'}
        </h2>
        
        <div className="space-y-4">
          {/* Montant */}
          <Input
            id="montant"
            name="montant"
            type="number"
            label="Montant proposé (DH)"
            placeholder="Ex: 150"
            value={formik.values.montant}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.montant && formik.errors.montant}
            touched={formik.touched.montant}
            required
            icon={<CurrencyEuroIcon className="h-5 w-5 text-gray-400" />}
            min="0"
            step="0.01"
          />
          
          {/* Type de véhicule */}
          <Input
            id="vehiculeType"
            name="vehiculeType"
            label="Type de véhicule"
            as="select"
            value={formik.values.vehiculeType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.vehiculeType && formik.errors.vehiculeType}
            touched={formik.touched.vehiculeType}
            required
            icon={<TruckIcon className="h-5 w-5 text-gray-400" />}
          >
            <option value="">Sélectionnez un type de véhicule</option>
            {vehiculeTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Input>
          
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <DatePicker
                  id="dateDebut"
                  name="dateDebut"
                  selected={formik.values.dateDebut}
                  onChange={(date) => formik.setFieldValue('dateDebut', date)}
                  onBlur={formik.handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    formik.touched.dateDebut && formik.errors.dateDebut
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  required
                />
              </div>
              {formik.touched.dateDebut && formik.errors.dateDebut && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.dateDebut}
                </p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin estimée
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <DatePicker
                  id="dateFin"
                  name="dateFin"
                  selected={formik.values.dateFin}
                  onChange={(date) => formik.setFieldValue('dateFin', date)}
                  onBlur={formik.handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                    formik.touched.dateFin && formik.errors.dateFin
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                  dateFormat="dd/MM/yyyy"
                  minDate={formik.values.dateDebut || new Date()}
                  required
                />
              </div>
              {formik.touched.dateFin && formik.errors.dateFin && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.dateFin}
                </p>
              )}
            </div>
          </div>
          
          {/* Délai de livraison */}
          <Input
            id="delaiLivraison"
            name="delaiLivraison"
            type="number"
            label="Délai de livraison estimé (jours)"
            placeholder="Ex: 1"
            value={formik.values.delaiLivraison}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.delaiLivraison && formik.errors.delaiLivraison}
            touched={formik.touched.delaiLivraison}
            required
            icon={<ClockIcon className="h-5 w-5 text-gray-400" />}
            min="1"
            step="1"
          />
          
          {/* Commentaire */}
          <div className="form-group">
            <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="commentaire"
              name="commentaire"
              rows="4"
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                formik.touched.commentaire && formik.errors.commentaire
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
              }`}
              placeholder="Décrivez votre offre, vos services inclus, conditions particulières..."
              value={formik.values.commentaire}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.commentaire && formik.errors.commentaire && (
              <p className="mt-1 text-sm text-red-600">
                {formik.errors.commentaire}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Engagement et conditions */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">En proposant ce devis, je m'engage à :</h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Respecter les dates indiquées</li>
              <li>Assurer un service professionnel et de qualité</li>
              <li>Disposer des autorisations et assurances nécessaires</li>
              <li>Respecter les conditions générales de Pro-Trans</li>
            </ul>
          </div>
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
          {mode === 'create' ? 'Envoyer le devis' : 'Mettre à jour'}
        </Button>
      </div>
    </form>
  );
};

export default DevisForm;