const variantStyles = {
  neutral: 'border border-slate-200 bg-slate-100/80 text-slate-700',
  indigo: 'border border-indigo-100 bg-indigo-50 text-brand-indigo',
  teal: 'border border-teal-100 bg-teal-50 text-brand-teal',
  amber: 'border border-amber-100 bg-amber-50 text-amber-700',
  red: 'border border-red-100 bg-red-50 text-red-700',
};

export default function Badge({
  children,
  variant = 'neutral',
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
    </span>
  );
}
