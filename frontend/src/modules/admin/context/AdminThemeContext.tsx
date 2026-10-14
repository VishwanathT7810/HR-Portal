import React, { createContext, useContext, useEffect, useState } from 'react';

export type AdminTheme = 'red-black' | 'royal-blue' | 'peacock' | 'black-crimson';

export interface ThemeOption {
  id: AdminTheme;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  isDark: boolean;
}

export const ADMIN_THEMES: ThemeOption[] = [
  {
    id: 'red-black',
    name: 'Red & Black',
    tagline: 'Black to Red Gradient Sidebar & Crimson Accents',
    primaryColor: '#8e0e1b',
    accentColor: '#b81424',
    isDark: false,
  },
  {
    id: 'royal-blue',
    name: 'Royal Blue',
    tagline: 'Classic Corporate Navy & Blue',
    primaryColor: '#1d4ed8',
    accentColor: '#3b82f6',
    isDark: false,
  },
  {
    id: 'peacock',
    name: 'Peacock',
    tagline: 'Deep Teal & Cyan Ocean Harmony',
    primaryColor: '#0d9488',
    accentColor: '#14b8a6',
    isDark: false,
  },

];

interface AdminThemeContextValue {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  availableThemes: typeof ADMIN_THEMES;
  currentThemeConfig: ThemeOption;
}

const STORAGE_KEY = 'admin_theme';
const DEFAULT_THEME: AdminTheme = 'peacock';

const AdminThemeContext = createContext<AdminThemeContextValue | undefined>(undefined);

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
      if (stored && ['black-crimson', 'peacock', 'royal-blue', 'red-black'].includes(stored)) {
        return stored;
      }
    } catch {
      // Fallback on storage errors
    }
    return DEFAULT_THEME;
  });

  const setTheme = (newTheme: AdminTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', theme);
    document.body.setAttribute('data-admin-theme', theme);
  }, [theme]);

  const currentThemeConfig =
    ADMIN_THEMES.find((t) => t.id === theme) || ADMIN_THEMES[2];

  return (
    <AdminThemeContext.Provider
      value={{
        theme,
        setTheme,
        availableThemes: ADMIN_THEMES,
        currentThemeConfig,
      }}
    >
      <div className="admin-theme-root" data-admin-theme={theme} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = (): AdminThemeContextValue => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};
