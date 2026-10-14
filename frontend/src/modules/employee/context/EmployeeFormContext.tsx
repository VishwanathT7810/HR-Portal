import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  ReactNode,
} from 'react';
import {
  EmployeeFormState,
  initialEmployeeFormState,
  Phase1BasicData,
  Phase2EducationData,
  Phase3EmergencyData,
  Phase4AdditionalData,
  InitialFormStateData,
  CombinedFormPayload,
  SubmissionSuccess,
} from '../types/employee.types';
import {
  phase1Schema,
  phase2Schema,
  phase3Schema,
  phase4Schema,
} from '../validation/phaseValidators';
import { employeeApi } from '../services/employeeApi';
import { SafeParseReturnType } from 'zod';

type PhaseNumber = 1 | 2 | 3 | 4 | 5;

type Action =
  | { type: 'SET_CURRENT_PHASE'; payload: PhaseNumber }
  | { type: 'SET_PHASE_DATA'; payload: { phase: 1; data: Partial<Phase1BasicData> } }
  | { type: 'SET_PHASE_DATA'; payload: { phase: 2; data: Partial<Phase2EducationData> } }
  | { type: 'SET_PHASE_DATA'; payload: { phase: 3; data: Partial<Phase3EmergencyData> } }
  | { type: 'SET_PHASE_DATA'; payload: { phase: 4; data: Partial<Phase4AdditionalData> } }
  | { type: 'SET_INITIAL_FORM_STATE'; payload: InitialFormStateData }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_SUBMISSION_RESULT'; payload: SubmissionSuccess | null }
  | { type: 'SET_FIELD_ERRORS'; payload: Record<string, string> };

interface State {
  currentPhase: PhaseNumber;
  formData: EmployeeFormState;
  isSubmitting: boolean;
  submissionResult: SubmissionSuccess | null;
  fieldErrors: Record<string, string>;
}

const initialState: State = {
  currentPhase: 1,
  formData: initialEmployeeFormState,
  isSubmitting: false,
  submissionResult: null,
  fieldErrors: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CURRENT_PHASE':
      return { ...state, currentPhase: action.payload, fieldErrors: {} };
    case 'SET_PHASE_DATA': {
      const { phase, data } = action.payload;
      const phaseKey = `phase${phase}` as keyof EmployeeFormState;
      return {
        ...state,
        formData: {
          ...state.formData,
          [phaseKey]: { ...state.formData[phaseKey], ...data },
        },
      };
    }
    case 'SET_INITIAL_FORM_STATE':
      return {
        ...state,
        formData: {
          ...initialEmployeeFormState,
          ...action.payload,
          phase1: {
            ...initialEmployeeFormState.phase1,
            ...(action.payload.phase1 || {}),
          },
          phase2: {
            ...initialEmployeeFormState.phase2,
            ...(action.payload.phase2 || {}),
          },
          phase3: {
            ...initialEmployeeFormState.phase3,
            ...(action.payload.phase3 || {}),
          },
          phase4: {
            ...initialEmployeeFormState.phase4,
            ...(action.payload.phase4 || {}),
          },
        },
      };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_SUBMISSION_RESULT':
      return { ...state, submissionResult: action.payload };
    case 'SET_FIELD_ERRORS':
      return { ...state, fieldErrors: action.payload };
    default:
      return state;
  }
}

interface EmployeeFormContextValue {
  currentPhase: PhaseNumber;
  formData: EmployeeFormState;
  isSubmitting: boolean;
  submissionResult: SubmissionSuccess | null;
  fieldErrors: Record<string, string>;
  goToPhase: (phase: PhaseNumber) => void;
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

const EmployeeFormContext = createContext<
  EmployeeFormContextValue | undefined
>(undefined);

function zodErrorsToRecord<T>(
  result: SafeParseReturnType<T, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path.join('.');
      if (!errors[key]) {
        errors[key] = issue.message;
      }
    }
  }
  return errors;
}

