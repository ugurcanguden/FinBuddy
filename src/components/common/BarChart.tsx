// BarChart Component - Modern bar chart bileşeni
import React, { useMemo, useRef, useEffect } from 'react';
import { ViewStyle, Animated, ScrollView } from 'react-native';
import { useTheme } from '@/contexts';
import Card from './Card';
import Text from './Text';
import View from './View';

export interface BarChartData {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
  secondaryColor?: string;
}

export interface BarChartProps {
  title: string;
  subtitle?: string;
  data: BarChartData[];
  height?: number;
  barWidth?: number;
  barSpacing?: number;
  animated?: boolean;
  showValues?: boolean;
  showLabels?: boolean;
  variant?: 'default' | 'gradient' | 'stacked';
  currency?: string;
  formatValue?: (value: number) => string;
  style?: ViewStyle;
  testID?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  subtitle,
  data,
  height = 160,
  barWidth = 44,
  barSpacing = 16,
  animated = true,
  showValues = true,
  showLabels = true,
  variant = 'default',
  currency = 'USD',
  formatValue,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const barAnims = useRef<Animated.Value[]>([]);
  const chartAnim = useRef(new Animated.Value(0)).current;
  

  // Animasyon değerlerini başlat
  useEffect(() => {
    barAnims.current = data.map(() => new Animated.Value(0));
  }, [data.length]);

  // Maksimum değeri hesapla
  const maxValue = useMemo(() => {
    if (data.length === 0) return 100;
    const values = data.map(d => Math.max(d.value, d.secondaryValue || 0));
    const max = Math.max(...values);
    // Eğer tüm değerler 0 ise, minimum bir maxValue kullan
    // Küçük değerler için minimum maxValue kullan
    return max === 0 ? 100 : Math.max(max, 50);
  }, [data]);

  // Değer ölçekleme fonksiyonu
  const scaleValue = (value: number) => {
    if (value === 0) return 0; // 0 değer için 0 yükseklik
    if (maxValue === 0) return 20; // minimum bar height
    const scaledHeight = (value / maxValue) * (height - 40);
    const result = Math.max(20, scaledHeight); // En az 20px yükseklik
    return result;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    if (formatValue) {
      return formatValue(value);
    }
    
    try {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${currency}`;
    }
  };

  // Animasyonları başlat
  useEffect(() => {
    // Önce tüm animasyonları sıfırla
    chartAnim.setValue(0);
    barAnims.current.forEach(anim => anim.setValue(0));
    
    if (animated) {
      // Kısa bir gecikme ile animasyonu başlat
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(chartAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.stagger(
            100,
            barAnims.current.map(anim =>
              Animated.timing(anim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: false,
              })
            )
          ),
        ]).start();
      }, 100);
    } else {
      chartAnim.setValue(1);
      barAnims.current.forEach(anim => anim.setValue(1));
    }
  }, [animated, chartAnim, data.length]);

  // Chart genişliği
  const chartWidth = Math.max(data.length * (barWidth + barSpacing), 300);
  
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

  const renderBar = (item: BarChartData, index: number) => {
    const barHeight = scaleValue(item.value);
    const secondaryHeight = item.secondaryValue ? scaleValue(item.secondaryValue) : 0;
    const totalHeight = Math.max(barHeight, secondaryHeight);

    return (
      <View
        key={`bar-${index}`}
        style={{
          width: barWidth,
          marginHorizontal: barSpacing / 2,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        {/* Bar Container */}
        <View style={{ 
          position: 'relative', 
          height: Math.max(totalHeight, 20), // En az 20px yükseklik
          minHeight: 20,
        }}>
          {/* Secondary Bar (if exists) */}
          {item.secondaryValue && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: secondaryHeight,
                backgroundColor: item.secondaryColor || colors.success,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
            />
          )}

          {/* Main Bar */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: barHeight,
              backgroundColor: item.color || colors.primary,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              ...(variant === 'gradient' && {
                // Gradient efekti için shadow
                shadowColor: item.color || colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }),
            }}
          />

          {/* Value Label */}
          {showValues && (
            <View
              style={{
                position: 'absolute',
                top: -20,
                left: 0,
                right: 0,
                alignItems: 'center',
              }}
            >
              <Text variant="secondary" size="small" weight="bold">
                {formatCurrency(item.value)}
              </Text>
            </View>
          )}
        </View>

        {/* Label */}
        {showLabels && (
          <View style={{ marginTop: 8, alignItems: 'center' }}>
            <Text variant="secondary" size="small" weight="bold">
              {item.label}
            </Text>
            {item.secondaryValue && (
              <Text variant="secondary" size="small" style={{ fontSize: 10, marginTop: 2 }}>
                {formatCurrency(item.secondaryValue)}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {/* Chart Container */}
            <View
              style={{
                height,
                width: chartWidth,
                flexDirection: 'row',
                alignItems: 'flex-end',
                minHeight: height,
              }}
            >
              {data.map((item, index) => renderBar(item, index))}
            </View>
          </ScrollView>

          {/* Grid Lines */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <View
              style={{
                height,
                width: chartWidth,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <View
                  key={`grid-${index}`}
                  style={{
                    width: chartWidth,
                    height: 1,
                    backgroundColor: colors.border + '30',
                    position: 'absolute',
                    bottom: ratio * height,
                  }}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Legend */}
        {variant === 'stacked' && data.some(d => d.secondaryValue) && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: colors.primary,
                }}
              />
              <Text variant="secondary" size="small">Toplam</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: colors.success,
                }}
              />
              <Text variant="secondary" size="small">Ödenen</Text>
            </View>
          </View>
        )}
      </Card>
    </View>
  );
};

export default BarChart;
