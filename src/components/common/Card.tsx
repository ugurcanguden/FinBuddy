// Card Component - Modern tema destekli kart bileşeni
import React, { useMemo, useRef } from 'react';
import { ViewStyle, Animated, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { useTheme } from '@/contexts';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'gradient' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
  onPress?: (event: GestureResponderEvent) => void;
  pressable?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  testID?: string | undefined;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  pressable = false,
  animated = false,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const cardStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
    };

    const paddingStyles: Record<NonNullable<CardProps['padding']>, ViewStyle> = {
      none: { padding: 0 },
      small: { padding: 8 },
      medium: { padding: 16 },
      large: { padding: 24 },
      xlarge: { padding: 32 },
    };

    const variantStyles: Record<NonNullable<CardProps['variant']>, ViewStyle> = {
      default: {
        borderWidth: 1,
        borderColor: colors.border,
      },
      elevated: {
        elevation: 4,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        borderWidth: 0,
      },
      outlined: {
        borderWidth: 2,
        borderColor: colors.primary,
      },
      filled: {
        backgroundColor: colors.backgroundMuted,
        borderWidth: 0,
      },
      gradient: {
        backgroundColor: colors.primary,
        borderWidth: 0,
        elevation: 6,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      glass: {
        backgroundColor: `${colors.card}80`,
        borderWidth: 1,
        borderColor: `${colors.border}40`,
      },
    };

    return { ...base, ...paddingStyles[padding], ...variantStyles[variant] };
  }, [colors, padding, variant]);

  const handlePressIn = () => {
    if (animated && (pressable || onPress)) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (animated && (pressable || onPress)) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const cardContent = (
    <Animated.View
      style={[
        cardStyle,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </Animated.View>
  );

  if (onPress || pressable) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={!onPress}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

export default Card;
