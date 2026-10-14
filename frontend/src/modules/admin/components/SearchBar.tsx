import React, { useState, useEffect } from 'react'

export interface SearchBarProps {
  onSuccess: (results: { mobile: string }, mobile: string) => void | Promise<void>
  onClear?: () => void
  loading?: boolean
  placeholder?: string
  defaultValue?: string
}

export default function SearchBar({
  onSuccess,
  onClear,
  loading = false,
  placeholder = 'Search employees by mobile number...',
  defaultValue = '',
}: SearchBarProps) {
  const [mobile, setMobile] = useState(defaultValue)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (defaultValue !== undefined) {
      setMobile(defaultValue)
    }
  }, [defaultValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobile(raw)
    if (error) setError(null)

    if (raw === '') {
      if (onClear) onClear()
    } else if (raw.length === 10) {
      // Auto-trigger search when 10 digits are complete (dashboard search functionality)
      void onSuccess({ mobile: raw }, raw)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = mobile.trim()
    if (!clean) {
      if (onClear) onClear()
      return
    }
    if (clean.length < 10) {
      setError('Please enter a 10-digit mobile number')
      return
    }
    setError(null)
    void onSuccess({ mobile: clean }, clean)
  }

  const handleClear = () => {
    setMobile('')
    setError(null)
    if (onClear) onClear()
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '340px' }} noValidate>
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Leading Search Icon */}
        <span
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        {/* Compact, Clean Search Input */}
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={mobile}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={loading}
          style={{
            width: '100%',
            height: '38px',
            padding: '0 34px 0 36px',
            borderRadius: '8px',
            border: error ? '1px solid var(--color-error)' : '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface, #ffffff)',
            color: 'var(--color-text)',
            fontSize: '0.85rem',
            fontWeight: 500,
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxSizing: 'border-box',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = 'var(--color-primary)'
            e.currentTarget.style.boxShadow = '0 0 0 2.5px rgba(29, 78, 216, 0.12)'
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)'
          }}
        />

        {/* Trailing Controls: Loading indicator or Clear button */}
        <div
          style={{
            position: 'absolute',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {loading ? (
            <span
              style={{
                width: '15px',
                height: '15px',
                border: '2px solid var(--color-primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }}
              aria-label="Searching..."
            />
          ) : mobile ? (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
              title="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {error && (
        <p
          style={{
            margin: '4px 0 0 10px',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--color-error)',
          }}
        >
          {error}
        </p>
      )}
    </form>
  )
}
