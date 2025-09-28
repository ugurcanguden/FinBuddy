// WalletCard Component - Modern cüzdan kartı bileşeni
import React, { useMemo, useRef, useEffect } from 'react';
import { ViewStyle, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/contexts';
import { useLocale } from '@/hooks';
import Card from './Card';
import Text from './Text';
import View from './View';
import ProgressBar from './ProgressBar';

const { width: _screenWidth } = Dimensions.get('window');

export interface WalletCardProps {
  title: string;
  balance: number;
  income: number;
  expense: number;
  currency?: string;
  animated?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const WalletCard: React.FC<WalletCardProps> = ({
  title,
  balance,
  income,
  expense,
  currency = '₺',
  animated = true,
  loading = false,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;

  const isPositive = balance >= 0;
  const netCash = income - expense;
  const progressPercentage = Math.min(Math.abs(netCash) / Math.max(income, expense, 1) * 100, 100);

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency || 'TRY',
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${currency}`;
    }
  };

  const cardStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      position: 'relative',
      overflow: 'hidden',
      minHeight: 160,
    };

    // Gradient benzeri efekt için
    const gradientStyle = isPositive 
      ? {
          backgroundColor: colors.success + '15',
          borderWidth: 2,
          borderColor: colors.success + '30',
        }
      : {
          backgroundColor: colors.danger + '15',
          borderWidth: 2,
          borderColor: colors.danger + '30',
        };

    return { ...base, ...gradientStyle };
  }, [colors, isPositive]);

  // Animasyonlar
  useEffect(() => {
    // Önceki animasyonları durdur
    scaleAnim.stopAnimation();
    balanceAnim.stopAnimation();
    progressAnim.stopAnimation();
    coinAnim.stopAnimation();
    
    if (animated && !loading) {
      // Animasyonları sıfırla
      scaleAnim.setValue(0);
      balanceAnim.setValue(0);
      progressAnim.setValue(0);
      coinAnim.setValue(0);
      
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.parallel([
          Animated.timing(balanceAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: progressPercentage / 100,
            duration: 800,
            useNativeDriver: false,
          }),
        ]),
      ]).start();

      // Coin animasyonu
      Animated.sequence([
        Animated.timing(coinAnim, {
          toValue: -10,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.spring(coinAnim, {
          toValue: 0,
          tension: 300,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (!loading) {
      scaleAnim.setValue(1);
      balanceAnim.setValue(1);
      progressAnim.setValue(progressPercentage / 100);
    }
  }, [animated, loading, progressPercentage, scaleAnim, balanceAnim, progressAnim, coinAnim]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ gap: 16 }}>
          {/* Header skeleton */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ width: 80, height: 20, backgroundColor: colors.border, borderRadius: 4 }} />
            <View style={{ width: 120, height: 24, backgroundColor: colors.border, borderRadius: 4 }} />
          </View>
          
          {/* Main content skeleton */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 60, height: 60, backgroundColor: colors.border, borderRadius: 30 }} />
            <View style={{ flex: 1, gap: 12 }}>
              <View style={{ width: '100%', height: 16, backgroundColor: colors.border, borderRadius: 4 }} />
              <View style={{ width: '80%', height: 16, backgroundColor: colors.border, borderRadius: 4 }} />
              <View style={{ width: '60%', height: 8, backgroundColor: colors.border, borderRadius: 4 }} />
            </View>
            <View style={{ width: 40, height: 40, backgroundColor: colors.border, borderRadius: 20 }} />
          </View>
        </View>
      );
    }

    return (
      <View style={{ gap: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="primary" size="large" weight="bold">
            {title}
          </Text>
          <Animated.View
            style={{
              opacity: balanceAnim,
              transform: [
                {
                  scale: balanceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <Text 
              variant={isPositive ? 'success' : 'error'} 
              size="xlarge" 
              weight="bold"
            >
              {formatCurrency(balance)}
            </Text>
          </Animated.View>
        </View>

        {/* Main Content */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Wallet Icon */}
          <Animated.View
            style={{
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: isPositive ? colors.success + '20' : colors.danger + '20',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: isPositive ? colors.success + '40' : colors.danger + '40',
              }}
            >
              <Text style={{ fontSize: 28 }}>
                {isPositive ? '👜' : '💸'}
              </Text>
            </View>
          </Animated.View>

          {/* Info Section */}
          <View style={{ flex: 1, gap: 12 }}>
            {/* Income */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="secondary" size="small" weight="medium">
                {t('screens.wallet.labels.income')}
              </Text>
              <Text variant="primary" size="medium" weight="semibold">
                {formatCurrency(income)}
              </Text>
            </View>

            {/* Expense */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="secondary" size="small" weight="medium">
                {t('screens.wallet.labels.expense')}
              </Text>
              <Text variant="primary" size="medium" weight="semibold">
                {formatCurrency(expense)}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={{ marginTop: 4 }}>
              <ProgressBar
                progress={progressPercentage}
                variant={isPositive ? 'success' : 'danger'}
                size="small"
                animated={animated}
              />
            </View>
          </View>

          {/* Coin Icon */}
          <Animated.View
            style={{
              transform: [
                {
                  translateY: coinAnim,
                },
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isPositive ? colors.success + '20' : colors.danger + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>
                {isPositive ? '🪙' : '💔'}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Footer */}
        <Text variant="secondary" size="small" style={{ textAlign: 'center', marginTop: 8 }}>
          {t('screens.wallet.footer')}
        </Text>
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
                outputRange: [0.9, 1],
              }),
            },
          ],
          opacity: scaleAnim,
        },
        style,
      ]}
      testID={testID}
    >
      <Card
        variant="default"
        padding="large"
        style={cardStyle}
      >
        {renderContent()}
      </Card>
    </Animated.View>
  );
};

export default WalletCard;
