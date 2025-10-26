import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '../components/ui/use-toast';

/**
 * Hook personnalisé pour gérer les appels API
 * @param {Function} apiFunction - Fonction d'appel API
 * @param {Object} options - Options de configuration
 * @param {boolean} options.executeOnMount - Exécuter l'appel API au montage
 * @param {Array} options.dependencies - Dépendances pour l'exécution automatique
 * @param {Function} options.onSuccess - Callback en cas de succès
 * @param {Function} options.onError - Callback en cas d'erreur
 * @returns {Object} État et fonctions pour gérer l'appel API
 */
const useApi = (apiFunction, {
  executeOnMount = false,
  dependencies = [],
  onSuccess = null,
  onError = null,
  successMessage = null,
  errorMessage = null,
  showSuccessToast = true,
  showErrorToast = true,
} = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(executeOnMount);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const isMounted = useRef(true);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Exécution automatique au montage ou lorsque les dépendances changent
  useEffect(() => {
    if (executeOnMount) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeOnMount, ...dependencies]);

  /**
   * Exécute l'appel API
   * @param {*} params - Paramètres à passer à la fonction API
   * @returns {Promise} Promesse résolue avec les données ou l'erreur
   */
  const execute = useCallback(async (params) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setStatus('loading');
    setError(null);

    try {
      const response = await apiFunction(params);
      
      if (!isMounted.current) return;
      
      setData(response);
      setStatus('success');
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess(response);
      }
      
      // Afficher un toast de succès si demandé
      if (successMessage && showSuccessToast) {
        toast({
          title: 'Succès',
          description: successMessage,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      return response;
    } catch (err) {
      if (!isMounted.current) return;
      
      console.error('Erreur API:', err);
      const errorMessage = err.message || 'Une erreur est survenue';
      setError(errorMessage);
      setStatus('error');
      
      // Appeler le callback d'erreur si fourni
      if (onError) {
        onError(err);
      }
      
      // Afficher un toast d'erreur si demandé
      if (showErrorToast) {
        const message = errorMessage || err.message || 'Une erreur est survenue';
        toast({
          title: 'Erreur',
          description: message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Propager l'erreur pour permettre une gestion supplémentaire
      throw err;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [apiFunction, isLoading, onSuccess, onError, successMessage, showSuccessToast, showErrorToast]);

  /**
   * Réinitialise l'état de l'API
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setStatus('idle');
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    status,
    execute,
    reset,
    isIdle: status === 'idle',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
};

export default useApi;
