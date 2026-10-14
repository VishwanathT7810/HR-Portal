import type { ReactNode } from 'react'
import cn from 'classnames'

export interface SectionCardProps {
  heading: string
  children: ReactNode
  headingLevel?: 2 | 3 | 4
}

export default function SectionCard({
  heading,
  children,
  headingLevel = 2,
}: SectionCardProps) {
  const Tag = `h${headingLevel}` as 'h2' | 'h3' | 'h4'
  const headingClass =
    headingLevel === 2
      ? 'text-base sm:text-lg font-semibold'
      : headingLevel === 3
      ? 'text-sm sm:text-base font-semibold'
      : 'text-sm font-semibold'

  return (
    <section
      className={cn(
        'bg-white rounded-lg border border-[var(--color-border)] overflow-hidden shadow-sm'
      )}
    >
      <header
        className="px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--color-border)]"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <Tag
          className={cn(headingClass, 'm-0')}
          style={{ color: 'var(--color-text)' }}
        >
          {heading}
        </Tag>
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
