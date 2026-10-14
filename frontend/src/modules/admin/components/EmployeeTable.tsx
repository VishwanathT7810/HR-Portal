import { useNavigate } from 'react-router-dom'
import cn from 'classnames'
import { format } from 'date-fns'
import type { EmployeeSummary } from '../types/admin.types'

export interface EmployeeTableProps {
  rows: EmployeeSummary[]
  emptyMessage?: string
  loading?: boolean
}

function formatDate(value?: string): string {
  if (!value) return '—'
  const trimmed = value.trim()
  if (!trimmed) return '—'

  // Explicitly parse DD/MM/YYYY so JavaScript does not treat first number as month
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

  // If ISO YYYY-MM-DD
  const yyyymmddMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10)
    const month = parseInt(yyyymmddMatch[2], 10) - 1
    const day = parseInt(yyyymmddMatch[3], 10)
    const d = new Date(year, month, day)
    if (!Number.isNaN(d.getTime())) {
      return format(d, 'dd MMM yyyy')
    }
  }

  try {
    const d = new Date(trimmed)
    if (!Number.isNaN(d.getTime())) return format(d, 'dd MMM yyyy')
    return trimmed
  } catch {
    return trimmed
  }
}

function Loader() {
  return (
    <div className="py-8 px-4 text-center">
      <span
        className="inline-block w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      />
      <p
        className="mt-3 text-sm font-medium"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Loading employees...
      </p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-10 sm:py-12 px-4 text-center">
      <div
        className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="22" y1="21" x2="16" y2="15" />
          <line x1="16" y1="21" x2="22" y2="15" />
        </svg>
      </div>
      <p className="text-base font-medium" style={{ color: 'var(--color-text)' }}>
        No records found
      </p>
      <p
        className="mt-1 text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {message}
      </p>
    </div>
  )
}

export default function EmployeeTable({
  rows,
  emptyMessage = 'There are no employee records to display.',
  loading = false,
}: EmployeeTableProps) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div
        className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm"
      >
        <Loader />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div
        className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm"
      >
        <EmptyState message={emptyMessage} />
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: '560px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface)' }}>
              <th
                scope="col"
                className={cn(
                  'text-left font-semibold px-3 sm:px-4 py-3 whitespace-nowrap'
                )}
                style={{ color: 'var(--color-text-muted)' }}
              >
                Reference
              </th>
              <th
                scope="col"
                className={cn(
                  'text-left font-semibold px-3 sm:px-4 py-3 whitespace-nowrap'
                )}
                style={{ color: 'var(--color-text-muted)' }}
              >
                Name
              </th>
              <th
                scope="col"
                className={cn(
                  'text-left font-semibold px-3 sm:px-4 py-3 whitespace-nowrap hidden sm:table-cell'
                )}
                style={{ color: 'var(--color-text-muted)' }}
              >
                Mobile
              </th>
              <th
                scope="col"
                className={cn(
                  'text-left font-semibold px-3 sm:px-4 py-3 whitespace-nowrap hidden md:table-cell'
                )}
                style={{ color: 'var(--color-text-muted)' }}
              >
                Post
              </th>
              <th
                scope="col"
                className={cn(
                  'text-left font-semibold px-3 sm:px-4 py-3 whitespace-nowrap hidden lg:table-cell'
                )}
                style={{ color: 'var(--color-text-muted)' }}
              >
                Date of Joining
              </th>
              <th
                scope="col"
                className={cn(
                  'text-left font-semibold px-3 sm:px-4 py-3 whitespace-nowrap'
                )}
                style={{ color: 'var(--color-text-muted)' }}
              >
                Submitted
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {rows.map((row) => (
              <tr
                key={row.submissionReference}
                onClick={() => navigate(`/admin/employees/${row.submissionReference}`)}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-[var(--color-surface-hover)]',
                  'bg-white'
                )}
              >
                <td
                  className="px-3 sm:px-4 py-3 font-mono text-xs whitespace-nowrap"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {row.submissionReference}
                </td>
                <td className="px-3 sm:px-4 py-3">
                  <div className="font-medium whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                    {row.name}
                  </div>
                  <div
                    className="sm:hidden text-xs mt-0.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {row.mobileNumber}
                  </div>
                </td>
                <td
                  className="px-3 sm:px-4 py-3 whitespace-nowrap hidden sm:table-cell"
                  style={{ color: 'var(--color-text)' }}
                >
                  {row.mobileNumber}
                </td>
                <td
                  className="px-3 sm:px-4 py-3 whitespace-nowrap hidden md:table-cell"
                  style={{ color: 'var(--color-text)' }}
                >
                  {row.post || '—'}
                </td>
                <td
                  className="px-3 sm:px-4 py-3 whitespace-nowrap hidden lg:table-cell"
                  style={{ color: 'var(--color-text)' }}
                >
                  {formatDate(row.dateOfJoining)}
                </td>
                <td
                  className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {formatDate(row.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
