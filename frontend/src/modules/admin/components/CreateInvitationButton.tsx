import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import cn from 'classnames'
import { createInvitation } from '../services/adminApi'
import type { InvitationResponse } from '../types/admin.types'

const invitationSchema = z.object({
  mobileNumber: z
    .string()
    .optional()
    .or(
      z
        .string()
        .regex(/^[6-9]\d{9}$/, 'Mobile must start with 6-9 and have 10 digits')
    ),
  validDays: z
    .number({ invalid_type_error: 'Valid days must be a number' })
    .int('Must be an integer')
    .min(1, 'Minimum 1 day')
    .max(365, 'Maximum 365 days')
    .default(7),
})

type InvitationFormValues = z.infer<typeof invitationSchema>

function toast(message: string, variant: 'success' | 'error' = 'success'): void {
  const el = document.createElement('div')
  const bg =
    variant === 'success' ? 'var(--color-success)' : 'var(--color-error)'
  el.textContent = message
  Object.assign(el.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: '9999',
    padding: '10px 16px',
    borderRadius: '8px',
    color: '#fff',
    backgroundColor: bg,
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxWidth: '320px',
  })
  document.body.appendChild(el)
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 300)
  }, 3000)
}

function buildFormLink(token: string): string {
  const origin = window.location.origin
  return `${origin}/employee-form/${token}`
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export default function CreateInvitationButton() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<InvitationResponse | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: { mobileNumber: '', validDays: 7 },
    mode: 'onSubmit',
  })

  function openModal() {
    setCreated(null)
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
    setCreated(null)
    reset()
  }

  async function onSubmit(values: InvitationFormValues) {
    setSubmitting(true)
    try {
      const payload: { mobileNumber?: string; validDays?: number } = {
        validDays: Number(values.validDays) || 7,
      }
      if (values.mobileNumber && values.mobileNumber.trim().length > 0) {
        payload.mobileNumber = values.mobileNumber.trim()
      }
      const result = await createInvitation(payload)
      setCreated(result)
      toast('Invitation created successfully')
    } catch (err) {
      console.error(err)
      const msg =
        err instanceof Error && err.message ? err.message : 'Failed to create invitation'
      toast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCopy() {
    if (!created) return
    const link = buildFormLink(created.token)
    const ok = await copyToClipboard(link)
    toast(ok ? 'Link copied to clipboard' : 'Copy failed, please copy manually')
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md text-white transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]',
          'hover:opacity-90 active:opacity-80'
        )}
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create Invitation
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invitation-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div
            className={cn(
              'relative w-full sm:max-w-md bg-white rounded-t-lg sm:rounded-lg shadow-lg max-h-[90vh] overflow-hidden',
              'flex flex-col'
            )}
          >
            <div
              className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--color-border)]"
            >
              <h3
                id="invitation-modal-title"
                className="text-base sm:text-lg font-semibold m-0"
                style={{ color: 'var(--color-text)' }}
              >
                Create Invitation
              </h3>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-md transition-colors',
                  'hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'
                )}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              {created ? (
                <div className="space-y-4">
                  <div
                    className="p-3 rounded-md border"
                    style={{
                      borderColor: 'var(--color-success)',
                      backgroundColor: 'rgba(34, 197, 94, 0.06)',
                    }}
                  >
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: 'var(--color-success)' }}
                    >
                      Invitation created!
                    </p>
                    {created.mobileNumber && (
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Mobile: {created.mobileNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Form Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={buildFormLink(created.token)}
                        className={cn(
                          'flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm rounded-md border',
                          'bg-[var(--color-surface)] border-[var(--color-border)]',
                          'font-mono break-all'
                        )}
                        style={{ color: 'var(--color-text)' }}
                      />
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={cn(
                          'flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md text-white',
                          'hover:opacity-90 active:opacity-80 transition-colors'
                        )}
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCreated(null)
                      reset()
                    }}
                    className={cn(
                      'w-full mt-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      'border border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                    )}
                    style={{ color: 'var(--color-text)' }}
                  >
                    Create another invitation
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                  <div>
                    <label
                      htmlFor="inv-mobile"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Mobile Number{' '}
                      <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
                    </label>
                    <input
                      id="inv-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      disabled={submitting}
                      {...register('mobileNumber')}
                      className={cn(
                        'w-full px-3 py-2.5 text-sm rounded-md border outline-none transition-colors',
                        'focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]',
                        errors.mobileNumber
                          ? 'border-[var(--color-error)]'
                          : 'border-[var(--color-border)] bg-white',
                        submitting ? 'opacity-60 cursor-not-allowed' : ''
                      )}
                      style={{ color: 'var(--color-text)' }}
                    />
                    {errors.mobileNumber && (
                      <p
                        className="mt-1 text-xs font-medium"
                        style={{ color: 'var(--color-error)' }}
                      >
                        {String(errors.mobileNumber.message ?? '')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="inv-days"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Valid for (days)
                    </label>
                    <input
                      id="inv-days"
                      type="number"
                      min={1}
                      max={365}
                      step={1}
                      disabled={submitting}
                      {...register('validDays', { valueAsNumber: true })}
                      className={cn(
                        'w-full px-3 py-2.5 text-sm rounded-md border outline-none transition-colors',
                        'focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]',
                        errors.validDays
                          ? 'border-[var(--color-error)]'
                          : 'border-[var(--color-border)] bg-white',
                        submitting ? 'opacity-60 cursor-not-allowed' : ''
                      )}
                      style={{ color: 'var(--color-text)' }}
                    />
                    {errors.validDays && (
                      <p
                        className="mt-1 text-xs font-medium"
                        style={{ color: 'var(--color-error)' }}
                      >
                        {String(errors.validDays.message ?? '')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={submitting}
                      className={cn(
                        'flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors',
                        'border border-[var(--color-border)] hover:bg-[var(--color-surface)]',
                        submitting ? 'opacity-60 cursor-not-allowed' : ''
                      )}
                      style={{ color: 'var(--color-text)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={cn(
                        'flex-1 px-4 py-2.5 text-sm font-medium rounded-md text-white transition-colors',
                        'hover:opacity-90 active:opacity-80',
                        submitting ? 'opacity-70 cursor-not-allowed' : ''
                      )}
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {submitting ? 'Creating...' : 'Create Invitation'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
