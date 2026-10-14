export interface EmployeeSummary {
  submissionReference: string
  name: string
  mobileNumber: string
  post?: string
  dateOfJoining?: string
  createdAt: string
}

export interface EmployeeDetails {
  submissionReference: string
  submissionStatus: string
  createdAt: string
  updatedAt: string
  mobileNumber: string
  post?: string
  name: string
  email?: string
  dateOfBirth?: string
  gender?: string
  localAddress?: string
  permanentAddress?: string
  landline?: string
  qualification?: string
  computerCourse?: string
  interviewDate?: string
  referenceName?: string
  dateOfJoining?: string
  experienceValue?: number
  experienceUnit?: string
  experienceYears?: number
  experienceMonths?: number
  emergencyMobile?: string
  emergencyPersonName?: string
  emergencyRelation?: string
  bloodGroup?: string
  willingnessDonateBlood?: boolean
  maritalStatus?: string
  medicalHistory?: string
  legalHistory?: string
  religion?: string
  caste?: string
  spouseName?: string
  anniversaryDate?: string
}

export interface DashboardSummary {
  totalEmployees: number
  last7Days: number
  recentCount: number
}

export interface InvitationResponse {
  token: string
  expiresAt: string
  mobileNumber?: string
  isUsed: boolean
}
