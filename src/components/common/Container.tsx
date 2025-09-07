// Container Component - Tema destekli container bileşeni
import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts';

export interface ContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'surface' | 'background';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string;
  withBorder?: boolean; // kontrast için opsiyonel border
}

const Container: React.FC<ContainerProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  style,
  testID,
  withBorder = false,
}) => {
  const { colors } = useTheme();

  const containerStyle = useMemo<ViewStyle>(() => {
    const paddingStyles: Record<NonNullable<ContainerProps['padding']>, ViewStyle> = {
      none: { padding: 0 },
      small: { padding: 8 },
      medium: { padding: 16 },
      large: { padding: 24 },
    };

    const marginStyles: Record<NonNullable<ContainerProps['margin']>, ViewStyle> = {
      none: { margin: 0 },
      small: { margin: 8 },
      medium: { margin: 16 },
      large: { margin: 24 },
    };

    const variantStyles: Record<NonNullable<ContainerProps['variant']>, ViewStyle> = {
      default:    { backgroundColor: colors.background },
      background: { backgroundColor: colors.background },
      surface:    { backgroundColor: colors.card }, // eski surface = card
    };

    const borderStyle: ViewStyle = withBorder
      ? { borderWidth: 1, borderColor: colors.border, borderRadius: 12 }
      : {};

    return {
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...variantStyles[variant],
      ...borderStyle,
    };
  }, [colors, padding, margin, variant, withBorder]);

  return (
    <View style={[containerStyle, style]} testID={testID}>
      {children}
    </View>
  );
};

export default Container;
