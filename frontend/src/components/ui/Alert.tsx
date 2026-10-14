import React from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
  title?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
  info: {
    bg: '#dbeafe',
    border: '#93c5fd',
    text: '#1e40af',
    icon: 'ℹ️',
  },
  success: {
    bg: '#dcfce7',
    border: '#86efac',
    text: '#166534',
    icon: '✅',
  },
  warning: {
    bg: '#fef3c7',
    border: '#fcd34d',
    text: '#92400e',
    icon: '⚠️',
  },
  error: {
    bg: '#fee2e2',
    border: '#fca5a5',
    text: '#991b1b',
    icon: '❌',
  },
};

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  className,
  style,
  onClose,
  title,
}) => {
  const vs = variantStyles[variant];

  return (
    <div
      role="alert"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        backgroundColor: vs.bg,
        border: '1px solid',
        borderColor: vs.border,
        borderRadius: 'var(--radius-md)',
        color: vs.text,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        ...style,
      }}
    >
      <span style={{ fontSize: '1.1rem', lineHeight: 1.25, flexShrink: 0 }} aria-hidden="true">
        {vs.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>{title}</div>
        )}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alert"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            fontSize: '1rem',
            padding: '0.125rem',
            minWidth: '32px',
            minHeight: '32px',
            borderRadius: '0.375rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
