// Theme Context - Global tema state yönetimi
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { storageService } from '@/services';

// 1) Tema modu tipi
export type ThemeMode = 'light' | 'dark' | 'colorful';

// 2) Tüm temalar için ortak renk anahtarları
export interface Colors {
  primary: string;
  background: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  accent: string;
  onPrimary: string; // primary üzerindeki metin rengi
}

// 3) Temalar (aynı key seti)
export const themes: Record<ThemeMode, { name: ThemeMode; colors: Colors }> = {
  light: {
    name: 'light',
    colors: {
      primary: '#3b82f6',
      background: '#ffffff',
      card: '#f3f4f6',
      border: '#d1d5db',
      text: '#111827',
      textSecondary: '#6b7280',
      success: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#2563eb',   // light için info
      accent: '#8b5cf6', // light için accent
      onPrimary: '#ffffff',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      // Tailwind slate-based dark palette aligned with designs
      primary: '#4dd0e1',        // brand cyan
      background: '#0f172a',     // slate-900
      card: '#1e293b',           // slate-800/700 mix
      border: '#334155',         // slate-700
      text: '#cbd5e1',           // slate-300
      textSecondary: '#94a3b8',  // slate-400
      success: '#34d399',        // green-400
      danger: '#f87171',         // red-400
      warning: '#fbbf24',        // amber-400
      info: '#38bdf8',           // sky-400
      accent: '#4dd0e1',         // align with primary
      onPrimary: '#0f172a',      // koyu zemin uyumlu metin
    },
  },
  colorful: {
    name: 'colorful',
    colors: {
      primary: '#facc15',
      background: '#001f3f',
      card: '#003366',
      border: '#1e3a8a',
      text: '#ffffff',
      textSecondary: '#93c5fd',
      success: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b', // EKLENDİ
      info: '#38bdf8',    // açık mavi
      accent: '#0ea5e9',  // turkuaz-mavi
      onPrimary: '#001f3f',
    },
  },
};

// 4) Context tipi
interface ThemeContextType {
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  isLoading: boolean;
  colors: Colors; // aktif temanın renkleri
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedTheme = await storageService.get<ThemeMode>('theme_mode');
      if (savedTheme && ['light', 'dark', 'colorful'].includes(savedTheme)) {
        setCurrentTheme(savedTheme);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setTheme = useCallback(async (theme: ThemeMode) => {
    setCurrentTheme(theme);
    await storageService.set('theme_mode', theme);
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    isLoading,
    colors: themes[currentTheme].colors, // artık TS mutlu 🎉
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export default ThemeContext;
