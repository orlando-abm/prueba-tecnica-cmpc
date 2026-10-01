type Variant = 'success' | 'error' | 'warning' | 'info' | 'purple';

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<Variant, string> = {
  success: 'bg-success-bg text-success-text',
  error: 'bg-error-bg text-error-text',
  warning: 'bg-warning-bg text-warning-text',
  info: 'bg-info-bg text-info-text',
  purple: 'bg-purple-bg text-purple-text',
};

export function Badge({ variant = 'info', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold font-sans ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
