import { useCallback } from 'react';

/**
 * Hook personnalisé pour afficher des notifications toast (version simple sans Chakra UI)
 * @returns {Object} Fonctions pour afficher différents types de toasts
 */
const useToast = () => {
  // Fonction helper pour créer et afficher un toast natif
  const showToast = useCallback((message, type = 'info') => {
    // Créer un élément toast
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;
    toastEl.textContent = message;
    
    // Styles inline pour le toast
    Object.assign(toastEl.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      fontSize: '14px',
      zIndex: '9999',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'slideIn 0.3s ease-out',
      maxWidth: '400px',
      wordWrap: 'break-word'
    });
    
    // Couleurs selon le type
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    toastEl.style.backgroundColor = colors[type] || colors.info;
    
    // Ajouter au DOM
    document.body.appendChild(toastEl);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
      toastEl.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(toastEl);
      }, 300);
    }, 5000);
  }, []);

  /**
   * Affiche un toast de succès
   */
  const showSuccess = useCallback((message) => {
    showToast(message, 'success');
  }, [showToast]);

  /**
   * Affiche un toast d'erreur
   */
  const showError = useCallback((message) => {
    showToast(message, 'error');
  }, [showToast]);

  /**
   * Affiche un toast d'avertissement
   */
  const showWarning = useCallback((message) => {
    showToast(message, 'warning');
  }, [showToast]);

  /**
   * Affiche un toast d'information
   */
  const showInfo = useCallback((message) => {
    showToast(message, 'info');
  }, [showToast]);

  /**
   * Affiche un toast de chargement
   */
  const showLoading = useCallback((message) => {
    showToast(message || 'Chargement...', 'info');
  }, [showToast]);

  /**
   * Ferme un toast spécifique (non implémenté dans cette version simple)
   */
  const closeToast = useCallback(() => {
    // Non implémenté dans la version simple
  }, []);

  /**
   * Ferme tous les toasts (non implémenté dans cette version simple)
   */
  const closeAllToasts = useCallback(() => {
    // Non implémenté dans la version simple
  }, []);

  return {
    toast: showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    closeToast,
    closeAllToasts,
  };
};

// Export nommé ET export par défaut pour compatibilité
export { useToast };
export default useToast;
