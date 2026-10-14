import { useEmployeeFormContext } from '../modules/employee/context/EmployeeFormContext';
import {
  EmployeeFormState,
  Phase1BasicData,
  Phase2EducationData,
  Phase3EmergencyData,
  Phase4AdditionalData,
  InitialFormStateData,
  SubmissionSuccess,
} from '../modules/employee/types/employee.types';

type PhaseNumber = 1 | 2 | 3 | 4 | 5;

export interface UseEmployeeFormResult {
  currentPhase: PhaseNumber;
  formData: EmployeeFormState;
  isSubmitting: boolean;
  submissionResult: SubmissionSuccess | null;
  fieldErrors: Record<string, string>;
  goToPhase: (phase: PhaseNumber) => void;
  goNext: () => void;
  goBack: () => void;
  setPhaseData: <P extends 1 | 2 | 3 | 4>(
    phase: P,
    data: P extends 1
      ? Partial<Phase1BasicData>
      : P extends 2
      ? Partial<Phase2EducationData>
      : P extends 3
      ? Partial<Phase3EmergencyData>
      : Partial<Phase4AdditionalData>
  ) => void;
  setInitialFormState: (data: InitialFormStateData) => void;
  validateCurrentPhase: () => boolean;
  submit: (token?: string) => Promise<SubmissionSuccess | null>;
}

export function useEmployeeForm(): UseEmployeeFormResult {
  const ctx = useEmployeeFormContext();

  const goNext = () => {
    if (ctx.currentPhase < 5) {
      const ok = ctx.validateCurrentPhase();
      if (ok) {
        ctx.goToPhase((ctx.currentPhase + 1) as PhaseNumber);
      }
    }
  };

  const goBack = () => {
    if (ctx.currentPhase > 1) {
      ctx.goToPhase((ctx.currentPhase - 1) as PhaseNumber);
    }
  };

  return {
    currentPhase: ctx.currentPhase,
    formData: ctx.formData,
    isSubmitting: ctx.isSubmitting,
    submissionResult: ctx.submissionResult,
    fieldErrors: ctx.fieldErrors,
    goToPhase: ctx.goToPhase,
    goNext,
    goBack,
    setPhaseData: ctx.setPhaseData,
    setInitialFormState: ctx.setInitialFormState,
    validateCurrentPhase: ctx.validateCurrentPhase,
    submit: ctx.submit,
  };
}
