import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import { employeeApi } from '@/modules/employee/services/employeeApi';
import { addToast } from '@/hooks/useToast';
import './EmployeeFormPage.css';

interface FormData {
  mobile: string;
  employee_id: string;
  name: string;
  local_address: string;
  permanent_address: string;
  landline: string;
  date_of_birth: string;
  gender: string;
  post: string;
  email: string;
  qualification: string;
  computer_course: string;
  reference_name: string;
  interview_date: string;
  date_of_joining: string;
  experience_years: string;
  experience_months: string;
  emergency_mobile: string;
  emergency_person_name: string;
  emergency_relation: string;
  blood_group: string;
  willingness_donate_blood: string;
  marital_status: string;
  medical_history: string;
  legal_history: string;
  religion: string;
  caste: string;
  spouse_name: string;
  anniversary_date: string;
  confirmed: boolean;
}

const initialFormValues: FormData = {
  mobile: '',
  employee_id: '',
  name: '',
  local_address: '',
  permanent_address: '',
  landline: '',
  date_of_birth: '',
  gender: '',
  post: '',
  email: '',
  qualification: '',
  computer_course: '',
  reference_name: '',
  interview_date: '',
  date_of_joining: '',
  experience_years: '',
  experience_months: '',
  emergency_mobile: '',
  emergency_person_name: '',
  emergency_relation: '',
  blood_group: '',
  willingness_donate_blood: '',
  marital_status: '',
  medical_history: '',
  legal_history: '',
  religion: '',
  caste: '',
  spouse_name: '',
  anniversary_date: '',
  confirmed: false,
};

// Date Helpers for dd/mm/yyyy
const toDdMmYyyy = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const parts = trimmed.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return trimmed;
};

const ddMmYyyyToIso = (ddMmYyyy: string): string => {
  if (!ddMmYyyy) return '';
  const parts = ddMmYyyy.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (y && y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return '';
};

const formatDdMmYyyyInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const isValidDdMmYyyy = (dateStr: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;
  const [dStr, mStr, yStr] = dateStr.split('/');
  const d = parseInt(dStr, 10);
  const m = parseInt(mStr, 10);
  const y = parseInt(yStr, 10);
  if (m < 1 || m > 12) return false;
  if (y < 1900 || y > 2100) return false;
  const daysInMonth = new Date(y, m, 0).getDate();
  return d >= 1 && d <= daysInMonth;
};

const validateDob = (val?: string | null): string | null => {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (!isValidDdMmYyyy(trimmed)) {
    return 'Must be dd/mm/yyyy';
  }
  const [d, m, y] = trimmed.split('/').map(Number);
  const birthDate = new Date(y, m - 1, d);
  const today = new Date();
  if (birthDate > today) {
    return 'DOB cannot be in future';
  }
  let age = today.getFullYear() - birthDate.getFullYear();
  const mDiff = today.getMonth() - birthDate.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 18) {
    return 'Age must be at least 18 years';
  }
  return null;
};

const normalizeQualification = (q: string | null | undefined): string => {
  if (!q) return '';
  const trimmed = q.trim();
  if (trimmed.startsWith('Post Graduate')) return 'Post Graduate';
  if (trimmed.startsWith('Graduate')) return 'Graduate';
  if (trimmed.startsWith('Doctorate')) return 'Doctorate';
  if (trimmed.startsWith('10th')) return '10th';
  if (trimmed.startsWith('12th')) return '12th';
  if (trimmed === 'Diploma') return 'Diploma';
  if (trimmed === 'Other') return 'Other';
  return trimmed;
};

// Reusable Date Input Field with Calendar Picker Popup
interface DateInputFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur?: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hiddenPickerRef = React.useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDdMmYyyyInput(e.target.value);
    onChange(name, formatted);
  };

  const handleTextBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      containerRef.current &&
      e.relatedTarget &&
      containerRef.current.contains(e.relatedTarget as Node)
    ) {
      return;
    }
    onBlur?.(e.target.value);
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value;
    if (isoVal) {
      const formatted = toDdMmYyyy(isoVal);
      onChange(name, formatted);
      onBlur?.(formatted);
    }
  };

  const openCalendar = () => {
    if (disabled) return;
    if (hiddenPickerRef.current) {
      if (typeof hiddenPickerRef.current.showPicker === 'function') {
        hiddenPickerRef.current.showPicker();
      } else {
        hiddenPickerRef.current.focus();
        hiddenPickerRef.current.click();
      }
    }
  };

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
        placeholder="dd/mm/yyyy"
        maxLength={10}
        inputMode="numeric"
        className={`emp-input ${hasError ? 'is-error' : ''}`}
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
  );
};

