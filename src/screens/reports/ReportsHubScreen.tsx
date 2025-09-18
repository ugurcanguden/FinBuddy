// ReportsHubScreen - Hazır raporlar: Aylık Özet + Kategori Dağılımı
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View as RNView } from 'react-native';
import { Layout, PageHeader, ScrollView, View, Text, Card, Dropdown, TouchableOpacity, ReportPreviewModal } from '@/components';
import { useLocale } from '@/hooks';
import { useTheme, useNavigation, useCurrency } from '@/contexts';
import { paymentService, reportsService, type ReportDef, type ReportConfig } from '@/services';
import { useCategories } from '@/hooks';

const ReportsHubScreen: React.FC = () => {
  const { t } = useLocale();
  const { colors } = useTheme();
  const { currency } = useCurrency();
  const { navigateTo } = useNavigation();
  const { categories, getDisplayName } = useCategories();

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

  const catName = (id: string) => {
    const c = categories.find(x => x.id === id);
    if (!c) return id;
    return getDisplayName(c, t);
  };

  const barMax = 140;
  const maxVal = useMemo(() => Math.max(0, ...byCat.map(c => c.total)), [byCat]);
  const scale = (v: number) => (maxVal ? Math.max(6, Math.round((v / maxVal) * barMax)) : 6);

  const formatCurrencyValue = useCallback((value: number) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${value.toFixed(0)} ${currency}`;
    }
  }, [currency]);

  const factText = useCallback((fact: ReportConfig['fact']) => {
    switch (fact) {
      case 'payments_expense':
        return t('screens.report_builder.fact_expense') || 'Expenses';
      case 'payments_income':
        return t('screens.report_builder.fact_income') || 'Incomes';
      case 'payments_all':
      case 'payments':
      default:
        return t('screens.report_builder.fact_all') || 'All Payments';
    }
  }, [t]);

  const dimensionText = useCallback((dim: ReportConfig['dimension']) => {
    const map: Record<ReportConfig['dimension'], string> = {
      month: t('screens.report_builder.dimension_month') || 'Month',
      category: t('screens.report_builder.dimension_category') || 'Category',
      status: t('screens.report_builder.dimension_status') || 'Status',
      type: t('screens.report_builder.dimension_type') || 'Type',
    };
    return map[dim] ?? String(dim);
  }, [t]);

  const measureText = useCallback((msr: ReportConfig['measure']) => {
    const map: Record<ReportConfig['measure'], string> = {
      sum: t('screens.report_builder.measure_sum') || 'Sum',
      count: t('screens.report_builder.measure_count') || 'Count',
      avg: t('screens.report_builder.measure_avg') || 'Average',
    };
    return map[msr] ?? String(msr);
  }, [t]);

  const chartText = useCallback((chart?: ReportConfig['chart']) => {
    if (chart === 'bar') return t('screens.report_builder.chart_bar') || 'Bar';
    if (chart === 'line') return t('screens.report_builder.chart_line') || 'Line';
    return t('screens.report_builder.chart_table') || 'Table';
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

  return (
    <Layout headerComponent={<PageHeader title={t('navigation.tabs.reports') || 'Raporlar'} /> }>
      <ScrollView style={styles.container}>
        {/* Month Picker */}
        <View variant="transparent" style={{ marginBottom: 8 }}>
          <Text variant="secondary" size="small" weight="medium">{t('screens.reports.month') || 'Ay'}</Text>
          <Dropdown options={monthOptions} selectedValue={ym} onSelect={(v) => setYm(v)} />
        </View>
        <View variant="transparent" style={{ marginBottom: 8 }}>
          <TouchableOpacity variant="primary" onPress={() => navigateTo('reportBuilder')} style={{ alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.primary }}>
            <Text style={{ color: colors.onPrimary }}>{t('screens.reports.create_report') || 'Rapor Oluştur'}</Text>
          </TouchableOpacity>
        </View>

        {/* Aylık Özet */}
        <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>{ym} {t('screens.reports.monthly_summary') || 'Aylık Özet'}</Text>
        <Card padding="medium" style={styles.summaryCard}>
          {summary ? (
            [
              { label: t('screens.reports.expense_total') || 'Gider Toplam', value: summary.expense.total },
              { label: t('screens.reports.expense_paid') || 'Ödenen', value: summary.expense.paid },
              { label: t('screens.reports.expense_pending') || 'Bekleyen', value: summary.expense.pending },
              { label: t('screens.reports.income_total') || 'Gelir Toplam', value: summary.income.total },
            ].map((item) => (
              <View key={item.label} variant="transparent" style={styles.summaryRow}>
                <Text variant="secondary" size="small" weight="medium">{item.label}</Text>
                <Text variant="primary" size="large" weight="bold">{formatCurrencyValue(item.value)}</Text>
              </View>
            ))
          ) : (
            <Text variant="secondary">{t('common.messages.loading')}</Text>
          )}
        </Card>

        {/* Kategori Dağılımı (Gider) */}
        <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>{t('screens.reports.category_distribution') || 'Kategori Dağılımı'}</Text>
        <Card padding="medium" style={{ gap: 12 }}>
          {byCat.map((c) => (
            <View key={c.category_id} variant="transparent" style={{ gap: 6 }}>
              <Text variant="secondary" size="small">{catName(c.category_id)}</Text>
              <RNView style={{ height: 18, backgroundColor: colors.card, borderRadius: 9, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
                <RNView style={{ width: `${(scale(c.total) / barMax) * 100}%`, backgroundColor: colors.primary, height: '100%' }} />
              </RNView>
              <Text variant="primary" size="small" weight="medium">{formatCurrencyValue(c.total)}</Text>
            </View>
          ))}
          {byCat.length === 0 && (
            <Text variant="secondary">{t('common.messages.no_data')}</Text>
          )}
        </Card>

        {/* Kaydedilen Raporlar */}
        <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>{t('screens.reports.saved_reports_title') || 'Kaydedilen Raporlar'}</Text>
        <Card padding="medium" style={{ gap: 12 }}>
          {savedLoading ? (
            <Text variant="secondary">{t('common.messages.loading')}</Text>
          ) : savedReports.length === 0 ? (
            <Text variant="secondary">{t('screens.reports.saved_reports_empty') || 'Henüz kaydedilmiş rapor yok.'}</Text>
          ) : (
            savedReports.map((report) => (
              <View
                key={report.id}
                style={[styles.savedItem, { borderColor: colors.border }]}
              >
                <TouchableOpacity
                  variant="transparent"
                  style={{ flex: 1 }}
                  onPress={() => handleOpenSaved(report)}
                >
                  <View variant="transparent" style={{ gap: 4 }}>
                    <Text weight="semibold">{report.name}</Text>
                    <Text variant="secondary" size="small">
                      {factText(report.config.fact)} • {dimensionText(report.config.dimension)} • {measureText(report.config.measure)} • {chartText(report.config.chart)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View variant="transparent" style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    variant="transparent"
                    onPress={() => handleOpenSaved(report)}
                    style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}
                  >
                    <Text>{t('screens.reports.saved_reports_view') || 'Aç'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    variant="transparent"
                    onPress={() => openPreview(report)}
                    style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primary }}
                  >
                    <Text style={{ color: colors.primary }}>{t('screens.reports.saved_reports_preview') || 'Önizleme'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    variant="transparent"
                    onPress={() => handleDeleteSaved(report)}
                    style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.danger }}
                  >
                    <Text style={{ color: colors.danger }}>{t('screens.reports.saved_reports_delete') || 'Sil'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Card>
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
  container: { flex: 1, padding: 16 },
  sectionTitle: { marginTop: 16, marginBottom: 8 },
  summaryCard: { gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savedItem: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
});

export default ReportsHubScreen;
