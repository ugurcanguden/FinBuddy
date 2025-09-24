// Theme Context - Global tema state yönetimi
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { storageService } from '@/services';

// 1) Tema modu tipi
export type ThemeMode = 'light' | 'dark' | 'colorful';

// Küçük renk yardımcıları
type RGB = { r: number; g: number; b: number };

const clamp = (value: number, min = 0, max = 255) => Math.min(Math.max(value, min), max);

const hexToRgb = (hex: string): RGB => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : normalized;

  const bigint = parseInt(value.slice(0, 6), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHex = ({ r, g, b }: RGB) =>
  `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g)
    .toString(16)
    .padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;

const mixColors = (color: string, mixWith: string, amount: number) => {
  const base = hexToRgb(color);
  const mix = hexToRgb(mixWith);

  return rgbToHex({
    r: Math.round(base.r + (mix.r - base.r) * amount),
    g: Math.round(base.g + (mix.g - base.g) * amount),
    b: Math.round(base.b + (mix.b - base.b) * amount),
  });
};

const lighten = (color: string, amount: number) => mixColors(color, '#ffffff', amount);
const darken = (color: string, amount: number) => mixColors(color, '#000000', amount);

// 2) Tüm temalar için ortak renk anahtarları
export interface Colors {
  primary: string;
  background: string;
  backgroundMuted: string;
  card: string;
  cardMuted: string;
  border: string;
  outline: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  accent: string;
  onPrimary: string; // primary üzerindeki metin rengi
  overlay: string;
  positiveSurface: string;
  negativeSurface: string;
}

export type ShadowDefinition = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};

export interface ThemeTokens {
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radii: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  typography: {
    fontFamily: string;
    headingFamily: string;
    monospaceFamily: string;
    weights: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      display: number;
    };
  };
  shadows: {
    level1: ShadowDefinition;
    level2: ShadowDefinition;
  };
  gradients: {
    primary: string[];
    accent: string[];
    success: string[];
    danger: string[];
  };
}

interface ThemeDefinition {
  name: ThemeMode;
  colors: Colors;
  tokens: ThemeTokens;
}

const baseSpacing: ThemeTokens['spacing'] = Object.freeze({
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
});

const baseRadii: ThemeTokens['radii'] = Object.freeze({
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
});

const baseTypography: ThemeTokens['typography'] = {
  fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }) || 'System',
  headingFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) || 'System',
  monospaceFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) || 'monospace',
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    display: 32,
  },
};

const createShadows = (shadowColor: string): ThemeTokens['shadows'] => ({
  level1: {
    shadowColor,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  level2: {
    shadowColor,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
});

const createGradients = (palette: Colors): ThemeTokens['gradients'] => ({
  primary: [palette.primary, lighten(palette.primary, 0.18)],
  accent: [palette.accent, lighten(palette.accent, 0.22)],
  success: [darken(palette.success, 0.12), palette.success],
  danger: [darken(palette.danger, 0.1), palette.danger],
});

const createThemeDefinition = (name: ThemeMode, colors: Colors, overrides?: Partial<ThemeTokens>): ThemeDefinition => ({
  name,
  colors,
  tokens: {
    spacing: baseSpacing,
    radii: baseRadii,
    typography: baseTypography,
    shadows: overrides?.shadows ?? createShadows(colors.overlay),
    gradients: overrides?.gradients ?? createGradients(colors),
  },
});

// 3) Temalar (aynı key seti)
export const themes: Record<ThemeMode, ThemeDefinition> = {
  light: createThemeDefinition(
    'light',
    {
      primary: '#2563EB',
      background: '#F8FAFC',
      backgroundMuted: '#E2E8F0',
      card: '#FFFFFF',
      cardMuted: '#F1F5F9',
      border: '#E2E8F0',
      outline: '#CBD5F5',
      text: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#94A3B8',
      success: '#16A34A',
      danger: '#DC2626',
      warning: '#F59E0B',
      info: '#0EA5E9',
      accent: '#7C3AED',
      onPrimary: '#F8FAFC',
      overlay: 'rgba(15, 23, 42, 0.18)',
      positiveSurface: '#ECFDF5',
      negativeSurface: '#FEF2F2',
    },
    {
      shadows: createShadows('rgba(15, 23, 42, 0.18)'),
      gradients: {
        primary: ['#2563EB', '#60A5FA'],
        accent: ['#7C3AED', '#C084FC'],
        success: ['#0F766E', '#22C55E'],
        danger: ['#B91C1C', '#EF4444'],
      },
    }
  ),
  dark: createThemeDefinition(
    'dark',
    {
      primary: '#38BDF8',
      background: '#020617',
      backgroundMuted: '#0F172A',
      card: '#0B1220',
      cardMuted: '#131B2F',
      border: '#1E293B',
      outline: '#334155',
      text: '#E2E8F0',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      success: '#22C55E',
      danger: '#F87171',
      warning: '#FBBF24',
      info: '#38BDF8',
      accent: '#F472B6',
      onPrimary: '#020617',
      overlay: 'rgba(2, 6, 23, 0.55)',
      positiveSurface: '#064E3B',
      negativeSurface: '#4A1D1D',
    },
    {
      shadows: createShadows('rgba(2, 6, 23, 0.55)'),
      gradients: {
        primary: ['#0EA5E9', '#38BDF8'],
        accent: ['#F472B6', '#FB7185'],
        success: ['#14532D', '#22C55E'],
        danger: ['#7F1D1D', '#F87171'],
      },
    }
  ),
  colorful: createThemeDefinition(
    'colorful',
    {
      primary: '#F97316',
      background: '#0C0A2A',
      backgroundMuted: '#1C1448',
      card: '#161346',
      cardMuted: '#201B5E',
      border: '#3F3C68',
      outline: '#6366F1',
      text: '#F5F3FF',
      textSecondary: '#C7D2FE',
      textMuted: '#A5B4FC',
      success: '#34D399',
      danger: '#FB7185',
      warning: '#FBBF24',
      info: '#38BDF8',
      accent: '#8B5CF6',
      onPrimary: '#0C0A2A',
      overlay: 'rgba(12, 10, 42, 0.62)',
      positiveSurface: '#1E3A8A',
      negativeSurface: '#7F1D1D',
    },
    {
      shadows: createShadows('rgba(12, 10, 42, 0.62)'),
      gradients: {
        primary: ['#F97316', '#FB923C'],
        accent: ['#8B5CF6', '#22D3EE'],
        success: ['#0F766E', '#34D399'],
        danger: ['#7F1D1D', '#FB7185'],
      },
    }
  ),
};

// 4) Context tipi
interface ThemeContextType {
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  isLoading: boolean;
  colors: Colors; // aktif temanın renkleri
  tokens: ThemeTokens; // tema tasarım token'ları
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedTheme = await storageService.get<ThemeMode>('theme_mode');
      if (savedTheme && ['light', 'dark', 'colorful'].includes(savedTheme)) {
        setCurrentTheme(savedTheme);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setTheme = useCallback(async (theme: ThemeMode) => {
    setCurrentTheme(theme);
    await storageService.set('theme_mode', theme);
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const activeTheme = themes[currentTheme];

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    isLoading,
    colors: activeTheme.colors,
    tokens: activeTheme.tokens,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export default ThemeContext;
