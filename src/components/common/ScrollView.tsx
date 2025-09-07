// ScrollView Component - Tema destekli ScrollView bileşeni
import React, { useMemo } from 'react';
import {
  ScrollView as RNScrollView,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/contexts';

export interface ScrollViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'surface' | 'background' | 'transparent';
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const ScrollView: React.FC<ScrollViewProps> = ({
  children,
  variant = 'transparent',
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  const containerStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = { flex: 1 };

    const byVariant: Record<NonNullable<ScrollViewProps['variant']>, ViewStyle> = {
      default: { backgroundColor: colors.background },
      background: { backgroundColor: colors.background },
      surface: { backgroundColor: colors.card },
      transparent: { backgroundColor: 'transparent' },
    };

    return { ...base, ...byVariant[variant] };
  }, [colors, variant]);

  return (
    <RNScrollView
      style={[containerStyle, style]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      testID={testID}
    >
      {children}
    </RNScrollView>
  );
};

export default ScrollView;
