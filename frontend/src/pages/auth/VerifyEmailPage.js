// VerifyEmailPage.js - Version complète
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setVerificationStatus('error');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await authService.verifyEmail(token);
        setVerificationStatus('success');
        setEmail(response.data.email || '');
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'email:', error);
        setVerificationStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyEmailToken();
  }, [token]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Adresse e-mail non disponible');
      return;
    }

    try {
      setResendLoading(true);
      await authService.resendVerificationEmail(email);
      toast.success('Email de vérification envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      toast.error('Erreur lors de l\'envoi de l\'email de vérification');
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
            Vérification de votre adresse email en cours...
          </h2>
        </div>
      </div>
    );
  }

  const renderSuccessContent = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <CheckCircleIcon className="h-6 w-6 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Email vérifié avec succès!
      </h2>
      
      <p className="text-gray-600 mb-6">
        Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter à votre compte.
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

  const renderErrorContent = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
        <XCircleIcon className="h-6 w-6 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Échec de la vérification
      </h2>
      
      <p className="text-gray-600 mb-6">
        Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien de vérification.
      </p>
      
      {email ? (
        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            onClick={handleResendVerification}
            isLoading={resendLoading}
            disabled={resendLoading}
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Renvoyer le lien de vérification
          </Button>
        </div>
      ) : (
        <Link to="/login">
          <Button variant="primary" fullWidth>
            Retour à la connexion
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {verificationStatus === 'success' ? renderSuccessContent() : renderErrorContent()}
      </div>
    </div>
  );
};

export default VerifyEmailPage;