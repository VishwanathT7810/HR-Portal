import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';

export function FormErrorPage() {
  const [params] = useSearchParams();
  const reason = params.get('reason');

  const isExpired = reason === 'expired';

  const title = isExpired
    ? 'This form link has expired'
    : 'This form link is no longer valid';

  const subtext = isExpired
    ? 'The invitation to fill this form has expired. Please contact your HR or administrator to request a new link.'
    : 'We couldn’t verify this form link. It may have been used already, revoked, or is incorrectly formatted.';

  return (
    <PublicLayout>
      <div className="ds-container">
        <div className="ds-max-w-md ds-mx-auto ds-py-10">
          <div className="ds-card ds-overflow-hidden">
            <div className="ds-card-body ds-text-center ds-flex ds-flex-col ds-items-center ds-p-6 sm:ds-p-8">
              <svg
                className="ds-icon-error ds-mb-5"
                viewBox="0 0 80 80"
                fill="none"
                aria-hidden="true"
                style={{ width: 80, height: 80 }}
              >
                <circle
                  cx="40"
                  cy="40"
                  r="38"
                  fill="currentColor"
                  opacity="0.12"
                />
                <path
                  d="M28 28l24 24M52 28L28 52"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>

              <h1 className="ds-text-2xl sm:ds-text-3xl ds-font-bold ds-mb-3">
                {title}
              </h1>

              <p className="ds-text-muted ds-mb-6 ds-text-base">
                {subtext}
              </p>

              <div className="ds-w-full ds-p-4 ds-bg-surface ds-radius-lg ds-mb-6 ds-text-left">
                <div className="ds-text-sm ds-font-medium ds-mb-1">
                  What you can do:
                </div>
                <ul className="ds-text-sm ds-text-muted ds-list-disc ds-pl-5 ds-mt-2 ds-space-y-1">
                  <li>Double-check that you opened the correct link.</li>
                  <li>
                    Contact your HR / administrator to request a new form link.
                  </li>
                  <li>
                    If you believe you received this message in error, reach
                    out to support.
                  </li>
                </ul>
              </div>

              <div className="ds-flex ds-gap-3 ds-w-full ds-justify-center ds-flex-wrap">
                <button
                  type="button"
                  className="ds-btn ds-btn-primary"
                  onClick={() => {
                    window.location.href = '/';
                  }}
                >
                  Go to Home
                </button>
                <button
                  type="button"
                  className="ds-btn ds-btn-secondary"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
