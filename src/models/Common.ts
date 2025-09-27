// Common Entity Models and Utility Types

// Base component props
export interface BaseComponentProps {
  testID?: string;
  style?: React.ComponentProps<any>['style'];
}

// Currency and localization
export type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';
export type SupportedLanguage = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

// Date and time
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeRange {
  start: string; // HH:MM
  end: string; // HH:MM
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Form and validation
export interface FormField<T = unknown> {
  value: T;
  error?: string;
  touched: boolean;
  required: boolean;
}

export interface ValidationRule<T = unknown> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

// Navigation
export interface NavigationParams {
  [key: string]: string | number | boolean | object | null;
}

// Theme and styling
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onError: string;
  onSuccess: string;
  onWarning: string;
  onInfo: string;
}

// Chart and visualization
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: ChartDataPoint[];
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    scales?: Record<string, unknown>;
    plugins?: Record<string, unknown>;
  };
}

// Statistics and analytics
export interface Statistics {
  total: number;
  count: number;
  average: number;
  min: number;
  max: number;
  median?: number;
  mode?: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

// File and media
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  uri: string;
  lastModified?: number;
}

// Error handling
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
  timestamp: string;
}

// Loading and state management
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  lastUpdated?: string;
}

export interface AsyncState<T = unknown> extends LoadingState {
  data?: T;
  hasData: boolean;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
