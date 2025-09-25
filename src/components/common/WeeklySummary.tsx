// WeeklySummary Component - Haftalık özet kartı bileşeni
import React, { useMemo, useRef, useEffect } from 'react';
import { ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/contexts';
import Card from './Card';
import Text from './Text';
import View from './View';
import ProgressBar from './ProgressBar';

export interface WeeklyData {
  day: string;
  income: number;
  expense: number;
  net: number;
}

export interface WeeklySummaryProps {
  data: WeeklyData[];
  animated?: boolean;
  showProgress?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  data,
  animated = true,
  showProgress = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const barAnims = useRef<Animated.Value[]>([]);
  const containerAnim = useRef(new Animated.Value(0)).current;

  // Haftalık toplamları hesapla
  const weeklyTotals = useMemo(() => {
    const totalIncome = data.reduce((sum, day) => sum + day.income, 0);
    const totalExpense = data.reduce((sum, day) => sum + day.expense, 0);
    const netTotal = totalIncome - totalExpense;
    const maxAmount = Math.max(totalIncome, totalExpense, 1);

    return {
      totalIncome,
      totalExpense,
      netTotal,
      maxAmount,
      isPositive: netTotal >= 0,
    };
  }, [data]);

  // Animasyon değerlerini başlat
  useEffect(() => {
    barAnims.current = data.map(() => new Animated.Value(0));
  }, [data.length]);

  // Animasyonları başlat
  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.timing(containerAnim, {
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
    } else {
      containerAnim.setValue(1);
      barAnims.current.forEach(anim => anim.setValue(1));
    }
  }, [animated, containerAnim]);

  // Format currency
  const formatCurrency = (value: number) => {
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
  };

  // Bar yüksekliği hesapla
  const getBarHeight = (amount: number) => {
    if (weeklyTotals.maxAmount === 0) return 4;
    return Math.max(4, (amount / weeklyTotals.maxAmount) * 60);
  };

  const renderDayBar = (dayData: WeeklyData, index: number) => {
    const incomeHeight = getBarHeight(dayData.income);
    const expenseHeight = getBarHeight(dayData.expense);
    const isPositive = dayData.net >= 0;

    return (
      <Animated.View
        key={dayData.day}
        style={[
          {
            alignItems: 'center',
            gap: 8,
            transform: [
              {
                scaleY: barAnims.current[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }) || 1,
              },
            ],
          },
        ]}
      >
        {/* Bars Container */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 80 }}>
          {/* Income Bar */}
          <Animated.View
            style={{
              width: 12,
              height: barAnims.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, incomeHeight],
              }) || 0,
              backgroundColor: colors.success,
              borderRadius: 6,
              opacity: barAnims.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }) || 1,
            }}
          />
          
          {/* Expense Bar */}
          <Animated.View
            style={{
              width: 12,
              height: barAnims.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, expenseHeight],
              }) || 0,
              backgroundColor: colors.danger,
              borderRadius: 6,
              opacity: barAnims.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }) || 1,
            }}
          />
        </View>

        {/* Day Label */}
        <Text variant="secondary" size="small" weight="bold">
          {dayData.day}
        </Text>

        {/* Net Amount */}
        <Text
          variant={isPositive ? 'success' : 'error'}
          size="small"
          weight="semibold"
          style={{ fontSize: 10 }}
        >
          {isPositive ? '+' : ''}{formatCurrency(dayData.net)}
        </Text>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        {
          opacity: containerAnim,
          transform: [
            {
              translateY: containerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
        style,
      ]}
      testID={testID}
    >
      <Card variant="elevated" padding="medium">
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 4 }}>
            Haftalık Özet
          </Text>
          <Text variant="secondary" size="small">
            Bu hafta {data.length} günlük performans
          </Text>
        </View>

        {/* Summary Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text variant="success" size="xlarge" weight="bold">
              {formatCurrency(weeklyTotals.totalIncome)}
            </Text>
            <Text variant="secondary" size="small">Toplam Gelir</Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text variant="error" size="xlarge" weight="bold">
              {formatCurrency(weeklyTotals.totalExpense)}
            </Text>
            <Text variant="secondary" size="small">Toplam Gider</Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text
              variant={weeklyTotals.isPositive ? 'success' : 'error'}
              size="xlarge"
              weight="bold"
            >
              {formatCurrency(weeklyTotals.netTotal)}
            </Text>
            <Text variant="secondary" size="small">Net Durum</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
            {data.map((dayData, index) => renderDayBar(dayData, index))}
          </View>
        </View>

        {/* Progress Indicator */}
        {showProgress && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="secondary" size="small" weight="medium">
                Haftalık Hedef İlerlemesi
              </Text>
              <Text variant="secondary" size="small">
                {Math.round((weeklyTotals.totalIncome / Math.max(weeklyTotals.totalExpense, 1)) * 100)}%
              </Text>
            </View>
            
            <ProgressBar
              progress={Math.min((weeklyTotals.totalIncome / Math.max(weeklyTotals.totalExpense, 1)) * 100, 100)}
              variant={weeklyTotals.isPositive ? 'success' : 'danger'}
              size="small"
              animated={animated}
            />
          </View>
        )}

        {/* Legend */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.success,
              }}
            />
            <Text variant="secondary" size="small">Gelir</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.danger,
              }}
            />
            <Text variant="secondary" size="small">Gider</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

export default WeeklySummary;
