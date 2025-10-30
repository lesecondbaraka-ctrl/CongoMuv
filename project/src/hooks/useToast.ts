import { useCallback } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export const useToast = () => {
  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }: ToastOptions) => {
    // Créer un élément de notification
    const toastElement = document.createElement('div');
    toastElement.className = `toast ${variant}`;
    
    // Ajouter le contenu
    const titleElement = document.createElement('div');
    titleElement.className = 'toast-title';
    titleElement.textContent = title;
    
    toastElement.appendChild(titleElement);
    
    if (description) {
      const descElement = document.createElement('div');
      descElement.className = 'toast-description';
      descElement.textContent = description;
      toastElement.appendChild(descElement);
    }
    
    // Ajouter le toast au DOM
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    toastContainer.appendChild(toastElement);
    
    // Supprimer le toast après la durée spécifiée
    setTimeout(() => {
      toastElement.classList.add('fade-out');
      setTimeout(() => {
        toastElement.remove();
      }, 300);
    }, duration);
    
    // Retourner une fonction pour fermer le toast manuellement
    return () => {
      toastElement.remove();
    };
  }, []);
  
  return { toast };
};

// Crée le conteneur de toasts s'il n'existe pas
const createToastContainer = () => {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
};

// Styles CSS pour les toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  #toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .toast {
    padding: 1rem;
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    background-color: white;
    color: #1f2937;
    max-width: 24rem;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
  }
  
  .toast.fade-out {
    opacity: 0;
  }
  
  .toast-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .toast-description {
    font-size: 0.875rem;
    color: #4b5563;
  }
  
  .toast.destructive {
    background-color: #fef2f2;
    color: #b91c1c;
  }
  
  .toast.destructive .toast-description {
    color: #991b1b;
  }
  
  .toast.success {
    background-color: #f0fdf4;
    color: #15803d;
  }
  
  .toast.warning {
    background-color: #fffbeb;
    color: #b45309;
  }
  
  .toast.info {
    background-color: #eff6ff;
    color: #1d4ed8;
  }
`;

document.head.appendChild(toastStyles);

export default useToast;
