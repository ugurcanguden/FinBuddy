// Incomes Screen - Modern gelir listesi
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Layout, PageHeader, ScrollView, View, Text, TouchableOpacity, Card, Button } from '@/components';
import { StatCard, Badge } from '@/components/common';
import { useNavigation } from '@/contexts';
import { useLocale } from '@/hooks';
import { paymentService } from '@/services';
import type { Entry } from '@/types';

const IncomesScreen: React.FC = () => {
  const { goBack, navigateTo } = useNavigation();
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

  // Entry'nin durumunu kontrol et
  const getEntryStatus = useCallback(async (entryId: string) => {
    try {
      const payments = await paymentService.getPaymentsByEntry(entryId);
      const hasPendingPayments = payments.some(p => p.status === 'pending');
      return hasPendingPayments ? 'pending' : 'received';
    } catch (error) {
      console.error('Error checking entry status:', error);
      return 'pending';
    }
  }, []);

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
        <View style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            {t('screens.incomes.income_statistics') || 'Gelir İstatistikleri'}
          </Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title={t('screens.incomes.total_amount') || 'Toplam Tutar'}
              value={formatCurrency(stats.totalAmount)}
              subtitle={t('screens.incomes.total_incomes_subtitle') || 'tüm gelirler'}
              icon="💰"
              variant="success"
              animated={true}
              style={styles.statCard}
            />
            
            <StatCard
              title={t('screens.incomes.installment') || 'Taksitli'}
              value={stats.installmentCount.toString()}
              subtitle={t('screens.incomes.installment_subtitle') || 'gelir'}
              icon="📅"
              variant="warning"
              animated={true}
              style={styles.statCard}
            />
            
            <StatCard
              title={t('screens.incomes.one_time') || 'Tek Seferlik'}
              value={stats.oneTimeCount.toString()}
              subtitle={t('screens.incomes.one_time_subtitle') || 'gelir'}
              icon="💳"
              variant="info"
              animated={true}
              style={styles.statCard}
            />
            
            <StatCard
              title={t('screens.incomes.total_installments') || 'Toplam Taksit'}
              value={stats.totalMonths.toString()}
              subtitle={t('screens.incomes.total_installments_subtitle') || 'ay'}
              icon="📊"
              variant="primary"
              animated={true}
              style={styles.statCard}
            />
          </View>
        </View>

        {/* Hızlı Eylemler */}
        <View style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            {t('screens.incomes.quick_actions') || 'Hızlı Eylemler'}
          </Text>
          
          <View style={styles.actionButtons}>
            <Button
              variant="primary"
              size="large"
              onPress={() => navigateTo('addEntry', { type: 'income' })}
              icon="➕"
              title={t('screens.incomes.add_income') || 'Yeni Gelir Ekle'}
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Gelirler Listesi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
              {t('screens.incomes.incomes_list') || 'Gelirler'} ({entries.length})
            </Text>
            
            {entries.length > 0 && (
              <Button
                variant="outline"
                size="small"
                onPress={() => navigateTo('addPayment')}
                title={t('screens.incomes.add_income_button') || 'Yeni Ekle'}
                style={styles.addButton}
              />
            )}
          </View>

          {loading ? (
            <Card variant="default" style={styles.loadingCard}>
              <Text variant="secondary" size="medium" style={styles.loadingText}>
                {t('common.messages.loading')}
              </Text>
            </Card>
          ) : error ? (
            <Card variant="outlined" style={styles.errorCard}>
              <Text variant="error" size="medium" style={styles.errorText}>
                {error}
              </Text>
              <Button
                variant="outline"
                size="small"
                onPress={loadEntries}
                title={t('screens.incomes.try_again') || 'Tekrar Dene'}
                style={styles.retryButton}
              />
            </Card>
          ) : entries.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text variant="secondary" size="medium" style={styles.emptyText}>
                {t('screens.incomes.no_incomes_yet') || 'Henüz gelir yok'}
              </Text>
              <Button
                variant="primary"
                size="medium"
                onPress={() => navigateTo('addPayment')}
                title={t('screens.incomes.first_income') || 'İlk Gelirinizi Ekleyin'}
                style={styles.emptyButton}
              />
            </Card>
          ) : (
            <View style={styles.entriesList}>
              {entries.map((entry) => (
                <Card key={entry.id} variant="elevated" style={styles.entryCard}>
                  <View style={styles.entryContainer}>
                    <TouchableOpacity
                      onPress={() => navigateTo('paymentDetails', { entryId: entry.id })}
                      style={styles.entryContent}
                    >
                      <View style={styles.entryHeader}>
                        <Text variant="primary" size="medium" weight="bold" style={styles.entryTitle}>
                          {entry.title || (t('screens.incomes.income') || 'Gelir')}
                        </Text>
                        <Badge 
                          variant={entry.schedule_type === 'installment' ? 'warning' : 'info'}
                          size="small"
                        >
                          {entry.schedule_type === 'installment' 
                            ? (t('screens.incomes.installment') || 'Taksitli') 
                            : (t('screens.incomes.one_time') || 'Tek Seferlik')
                          }
                        </Badge>
                      </View>
                      
                      <View style={styles.entryDetails}>
                        <Text variant="primary" size="large" weight="bold" style={styles.entryAmount}>
                          {formatCurrency(entry.amount)}
                        </Text>
                        <Text variant="secondary" size="small" style={styles.entryDate}>
                          {formatDate(entry.start_date)}
                        </Text>
                      </View>
                      
                      {entry.schedule_type === 'installment' && (
                        <View style={styles.installmentInfo}>
                          <Text variant="secondary" size="small">
                            {entry.months} {t('screens.incomes.installment') || 'taksit'} • {entry.category_id}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    
                    <View style={styles.entryActions}>
                      <TouchableOpacity
                        style={[
                          styles.receiveButton,
                          entryStatuses[entry.id] === 'received' && styles.receivedButton
                        ]}
                        onPress={() => handlePaymentAction(entry.id)}
                      >
                        <Text style={[
                          styles.receiveButtonText,
                          entryStatuses[entry.id] === 'received' && styles.receivedButtonText
                        ]}>
                          {entryStatuses[entry.id] === 'received' 
                            ? (t('screens.incomes.received_button') || 'Alındı')
                            : (t('screens.incomes.receive_button') || 'Al')
                          }
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => confirmDelete(entry.id)}
                      >
                        <Text variant="error" size="medium">🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  addButton: {
    alignSelf: 'flex-end',
  },
  loadingCard: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
  },
  errorCard: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    alignSelf: 'center',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    alignSelf: 'center',
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    padding: 16,
  },
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryTitle: {
    flex: 1,
    marginRight: 12,
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryAmount: {
    color: '#27AE60',
  },
  entryDate: {
    textAlign: 'right',
  },
  installmentInfo: {
    marginTop: 4,
  },
  entryActions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  receiveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#27AE60',
    minWidth: 50,
    alignItems: 'center',
  },
      receiveButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
      },
      receivedButton: {
        backgroundColor: '#95A5A6', // Gri renk
      },
      receivedButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
      },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
});

export default IncomesScreen;
