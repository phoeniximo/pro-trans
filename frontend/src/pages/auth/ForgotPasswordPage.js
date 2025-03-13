import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

import authService from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Schéma de validation
  const validationSchema = Yup.object({
    email: Yup.string()
      .required('L\'email est obligatoire')
      .email('Format d\'email invalide')
  });
  
  // Initialisation du formulaire
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await authService.forgotPassword(values.email);
        setEmailSent(true);
        toast.success('Instructions envoyées. Veuillez vérifier votre boîte de réception.');
      } catch (error) {
        toast.error(error.message || 'Échec de l\'envoi. Veuillez réessayer.');
        console.error('Erreur lors de la demande de réinitialisation:', error);
      } finally {
        setIsLoading(false);
      }
    }
  });
  
  // Rendu du formulaire de demande
  const renderRequestForm = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Mot de passe oublié
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={formik.handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          label="Adresse email"
          placeholder="Votre adresse email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && formik.errors.email}
          touched={formik.touched.email}
          required
          icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
        />
        
        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Envoyer les instructions
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center text-sm text-teal-600 hover:text-teal-500">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour à la connexion
        </Link>
      </div>
    </>
  );
  
  // Rendu de la confirmation d'envoi
  const renderConfirmation = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Vérifiez votre boîte de réception
      </h2>
      
      <p className="text-gray-600 mb-6">
        Nous avons envoyé un email à <span className="font-medium">{formik.values.email}</span> avec les instructions pour réinitialiser votre mot de passe.
      </p>
      
      <p className="text-sm text-gray-500 mb-8">
        Si vous ne recevez pas l'email dans quelques minutes, vérifiez votre dossier de spam ou de promotions.
      </p>
      
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => {
            formik.resetForm();
            setEmailSent(false);
          }}
        >
          Essayer une autre adresse email
        </Button>
        
        <Link to="/login">
          <Button
            type="button"
            variant="primary"
            fullWidth
          >
            Retour à la connexion
          </Button>
        </Link>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {emailSent ? renderConfirmation() : renderRequestForm()}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;