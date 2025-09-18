// useLocale Hook - Çok dilli yapı için React hook
import { localeService } from '@/services/locale/localeService';
import type { SupportedLanguage } from '@/services/locale/localeService';
import { useState, useEffect, useCallback } from 'react'; 

export function useLocale() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Dil servisini başlat
  const initializeLocale = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await localeService.initialize();
      setCurrentLanguage(localeService.getCurrentLanguage());
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Dil değiştir
  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    try {
      setError(null);
      await localeService.setLanguage(language);
      setCurrentLanguage(language);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  // Çeviri al
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return localeService.t(key, params);
  }, [currentLanguage]);

  // Desteklenen dilleri al
  const getSupportedLanguages = useCallback(() => {
    return localeService.getSupportedLanguages();
  }, []);

  // Dil adını al
  const getLanguageName = useCallback((code: SupportedLanguage) => {
    return localeService.getLanguageName(code);
  }, []);

  useEffect(() => {
    initializeLocale();
  }, [initializeLocale]);

  return {
    currentLanguage,
    loading,
    error,
    t,
    changeLanguage,
    getSupportedLanguages,
    getLanguageName,
    initializeLocale,
  };
}
