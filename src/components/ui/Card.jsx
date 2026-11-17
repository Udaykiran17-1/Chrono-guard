export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={[
        'rounded-card border border-card-border bg-card shadow-card',
        hover && 'transition-shadow duration-200 hover:shadow-card-hover',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={['border-b border-card-border px-6 py-4', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={['px-6 py-4', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={[
        'border-t border-card-border px-6 py-3 bg-slate-50/50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
