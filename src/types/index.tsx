// FinBuddy - Genel Tip Tanımları

// Base Component Props - Tüm bileşenler için ortak
export interface BaseComponentProps {
  testID?: string;
  style?: any;
}

// Genel Utility Tipleri
export type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export type DateRange = {
  start: Date;
  end: Date;
};

// API Response tipleri
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalRecords: number;
}

// Storage tipleri artık gerekli değil - basit generic kullanım