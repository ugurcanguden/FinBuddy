// LineChart Component - Modern line chart bileşeni
import React, { useMemo, useCallback } from 'react';
import { ViewStyle, ScrollView as RNScrollView, View as RNView } from 'react-native';
import { useTheme } from '@/contexts';
import Card from './Card';
import Text from './Text';
import View from './View';

export interface LineChartData {
  label: string;
  value: number;
  color?: string;
  status?: 'paid' | 'pending' | 'overdue';
}

export interface LineChartProps {
  title: string;
  subtitle?: string;
  data: LineChartData[];
  height?: number;
  animated?: boolean;
  showValues?: boolean;
  showLabels?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  subtitle,
  data,
  height = 220,
  animated: _animated = true,
  showValues = true,
  showLabels = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  // Maksimum değeri hesapla
  const maxValue = useMemo(() => {
    if (data.length === 0) return 100;
    const values = data.map(d => d.value);
    const max = Math.max(...values);
    return max === 0 ? 100 : Math.max(max, 50);
  }, [data]);

  // Format currency
  const formatCurrency = useCallback((value: number) => {
    try {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        maximumFractionDigits: 0,
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value);
    } catch {
      return `${value.toFixed(0)}₺`;
    }
  }, []);

  // Get color based on status
  const getPointColor = useCallback((item: LineChartData) => {
    if (item.color) return item.color;
    
    switch (item.status) {
      case 'paid':
        return '#10B981'; // Yeşil - alınan
      case 'pending':
        return '#F59E0B'; // Sarı - bekleyen
      case 'overdue':
        return '#EF4444'; // Kırmızı - geciken
      default:
        return '#3B82F6'; // Mavi - varsayılan
    }
  }, []);

  // Chart genişliği
  const chartWidth = useMemo(() => {
    if (data.length === 0) return 300;
    const minWidth = 240;
    if (data.length === 1) return minWidth;
    const minSpacing = 96;
    const horizontalPadding = 24;
    return Math.max(minWidth, horizontalPadding * 2 + minSpacing * (data.length - 1));
  }, [data.length]);

  // Line points hesapla
  const linePoints = useMemo(() => {
    if (data.length === 0) return [];
    const horizontalPadding = 24;
    const verticalPadding = 16;
    const containerHeight = height;
    const innerHeight = Math.max(containerHeight - verticalPadding * 2, 1);
    const usableWidth = Math.max(chartWidth - horizontalPadding * 2, 1);
    const ratioDenominator = data.length > 1 ? data.length - 1 : 1;

    return data.map((item, index) => {
      const xRatio = data.length === 1 ? 0.5 : index / ratioDenominator;
      const valueRatio = maxValue > 0 ? item.value / maxValue : 0.5;
      const x = horizontalPadding + usableWidth * xRatio;
      const y = verticalPadding + (1 - valueRatio) * innerHeight;
      return { ...item, x, y };
    });
  }, [data, maxValue, chartWidth, height]);

  // Line segments hesapla
  const lineSegments = useMemo(() => {
    if (linePoints.length < 2) return [];
    const segments: Array<{ id: string; length: number; angle: number; cx: number; cy: number }> = [];
    for (let i = 0; i < linePoints.length - 1; i += 1) {
      const current = linePoints[i]!;
      const next = linePoints[i + 1]!;
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const cx = (current.x + next.x) / 2;
      const cy = (current.y + next.y) / 2;
      segments.push({ id: `${current.label}-${next.label}-${i}`, length, angle, cx, cy });
    }
    return segments;
  }, [linePoints]);

  // Boş veri durumu
  if (data.length === 0) {
    return (
      <View
        style={[style]}
        {...(testID && { testID })}
      >
        <Card variant="elevated" padding="medium" style={{ gap: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text variant="primary" size="large" weight="bold">
                {title}
              </Text>
              {subtitle && (
                <Text variant="secondary" size="small" style={{ marginTop: 4 }}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {/* Empty State */}
          <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
            <Text variant="secondary" size="medium" style={{ textAlign: 'center' }}>
              Henüz veri bulunmuyor
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View
      style={[style]}
      {...(testID && { testID })}
    >
      <Card variant="elevated" padding="medium" style={{ gap: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="primary" size="large" weight="bold">
              {title}
            </Text>
            {subtitle && (
              <Text variant="secondary" size="small" style={{ marginTop: 4 }}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Chart */}
        <View style={{ position: 'relative' }}>
          <RNScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            <RNView>
              <RNView
                style={{
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                  justifyContent: 'center',
                  height,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  width: chartWidth,
                }}
              >
                <RNView style={{ flex: 1 }}>
                  {/* Line Segments */}
                  {lineSegments.map((segment) => (
                    <RNView
                      key={segment.id}
                      style={{
                        position: 'absolute',
                        left: segment.cx - segment.length / 2,
                        top: segment.cy - 1,
                        width: segment.length,
                        height: 3,
                        backgroundColor: colors.primary,
                        transform: [{ rotate: `${segment.angle}deg` }],
                        borderRadius: 1.5,
                      }}
                    />
                  ))}
                  
                  {/* Data Points */}
                  {linePoints.map((point, index) => {
                    const pointColor = getPointColor(point);
                    return (
                      <RNView
                        key={`point-${point.label}-${point.status || 'default'}-${index}`}
                        style={{
                          position: 'absolute',
                          left: point.x - 6,
                          top: point.y - 6,
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: pointColor,
                          borderWidth: 2,
                          borderColor: colors.card,
                          shadowColor: pointColor,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 4,
                        }}
                      />
                    );
                  })}
                  
                  {/* Value Labels */}
                  {showValues && linePoints.map((point, index) => (
                    <Text
                      key={`point-value-${point.label}-${point.status || 'default'}-${index}`}
                      variant="secondary"
                      size="small"
                      weight="bold"
                      style={{
                        position: 'absolute',
                        left: point.x - 50,
                        top: Math.max(point.y - 28, 4),
                        width: 100,
                        textAlign: 'center',
                        backgroundColor: colors.card,
                        borderRadius: 6,
                        paddingHorizontal: 4,
                        paddingVertical: 2,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      {formatCurrency(point.value)}
                    </Text>
                  ))}
                </RNView>
              </RNView>
              
              {/* Labels */}
              {showLabels && linePoints.length > 0 && (
                <RNView style={{ position: 'relative', height: 28, marginTop: 8, width: chartWidth }}>
                  {linePoints.map((point, index) => (
                    <Text
                      key={`label-${point.label}-${point.status || 'default'}-${index}`}
                      variant="secondary"
                      size="small"
                      weight="bold"
                      style={{
                        position: 'absolute',
                        left: point.x - 40,
                        width: 80,
                        textAlign: 'center',
                      }}
                    >
                      {point.label}
                    </Text>
                  ))}
                </RNView>
              )}
            </RNView>
          </RNScrollView>
        </View>

        {/* Legend */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#10B981',
              }}
            />
            <Text variant="secondary" size="small">Alınan</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#F59E0B',
              }}
            />
            <Text variant="secondary" size="small">Bekleyen</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#EF4444',
              }}
            />
            <Text variant="secondary" size="small">Geciken</Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

export default LineChart;
