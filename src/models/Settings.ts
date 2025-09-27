// Settings Entity Model
export interface Settings {
  id: number; // Always 1
  notifications_enabled: boolean;
  default_reminder_days_before: number;
}

export interface UpdateSettingsData {
  notifications_enabled?: boolean;
  default_reminder_days_before?: number;
}

// Notification settings
export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:MM format
  days: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  channels: NotificationChannels;
}

export interface NotificationChannels {
  myPayments: boolean;
  upcomingPayments: boolean;
}

// App settings
export interface AppSettings {
  language: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
}

// User preferences
export interface UserPreferences {
  defaultCurrency: string;
  dateFormat: string;
  numberFormat: string;
  firstDayOfWeek: number; // 0=Sunday, 1=Monday
}
