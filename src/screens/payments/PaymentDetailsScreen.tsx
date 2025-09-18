// Payment Details Screen - Bir entry'nin taksit/ödemeleri
import React, { useEffect, useState } from 'react';
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

  return (
    <Layout headerComponent={<PageHeader title={t('navigation.tabs.payments')} showBackButton onBackPress={goBack} /> }>
      <ScrollView style={styles.container}>
        {loading ? (
          <View style={styles.center}><Text variant="secondary">{t('common.messages.loading')}</Text></View>
        ) : error ? (
          <View style={styles.center}><Text variant="error">{error}</Text></View>
        ) : payments.length === 0 ? (
          <View style={styles.center}><Text variant="secondary">Kayıt bulunamadı</Text></View>
        ) : (
          <View style={{ gap: 10 }}>
            {payments.map((p) => (
              <View key={p.id} variant="transparent" style={{ borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text weight="semibold">{p.due_date}</Text>
                  <Text variant="secondary" size="small">{p.amount}</Text>
                </View>
                <TouchableOpacity
                  variant={p.status === 'paid' ? 'secondary' : 'primary'}
                  onPress={() => togglePaid(p.id, p.status)}
                >
                  <Text style={{ color: p.status === 'paid' ? colors.text : colors.onPrimary }}>
                    {p.status === 'paid' ? 'Ödendi' : 'Öde'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
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
});

export default PaymentDetailsScreen;
