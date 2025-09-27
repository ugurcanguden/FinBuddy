// PaymentStatusSection - Ödeme durumu bölümü
import React, { useMemo } from 'react';
import { View, Text, Card, TouchableOpacity } from '@/components';
import { useLocale } from '@/hooks';
import { useTheme } from '@/contexts';

interface PaymentStatusSectionProps {
  upcomings: Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number; type: string }>;
  overdueExpenses: Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number; type: string }>;
  overdueIncomes: Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number; type: string }>;
  listTab: 'upcoming_expense' | 'upcoming_income' | 'overdue_expense' | 'overdue_income';
  onTabChange: (tab: 'upcoming_expense' | 'upcoming_income' | 'overdue_expense' | 'overdue_income') => void;
  onPaymentAction: (paymentId: string, type: 'expense' | 'income') => void;
  formatCurrency: (value: number) => string;
  calculateOverdueDays: (dueDate: string) => number | null;
  calculateDaysUntil: (dueDate: string) => number | null;
}

const PaymentStatusSection: React.FC<PaymentStatusSectionProps> = ({
  upcomings,
  overdueExpenses,
  overdueIncomes,
  listTab,
  onTabChange,
  onPaymentAction,
  formatCurrency,
  calculateOverdueDays,
  calculateDaysUntil
}) => {
  const { t } = useLocale();
  const { colors } = useTheme();

  const listTabs = useMemo(
    () => [
      { key: 'upcoming_expense' as const, label: t('screens.home.upcoming_expenses') || 'Yaklaşan Giderler' },
      { key: 'upcoming_income' as const, label: t('screens.home.upcoming_incomes') || 'Yaklaşan Gelirler' },
      { key: 'overdue_expense' as const, label: t('screens.home.overdue_expenses') || 'Ödemesi Geçenler' },
      { key: 'overdue_income' as const, label: t('screens.home.overdue_incomes') || 'Tahsilatı Gecikenler' },
    ],
    [t]
  );

  const listItems = useMemo(() => {
    switch (listTab) {
      case 'upcoming_expense':
        // Sadece gider ödemelerini göster
        return upcomings.filter(item => item.type === 'expense');
      case 'upcoming_income':
        // Sadece gelir ödemelerini göster
        return upcomings.filter(item => item.type === 'income');
      case 'overdue_expense':
        return overdueExpenses;
      case 'overdue_income':
        return overdueIncomes;
      default:
        return [] as typeof upcomings;
    }
  }, [listTab, overdueExpenses, overdueIncomes, upcomings]);

  const listMeta = useMemo(() => {
    switch (listTab) {
      case 'upcoming_expense':
        return {
          icon: '💸',
          color: colors.danger,
          emptyText: t('screens.home.no_upcoming_expenses') || 'Yaklaşan gider bulunmuyor.',
          fallbackTitle: t('screens.home.expense') || 'Gider',
          secondaryLabel: t('screens.home.due_date_label') || 'Son Tarih',
        };
      case 'upcoming_income':
        return {
          icon: '💰',
          color: colors.success,
          emptyText: t('screens.home.no_upcoming_incomes') || 'Yaklaşan gelir bulunmuyor.',
          fallbackTitle: t('screens.home.income') || 'Gelir',
          secondaryLabel: t('screens.home.due_date_label') || 'Son Tarih',
        };
      case 'overdue_expense':
        return {
          icon: '⚠️',
          color: colors.danger,
          emptyText: t('screens.home.no_overdue_expenses') || 'Geciken ödeme bulunmuyor.',
          fallbackTitle: t('screens.home.expense') || 'Gider',
          secondaryLabel: t('screens.home.overdue_date_label') || 'Son Tarih',
        };
      case 'overdue_income':
        return {
          icon: '💰',
          color: colors.primary,
          emptyText: t('screens.home.no_overdue_incomes') || 'Geciken tahsilat bulunmuyor.',
          fallbackTitle: t('screens.home.income') || 'Gelir',
          secondaryLabel: t('screens.home.overdue_date_label') || 'Son Tarih',
        };
      default:
        return {
          icon: '💳',
          color: colors.primary,
          emptyText: t('common.messages.no_data') || 'Veri yok',
          fallbackTitle: t('screens.home.payment') || t('common.labels.payment') || 'Ödeme',
          secondaryLabel: t('screens.home.due_date_label') || 'Son Tarih',
        };
    }
  }, [colors.danger, colors.primary, colors.success, listTab, t]);

  return (
    <View style={{ marginTop: 24, gap: 16 }}>
      <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 4 }}>
        {t('screens.home.activity_section_title') || 'Ödeme Durumu'}
      </Text>
      
      <View style={[{ flexDirection: 'row', borderWidth: 1, borderRadius: 999, padding: 4, gap: 4 }, { borderColor: colors.border }] as any}>
        {listTabs.map((tab) => {
          const active = listTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              variant="transparent"
              onPress={() => onTabChange(tab.key)}
              style={[
                { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
                {
                  backgroundColor: active ? colors.primary : 'transparent',
                  borderColor: colors.border,
                },
              ] as any}
            >
              <Text style={{ color: active ? colors.onPrimary : colors.text, textAlign: 'center' }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View style={{ gap: 12 }}>
        {listItems.length === 0 ? (
          <Card padding="medium">
            <Text variant="secondary">{listMeta.emptyText}</Text>
          </Card>
        ) : (
          listItems.map((item) => {
            const overdueDays = calculateOverdueDays(item.due_date);
            const remainingDays = calculateDaysUntil(item.due_date);
            const extraInfo = (listTab === 'upcoming_expense' || listTab === 'upcoming_income')
              ? (typeof remainingDays === 'number' && remainingDays > 0
                  ? `${t('screens.home.remaining_days') || 'Kalan'}: ${remainingDays} ${t('common.time.days') || 'gün'}`
                  : null)
              : (typeof overdueDays === 'number' && overdueDays > 0
                  ? `${t('screens.home.overdue_days') || 'Gecikme'}: ${overdueDays} ${t('common.time.days') || 'gün'}`
                  : null);
            return (
              <Card key={item.id} padding="medium">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${listMeta.color}20` as any,
                    }}
                  >
                    <Text style={{ color: listMeta.color }}>{listMeta.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="primary" weight="medium">{item.title || listMeta.fallbackTitle}</Text>
                    <Text variant="secondary" size="small">{`${listMeta.secondaryLabel}: ${item.due_date}`}</Text>
                    {extraInfo && (
                      <Text variant="secondary" size="small">{extraInfo}</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <Text variant="primary" weight="semibold">{formatCurrency(item.amount)}</Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: listMeta.color,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        minWidth: 60,
                        alignItems: 'center',
                      }}
                      onPress={() => onPaymentAction(item.id, item.type as 'expense' | 'income')}
                    >
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                        {item.type === 'expense' 
                          ? (t('screens.home.pay_button') || 'Öde')
                          : (t('screens.home.receive_button') || 'Al')
                        }
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </View>
    </View>
  );
};

export default PaymentStatusSection;
