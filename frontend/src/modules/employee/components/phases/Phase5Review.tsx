import React from 'react';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';

type PhaseNumber = 1 | 2 | 3 | 4 | 5;

interface ReviewRow {
  label: string;
  value?: string | number | null | boolean;
}

interface ReviewSectionProps {
  title: string;
  editPhase?: PhaseNumber;
  rows: ReviewRow[];
  goToPhase: (phase: PhaseNumber) => void;
}

function formatValue(v: ReviewRow['value']): string {
  if (v === undefined || v === null || v === '') return '';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}

function ReviewSection({ title, editPhase, rows, goToPhase }: ReviewSectionProps) {
  const hasAny = rows.some((r) => formatValue(r.value));
  return (
    <section className="ds-review-section">
      <div className="ds-review-section-header">
        <h3 className="ds-review-section-title">{title}</h3>
        {editPhase && (
          <button
            type="button"
            className="ds-btn ds-btn-ghost ds-btn-sm"
            onClick={() => goToPhase(editPhase)}
          >
            Edit
          </button>
        )}
      </div>
      {!hasAny ? (
        <div className="ds-review-empty">No information provided.</div>
      ) : (
        <div className="ds-review-grid">
          {rows.map((row) => (
            <div key={row.label} className="ds-review-item">
              <span className="ds-review-label">{row.label}</span>
              <span className="ds-review-value">
                {formatValue(row.value) || (
                  <span className="ds-review-empty">—</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface Phase5ReviewProps {
  token?: string;
  onSubmitSuccess: (ref: string) => void;
}

export function Phase5Review({ token, onSubmitSuccess }: Phase5ReviewProps) {
  const { formData, goToPhase, isSubmitting, fieldErrors, submit, goBack } =
    useEmployeeForm();

  const { phase1, phase2, phase3, phase4 } = formData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submit(token);
    if (result) {
      onSubmitSuccess(result.submissionReference);
    }
  };

  const formattedGender = phase1.gender
    ? phase1.gender.charAt(0).toUpperCase() + phase1.gender.slice(1)
    : '';
  const formattedMaritalStatus = phase3.maritalStatus
    ? phase3.maritalStatus.charAt(0).toUpperCase() + phase3.maritalStatus.slice(1)
    : '';
  const formattedExpUnit = phase2.experienceUnit
    ? phase2.experienceUnit.charAt(0).toUpperCase() + phase2.experienceUnit.slice(1)
    : '';
  const experience =
    phase2.experienceValue != null && phase2.experienceUnit
      ? `${phase2.experienceValue} ${formattedExpUnit}`
      : '';

  return (
    <form onSubmit={handleSubmit} className="ds-flex ds-flex-col ds-gap-0">
      <div className="ds-text-sm ds-text-muted ds-mb-4">
        Please review the information below carefully before submitting. Use the
        Edit buttons to go back and make changes.
      </div>

      <ReviewSection
        title="Basic Information"
        editPhase={1}
        goToPhase={goToPhase}
        rows={[
          { label: 'Full Name', value: phase1.name },
          { label: 'Mobile Number', value: phase1.mobile },
          { label: 'Post Applied For', value: phase1.post },
          { label: 'Email', value: phase1.email },
          { label: 'Date of Birth', value: phase1.dateOfBirth },
          { label: 'Gender', value: formattedGender },
          { label: 'Landline', value: phase1.landline },
        ]}
      />

      <ReviewSection
        title="Address"
        editPhase={1}
        goToPhase={goToPhase}
        rows={[
          { label: 'Local Address', value: phase1.localAddress },
          { label: 'Permanent Address', value: phase1.permanentAddress },
        ]}
      />

      <ReviewSection
        title="Education & Employment"
        editPhase={2}
        goToPhase={goToPhase}
        rows={[
          { label: 'Qualification', value: phase2.qualification },
          { label: 'Computer Course / IT Skills', value: phase2.computerCourse },
          { label: 'Interview Date', value: phase2.interviewDate },
          { label: 'Reference Name', value: phase2.referenceName },
          { label: 'Expected Date of Joining', value: phase2.dateOfJoining },
          { label: 'Experience', value: experience },
        ]}
      />

      <ReviewSection
        title="Emergency Contact"
        editPhase={3}
        goToPhase={goToPhase}
        rows={[
          { label: 'Contact Person', value: phase3.emergencyPersonName },
          { label: 'Contact Mobile', value: phase3.emergencyMobile },
          { label: 'Relation', value: phase3.emergencyRelation },
        ]}
      />

      <ReviewSection
        title="Personal Information"
        editPhase={3}
        goToPhase={goToPhase}
        rows={[
          { label: 'Blood Group', value: phase3.bloodGroup },
          { label: 'Willing to Donate Blood', value: phase3.willingnessDonateBlood },
          { label: 'Marital Status', value: formattedMaritalStatus },
          { label: 'Medical History', value: phase3.medicalHistory },
          { label: 'Legal History', value: phase3.legalHistory },
        ]}
      />

      <ReviewSection
        title="Additional Information"
        editPhase={4}
        goToPhase={goToPhase}
        rows={[
          { label: 'Religion', value: phase4.religion },
          { label: 'Caste / Category', value: phase4.caste },
          { label: 'Spouse Name', value: phase4.spouseName },
          { label: 'Anniversary Date', value: phase4.anniversaryDate },
        ]}
      />

      {fieldErrors._form && (
        <div className="ds-text-error ds-text-sm ds-mb-4 ds-p-3 ds-bg-surface ds-radius-md">
          {fieldErrors._form}
        </div>
      )}

      <div className="ds-flex ds-justify-between ds-mt-6 ds-gap-3 ds-flex-wrap">
        <button
          type="button"
          className="ds-btn ds-btn-secondary"
          onClick={goBack}
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          type="submit"
          className="ds-btn ds-btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="ds-spinner ds-mr-2" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            'Submit Information'
          )}
        </button>
      </div>
    </form>
  );
}
