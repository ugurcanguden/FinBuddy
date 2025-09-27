// Payment Entity Model
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

export interface CreatePaymentData {
  entry_id: string;
  due_date: string;
  amount: number;
  status?: 'pending' | 'paid' | 'received';
}

export interface UpdatePaymentData {
  due_date?: string;
  amount?: number;
  status?: 'pending' | 'paid' | 'received';
  paid_at?: string | null;
  is_active?: boolean;
}

// Payment with entry information for UI
export interface PaymentWithEntry extends Payment {
  entry_title?: string;
  entry_type?: 'expense' | 'income' | 'receivable';
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

// Upcoming/Overdue payment for dashboard
export interface UpcomingPayment {
  id: string;
  entry_id: string;
  title: string | null;
  due_date: string;
  amount: number;
  type: string;
}

// Payment status summary
export interface PaymentStatusSummary {
  pending: number;
  paid: number;
  received: number;
  overdue: number;
}
