import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { config } from '@/config';

interface PublicLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
  compact?: boolean;
  hideFooter?: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  maxWidth = '500px',
  compact = false,
  hideFooter = false,
}) => {
  const location = useLocation();
  const isAdminLogin = location.pathname.startsWith('/admin');

  return (
    <div
      className={isAdminLogin ? 'admin-login-layout' : undefined}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: compact ? 'var(--color-background, #f0fdfa)' : isAdminLogin ? '#f0f6ff' : 'var(--color-background)',
        backgroundImage: isAdminLogin ? "url('/images/admin-login-bg.png')" : undefined,
        backgroundSize: isAdminLogin ? '100% 100%' : undefined,
        backgroundPosition: isAdminLogin ? 'top center' : undefined,
        backgroundRepeat: isAdminLogin ? 'no-repeat' : undefined,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {isAdminLogin ? (
        <header
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1.5rem',
            zIndex: 30,
            background: 'transparent',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1.15rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: '#0d9488',
              border: '1px solid #0f766e',
              borderRadius: '24px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.32)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0f766e';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0d9488';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
            }}
          >
            <span aria-hidden="true" style={{ fontSize: '0.9rem' }}>←</span>
            <span>Registration Form</span>
          </Link>
        </header>
      ) : (
        <header
          style={{
            padding: compact ? '0.45rem 1.5rem' : '0.875rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              maxWidth: '100%',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <div
                style={{
                  width: compact ? '28px' : '34px',
                  height: compact ? '28px' : '34px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  border: '1px solid var(--color-border, #ccfbf1)',
                  padding: '3px',
                  boxSizing: 'border-box',
                }}
              >
                <img
                  src="/images/biyani-icon.png"
                  alt="Biyani Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
                <h1
                  style={{
                    fontSize: compact ? '1.05rem' : '1.25rem',
                    fontWeight: 700,
                    color: 'var(--color-primary, #0d9488)',
                    margin: 0,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  {config.companyName}
                </h1>
                <p
                  style={{
                    fontSize: compact ? '0.72rem' : '0.8125rem',
                    color: 'var(--color-text-muted)',
                    margin: 0,
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  Employee Registration Portal
                </p>
              </div>
            </Link>

            <div>
              <Link
                to="/admin/login"
                style={{
                  minHeight: compact ? '30px' : '36px',
                  padding: compact ? '0 0.85rem' : '0 1rem',
                  fontSize: compact ? '0.75rem' : '0.8125rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderRadius: '0.4rem',
                  textDecoration: 'none',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: '1px solid #0f766e',
                  boxShadow: '0 2px 8px rgba(13, 148, 136, 0.28)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0f766e';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0d9488';
                }}
              >
                <span aria-hidden="true" style={{ fontSize: '0.85rem' }}></span>
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: compact ? 'flex-start' : 'center',
          padding: compact ? 0 : '2rem 1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: compact ? '100%' : maxWidth,
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      </main>

      {/* Footer */}
      {!hideFooter && (
        <footer
          style={{
            padding: '1rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          © {new Date().getFullYear()} {config.companyName}. All rights reserved.
        </footer>
      )}
    </div>
  );
};

export default PublicLayout;
