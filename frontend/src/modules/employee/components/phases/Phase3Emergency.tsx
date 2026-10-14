import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { phase3Schema, Phase3SchemaType } from '../../validation/phaseValidators';
import { BloodGroup, MaritalStatus } from '../../types/employee.types';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function Phase3Emergency() {
  const { formData, setPhaseData, fieldErrors, goNext, goBack } = useEmployeeForm();
  const p3 = formData.phase3;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: rhfErrors },
  } = useForm<Phase3SchemaType>({
    resolver: zodResolver(phase3Schema),
    defaultValues: {
      emergencyMobile: p3.emergencyMobile || '',
      emergencyPersonName: p3.emergencyPersonName || '',
      emergencyRelation: p3.emergencyRelation || '',
      bloodGroup: p3.bloodGroup,
      willingnessDonateBlood: p3.willingnessDonateBlood,
      maritalStatus: p3.maritalStatus,
      medicalHistory: p3.medicalHistory || '',
      legalHistory: p3.legalHistory || '',
    },
    mode: 'onTouched',
  });

  React.useEffect(() => {
    const sub = watch((value: any) => {
      setPhaseData(3, {
        emergencyMobile: value.emergencyMobile ?? '',
        emergencyPersonName: value.emergencyPersonName ?? '',
        emergencyRelation: value.emergencyRelation ?? '',
        bloodGroup: value.bloodGroup,
        willingnessDonateBlood: value.willingnessDonateBlood,
        maritalStatus: value.maritalStatus,
        medicalHistory: value.medicalHistory ?? '',
        legalHistory: value.legalHistory ?? '',
      });
    });
    return () => sub?.unsubscribe?.();
  }, [watch, setPhaseData]);

  const onNext = handleSubmit(() => {
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

  const bloodGroup = watch('bloodGroup');
  const maritalStatus = watch('maritalStatus');
  const willingnessDonateBlood = watch('willingnessDonateBlood');

  return (
    <form onSubmit={onNext} className="ds-flex ds-flex-col ds-gap-4">
      <div className="ds-form-group">
        <label htmlFor="emergencyPersonName" className="ds-form-label ds-form-label-optional">
          Emergency Contact Person
        </label>
        <input
          id="emergencyPersonName"
          type="text"
          placeholder="Name of emergency contact"
          className={inputCls('emergencyPersonName')}
          {...register('emergencyPersonName')}
        />
        {err('emergencyPersonName') && <span className="ds-form-error">{err('emergencyPersonName')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="emergencyMobile" className="ds-form-label ds-form-label-optional">
          Emergency Contact Mobile
        </label>
        <input
          id="emergencyMobile"
          type="tel"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          className={inputCls('emergencyMobile')}
          {...register('emergencyMobile')}
        />
        {err('emergencyMobile') && <span className="ds-form-error">{err('emergencyMobile')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="emergencyRelation" className="ds-form-label ds-form-label-optional">
          Relation with Emergency Contact
        </label>
        <input
          id="emergencyRelation"
          type="text"
          placeholder="e.g. Father, Mother, Spouse, Friend"
          className={inputCls('emergencyRelation')}
          {...register('emergencyRelation')}
        />
        {err('emergencyRelation') && <span className="ds-form-error">{err('emergencyRelation')}</span>}
      </div>

      <hr className="ds-divider" />

      <div className="ds-form-group">
        <label htmlFor="bloodGroup" className="ds-form-label ds-form-label-optional">
          Blood Group
        </label>
        <div className="ds-select-wrapper">
          <select
            id="bloodGroup"
            className={selectCls('bloodGroup')}
            value={bloodGroup ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              const casted = (val === '' ? undefined : (val as BloodGroup));
              register('bloodGroup').onChange({ target: { value: casted } });
              setPhaseData(3, { bloodGroup: casted });
            }}
          >
            <option value="">Select blood group</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        {err('bloodGroup') && <span className="ds-form-error">{err('bloodGroup')}</span>}
      </div>

      <div className="ds-form-group">
        <span className="ds-form-label ds-form-label-optional">
          Willingness to Donate Blood
        </span>
        <div className="ds-radio-group">
          <label className="ds-radio-card" htmlFor="donate-yes">
            <input
              id="donate-yes"
              type="radio"
              value="yes"
              checked={willingnessDonateBlood === true}
              onChange={() => {
                register('willingnessDonateBlood').onChange({ target: { value: true, checked: true } });
                setPhaseData(3, { willingnessDonateBlood: true });
              }}
            />
            <span>Yes</span>
          </label>
          <label className="ds-radio-card" htmlFor="donate-no">
            <input
              id="donate-no"
              type="radio"
              value="no"
              checked={willingnessDonateBlood === false}
              onChange={() => {
                register('willingnessDonateBlood').onChange({ target: { value: false, checked: true } });
                setPhaseData(3, { willingnessDonateBlood: false });
              }}
            />
            <span>No</span>
          </label>
        </div>
        {err('willingnessDonateBlood') && <span className="ds-form-error">{err('willingnessDonateBlood')}</span>}
      </div>

      <div className="ds-form-group">
        <span className="ds-form-label ds-form-label-optional">Marital Status</span>
        <div className="ds-radio-group">
          {(['single', 'married', 'other'] as MaritalStatus[]).map((ms) => (
            <label key={ms} className="ds-radio-card" htmlFor={`ms-${ms}`}>
              <input
                id={`ms-${ms}`}
                type="radio"
                value={ms}
                checked={maritalStatus === ms}
                onChange={() => {
                  register('maritalStatus').onChange({ target: { value: ms, checked: true } });
                  setPhaseData(3, { maritalStatus: ms });
                }}
              />
              <span>{ms.charAt(0).toUpperCase() + ms.slice(1)}</span>
            </label>
          ))}
        </div>
        {err('maritalStatus') && <span className="ds-form-error">{err('maritalStatus')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="medicalHistory" className="ds-form-label ds-form-label-optional">
          Medical History (if any)
        </label>
        <textarea
          id="medicalHistory"
          rows={3}
          placeholder="Mention any allergies, ongoing treatment, etc."
          className={textareaCls('medicalHistory')}
          {...register('medicalHistory')}
        />
        {err('medicalHistory') && <span className="ds-form-error">{err('medicalHistory')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="legalHistory" className="ds-form-label ds-form-label-optional">
          Legal History (if any)
        </label>
        <textarea
          id="legalHistory"
          rows={3}
          placeholder="Mention any pending cases, etc."
          className={textareaCls('legalHistory')}
          {...register('legalHistory')}
        />
        {err('legalHistory') && <span className="ds-form-error">{err('legalHistory')}</span>}
      </div>

      {fieldErrors._form && (
        <div className="ds-text-error ds-text-sm ds-mt-2">
          {fieldErrors._form}
        </div>
      )}

      <div className="ds-flex ds-justify-between ds-mt-4 ds-gap-3">
        <button
          type="button"
          className="ds-btn ds-btn-secondary"
          onClick={goBack}
        >
          Back
        </button>
        <button type="submit" className="ds-btn ds-btn-primary">
          Next
        </button>
      </div>
    </form>
  );
}
