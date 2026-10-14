import React from 'react';

export interface Step {
  number: number;
  label: string;
}

export const EMPLOYEE_FORM_STEPS: Step[] = [
  { number: 1, label: 'Basic & Contact' },
  { number: 2, label: 'Education & Employment' },
  { number: 3, label: 'Emergency & Personal' },
  { number: 4, label: 'Additional Info' },
  { number: 5, label: 'Review Submit' },
];

interface ProgressStepperProps {
  currentPhase: number;
}

export function ProgressStepper({ currentPhase }: ProgressStepperProps) {
  return (
    <nav className="ds-stepper" aria-label="Form progress">
      {EMPLOYEE_FORM_STEPS.map((step) => {
        const isCompleted = step.number < currentPhase;
        const isActive = step.number === currentPhase;
        const stateClass = isActive
          ? 'ds-step-active'
          : isCompleted
          ? 'ds-step-completed'
          : '';

        return (
          <div
            key={step.number}
            className={`ds-step ${stateClass}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <div className="ds-step-circle" aria-hidden="true">
              {isCompleted ? '✓' : step.number}
            </div>
            <div className="ds-step-label ds-flex-1 ds-min-w-0">
              <span className="ds-step-number-text">Step {step.number}</span>
              <span className="ds-step-title">{step.label}</span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
