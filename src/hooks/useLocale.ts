// useLocale Hook - Lokalizasyon için custom hook
import { useContext } from 'react';
import { LocaleContext } from '@/contexts';

export const useLocale = () => {
  const context = useContext(LocaleContext);
  
  if (!context) {
    console.warn('useLocale used outside LocaleProvider, using default values');
    return {
      currentLanguage: 'en' as const,
      t: (key: string) => key,
      changeLanguage: async () => {},
    };
  }
  
  return context;
};