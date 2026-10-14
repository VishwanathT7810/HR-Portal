import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { phase4Schema, Phase4SchemaType } from '../../validation/phaseValidators';

export function Phase4Additional() {
  const { formData, setPhaseData, fieldErrors, goNext, goBack } = useEmployeeForm();
  const p4 = formData.phase4;
  const maritalStatus = formData.phase3.maritalStatus;
  const isMarried = maritalStatus === 'married';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: rhfErrors },
  } = useForm<Phase4SchemaType>({
    resolver: zodResolver(phase4Schema),
    defaultValues: {
      religion: p4.religion || '',
      caste: p4.caste || '',
      spouseName: p4.spouseName || '',
      anniversaryDate: p4.anniversaryDate || '',
    },
    mode: 'onTouched',
  });

  React.useEffect(() => {
    if (!isMarried) {
      setValue('spouseName', '', { shouldValidate: true });
      setValue('anniversaryDate', '', { shouldValidate: true });
      setPhaseData(4, { spouseName: '', anniversaryDate: '' });
    }
  }, [isMarried, setValue, setPhaseData]);

  React.useEffect(() => {
    const sub = watch((value: any) => {
      setPhaseData(4, {
        religion: value.religion ?? '',
        caste: value.caste ?? '',
        spouseName: value.spouseName ?? '',
        anniversaryDate: value.anniversaryDate ?? '',
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

  return (
    <form onSubmit={onNext} className="ds-flex ds-flex-col ds-gap-4">
      <div className="ds-form-group">
        <label htmlFor="religion" className="ds-form-label ds-form-label-optional">
          Religion
        </label>
        <input
          id="religion"
          type="text"
          placeholder="e.g. Hindu, Muslim, Christian, Sikh"
          className={inputCls('religion')}
          {...register('religion')}
        />
        {err('religion') && <span className="ds-form-error">{err('religion')}</span>}
      </div>

      <div className="ds-form-group">
        <label htmlFor="caste" className="ds-form-label ds-form-label-optional">
          Caste / Category
        </label>
        <input
          id="caste"
          type="text"
          placeholder="e.g. General, OBC, SC, ST"
          className={inputCls('caste')}
          {...register('caste')}
        />
        {err('caste') && <span className="ds-form-error">{err('caste')}</span>}
      </div>

      <hr className="ds-divider" />

      {isMarried ? (
        <>
          <div className="ds-form-group">
            <label htmlFor="spouseName" className="ds-form-label ds-form-label-optional">
              Spouse Name
            </label>
            <input
              id="spouseName"
              type="text"
              placeholder="Enter spouse full name"
              className={inputCls('spouseName')}
              {...register('spouseName')}
            />
            {err('spouseName') && <span className="ds-form-error">{err('spouseName')}</span>}
          </div>

          <div className="ds-form-group">
            <label htmlFor="anniversaryDate" className="ds-form-label ds-form-label-optional">
              Marriage Anniversary Date
            </label>
            <input
              id="anniversaryDate"
              type="date"
              className={inputCls('anniversaryDate')}
              {...register('anniversaryDate')}
            />
            {err('anniversaryDate') && <span className="ds-form-error">{err('anniversaryDate')}</span>}
          </div>
        </>
      ) : (
        <div className="ds-card ds-card-body ds-text-muted ds-text-sm">
          Spouse name and anniversary date are only required when marital status is set to
          &quot;Married&quot; on the previous step.
        </div>
      )}

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
