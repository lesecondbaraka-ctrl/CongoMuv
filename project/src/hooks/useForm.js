import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer les formulaires avec validation
 * @param {Object} initialValues - Valeurs initiales du formulaire
 * @param {Function} validate - Fonction de validation des champs
 * @param {Function} onSubmit - Fonction appelée à la soumission du formulaire
 * @returns {Object} État et fonctions pour gérer le formulaire
 */
const useForm = (initialValues = {}, validate, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isValid, setIsValid] = useState(false);

  // Vérifie si le formulaire est valide
  const validateForm = useCallback(() => {
    if (typeof validate === 'function') {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      const formIsValid = Object.keys(validationErrors).length === 0;
      setIsValid(formIsValid);
      return formIsValid;
    }
    return true;
  }, [validate, values]);

  // Gestionnaire de changement de valeur d'un champ
  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Gestion des différents types de champs
    let fieldValue = value;
    if (type === 'checkbox') {
      fieldValue = checked;
    } else if (type === 'file') {
      fieldValue = files[0];
    } else if (type === 'number') {
      fieldValue = value === '' ? '' : Number(value);
    }

    setValues(prevValues => ({
      ...prevValues,
      [name]: fieldValue
    }));

    // Validation en temps réel après la mise à jour de l'état
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Gestionnaire de changement pour les champs personnalisés (Select, DatePicker, etc.)
  const handleCustomChange = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));

    // Effacer l'erreur du champ s'il y en a une
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
  }, [initialValues]);

  // Soumettre le formulaire
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    const formIsValid = validateForm();
    
    if (formIsValid && typeof onSubmit === 'function') {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Erreur lors de la soumission du formulaire:', error);
        setSubmitError(error.message || 'Une erreur est survenue lors de la soumission du formulaire');
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [onSubmit, validateForm, values]);

  // Mettre à jour les valeurs du formulaire (utile pour la modification)
  const setFormValues = useCallback((newValues) => {
    setValues(prevValues => ({
      ...prevValues,
      ...newValues
    }));
  }, []);

  // Gestion des erreurs de formulaire
  const setFieldError = useCallback((field, message) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [field]: message
    }));
  }, []);

  // Réinitialiser les erreurs
  const clearErrors = useCallback(() => {
    setErrors({});
    setSubmitError(null);
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    isValid,
    handleChange,
    handleCustomChange,
    handleSubmit,
    resetForm,
    setFormValues,
    setFieldError,
    clearErrors,
    setErrors,
    setValues
  };
};

export default useForm;
