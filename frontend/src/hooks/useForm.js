import { useState } from 'react';

/**
 * Hook personnalisé pour gérer les formulaires
 * @param {Object} initialValues - Valeurs initiales du formulaire
 * @param {Function} onSubmit - Fonction à exécuter lors de la soumission du formulaire
 * @param {Function} validate - Fonction de validation (optionnelle)
 * @returns {Object} - Fonctions et états pour gérer le formulaire
 */
export const useForm = (initialValues, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // Gérer les changements de champs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Pour les cases à cocher, utiliser la propriété 'checked' au lieu de 'value'
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Si la validation est fournie, valider le champ modifié
    if (validate) {
      const validationErrors = validate({ ...values, [name]: value });
      setErrors({
        ...errors,
        [name]: validationErrors[name],
      });
    }
  };

  // Marquer un champ comme touché lors du blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    
    // Valider le champ au blur
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valider tous les champs avant soumission
    let validationErrors = {};
    if (validate) {
      validationErrors = validate(values);
      setErrors(validationErrors);
    }
    
    // Si pas d'erreurs de validation ou pas de validation
    if (Object.keys(validationErrors).length === 0 || !validate) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Erreur lors de la soumission du formulaire:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  // Définir les valeurs du formulaire
  const setFormValues = (newValues) => {
    setValues({
      ...values,
      ...newValues,
    });
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormValues,
  };
};