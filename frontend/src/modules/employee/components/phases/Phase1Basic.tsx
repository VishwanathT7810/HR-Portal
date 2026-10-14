import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { phase1Schema, Phase1SchemaType } from '../../validation/phaseValidators';
import { employeeApi } from '../../services/employeeApi';

export function Phase1Basic() {
  const { formData, setPhaseData, fieldErrors, goNext } = useEmployeeForm();
  const p1 = formData.phase1;

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<{
    type: 'success' | 'info';
    text: string;
    ref?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: rhfErrors },
  } = useForm<Phase1SchemaType>({
    resolver: zodResolver(phase1Schema),
    defaultValues: {
      mobile: p1.mobile || '',
      post: p1.post || '',
      name: p1.name || '',
      email: p1.email || '',
      dateOfBirth: p1.dateOfBirth || '',
      gender: p1.gender,
      localAddress: p1.localAddress || '',
      permanentAddress: p1.permanentAddress || '',
      landline: p1.landline || '',
      sameAddress: p1.sameAddress || false,
    },
    mode: 'onTouched',
  });

  const sameAddress = watch('sameAddress');
  const localAddress = watch('localAddress');
  const mobile = watch('mobile');
  const name = watch('name');
  const email = watch('email');
  const post = watch('post');
  const dateOfBirth = watch('dateOfBirth');
  const gender = watch('gender');
  const landline = watch('landline');
  const permanentAddress = watch('permanentAddress');

  const handleLookup = async (mobileNum: string) => {
    const cleaned = (mobileNum || '').trim();
    if (cleaned.length !== 10) return;
    setLookupLoading(true);
    setLookupMessage(null);
    try {
      const record = await employeeApi.lookupByMobile(cleaned);
      if (record) {
        setValue('name', record.name || '', { shouldValidate: true });
        setValue('email', record.email || '', { shouldValidate: true });
        setValue('post', record.post || '', { shouldValidate: true });
        setValue('dateOfBirth', record.date_of_birth || '', { shouldValidate: true });
        if (record.gender) {
          setValue('gender', record.gender.toLowerCase() as any, { shouldValidate: true });
        }
        setValue('localAddress', record.local_address || '', { shouldValidate: true });
        setValue('permanentAddress', record.permanent_address || '', { shouldValidate: true });
        setValue('landline', record.landline || '', { shouldValidate: true });

        // Update Phase 2
        setPhaseData(2, {
          qualification: record.qualification || '',
          computerCourse: record.computer_course || '',
          interviewDate: record.interview_date || '',
          referenceName: record.reference_name || '',
          dateOfJoining: record.date_of_joining || '',
          experienceValue: record.experience_value != null ? record.experience_value : undefined,
          experienceUnit: record.experience_unit ? (record.experience_unit.toLowerCase() as any) : undefined,
        });

        // Update Phase 3
        setPhaseData(3, {
          emergencyMobile: record.emergency_mobile || '',
          emergencyPersonName: record.emergency_person_name || '',
          emergencyRelation: record.emergency_relation || '',
          bloodGroup: record.blood_group as any,
          willingnessDonateBlood: record.willingness_donate_blood ?? false,
          maritalStatus: record.marital_status ? (record.marital_status.toLowerCase() as any) : undefined,
          medicalHistory: record.medical_history || '',
          legalHistory: record.legal_history || '',
        });

        // Update Phase 4
        setPhaseData(4, {
          religion: record.religion || '',
          caste: record.caste || '',
          spouseName: record.spouse_name || '',
          anniversaryDate: record.anniversary_date || '',
        });

        setLookupMessage({
          type: 'success',
          text: `Previous submission found for ${record.name}. Your details have been auto-filled so you can edit and update them.`,
          ref: record.submission_reference,
        });
      } else {
        setLookupMessage({
          type: 'info',
          text: 'No prior registration found for this mobile number. You can fill in your details below.',
        });
      }
    } catch {
      // Ignore network errors on lookup
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    const sub = watch((value: Record<string, any>, { name: fieldName }: any) => {
      const update: Partial<typeof p1> = {};
      let changed = false;
      const keys: (keyof Phase1SchemaType)[] = [
        'mobile','post','name','email','dateOfBirth',
        'gender','localAddress','permanentAddress','landline','sameAddress'
      ];
      for (const k of keys) {
        if (value[k] !== undefined) {
          (update as Record<string, unknown>)[k] = value[k];
          changed = true;
        }
      }
      if (sameAddress && (fieldName === 'sameAddress' || fieldName === 'localAddress')) {
        if (value.localAddress !== undefined) {
          update.permanentAddress = value.localAddress;
          update.sameAddress = true;
          setValue('permanentAddress', value.localAddress as string, { shouldValidate: false });
        }
      }
      if (changed) setPhaseData(1, update);
    });
    return () => sub?.unsubscribe?.();
  }, [watch, setPhaseData, sameAddress, setValue]);

  const onNext = handleSubmit(() => {
    setPhaseData(1, {
      mobile,
      post,
      name,
      email,
      dateOfBirth,
      gender,
      localAddress,
      permanentAddress,
      landline,
      sameAddress,
    });
    goNext();
  });

  const err = (key: string) =>
    (rhfErrors as Record<string, { message?: string }>)[key]?.message ||
    fieldErrors[key];

  const inputCls = (key: string) =>
    `ds-input ${err(key) ? 'ds-input-error' : ''}`;

  const selectCls = (key: string) =>
    `ds-select ${err(key) ? 'ds-select-error' : ''}`;

  const textareaCls = (key: string) =>
    `ds-textarea ${err(key) ? 'ds-textarea-error' : ''}`;

  return (
    <form onSubmit={onNext} className="ds-flex ds-flex-col ds-gap-4">
      <div className="ds-form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor="mobile" className="ds-form-label ds-form-label-required">
            Mobile Number
          </label>
          {lookupLoading && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
              Checking records... ⏳
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            id="mobile"
            type="tel"
            inputMode="numeric"
            placeholder="Enter 10-digit mobile no."
            className={inputCls('mobile')}
            {...register('mobile')}
            onBlur={(e) => {
              if (e.target.value && e.target.value.length === 10) {
                handleLookup(e.target.value);
              }
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={() => handleLookup(mobile)}
            disabled={lookupLoading || !mobile || mobile.length < 10}
            className="btn btn-secondary"
            style={{
              minHeight: '42px',
              padding: '0 0.875rem',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            title="Check if you previously submitted data with this mobile number"
          >
            {lookupLoading ? 'Checking...' : '🔍 Find Previous Data'}
          </button>
        </div>
        {err('mobile') && <span className="ds-form-error">{err('mobile')}</span>}
        <span className="ds-form-hint">
          Must start with 6-9. Entering your registered mobile will auto-load your previously saved data for editing.
        </span>

        {lookupMessage && (
          <div
            style={{
              marginTop: '0.625rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              lineHeight: 1.45,
              backgroundColor: lookupMessage.type === 'success' ? 'rgba(22, 163, 74, 0.1)' : 'var(--color-surface-hover)',
              border: `1px solid ${lookupMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-border)'}`,
              color: lookupMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-text-muted)',
            }}
          >
            {lookupMessage.ref && (
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                Existing Record Found: Ref #{lookupMessage.ref}
              </div>
            )}
            <div>{lookupMessage.text}</div>
          </div>
        )}
      </div>

      <div className="ds-form-group">
        <label htmlFor="post" className="ds-form-label ds-form-label-optional">
          Post Applied For
        </label>
        <input
          id="post"
          type="text"
          placeholder="e.g. Sales Executive"
          className={inputCls('post')}
          {...register('post')}
        />
        {err('post') && <span className="ds-form-error">{err('post')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="name" className="ds-form-label ds-form-label-required">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter full name"
          className={inputCls('name')}
          {...register('name')}
        />
        {err('name') && <span className="ds-form-error">{err('name')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="email" className="ds-form-label ds-form-label-optional">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="name@example.com"
          className={inputCls('email')}
          {...register('email')}
        />
        {err('email') && <span className="ds-form-error">{err('email')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="dateOfBirth" className="ds-form-label ds-form-label-optional">
          Date of Birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          className={inputCls('dateOfBirth')}
          {...register('dateOfBirth')}
        />
        {err('dateOfBirth') && <span className="ds-form-error">{err('dateOfBirth')}</span>}
      </div>

      <div className="ds-form-group">
        <span className="ds-form-label ds-form-label-optional">Gender</span>
        <div className="ds-radio-group">
          {(['male', 'female', 'other'] as const).map((g) => (
            <label key={g} className="ds-radio-card" htmlFor={`gender-${g}`}>
              <input
                id={`gender-${g}`} type="radio" value={g}
                {...register('gender')}
              />
              <span>{g.charAt(0).toUpperCase() + g.slice(1)}</span>
            </label>
          ))}
        </div>
        {err('gender') && <span className="ds-form-error">{err('gender')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="localAddress" className="ds-form-label ds-form-label-optional">
          Local Address
        </label>
        <textarea
          id="localAddress"
          rows={3}
          placeholder="Enter current local address"
          className={textareaCls('localAddress')}
          {...register('localAddress')}
        />
        {err('localAddress') && <span className="ds-form-error">{err('localAddress')}</span>}
      </div>

      <label className="ds-check-field">
        <input
          type="checkbox"
          {...register('sameAddress')}
        />
        <span className="ds-check-field-label">
          Permanent Address same as Local
        </span>
      </label>

      <div className="ds-form-group">
        <label htmlFor="permanentAddress" className="ds-form-label ds-form-label-optional">
          Permanent Address
        </label>
        <textarea
          id="permanentAddress"
          rows={3}
          placeholder="Enter permanent address"
          className={textareaCls('permanentAddress')}
          disabled={sameAddress}
          {...register('permanentAddress')}
        />
        {err('permanentAddress') && <span className="ds-form-error">{err('permanentAddress')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="landline" className="ds-form-label ds-form-label-optional">
          Landline Number
        </label>
        <input
          id="landline"
          type="tel"
          placeholder="Optional"
          className={inputCls('landline')}
          {...register('landline')}
        />
        {err('landline') && <span className="ds-form-error">{err('landline')}</span>}
      </div>

      {fieldErrors._form && (
        <div className="ds-text-error ds-text-sm ds-mt-2">
          {fieldErrors._form}
        </div>
      )}

      <div className="ds-flex ds-justify-end ds-mt-4">
        <button type="submit" className="ds-btn ds-btn-primary">
          Next
        </button>
      </div>
    </form>
  );
}
