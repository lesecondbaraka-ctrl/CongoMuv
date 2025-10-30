// Fonctions utilitaires pour le module passager
export const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m > 0 ? ' ' + m + 'min' : ''}`;
};
