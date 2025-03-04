import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Récupération de l'URL de redirection (si présente)
  const from = location.state?.from || '/dashboard';
  
  // Schéma de validation avec Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'email est obligatoire'),
    password: Yup.string()
      .required('Le mot de passe est obligatoire')
  });
  
  // Initialisation du formulaire avec Formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await login(values);
        toast.success('Connexion réussie');
        navigate(from, { replace: true });
      } catch (error) {
        toast.error(error.message || 'Échec de la connexion');
        console.error('Erreur de connexion:', error);
      } finally {
        setIsLoading(false);
      }
    }
  });
  
  return (
    <div>
      <h2 className="text-center text-3xl font-extrabold text-gray-900">
        Connexion à votre compte
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Ou{' '}
        <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
          créez un compte gratuitement
        </Link>
      </p>
      
      <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
        <div className="space-y-4">
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
          
          <Input
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            placeholder="Votre mot de passe"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
            touched={formik.touched.password}
            required
            icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Se souvenir de moi
            </label>
          </div>
          
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-teal-600 hover:text-teal-500">
              Mot de passe oublié?
            </Link>
          </div>
        </div>
        
        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Se connecter
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;