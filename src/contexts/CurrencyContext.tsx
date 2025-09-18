import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { storageService } from '@/services';
import type { Currency } from '@/types';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('TRY');
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrency = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await storageService.get<Currency>('currency_code');
      if (stored && ['TRY', 'USD', 'EUR', 'GBP'].includes(stored)) {
        setCurrencyState(stored);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCurrency = useCallback(async (value: Currency) => {
    setCurrencyState(value);
    await storageService.set('currency_code', value);
  }, []);

  useEffect(() => {
    loadCurrency();
  }, [loadCurrency]);

  const value: CurrencyContextValue = {
    currency,
    setCurrency: updateCurrency,
    isLoading,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextValue => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;

