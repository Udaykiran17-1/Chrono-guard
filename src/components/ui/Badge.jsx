const variantStyles = {
  neutral: 'bg-slate-100 text-slate-700',
  indigo: 'bg-indigo-50 text-brand-indigo',
  teal: 'bg-teal-50 text-brand-teal',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
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
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
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
