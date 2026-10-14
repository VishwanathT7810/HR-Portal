export type Gender = 'male' | 'female' | 'other';

export type ExperienceUnit = 'years' | 'months';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type MaritalStatus = 'single' | 'married' | 'other';

export interface Phase1BasicData {
  mobile: string;
  post?: string;
  name: string;
  email?: string;
  dateOfBirth?: string;
  gender?: Gender;
  localAddress?: string;
  permanentAddress?: string;
  landline?: string;
  sameAddress?: boolean;
}

export interface Phase2EducationData {
  qualification?: string;
  computerCourse?: string;
  interviewDate?: string;
  referenceName?: string;
  dateOfJoining?: string;
  experienceValue?: number | null;
  experienceUnit?: ExperienceUnit;
}

export interface Phase3EmergencyData {
  emergencyMobile?: string;
  emergencyPersonName?: string;
  emergencyRelation?: string;
  bloodGroup?: BloodGroup;
  willingnessDonateBlood?: boolean;
  maritalStatus?: MaritalStatus;
  medicalHistory?: string;
  legalHistory?: string;
}

export interface Phase4AdditionalData {
  religion?: string;
  caste?: string;
  spouseName?: string;
  anniversaryDate?: string;
}

export interface EmployeeFormState {
  phase1: Phase1BasicData;
  phase2: Phase2EducationData;
  phase3: Phase3EmergencyData;
  phase4: Phase4AdditionalData;
}

export interface InitialFormStateData {
  phase1?: Partial<Phase1BasicData>;
  phase2?: Partial<Phase2EducationData>;
  phase3?: Partial<Phase3EmergencyData>;
  phase4?: Partial<Phase4AdditionalData>;
}

export interface EmployeeInvitationInfo {
  token: string;
  mobileNumber: string | null;
  expiresAt: string;
}

export interface SubmissionSuccess {
  submissionReference: string;
}

export type CombinedFormPayload = Phase1BasicData &
  Phase2EducationData &
  Phase3EmergencyData &
  Phase4AdditionalData;

export const initialEmployeeFormState: EmployeeFormState = {
  phase1: {
    mobile: '',
    post: '',
    name: '',
    email: '',
    dateOfBirth: '',
    gender: undefined,
    localAddress: '',
    permanentAddress: '',
    landline: '',
    sameAddress: false,
  },
  phase2: {
    qualification: '',
    computerCourse: '',
    interviewDate: '',
    referenceName: '',
    dateOfJoining: '',
    experienceValue: null,
    experienceUnit: undefined,
  },
  phase3: {
    emergencyMobile: '',
    emergencyPersonName: '',
    emergencyRelation: '',
    bloodGroup: undefined,
    willingnessDonateBlood: undefined,
    maritalStatus: undefined,
    medicalHistory: '',
    legalHistory: '',
  },
  phase4: {
    religion: '',
    caste: '',
    spouseName: '',
    anniversaryDate: '',
  },
};
