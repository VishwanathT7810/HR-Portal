import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

const sizeMap: Record<SpinnerSize, { width: string; border: string }> = {
  sm: { width: '16px', border: '2px' },
  md: { width: '24px', border: '3px' },
  lg: { width: '36px', border: '4px' },
  xl: { width: '48px', border: '5px' },
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'var(--color-primary)',
  className,
  style,
  label,
}) => {
  const sz = sizeMap[size];

  const spinnerEl = (
    <span
      aria-label={label || 'Loading'}
      role="status"
      className={className}
      style={{
        display: 'inline-block',
        width: sz.width,
        height: sz.width,
        border: sz.border,
        borderStyle: 'solid',
        borderColor: `${color}22`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spinner-spin 0.75s linear infinite',
        verticalAlign: 'middle',
        ...style,
      }}
    />
  );

  if (label) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
        }}
      >
        {spinnerEl}
        <span>{label}</span>
        <style>{`
          @keyframes spinner-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {spinnerEl}
      <style>{`
        @keyframes spinner-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Spinner;
