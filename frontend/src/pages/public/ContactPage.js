import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import apiClient from '../../api/client';

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sch�ma de validation
  const validationSchema = Yup.object({
    nom: Yup.string()
      .required('Votre nom est requis')
      .min(2, 'Le nom doit comporter au moins 2 caract�res')
      .max(50, 'Le nom ne doit pas d�passer 50 caract�res'),
    email: Yup.string()
      .required('Votre email est requis')
      .email('Format d\'email invalide'),
    sujet: Yup.string()
      .required('Le sujet est requis')
      .min(5, 'Le sujet doit comporter au moins 5 caract�res')
      .max(100, 'Le sujet ne doit pas d�passer 100 caract�res'),
    message: Yup.string()
      .required('Votre message est requis')
      .min(20, 'Le message doit comporter au moins 20 caract�res'),
    telephone: Yup.string()
      .matches(/^((\+)33|0)[1-9](\d{2}){4}$/, 'Format de t�l�phone invalide (ex: 0612345678 ou +33612345678)')
      .notRequired(),
    politique: Yup.boolean()
      .oneOf([true], 'Vous devez accepter la politique de confidentialit�')
      .required('Vous devez accepter la politique de confidentialit�')
  });

  const formik = useFormik({
    initialValues: {
      nom: '',
      email: '',
      telephone: '',
      sujet: '',
      message: '',
      politique: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // Appel API pour envoyer le message de contact
        await apiClient.post('/contact', values);
        
        setSubmitSuccess(true);
        toast.success('Votre message a �t� envoy� avec succ�s !');
        
        // R�initialiser le formulaire
        formik.resetForm();
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message :', error);
        toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Contactez-nous
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Notre �quipe est � votre disposition pour r�pondre � toutes vos questions
          </p>
        </div>

        <div className="mt-16 lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Informations de contact */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nos coordonn�es</h2>
            <p className="mt-3 text-lg text-gray-500">
              N'h�sitez pas � nous contacter par t�l�phone, email ou en remplissant le formulaire.
            </p>
            
            <div className="mt-9">
              <div className="flex">
                <div className="flex-shrink-0">
                  <PhoneIcon className="h-6 w-6 text-teal-600" aria-hidden="true" />
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <p>01 23 45 67 89</p>
                  <p className="mt-1">Du lundi au vendredi, 9h - 18h</p>
                </div>
              </div>
              
              <div className="mt-6 flex">
                <div className="flex-shrink-0">
                  <EnvelopeIcon className="h-6 w-6 text-teal-600" aria-hidden="true" />
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <p>contact@pro-trans.fr</p>
                  <p className="mt-1">R�ponse sous 24h ouvr�es</p>
                </div>
              </div>
              
              <div className="mt-6 flex">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-teal-600" aria-hidden="true" />
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <p>123 Avenue des Transports</p>
                  <p>75001 Paris, France</p>
                </div>
              </div>
            </div>
            
            {/* Liens vers les r�seaux sociaux */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Suivez-nous
              </h3>
              <div className="mt-4 flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="mt-12 lg:mt-0 lg:col-span-2">
            <div className="bg-white shadow-lg rounded-lg p-8">
              {submitSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-medium text-gray-900 mb-2">Message envoy� !</h2>
                  <p className="text-gray-600 mb-6">
                    Merci de nous avoir contact�s. Notre �quipe vous r�pondra dans les plus brefs d�lais.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitSuccess(false)}
                  >
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 gap-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Input
                      id="nom"
                      name="nom"
                      type="text"
                      label="Nom complet"
                      placeholder="Votre nom et pr�nom"
                      value={formik.values.nom}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.nom && formik.errors.nom}
                      touched={formik.touched.nom}
                      required
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      label="Email"
                      placeholder="Votre adresse email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && formik.errors.email}
                      touched={formik.touched.email}
                      required
                      icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      label="T�l�phone"
                      placeholder="Votre num�ro de t�l�phone (facultatif)"
                      value={formik.values.telephone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.telephone && formik.errors.telephone}
                      touched={formik.touched.telephone}
                      icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
                      helperText="Format: 0612345678 ou +33612345678"
                    />
                    <Input
                      id="sujet"
                      name="sujet"
                      type="text"
                      label="Sujet"
                      placeholder="Objet de votre message"
                      value={formik.values.sujet}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.sujet && formik.errors.sujet}
                      touched={formik.touched.sujet}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        className="py-3 px-4 block w-full shadow-sm focus:ring-teal-500 focus:border-teal-500 border border-gray-300 rounded-md"
                        placeholder="D�taillez votre demande..."
                        value={formik.values.message}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                      />
                      {formik.touched.message && formik.errors.message && (
                        <p className="mt-2 text-sm text-red-600">
                          {formik.errors.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="politique"
                        name="politique"
                        type="checkbox"
                        className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                        checked={formik.values.politique}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="politique" className="font-medium text-gray-700">
                        J'accepte la politique de confidentialit� <span className="text-red-500">*</span>
                      </label>
                      <p className="text-gray-500">
                        En soumettant ce formulaire, j'accepte que mes donn�es soient trait�es conform�ment � la{' '}
                        <a href="/politique-confidentialite" className="font-medium text-teal-600 hover:text-teal-500">
                          politique de confidentialit�
                        </a>
                        .
                      </p>
                      {formik.touched.politique && formik.errors.politique && (
                        <p className="mt-2 text-sm text-red-600">
                          {formik.errors.politique}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                      isLoading={isSubmitting}
                      disabled={isSubmitting || !formik.isValid}
                    >
                      Envoyer le message
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Carte */}
        <div className="mt-16 bg-gray-100 rounded-lg overflow-hidden">
          <div className="h-96 relative">
            <iframe
              title="Carte de localisation"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.142047033236!2d2.3354330160472316!3d48.87456857928921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e38f817b573%3A0x48d69c30470e7aeb!2sOp%C3%A9ra%20Garnier!5e0!3m2!1sfr!2sfr!4v1567000795195!5m2!1sfr!2sfr"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Section FAQ */}
        <div className="mt-16 bg-teal-50 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10 sm:pb-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-teal-900">
                Questions fr�quentes
              </h3>
              <p className="mt-2 text-base text-teal-700">
                Consultez notre FAQ pour obtenir des r�ponses rapides � vos questions
              </p>
              <div className="mt-6">
                <Button to="/faq" variant="primary">
                  Voir la FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;