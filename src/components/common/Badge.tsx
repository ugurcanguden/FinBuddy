// Badge Component - Modern rozet bileşeni
import React, { useMemo, useRef, useEffect } from 'react';
import { ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/contexts';
import Text from './Text';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'small' | 'medium' | 'large';
  shape?: 'rounded' | 'pill' | 'square';
  animated?: boolean;
  pulse?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  shape = 'rounded',
  animated = false,
  pulse = false,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const badgeStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    };

    const sizeStyles: Record<NonNullable<BadgeProps['size']>, ViewStyle> = {
      small: { 
        paddingHorizontal: 6, 
        paddingVertical: 2,
        minHeight: 20,
      },
      medium: { 
        paddingHorizontal: 8, 
        paddingVertical: 4,
        minHeight: 24,
      },
      large: { 
        paddingHorizontal: 12, 
        paddingVertical: 6,
        minHeight: 28,
      },
    };

    const shapeStyles: Record<NonNullable<BadgeProps['shape']>, ViewStyle> = {
      rounded: { borderRadius: 6 },
      pill: { borderRadius: 999 },
      square: { borderRadius: 0 },
    };

    const variantStyles: Record<NonNullable<BadgeProps['variant']>, ViewStyle> = {
      default: {
        backgroundColor: colors.backgroundMuted,
        borderWidth: 0,
      },
      primary: {
        backgroundColor: colors.primary,
        borderWidth: 0,
        elevation: 1,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      success: {
        backgroundColor: colors.success,
        borderWidth: 0,
        elevation: 1,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      warning: {
        backgroundColor: colors.warning,
        borderWidth: 0,
        elevation: 1,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      danger: {
        backgroundColor: colors.danger,
        borderWidth: 0,
        elevation: 1,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      info: {
        backgroundColor: colors.info,
        borderWidth: 0,
        elevation: 1,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      },
    };

    return { ...base, ...sizeStyles[size], ...shapeStyles[shape], ...variantStyles[variant] };
  }, [colors, size, shape, variant]);

  const textStyle = useMemo(() => {
    const base = {
      fontWeight: '600' as const,
      textAlign: 'center' as const,
    };

    const sizeStyles: Record<NonNullable<BadgeProps['size']>, { fontSize: number }> = {
      small: { fontSize: 10 },
      medium: { fontSize: 12 },
      large: { fontSize: 14 },
    };

    const variantText: Record<NonNullable<BadgeProps['variant']>, { color: string }> = {
      default: { color: colors.text },
      primary: { color: colors.onPrimary },
      success: { color: colors.onPrimary },
      warning: { color: colors.onPrimary },
      danger: { color: colors.onPrimary },
      info: { color: colors.onPrimary },
      outline: { color: colors.text },
    };

    return {
      ...base,
      ...sizeStyles[size],
      ...variantText[variant],
    };
  }, [colors, size, variant]);

  // Giriş animasyonu
  useEffect(() => {
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [animated, scaleAnim]);

  // Pulse animasyonu
  useEffect(() => {
    if (pulse) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
    return undefined;
  }, [pulse, pulseAnim]);

  const renderChildren = () => {
    if (typeof children === 'string' || typeof children === 'number') {
      return (
        <Text style={textStyle}>
          {children}
        </Text>
      );
    }
    return children as React.ReactNode;
  };

  return (
    <Animated.View
      style={[
        badgeStyle,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
        style,
      ]}
      testID={testID}
    >
      {renderChildren()}
    </Animated.View>
  );
};

export default Badge;
