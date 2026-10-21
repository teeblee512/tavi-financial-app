import React from 'react';
import clsx from 'clsx';

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  fullWidth,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-btn transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-green focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';

  const variants = {
    primary: 'bg-action-green text-white hover:bg-primary-green',
    secondary: 'bg-pale-mint text-primary-green hover:bg-mint',
    ghost: 'text-primary-green hover:bg-pale-mint',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-action-green text-action-green hover:bg-pale-mint',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-5 py-3 text-sm min-h-[48px]',
    lg: 'px-6 py-3.5 text-base min-h-[52px]',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon ? (
        leftIcon
      ) : null}
      {children}
      {rightIcon && !loading && rightIcon}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3 text-slate-500 pointer-events-none">{leftAddon}</span>
        )}
        <input
          id={inputId}
          className={clsx(
            'input-field',
            leftAddon && 'pl-10',
            rightAddon && 'pr-10',
            error && 'border-error focus:ring-error focus:border-error',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightAddon && (
          <span className="absolute right-3 text-slate-500">{rightAddon}</span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'input-field appearance-none',
          error && 'border-error',
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, onClick, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };
  return (
    <div
      className={clsx('card', paddings[padding], onClick && 'cursor-pointer hover:shadow-md', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    successful: 'status-success',
    active: 'status-success',
    pending: 'status-pending',
    pending_confirmation: 'status-pending',
    processing: 'status-pending',
    submitted: 'status-pending',
    failed: 'status-failed',
    reversed: 'status-reversed',
    refunded: 'status-reversed',
    draft: 'status-reversed',
  };
  const labels: Record<string, string> = {
    successful: 'Successful',
    active: 'Active',
    pending: 'Pending',
    pending_confirmation: 'Pending',
    processing: 'Processing',
    submitted: 'Submitted',
    failed: 'Failed',
    reversed: 'Reversed',
    refunded: 'Refunded',
    draft: 'Draft',
  };
  return (
    <span className={cls[status] || 'status-reversed'}>
      {labels[status] || status}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} aria-hidden="true" />;
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <div className={clsx('border-t border-border-color', className)} />;
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
      {icon && <div className="text-slate-300 mb-1">{icon}</div>}
      <p className="font-semibold text-slate-700">{title}</p>
      {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ─── Page Header (mobile) ─────────────────────────────────────────────────────
export function PageHeader({
  title,
  onBack,
  rightAction,
}: {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-border-color px-4 h-14 flex items-center gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-icon hover:bg-slate-100 -ml-1"
          aria-label="Go back"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className="flex-1 font-semibold text-base text-midnight-navy truncate">{title}</h1>
      {rightAction && rightAction}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex items-center justify-between mb-3', className)}>
      <h2 className="text-base font-semibold text-midnight-navy">{title}</h2>
      {action && action}
    </div>
  );
}

// ─── Coming Soon Chip ─────────────────────────────────────────────────────────
export function ComingSoonChip() {
  return (
    <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full ml-1">
      Soon
    </span>
  );
}

// ─── Info Banner ──────────────────────────────────────────────────────────────
export function InfoBanner({
  type = 'info',
  message,
  className,
}: {
  type?: 'info' | 'warning' | 'success' | 'error';
  message: string;
  className?: string;
}) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };
  return (
    <div className={clsx('border rounded-card px-4 py-3 text-sm', styles[type], className)}>
      {message}
    </div>
  );
}
