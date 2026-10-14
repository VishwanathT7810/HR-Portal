import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getDashboardSummary,
  listRecentEmployees,
  searchEmployeesByMobile,
} from '../services/adminApi';
import type { DashboardSummary, EmployeeSummary } from '../types/admin.types';
import './DashboardPage.css';

function toast(message: string, variant: 'success' | 'error' = 'error'): void {
  const el = document.createElement('div');
  const bg = variant === 'success' ? 'var(--color-success)' : 'var(--color-error)';
  el.textContent = message;
  Object.assign(el.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '9999',
    padding: '10px 18px',
    borderRadius: '8px',
    color: '#fff',
    backgroundColor: bg,
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
    maxWidth: '340px',
    transition: 'opacity 0.25s ease',
  });
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 250);
  }, 3500);
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const trimmed = dateStr.trim();
  if (!trimmed) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Explicitly parse DD/MM/YYYY so JavaScript doesn't treat first number as month
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = String(parseInt(ddmmyyyyMatch[1], 10)).padStart(2, '0');
    const monthIdx = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = ddmmyyyyMatch[3];
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${months[monthIdx]} ${year}`;
    }
  }

  // If ISO YYYY-MM-DD
  const yyyymmddMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (yyyymmddMatch) {
    const year = yyyymmddMatch[1];
    const monthIdx = parseInt(yyyymmddMatch[2], 10) - 1;
    const day = String(parseInt(yyyymmddMatch[3], 10)).padStart(2, '0');
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${months[monthIdx]} ${year}`;
    }
  }

  try {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return trimmed;
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return trimmed;
  }
}

function getInitials(name: string): string {
  if (!name) return 'EM';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [recent, setRecent] = useState<EmployeeSummary[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [searchMobile, setSearchMobile] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Dynamic current date e.g. "Tuesday, 6 October 2026"
  const formattedToday = useMemo(() => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  async function loadSummary() {
    try {
      setSummaryLoading(true);
      const s = await getDashboardSummary();
      setSummary(s);
    } catch (err) {
      console.error(err);
      toast('Failed to load dashboard metrics', 'error');
    } finally {
      setSummaryLoading(false);
    }
  }

  // Load EXACTLY 5 latest records inserted by user
  async function loadRecent() {
    try {
      setRecentLoading(true);
      const list = await listRecentEmployees(5);
      setRecent((list || []).slice(0, 5));
    } catch (err) {
      console.error(err);
      toast('Failed to load recent submissions', 'error');
    } finally {
      setRecentLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary();
    void loadRecent();
  }, []);

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchMobile.trim();
    if (!trimmed) return;
    if (trimmed.length < 3) {
      toast('Please enter at least 3 digits to search', 'error');
      return;
    }

    try {
      setSearchLoading(true);
      const results = await searchEmployeesByMobile(trimmed);
      if (results.length === 0) {
        toast('No employee found with this mobile number', 'error');
      } else if (results.length === 1) {
        navigate(`/admin/employees/${results[0].submissionReference}`);
      } else {
        navigate(`/admin/employees?search=${encodeURIComponent(trimmed)}`);
      }
    } catch (err) {
      console.error(err);
      toast('Search failed. Please try again.', 'error');
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="dash-container">
      {/* Top Header */}
      <div className="dash-header">
        <div className="dash-title-group">
          <h1>Dashboard</h1>
          <p className="dash-subtitle">{formattedToday}</p>
        </div>

        <div className="dash-header-actions">
          {/* Quick Search in Header */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Search Mobile Number"
                value={searchMobile}
                onChange={(e) => setSearchMobile(e.target.value)}
                style={{
                  height: '38px',
                  width: '200px',
                  padding: '0 32px 0 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={searchLoading}
                style={{
                  position: 'absolute',
                  right: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: 'var(--color-text-muted)',
                  padding: '4px',
                }}
                title="Search"
              >
                {searchLoading ? '⏳' : '🔍'}
              </button>
            </div>
          </form>

          <Link to="/" target="_blank" className="dash-primary-btn">
            <span>+ New Registration</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid: Real Metrics (3 Cards) */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-label">Total Employees Enrolled</div>
          <div className="dash-stat-value">
            {summaryLoading ? '...' : (summary?.totalEmployees !== undefined ? summary.totalEmployees.toLocaleString() : '0')}
          </div>
          <div className="dash-stat-sub">
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>● Active</span> registered employees
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-label">Last 7 Days Submissions</div>
          <div className="dash-stat-value">
            {summaryLoading ? '...' : (summary?.last7Days ?? 0)}
          </div>
          <div className="dash-stat-sub">
            <span>Submissions in past week</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-label">Recent Submissions</div>
          <div className="dash-stat-value">
            {summaryLoading ? '...' : (summary?.recentCount ?? 0)}
          </div>
          <div className="dash-stat-sub">
            <span>Current session records</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Exactly 5 Latest Records under "Recent Submissions" */}
      <div className="dash-recent-card">
        <div className="dash-recent-header">
          <h2>Recent submissions</h2>
          <button
            type="button"
            onClick={() => navigate('/admin/employees')}
            className="dash-view-all-link"
          >
            <span>View all</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', paddingLeft: '1.5rem', width: '36%' }}>Employee</th>
                <th style={{ width: '32%' }}>Course / Post</th>
                <th style={{ width: '18%' }}>Date</th>
                {/* <th>Status</th> */}
                <th style={{ width: '14%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentLoading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                      ⏳ Loading 5 latest submissions...
                    </div>
                  </td>
                </tr>
              ) : recent.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                      No submissions recorded yet. New employee registrations will appear here.
                    </div>
                  </td>
                </tr>
              ) : (
                recent.map((emp, idx) => {
                  // Badges matching the reference UI
                  const badgeClasses = [
                    'dash-badge-confirmed',
                    'dash-badge-pending',
                    'dash-badge-confirmed',
                    'dash-badge-documents',
                    'dash-badge-confirmed',
                  ];
                  const badgeLabels = [
                    'Confirmed',
                    'Under Review',
                    'Confirmed',
                    'Submitted',
                    'Confirmed',
                  ];
                  const badgeClass = badgeClasses[idx % badgeClasses.length];
                  const badgeLabel = badgeLabels[idx % badgeLabels.length];

                  return (
                    <tr
                      key={emp.submissionReference}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/employees/${emp.submissionReference}`)}
                    >
                      <td>
                        <div className="dash-user-cell">
                          <div className="dash-avatar-circle">
                            {getInitials(emp.name)}
                          </div>
                          <div>
                            <div className="dash-user-name">{emp.name || 'Anonymous Employee'}</div>
                            <div className="dash-user-mobile">{emp.mobileNumber}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ fontWeight: 500, textAlign: 'center' }}>
                        {emp.post || 'General Employee'}
                      </td>

                      <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {formatDisplayDate(emp.createdAt || emp.dateOfJoining)}
                      </td>

                      {/* <td>
                        <span className={`dash-badge ${badgeClass}`}>
                          {badgeLabel}
                        </span>
                      </td> */}

                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/employees/${emp.submissionReference}`);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>View</span>
                          <span aria-hidden="true">→</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
