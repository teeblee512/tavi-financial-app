import { useApp } from '../../app/AppContext';
import clsx from 'clsx';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-24 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-card shadow-lg text-sm font-medium animate-slide-up max-w-sm w-full',
            toast.type === 'success' && 'bg-success text-white',
            toast.type === 'error' && 'bg-error text-white',
            toast.type === 'warning' && 'bg-warning text-white',
            toast.type === 'info' && 'bg-midnight-navy text-white',
          )}
          role="status"
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="opacity-75 hover:opacity-100 ml-2"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
