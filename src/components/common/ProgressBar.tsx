// ProgressBar Component - Modern ilerleme çubuğu bileşeni
import React, { useMemo, useRef, useEffect } from 'react';
import { View as RNView, ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/contexts';
import Text from './Text';
import View from './View';

export interface ProgressBarProps {
  progress: number; // 0-100 arası değer
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'medium',
  showLabel = false,
  label,
  animated = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Progress değerini 0-100 arasında sınırla
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const containerStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      backgroundColor: colors.backgroundMuted,
      borderRadius: 999,
      overflow: 'hidden',
      position: 'relative',
    };

    const sizeStyles: Record<NonNullable<ProgressBarProps['size']>, ViewStyle> = {
      small: { height: 6 },
      medium: { height: 8 },
      large: { height: 12 },
    };

    return { ...base, ...sizeStyles[size] };
  }, [colors, size]);

  const progressStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      height: '100%',
      borderRadius: 999,
      position: 'relative',
    };

    const variantStyles: Record<NonNullable<ProgressBarProps['variant']>, ViewStyle> = {
      default: {
        backgroundColor: colors.primary,
      },
      success: {
        backgroundColor: colors.success,
      },
      warning: {
        backgroundColor: colors.warning,
      },
      danger: {
        backgroundColor: colors.danger,
      },
      gradient: {
        backgroundColor: colors.primary,
        // Gradient için daha gelişmiş bir yaklaşım gerekebilir
      },
    };

    return { ...base, ...variantStyles[variant] };
  }, [colors, variant]);

  // Animasyon efektleri
  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: clampedProgress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, progressAnim]);

  // Pulse animasyonu (progress %100 olduğunda)
  useEffect(() => {
    if (clampedProgress >= 100) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
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
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
    return undefined;
  }, [clampedProgress, pulseAnim]);

  const renderLabel = () => {
    if (!showLabel) return null;

    const displayLabel = label || `${Math.round(clampedProgress)}%`;
    
    return (
      <View style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="secondary" size="small" weight="medium">
          {displayLabel}
        </Text>
        <Text variant="secondary" size="small">
          {Math.round(clampedProgress)}%
        </Text>
      </View>
    );
  };

  return (
    <RNView style={style} testID={testID}>
      {renderLabel()}
      <RNView style={containerStyle}>
        <Animated.View
          style={[
            progressStyle,
            {
              transform: [
                { scaleY: pulseAnim },
                {
                  scaleX: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        />
        
        {/* Shine efekti */}
        {variant === 'gradient' && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 999,
              transform: [
                {
                  translateX: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['-100%', '100%'],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }}
          />
        )}
      </RNView>
    </RNView>
  );
};

export default ProgressBar;
