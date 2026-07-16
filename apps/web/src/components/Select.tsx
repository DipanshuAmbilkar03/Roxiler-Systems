import { forwardRef, type SelectHTMLAttributes } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, className = '', id, children, ...rest },
  ref,
) {
  const selectId = id ?? rest.name;
  return (
    <label className="block space-y-1.5" htmlFor={selectId}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        ref={ref}
        id={selectId}
        className={`field-base appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${
          error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'
        } ${className}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </label>
  );
});
