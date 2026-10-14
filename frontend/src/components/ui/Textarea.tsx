import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helpText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, label, helpText, id, className, style, disabled, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="form-group" style={{ marginBottom: 0 }}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
            {props.required && <span style={{ color: 'var(--color-danger)', marginLeft: '2px' }}> *</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          className={`textarea${className ? ` ${className}` : ''}`}
          style={{
            ...(hasError ? { borderColor: 'var(--color-danger)' } : {}),
            ...style,
          }}
          {...props}
        />
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

Textarea.displayName = 'Textarea';

export default Textarea;
