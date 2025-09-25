// StatCard Component - Modern istatistik kartı bileşeni
import React, { useMemo, useRef, useEffect } from 'react';
import { ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/contexts';
import Card from './Card';
import Text from './Text';
import View from './View';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  animated?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
  animated = true,
  loading = false,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const valueAnim = useRef(new Animated.Value(0)).current;
  const trendAnim = useRef(new Animated.Value(0)).current;

  const cardStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      position: 'relative',
      overflow: 'hidden',
    };

    const variantStyles: Record<NonNullable<StatCardProps['variant']>, ViewStyle> = {
      default: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      },
      success: {
        backgroundColor: colors.positiveSurface,
        borderWidth: 1,
        borderColor: colors.success,
      },
      warning: {
        backgroundColor: colors.warning + '10',
        borderWidth: 1,
        borderColor: colors.warning,
      },
      danger: {
        backgroundColor: colors.negativeSurface,
        borderWidth: 1,
        borderColor: colors.danger,
      },
      info: {
        backgroundColor: colors.info + '10',
        borderWidth: 1,
        borderColor: colors.info,
      },
      primary: {
        backgroundColor: colors.primary + '10',
        borderWidth: 1,
        borderColor: colors.primary,
      },
    };

    return { ...base, ...variantStyles[variant] };
  }, [colors, variant]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'neutral':
        return '➡️';
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.danger;
      case 'neutral':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  // Giriş animasyonu
  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(valueAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
      valueAnim.setValue(1);
    }
  }, [animated, scaleAnim, valueAnim]);

  // Trend animasyonu
  useEffect(() => {
    if (trend && animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(trendAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(trendAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [trend, animated, trendAnim]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 20, height: 20, backgroundColor: colors.border, borderRadius: 4 }} />
            <View style={{ width: 100, height: 16, backgroundColor: colors.border, borderRadius: 4 }} />
          </View>
          <View style={{ width: 80, height: 24, backgroundColor: colors.border, borderRadius: 4 }} />
          <View style={{ width: 60, height: 12, backgroundColor: colors.border, borderRadius: 4 }} />
        </View>
      );
    }

    return (
      <View style={{ gap: 8 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            {icon && (
              <Text style={{ fontSize: 16 }}>{icon}</Text>
            )}
            <Text 
              variant="secondary" 
              size="small" 
              weight="medium" 
              style={{ flex: 1 }}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
          {trend && (
            <Animated.View
              style={{
                opacity: trendAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
                transform: [
                  {
                    scale: trendAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.1],
                    }),
                  },
                ],
              }}
            >
              <Text style={{ fontSize: 12 }}>{getTrendIcon()}</Text>
            </Animated.View>
          )}
        </View>

        {/* Value */}
        <Animated.View
          style={{
            opacity: valueAnim,
            transform: [
              {
                translateY: valueAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <Text 
            variant="primary" 
            size="xlarge" 
            weight="bold"
            style={{ color: variant === 'default' ? colors.text : colors[variant] }}
          >
            {value}
          </Text>
        </Animated.View>

        {/* Subtitle and Trend */}
        {(subtitle || trendValue) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {subtitle && (
              <Text variant="secondary" size="small" style={{ flex: 1 }}>
                {subtitle}
              </Text>
            )}
            {trendValue && (
              <Text 
                variant="secondary" 
                size="small" 
                weight="medium"
                style={{ color: getTrendColor() }}
              >
                {trendValue}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
        style,
      ]}
      testID={testID}
    >
      <Card
        variant="default"
        padding="medium"
        style={cardStyle}
      >
        {renderContent()}
      </Card>
    </Animated.View>
  );
};

export default StatCard;
