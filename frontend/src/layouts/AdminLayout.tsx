import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { config } from '@/config';
import { AdminThemeProvider } from '@/modules/admin/context/AdminThemeContext';
import { AdminThemeSelector } from '@/modules/admin/components/AdminThemeSelector';

const AdminLayoutInner: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = headerSearch.trim();
    if (!query) return;
    navigate(`/admin/employees?search=${encodeURIComponent(query)}`);
  };

  const SidebarContent = (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--color-sidebar)',
        color: 'var(--color-sidebar-text)',
        width: '250px',
        borderRight: '1px solid var(--color-border)',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.15rem 1.1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            padding: '4px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <img
            src="/images/biyani-icon.png"
            alt="Biyani Technologies Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              color: 'var(--color-sidebar-text)',
              fontSize: '0.95rem',
              fontWeight: 700,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {config.companyName || 'Biyani Tech'}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-sidebar-muted)',
              fontWeight: 500,
              marginTop: '2px',
            }}
          >
            HR Portal
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div
        style={{
          padding: '1rem 0.75rem',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Main Section */}
        <div>
          <NavLink
            to="/admin/dashboard"
            end
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '0.5rem',
              color: isActive ? 'var(--color-sidebar-active-text)' : 'var(--color-sidebar-text)',
              backgroundColor: isActive ? 'var(--color-sidebar-active)' : 'transparent',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: isActive ? 700 : 500,
              boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* Section: ACADEMICS / EMPLOYEES */}
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-sidebar-muted)',
              padding: '0 0.85rem',
              marginBottom: '0.4rem',
            }}
          >
            EMPLOYEES & STAFF
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <NavLink
              to="/admin/employees"
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '0.5rem',
                color: isActive ? 'var(--color-sidebar-active-text)' : 'var(--color-sidebar-muted)',
                backgroundColor: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.84rem',
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Employees List</span>
            </NavLink>
          </div>
        </div>

        {/* Section: PORTAL & SERVICES */}
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-sidebar-muted)',
              padding: '0 0.85rem',
              marginBottom: '0.4rem',
            }}
          >
            SERVICES & PORTAL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <Link
              to="/"
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '0.5rem',
                color: 'var(--color-sidebar-muted)',
                textDecoration: 'none',
                fontSize: '0.84rem',
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Registration Form ↗</span>
            </Link>
          </div>
        </div>
      </div>


    </nav>
  );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* Desktop Sticky Sidebar */}
      <aside className="admin-sidebar-desktop" style={{ display: 'none' }}>
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              zIndex: 40,
              backdropFilter: 'blur(2px)',
            }}
            aria-hidden="true"
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              zIndex: 50,
              transform: 'translateX(0)',
              transition: 'transform 0.2s ease',
            }}
          >
            {SidebarContent}
          </aside>
        </>
      )}

      {/* Main Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          className="admin-top-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1.5rem',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            gap: '1rem',
          }}
        >
          {/* Left: Mobile Toggle & Global Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '480px' }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="admin-hamburger-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: '1px solid var(--color-border)',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
              aria-label="Open menu"
            >
              ☰
            </button>


          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
            {/* Theme Selector restored to dashboard */}
            <AdminThemeSelector />

            {/* Year Badge matching reference image */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.3rem 0.75rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                whiteSpace: 'nowrap',
              }}
            >
              Year 2026–27
            </div>

            {/* User Avatar Circle */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(29, 78, 216, 0.12)',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={user?.fullName || 'Administrator'}
            >
              AD
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                minHeight: '32px',
                padding: '0 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main style={{ flex: 1, backgroundColor: 'var(--color-background)', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .admin-sidebar-desktop { display: block !important; }
          .admin-sidebar-desktop nav { width: 250px; position: sticky; top: 0; height: 100vh; }
          .admin-hamburger-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner />
    </AdminThemeProvider>
  );
};

export default AdminLayout;
