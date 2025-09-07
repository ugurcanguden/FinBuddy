// Text Component - Tema destekli metin bileşeni
import React, { useMemo } from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { useTheme } from '@/contexts';

export interface TextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'error' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  testID?: string;
  numberOfLines?: number;
  selectable?: boolean;
}

const Text: React.FC<TextProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  weight = 'normal',
  align = 'left',
  style,
  testID,
  numberOfLines,
  selectable,
}) => {
  const { colors } = useTheme();

  const computedStyle = useMemo<TextStyle>(() => {
    const base: TextStyle = { textAlign: align };

    const sizeStyles: Record<NonNullable<TextProps['size']>, TextStyle> = {
      small: { fontSize: 12 },
      medium: { fontSize: 14 },
      large: { fontSize: 16 },
      xlarge: { fontSize: 18 },
    };

    const weightStyles: Record<NonNullable<TextProps['weight']>, TextStyle> = {
      normal: { fontWeight: '400' },
      medium: { fontWeight: '500' },
      semibold: { fontWeight: '600' },
      bold: { fontWeight: '700' },
    };

    const variantStyles: Record<NonNullable<TextProps['variant']>, TextStyle> = {
      primary: { color: colors.text },
      secondary: { color: colors.textSecondary },
      accent: { color: colors.primary },
      error: { color: colors.danger },
      success: { color: colors.success },
      warning: { color: colors.warning },
    };

    return {
      ...base,
      ...sizeStyles[size],
      ...weightStyles[weight],
      ...variantStyles[variant],
    };
  }, [align, size, weight, variant, colors]);

  return (
    <RNText
      style={[computedStyle, style]}
      testID={testID}
      numberOfLines={numberOfLines}
      selectable={selectable}
    >
      {children}
    </RNText>
  );
};

export default Text;
