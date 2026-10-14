import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import Alert from '@/components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, LoginFormData } from '../validation/loginSchema';
import { ApiError } from '@/services/api/axios';
import { addToast } from '@/hooks/useToast';
import { AdminThemeProvider } from '@/modules/admin/context/AdminThemeContext';

interface LocationState {
  from?: { pathname?: string };
}

const LoginPageContent: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || '/admin/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const loading = isLoading || isSubmitting;

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    try {
      await login(data);
      addToast('Login successful! Welcome to the Admin Portal.', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        setSubmitError('Invalid username or password. Please check your credentials and try again.');
      } else if (apiErr.errors && Object.keys(apiErr.errors).length > 0) {
        const firstField = Object.keys(apiErr.errors)[0];
        const firstMsg = apiErr.errors[firstField][0];
        setSubmitError(firstMsg || 'Please check your entries and try again.');
      } else if (apiErr.status === 0 || apiErr.message?.includes('Network') || apiErr.message?.includes('connect')) {
        setSubmitError('Unable to connect to the server. Please check your internet connection.');
      } else if (apiErr.message && !apiErr.message.includes('status')) {
        setSubmitError(apiErr.message);
      } else {
        setSubmitError('Invalid username or password. Please check your credentials and try again.');
      }
    }
  };

  return (
    <PublicLayout maxWidth="430px">
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -10px rgba(27, 86, 219, 0.22), 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
          border: '1px solid rgba(255, 255, 255, 0.75)',
          padding: '2.25rem 2rem 2rem 2rem',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(26, 86, 219, 0.08)',
              color: '#1a56db',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>HR Admin Portal</span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
            Admin Sign In
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Sign in to access the administration dashboard
          </p>
        </div>

        {submitError && (
          <div style={{ marginBottom: '1.25rem' }}>
            <Alert variant="error" onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Email or Username */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                Email or Username <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  placeholder="Enter your email or username"
                  {...register('username')}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px 0 38px',
                    borderRadius: '8px',
                    border: errors.username ? '1px solid #ef4444' : '1px solid #cbd5e1',
                    backgroundColor: errors.username ? '#fffbfa' : '#ffffff',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                />
              </div>
              {errors.username && (
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={loading}
                  placeholder="Enter your password"
                  {...register('password')}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 40px 0 38px',
                    borderRadius: '8px',
                    border: errors.password ? '1px solid #ef4444' : '1px solid #cbd5e1',
                    backgroundColor: errors.password ? '#fffbfa' : '#ffffff',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.75rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#1a56db',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.15s ease',
                boxShadow: '0 4px 12px rgba(26, 86, 219, 0.25)',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e40af';
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a56db';
              }}
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <span style={{ fontSize: '1.1rem' }}>→</span>}
            </button>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => addToast('Please contact your administrator for password assistance.', 'info')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#1a56db',
                cursor: loading ? 'not-allowed' : 'pointer',
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
};

const LoginPage: React.FC = () => {
  return (
    <AdminThemeProvider>
      <LoginPageContent />
    </AdminThemeProvider>
  );
};

export default LoginPage;
