import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { 
  TruckIcon, 
  CurrencyEuroIcon, 
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../../api/client';
import devisService from '../../../services/devisService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { formatDate } from '../../../utils/formatters';

const CreateDevisPage = () => {
  const { annonceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [annonce, setAnnonce] = useState(null);
  const [annonceLoading, setAnnonceLoading] = useState(true);
  const [annonceError, setAnnonceError] = useState(null);

  // Validation du formulaire avec Yup
  const validationSchema = Yup.object({
    montant: Yup.number()
      .required('Le montant est obligatoire')
      .positive('Le montant doit être positif')
      .typeError('Le montant doit être un nombre'),
    delaiLivraison: Yup.date()
      .required('La date de livraison est obligatoire')
      .min(new Date(), 'La date de livraison doit être dans le futur')
      .typeError('Veuillez entrer une date valide'),
    message: Yup.string()
      .required('Un message est obligatoire')
      .min(20, 'Le message doit comporter au moins 20 caractères')
      .max(1000, 'Le message ne doit pas dépasser 1000 caractères'),
    conditions: Yup.boolean()
      .oneOf([true], 'Vous devez accepter les conditions générales')
  });

  // Initialisation du formulaire avec Formik
  const formik = useFormik({
    initialValues: {
      montant: '',
      delaiLivraison: '',
      message: '',
      conditions: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Construction de l'objet devis à envoyer
        const devisData = {
          annonceId,
          montant: parseFloat(values.montant),
          delaiLivraison: values.delaiLivraison,
          message: values.message
        };
        
        // Appel à l'API pour créer le devis
        const response = await devisService.createDevis(devisData);
        
        toast.success('Devis envoyé avec succès');
        
        // Redirection vers la page du devis créé
        navigate(`/dashboard/devis/${response.data._id}`);
      } catch (error) {
        console.error('Erreur lors de la création du devis:', error);
        toast.error(error.message || 'Erreur lors de la création du devis');
      } finally {
        setLoading(false);
      }
    }
  });

  // Récupération des détails de l'annonce
  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        setAnnonceLoading(true);
        const response = await apiClient.get(`/annonces/${annonceId}`);
        setAnnonce(response.data.data);
        setAnnonceError(null);
        
        // Préremplir la date de livraison si disponible dans l'annonce
        if (response.data.data.dateArrivee) {
          formik.setFieldValue('delaiLivraison', new Date(response.data.data.dateArrivee));
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'annonce:', err);
        setAnnonceError('Impossible de charger les détails de l\'annonce');
        toast.error('Erreur lors du chargement des détails de l\'annonce');
      } finally {
        setAnnonceLoading(false);
      }
    };

    if (annonceId) {
      fetchAnnonce();
    }
  }, [annonceId]);

  if (annonceLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (annonceError || !annonce) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600 mb-4">
          <svg 
            className="mx-auto h-12 w-12 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h2 className="text-lg font-medium mt-2">
            {annonceError || "Cette annonce n'existe pas ou a été supprimée."}
          </h2>
        </div>
        <div className="text-center">
          <Button
            to="/annonces"
            variant="primary"
          >
            Retour aux annonces
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Créer un devis
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Proposez votre offre pour cette demande de transport
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            to={`/annonces/${annonceId}`}
            variant="outline"
          >
            Retour à l'annonce
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
        {/* Informations sur l'annonce */}
        <div className="md:col-span-1">
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Détails de l'annonce</h2>
              <p className="mt-1 text-sm text-gray-500">
                Informations sur la demande de transport
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <TruckIcon className="mr-1 h-5 w-5 text-gray-400" />
                    Type
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                    {annonce.typeTransport || 'Non spécifié'}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPinIcon className="mr-1 h-5 w-5 text-gray-400" />
                    Trajet
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{annonce.villeDepart}</p>
                      </div>
                      <div className="h-px w-4 bg-gray-300 mx-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{annonce.villeArrivee}</p>
                      </div>
                    </div>
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="mr-1 h-5 w-5 text-gray-400" />
                    Date de départ
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(annonce.dateDepart)}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserIcon className="mr-1 h-5 w-5 text-gray-400" />
                    Client
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {annonce.client?.prenom} {annonce.client?.nom}
                  </dd>
                </div>
                {annonce.poids && (
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Poids</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {annonce.poids} kg
                    </dd>
                  </div>
                )}
                {annonce.volume && (
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Volume</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {annonce.volume} m³
                    </dd>
                  </div>
                )}
                {annonce.description && (
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {annonce.description}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Formulaire de devis */}
        <div className="md:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={formik.handleSubmit}>
                <div className="space-y-6">
                  {/* Montant */}
                  <div>
                    <Input
                      id="montant"
                      name="montant"
                      type="number"
                      step="0.01"
                      label="Montant proposé (€)"
                      placeholder="Ex: 250.00"
                      value={formik.values.montant}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.montant && formik.errors.montant}
                      touched={formik.touched.montant}
                      icon={<CurrencyEuroIcon className="h-5 w-5 text-gray-400" />}
                      required
                    />
                  </div>

                  {/* Date de livraison */}
                  <div>
                    <Input
                      id="delaiLivraison"
                      name="delaiLivraison"
                      type="date"
                      label="Date de livraison prévue"
                      value={formik.values.delaiLivraison ? new Date(formik.values.delaiLivraison).toISOString().split('T')[0] : ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.delaiLivraison && formik.errors.delaiLivraison}
                      touched={formik.touched.delaiLivraison}
                      icon={<ClockIcon className="h-5 w-5 text-gray-400" />}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message au client
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Décrivez votre offre, vos conditions, votre expérience..."
                        value={formik.values.message}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Soyez précis et professionnel pour augmenter vos chances d'être sélectionné.
                    </p>
                    {formik.touched.message && formik.errors.message && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.message}</p>
                    )}
                  </div>

                  {/* Conditions générales */}
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="conditions"
                        name="conditions"
                        type="checkbox"
                        className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                        checked={formik.values.conditions}
                        onChange={formik.handleChange}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="conditions" className="font-medium text-gray-700">
                        J'accepte les conditions générales
                      </label>
                      <p className="text-gray-500">
                        En soumettant ce devis, je m'engage à respecter les termes et délais proposés.
                      </p>
                      {formik.touched.conditions && formik.errors.conditions && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.conditions}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-gray-200">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/annonces/${annonceId}`)}
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
                        Envoyer le devis
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Conseils pour un bon devis */}
          <div className="mt-6 bg-blue-50 rounded-lg border border-blue-100 p-4">
            <h3 className="text-lg font-medium text-blue-800">Conseils pour un bon devis</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-blue-700 space-y-1">
              <li>Soyez transparent sur les coûts et les services inclus</li>
              <li>Précisez les délais de livraison réalistes</li>
              <li>Mettez en avant votre expérience et vos qualifications</li>
              <li>Détaillez les mesures de sécurité que vous prendrez pour protéger les biens</li>
              <li>Proposez des options additionnelles si pertinent (emballage, assurance, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDevisPage;