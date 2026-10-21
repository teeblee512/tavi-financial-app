import { useApp } from '../../app/AppContext';
import clsx from 'clsx';

export function DemoBanner() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-1 text-xs font-semibold tracking-wide"
      role="banner"
      aria-label="Demo mode indicator"
    >
      🔒 DEMO MODE — All data is simulated. No real money is involved.
    </div>
  );
}

export function DemoChip({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full',
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
      DEMO
    </span>
  );
}
