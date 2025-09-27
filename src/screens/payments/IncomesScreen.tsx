// Incomes Screen - Modern gelir listesi
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Layout, PageHeader, ScrollView } from '@/components';
import { useNavigation } from '@/contexts';
import { useLocale } from '@/hooks';
import { paymentService } from '@/services';
import type { Entry } from '@/models';
import { 
  IncomeStatsSection, 
  IncomeQuickActionsSection, 
  IncomeListSection 
} from './components';

const IncomesScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const { t } = useLocale();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entryStatuses, setEntryStatuses] = useState<Record<string, 'pending' | 'received'>>({});

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getEntries('income');
      setEntries(data);
      setError(null);
      
      // Her entry için durumu kontrol et
      const statuses: Record<string, 'pending' | 'received'> = {};
      for (const entry of data) {
        try {
          const payments = await paymentService.getPaymentsByEntry(entry.id);
          const hasPendingPayments = payments.some(p => p.status === 'pending');
          statuses[entry.id] = hasPendingPayments ? 'pending' : 'received';
        } catch (error) {
          console.error(`Error checking status for entry ${entry.id}:`, error);
          statuses[entry.id] = 'pending';
        }
      }
      setEntryStatuses(statuses);
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

  const handlePaymentAction = useCallback(async (entryId: string) => {
    try {
      // Entry'nin tüm pending ödemelerini received olarak işaretle
      const payments = await paymentService.getPaymentsByEntry(entryId);
      const pendingPayments = payments.filter(p => p.status === 'pending');
      
      for (const payment of pendingPayments) {
        await paymentService.updatePaymentStatus(payment.id, 'received');
      }
      
      await loadEntries();
      
      Alert.alert(
        t('screens.incomes.income_success') || 'Başarılı',
        t('screens.incomes.income_marked_success') || 'Gelir başarıyla işaretlendi!'
      );
    } catch (error) {
      console.error('Income action failed:', error);
      Alert.alert(
        t('screens.incomes.income_error') || 'Hata', 
        t('screens.incomes.income_error_message') || 'İşlem sırasında bir hata oluştu.'
      );
    }
  }, [loadEntries, t]);


  // İstatistikler hesapla
  const stats = useMemo(() => {
    const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const installmentCount = entries.filter(e => e.schedule_type === 'installment').length;
    const oneTimeCount = entries.filter(e => e.schedule_type === 'once').length;
    const totalMonths = entries.reduce((sum, entry) => sum + (entry.months || 0), 0);
    
    return {
      totalAmount,
      installmentCount,
      oneTimeCount,
      totalMonths,
    };
  }, [entries]);

  // Para formatı
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Tarih formatı
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  return (
    <Layout headerComponent={<PageHeader title={t('navigation.tabs.incomes') || 'Gelirler'} showBackButton={false} onBackPress={goBack} /> }>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* İstatistikler */}
        <IncomeStatsSection
          stats={stats}
          formatCurrency={formatCurrency}
        />

        {/* Hızlı Eylemler */}
        <IncomeQuickActionsSection />

        {/* Gelirler Listesi */}
        <IncomeListSection
          entries={entries}
          loading={loading}
          error={error}
          entryStatuses={entryStatuses}
          onLoadEntries={loadEntries}
          onIncomeAction={handlePaymentAction}
          onConfirmDelete={confirmDelete}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default IncomesScreen;
