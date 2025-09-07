// TextInput - Tema destekli TextInput bileşeni
import React, { useMemo } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/contexts';

export interface TextInputProps extends RNTextInputProps {
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  error?: boolean;
  disabled?: boolean;
  style?: StyleProp<TextStyle>;
}

const withAlpha = (hex: string, alpha: number) => {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return hex.length === 7 ? `${hex}${a}` : hex;
};

const TextInput: React.FC<TextInputProps> = ({
  variant = 'default',
  size = 'medium',
  error = false,
  disabled = false,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const variantStyle = useMemo<TextStyle>(() => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.card, // surface benzeri
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
        };
    }
  }, [variant, error, colors]);

  const sizeStyle = useMemo<TextStyle>(() => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 16, fontSize: 18 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 14, fontSize: 16 };
    }
  }, [size]);

  const textColors = useMemo<TextStyle>(
    () => ({ color: disabled ? colors.textSecondary : colors.text }),
    [disabled, colors]
  );

  const inputStyle: StyleProp<TextStyle> = [
    styles.base,
    variantStyle,
    sizeStyle,
    textColors,
    style,
  ];

  return (
    <RNTextInput
      style={inputStyle}
      editable={!disabled}
      placeholderTextColor={colors.textSecondary}
      cursorColor={colors.primary}
      selectionColor={withAlpha(colors.primary, 0.35)}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    fontFamily: 'System',
  },
});

export default TextInput;
