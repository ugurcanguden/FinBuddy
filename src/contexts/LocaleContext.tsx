// Locale Context - Lokalizasyon yönetimi
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { localeService, type SupportedLanguage } from '@/services';

interface LocaleContextType {
  currentLanguage: SupportedLanguage;
  t: (key: string) => string;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Default context value
const defaultLocaleContext: LocaleContextType = {
  currentLanguage: 'en',
  t: (key: string) => key, // Fallback to key
  changeLanguage: async () => {},
};

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  // Çeviri fonksiyonu
  const t = (key: string): string => {
    try {
      return localeService.t(key);
    } catch (error) {
      console.error('Translation error:', error);
      return key; // Fallback to key if translation fails
    }
  };

  // Dili değiştir
  const changeLanguage = async (language: SupportedLanguage) => {
    try {
      await localeService.changeLanguage(language);
      setCurrentLanguage(localeService.getCurrentLanguage());
      console.log(`Language changed to ${language} in LocaleContext`);
    } catch (error) {
      console.error(`Failed to change language to ${language}`, error);
      throw error;
    }
  };

  // Başlangıçta mevcut dili yükle
  useEffect(() => {
    const initializeLocale = async () => {
      try {
        await localeService.initialize();
        setCurrentLanguage(localeService.getCurrentLanguage());
      } catch (error) {
        console.error('Failed to initialize locale:', error);
      }
    };

    initializeLocale();
  }, []);

  const value: LocaleContextType = {
    currentLanguage,
    t,
    changeLanguage,
  };

  return (
    <LocaleContext.Provider value={value || defaultLocaleContext}>
      {children}
    </LocaleContext.Provider>
  );
};

export { LocaleContext };
