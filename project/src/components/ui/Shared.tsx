// Shared UI primitives (no backend)

export function Loader({ label = 'Chargement...' }: { label?: string }) {
  return (
    <div className="w-full py-14 flex flex-col items-center justify-center text-slate-600">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-3"></div>
      <div className="text-sm">{label}</div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <span className="text-slate-400 text-xl">∅</span>
      </div>
      <div className="text-slate-900 font-semibold">{title}</div>
      {description && <div className="text-slate-600 text-sm mt-1 max-w-md">{description}</div>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">
          {actionLabel}
        </button>
      )}
    </div>
  );
}


