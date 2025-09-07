// TouchableOpacity Component - Tema destekli TouchableOpacity bileşeni
import React, { useMemo, forwardRef } from 'react';
import {
  TouchableOpacity as RNTouchableOpacity,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '@/contexts';

export interface TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'transparent';
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>; // ✅ StyleProp: array/conditional/object hepsi desteklenir
  testID?: string;
  hitSlop?: number | { top: number; bottom: number; left: number; right: number };
}

const TouchableOpacity = forwardRef<any, TouchableOpacityProps>(
  (
    {
      children,
      variant = 'transparent',
      onPress,
      onLongPress,
      disabled = false,
      activeOpacity = 0.7,
      style,
      testID,
      hitSlop,
    },
    ref
  ) => {
    const { colors } = useTheme();

    const containerStyle = useMemo<ViewStyle>(() => {
      const base: ViewStyle = {
        opacity: disabled ? 0.6 : 1,
      };

      const variantStyles: Record<NonNullable<TouchableOpacityProps['variant']>, ViewStyle> = {
        default: {
          backgroundColor: colors.card,    // eski surface
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        primary: {
          backgroundColor: colors.primary,
          borderRadius: 8,
          padding: 12,
        },
        secondary: {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: 12,
        },
        transparent: {
          backgroundColor: 'transparent',
        },
      };

      return { ...base, ...variantStyles[variant] };
    }, [colors, disabled, variant]);

    return (
      <RNTouchableOpacity
        ref={ref}
        style={[containerStyle, style]}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        testID={testID}
        hitSlop={hitSlop}
        accessibilityRole="button"
      >
        {children}
      </RNTouchableOpacity>
    );
  }
);

TouchableOpacity.displayName = 'TouchableOpacity';

export default TouchableOpacity;
