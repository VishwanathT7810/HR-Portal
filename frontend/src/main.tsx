import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import { ToastContainer } from '@/hooks/useToast';
import AppRouter from '@/routes/AppRouter';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastContainer />
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);
