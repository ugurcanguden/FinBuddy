// Storage Hooks - React hooks for storage operations
import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/services/storage';

// Generic storage hook
export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => Promise<void>, boolean, Error | null] {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await storageService.get<T>(key);
      setData(result || defaultValue);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const saveData = useCallback(async (value: T) => {
    try {
      setError(null);
      await storageService.set(key, value);
      setData(value);
    } catch (err) {
      setError(err as Error);
    }
  }, [key]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return [data, saveData, loading, error];
}

// Example usage hooks
export function useThemeSettings() {
  const defaultTheme = {
    mode: 'light' as 'light' | 'dark' | 'colorful',
    primaryColor: '#2E86AB',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
  };

  return useStorage('theme_settings', defaultTheme);
}

// Basit tema hook'u - sadece mode için
// useTheme hook'u artık ThemeContext'te yönetiliyor

export function useUserSettings() {
  const defaultSettings = {
    notifications: {
      enabled: true,
      reminderTime: '09:00',
    },
    language: 'tr' as 'tr' | 'en',
    currency: 'TRY' as 'TRY' | 'USD' | 'EUR' | 'GBP',
  };

  return useStorage('user_settings', defaultSettings);
}