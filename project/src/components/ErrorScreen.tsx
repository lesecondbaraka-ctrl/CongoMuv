import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icône d'erreur */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <FaExclamationTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        {/* Titre */}
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Oups ! Une erreur est survenue
        </h2>
        
        {/* Message d'erreur */}
        <p className="text-slate-600 mb-6">
          {message || "Impossible de se connecter au serveur. Veuillez vérifier que le backend est démarré."}
        </p>
        
        {/* Détails techniques */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-slate-700 font-semibold mb-2">Vérifications :</p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>✓ Le backend est-il démarré sur le port 3002 ?</li>
            <li>✓ La base de données est-elle accessible ?</li>
            <li>✓ Les variables d'environnement sont-elles configurées ?</li>
          </ul>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaRedo className="w-4 h-4" />
              Réessayer
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Recharger la page
          </button>
        </div>
        
        {/* Lien d'aide */}
        <p className="mt-6 text-xs text-slate-500">
          Si le problème persiste, contactez l'administrateur système
        </p>
      </div>
    </div>
  );
}
