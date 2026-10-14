import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        gap: '0.75rem',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          lineHeight: 1,
          marginBottom: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          color: 'var(--color-text-muted)',
        }}
        aria-hidden="true"
      >
        {icon ?? '📭'}
      </div>
      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '420px' }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
