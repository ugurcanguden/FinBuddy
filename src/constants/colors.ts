// Color Constants - Tema renkleri
export const COLORS = {
  // Light Theme
  light: {
    primary: '#2E86AB',
    secondary: '#A23B72',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212529',
    textSecondary: '#6C757D',
    border: '#E9ECEF',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
  },
  
  // Dark Theme
  dark: {
    primary: '#4A90E2',
    secondary: '#E91E63',
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#404040',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  
  // Colorful Theme
  colorful: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    surface: 'rgba(255, 255, 255, 0.1)',
    card: 'rgba(255, 255, 255, 0.2)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(255, 255, 255, 0.3)',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
} as const;

export type ThemeMode = keyof typeof COLORS;
export type ColorKey = keyof typeof COLORS.light;
