// Incomes Screen - Gelir kayıtları listesi
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Layout, PageHeader, ScrollView, View, Text, TouchableOpacity } from '@/components';
import { useNavigation, useTheme } from '@/contexts';
import { useLocale } from '@/hooks';
import { paymentService } from '@/services';
import type { Entry } from '@/types';

const IncomesScreen: React.FC = () => {
  const { goBack, navigateTo } = useNavigation();
  const { t } = useLocale();
  const { colors } = useTheme();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getEntries('income');
      setEntries(data);
      setError(null);
    } catch (e) {
      setError(String((e as Error).message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const confirmDelete = useCallback(
    (entryId: string) => {
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
                await paymentService.deleteEntry(entryId);
                await loadEntries();
                Alert.alert(t('common.messages.success'), t('common.messages.delete_success'));
              } catch (err) {
                Alert.alert(t('common.messages.error'), String((err as Error).message || ''));
              }
            },
          },
        ]
      );
    },
    [loadEntries, t]
  );

  return (
    <Layout headerComponent={<PageHeader title={t('navigation.tabs.incomes') || 'Gelirler'} showBackButton={false} onBackPress={goBack} /> }>
      <ScrollView style={styles.container}>
        {loading ? (
          <View style={styles.center}><Text variant="secondary">{t('common.messages.loading')}</Text></View>
        ) : error ? (
          <View style={styles.center}><Text variant="error">{error}</Text></View>
        ) : entries.length === 0 ? (
          <View style={styles.center}><Text variant="secondary">Henüz gelir yok</Text></View>
        ) : (
          <View style={{ gap: 12 }}>
            {entries.map((e) => (
              <View
                key={e.id}
                variant="transparent"
                style={{ borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 12, gap: 8 }}
              >
                <TouchableOpacity
                  variant="transparent"
                  onPress={() => navigateTo('paymentDetails', { entryId: e.id })}
                >
                  <Text weight="semibold">{e.title || 'Gelir'}</Text>
                  <Text variant="secondary" size="small">{e.schedule_type === 'installment' ? `${e.months} taksit` : 'Tek seferlik'} • {e.amount} </Text>
                  <Text variant="secondary" size="small">{t('screens.add_payment.start_date')}: {e.start_date}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  variant="transparent"
                  style={{ alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.danger }}
                  onPress={() => confirmDelete(e.id)}
                >
                  <Text style={{ color: colors.danger }}>{t('common.buttons.delete')}</Text>
                </TouchableOpacity>
              </View>
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
});

export default IncomesScreen;
