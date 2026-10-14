import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  error?: string;
  label?: string;
  helpText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, label, helpText, options, placeholder, id, className, style, disabled, ...props }, ref) => {
    const inputId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="form-group" style={{ marginBottom: 0 }}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
            {props.required && <span style={{ color: 'var(--color-danger)', marginLeft: '2px' }}> *</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          className={`select${className ? ` ${className}` : ''}`}
          style={{
            appearance: 'none',
            backgroundImage:
              "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
            ...(hasError ? { borderColor: 'var(--color-danger)' } : {}),
            ...style,
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${inputId}-error`} style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-danger)' }} role="alert">
            {error}
          </p>
        )}
        {!error && helpText && (
          <p id={`${inputId}-help`} style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
