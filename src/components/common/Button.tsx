// Button Component - Modern tema destekli buton bileşeni
import React, { useMemo, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  Animated,
  View as RNView,
} from 'react-native';
import { useTheme } from '@/contexts';

export interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  testID,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const buttonStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.6 : 1,
      position: 'relative',
      overflow: 'hidden',
    };

    const sizeStyles: Record<NonNullable<ButtonProps['size']>, ViewStyle> = {
      small: { 
        paddingVertical: 8, 
        paddingHorizontal: 16,
        minHeight: 36,
      },
      medium: { 
        paddingVertical: 12, 
        paddingHorizontal: 20,
        minHeight: 44,
      },
      large: { 
        paddingVertical: 16, 
        paddingHorizontal: 24,
        minHeight: 52,
      },
      xlarge: { 
        paddingVertical: 20, 
        paddingHorizontal: 32,
        minHeight: 60,
      },
    };

    const variantStyles: Record<NonNullable<ButtonProps['variant']>, ViewStyle> = {
      primary: {
        backgroundColor: colors.primary,
        borderWidth: 0,
        elevation: 2,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      secondary: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 1,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      gradient: {
        backgroundColor: colors.primary,
        borderWidth: 0,
        elevation: 3,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      success: {
        backgroundColor: colors.success,
        borderWidth: 0,
        elevation: 2,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      danger: {
        backgroundColor: colors.danger,
        borderWidth: 0,
        elevation: 2,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    };

    const widthStyle = fullWidth ? { width: '100%' as const } : {};

    return { ...base, ...sizeStyles[size], ...variantStyles[variant], ...widthStyle };
  }, [colors, size, variant, disabled, fullWidth]);

  const labelStyle = useMemo<TextStyle>(() => {
    const base: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles: Record<NonNullable<ButtonProps['size']>, TextStyle> = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
      xlarge: { fontSize: 20 },
    };

    const variantText: Record<NonNullable<ButtonProps['variant']>, TextStyle> = {
      primary: { color: colors.onPrimary },
      secondary: { color: colors.text },
      outline: { color: colors.primary },
      ghost: { color: colors.primary },
      gradient: { color: colors.onPrimary },
      success: { color: colors.onPrimary },
      danger: { color: colors.onPrimary },
    };

    return { ...base, ...sizeStyles[size], ...variantText[variant] };
  }, [colors, size, variant]);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
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

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Text style={[
        labelStyle, 
        { 
          marginRight: iconPosition === 'left' ? 8 : 0,
          marginLeft: iconPosition === 'right' ? 8 : 0,
        }
      ]}>
        {icon}
      </Text>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[labelStyle, { marginRight: 8 }]}>⏳</Text>
          <Text style={labelStyle}>Yükleniyor...</Text>
        </RNView>
      );
    }

    return (
      <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
        {iconPosition === 'left' && renderIcon()}
        <Text style={[labelStyle, textStyle]}>{title}</Text>
        {iconPosition === 'right' && renderIcon()}
      </RNView>
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[buttonStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        testID={testID}
        activeOpacity={1}
      >
        <Animated.View style={{ opacity: opacityAnim }}>
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Button;
