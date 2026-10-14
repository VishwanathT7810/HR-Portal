import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, style, header, footer }) => {
  return (
    <div
      className={`card${className ? ` ${className}` : ''}`}
      style={{ padding: 0, overflow: 'hidden', ...style }}
    >
      {header && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          {header}
        </div>
      )}
      <div style={{ padding: '1.25rem' }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
