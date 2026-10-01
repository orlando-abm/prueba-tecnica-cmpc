import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export function Input({
  label,
  error,
  startIcon,
  endIcon,
  id,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-text-primary font-sans text-[13px] font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3.5 inset-y-0 flex items-center text-text-secondary pointer-events-none">
            {startIcon}
          </div>
        )}
        <input
          id={id}
          className={`w-full rounded-lg border-[1.5px] bg-surface-light px-3.5 py-2.5 text-sm font-sans text-text-primary placeholder:text-text-secondary-dark outline-none focus:outline-none focus-visible:outline-none transition-colors border-border-light focus:border-accent focus:border-2 ${error ? 'border-error' : ''} ${startIcon ? 'pl-10' : ''} ${endIcon ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3.5 inset-y-0 flex items-center text-text-secondary">
            {endIcon}
          </div>
        )}
      </div>
      {error && <span className="text-error-text font-sans text-xs">{error}</span>}
    </div>
  );
}
