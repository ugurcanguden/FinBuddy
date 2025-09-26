// ReportsHubScreen - Modern rapor hub'ı
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Layout, PageHeader, ScrollView, View, Text, Card, Dropdown, TouchableOpacity, ReportPreviewModal, Button } from '@/components';
import { StatCard, BarChart, WeeklySummary } from '@/components/common';
import { useLocale } from '@/hooks';
import { useTheme, useNavigation } from '@/contexts';
import { paymentService, reportsService, type ReportDef, type ReportConfig } from '@/services';

const ReportsHubScreen: React.FC = () => {
  const { t } = useLocale();
  const { colors } = useTheme();
  const { navigateTo } = useNavigation();

  const [ym, setYm] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState<{ expense: { total: number; paid: number; pending: number }; income: { total: number; paid: number; pending: number } } | null>(null);
  const [byCat, setByCat] = useState<Array<{ category_id: string; total: number }>>([]);
  const [savedReports, setSavedReports] = useState<ReportDef[]>([]);
  const [savedLoading, setSavedLoading] = useState<boolean>(true);
  const [previewReport, setPreviewReport] = useState<ReportDef | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const [sum, cats] = await Promise.all([
        paymentService.getDashboardSummary(ym),
        paymentService.getTotalsByCategory({ ym, type: 'expense' }),
      ]);
      setSummary(sum);
      setByCat(cats);
    })();
  }, [ym]);

  const loadSavedReports = useCallback(async () => {
    try {
      setSavedLoading(true);
      const list = await reportsService.listReports();
      setSavedReports(list);
    } catch (error) {
      console.error('Failed to load saved reports', error);
    } finally {
      setSavedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedReports();
  }, [loadSavedReports]);

  const formatCurrencyValue = useCallback((value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const factText = useCallback((fact: ReportConfig['fact']) => {
    const map: Record<string, string> = {
      payments_expense: t('screens.report_builder.fact_payments_expense') || 'Giderler',
      payments_income: t('screens.report_builder.fact_payments_income') || 'Gelirler',
    };
    return map[fact] ?? String(fact);
  }, [t]);

  const dimensionText = useCallback((dim: ReportConfig['dimension']) => {
    const map = {
      month: t('screens.report_builder.dimension_month') || 'Ay',
      category: t('screens.report_builder.dimension_category') || 'Kategori',
      status: t('screens.report_builder.dimension_status') || 'Durum',
      type: t('screens.report_builder.dimension_type') || 'Tip',
    };
    return map[dim] ?? String(dim);
  }, [t]);

  const measureText = useCallback((msr: ReportConfig['measure']) => {
    const map = {
      sum: t('screens.report_builder.measure_sum') || 'Toplam',
      count: t('screens.report_builder.measure_count') || 'Sayı',
      avg: t('screens.report_builder.measure_avg') || 'Ortalama',
    };
    return map[msr] ?? String(msr);
  }, [t]);

  const chartText = useCallback((chart?: ReportConfig['chart']) => {
    if (chart === 'bar') return t('screens.report_builder.chart_bar') || 'Bar';
    if (chart === 'line') return t('screens.report_builder.chart_line') || 'Çizgi';
    return t('screens.report_builder.chart_table') || 'Tablo';
  }, [t]);

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

  // Haftalık veri hazırla
  const weeklyData = useMemo(() => {
    if (!summary) return [];
    
    // Basit haftalık veri simülasyonu
    const weeks = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return weeks.map((day) => {
      const income = Math.floor(summary.income.total / 7) + (Math.random() - 0.5) * 1000;
      const expense = Math.floor(summary.expense.total / 7) + (Math.random() - 0.5) * 1000;
      return {
        day,
        income,
        expense,
        net: income - expense,
      };
    });
  }, [summary]);

  // Kategori grafik verisi
  const categoryChartData = useMemo(() => {
    return byCat.slice(0, 6).map((item) => {
      // Kategori adını basit şekilde göster
      const categoryName = item.category_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        label: categoryName.slice(0, 8),
        value: item.total,
        color: colors.primary,
      };
    });
  }, [byCat, colors.primary]);

  return (
    <Layout headerComponent={<PageHeader title={t('navigation.tabs.reports') || 'Raporlar'} /> }>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <View style={styles.monthPicker}>
            <Text variant="secondary" size="small" weight="medium" style={styles.monthLabel}>
              {t('screens.reports.month') || 'Ay'}
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
            title={t('screens.reports.create_report') || 'Rapor Oluştur'}
            style={styles.createButton}
          />
        </View>

        {/* Aylık İstatistikler */}
        <View style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            {ym} {t('screens.reports.monthly_summary') || 'Aylık Özet'}
          </Text>
          
          {summary ? (
            <View style={styles.statsGrid}>
              <StatCard
                title="Toplam Gider"
                value={formatCurrencyValue(summary.expense.total)}
                subtitle="bu ay"
                icon="💸"
                variant="danger"
                animated={true}
                style={styles.statCard}
              />
              
              <StatCard
                title={t('screens.reports_hub.paid') || 'Ödenen'}
                value={formatCurrencyValue(summary.expense.paid)}
                subtitle={t('screens.reports_hub.paid_subtitle') || 'gider'}
                icon="✅"
                variant="success"
                animated={true}
                style={styles.statCard}
              />
              
              <StatCard
                title="Bekleyen"
                value={formatCurrencyValue(summary.expense.pending)}
                subtitle={t('screens.reports_hub.paid_subtitle') || 'ödeme'}
                icon="⏳"
                variant="warning"
                animated={true}
                style={styles.statCard}
              />
              
              <StatCard
                title="Toplam Gelir"
                value={formatCurrencyValue(summary.income.total)}
                subtitle="bu ay"
                icon="💰"
                variant="success"
                animated={true}
                style={styles.statCard}
              />
            </View>
          ) : (
            <Card variant="default" style={styles.loadingCard}>
              <Text variant="secondary" size="medium" style={styles.loadingText}>
                {t('common.messages.loading') || 'Yükleniyor...'}
              </Text>
            </Card>
          )}
        </View>

        {/* Haftalık Özet */}
        {summary && (
          <View style={styles.section}>
            <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
              Haftalık Özet
            </Text>
            <WeeklySummary
              data={weeklyData}
              animated={true}
              showProgress={true}
            />
          </View>
        )}

        {/* Kategori Dağılımı Grafiği */}
        {byCat.length > 0 && (
          <View style={styles.section}>
            <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
              {t('screens.reports.category_distribution') || 'Kategori Dağılımı'}
            </Text>
            <BarChart
              title={t('screens.reports_hub.category_distribution') || 'Kategori Dağılımı'}
              data={categoryChartData}
              height={200}
              barWidth={40}
              barSpacing={8}
              animated={true}
              showValues={true}
              showLabels={true}
              variant="gradient"
              style={styles.chartCard}
            />
          </View>
        )}

        {/* Kayıtlı Raporlar */}
        <View style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            {t('screens.reports.saved_reports') || 'Kayıtlı Raporlar'}
          </Text>
          
          {savedLoading ? (
            <Card variant="default" style={styles.loadingCard}>
              <Text variant="secondary" size="medium" style={styles.loadingText}>
                {t('common.messages.loading') || 'Yükleniyor...'}
              </Text>
            </Card>
          ) : savedReports.length > 0 ? (
            <View style={styles.reportsGrid}>
              {savedReports.map((report) => (
                <Card key={report.id} variant="elevated" style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <Text variant="primary" size="medium" weight="bold" style={styles.reportTitle}>
                      {report.name}
                    </Text>
                    <View style={styles.reportActions}>
                      <TouchableOpacity 
                        onPress={() => openPreview(report)} 
                        style={styles.actionButton}
                      >
                        <Text variant="primary" size="medium">👁️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleOpenSaved(report)} 
                        style={styles.actionButton}
                      >
                        <Text variant="primary" size="medium">✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDeleteSaved(report)} 
                        style={styles.actionButton}
                      >
                        <Text variant="error" size="medium">🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text variant="secondary" size="small" style={styles.reportDescription}>
                    {factText(report.config.fact)} • {dimensionText(report.config.dimension)} • {measureText(report.config.measure)}
                  </Text>
                  
                  <View style={styles.reportChart}>
                    <Text variant="secondary" size="small" weight="medium">
                      📊 {chartText(report.config.chart)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text variant="secondary" size="medium" style={styles.emptyText}>
                {t('screens.reports.no_saved_reports') || 'Kayıtlı rapor yok'}
              </Text>
              <Button
                variant="outline"
                size="small"
                onPress={() => navigateTo('reportBuilder')}
                title={t('screens.reports_hub.first_report') || 'İlk Raporınızı Oluşturun'}
                style={styles.emptyButton}
              />
            </Card>
          )}
        </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
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
  loadingCard: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
  },
  chartCard: {
    marginTop: 8,
  },
  reportsGrid: {
    gap: 12,
  },
  reportCard: {
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportTitle: {
    flex: 1,
    marginRight: 12,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  reportDescription: {
    marginBottom: 8,
  },
  reportChart: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default ReportsHubScreen;