// Currency Formatter - Para formatı yardımcı fonksiyonları
import { useCurrency } from '@/contexts';

export interface CurrencyFormatterOptions {
  showSymbol?: boolean;
  showDecimals?: boolean;
  locale?: string;
}

// Para formatı fonksiyonu
export const formatCurrency = (
  amount: number,
  currencyCode: string = 'TRY',
  options: CurrencyFormatterOptions = {}
): string => {
  const {
    showSymbol = true,
    showDecimals = true,
    locale = 'tr-TR'
  } = options;

  // Para birimi sembolleri
  const currencySymbols: Record<string, string> = {
    'TRY': '₺',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
  };

  const symbol = currencySymbols[currencyCode] || '₺';

  // Formatlanmış tutar
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return showSymbol ? `${formattedAmount} ${symbol}` : formattedAmount;
};

// Sadece sayı formatı (sembol olmadan)
export const formatNumber = (
  amount: number,
  options: CurrencyFormatterOptions = {}
): string => {
  const {
    showDecimals = true,
    locale = 'tr-TR'
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
};

// Para birimi sembolü al
export const getCurrencySymbol = (currencyCode: string): string => {
  const currencySymbols: Record<string, string> = {
    'TRY': '₺',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
  };
  return currencySymbols[currencyCode] || '₺';
};

// Hook ile para formatı
export const useCurrencyFormatter = () => {
  const { currency } = useCurrency();

  const format = (amount: number, options?: CurrencyFormatterOptions) => {
    return formatCurrency(amount, currency, { showDecimals: true, ...options });
  };

  const formatNumberOnly = (amount: number, options?: CurrencyFormatterOptions) => {
    return formatNumber(amount, options);
  };

  const getSymbol = () => {
    return getCurrencySymbol(currency);
  };

  return {
    format,
    formatNumberOnly,
    getSymbol,
    currency,
  };
};

// Input için para formatı (kullanıcı yazarken)
export const formatCurrencyInput = (value: string): string => {
  // Sadece sayı ve virgül nokta karakterlerini al
  const cleanValue = value.replace(/[^\d,.]/g, '');
  
  // Birden fazla nokta olmasını engelle
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Virgülü nokta ile değiştir (onluk sistem için)
  const normalizedValue = cleanValue.replace(',', '.');
  
  return normalizedValue;
};

// Input değerini temizle (hesaplama için)
export const parseCurrencyInput = (value: string): number => {
  // Sadece sayı ve virgül nokta karakterlerini al
  const cleanValue = value.replace(/[^\d,.]/g, '');
  
  // Virgülü nokta ile değiştir
  const normalizedValue = cleanValue.replace(',', '.');
  
  // Sayıya çevir
  return parseFloat(normalizedValue) || 0;
};
