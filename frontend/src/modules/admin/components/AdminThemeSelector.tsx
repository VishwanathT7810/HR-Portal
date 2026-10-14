import React from 'react';
import { useAdminTheme, AdminTheme } from '../context/AdminThemeContext';

export const AdminThemeSelector: React.FC = () => {
  const { theme, setTheme, availableThemes } = useAdminTheme();

  return (
    <div
      className="admin-theme-selector-wrapper"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <label
        htmlFor="admin-theme-select"
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '0.95rem' }}></span>
        <span>Theme:</span>
      </label>

      <select
        id="admin-theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as AdminTheme)}
        aria-label="Select Admin Portal Theme"
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.375rem',
          padding: '0.35rem 1.85rem 0.35rem 0.65rem',
          fontSize: '0.8125rem',
          fontWeight: 500,
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
        }}
      >
        {availableThemes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AdminThemeSelector;
