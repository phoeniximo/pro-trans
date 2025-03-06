import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  PhoneIcon,
  IdentificationIcon 
} from '@heroicons/react/24/outline';

import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Schéma de validation avec Yup
  const validationSchema = Yup.object({
    nom: Yup.string()
      .required('Le nom est obligatoire')
      .min(2, 'Le nom doit comporter au moins 2 caractères')
      .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
    
    prenom: Yup.string()
      .required('Le prénom est obligatoire')
      .min(2, 'Le prénom doit comporter au moins 2 caractères')
      .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),
    
    email: Yup.string()
      .required('L\'email est obligatoire')
      .email('Format d\'email invalide'),
    
    telephone: Yup.string()
      .required('Le numéro de téléphone est obligatoire')
      .matches(
        /^(\+33|0)[1-9](\d{2}){4}$/, 
        'Format de téléphone invalide (ex: 0612345678 ou +33612345678)'
      ),
    
    password: Yup.string()
      .required('Le mot de passe est obligatoire')
      .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    
    passwordConfirm: Yup.string()
      .required('La confirmation du mot de passe est obligatoire')
      .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas'),
    
    role: Yup.string()
      .required('Le rôle est obligatoire')
      .oneOf(['client', 'transporteur'], 'Rôle invalide'),
    
    acceptTerms: Yup.boolean()
      .required('Vous devez accepter les conditions générales')
      .oneOf([true], 'Vous devez accepter les conditions générales')
  });
  
  // Initialisation du formulaire avec Formik
  const formik = useFormik({
    initialValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
      passwordConfirm: '',
      role: 'client',
      acceptTerms: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await register(values);
        toast.success('Inscription réussie ! Bienvenue sur Pro-Trans');
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.message || 'Echec de l\'inscription');
        console.error('Erreur d\'inscription:', error);
      } finally {
        setIsLoading(false);
      }
    }
  });
  
  return (
    <div>
      <h2 className="text-center text-3xl font-extrabold text-gray-900">
        Créer votre compte
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Ou{' '}
        <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
          connectez-vous à votre compte existant
        </Link>
      </p>
      
      <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
        <div className="space-y-4">
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="prenom"
              name="prenom"
              type="text"
              label="Prénom"
              placeholder="Votre prénom"
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
              type="text"
              label="Nom"
              placeholder="Votre nom"
              value={formik.values.nom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nom && formik.errors.nom}
              touched={formik.touched.nom}
              required
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>
          
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
            id="telephone"
            name="telephone"
            type="tel"
            label="Téléphone"
            placeholder="Votre numéro de téléphone"
            value={formik.values.telephone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.telephone && formik.errors.telephone}
            touched={formik.touched.telephone}
            required
            icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
            helperText="Format: 0612345678 ou +33612345678"
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
            helperText="Min. 8 caractères avec au moins 1 majuscule, 1 minuscule et 1 chiffre"
          />
          
          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            label="Confirmer le mot de passe"
            placeholder="Confirmez votre mot de passe"
            value={formik.values.passwordConfirm}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
            touched={formik.touched.passwordConfirm}
            required
            icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          />
          
          {/* Choix du rôle */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Je m'inscris en tant que
              <span className="text-red-500 ml-1">*</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  formik.values.role === 'client'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => formik.setFieldValue('role', 'client')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    id="role-client"
                    value="client"
                    checked={formik.values.role === 'client'}
                    onChange={formik.handleChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  <label 
                    htmlFor="role-client" 
                    className="ml-3 block font-medium cursor-pointer"
                  >
                    Client
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500 ml-7">
                  Je souhaite faire transporter des marchandises
                </p>
              </div>
              
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  formik.values.role === 'transporteur'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => formik.setFieldValue('role', 'transporteur')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    id="role-transporteur"
                    value="transporteur"
                    checked={formik.values.role === 'transporteur'}
                    onChange={formik.handleChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  <label 
                    htmlFor="role-transporteur" 
                    className="ml-3 block font-medium cursor-pointer"
                  >
                    Transporteur
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500 ml-7">
                  Je propose des services de transport
                </p>
              </div>
            </div>
            
            {formik.touched.role && formik.errors.role && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.role}</p>
            )}
          </div>
          
          {/* Conditions générales */}
          <div className="flex items-center mt-4">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formik.values.acceptTerms}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
              J'accepte les{' '}
              <Link to="/cgu" className="font-medium text-teal-600 hover:text-teal-500">
                conditions générales d'utilisation
              </Link>{' '}
              et la{' '}
              <Link to="/politique-confidentialite" className="font-medium text-teal-600 hover:text-teal-500">
                politique de confidentialité
              </Link>
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {formik.touched.acceptTerms && formik.errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.acceptTerms}</p>
          )}
        </div>
        
        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Créer mon compte
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;