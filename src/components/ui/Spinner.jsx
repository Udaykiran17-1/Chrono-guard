import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div className={['flex items-center justify-center', className].join(' ')} role="status">
      <Loader2
        className={['animate-spin text-brand-indigo', sizeClasses[size]].join(' ')}
        aria-hidden="true"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
