// View Component - Tema destekli View bileşeni
import React, { useMemo } from 'react';
import {
  View as RNView,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/contexts';

export interface ViewProps {
  children?: React.ReactNode;
  variant?: 'default' | 'surface' | 'background' | 'transparent';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const View: React.FC<ViewProps> = ({
  children,
  variant = 'transparent',
  style,
  testID,
}) => {
  const { colors } = useTheme();

  const containerStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {};

    const byVariant: Record<NonNullable<ViewProps['variant']>, ViewStyle> = {
      default: { backgroundColor: colors.background },
      background: { backgroundColor: colors.background },
      surface: { backgroundColor: colors.card },
      transparent: { backgroundColor: 'transparent' },
    };

    return { ...base, ...byVariant[variant] };
  }, [colors, variant]);

  return (
    <RNView style={[containerStyle, style]} testID={testID}>
      {children}
    </RNView>
  );
};

export default View;
