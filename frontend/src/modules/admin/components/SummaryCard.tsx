import type { ReactNode } from 'react'
import cn from 'classnames'

export interface SummaryCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  accent?: string
}

export default function SummaryCard({
  title,
  value,
  icon,
  accent = 'var(--color-primary)',
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden'
      )}
      style={{ borderLeftWidth: '4px', borderLeftColor: accent }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 truncate"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {title}
            </p>
            <p
              className="text-2xl sm:text-3xl font-bold break-words"
              style={{ color: 'var(--color-text)' }}
            >
              {value}
            </p>
          </div>
          {icon && (
            <div
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-md opacity-80"
              style={{ backgroundColor: `${accent}15`, color: accent }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
