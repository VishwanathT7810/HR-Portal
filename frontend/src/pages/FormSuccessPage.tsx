import React from 'react';
import { useParams } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';

export function FormSuccessPage() {
  const { ref } = useParams<{ ref?: string }>();
  const submissionRef = ref ? decodeURIComponent(ref) : '';

  return (
    <PublicLayout>
      <div className="ds-container">
        <div className="ds-max-w-md ds-mx-auto ds-py-10">
          <div className="ds-card ds-overflow-hidden">
            <div className="ds-card-body ds-text-center ds-flex ds-flex-col ds-items-center ds-p-6 sm:ds-p-8">
              <div className="ds-icon-check ds-mb-5" aria-hidden="true">
                ✓
              </div>

              <h1 className="ds-text-2xl sm:ds-text-3xl ds-font-bold ds-mb-2">
                Employee Information
              </h1>
              <h2 className="ds-text-xl sm:ds-text-2xl ds-font-semibold ds-text-success ds-mb-4">
                Submitted Successfully
              </h2>

              <p className="ds-text-muted ds-mb-6 ds-text-base">
                Thank you for completing the form. Your information has been
                received and will be reviewed by our team.
              </p>

              <div className="ds-w-full ds-p-4 ds-bg-surface ds-radius-lg ds-mb-6 ds-text-left">
                <div className="ds-text-xs ds-text-muted ds-uppercase ds-tracking-wide ds-mb-1 ds-font-medium">
                  Submission Reference
                </div>
                <div className="ds-text-lg ds-font-semibold ds-break-all">
                  {submissionRef || (
                    <span className="ds-text-muted ds-text-sm">
                      Reference number will be sent to your registered mobile.
                    </span>
                  )}
                </div>
              </div>

              <p className="ds-text-sm ds-text-muted">
                Please keep this reference number for future correspondence.
                You may now close this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
