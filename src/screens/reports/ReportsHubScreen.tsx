// ReportsHubScreen - Modern rapor hub'ı
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Layout, PageHeader, ScrollView, View, Text, Dropdown, ReportPreviewModal, Button } from '@/components';
import { useLocale } from '@/hooks';
import { useNavigation, useCurrency } from '@/contexts';
import { useCurrencyFormatter } from '@/utils';
import { paymentService, reportsService, databaseService, type ReportDef } from '@/services';
import { 
  MonthlySummarySection, 
  SavedReportsSection 
} from './components';

const ReportsHubScreen: React.FC = () => {
  const { t } = useLocale();
  const { navigateTo } = useNavigation();
  const { currency } = useCurrency();
  const { format } = useCurrencyFormatter();

  const [ym, setYm] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
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

      useEffect(() => {
        if (!dbReady) return;
        
        (async () => {
          try {
            const [sum, incomeSeries, expenseSeries] = await Promise.all([
              paymentService.getDashboardSummary(ym),
              paymentService.getMonthlySeries('income', { year: ym.split('-')[0] }),
              paymentService.getMonthlySeries('expense', { year: ym.split('-')[0] }),
            ]);
            
            setSummary(sum);
            
            // Aylık verileri birleştir
            const monthlyDataMap = new Map<string, { ym: string; income: number; expense: number }>();
            
            incomeSeries.forEach(item => {
              if (!monthlyDataMap.has(item.ym)) {
                monthlyDataMap.set(item.ym, { ym: item.ym, income: 0, expense: 0 });
              }
              // Sadece ödemesi gerçekleşen (received) gelirleri kullan
              monthlyDataMap.get(item.ym)!.income = item.paid;
            });
            
            expenseSeries.forEach(item => {
              if (!monthlyDataMap.has(item.ym)) {
                monthlyDataMap.set(item.ym, { ym: item.ym, income: 0, expense: 0 });
              }
              // Sadece ödemesi gerçekleşen (paid) giderleri kullan
              monthlyDataMap.get(item.ym)!.expense = item.paid;
            });
            
            const monthlyDataArray = Array.from(monthlyDataMap.values());
            setMonthlyData(monthlyDataArray);
          } catch (error) {
            console.error('Failed to load dashboard data:', error);
          }
        })();
      }, [ym, dbReady]);

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

  // Month Picker options (last 12 months)
  const monthOptions = useMemo(() => {
    const arr: string[] = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      arr.push(`${y}-${m}`);
      d.setMonth(d.getMonth() - 1);
    }
    return arr.map(v => ({ value: v, label: v, nativeName: '', flag: '' }));
  }, []);

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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <View style={styles.monthPicker}>
            <Text variant="secondary" size="small" weight="medium" style={styles.monthLabel}>
              {t('screens.reports.month')}
            </Text>
            <Dropdown 
              options={monthOptions} 
              selectedValue={ym} 
              onSelect={(v) => setYm(v)}
              style={styles.dropdown}
            />
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
  monthPicker: {
    flex: 1,
  },
  monthLabel: {
    marginBottom: 8,
  },
  dropdown: {
    minWidth: 120,
  },
  createButton: {
    alignSelf: 'flex-end',
  },
});

export default ReportsHubScreen;