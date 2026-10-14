import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import cn from 'classnames'
import { format } from 'date-fns'
import { getEmployeeDetails, updateEmployeeDetails } from '../services/adminApi'
import type { EmployeeDetails } from '../types/admin.types'
import './EmployeeDetailsPage.css'

function toast(message: string, variant: 'success' | 'error' = 'error'): void {
  const el = document.createElement('div')
  const bg =
    variant === 'success' ? 'var(--color-success, #16a34a)' : 'var(--color-error, #dc2626)'
  el.textContent = message
  Object.assign(el.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: '9999',
    padding: '10px 18px',
    borderRadius: '8px',
    color: '#fff',
    backgroundColor: bg,
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
    maxWidth: '360px',
  })
  document.body.appendChild(el)
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 300)
  }, 3500)
}

function formatDdMmYyyy(val?: string | null): string {
  if (!val) return ''
  const trimmed = val.trim()
  if (!trimmed) return ''
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const parts = trimmed.split('T')[0].split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
  }
  try {
    const d = new Date(trimmed)
    if (!Number.isNaN(d.getTime())) {
      return format(d, 'dd/MM/yyyy')
    }
  } catch {
    // ignore
  }
  return trimmed
}

function ddMmYyyyToIso(ddMmYyyy: string): string {
  if (!ddMmYyyy) return ''
  const parts = ddMmYyyy.split('/')
  if (parts.length === 3) {
    const [d, m, y] = parts
    if (y && y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
  }
  return ''
}

const formatDdMmYyyyInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

const isValidDdMmYyyy = (dateStr: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false
  const [dStr, mStr, yStr] = dateStr.split('/')
  const d = parseInt(dStr, 10)
  const m = parseInt(mStr, 10)
  const y = parseInt(yStr, 10)
  if (m < 1 || m > 12) return false
  if (y < 1900 || y > 2100) return false
  const daysInMonth = new Date(y, m, 0).getDate()
  return d >= 1 && d <= daysInMonth
}

function validateDob(val?: string | null): string | null {
  if (!val) return null
  const trimmed = val.trim()
  if (!trimmed) return null

  if (!isValidDdMmYyyy(trimmed)) {
    return 'Must be dd/mm/yyyy'
  }
  const [d, m, y] = trimmed.split('/').map(Number)
  const birthDate = new Date(y, m - 1, d)
  const today = new Date()
  if (birthDate > today) {
    return 'DOB cannot be in future'
  }
  let age = today.getFullYear() - birthDate.getFullYear()
  const mDiff = today.getMonth() - birthDate.getMonth()
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  if (age < 18) {
    return 'Age must be at least 18 years'
  }
  return null
}

const normalizeQualification = (q: string | null | undefined): string => {
  if (!q) return ''
  const trimmed = q.trim()
  if (trimmed.startsWith('Post Graduate')) return 'Post Graduate'
  if (trimmed.startsWith('Graduate')) return 'Graduate'
  if (trimmed.startsWith('Doctorate')) return 'Doctorate'
  if (trimmed.startsWith('10th')) return '10th'
  if (trimmed.startsWith('12th')) return '12th'
  if (trimmed === 'Diploma') return 'Diploma'
  if (trimmed === 'Other') return 'Other'
  return trimmed
}

function formatDateTime(val?: string | null): string {
  if (!val) return '—'
  const trimmed = val.trim()
  if (!trimmed) return '—'

  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10)
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1
    const year = parseInt(ddmmyyyyMatch[3], 10)
    const d = new Date(year, month, day)
    if (!Number.isNaN(d.getTime())) {
      return format(d, 'dd MMM yyyy')
    }
  }

  try {
    const d = new Date(trimmed)
    if (!Number.isNaN(d.getTime())) {
      return format(d, 'dd MMM yyyy, hh:mm a')
    }
  } catch {
    // ignore
  }
  return trimmed
}

