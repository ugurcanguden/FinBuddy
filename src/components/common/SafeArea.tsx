// SafeArea Component - Tema destekli SafeAreaView bileşeni
import React, { useMemo } from 'react';
import {
  SafeAreaView as RNSafeAreaView,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/contexts';

export interface SafeAreaProps {
  children: React.ReactNode;
  variant?: 'default' | 'surface' | 'background';
  style?: StyleProp<ViewStyle>;
  testID?: string;
  nativeID?: string; // RN için geçerli prop
}

const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  variant = 'default',
  style,
  testID,
  nativeID,
}) => {
  const { colors } = useTheme();

  const containerStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = { flex: 1 };

    const byVariant: Record<NonNullable<SafeAreaProps['variant']>, ViewStyle> = {
      default: { backgroundColor: colors.background },
      background: { backgroundColor: colors.background },
      surface: { backgroundColor: colors.card }, // eski "surface" = theme.card
    };

    return { ...base, ...byVariant[variant] };
  }, [colors, variant]);

  return (
    <RNSafeAreaView
      style={[containerStyle, style]}
      testID={testID}
      nativeID={nativeID}
    >
      {children}
    </RNSafeAreaView>
  );
};

export default SafeArea;