export function EmployeeFormPage() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(initialFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [todayDateFormatted, setTodayDateFormatted] = useState('');
  const [sameAsLocal, setSameAsLocal] = useState(false);
  const [lastSearchedMobile, setLastSearchedMobile] = useState('');
  const [isExistingRecord, setIsExistingRecord] = useState(false);

  // Format today's date in dd/mm/yyyy
  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setTodayDateFormatted(`${dd}/${mm}/${yyyy}`);
  }, []);

  // Handle invitation token if provided in URL
  useEffect(() => {
    if (token) {
      employeeApi
        .getInvitationForm(token)
        .then((info) => {
          if (info?.mobileNumber) {
            setForm((prev) => ({ ...prev, mobile: info.mobileNumber || '' }));
            handleSearch(info.mobileNumber);
          }
        })
        .catch(() => {
          // ignore invitation check error in direct mode
        });
    }
  }, [token]);

  // List of number-only fields
  const NUMBER_FIELDS = ['mobile', 'landline', 'emergency_mobile', 'experience_years', 'experience_months'];

  // List of text-only fields (cannot contain numbers)
  const TEXT_ONLY_FIELDS = [
    'name',
    'emergency_person_name',
    'reference_name',
    'spouse_name',
    'religion',
    'caste',
    'post',
  ];

  // Block non-digits on keydown for number fields
  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Block digits 0-9 on keydown for text-only fields
  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Handle Tab key press on email field to match case (auto-lowercase)
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const lower = form.email.trim().toLowerCase();
      if (lower !== form.email) {
        setForm((prev) => ({ ...prev, email: lower }));
      }
    }
  };

  // Match case and validate email on blur
  const handleEmailBlur = () => {
    const lower = form.email.trim().toLowerCase();
    setForm((prev) => ({ ...prev, email: lower }));
    if (lower) {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(lower)) {
        setErrors((prev) => ({ ...prev, email: 'Valid email required (e.g. name@example.com)' }));
      } else if (errors.email) {
        setErrors((prev) => ({ ...prev, email: '' }));
      }
    }
  };

  const handleDobBlur = (val?: string) => {
    const currentVal = typeof val === 'string' ? val : form.date_of_birth;
    const err = validateDob(currentVal);
    if (err) {
      setErrors((prev) => ({ ...prev, date_of_birth: err }));
      addToast(err, 'error');
    } else if (errors.date_of_birth) {
      setErrors((prev) => ({ ...prev, date_of_birth: '' }));
    }
  };

  // Automatic lookup on mobile blur or clicking anywhere
  const handleMobileBlur = () => {
    const mobile = form.mobile.trim();
    if (mobile.length === 10 && /^[6-9]\d{9}$/.test(mobile)) {
      if (mobile !== lastSearchedMobile) {
        setLastSearchedMobile(mobile);
        handleSearch(mobile);
      }
    }
  };

  const handleMobileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleNumberKeyDown(e);
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleDateChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleToggleSameAsLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsLocal(checked);
    if (checked) {
      setForm((prev) => ({ ...prev, permanent_address: prev.local_address }));
      if (errors.permanent_address) {
        setErrors((prev) => ({ ...prev, permanent_address: '' }));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      let sanitizedValue = value;

      if (NUMBER_FIELDS.includes(name)) {
        sanitizedValue = value.replace(/\D/g, ''); // Digits only
        if (name === 'mobile' || name === 'emergency_mobile') {
          sanitizedValue = sanitizedValue.slice(0, 10);
        } else if (name === 'landline') {
          sanitizedValue = sanitizedValue.slice(0, 15);
        } else if (name === 'experience_years') {
          sanitizedValue = sanitizedValue.slice(0, 2);
          if (parseInt(sanitizedValue, 10) > 50) sanitizedValue = '50';
        } else if (name === 'experience_months') {
          sanitizedValue = sanitizedValue.slice(0, 2);
          if (parseInt(sanitizedValue, 10) > 11) sanitizedValue = '11';
        }
      } else if (TEXT_ONLY_FIELDS.includes(name)) {
        // Text only: remove any numbers / digits
        sanitizedValue = value.replace(/[0-9]/g, '');
      } else if (name === 'email') {
        sanitizedValue = value.toLowerCase();
      }

      if (name === 'mobile' && sanitizedValue !== lastSearchedMobile) {
        setLastSearchedMobile('');
        setIsExistingRecord(false);
      }

      if (name === 'local_address' && sameAsLocal) {
        setForm((prev) => ({
          ...prev,
          local_address: sanitizedValue,
          permanent_address: sanitizedValue,
        }));
        if (errors.local_address) {
          setErrors((prev) => ({ ...prev, local_address: '' }));
        }
        if (errors.permanent_address) {
          setErrors((prev) => ({ ...prev, permanent_address: '' }));
        }
        return;
      }

      if (name === 'permanent_address' && sameAsLocal && sanitizedValue !== form.local_address) {
        setSameAsLocal(false);
      }

      setForm((prev) => ({ ...prev, [name]: sanitizedValue }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSearch = async (overrideMobile?: string) => {
    const mobileToSearch = (overrideMobile ?? form.mobile).trim();
    if (!mobileToSearch) {
      setErrors((prev) => ({ ...prev, mobile: 'Enter 10-digit mobile' }));
      addToast('Please enter a mobile number to search', 'error');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobileToSearch)) {
      setErrors((prev) => ({ ...prev, mobile: 'Must be 10 digits starting with 6-9' }));
      addToast('Please enter a valid 10-digit Indian mobile number', 'error');
      return;
    }

    setIsSearching(true);
    try {
      const result = await employeeApi.lookupByMobile(mobileToSearch);
      if (result) {
        setIsExistingRecord(true);
        setErrors({});
        setForm((prev) => ({
          ...prev,
          mobile: result.mobile_number || mobileToSearch,
          employee_id: result.submission_reference || '',
          name: result.name || '',
          local_address: result.local_address || '',
          permanent_address: result.permanent_address || '',
          landline: result.landline || '',
          date_of_birth: toDdMmYyyy(result.date_of_birth),
          gender: result.gender
            ? result.gender.charAt(0).toUpperCase() + result.gender.slice(1).toLowerCase()
            : '',
          post: result.post || '',
          email: result.email || '',
          qualification: normalizeQualification(result.qualification),
          computer_course: result.computer_course || '',
          reference_name: result.reference_name || '',
          interview_date: toDdMmYyyy(result.interview_date),
          date_of_joining: toDdMmYyyy(result.date_of_joining),
          experience_years:
            result.experience_years !== undefined && result.experience_years !== null
              ? String(result.experience_years)
              : result.experience_value
              ? String(result.experience_value)
              : '',
          experience_months:
            result.experience_months !== undefined && result.experience_months !== null
              ? String(result.experience_months)
              : '',
          emergency_mobile: result.emergency_mobile || '',
          emergency_person_name: result.emergency_person_name || '',
          emergency_relation: result.emergency_relation || '',
          blood_group: result.blood_group || '',
          willingness_donate_blood:
            result.willingness_donate_blood === true
              ? 'Yes'
              : result.willingness_donate_blood === false
              ? 'No'
              : '',
          marital_status: result.marital_status
            ? result.marital_status.charAt(0).toUpperCase() + result.marital_status.slice(1).toLowerCase()
            : '',
          medical_history: result.medical_history || '',
          legal_history: result.legal_history || '',
          religion: result.religion || '',
          caste: result.caste || '',
          spouse_name: result.spouse_name || '',
          anniversary_date: toDdMmYyyy(result.anniversary_date),
        }));
        if (result.local_address && result.local_address === result.permanent_address) {
          setSameAsLocal(true);
        }
        addToast('Existing record loaded! You can edit and update.', 'info');
      } else {
        setIsExistingRecord(false);
        setErrors({});
        addToast('No existing registration found. Fill details as new registration.', 'info');
      }
    } catch (err) {
      setIsExistingRecord(false);
      setErrors({});
      addToast('No record found for this mobile number. You can fill out as a new registration.', 'info');
    } finally {
      setIsSearching(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Mobile (Number only)
    const trimmedMobile = form.mobile.trim();
    if (!trimmedMobile) {
      newErrors.mobile = 'Mobile required';
    } else if (!/^[0-9]+$/.test(trimmedMobile)) {
      newErrors.mobile = 'Only numbers allowed';
    } else if (trimmedMobile.length !== 10) {
      newErrors.mobile = 'Must be exactly 10 digits';
    } else if (!/^[6-9]/.test(trimmedMobile)) {
      newErrors.mobile = 'Must start with 6, 7, 8, or 9';
    }

    // 2. Name (Text only, no numbers)
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Name is required';
    } else if (/[0-9]/.test(trimmedName)) {
      newErrors.name = 'Only letters allowed (no numbers)';
    } else if (!/^[A-Za-z\s.'-]+$/.test(trimmedName)) {
      newErrors.name = 'Only letters and spaces allowed';
    }

    // 3. Email (Match case validation)
    const trimmedEmail = form.email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail) {
      newErrors.email = 'Email required';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Valid email required (e.g. name@example.com)';
    }

    // Landline (Optional, but if entered must be numbers only, max 15 digits)
    if (form.landline && form.landline.trim()) {
      const trimmedLandline = form.landline.trim();
      if (!/^\d+$/.test(trimmedLandline)) {
        newErrors.landline = 'Landline must contain numbers only';
      } else if (trimmedLandline.length > 15) {
        newErrors.landline = 'Landline cannot exceed 15 digits';
      }
    }

    // 4. Addresses
    if (!form.local_address.trim()) newErrors.local_address = 'Local address required';
    if (!form.permanent_address.trim()) newErrors.permanent_address = 'Permanent address required';

    // 5. DOB & Gender (dd/mm/yyyy with 18+ years validation)
    if (!form.date_of_birth.trim()) {
      newErrors.date_of_birth = 'DOB required';
    } else {
      const dobError = validateDob(form.date_of_birth);
      if (dobError) {
        newErrors.date_of_birth = dobError;
      }
    }
    if (!form.gender) newErrors.gender = 'Gender required';

    // 6. Post / Designation (Text only, no numbers)
    const trimmedPost = form.post.trim();
    if (!trimmedPost) {
      newErrors.post = 'Post required';
    } else if (/[0-9]/.test(trimmedPost)) {
      newErrors.post = 'Only letters allowed (no numbers)';
    }

    // 7. Qualification
    if (!form.qualification.trim()) newErrors.qualification = 'Qualification required';

    // 8. Reference name (Text only if provided)
    if (form.reference_name.trim() && /[0-9]/.test(form.reference_name)) {
      newErrors.reference_name = 'Only letters allowed (no numbers)';
    }

    // Interview Date (Optional, dd/mm/yyyy if provided)
    if (form.interview_date.trim() && !isValidDdMmYyyy(form.interview_date.trim())) {
      newErrors.interview_date = 'Must be dd/mm/yyyy';
    }

    // Date of Joining (Optional, dd/mm/yyyy if provided)
    if (form.date_of_joining.trim() && !isValidDdMmYyyy(form.date_of_joining.trim())) {
      newErrors.date_of_joining = 'Must be dd/mm/yyyy';
    }

    // 9. Experience (Number only)
    if (form.experience_years && !/^[0-9]+$/.test(form.experience_years)) {
      newErrors.experience_years = 'Numbers only';
    }
    if (form.experience_months && !/^[0-9]+$/.test(form.experience_months)) {
      newErrors.experience_months = 'Numbers only';
    }

    // 10. Emergency mobile (Number only)
    const trimmedEmergMobile = form.emergency_mobile.trim();
    if (!trimmedEmergMobile) {
      newErrors.emergency_mobile = 'Emergency mobile required';
    } else if (!/^[0-9]+$/.test(trimmedEmergMobile)) {
      newErrors.emergency_mobile = 'Only numbers allowed';
    } else if (trimmedEmergMobile.length !== 10) {
      newErrors.emergency_mobile = 'Must be exactly 10 digits';
    } else if (!/^[6-9]/.test(trimmedEmergMobile)) {
      newErrors.emergency_mobile = 'Must start with 6, 7, 8, or 9';
    }

    // 11. Emergency person name (Text only, no numbers)
    const trimmedPersonName = form.emergency_person_name.trim();
    if (!trimmedPersonName) {
      newErrors.emergency_person_name = 'Person name required';
    } else if (/[0-9]/.test(trimmedPersonName)) {
      newErrors.emergency_person_name = 'Only letters allowed (no numbers)';
    } else if (!/^[A-Za-z\s.'-]+$/.test(trimmedPersonName)) {
      newErrors.emergency_person_name = 'Only letters and spaces allowed';
    }

    // 12. Relation & Marital Status
    if (!form.emergency_relation) newErrors.emergency_relation = 'Relation required';
    if (!form.marital_status) newErrors.marital_status = 'Marital status required';

    // 13. Spouse name & Anniversary (Text only, dd/mm/yyyy if provided)
    if (form.marital_status === 'Married') {
      if (form.spouse_name.trim() && /[0-9]/.test(form.spouse_name)) {
        newErrors.spouse_name = 'Only letters allowed (no numbers)';
      }
      if (form.anniversary_date.trim() && !isValidDdMmYyyy(form.anniversary_date.trim())) {
        newErrors.anniversary_date = 'Must be dd/mm/yyyy';
      }
    }

    // 14. Religion & Caste (Text only if provided)
    if (form.religion.trim() && /[0-9]/.test(form.religion)) {
      newErrors.religion = 'Only letters allowed (no numbers)';
    }
    if (form.caste.trim() && /[0-9]/.test(form.caste)) {
      newErrors.caste = 'Only letters allowed (no numbers)';
    }

    // 15. Confirmation checkbox
    if (!form.confirmed) {
      newErrors.confirmed = 'Please confirm that all information provided is true.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all form fields?')) {
      setForm(initialFormValues);
      setErrors({});
      setSameAsLocal(false);
      setIsExistingRecord(false);
      setLastSearchedMobile('');
      addToast('Form has been reset.', 'info');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // If form is completely blank, don't trigger multi-field error wall
    const isBlank = !form.mobile.trim() && !form.name.trim() && !form.email.trim();
    if (isBlank) {
      setErrors({});
      addToast('Please enter mobile number to start employee registration.', 'info');
      const mobileInput = document.getElementById('field-mobile');
      if (mobileInput) mobileInput.focus();
      return;
    }

    if (!validate()) {
      // If fields are filled but only the confirmation box is unchecked
      const hasOtherErrors =
        !form.mobile.trim() ||
        !form.name.trim() ||
        !form.email.trim() ||
        !form.date_of_birth.trim() ||
        !form.gender ||
        !form.post.trim() ||
        !form.qualification.trim() ||
        !form.local_address.trim() ||
        !form.permanent_address.trim() ||
        !form.emergency_mobile.trim() ||
        !form.emergency_relation ||
        !form.emergency_person_name.trim() ||
        !form.marital_status;

      if (!hasOtherErrors && !form.confirmed) {
        addToast('Please check the confirmation box at the bottom to save.', 'warning');
      } else {
        addToast('Please complete all required fields (*)', 'error');
      }
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        mobile: form.mobile.trim(),
        name: form.name.trim(),
        post: form.post.trim(),
        email: form.email.trim(),
        date_of_birth: form.date_of_birth,
        gender: form.gender.toLowerCase(),
        local_address: form.local_address.trim(),
        permanent_address: form.permanent_address.trim(),
        landline: form.landline.trim() || null,
        qualification: form.qualification.trim(),
        computer_course: form.computer_course.trim() || null,
        interview_date: form.interview_date || null,
        reference_name: form.reference_name.trim() || null,
        date_of_joining: form.date_of_joining || null,
        experience_value: form.experience_years ? parseInt(form.experience_years, 10) : 0,
        experience_unit: 'years',
        experience_years: form.experience_years ? parseInt(form.experience_years, 10) : 0,
        experience_months: form.experience_months ? parseInt(form.experience_months, 10) : 0,
        emergency_mobile: form.emergency_mobile.trim(),
        emergency_person_name: form.emergency_person_name.trim(),
        emergency_relation: form.emergency_relation,
        blood_group: form.blood_group || null,
        willingness_donate_blood: form.willingness_donate_blood === 'Yes',
        marital_status: form.marital_status.toLowerCase(),
        medical_history: form.medical_history.trim() || null,
        legal_history: form.legal_history.trim() || null,
        religion: form.religion.trim() || null,
        caste: form.caste.trim() || null,
        spouse_name: form.spouse_name.trim() || null,
        anniversary_date: form.anniversary_date || null,
      };

      await employeeApi.registerEmployee(payload);
      if (isExistingRecord) {
        addToast('Record updated successfully!', 'success');
      } else {
        addToast('Registration completed successfully!', 'success');
        // Stay on registration form and clear all fields for new registration
        setForm(initialFormValues);
        setErrors({});
        setSameAsLocal(false);
        setIsExistingRecord(false);
        setLastSearchedMobile('');
      }
    } catch (err: any) {
      let friendlyMsg = isExistingRecord
        ? 'Failed to update registration. Please verify your details and try again.'
        : 'Failed to complete registration. Please verify your details and try again.';

      if (!err?.response) {
        if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network') || err?.message?.includes('connect')) {
          friendlyMsg = 'Unable to connect to the server. Please check your internet connection.';
        }
      } else {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 409) {
          friendlyMsg = 'An employee with this mobile number or email is already registered. Please check the entered mobile number.';
        } else if (status === 422) {
          if (Array.isArray(data?.detail) && data.detail.length > 0) {
            const first = data.detail[0];
            const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : 'field';
            friendlyMsg = `Please check the ${field}: ${first.msg || 'invalid entry'}`;
          } else {
            friendlyMsg = 'Please verify that all required fields are filled out correctly.';
          }
        } else if (status === 400) {
          if (typeof data?.detail === 'string' && !data.detail.toLowerCase().includes('status')) {
            friendlyMsg = data.detail;
          } else {
            friendlyMsg = 'Invalid request. Please check your entries and try again.';
          }
        } else if (status >= 500) {
          friendlyMsg = 'Server encountered an issue saving your registration. Please try again shortly.';
        } else if (typeof data?.detail === 'string' && !data.detail.toLowerCase().includes('status code')) {
          friendlyMsg = data.detail;
        }
      }

      addToast(friendlyMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PublicLayout maxWidth="100%" compact hideFooter>
      <div className="emp-form-wrapper">
        <div className="emp-card">
          <form onSubmit={handleSave} noValidate className="emp-form-grid">
            {/* ROW 1: Mobile No. | Employee ID | Post | Date (Today) */}
            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-mobile">
                <span>Mobile No.</span>
                {isSearching && (
                  <span className="emp-searching-badge">
                    🔍 Checking...
                  </span>
                )}
              </label>
              <input
                id="field-mobile"
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                onBlur={handleMobileBlur}
                onKeyDown={handleMobileKeyDown}
                placeholder=""
                maxLength={10}
                inputMode="numeric"
                className={`emp-input ${errors.mobile ? 'is-error' : ''}`}
              />
              {errors.mobile && <div className="emp-error-msg">{errors.mobile}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-employee-id">Employee ID</label>
              <input
                id="field-employee-id"
                type="text"
                name="employee_id"
                value={form.employee_id || (isExistingRecord ? '' : 'Auto-generated')}
                readOnly
                className="emp-input"
                style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
              />
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-post">Post</label>
              <select
                id="field-post"
                name="post"
                value={form.post}
                onChange={handleChange}
                className={`emp-select ${errors.post ? 'is-error' : ''}`}
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
                {form.post && ![
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
                ].includes(form.post) && (
                  <option value={form.post}>{form.post}</option>
                )}
              </select>
              {errors.post && <div className="emp-error-msg">{errors.post}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-today-date">
                <span>Date</span>
              </label>
              <div className="emp-date-input-wrap">
                <input
                  id="field-today-date"
                  type="text"
                  readOnly
                  value={todayDateFormatted}
                  className="emp-input"
                />
                <span className="emp-date-icon-static" aria-hidden="true">📅</span>
              </div>
            </div>

            {/* ROW 2: Name | DOB | Gender | Email */}
            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-name">Name</label>
              <input
                id="field-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onKeyDown={handleTextKeyDown}
                placeholder=""
                className={`emp-input ${errors.name ? 'is-error' : ''}`}
              />
              {errors.name && <div className="emp-error-msg">{errors.name}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-dob">DOB</label>
              <DateInputField
                id="field-dob"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleDateChange}
                onBlur={handleDobBlur}
                hasError={!!errors.date_of_birth}
              />
              {errors.date_of_birth && <div className="emp-error-msg">{errors.date_of_birth}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-gender">Gender</label>
              <select
                id="field-gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={`emp-select ${errors.gender ? 'is-error' : ''}`}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <div className="emp-error-msg">{errors.gender}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-email">Email</label>
              <input
                id="field-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                onKeyDown={handleEmailKeyDown}
                placeholder="name@example.com"
                className={`emp-input ${errors.email ? 'is-error' : ''}`}
              />
              {errors.email && <div className="emp-error-msg">{errors.email}</div>}
            </div>

            {/* ROW 3: Landline NO. | Qualification | Computer Course | Experience */}
            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-landline">Landline NO.</label>
              <input
                id="field-landline"
                type="tel"
                name="landline"
                value={form.landline}
                onChange={handleChange}
                onKeyDown={handleNumberKeyDown}
                maxLength={15}
                inputMode="numeric"
                placeholder="Max 15 digits (numbers only)"
                className={`emp-input ${errors.landline ? 'is-error' : ''}`}
              />
              {errors.landline && <div className="emp-error-msg">{errors.landline}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-qualification">Qualification</label>
              <select
                id="field-qualification"
                name="qualification"
                value={normalizeQualification(form.qualification)}
                onChange={handleChange}
                className={`emp-select ${errors.qualification ? 'is-error' : ''}`}
              >
                <option value="">Select</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="Diploma">Diploma</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="Doctorate">Doctorate</option>
                <option value="Other">Other</option>
                {form.qualification && ![
                  '',
                  '10th',
                  '12th',
                  'Diploma',
                  'Graduate',
                  'Post Graduate',
                  'Doctorate',
                  'Other'
                ].includes(normalizeQualification(form.qualification)) && (
                  <option value={form.qualification}>{form.qualification}</option>
                )}
              </select>
              {errors.qualification && <div className="emp-error-msg">{errors.qualification}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-course">Computer Course</label>
              <input
                id="field-course"
                type="text"
                name="computer_course"
                value={form.computer_course}
                onChange={handleChange}
                placeholder=""
                className="emp-input"
              />
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label">Experience, if any</label>
              <div className="emp-exp-row">
                <input
                  type="text"
                  inputMode="numeric"
                  name="experience_years"
                  value={form.experience_years}
                  onChange={handleChange}
                  onKeyDown={handleNumberKeyDown}
                  placeholder="Years"
                  maxLength={2}
                  className={`emp-input ${errors.experience_years ? 'is-error' : ''}`}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  name="experience_months"
                  value={form.experience_months}
                  onChange={handleChange}
                  onKeyDown={handleNumberKeyDown}
                  placeholder="Months"
                  maxLength={2}
                  className={`emp-input ${errors.experience_months ? 'is-error' : ''}`}
                />
              </div>
              {(errors.experience_years || errors.experience_months) && (
                <div className="emp-error-msg">{errors.experience_years || errors.experience_months}</div>
              )}
            </div>

            {/* ROW 4: Date of Interview | Date of Joining | Reference Name (span 2) */}
            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-interview-date">Date of Interview</label>
              <DateInputField
                id="field-interview-date"
                name="interview_date"
                value={form.interview_date}
                onChange={handleDateChange}
                hasError={!!errors.interview_date}
              />
              {errors.interview_date && <div className="emp-error-msg">{errors.interview_date}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-joining-date">Date of Joining</label>
              <DateInputField
                id="field-joining-date"
                name="date_of_joining"
                value={form.date_of_joining}
                onChange={handleDateChange}
                hasError={!!errors.date_of_joining}
              />
              {errors.date_of_joining && <div className="emp-error-msg">{errors.date_of_joining}</div>}
            </div>

            <div className="emp-col col-span-2">
              <label className="emp-label" htmlFor="field-reference">Reference Name</label>
              <input
                id="field-reference"
                type="text"
                name="reference_name"
                value={form.reference_name}
                onChange={handleChange}
                onKeyDown={handleTextKeyDown}
                placeholder=""
                className={`emp-input ${errors.reference_name ? 'is-error' : ''}`}
              />
              {errors.reference_name && <div className="emp-error-msg">{errors.reference_name}</div>}
            </div>

            {/* ROW 5: Emerg. Mobile NO | Relation | Person Name (span 2) */}
            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-emergency-mobile">Emerg. Mobile NO</label>
              <input
                id="field-emergency-mobile"
                type="tel"
                name="emergency_mobile"
                value={form.emergency_mobile}
                onChange={handleChange}
                onKeyDown={handleNumberKeyDown}
                placeholder=""
                maxLength={10}
                inputMode="numeric"
                className={`emp-input ${errors.emergency_mobile ? 'is-error' : ''}`}
              />
              {errors.emergency_mobile && <div className="emp-error-msg">{errors.emergency_mobile}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-emergency-relation">Relation</label>
              <select
                id="field-emergency-relation"
                name="emergency_relation"
                value={form.emergency_relation}
                onChange={handleChange}
                className={`emp-select ${errors.emergency_relation ? 'is-error' : ''}`}
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
              </select>
              {errors.emergency_relation && <div className="emp-error-msg">{errors.emergency_relation}</div>}
            </div>

            <div className="emp-col col-span-2">
              <label className="emp-label" htmlFor="field-emergency-person">Person Name (Emergency)</label>
              <input
                id="field-emergency-person"
                type="text"
                name="emergency_person_name"
                value={form.emergency_person_name}
                onChange={handleChange}
                onKeyDown={handleTextKeyDown}
                placeholder=""
                className={`emp-input ${errors.emergency_person_name ? 'is-error' : ''}`}
              />
              {errors.emergency_person_name && <div className="emp-error-msg">{errors.emergency_person_name}</div>}
            </div>

            {/* ROW 6: Religion | Caste | Blood Group | Willingness to donate Blood */}
            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-religion">Religion</label>
              <select
                id="field-religion"
                name="religion"
                value={form.religion}
                onChange={handleChange}
                className={`emp-select ${errors.religion ? 'is-error' : ''}`}
              >
                <option value="">Select</option>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Jain">Jain</option>
                <option value="Parsi">Parsi</option>
                <option value="Other">Other</option>
                {form.religion && ![
                  '',
                  'Hindu',
                  'Muslim',
                  'Christian',
                  'Sikh',
                  'Buddhist',
                  'Jain',
                  'Parsi',
                  'Other'
                ].includes(form.religion) && (
                  <option value={form.religion}>{form.religion}</option>
                )}
              </select>
              {errors.religion && <div className="emp-error-msg">{errors.religion}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-caste">Caste</label>
              <select
                id="field-caste"
                name="caste"
                value={form.caste}
                onChange={handleChange}
                className={`emp-select ${errors.caste ? 'is-error' : ''}`}
              >
                <option value="">Select</option>
                <option value="General / Open">General / Open</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="VJNT / NT">VJNT / NT</option>
                <option value="SBC">SBC</option>
                <option value="Maratha">Maratha</option>
                <option value="Brahmin">Brahmin</option>
                <option value="Jain">Jain</option>
                <option value="Other">Other</option>
                {form.caste && ![
                  '',
                  'General / Open',
                  'OBC',
                  'SC',
                  'ST',
                  'EWS',
                  'VJNT / NT',
                  'SBC',
                  'Maratha',
                  'Brahmin',
                  'Jain',
                  'Other'
                ].includes(form.caste) && (
                  <option value={form.caste}>{form.caste}</option>
                )}
              </select>
              {errors.caste && <div className="emp-error-msg">{errors.caste}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-blood-group">Blood Group</label>
              <select
                id="field-blood-group"
                name="blood_group"
                value={form.blood_group}
                onChange={handleChange}
                className="emp-select"
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

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-donate-blood">Willingness to donate Blood</label>
              <select
                id="field-donate-blood"
                name="willingness_donate_blood"
                value={form.willingness_donate_blood}
                onChange={handleChange}
                className="emp-select"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* ROW 7: Marital status | Anniversary date | Spouse name (span 2) */}
            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-marital-status">Marital status</label>
              <select
                id="field-marital-status"
                name="marital_status"
                value={form.marital_status}
                onChange={handleChange}
                className={`emp-select ${errors.marital_status ? 'is-error' : ''}`}
              >
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
              {errors.marital_status && <div className="emp-error-msg">{errors.marital_status}</div>}
            </div>

            <div className="emp-col col-span-1">
              <label className="emp-label" htmlFor="field-anniversary">Anniversary date</label>
              <DateInputField
                id="field-anniversary"
                name="anniversary_date"
                value={form.anniversary_date}
                onChange={handleDateChange}
                disabled={form.marital_status !== 'Married'}
                hasError={!!errors.anniversary_date}
              />
              {errors.anniversary_date && <div className="emp-error-msg">{errors.anniversary_date}</div>}
            </div>

            <div className="emp-col col-span-2">
              <label className="emp-label" htmlFor="field-spouse">Spouse name</label>
              <input
                id="field-spouse"
                type="text"
                name="spouse_name"
                value={form.spouse_name}
                onChange={handleChange}
                onKeyDown={handleTextKeyDown}
                disabled={form.marital_status !== 'Married'}
                placeholder=""
                className={`emp-input ${errors.spouse_name ? 'is-error' : ''}`}
              />
              {errors.spouse_name && <div className="emp-error-msg">{errors.spouse_name}</div>}
            </div>

            {/* ROW 8: Local Address (span 2) | Permanent Address (span 2) + Checkbox */}
            <div className="emp-col col-span-2">
              <label className="emp-label" htmlFor="field-local-address">Local Address</label>
              <textarea
                id="field-local-address"
                name="local_address"
                value={form.local_address}
                onChange={handleChange}
                placeholder="Enter local address"
                rows={2}
                className={`emp-textarea ${errors.local_address ? 'is-error' : ''}`}
              />
              {errors.local_address && <div className="emp-error-msg">{errors.local_address}</div>}
            </div>

            <div className="emp-col col-span-2">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="emp-label" htmlFor="field-permanent-address" style={{ marginBottom: 0 }}>
                  Permanent Address
                </label>
                <label className="emp-checkbox-label">
                  <input
                    type="checkbox"
                    id="check-same-as-local"
                    checked={sameAsLocal}
                    onChange={handleToggleSameAsLocal}
                  />
                  <span>Same as Local</span>
                </label>
              </div>
              <textarea
                id="field-permanent-address"
                name="permanent_address"
                value={form.permanent_address}
                onChange={handleChange}
                placeholder="Enter permanent address"
                rows={2}
                className={`emp-textarea ${errors.permanent_address ? 'is-error' : ''}`}
              />
              {errors.permanent_address && <div className="emp-error-msg">{errors.permanent_address}</div>}
            </div>

            {/* ROW 9: Any Medical History (span 2) | Any legal history (span 2) */}
            <div className="emp-col col-span-2">
              <label className="emp-label" htmlFor="field-medical">Any Medical History</label>
              <textarea
                id="field-medical"
                name="medical_history"
                value={form.medical_history}
                onChange={handleChange}
                rows={2}
                className="emp-textarea"
              />
            </div>

            <div className="emp-col col-span-2">
              <label className="emp-label" htmlFor="field-legal">Any legal history</label>
              <textarea
                id="field-legal"
                name="legal_history"
                value={form.legal_history}
                onChange={handleChange}
                rows={2}
                className="emp-textarea"
              />
            </div>

            {/* ROW 10: Confirmation and Action Buttons (span 4) */}
            <div className="emp-actions-row col-span-4">
              <div>
                <label className="emp-checkbox-label">
                  <input
                    type="checkbox"
                    id="field-confirmed"
                    name="confirmed"
                    checked={form.confirmed}
                    onChange={handleChange}
                  />
                  <span>I confirm that the information provided above is true and accurate.</span>
                </label>
                {errors.confirmed && <div className="emp-error-msg">{errors.confirmed}</div>}
              </div>

              <div className="emp-btn-group">
                <button
                  type="button"
                  onClick={handleReset}
                  className="emp-btn-reset"
                  id="btn-reset-form"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="emp-btn-action"
                  id="btn-save-form"
                >
                  {isSaving
                    ? (isExistingRecord ? 'Updating...' : 'Saving...')
                    : (isExistingRecord ? 'Update' : 'Save Form')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}

export default EmployeeFormPage;
