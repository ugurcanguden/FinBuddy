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
  type: 'expense' | 'income' | 'receivable';
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
  type: 'expense' | 'income' | 'receivable';
}

export interface UpdateCategoryData {
  name_key?: string;
  custom_name?: string;
  icon?: string;
  color?: string;
  type?: 'expense' | 'income' | 'receivable';
}

// Kategori form tipleri
export interface CategoryFormData {
  name: string;
  custom_name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'receivable';
}

// Entry/Payment tipleri
export interface Entry {
  id: string;
  category_id: string;
  type: 'expense' | 'income' | 'receivable';
  title?: string;
  amount: number;
  months: number;
  start_date: string; // YYYY-MM-DD
  schedule_type: 'once' | 'installment';
  reminder_days_before?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  entry_id: string;
  due_date: string; // YYYY-MM-DD
  amount: number;
  status: 'pending' | 'paid' | 'received';
  paid_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Payment reminder ayar tipleri
export type PaymentReminderChannel = 'myPayments' | 'upcomingPayments';

export interface PaymentReminderChannelsSettings {
  myPayments: boolean;
  upcomingPayments: boolean;
}

export interface PaymentRemindersSettings {
  enabled: boolean;
  time: string; // HH:MM formatında
  days: number[]; // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  channels: PaymentReminderChannelsSettings;
}

export interface CreatePaymentEntryInput {
  categoryId: string;
  title: string;
  amount: number;
  months: number;
  startDate: string;
  type?: 'expense' | 'income' | 'receivable';
}
