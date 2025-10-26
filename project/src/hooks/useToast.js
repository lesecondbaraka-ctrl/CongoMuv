import { useCallback } from 'react';
import { useToast as useChakraToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

/**
 * Hook personnalisé pour afficher des notifications toast
 * @returns {Object} Fonctions pour afficher différents types de toasts
 */
const useToast = () => {
  const toast = useChakraToast();
  const { t } = useTranslation();

  /**
   * Affiche un toast de succès
   * @param {string|Object} message - Message à afficher ou objet de configuration
   * @param {Object} options - Options supplémentaires pour le toast
   */
  const showSuccess = useCallback((message, options = {}) => {
    const defaultOptions = {
      title: t('common.success'),
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
      ...options,
    };

    if (typeof message === 'string') {
      defaultOptions.description = message;
    } else {
      Object.assign(defaultOptions, message);
    }

    toast(defaultOptions);
  }, [toast, t]);

  /**
   * Affiche un toast d'erreur
   * @param {string|Object} message - Message d'erreur ou objet de configuration
   * @param {Object} options - Options supplémentaires pour le toast
   */
  const showError = useCallback((message, options = {}) => {
    const defaultOptions = {
      title: t('common.error'),
      status: 'error',
      duration: 7000,
      isClosable: true,
      position: 'top-right',
      ...options,
    };

    if (typeof message === 'string') {
      defaultOptions.description = message;
    } else {
      Object.assign(defaultOptions, message);
    }

    toast(defaultOptions);
  }, [toast, t]);

  /**
   * Affiche un toast d'avertissement
   * @param {string|Object} message - Message d'avertissement ou objet de configuration
   * @param {Object} options - Options supplémentaires pour le toast
   */
  const showWarning = useCallback((message, options = {}) => {
    const defaultOptions = {
      title: t('common.warning'),
      status: 'warning',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
      ...options,
    };

    if (typeof message === 'string') {
      defaultOptions.description = message;
    } else {
      Object.assign(defaultOptions, message);
    }

    toast(defaultOptions);
  }, [toast, t]);

  /**
   * Affiche un toast d'information
   * @param {string|Object} message - Message d'information ou objet de configuration
   * @param {Object} options - Options supplémentaires pour le toast
   */
  const showInfo = useCallback((message, options = {}) => {
    const defaultOptions = {
      title: t('common.info'),
      status: 'info',
      duration: 4000,
      isClosable: true,
      position: 'top-right',
      ...options,
    };

    if (typeof message === 'string') {
      defaultOptions.description = message;
    } else {
      Object.assign(defaultOptions, message);
    }

    toast(defaultOptions);
  }, [toast, t]);

  /**
   * Affiche un toast de chargement
   * @param {string|Object} message - Message de chargement ou objet de configuration
   * @param {Object} options - Options supplémentaires pour le toast
   * @returns {string} ID du toast pour le fermer plus tard
   */
  const showLoading = useCallback((message, options = {}) => {
    const defaultOptions = {
      title: t('common.loading'),
      status: 'loading',
      duration: null, // Ne pas fermer automatiquement
      isClosable: false,
      position: 'top-right',
      ...options,
    };

    if (typeof message === 'string') {
      defaultOptions.description = message;
    } else {
      Object.assign(defaultOptions, message);
    }

    return toast(defaultOptions);
  }, [toast, t]);

  /**
   * Ferme un toast spécifique
   * @param {string} toastId - ID du toast à fermer
   */
  const closeToast = useCallback((toastId) => {
    toast.close(toastId);
  }, [toast]);

  /**
   * Ferme tous les toasts
   */
  const closeAllToasts = useCallback(() => {
    toast.closeAll();
  }, [toast]);

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    closeToast,
    closeAllToasts,
  };
};

export default useToast;
