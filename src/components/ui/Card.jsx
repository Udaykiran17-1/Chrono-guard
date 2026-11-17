export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={[
        'rounded-card border border-white/80 bg-card/95 shadow-card backdrop-blur-sm',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
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
      className={['border-b border-card-border/80 px-6 py-4', className]
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
        'border-t border-card-border/80 px-6 py-3 bg-indigo-50/30',
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
