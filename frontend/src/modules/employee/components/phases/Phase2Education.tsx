import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { phase2Schema, Phase2SchemaType } from '../../validation/phaseValidators';

export function Phase2Education() {
  const { formData, setPhaseData, fieldErrors, goNext, goBack } = useEmployeeForm();
  const p2 = formData.phase2;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: rhfErrors },
  } = useForm<Phase2SchemaType>({
    resolver: zodResolver(phase2Schema),
    defaultValues: {
      qualification: p2.qualification || '',
      computerCourse: p2.computerCourse || '',
      interviewDate: p2.interviewDate || '',
      referenceName: p2.referenceName || '',
      dateOfJoining: p2.dateOfJoining || '',
      experienceValue: p2.experienceValue ?? null,
      experienceUnit: p2.experienceUnit,
    },
    mode: 'onTouched',
  });

  const qualification = watch('qualification');
  const computerCourse = watch('computerCourse');
  const interviewDate = watch('interviewDate');
  const referenceName = watch('referenceName');
  const dateOfJoining = watch('dateOfJoining');
  const experienceValue = watch('experienceValue');
  const experienceUnit = watch('experienceUnit');

  React.useEffect(() => {
    const sub = watch((value: any) => {
      setPhaseData(2, {
        qualification: value.qualification ?? '',
        computerCourse: value.computerCourse ?? '',
        interviewDate: value.interviewDate ?? '',
        referenceName: value.referenceName ?? '',
        dateOfJoining: value.dateOfJoining ?? '',
        experienceValue:
          value.experienceValue === undefined ? null : (value.experienceValue as number | null),
        experienceUnit: value.experienceUnit,
      });
    });
    return () => sub?.unsubscribe?.();
  }, [watch, setPhaseData]);

  const onNext = handleSubmit(() => {
    setPhaseData(2, {
      qualification,
      computerCourse,
      interviewDate,
      referenceName,
      dateOfJoining,
      experienceValue,
      experienceUnit,
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

  const handleExpValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setValue('experienceValue', null, { shouldValidate: true });
    } else {
      const n = parseFloat(raw);
      if (!Number.isNaN(n)) {
        setValue('experienceValue', n, { shouldValidate: true });
      }
    }
  };

  const displayExpValue =
    experienceValue === null || experienceValue === undefined ? '' : experienceValue;

  return (
    <form onSubmit={onNext} className="ds-flex ds-flex-col ds-gap-4">
      <div className="ds-form-group">
        <label htmlFor="qualification" className="ds-form-label ds-form-label-optional">
          Educational Qualification
        </label>
        <input
          id="qualification"
          type="text"
          placeholder="e.g. B.Com, B.Sc, MBA"
          className={inputCls('qualification')}
          {...register('qualification')}
        />
        {err('qualification') && <span className="ds-form-error">{err('qualification')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="computerCourse" className="ds-form-label ds-form-label-optional">
          Computer Course / IT Skills
        </label>
        <input
          id="computerCourse"
          type="text"
          placeholder="e.g. MS Office, Tally, DCA"
          className={inputCls('computerCourse')}
          {...register('computerCourse')}
        />
        {err('computerCourse') && <span className="ds-form-error">{err('computerCourse')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="interviewDate" className="ds-form-label ds-form-label-optional">
          Interview Date
        </label>
        <input
          id="interviewDate"
          type="date"
          className={inputCls('interviewDate')}
          {...register('interviewDate')}
        />
        {err('interviewDate') && <span className="ds-form-error">{err('interviewDate')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="referenceName" className="ds-form-label ds-form-label-optional">
          Reference Name
        </label>
        <input
          id="referenceName"
          type="text"
          placeholder="Name of reference person"
          className={inputCls('referenceName')}
          {...register('referenceName')}
        />
        {err('referenceName') && <span className="ds-form-error">{err('referenceName')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="dateOfJoining" className="ds-form-label ds-form-label-optional">
          Expected Date of Joining
        </label>
        <input
          id="dateOfJoining"
          type="date"
          className={inputCls('dateOfJoining')}
          {...register('dateOfJoining')}
        />
        {err('dateOfJoining') && <span className="ds-form-error">{err('dateOfJoining')}</span>}
      </div>

      <div className="ds-grid ds-grid-cols-1 ds-sm-grid-cols-2 ds-gap-4">
        <div className="ds-form-group">
          <label htmlFor="experienceValue" className="ds-form-label ds-form-label-optional">
            Experience
          </label>
          <input
            id="experienceValue"
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g. 2"
            className={inputCls('experienceValue')}
            value={displayExpValue}
            onChange={handleExpValueChange}
          />
          {err('experienceValue') && <span className="ds-form-error">{err('experienceValue')}</span>}
        </div>

        <div className="ds-form-group">
          <label htmlFor="experienceUnit" className="ds-form-label ds-form-label-optional">
            Unit
          </label>
          <div className="ds-select-wrapper">
            <select
              id="experienceUnit"
              className={selectCls('experienceUnit')}
              {...register('experienceUnit')}
            >
              <option value="">Select unit</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
          {err('experienceUnit') && <span className="ds-form-error">{err('experienceUnit')}</span>}
        </div>
      </div>
      <span className="ds-form-hint ds-text-sm">
        Fill both value and unit if you have prior experience.
      </span>

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
