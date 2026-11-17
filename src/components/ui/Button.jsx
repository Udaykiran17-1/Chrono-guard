import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-gradient-to-r from-brand-indigo to-brand-indigo-light text-white shadow-[0_6px_16px_rgba(79,53,201,0.24)] hover:shadow-[0_10px_22px_rgba(79,53,201,0.30)] hover:brightness-105 focus-visible:ring-brand-indigo',
  secondary:
    'bg-brand-cobalt text-white hover:bg-brand-cobalt-dark focus-visible:ring-brand-cobalt',
  outline:
    'border border-card-border text-slate-700 bg-white/80 hover:border-indigo-200 hover:bg-indigo-50/50 focus-visible:ring-brand-indigo',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-brand-indigo',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
          'transition-all duration-200 ease-out active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
