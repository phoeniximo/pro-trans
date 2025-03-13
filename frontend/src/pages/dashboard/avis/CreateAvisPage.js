import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { StarIcon, UserIcon, TruckIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../api/client';
import avisService from '../../../services/avisService';
import Button from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatters';

const CreateAvisPage = () => {
  const { userId, annonceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [destinataire, setDestinataire] = useState(null);
  const [annonce, setAnnonce] = useState(null);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Vérification de l'existence d'un avis
  useEffect(() => {
    const checkExistingAvis = async () => {
      try {
        console.log('Vérification si avis existe déjà');
        const response = await avisService.checkAvisExists(userId, annonceId);
        
        if (response.exists) {
          toast.error('Vous avez déjà donné un avis pour cette annonce');
          navigate('/dashboard/avis');
          return;
        }
      } catch (err) {
        console.error('Erreur lors de la vérification d\'avis existant:', err);
        // Continuer malgré l'erreur
      }
    };
    
    checkExistingAvis();
  }, [userId, annonceId, navigate]);

  // Validation du formulaire
  const validationSchema = Yup.object({
    note: Yup.number()
      .required('La note est obligatoire')
      .min(1, 'La note minimale est 1')
      .max(5, 'La note maximale est 5'),
    commentaire: Yup.string()
      .required('Le commentaire est obligatoire')
      .min(10, 'Le commentaire doit comporter au moins 10 caractères')
      .max(500, 'Le commentaire ne doit pas dépasser 500 caractères')
  });

  // Initialisation du formulaire
  const formik = useFormik({
    initialValues: {
      note: 5,
      commentaire: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        const avisData = {
          note: values.note,
          commentaire: values.commentaire,
          destinataireId: userId,
          annonceId: annonceId
        };
        
        console.log('Soumission du formulaire avec données:', avisData);
        
        const result = await avisService.createAvis(avisData);
        
        console.log('Résultat création avis:', result);
        
        toast.success('Votre avis a été publié avec succès');
        
        // Aller directement à la liste avec un délai pour permettre à l'API de se mettre à jour
        setTimeout(() => {
          navigate('/dashboard/avis');
        }, 1000);
      } catch (error) {
        console.error('Erreur lors de la création de l\'avis:', error);
        toast.error(error.message || 'Erreur lors de la publication de l\'avis');
      } finally {
        setLoading(false);
      }
    }
  });

  // Récupération des informations du destinataire et de l'annonce
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Récupérer les détails de l'utilisateur
        const userResponse = await apiClient.get(`/users/profile/${userId}`);
        setDestinataire(userResponse.data.data);
        
        // Récupérer les détails de l'annonce
        if (annonceId) {
          const annonceResponse = await apiClient.get(`/annonces/${annonceId}`);
          setAnnonce(annonceResponse.data.data);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les informations nécessaires');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [userId, annonceId]);

  // Rendu pour le chargement
  if (loadingData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  // Rendu en cas d'erreur
  if (error || !destinataire) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
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
              <h3 className="mt-2 text-lg font-medium text-gray-900">Erreur</h3>
              <p className="mt-1 text-sm text-gray-500">
                {error || "Impossible de charger les informations nécessaires"}
              </p>
              <div className="mt-6">
                <Button
                  to="/dashboard/avis"
                  variant="primary"
                >
                  Retour aux avis
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
            Publier un avis
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Partagez votre expérience avec ce {destinataire.role === 'transporteur' ? 'transporteur' : 'client'}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            to="/dashboard/avis"
            variant="outline"
          >
            Annuler
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
        {/* Informations sur le destinataire */}
        <div className="md:col-span-1">
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">
                {destinataire.role === 'transporteur' ? 'Transporteur' : 'Client'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Informations sur la personne que vous évaluez
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden bg-gray-200">
                    {destinataire.photo ? (
                      <img
                        src={destinataire.photo}
                        alt={`${destinataire.prenom} ${destinataire.nom}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 text-gray-400 m-4" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {destinataire.prenom} {destinataire.nom}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Membre depuis {formatDate(destinataire.createdAt, 'MMMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Détails de l'annonce si disponible */}
          {annonce && (
            <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Détails de l'annonce
                </h2>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Titre</dt>
                      <dd className="mt-1 text-sm text-gray-900">{annonce.titre}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <TruckIcon className="h-4 w-4 mr-1 text-gray-400" />
                        Type
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">
                        {annonce.typeTransport}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                        Trajet
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {annonce.villeDepart} → {annonce.villeArrivee}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(annonce.dateDepart)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Formulaire d'avis */}
        <div className="md:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={formik.handleSubmit}>
                {/* Note */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className="p-1 focus:outline-none"
                        onClick={() => formik.setFieldValue('note', value)}
                      >
                        <StarIcon
                          className={`h-8 w-8 ${
                            formik.values.note >= value
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {formik.values.note} sur 5
                    </span>
                  </div>
                  {formik.touched.note && formik.errors.note && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.note}</p>
                  )}
                </div>

                {/* Commentaire */}
                <div className="mb-6">
                  <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-1">
                    Votre commentaire
                  </label>
                  <textarea
                    id="commentaire"
                    name="commentaire"
                    rows={6}
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Partagez votre expérience..."
                    value={formik.values.commentaire}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {formik.values.commentaire.length}/500 caractères
                  </p>
                  {formik.touched.commentaire && formik.errors.commentaire && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.commentaire}</p>
                  )}
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 -mx-6 -mb-6 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/avis')}
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
                    Publier l'avis
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Conseils pour un bon avis */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-800 mb-3">Conseils pour rédiger un avis utile</h3>
            <ul className="list-disc pl-5 text-blue-700 space-y-2">
              <li>Soyez honnête et objectif dans votre évaluation</li>
              <li>Détaillez les aspects positifs et négatifs de votre expérience</li>
              <li>Mentionnez les éléments spécifiques qui vous ont marqué (ponctualité, communication, état des marchandises à l'arrivée...)</li>
              <li>Evitez les commentaires trop généraux comme "Très bien" ou "Mauvais service"</li>
              <li>Restez respectueux, même en cas d'expérience négative</li>
            </ul>
            <p className="mt-4 text-sm text-blue-800">
              Vos avis aident les autres utilisateurs à prendre des décisions éclairées et permettent aux transporteurs d'améliorer leurs services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAvisPage;