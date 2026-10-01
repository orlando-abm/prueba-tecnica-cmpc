import { X, CheckCircle, XCircle } from 'lucide-react';
import { useToastStore } from '@/store/toast.store';

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-72 max-w-sm ${
            t.variant === 'success'
              ? 'bg-success-bg border-success/30 text-success-text'
              : 'bg-error-bg border-error/30 text-error-text'
          }`}
        >
          {t.variant === 'success' ? (
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <XCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <p className="flex-1 text-sm font-sans font-medium">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