function capitalize(value?: string | null): string {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

interface DateInputFieldProps {
  id?: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  onBlur?: (value: string) => void
  disabled?: boolean
  hasError?: boolean
}

const DateInputField: React.FC<DateInputFieldProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  hasError = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const hiddenPickerRef = useRef<HTMLInputElement>(null)

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDdMmYyyyInput(e.target.value)
    onChange(name, formatted)
  }

  const handleTextBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      containerRef.current &&
      e.relatedTarget &&
      containerRef.current.contains(e.relatedTarget as Node)
    ) {
      return
    }
    onBlur?.(e.target.value)
  }

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value
    if (isoVal) {
      const formatted = formatDdMmYyyy(isoVal)
      onChange(name, formatted)
      onBlur?.(formatted)
    }
  }

  const openCalendar = () => {
    if (disabled) return
    if (hiddenPickerRef.current) {
      if (typeof hiddenPickerRef.current.showPicker === 'function') {
        hiddenPickerRef.current.showPicker()
      } else {
        hiddenPickerRef.current.focus()
        hiddenPickerRef.current.click()
      }
    }
  }

  return (
    <div ref={containerRef} className="emp-date-input-wrap">
      <input
        id={id}
        type="text"
        name={name}
        value={value}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        disabled={disabled}
        placeholder="DD/MM/YYYY"
        maxLength={10}
        inputMode="numeric"
        className={cn('emp-edit-input', hasError && 'is-error')}
      />
      <button
        type="button"
        onClick={openCalendar}
        disabled={disabled}
        className="emp-date-picker-btn"
        title="Open calendar picker"
        tabIndex={-1}
      >
        📅
      </button>
      <input
        ref={hiddenPickerRef}
        type="date"
        value={ddMmYyyyToIso(value)}
        onChange={handleNativePickerChange}
        tabIndex={-1}
        aria-hidden="true"
        className="emp-date-hidden-picker"
      />
    </div>
  )
}

interface EditFormData {
  mobile: string
  name: string
  post: string
  created_at: string
  email: string
  date_of_birth: string
  gender: string
  landline: string
  qualification: string
  computer_course: string
  experience_years: string
  experience_months: string
  interview_date: string
  date_of_joining: string
  reference_name: string
  emergency_mobile: string
  emergency_relation: string
  emergency_person_name: string
  religion: string
  caste: string
  blood_group: string
  willingness_donate_blood: string
  marital_status: string
  anniversary_date: string
  spouse_name: string
  local_address: string
  permanent_address: string
  medical_history: string
  legal_history: string
}

function initFormData(d: EmployeeDetails): EditFormData {
  return {
    mobile: d.mobileNumber || '',
    name: d.name || '',
    post: d.post || '',
    created_at: d.createdAt ? formatDdMmYyyy(d.createdAt) : '',
    email: d.email || '',
    date_of_birth: d.dateOfBirth ? formatDdMmYyyy(d.dateOfBirth) : '',
    gender: d.gender ? capitalize(d.gender) : '',
    landline: d.landline || '',
    qualification: normalizeQualification(d.qualification),
    computer_course: d.computerCourse || '',
    experience_years:
      d.experienceYears !== undefined && d.experienceYears !== null
        ? String(d.experienceYears)
        : d.experienceUnit === 'years' && d.experienceValue !== undefined
        ? String(d.experienceValue)
        : '0',
    experience_months:
      d.experienceMonths !== undefined && d.experienceMonths !== null
        ? String(d.experienceMonths)
        : d.experienceUnit === 'months' && d.experienceValue !== undefined
        ? String(d.experienceValue)
        : '0',
    interview_date: d.interviewDate ? formatDdMmYyyy(d.interviewDate) : '',
    date_of_joining: d.dateOfJoining ? formatDdMmYyyy(d.dateOfJoining) : '',
    reference_name: d.referenceName || '',
    emergency_mobile: d.emergencyMobile || '',
    emergency_relation: d.emergencyRelation ? capitalize(d.emergencyRelation) : '',
    emergency_person_name: d.emergencyPersonName || '',
    religion: d.religion || '',
    caste: d.caste || '',
    blood_group: d.bloodGroup || '',
    willingness_donate_blood:
      d.willingnessDonateBlood === true
        ? 'Yes'
        : d.willingnessDonateBlood === false
        ? 'No'
        : '',
    marital_status: d.maritalStatus ? capitalize(d.maritalStatus) : '',
    anniversary_date: d.anniversaryDate ? formatDdMmYyyy(d.anniversaryDate) : '',
    spouse_name: d.spouseName || '',
    local_address: d.localAddress || '',
    permanent_address: d.permanentAddress || '',
    medical_history: d.medicalHistory || '',
    legal_history: d.legalHistory || '',
  }
}

