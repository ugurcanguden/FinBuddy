// Category Entity Model
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

export interface CategoryFormData {
  name: string;
  custom_name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'receivable';
}

// Category display model for UI
export interface CategoryDisplay {
  id: string;
  name: string;
  custom_name?: string;
  is_default: boolean;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'receivable';
}
