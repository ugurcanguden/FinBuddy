// StatusBar Component - Tema destekli StatusBar bileşeni
import React, { useMemo } from 'react';
import { StatusBar as RNStatusBar, StatusBarStyle } from 'react-native';
import { useTheme } from '@/contexts';

export interface StatusBarProps {
  backgroundColor?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ backgroundColor }) => {
  const { currentTheme, colors } = useTheme();

  const barStyle: StatusBarStyle = useMemo(() => {
    if (currentTheme === 'dark' || currentTheme === 'colorful') {
      return 'light-content';
    }
    return 'dark-content';
  }, [currentTheme]);

  const resolvedBackgroundColor = useMemo(() => {
    if (backgroundColor) return backgroundColor;
    if (currentTheme === 'colorful') return colors.background;
    return undefined; // native default
  }, [backgroundColor, currentTheme, colors.background]);

  return <RNStatusBar barStyle={barStyle} backgroundColor={resolvedBackgroundColor} />;
};

export default StatusBar;
