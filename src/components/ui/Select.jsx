import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  (
    {
      label,
      id,
      name,
      options = [],
      placeholder = 'Select an option',
      helperText,
      error,
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    const selectId = id || name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            className={[
              'w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-card-border focus:border-brand-indigo focus:ring-brand-indigo',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((opt) => {
              const value = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="mt-1 text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
