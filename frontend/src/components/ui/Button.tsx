import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className,
      style,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: { minHeight: '36px', padding: '0 0.75rem', fontSize: '0.8125rem' },
      md: { minHeight: '44px', padding: '0 1rem', fontSize: '0.875rem' },
      lg: { minHeight: '52px', padding: '0 1.25rem', fontSize: '1rem' },
    };

    const baseClasses = `btn btn-${variant}${className ? ` ${className}` : ''}`;
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={baseClasses}
        style={{ ...sizeStyles[size], opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', ...style }}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              animation: 'btn-spin 0.75s linear infinite',
              display: 'inline-block',
              marginRight: rightIcon || children ? '0.5rem' : 0,
            }}
          />
        )}
        {!loading && leftIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!loading && rightIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{rightIcon}</span>}
        {loading && !children && !leftIcon && !rightIcon ? null : null}
        <style>{`
          @keyframes btn-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
