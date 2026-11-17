import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-4 rounded-full bg-slate-100 p-4">
        <Icon className="h-8 w-8 text-slate-400" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