export function EmployeeFormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const goToPhase = useCallback((phase: PhaseNumber) => {
    dispatch({ type: 'SET_CURRENT_PHASE', payload: phase });
  }, []);

  const setPhaseData = useCallback(
    <P extends 1 | 2 | 3 | 4>(
      phase: P,
      data: P extends 1
        ? Partial<Phase1BasicData>
        : P extends 2
        ? Partial<Phase2EducationData>
        : P extends 3
        ? Partial<Phase3EmergencyData>
        : Partial<Phase4AdditionalData>
    ) => {
      dispatch({
        type: 'SET_PHASE_DATA',
        payload: { phase, data } as Action extends { type: 'SET_PHASE_DATA' }
          ? Action
          : never,
      });
    },
    []
  );

  const setInitialFormState = useCallback(
    (data: InitialFormStateData) => {
      dispatch({ type: 'SET_INITIAL_FORM_STATE', payload: data });
    },
    []
  );

  const validateCurrentPhase = useCallback((): boolean => {
    const { currentPhase, formData } = state;
    let result: SafeParseReturnType<unknown, unknown>;

    switch (currentPhase) {
      case 1:
        result = phase1Schema.safeParse(formData.phase1);
        break;
      case 2:
        result = phase2Schema.safeParse(formData.phase2);
        break;
      case 3:
        result = phase3Schema.safeParse(formData.phase3);
        break;
      case 4:
        result = phase4Schema.safeParse(formData.phase4);
        break;
      case 5:
        return true;
      default:
        return true;
    }

    const errors = zodErrorsToRecord(result);
    dispatch({ type: 'SET_FIELD_ERRORS', payload: errors });
    return result.success;
  }, [state.currentPhase, state.formData]);

  const submit = useCallback(
    async (token?: string): Promise<SubmissionSuccess | null> => {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_FIELD_ERRORS', payload: {} });
      try {
        const { phase1, phase2, phase3, phase4 } = state.formData;
        const combined: CombinedFormPayload = {
          ...phase1,
          ...phase2,
          ...phase3,
          ...phase4,
        };
        const result = token && token.trim()
          ? await employeeApi.submitEmployeeForm(token.trim(), combined)
          : await employeeApi.registerEmployee(combined);
        dispatch({ type: 'SET_SUBMISSION_RESULT', payload: result });
        return result;
      } catch (err: unknown) {
        const errors: Record<string, string> = {};
        if (err && typeof err === 'object' && 'response' in err) {
          const resp = (err as { response?: { data?: { detail?: string; errors?: Record<string, string> } } })
            .response;
          if (resp?.data?.errors && typeof resp.data.errors === 'object') {
            Object.assign(errors, resp.data.errors);
          } else if (resp?.data?.detail) {
            errors._form = resp.data.detail;
          } else {
            errors._form = 'Failed to submit. Please try again.';
          }
        } else {
          errors._form = 'Network error. Please check your connection.';
        }
        dispatch({ type: 'SET_FIELD_ERRORS', payload: errors });
        return null;
      } finally {
        dispatch({ type: 'SET_SUBMITTING', payload: false });
      }
    },
    [state.formData]
  );

  const value = useMemo<EmployeeFormContextValue>(
    () => ({
      currentPhase: state.currentPhase,
      formData: state.formData,
      isSubmitting: state.isSubmitting,
      submissionResult: state.submissionResult,
      fieldErrors: state.fieldErrors,
      goToPhase,
      setPhaseData,
      setInitialFormState,
      validateCurrentPhase,
      submit,
    }),
    [
      state.currentPhase,
      state.formData,
      state.isSubmitting,
      state.submissionResult,
      state.fieldErrors,
      goToPhase,
      setPhaseData,
      setInitialFormState,
      validateCurrentPhase,
      submit,
    ]
  );

  return (
    <EmployeeFormContext.Provider value={value}>
      {children}
    </EmployeeFormContext.Provider>
  );
}

export function useEmployeeFormContext(): EmployeeFormContextValue {
  const ctx = useContext(EmployeeFormContext);
  if (!ctx) {
    throw new Error(
      'useEmployeeFormContext must be used within EmployeeFormProvider'
    );
  }
  return ctx;
}
