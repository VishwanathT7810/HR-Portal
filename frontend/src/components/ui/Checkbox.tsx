import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
  helpText?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helpText, id, className, style, disabled, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            minHeight: '44px',
            padding: '0.25rem 0',
          }}
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
            style={{
              width: '18px',
              height: '18px',
              marginTop: '2px',
              accentColor: 'var(--color-primary)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              ...style,
            }}
            className={className}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                userSelect: 'none',
                flex: 1,
              }}
            >
              {label}
              {props.required && <span style={{ color: 'var(--color-danger)', marginLeft: '2px' }}> *</span>}
            </label>
          )}
        </div>
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

Checkbox.displayName = 'Checkbox';

export default Checkbox;
