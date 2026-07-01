import { forwardRef, type InputHTMLAttributes } from 'react';

// ─── Props ───────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

// ─── Component ───────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-xl border bg-white px-3.5 py-2.5
            text-sm text-neutral-900 placeholder-neutral-400
            transition-colors duration-150 ease-in-out
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-neutral-300 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100'
            }
            outline-none
            disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500
            ${className}
          `.trim()}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
