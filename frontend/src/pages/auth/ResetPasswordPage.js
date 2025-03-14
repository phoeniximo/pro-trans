// ResetPasswordPage.js - Version complète adaptée au marché marocain
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { LockClosedIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import authService from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [tokenStatus, setTokenStatus] = useState('pending'); // pending, valid, invalid
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenStatus('invalid');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await authService.verifyResetToken(token);
        setTokenStatus('valid');
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        setTokenStatus('invalid');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Schéma de validation
  const validationSchema = Yup.object({
    password: Yup.string()
      .required('Le mot de passe est obligatoire')
      .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    confirmPassword: Yup.string()
      .required('La confirmation du mot de passe est obligatoire')
      .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas')
  });

  // Initialisation du formulaire
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitLoading(true);
        await authService.resetPassword(token, values.password);
        setResetSuccess(true);
        toast.success('Votre mot de passe a été réinitialisé avec succès');
      } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        toast.error('Échec de la réinitialisation du mot de passe');
      } finally {
        setSubmitLoading(false);
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
            Vérification de votre lien de réinitialisation...
          </h2>
        </div>
      </div>
    );
  }

  const renderInvalidToken = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
        <XCircleIcon className="h-6 w-6 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Lien de réinitialisation invalide
      </h2>
      
      <p className="text-gray-600 mb-6">
        Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien de réinitialisation.
      </p>
      
      <Link to="/forgot-password">
        <Button variant="primary" fullWidth>
          Demander un nouveau lien
        </Button>
      </Link>
    </div>
  );

  const renderResetSuccess = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <CheckCircleIcon className="h-6 w-6 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Mot de passe réinitialisé
      </h2>
      
      <p className="text-gray-600 mb-6">
        Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
      </p>
      
      <Button
        variant="primary"
        fullWidth
        onClick={() => navigate('/login')}
      >
        Se connecter
      </Button>
    </div>
  );

  const renderResetForm = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Réinitialiser votre mot de passe
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Veuillez entrer votre nouveau mot de passe.
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={formik.handleSubmit}>
        <Input
          id="password"
          name="password"
          type="password"
          label="Nouveau mot de passe"
          placeholder="Votre nouveau mot de passe"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && formik.errors.password}
          touched={formik.touched.password}
          required
          icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          helperText="Min. 8 caractères avec au moins 1 majuscule, 1 minuscule et 1 chiffre"
        />
        
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmer le mot de passe"
          placeholder="Confirmez votre nouveau mot de passe"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && formik.errors.confirmPassword}
          touched={formik.touched.confirmPassword}
          required
          icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
        />
        
        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={submitLoading}
            disabled={submitLoading}
          >
            Réinitialiser le mot de passe
          </Button>
        </div>
      </form>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {tokenStatus === 'invalid' ? renderInvalidToken() :
         resetSuccess ? renderResetSuccess() : 
         renderResetForm()}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
