import api from '@/services/api/axios'
import type {
  DashboardSummary,
  EmployeeDetails,
  EmployeeSummary,
  InvitationResponse,
} from '../types/admin.types'

function toCamelSummary(data: Record<string, unknown>): EmployeeSummary {
  return {
    submissionReference: String(data.submission_reference ?? ''),
    name: String(data.name ?? ''),
    mobileNumber: String(data.mobile_number ?? ''),
    post: data.post != null ? String(data.post) : undefined,
    dateOfJoining: data.date_of_joining != null ? String(data.date_of_joining) : undefined,
    createdAt: String(data.created_at ?? ''),
  }
}

function toCamelDetails(data: Record<string, unknown>): EmployeeDetails {
  return {
    submissionReference: String(data.submission_reference ?? ''),
    submissionStatus: String(data.submission_status ?? ''),
    createdAt: String(data.created_at ?? ''),
    updatedAt: String(data.updated_at ?? ''),
    mobileNumber: String(data.mobile_number ?? ''),
    post: data.post != null ? String(data.post) : undefined,
    name: String(data.name ?? ''),
    email: data.email != null ? String(data.email) : undefined,
    dateOfBirth: data.date_of_birth != null ? String(data.date_of_birth) : undefined,
    gender: data.gender != null ? String(data.gender) : undefined,
    localAddress: data.local_address != null ? String(data.local_address) : undefined,
    permanentAddress: data.permanent_address != null ? String(data.permanent_address) : undefined,
    landline: data.landline != null ? String(data.landline) : undefined,
    qualification: data.qualification != null ? String(data.qualification) : undefined,
    computerCourse: data.computer_course != null ? String(data.computer_course) : undefined,
    interviewDate: data.interview_date != null ? String(data.interview_date) : undefined,
    referenceName: data.reference_name != null ? String(data.reference_name) : undefined,
    dateOfJoining: data.date_of_joining != null ? String(data.date_of_joining) : undefined,
    experienceValue: data.experience_value != null ? Number(data.experience_value) : undefined,
    experienceUnit: data.experience_unit != null ? String(data.experience_unit) : undefined,
    experienceYears: data.experience_years != null ? Number(data.experience_years) : undefined,
    experienceMonths: data.experience_months != null ? Number(data.experience_months) : undefined,
    emergencyMobile: data.emergency_mobile != null ? String(data.emergency_mobile) : undefined,
    emergencyPersonName:
      data.emergency_person_name != null ? String(data.emergency_person_name) : undefined,
    emergencyRelation:
      data.emergency_relation != null ? String(data.emergency_relation) : undefined,
    bloodGroup: data.blood_group != null ? String(data.blood_group) : undefined,
    willingnessDonateBlood:
      data.willingness_donate_blood != null ? Boolean(data.willingness_donate_blood) : undefined,
    maritalStatus: data.marital_status != null ? String(data.marital_status) : undefined,
    medicalHistory: data.medical_history != null ? String(data.medical_history) : undefined,
    legalHistory: data.legal_history != null ? String(data.legal_history) : undefined,
    religion: data.religion != null ? String(data.religion) : undefined,
    caste: data.caste != null ? String(data.caste) : undefined,
    spouseName: data.spouse_name != null ? String(data.spouse_name) : undefined,
    anniversaryDate: data.anniversary_date != null ? String(data.anniversary_date) : undefined,
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get('/admin/dashboard/summary')
  const d = res.data as Record<string, unknown>
  return {
    totalEmployees: Number(d.total_employees ?? 0),
    last7Days: Number(d.last_7_days ?? 0),
    recentCount: Number(d.recent_count ?? 0),
  }
}

export async function searchEmployeesByMobile(mobile: string): Promise<EmployeeSummary[]> {
  const res = await api.get('/admin/employees/search', { params: { mobile } })
  const list = (res.data ?? []) as Record<string, unknown>[]
  return list.map(toCamelSummary)
}

export async function getEmployeeDetails(ref: string): Promise<EmployeeDetails> {
  const res = await api.get(`/admin/employees/${ref}`)
  return toCamelDetails(res.data as Record<string, unknown>)
}

export async function updateEmployeeDetails(
  ref: string,
  payload: Record<string, unknown>
): Promise<EmployeeDetails> {
  const res = await api.put(`/admin/employees/${ref}`, payload)
  return toCamelDetails(res.data as Record<string, unknown>)
}

export async function listRecentEmployees(limit = 10): Promise<EmployeeSummary[]> {
  const res = await api.get('/admin/employees/recent', { params: { limit } })
  const list = (res.data ?? []) as Record<string, unknown>[]
  return list.map(toCamelSummary)
}

export async function listEmployees(
  page: number,
  size: number
): Promise<EmployeeSummary[]> {
  const res = await api.get('/admin/employees', { params: { page, size } })
  const list = (res.data ?? []) as Record<string, unknown>[]
  return list.map(toCamelSummary)
}

export async function createInvitation(payload: {
  mobileNumber?: string
  validDays?: number
}): Promise<InvitationResponse> {
  const body: Record<string, unknown> = {}
  if (payload.mobileNumber !== undefined) {
    body.mobile_number = payload.mobileNumber
  }
  if (payload.validDays !== undefined) {
    body.valid_days = payload.validDays
  }
  const res = await api.post('/admin/invitations', body)
  const d = res.data as Record<string, unknown>
  return {
    token: String(d.token ?? ''),
    expiresAt: String(d.expires_at ?? ''),
    mobileNumber: d.mobile_number != null ? String(d.mobile_number) : undefined,
    isUsed: Boolean(d.is_used ?? false),
  }
}
