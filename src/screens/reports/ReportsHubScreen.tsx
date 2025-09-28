// ReportsHubScreen - Modern rapor hub'ı
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { Layout, PageHeader, View, Text, ReportPreviewModal, Button } from '@/components';
import { useLocale } from '@/hooks';
import { useNavigation } from '@/contexts';
import { useCurrencyFormatter } from '@/utils';
import { paymentService, reportsService, databaseService, type ReportDef } from '@/services';
import { 
  MonthlySummarySection, 
  SavedReportsSection 
} from './components';

const ReportsHubScreen: React.FC = () => {
  const { t } = useLocale();
  const { navigateTo } = useNavigation();
  const { format } = useCurrencyFormatter();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [summary, setSummary] = useState<{ expense: { total: number; paid: number; pending: number }; income: { total: number; paid: number; pending: number } } | null>(null);
  const [savedReports, setSavedReports] = useState<ReportDef[]>([]);
  const [savedLoading, setSavedLoading] = useState<boolean>(true);
  const [previewReport, setPreviewReport] = useState<ReportDef | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [monthlyData, setMonthlyData] = useState<Array<{ ym: string; income: number; expense: number }>>([]);

  // Veritabanı hazır olana kadar bekle
  useEffect(() => {
    const checkDbReady = async () => {
      try {
        // Basit bir test sorgusu ile veritabanının hazır olup olmadığını kontrol et
        await databaseService.getAll('SELECT 1');
        setDbReady(true);
      } catch (error) {
        console.log('Database not ready yet, retrying...');
        setTimeout(checkDbReady, 100);
      }
    };
    checkDbReady();
  }, []);

  // Veri yükleme fonksiyonu
  const loadData = useCallback(async () => {
    if (!dbReady) return;
    
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      // Son 6 ayı hesapla
      const last6Months: string[] = [];
      for (let i = 0; i < 6; i++) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        last6Months.push(`${year}-${month}`);
      }
      
      // En son ayı seç (ilk eleman)
      const currentYm = last6Months[0];
      
      const [sum, incomeSeries, expenseSeries] = await Promise.all([
        paymentService.getDashboardSummary(currentYm),
        paymentService.getMonthlySeries('income', { year: currentYear.toString() }),
        paymentService.getMonthlySeries('expense', { year: currentYear.toString() }),
      ]);
      
      setSummary(sum);
      
      // Aylık verileri birleştir - sadece son 6 ay
      const monthlyDataMap = new Map<string, { ym: string; income: number; expense: number }>();
      
      // Null check ekle
      if (incomeSeries && Array.isArray(incomeSeries)) {
        incomeSeries.forEach(item => {
          if (last6Months.includes(item.ym)) {
            if (!monthlyDataMap.has(item.ym)) {
              monthlyDataMap.set(item.ym, { ym: item.ym, income: 0, expense: 0 });
            }
            // Sadece ödemesi gerçekleşen (received) gelirleri kullan
            monthlyDataMap.get(item.ym)!.income = item.paid;
          }
        });
      }
      
      if (expenseSeries && Array.isArray(expenseSeries)) {
        expenseSeries.forEach(item => {
          if (last6Months.includes(item.ym)) {
            if (!monthlyDataMap.has(item.ym)) {
              monthlyDataMap.set(item.ym, { ym: item.ym, income: 0, expense: 0 });
            }
            // Sadece ödemesi gerçekleşen (paid) giderleri kullan
            monthlyDataMap.get(item.ym)!.expense = item.paid;
          }
        });
      }
      
      // Son 6 ayı sıralı olarak düzenle (en yeni en başta)
      const monthlyDataArray = last6Months
        .map(ym => monthlyDataMap.get(ym) || { ym, income: 0, expense: 0 })
        .reverse(); // En eski en başta olsun
      
      setMonthlyData(monthlyDataArray);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }, [dbReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadSavedReports = useCallback(async () => {
    if (!dbReady) return;
    
    try {
      setSavedLoading(true);
      const list = await reportsService.listReports();
      setSavedReports(list);
    } catch (error) {
      console.error('Failed to load saved reports', error);
    } finally {
      setSavedLoading(false);
    }
  }, [dbReady]);

  useEffect(() => {
    loadSavedReports();
  }, [loadSavedReports]);

  // Pull-to-refresh fonksiyonu
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadData(),
        loadSavedReports()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadData, loadSavedReports]);

  const formatCurrencyValue = useCallback((value: number) => {
    return format(value);
  }, [format]);

  // Component'lere taşındı - artık burada yok

  const handleOpenSaved = useCallback((report: ReportDef) => {
    navigateTo('reportBuilder', { config: report.config, reportId: report.id, name: report.name });
  }, [navigateTo]);

  const openPreview = useCallback((report: ReportDef) => {
    console.log('Opening preview for report:', report);
    setPreviewReport(report);
    setPreviewVisible(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewVisible(false);
    setPreviewReport(null);
  }, []);

  const handleDeleteSaved = useCallback(
    (report: ReportDef) => {
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
                await reportsService.deleteReport(report.id);
                await loadSavedReports();
                if (previewReport?.id === report.id) {
                  closePreview();
                }
                Alert.alert(t('common.messages.success'), t('common.messages.delete_success'));
              } catch (err) {
                Alert.alert(t('common.messages.error'), String((err as Error).message || ''));
              }
            },
          },
        ]
      );
    },
    [closePreview, loadSavedReports, previewReport, t]
  );


  // Component'lere taşındı - artık burada yok

  // Veritabanı hazır değilse loading göster
  if (!dbReady) {
    return (
      <Layout headerComponent={<PageHeader title={t('navigation.tabs.reports')} /> }>
        <View style={styles.loadingContainer}>
          <Text variant="secondary" size="medium">
            {t('common.messages.loading')}
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout headerComponent={<PageHeader title={t('navigation.tabs.reports')} /> }>
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing} // refreshing state'ini kullan
            onRefresh={onRefresh}
            colors={['#007AFF']} // iOS
            tintColor="#007AFF" // iOS
            title={t('common.messages.refreshing') || 'Yenileniyor...'} // iOS
            titleColor="#666" // iOS
          />
        }
      >
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <View style={styles.titleSection}>
            <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
              {t('screens.reports.last_6_months') || 'Son 6 Ay'}
            </Text>
            <Text variant="secondary" size="small" style={styles.sectionSubtitle}>
              {t('screens.reports.pull_to_refresh') || 'Yenilemek için aşağı çekin'}
            </Text>
          </View>
          
          <Button
            variant="primary"
            size="medium"
            onPress={() => navigateTo('reportBuilder')}
            icon="➕"
            title={t('screens.reports.create_report')}
            style={styles.createButton}
          />
        </View>

        {/* Aylık Özet */}
        <MonthlySummarySection
          summary={summary}
          formatCurrencyValue={formatCurrencyValue}
          monthlyData={monthlyData}
        />

        {/* Kayıtlı Raporlar */}
        <SavedReportsSection
          savedReports={savedReports}
          savedLoading={savedLoading}
          onOpenSaved={handleOpenSaved}
          onOpenPreview={openPreview}
          onDeleteSaved={handleDeleteSaved}
        />
      </ScrollView>

      <ReportPreviewModal
        visible={previewVisible}
        report={previewReport}
        onClose={closePreview}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
    gap: 16,
  },
  titleSection: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionSubtitle: {
    opacity: 0.7,
  },
  createButton: {
    alignSelf: 'flex-end',
  },
});

export default ReportsHubScreen;