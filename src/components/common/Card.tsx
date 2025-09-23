// Card Component - Tema destekli kart bileşeni
import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string | undefined;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  testID,
}) => {
  const { colors } = useTheme();

  const cardStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: 12,
    };

    const paddingStyles: Record<NonNullable<CardProps['padding']>, ViewStyle> = {
      none: { padding: 0 },
      small: { padding: 8 },
      medium: { padding: 16 },
      large: { padding: 24 },
    };

    const variantStyles: Record<NonNullable<CardProps['variant']>, ViewStyle> = {
      default: {
        borderWidth: 1,
        borderColor: colors.border,
      },
      elevated: {
        elevation: 2,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 0,
      },
      outlined: {
        borderWidth: 1,
        borderColor: colors.primary,
      },
    };

    return { ...base, ...paddingStyles[padding], ...variantStyles[variant] };
  }, [colors, padding, variant]);

  return (
    <View style={[cardStyle, style]} testID={testID}>
      {children}
    </View>
  );
};

export default Card;
