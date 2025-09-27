// Entry Entity Model
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

export interface CreateEntryData {
  category_id: string;
  type: 'expense' | 'income' | 'receivable';
  title?: string;
  amount: number;
  months: number;
  start_date: string;
  schedule_type: 'once' | 'installment';
  reminder_days_before?: number | null;
}

export interface UpdateEntryData {
  category_id?: string;
  type?: 'expense' | 'income' | 'receivable';
  title?: string;
  amount?: number;
  months?: number;
  start_date?: string;
  schedule_type?: 'once' | 'installment';
  reminder_days_before?: number | null;
  is_active?: boolean;
}

// Entry with category information for UI
export interface EntryWithCategory extends Entry {
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

// Entry summary for dashboard
export interface EntrySummary {
  total: number;
  paid: number;
  pending: number;
}
