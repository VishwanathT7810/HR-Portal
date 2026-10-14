import React from 'react';

export interface StepperStep {
  label: string;
  description?: string;
}

export interface ProgressStepperProps {
  steps: StepperStep[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  className,
  style,
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: isHorizontal ? 'flex-start' : 'stretch',
        width: '100%',
        ...style,
      }}
      role="navigation"
      aria-label="Progress"
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;
        const stepStatus = isCompleted ? 'completed' : isActive ? 'current' : 'upcoming';

        const stepColor = isCompleted
          ? 'var(--color-success)'
          : isActive
          ? 'var(--color-primary)'
          : 'var(--color-text-muted)';

        const bgColor = isCompleted
          ? 'var(--color-success)'
          : isActive
          ? 'var(--color-primary)'
          : '#e2e8f0';

        const textColor = isCompleted || isActive ? 'var(--color-text)' : 'var(--color-text-muted)';

        return (
          <React.Fragment key={index}>
            <div
              style={{
                display: 'flex',
                flexDirection: isHorizontal ? 'column' : 'row',
                alignItems: isHorizontal ? 'center' : 'flex-start',
                gap: isHorizontal ? '0.5rem' : '0.75rem',
                flex: isHorizontal ? 1 : 'none',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  borderRadius: '50%',
                  backgroundColor: bgColor,
                  color: isCompleted || isActive ? '#fff' : 'var(--color-text-muted)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: `2px solid ${stepColor}`,
                  zIndex: 1,
                  transition: 'all 200ms ease',
                  flexShrink: 0,
                }}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${index + 1} of ${steps.length}: ${step.label} (${stepStatus})`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <div
                style={{
                  textAlign: isHorizontal ? 'center' : 'left',
                  flex: isHorizontal ? 1 : 'none',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: textColor,
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      marginTop: '2px',
                      lineHeight: 1.3,
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {!isLast && (
              <div
                style={{
                  flex: isHorizontal ? 1 : 'none',
                  alignSelf: isHorizontal ? 'flex-start' : 'stretch',
                  height: isHorizontal ? '2px' : 'auto',
                  width: isHorizontal ? 'auto' : '2px',
                  backgroundColor: isCompleted ? 'var(--color-success)' : '#e2e8f0',
                  marginTop: isHorizontal ? '17px' : '0.5rem',
                  marginBottom: isHorizontal ? 0 : '0.5rem',
                  marginLeft: isHorizontal ? '0.25rem' : '17px',
                  marginRight: isHorizontal ? '0.25rem' : 0,
                  minHeight: isHorizontal ? '2px' : '24px',
                  transition: 'background-color 200ms ease',
                }}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressStepper;
