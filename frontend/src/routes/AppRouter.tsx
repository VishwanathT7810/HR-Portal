import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/modules/auth/pages/LoginPage';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';
import DashboardPage from '@/modules/admin/pages/DashboardPage';
import EmployeesListPage from '@/modules/admin/pages/EmployeesListPage';
import EmployeeDetailsPage from '@/modules/admin/pages/EmployeeDetailsPage';
import { EmployeeFormPage } from '@/pages/EmployeeFormPage';
import { FormSuccessPage } from '@/pages/FormSuccessPage';
import { FormErrorPage } from '@/pages/FormErrorPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmployeeFormPage />} />
        <Route path="/register" element={<EmployeeFormPage />} />
        <Route path="/employee-form" element={<EmployeeFormPage />} />
        <Route path="/employee-form/:token" element={<EmployeeFormPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/form-success/:ref" element={<FormSuccessPage />} />
        <Route path="/form-error" element={<FormErrorPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesListPage />} />
            <Route path="employees/:submissionReference" element={<EmployeeDetailsPage />} />
            <Route path="employees/:ref" element={<EmployeeDetailsPage />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1rem',
                textAlign: 'center',
              }}
            >
              <div style={{ maxWidth: '480px' }}>
                <div style={{ fontSize: '5rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  404
                </div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page Not Found</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  The page you are looking for doesn't exist or has been moved.
                </p>
                <Navigate to="/admin/login" replace />
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