function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="emp-view-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--color-error, #ef4444)' }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--color-text)' }}>
        404 — Employee Record Not Found
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 24px 0' }}>
        The employee registration you are looking for does not exist or has been removed.
      </p>
      <div>
        <button type="button" onClick={onBack} className="emp-btn-primary">
          ← Back to Employees List
        </button>
      </div>
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="emp-view-card">
      <div style={{ height: '32px', backgroundColor: '#e2e8f0', borderRadius: '4px', width: '30%', marginBottom: '16px' }} />
      <div className="emp-view-grid">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="emp-view-col col-span-1" style={{ gap: '6px' }}>
            <div style={{ height: '12px', backgroundColor: '#e2e8f0', borderRadius: '3px', width: '40%' }} />
            <div style={{ height: '34px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

interface EmployeePrintViewProps {
  details: EmployeeDetails
  editForm: EditFormData
}

function EmployeePrintView({ details, editForm }: EmployeePrintViewProps) {
  const expYears = parseInt(editForm.experience_years || '0', 10) || 0
  const expMonths = parseInt(editForm.experience_months || '0', 10) || 0
  const expText =
    expYears > 0 || expMonths > 0
      ? `${expYears} ${expYears === 1 ? 'Year' : 'Years'}${
          expMonths > 0 ? `, ${expMonths} ${expMonths === 1 ? 'Month' : 'Months'}` : ''
        }`
      : 'Fresher / Nil'

  return (
    <div className="emp-print-document" aria-hidden="true">
      {/* 1. Official Header / Letterhead */}
      <div className="print-header">
        <div className="print-header-left">
          <img
            src="/images/biyani-logo.png"
            alt="Biyani Logo"
            className="print-logo"
            onError={(e) => {
              ;(e.currentTarget as HTMLElement).style.display = 'none'
            }}
          />
          <div>
            <h1 className="print-org-name">BIYANI TECHNOLOGIES PVT. LTD.</h1>
            <p className="print-org-sub">
              Software Development &bull; Educational ERP &bull; IT Solutions &bull; Kolhapur
            </p>
          </div>
        </div>

        <div className="print-header-right">
          <div className="print-ref-badge">
            <span className="print-ref-label">REG ID:</span>
            <span className="print-ref-val">{details.submissionReference}</span>
          </div>
          <div className="print-meta-text">
            Date: {editForm.created_at || formatDdMmYyyy(details.createdAt) || '—'}
          </div>
        </div>
      </div>

      {/* 2. Document Title Banner */}
      <div className="print-doc-title-bar">
        <span>EMPLOYEE REGISTRATION &amp; VERIFICATION RECORD</span>
        <span className="print-status-tag">OFFICIAL HR COPY</span>
      </div>

      {/* 3. Section 1: Employment Details */}
      <div className="print-section-title">1. Employment &amp; Position Details</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="print-th" style={{ width: '18%' }}>Applied Post / Role</td>
            <td className="print-td" style={{ width: '32%', fontWeight: 700 }}>{editForm.post || '—'}</td>
            <td className="print-th" style={{ width: '20%' }}>Date of Joining (DOJ)</td>
            <td className="print-td" style={{ width: '30%' }}>{editForm.date_of_joining || '—'}</td>
          </tr>
          <tr>
            <td className="print-th">Interview Date</td>
            <td className="print-td">{editForm.interview_date || '—'}</td>
            <td className="print-th">Total Experience</td>
            <td className="print-td">{expText}</td>
          </tr>
          <tr>
            <td className="print-th">Reference Person</td>
            <td className="print-td" colSpan={3}>{editForm.reference_name || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* 4. Section 2: Personal Profile */}
      <div className="print-section-title">2. Personal Particulars</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="print-th" style={{ width: '18%' }}>Full Name</td>
            <td className="print-td" style={{ width: '32%', fontWeight: 700 }}>{editForm.name || '—'}</td>
            <td className="print-th" style={{ width: '20%' }}>Gender</td>
            <td className="print-td" style={{ width: '30%' }}>{editForm.gender || '—'}</td>
          </tr>
          <tr>
            <td className="print-th">Date of Birth (DOB)</td>
            <td className="print-td">{editForm.date_of_birth || '—'}</td>
            <td className="print-th">Blood Group</td>
            <td className="print-td">{editForm.blood_group || '—'}</td>
          </tr>
          <tr>
            <td className="print-th">Religion</td>
            <td className="print-td">{editForm.religion || '—'}</td>
            <td className="print-th">Caste / Category</td>
            <td className="print-td">{editForm.caste || '—'}</td>
          </tr>
          <tr>
            <td className="print-th">Willing to Donate Blood</td>
            <td className="print-td">{editForm.willingness_donate_blood || '—'}</td>
            <td className="print-th">Marital Status</td>
            <td className="print-td">{editForm.marital_status || '—'}</td>
          </tr>
          <tr>
            <td className="print-th">Spouse Name</td>
            <td className="print-td">{editForm.spouse_name || '—'}</td>
            <td className="print-th">Anniversary Date</td>
            <td className="print-td">{editForm.anniversary_date || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* 5. Section 3: Qualifications */}
      <div className="print-section-title">3. Educational &amp; Technical Qualifications</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="print-th" style={{ width: '18%' }}>Highest Qualification</td>
            <td className="print-td" style={{ width: '32%', fontWeight: 600 }}>{editForm.qualification || '—'}</td>
            <td className="print-th" style={{ width: '20%' }}>Computer Proficiency / Course</td>
            <td className="print-td" style={{ width: '30%' }}>{editForm.computer_course || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* 6. Section 4: Contact & Emergency */}
      <div className="print-section-title">4. Contact &amp; Emergency Information</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="print-th" style={{ width: '18%' }}>Mobile Number</td>
            <td className="print-td" style={{ width: '32%', fontWeight: 700 }}>{editForm.mobile || '—'}</td>
            <td className="print-th" style={{ width: '20%' }}>Landline / Alternate</td>
            <td className="print-td" style={{ width: '30%' }}>{editForm.landline || '—'}</td>
          </tr>
          <tr>
            <td className="print-th">Email Address</td>
            <td className="print-td" colSpan={3} style={{ wordBreak: 'break-all' }}>{editForm.email || '—'}</td>
          </tr>
          <tr>
            <td className="print-th">Emergency Contact Person</td>
            <td className="print-td">{editForm.emergency_person_name || '—'}</td>
            <td className="print-th">Relationship &amp; Mobile</td>
            <td className="print-td">
              {editForm.emergency_relation ? `${editForm.emergency_relation} — ` : ''}
              {editForm.emergency_mobile || '—'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 7. Section 5: Residential Addresses */}
      <div className="print-section-title">5. Residential Addresses</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="print-th" style={{ width: '18%' }}>Local / Current Address</td>
            <td className="print-td" colSpan={3}>{editForm.local_address || '—'}</td>
          </tr>
          <tr>
            <td className="print-th">Permanent Address</td>
            <td className="print-td" colSpan={3}>{editForm.permanent_address || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* 8. Section 6: Medical & Legal History */}
      <div className="print-section-title">6. Medical &amp; Legal Declaration</div>
      <table className="print-table">
        <tbody>
          <tr>
            <td className="print-th" style={{ width: '18%' }}>Medical History / Illness</td>
            <td className="print-td" colSpan={3}>{editForm.medical_history || 'None reported'}</td>
          </tr>
          <tr>
            <td className="print-th">Legal / Criminal History</td>
            <td className="print-td" colSpan={3}>{editForm.legal_history || 'None reported'}</td>
          </tr>
        </tbody>
      </table>

      {/* 9. Declaration */}
      <div className="print-declaration">
        <strong>Declaration:</strong> I hereby declare that all particulars furnished above are true, complete, and correct to the best of my knowledge and belief. If any information is found incorrect or misleading, my registration/employment shall be liable to disciplinary action or termination.
      </div>

      {/* 10. Official Signatures */}
      <div className="print-signature-row">
        <div className="print-sign-box">
          <div className="print-sign-line" />
          <div className="print-sign-label">Candidate / Employee Signature</div>
          <div className="print-sign-date">Date: ____________________</div>
        </div>
        <div className="print-sign-box">
          <div className="print-sign-line" />
          <div className="print-sign-label">HR Verification Officer</div>
          <div className="print-sign-date">Verified &amp; Accepted</div>
        </div>
        <div className="print-sign-box">
          <div className="print-sign-line" />
          <div className="print-sign-label">Authorized Signatory / Seal</div>
          <div className="print-sign-date">Biyani Technologies Pvt. Ltd.</div>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeDetailsPage() {
  const { submissionReference, ref: altRef } = useParams<{
    submissionReference?: string
    ref?: string
  }>()
  const activeRef = submissionReference || altRef
  const navigate = useNavigate()
  const [details, setDetails] = useState<EmployeeDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editForm, setEditForm] = useState<EditFormData>({
    mobile: '',
    name: '',
    post: '',
    created_at: '',
    email: '',
    date_of_birth: '',
    gender: '',
    landline: '',
    qualification: '',
    computer_course: '',
    experience_years: '0',
    experience_months: '0',
    interview_date: '',
    date_of_joining: '',
    reference_name: '',
    emergency_mobile: '',
    emergency_relation: '',
    emergency_person_name: '',
    religion: '',
    caste: '',
    blood_group: '',
    willingness_donate_blood: '',
    marital_status: '',
    anniversary_date: '',
    spouse_name: '',
    local_address: '',
    permanent_address: '',
    medical_history: '',
    legal_history: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function load() {
    if (!activeRef) return
    try {
      setLoading(true)
      setNotFound(false)
      const data = await getEmployeeDetails(activeRef)
      setDetails(data)
      setEditForm(initFormData(data))
    } catch (err: unknown) {
      console.error(err)
      const status =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err.response as { status?: number }).status
          : undefined
      if (status === 404) {
        setNotFound(true)
        toast('Employee record not found.', 'error')
      } else {
        toast('Failed to load employee details', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [activeRef])

  function back() {
    navigate('/admin/employees')
  }

  function handlePrint() {
    window.print()
  }

  function handleReset() {
    if (details) {
      setEditForm(initFormData(details))
      setErrors({})
      toast('Form reset to initial loaded values.', 'success')
    }
  }

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    let sanitizedValue = value
    if (name === 'landline') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 15)
    } else if (name === 'email') {
      sanitizedValue = value.toLowerCase()
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const lower = editForm.email.trim().toLowerCase()
      if (lower !== editForm.email) {
        setEditForm((prev) => ({ ...prev, email: lower }))
      }
    }
  }

  const handleEmailBlur = () => {
    const lower = editForm.email.trim().toLowerCase()
    setEditForm((prev) => ({ ...prev, email: lower }))
    if (lower) {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(lower)) {
        setErrors((prev) => ({ ...prev, email: 'Valid email required (e.g. name@example.com)' }))
      } else if (errors.email) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next.email
          return next
        })
      }
    }
  }

  const handleDobBlur = (val?: string) => {
    const currentVal = typeof val === 'string' ? val : editForm.date_of_birth
    const err = validateDob(currentVal)
    if (err) {
      setErrors((prev) => ({ ...prev, date_of_birth: err }))
      toast(err, 'error')
    } else if (errors.date_of_birth) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.date_of_birth
        return next
      })
    }
  }

  function handleDateFieldChange(name: string, value: string) {
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  async function handleSaveChanges(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!editForm.name.trim()) {
      newErrors.name = 'Full Name is required'
    }
    const cleanMobile = editForm.mobile.trim()
    if (!cleanMobile) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobile = '10 digits starting with 6-9 required'
    }

    const cleanEmail = editForm.email.trim().toLowerCase()
    if (cleanEmail && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      newErrors.email = 'Valid email required (e.g. name@example.com)'
    }

    const cleanLandline = editForm.landline.trim()
    if (cleanLandline) {
      if (!/^\d+$/.test(cleanLandline)) {
        newErrors.landline = 'Landline must contain numbers only'
      } else if (cleanLandline.length > 15) {
        newErrors.landline = 'Landline cannot exceed 15 digits'
      }
    }

    const dobError = validateDob(editForm.date_of_birth)
    if (dobError) {
      newErrors.date_of_birth = dobError
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast('Please correct the highlighted fields', 'error')
      return
    }

    if (!activeRef) return
    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        mobile: cleanMobile,
        name: editForm.name.trim(),
        post: editForm.post.trim() || null,
        created_at: editForm.created_at.trim() || null,
        email: cleanEmail || null,
        date_of_birth: editForm.date_of_birth.trim() || null,
        gender: editForm.gender ? editForm.gender.toLowerCase() : null,
        landline: cleanLandline || null,
        qualification: editForm.qualification.trim() || null,
        computer_course: editForm.computer_course.trim() || null,
        experience_years: editForm.experience_years ? parseInt(editForm.experience_years, 10) : 0,
        experience_months: editForm.experience_months ? parseInt(editForm.experience_months, 10) : 0,
        interview_date: editForm.interview_date.trim() || null,
        date_of_joining: editForm.date_of_joining.trim() || null,
        reference_name: editForm.reference_name.trim() || null,
        emergency_mobile: editForm.emergency_mobile.trim() || null,
        emergency_relation: editForm.emergency_relation.trim() || null,
        emergency_person_name: editForm.emergency_person_name.trim() || null,
        religion: editForm.religion.trim() || null,
        caste: editForm.caste.trim() || null,
        blood_group: editForm.blood_group || null,
        willingness_donate_blood:
          editForm.willingness_donate_blood === 'Yes'
            ? true
            : editForm.willingness_donate_blood === 'No'
            ? false
            : null,
        marital_status: editForm.marital_status ? editForm.marital_status.toLowerCase() : null,
        anniversary_date: editForm.anniversary_date.trim() || null,
        spouse_name: editForm.spouse_name.trim() || null,
        local_address: editForm.local_address.trim() || null,
        permanent_address: editForm.permanent_address.trim() || null,
        medical_history: editForm.medical_history.trim() || null,
        legal_history: editForm.legal_history.trim() || null,
      }

      const updated = await updateEmployeeDetails(activeRef, payload)
      setDetails(updated)
      setEditForm(initFormData(updated))
      toast('Employee details updated successfully!', 'success')
    } catch (err: any) {
      console.error(err)
      let msg = 'Failed to update employee details. Please verify your data and try again.'
      if (!err?.response) {
        if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network') || err?.message?.includes('connect')) {
          msg = 'Unable to connect to the server. Please check your internet connection.'
        }
      } else {
        const status = err.response.status
        const data = err.response.data
        if (status === 409) {
          msg = 'An employee with this mobile number or email already exists.'
        } else if (status === 422) {
          if (Array.isArray(data?.detail) && data.detail.length > 0) {
            const first = data.detail[0]
            const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : 'Field'
            msg = `Please check ${field}: ${first.msg || 'invalid entry'}`
          } else {
            msg = 'Please check the entered values. Some fields have invalid formats.'
          }
        } else if (status === 400) {
          if (typeof data?.detail === 'string' && !data.detail.toLowerCase().includes('status')) {
            msg = data.detail
          } else {
            msg = 'Invalid form data. Please check your entries and try again.'
          }
        } else if (status >= 500) {
          msg = 'Server encountered an issue saving updates. Please try again shortly.'
        } else if (typeof data?.detail === 'string' && !data.detail.toLowerCase().includes('status code')) {
          msg = data.detail
        }
      }
      toast(msg, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="emp-view-wrapper">
      <div className="emp-view-container">
        {notFound && !loading ? (
          <NotFoundState onBack={back} />
        ) : loading || !details ? (
          <SkeletonLoader />
        ) : (
          <form onSubmit={handleSaveChanges} className="emp-view-card">
            {/* Header / Actions */}
            <div className="emp-view-card-header">
              <div className="emp-view-title-group">
                <nav className="emp-view-breadcrumbs" aria-label="Breadcrumb">
                  <Link to="/admin/dashboard">Dashboard</Link>
                  <span>/</span>
                  <Link to="/admin/employees">Employees</Link>
                  <span>/</span>
                  <span style={{ color: 'var(--color-text, #0f172a)', fontWeight: 600 }}>
                    {details.submissionReference}
                  </span>
                </nav>
                <h1 className="emp-view-main-title">
                  {details.name || 'Employee Registration'}
                </h1>
                <div className="emp-view-submeta">
                  <span>
                    ID:{' '}
                    <strong style={{ color: 'var(--color-text, #0f172a)' }}>
                      {details.submissionReference}
                    </strong>
                  </span>
                  <span>•</span>
                  <span
                    className={cn(
                      'emp-view-status-pill',
                      details.submissionStatus?.toLowerCase() === 'submitted'
                        ? 'submitted'
                        : 'pending'
                    )}
                  >
                    {capitalize(details.submissionStatus)}
                  </span>
                  <span>•</span>
                  <span>Submitted on: {formatDateTime(details.createdAt)}</span>
                </div>
              </div>

              <div className="emp-view-actions">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="emp-btn-primary"
                  id="btn-update-employee"
                >
                  <span>{isSaving ? '⏳' : '💾'}</span>
                  <span>{isSaving ? 'Updating...' : 'Update'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="emp-btn-secondary"
                  title="Reset to original values"
                >
                  <span>↺</span>
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="emp-btn-secondary"
                  title="Print this registration form"
                >
                  <span>🖨️</span>
                  <span>Print Form</span>
                </button>
                <button type="button" onClick={back} className="emp-btn-secondary">
                  <span>←</span>
                  <span>Back to List</span>
                </button>
              </div>
            </div>

            {/* 4-Column Form Grid matching User Registration Form - Fully Editable with Preloaded Data */}
            <div className="emp-view-grid">
              {/* ROW 1: Mobile No. | Employee ID | Post | Date */}
              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Mobile No.</label>
                <input
                  type="tel"
                  name="mobile"
                  maxLength={10}
                  value={editForm.mobile}
                  onChange={handleFieldChange}
                  className={cn('emp-edit-input', errors.mobile && 'is-error')}
                  placeholder="10-digit mobile"
                />
                {errors.mobile && <div className="emp-edit-error-msg">{errors.mobile}</div>}
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Employee ID</label>
                <div className="emp-view-field highlight">
                  {details.submissionReference || '—'}
                </div>
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Post</label>
                <select
                  name="post"
                  value={editForm.post}
                  onChange={handleFieldChange}
                  className="emp-edit-select"
                >
                  <option value="">Select</option>
                  <option value="Sr. Mobile Application Dev.">Sr. Mobile Application Dev.</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Senior Software Engineer">Senior Software Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="HR Executive">HR Executive</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Office Assistant">Office Assistant</option>
                  <option value="Other">Other</option>
                  {editForm.post && ![
                    '',
                    'Sr. Mobile Application Dev.',
                    'Software Engineer',
                    'Senior Software Engineer',
                    'Full Stack Developer',
                    'Frontend Developer',
                    'Backend Developer',
                    'UI/UX Designer',
                    'QA Engineer',
                    'Project Manager',
                    'Team Lead',
                    'Business Analyst',
                    'HR Executive',
                    'HR Manager',
                    'Accountant',
                    'Office Assistant',
                    'Other'
                  ].includes(editForm.post) && (
                    <option value={editForm.post}>{editForm.post}</option>
                  )}
                </select>
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Date</label>
                <DateInputField
                  name="created_at"
                  value={editForm.created_at}
                  onChange={handleDateFieldChange}
                />
              </div>

              {/* ROW 2: Name | DOB | Gender | Email */}
              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleFieldChange}
                  className={cn('emp-edit-input', errors.name && 'is-error')}
                  placeholder="Full name"
                />
                {errors.name && <div className="emp-edit-error-msg">{errors.name}</div>}
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">DOB</label>
                <DateInputField
                  id="edit-field-dob"
                  name="date_of_birth"
                  value={editForm.date_of_birth}
                  onChange={handleDateFieldChange}
                  onBlur={handleDobBlur}
                  hasError={!!errors.date_of_birth}
                />
                {errors.date_of_birth && (
                  <div className="emp-edit-error-msg">{errors.date_of_birth}</div>
                )}
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Gender</label>
                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleFieldChange}
                  className="emp-edit-select"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleFieldChange}
                  onBlur={handleEmailBlur}
                  onKeyDown={handleEmailKeyDown}
                  className={cn('emp-edit-input', errors.email && 'is-error')}
                  placeholder="name@example.com"
                />
                {errors.email && <div className="emp-edit-error-msg">{errors.email}</div>}
              </div>

              {/* ROW 3: Landline NO. | Qualification | Computer Course | Experience, if any */}
              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Landline NO.</label>
                <input
                  type="tel"
                  name="landline"
                  value={editForm.landline}
                  onChange={handleFieldChange}
                  onKeyDown={handleNumberKeyDown}
                  maxLength={15}
                  inputMode="numeric"
                  className={cn('emp-edit-input', errors.landline && 'is-error')}
                  placeholder="Max 15 digits (numbers only)"
                />
                {errors.landline && <div className="emp-edit-error-msg">{errors.landline}</div>}
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Qualification</label>
                <select
                  name="qualification"
                  value={normalizeQualification(editForm.qualification)}
                  onChange={handleFieldChange}
                  className="emp-edit-select"
                >
                  <option value="">Select</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Other">Other</option>
                  {editForm.qualification && ![
                    '',
                    '10th',
                    '12th',
                    'Diploma',
                    'Graduate',
                    'Post Graduate',
                    'Doctorate',
                    'Other'
                  ].includes(normalizeQualification(editForm.qualification)) && (
                    <option value={editForm.qualification}>{editForm.qualification}</option>
                  )}
                </select>
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Computer Course</label>
                <input
                  type="text"
                  name="computer_course"
                  value={editForm.computer_course}
                  onChange={handleFieldChange}
                  className="emp-edit-input"
                  placeholder="e.g. MS-CIT, Tally"
                />
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Experience, if any</label>
                <div className="emp-view-exp-row">
                  <input
                    type="text"
                    name="experience_years"
                    placeholder="Years"
                    value={editForm.experience_years}
                    onChange={handleFieldChange}
                    className="emp-edit-input"
                  />
                  <input
                    type="text"
                    name="experience_months"
                    placeholder="Months"
                    value={editForm.experience_months}
                    onChange={handleFieldChange}
                    className="emp-edit-input"
                  />
                </div>
              </div>

              {/* ROW 4: Date of Interview | Date of Joining | Reference Name (span 2) */}
              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Date of Interview</label>
                <DateInputField
                  name="interview_date"
                  value={editForm.interview_date}
                  onChange={handleDateFieldChange}
                />
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Date of Joining</label>
                <DateInputField
                  name="date_of_joining"
                  value={editForm.date_of_joining}
                  onChange={handleDateFieldChange}
                />
              </div>

              <div className="emp-view-col col-span-2">
                <label className="emp-view-label">Reference Name</label>
                <input
                  type="text"
                  name="reference_name"
                  value={editForm.reference_name}
                  onChange={handleFieldChange}
                  className="emp-edit-input"
                  placeholder="Person who referred"
                />
              </div>

              {/* ROW 5: Emergency Mobile NO. | Emergency Person Name | Relation | Religion */}
              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Emergency Mobile NO.</label>
                <input
                  type="tel"
                  name="emergency_mobile"
                  maxLength={10}
                  value={editForm.emergency_mobile}
                  onChange={handleFieldChange}
                  className="emp-edit-input"
                  placeholder="10-digit mobile"
                />
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Emergency Person Name</label>
                <input
                  type="text"
                  name="emergency_person_name"
                  value={editForm.emergency_person_name}
                  onChange={handleFieldChange}
                  className="emp-edit-input"
                  placeholder="Contact person name"
                />
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Relation</label>
                <select
                  name="emergency_relation"
                  value={editForm.emergency_relation}
                  onChange={handleFieldChange}
                  className="emp-edit-select"
                >
                  <option value="">Select</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Friend">Friend</option>
                  <option value="Relative">Relative</option>
                  <option value="Other">Other</option>
                  {editForm.emergency_relation && ![
                    '',
                    'Father',
                    'Mother',
                    'Spouse',
                    'Brother',
                    'Sister',
                    'Friend',
                    'Relative',
                    'Other'
                  ].includes(editForm.emergency_relation) && (
                    <option value={editForm.emergency_relation}>{editForm.emergency_relation}</option>
                  )}
                </select>
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Religion</label>
                <input
                  type="text"
                  name="religion"
                  value={editForm.religion}
                  onChange={handleFieldChange}
                  className="emp-edit-input"
                  placeholder="Religion"
                />
              </div>

              {/* ROW 6: Caste | Blood Group | Willing to donate Blood | Marital Status */}
              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Caste</label>
                <input
                  type="text"
                  name="caste"
                  value={editForm.caste}
                  onChange={handleFieldChange}
                  className="emp-edit-input"
                  placeholder="Caste"
                />
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Blood Group</label>
                <select
                  name="blood_group"
                  value={editForm.blood_group}
                  onChange={handleFieldChange}
                  className="emp-edit-select"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Willing to donate Blood</label>
                <select
                  name="willingness_donate_blood"
                  value={editForm.willingness_donate_blood}
                  onChange={handleFieldChange}
                  className="emp-edit-select"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="emp-view-col col-span-1">
                <label className="emp-view-label">Marital Status</label>
                <select
                  name="marital_status"
                  value={editForm.marital_status}
                  onChange={handleFieldChange}
                  className="emp-edit-select"
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* ROW 7: Spouse Name (span 2) | Anniversary Date (span 2) */}
              <div className="emp-view-col col-span-2">
                <label className="emp-view-label">Spouse Name</label>
                <input
                  type="text"
                  name="spouse_name"
                  value={editForm.spouse_name}
                  onChange={handleFieldChange}
                  className="emp-edit-input"
                  placeholder="Spouse name (if married)"
                />
              </div>

              <div className="emp-view-col col-span-2">
                <label className="emp-view-label">Anniversary Date</label>
                <DateInputField
                  name="anniversary_date"
                  value={editForm.anniversary_date}
                  onChange={handleDateFieldChange}
                />
              </div>

              {/* ROW 8: Local Address (span 2) | Permanent Address (span 2) */}
              <div className="emp-view-col col-span-2">
                <label className="emp-view-label">Local Address</label>
                <textarea
                  name="local_address"
                  value={editForm.local_address}
                  onChange={handleFieldChange}
                  rows={2}
                  className="emp-edit-textarea"
                  placeholder="Local / Current address"
                />
              </div>

              <div className="emp-view-col col-span-2">
                <label className="emp-view-label">Permanent Address</label>
                <textarea
                  name="permanent_address"
                  value={editForm.permanent_address}
                  onChange={handleFieldChange}
                  rows={2}
                  className="emp-edit-textarea"
                  placeholder="Permanent address"
                />
              </div>

              {/* ROW 9: Any Medical History (span 2) | Any Legal History (span 2) */}
              <div className="emp-view-col col-span-2">
                <label className="emp-view-label">Any Medical History</label>
                <textarea
                  name="medical_history"
                  value={editForm.medical_history}
                  onChange={handleFieldChange}
                  rows={2}
                  className="emp-edit-textarea"
                  placeholder="Medical history (if any)"
                />
              </div>

              <div className="emp-view-col col-span-2">
                <label className="emp-view-label">Any Legal History</label>
                <textarea
                  name="legal_history"
                  value={editForm.legal_history}
                  onChange={handleFieldChange}
                  rows={2}
                  className="emp-edit-textarea"
                  placeholder="Legal history (if any)"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="emp-view-footer">
              <div>
                <span>
                  Submitted: {formatDateTime(details.createdAt)}
                </span>
                {details.updatedAt && details.updatedAt !== details.createdAt && (
                  <span style={{ marginLeft: '12px' }}>
                    Last Updated:{' '}
                    {formatDateTime(details.updatedAt)}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="emp-btn-primary"
                >
                  <span>{isSaving ? '⏳' : '💾'}</span>
                  <span>{isSaving ? 'Updating...' : 'Update'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="emp-btn-secondary"
                >
                  <span>↺</span>
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="emp-btn-secondary"
                >
                  <span>🖨️</span>
                  <span>Print Form</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>

    {details && <EmployeePrintView details={details} editForm={editForm} />}
  </>
  )
}
