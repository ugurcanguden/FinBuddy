// Payment Details Screen - Bir entry'nin taksit/ödemeleri
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Layout, PageHeader, ScrollView, View, Text, TouchableOpacity } from '@/components';
import { useNavigation, useTheme } from '@/contexts';
import { useLocale } from '@/hooks';
import { paymentService } from '@/services';
import type { Payment } from '@/types';

interface Props { entryId?: string }

const PaymentDetailsScreen: React.FC<Props> = ({ entryId }) => {
  const navigation = useNavigation();
  const goBack = navigation.goBack;
  const currentParams = navigation.getCurrentParams() as ({ entryId?: string } | null);
  const { colors } = useTheme();
  const { t } = useLocale();
  const id = entryId || currentParams?.entryId;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await paymentService.getPaymentsByEntry(id);
      setPayments(data);
      setError(null);
    } catch (e) {
      setError(String((e as Error).message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const togglePaid = async (paymentId: string, currentStatus: Payment['status']) => {
    try {
      const next = currentStatus === 'pending' ? 'paid' : 'pending';
      await paymentService.updatePaymentStatus(paymentId, next);
      await load();
    } catch (e) {
      Alert.alert(t('common.messages.error'), String((e as Error).message || ''));
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      t('common.messages.confirm_delete'),
      undefined,
      [
        { text: t('common.buttons.cancel'), style: 'cancel' },
        {
          text: t('common.buttons.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentService.deleteEntry(id);
              Alert.alert(t('common.messages.success'), t('common.messages.delete_success'));
              goBack();
            } catch (err) {
              Alert.alert(t('common.messages.error'), String((err as Error).message || ''));
            }
          },
        },
      ]
    );
  };

  const isCompleted = (status: Payment['status']) => status === 'paid' || status === 'received';

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) =>
      activeTab === 'completed' ? isCompleted(payment.status) : !isCompleted(payment.status)
    );
  }, [payments, activeTab]);

  const emptyText = activeTab === 'completed'
    ? t('screens.payments_hub.empty_completed') || 'Tamamlanan kayıt bulunmuyor'
    : t('screens.payments_hub.empty_pending') || 'Bekleyen kayıt bulunmuyor';

  return (
    <Layout headerComponent={<PageHeader title={t('navigation.tabs.payments')} showBackButton onBackPress={goBack} /> }>
      <ScrollView style={styles.container}>
        <View variant="transparent" style={styles.tabContainer}>
          {(['pending', 'completed'] as const).map((tabKey) => {
            const isActive = activeTab === tabKey;
            const label = tabKey === 'pending'
              ? t('screens.payments_hub.tab_pending') || 'Bekleyenler'
              : t('screens.payments_hub.tab_completed') || 'Tamamlananlar';
            return (
              <TouchableOpacity
                key={tabKey}
                variant="transparent"
                style={[styles.tabButton, { borderColor: colors.border, backgroundColor: isActive ? colors.primary : 'transparent' }] as any}
                onPress={() => setActiveTab(tabKey)}
              >
                <Text style={{ color: isActive ? colors.onPrimary : colors.text }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {loading ? (
          <View style={styles.center}><Text variant="secondary">{t('common.messages.loading')}</Text></View>
        ) : error ? (
          <View style={styles.center}><Text variant="error">{error}</Text></View>
        ) : filteredPayments.length === 0 ? (
          <View style={styles.center}><Text variant="secondary">{emptyText}</Text></View>
        ) : (
          <View style={{ gap: 10 }}>
            {filteredPayments.map((p) => {
              const completed = isCompleted(p.status);
              return (
                <View key={p.id} variant="transparent" style={{ borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text weight="semibold">{p.due_date}</Text>
                  <Text variant="secondary" size="small">{p.amount}</Text>
                </View>
                <TouchableOpacity
                  variant={completed ? 'secondary' : 'primary'}
                  onPress={() => togglePaid(p.id, p.status)}
                >
                  <Text style={{ color: completed ? colors.text : colors.onPrimary }}>
                    {completed ? (t('screens.payments_hub.paid') || 'Ödendi') : (t('screens.payments_hub.pay') || 'Öde')}
                  </Text>
                </TouchableOpacity>
              </View>
              );
            })}
          </View>
        )}
        {id && (
          <View style={{ marginTop: 24 }}>
            <TouchableOpacity
              variant="transparent"
              style={{ borderWidth: 1, borderColor: colors.danger, borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}
              onPress={handleDelete}
            >
              <Text style={{ color: colors.danger }}>{t('common.buttons.delete')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { alignItems: 'center', padding: 24 },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
});

export default PaymentDetailsScreen;
