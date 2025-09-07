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

// Kategori tipleri
export interface Category {
  id: string;
  name_key: string;
  custom_name?: string;
  icon: string;
  color: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name_key?: string;
  custom_name?: string;
  icon: string;
  color: string;
}

export interface UpdateCategoryData {
  name_key?: string;
  custom_name?: string;
  icon?: string;
  color?: string;
}

// Kategori form tipleri
export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
}