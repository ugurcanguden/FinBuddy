// PaymentsHubScreen - Ödemeler / Gelirler sekmeli liste
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, PageHeader, ScrollView, View, Text, TouchableOpacity } from '@/components';
import { useNavigation, useTheme } from '@/contexts';
import { useLocale } from '@/hooks';
import { paymentService } from '@/services';
import type { Entry } from '@/types';

const PaymentsHubScreen: React.FC = () => {
  const { goBack, navigateTo } = useNavigation();
  const { colors } = useTheme();
  const { t } = useLocale();
  const [tab, setTab] = useState<'payments' | 'incomes'>('payments');
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getEntries(tab === 'payments' ? 'expense' : 'income');
      setItems(data);
      setError(null);
    } catch (e) {
      setError(String((e as Error).message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  return (
    <Layout headerComponent={<PageHeader title={t('screens.payments_hub.title')} showBackButton={false} onBackPress={goBack} /> }>
      {/* Tabs */}
      <View variant="transparent" style={styles.tabs}>
        <TouchableOpacity
          variant="transparent"
          style={[styles.tabBtn, { borderColor: colors.border, backgroundColor: tab === 'payments' ? colors.primary : 'transparent' }] as any}
          onPress={() => setTab('payments')}
        >
          <Text style={{ color: tab === 'payments' ? colors.onPrimary : colors.text }}>{t('screens.payments_hub.tab_payments')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          variant="transparent"
          style={[styles.tabBtn, { borderColor: colors.border, backgroundColor: tab === 'incomes' ? colors.primary : 'transparent' }] as any}
          onPress={() => setTab('incomes')}
        >
          <Text style={{ color: tab === 'incomes' ? colors.onPrimary : colors.text }}>{t('screens.payments_hub.tab_incomes')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {loading ? (
          <View style={styles.center}><Text variant="secondary">{t('common.messages.loading')}</Text></View>
        ) : error ? (
          <View style={styles.center}><Text variant="error">{error}</Text></View>
        ) : items.length === 0 ? (
          <View style={styles.center}><Text variant="secondary">{tab === 'payments' ? t('screens.payments_hub.payments_empty') : t('screens.payments_hub.incomes_empty')}</Text></View>
        ) : (
          <View style={{ gap: 12 }}>
            {items.map((e) => (
              <TouchableOpacity
                key={e.id}
                variant="transparent"
                style={{ borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 12 }}
                onPress={() => navigateTo('paymentDetails', { entryId: e.id })}
              >
                <Text weight="semibold">{e.title || (tab === 'payments' ? t('screens.payments_hub.payment') : t('screens.payments_hub.income'))}</Text>
                <Text variant="secondary" size="small">{e.schedule_type === 'installment' ? `${e.months} ${t('screens.payments_hub.installments')}` : t('screens.payments_hub.once')} • {e.amount}</Text>
                <Text variant="secondary" size="small">{t('screens.add_payment.start_date')}: {e.start_date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { alignItems: 'center', padding: 24 },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  tabBtn: { flex: 1, borderWidth: 1, borderRadius: 999, alignItems: 'center', paddingVertical: 10 },
});

export default PaymentsHubScreen;

