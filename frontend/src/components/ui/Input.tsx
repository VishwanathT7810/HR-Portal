import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string;
  label?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, helpText, leftIcon, rightIcon, id, className, style, disabled, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="form-group" style={{ marginBottom: 0 }}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
            {props.required && <span style={{ color: 'var(--color-danger)', marginLeft: '2px' }}> *</span>}
          </label>
        )}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
            className={`input${className ? ` ${className}` : ''}`}
            style={{
              ...(leftIcon ? { paddingLeft: '2.5rem' } : {}),
              ...(rightIcon ? { paddingRight: '2.5rem' } : {}),
              ...(hasError ? { borderColor: 'var(--color-danger)' } : {}),
              ...style,
            }}
            {...props}
          />
          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-danger)' }}
            role="alert"
          >
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

Input.displayName = 'Input';

export default Input;
