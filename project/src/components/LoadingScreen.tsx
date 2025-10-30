export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="text-center">
        {/* Logo ou nom de l'application */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">CongoMuv</h1>
          <p className="text-slate-600">Chargement de l'application...</p>
        </div>
        
        {/* Spinner animé */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-700 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 animate-pulse"></div>
          </div>
        </div>
        
        {/* Message de patience */}
        <p className="mt-6 text-sm text-slate-500">
          Veuillez patienter quelques instants...
        </p>
      </div>
    </div>
  );
}
