import type { ReactNode } from 'react'
import cn from 'classnames'

export interface DetailRowProps {
  label: string
  value: ReactNode
}

function renderValue(v: ReactNode): ReactNode {
  if (v === null || v === undefined || v === '') {
    return (
      <span className="italic" style={{ color: 'var(--color-text-muted)' }}>
        —
      </span>
    )
  }
  if (typeof v === 'boolean') {
    return (
      <span
        style={{
          color: v ? 'var(--color-success)' : 'var(--color-text-muted)',
          fontWeight: 500,
        }}
      >
        {v ? 'Yes' : 'No'}
      </span>
    )
  }
  return v
}

export default function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 sm:py-3',
        'border-b border-[var(--color-border)] last:border-b-0'
      )}
    >
      <div
        className="sm:w-1/3 sm:flex-shrink-0 text-xs sm:text-sm font-medium"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </div>
      <div
        className="sm:w-2/3 sm:flex-1 text-sm sm:text-[0.95rem] break-words"
        style={{ color: 'var(--color-text)' }}
      >
        {renderValue(value)}
      </div>
    </div>
  )
}
