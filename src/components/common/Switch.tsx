// Switch Component - Tema destekli Switch bileşeni
import React, { useMemo } from 'react';
import { Switch as RNSwitch } from 'react-native';
import { useTheme } from '@/contexts';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

const withAlpha = (hex: string, alpha: number) => {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return hex.length === 7 ? `${hex}${a}` : hex;
};

const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  testID,
}) => {
  const { colors } = useTheme();

  const trackColor = useMemo(
    () => ({
      false: colors.border,
      true: withAlpha(colors.primary, 0.4), // %40 opak
    }),
    [colors]
  );

  const thumbColor = useMemo(
    () => (value ? colors.primary : colors.textSecondary),
    [value, colors]
  );

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={trackColor}
      thumbColor={thumbColor}
      testID={testID}
    />
  );
};

export default Switch;
