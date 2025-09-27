// RecentTransactions Component - Son işlemler listesi bileşeni
import React, { useMemo, useRef, useEffect } from 'react';
import { ViewStyle, Animated, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts';
import Card from './Card';
import Text from './Text';
import View from './View';
import Badge from './Badge';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status?: 'pending' | 'completed' | 'failed';
  icon?: string;
}

export interface RecentTransactionsProps {
  transactions: Transaction[];
  maxItems?: number;
  showStatus?: boolean;
  animated?: boolean;
  onTransactionPress?: (transaction: Transaction) => void;
  onViewAllPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  maxItems = 5,
  showStatus = true,
  animated = true,
  onTransactionPress,
  onViewAllPress,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const itemAnims = useRef<Animated.Value[]>([]);
  const containerAnim = useRef(new Animated.Value(0)).current;

  // Sınırlı sayıda işlem göster
  const displayTransactions = useMemo(() => {
    return transactions.slice(0, maxItems);
  }, [transactions, maxItems]);

  // Animasyon değerlerini başlat
  useEffect(() => {
    itemAnims.current = displayTransactions.map(() => new Animated.Value(0));
  }, [displayTransactions.length]);

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
          itemAnims.current.map(anim =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            })
          )
        ),
      ]).start();
    } else {
      containerAnim.setValue(1);
      itemAnims.current.forEach(anim => anim.setValue(1));
    }
  }, [animated, containerAnim]);

  // Format currency
  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${value.toFixed(0)}₺`;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Bugün';
      if (diffDays === 1) return 'Dün';
      if (diffDays < 7) return `${diffDays} gün önce`;
      
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'short',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Status badge
  const getStatusBadge = (status?: string) => {
    if (!showStatus || !status) return null;

    const statusConfig = {
      pending: { variant: 'warning' as const, text: 'Bekliyor' },
      completed: { variant: 'success' as const, text: 'Tamamlandı' },
      failed: { variant: 'danger' as const, text: 'Başarısız' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge variant={config.variant} size="small">
        {config.text}
      </Badge>
    );
  };

  const renderTransaction = (transaction: Transaction, index: number) => {
    const isIncome = transaction.type === 'income';
    const iconColor = isIncome ? colors.success : colors.danger;

    return (
      <Animated.View
        key={transaction.id}
        style={[
          {
            transform: [
              {
                translateX: itemAnims.current[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }) || 0,
              },
            ],
            opacity: itemAnims.current[index]?.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }) || 1,
          },
        ]}
      >
        <RNTouchableOpacity
          onPress={() => onTransactionPress?.(transaction)}
          activeOpacity={0.7}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + '30',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Icon */}
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: iconColor + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>
                {transaction.icon || (isIncome ? '💰' : '💸')}
              </Text>
            </View>

            {/* Content */}
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="primary" size="medium" weight="semibold" numberOfLines={1}>
                  {transaction.title}
                </Text>
                <Text
                  variant={isIncome ? 'success' : 'error'}
                  size="medium"
                  weight="bold"
                >
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text variant="secondary" size="small">
                    {transaction.category}
                  </Text>
                  {getStatusBadge(transaction.status)}
                </View>
                <Text variant="secondary" size="small">
                  {formatDate(transaction.date)}
                </Text>
              </View>
            </View>
          </View>
        </RNTouchableOpacity>
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
      <Card variant="elevated" padding="none">
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + '30',
          }}
        >
          <Text variant="primary" size="large" weight="bold">
            Son İşlemler
          </Text>
          {onViewAllPress && (
            <RNTouchableOpacity onPress={onViewAllPress} activeOpacity={0.7}>
              <Text variant="primary" size="small" weight="medium" style={{ color: colors.primary }}>
                Tümünü Gör
              </Text>
            </RNTouchableOpacity>
          )}
        </View>

        {/* Transactions List */}
        {displayTransactions.length > 0 ? (
          <View>
            {displayTransactions.map((transaction, index) => renderTransaction(transaction, index))}
          </View>
        ) : (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📝</Text>
            <Text variant="secondary" size="medium" style={{ textAlign: 'center' }}>
              Henüz işlem bulunmuyor
            </Text>
            <Text variant="secondary" size="small" style={{ textAlign: 'center', marginTop: 4 }}>
              İlk işleminizi ekleyerek başlayın
            </Text>
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

export default RecentTransactions;
