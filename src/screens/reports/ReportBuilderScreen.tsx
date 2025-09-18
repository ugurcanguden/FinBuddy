// ReportBuilderScreen - Esnek rapor oluşturucu (basit sürüm)
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, LayoutChangeEvent, Platform, ScrollView as RNHScrollView, StyleSheet, View as RNView } from 'react-native';
import { Layout, PageHeader, ScrollView, View, Text, Card, Dropdown, TouchableOpacity, DatePickerField, DatePickerFieldNative, TextInput } from '@/components';
import { useTheme, useNavigation, useCurrency } from '@/contexts';
import { useLocale } from '@/hooks';
import { paymentService, reportsService, type ReportConfig } from '@/services';

type Fact = 'payments_expense' | 'payments_income';
type Dimension = 'month' | 'category' | 'status' | 'type';
type Measure = 'sum' | 'count' | 'avg';
type Chart = 'table' | 'bar' | 'line';

const ReportBuilderScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t, currentLanguage } = useLocale();
  const { currency } = useCurrency();
  const navigation = useNavigation();
  const goBack = navigation.goBack;
  const currentParams = navigation.getCurrentParams() as ({ config?: ReportConfig; name?: string; reportId?: string } | null);

  const [fact, setFact] = useState<Fact>('payments_expense');
  const [dimension, setDimension] = useState<Dimension>('category');
  const [measure, setMeasure] = useState<Measure>('sum');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [chart, setChart] = useState<Chart>('table');
  const [rows, setRows] = useState<Array<{ key: string; value: number }>>([]);
  const [reportName, setReportName] = useState('');
  const [saving, setSaving] = useState(false);
  const [chartViewportWidth, setChartViewportWidth] = useState(0);

  useEffect(() => {
    const config = currentParams?.config as ReportConfig | undefined;
    if (!config) return;

    const factValue: Fact = config.fact === 'payments_expense' || config.fact === 'payments_income' 
      ? config.fact 
      : 'payments_expense';
    const dimensionValue: Dimension = ['month', 'category', 'status', 'type'].includes(config.dimension as string)
      ? (config.dimension as Dimension)
      : 'category';
    const measureValue: Measure = ['sum', 'count', 'avg'].includes(config.measure as string)
      ? (config.measure as Measure)
      : 'sum';
    const chartValue: Chart = ['table', 'bar', 'line'].includes((config.chart ?? 'table') as string)
      ? ((config.chart ?? 'table') as Chart)
      : 'table';

    setFact(factValue);
    setDimension(dimensionValue);
    setMeasure(measureValue);
    setChart(chartValue);

    const filters = (config.filters ?? {}) as Record<string, string | undefined>;
    setDateFrom(filters['date_from'] ?? '');
    setDateTo(filters['date_to'] ?? '');

    if (typeof currentParams?.name === 'string') {
      setReportName(currentParams.name);
    }
  }, [currentParams]);

  const factOptions = useMemo(() => [
    { value: 'payments_expense', label: t('screens.report_builder.fact_payments_expense') || 'Gider Ödemeleri', nativeName: '', flag: '' },
    { value: 'payments_income', label: t('screens.report_builder.fact_payments_income') || 'Gelir Ödemeleri', nativeName: '', flag: '' },
  ], [t]);
  const dimOptions = useMemo(() => [
    { value: 'month', label: t('screens.report_builder.dimension_month') || 'Month (YYYY-MM)', nativeName: '', flag: '' },
    { value: 'category', label: t('screens.report_builder.dimension_category') || 'Category', nativeName: '', flag: '' },
    { value: 'status', label: t('screens.report_builder.dimension_status') || 'Status', nativeName: '', flag: '' },
    { value: 'type', label: t('screens.report_builder.dimension_type') || 'Type', nativeName: '', flag: '' },
  ], [t]);
  const msrOptions = useMemo(() => [
    { value: 'sum', label: t('screens.report_builder.measure_sum') || 'Sum', nativeName: '', flag: '' },
    { value: 'count', label: t('screens.report_builder.measure_count') || 'Count', nativeName: '', flag: '' },
    { value: 'avg', label: t('screens.report_builder.measure_avg') || 'Average', nativeName: '', flag: '' },
  ], [t]);
  const chartOptions = useMemo(() => [
    { value: 'table', label: t('screens.report_builder.chart_table') || 'Table' },
    { value: 'bar', label: t('screens.report_builder.chart_bar') || 'Bar' },
    { value: 'line', label: t('screens.report_builder.chart_line') || 'Line' },
  ], [t]);

  const dateFromPlaceholder = t('screens.report_builder.date_from_placeholder') || 'YYYY-MM-DD';
  const dateToPlaceholder = t('screens.report_builder.date_to_placeholder') || 'YYYY-MM-DD';
  const reportNameLabel = t('screens.report_builder.report_name_label') || 'Report Name';
  const reportNamePlaceholder = t('screens.report_builder.report_name_placeholder') || 'My Report';

  const preview = async () => {
    const data = await paymentService.aggregate({
      fact,
      dimension,
      measure,
      filters: {
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      },
    });
    setRows(data);
  };

  const maxVal = useMemo(() => Math.max(0, ...rows.map(r => r.value)), [rows]);
  const scale = (v: number) => (maxVal ? Math.max(6, Math.round((v / maxVal) * 180)) : 6);

  const desiredChartWidth = useMemo(() => {
    if (rows.length === 0) return 0;
    const minWidth = 240;
    if (rows.length === 1) return minWidth;
    const minSpacing = 96;
    const horizontalPadding = 24;
    return Math.max(minWidth, horizontalPadding * 2 + minSpacing * (rows.length - 1));
  }, [rows.length]);

  const chartContentWidth = useMemo(() => {
    if (!rows.length) return 0;
    return Math.max(chartViewportWidth || 0, desiredChartWidth);
  }, [chartViewportWidth, desiredChartWidth, rows.length]);

  const localeCode = useMemo(() => {
    const map: Record<string, string> = {
      tr: 'tr-TR',
      en: 'en-US',
      de: 'de-DE',
      fr: 'fr-FR',
      it: 'it-IT',
      es: 'es-ES',
    };
    return map[currentLanguage] ?? 'en-US';
  }, [currentLanguage]);

  const formatValue = useCallback((value: number) => {
    if (measure === 'count') {
      return value.toFixed(0);
    }
    const maximumFractionDigits = measure === 'avg' ? 2 : 0;
    try {
      return new Intl.NumberFormat(localeCode, {
        style: 'currency',
        currency,
        maximumFractionDigits,
      }).format(value);
    } catch {
      const fallback = measure === 'avg' ? value.toFixed(2) : value.toFixed(0);
      return `${fallback} ${currency}`;
    }
  }, [measure, localeCode, currency]);

  const linePoints = useMemo(() => {
    if (!chartContentWidth || rows.length === 0) return [];
    const horizontalPadding = 24;
    const verticalPadding = 16;
    const containerHeight = 220;
    const innerHeight = Math.max(containerHeight - verticalPadding * 2, 1);
    const usableWidth = Math.max(chartContentWidth - horizontalPadding * 2, 1);
    const ratioDenominator = rows.length > 1 ? rows.length - 1 : 1;

    return rows.map((row, index) => {
      const xRatio = rows.length === 1 ? 0.5 : index / ratioDenominator;
      const valueRatio = maxVal > 0 ? row.value / maxVal : 0.5;
      const x = horizontalPadding + usableWidth * xRatio;
      const y = verticalPadding + (1 - valueRatio) * innerHeight;
      return { ...row, x, y };
    });
  }, [chartContentWidth, rows, maxVal]);

  const lineSegments = useMemo(() => {
    if (linePoints.length < 2) return [];
    const segments: Array<{ id: string; length: number; angle: number; cx: number; cy: number }> = [];
    for (let i = 0; i < linePoints.length - 1; i += 1) {
      const current = linePoints[i]!;
      const next = linePoints[i + 1]!;
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const cx = (current.x + next.x) / 2;
      const cy = (current.y + next.y) / 2;
      segments.push({ id: `${current.key}-${next.key}-${i}`, length, angle, cx, cy });
    }
    return segments;
  }, [linePoints]);

  const handleLineChartLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (Math.abs(width - chartViewportWidth) > 1) {
      setChartViewportWidth(width);
    }
  };

  const canSave = reportName.trim().length > 0 && !saving;

  const handleSave = async () => {
    const trimmedName = reportName.trim();
    if (!trimmedName) {
      Alert.alert(t('common.messages.error'), t('screens.report_builder.name_required') || 'Please provide a name.');
      return;
    }

    try {
      setSaving(true);
      const filters = {
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };
      const sanitizedFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
      );
      const config = {
        fact,
        dimension,
        measure,
        chart,
        ...(Object.keys(sanitizedFilters).length ? { filters: sanitizedFilters } : {}),
      } as const;

      const reportId = currentParams?.reportId;
      if (reportId) {
        // Güncelleme modu
        await reportsService.updateReport(reportId, trimmedName, config);
        Alert.alert(
          t('common.messages.success'), 
          t('screens.report_builder.update_success') || 'Report updated.',
          [
            {
              text: t('common.buttons.ok') || 'OK',
              onPress: () => navigation.navigateTo('reports')
            }
          ]
        );
      } else {
        // Yeni ekleme modu
        await reportsService.saveReport(trimmedName, config);
        Alert.alert(
          t('common.messages.success'), 
          t('screens.report_builder.save_success') || 'Report saved.',
          [
            {
              text: t('common.buttons.ok') || 'OK',
              onPress: () => navigation.navigateTo('reports')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(t('common.messages.error'), String((error as Error).message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout headerComponent={<PageHeader title={t('screens.report_builder.title') || 'Rapor Oluştur'} showBackButton onBackPress={goBack} /> }>
      <ScrollView style={styles.container}>
        <Card padding="medium" style={{ gap: 12 }}>
          <Text variant="secondary" size="small">Fakt</Text>
          <Dropdown options={factOptions} selectedValue={fact} onSelect={(v) => setFact(v as Fact)} />

          <Text variant="secondary" size="small">Boyut</Text>
          <Dropdown options={dimOptions} selectedValue={dimension} onSelect={(v) => setDimension(v as Dimension)} />

          <Text variant="secondary" size="small">Ölçü</Text>
          <Dropdown options={msrOptions} selectedValue={measure} onSelect={(v) => setMeasure(v as Measure)} />

          <Text variant="secondary" size="small">Tarih Aralığı</Text>
          <View variant="transparent" style={styles.filters}>
            <View variant="transparent" style={styles.dateField}>
              <Text variant="secondary" size="small">{t('screens.report_builder.date_from_label') || 'Start'}</Text>
              <View variant="transparent" style={styles.datePickerRow}>
                {Platform.OS === 'web' ? (
                  <DatePickerField value={dateFrom} onChange={(value) => setDateFrom(value)} placeholder={dateFromPlaceholder} />
                ) : (
                  <DatePickerFieldNative value={dateFrom} onChange={(value) => setDateFrom(value)} placeholder={dateFromPlaceholder} />
                )}
                {!!dateFrom && (
                  <TouchableOpacity
                    variant="transparent"
                    style={[styles.clearButton, { borderColor: colors.border }]}
                    onPress={() => setDateFrom('')}
                  >
                    <Text variant="secondary" size="small">{t('common.buttons.reset')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View variant="transparent" style={styles.dateField}>
              <Text variant="secondary" size="small">{t('screens.report_builder.date_to_label') || 'End'}</Text>
              <View variant="transparent" style={styles.datePickerRow}>
                {Platform.OS === 'web' ? (
                  <DatePickerField value={dateTo} onChange={(value) => setDateTo(value)} placeholder={dateToPlaceholder} />
                ) : (
                  <DatePickerFieldNative value={dateTo} onChange={(value) => setDateTo(value)} placeholder={dateToPlaceholder} />
                )}
                {!!dateTo && (
                  <TouchableOpacity
                    variant="transparent"
                    style={[styles.clearButton, { borderColor: colors.border }]}
                    onPress={() => setDateTo('')}
                  >
                    <Text variant="secondary" size="small">{t('common.buttons.reset')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <Text variant="secondary" size="small">Grafik</Text>
          <View variant="transparent" style={styles.chartOptions}>
            {chartOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                variant="transparent"
                style={[
                  styles.toggle,
                  {
                    borderColor: colors.border,
                    backgroundColor: chart === opt.value ? colors.primary : 'transparent',
                  },
                ] as any}
                onPress={() => setChart(opt.value as Chart)}
              >
                <Text style={{ color: chart === opt.value ? colors.onPrimary : colors.text }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View variant="transparent" style={styles.reportNameField}>
            <Text variant="secondary" size="small">{reportNameLabel}</Text>
            <TextInput
              placeholder={reportNamePlaceholder}
              value={reportName}
              onChangeText={setReportName}
              variant="outlined"
            />
          </View>

          <View variant="transparent" style={styles.actionRow}>
            <TouchableOpacity
              variant="primary"
              onPress={preview}
              style={[styles.actionButton, { backgroundColor: colors.primary }] as any}
            >
              <Text style={{ color: colors.onPrimary }}>{t('screens.report_builder.preview_button') || 'Preview'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              variant="primary"
              onPress={handleSave}
              disabled={!canSave}
              style={[
                styles.actionButton,
                {
                  backgroundColor: canSave ? colors.accent : colors.border,
                },
              ] as any}
            >
              <Text style={{ color: canSave ? colors.onPrimary : colors.textSecondary }}>{t('common.buttons.save')}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Preview */}
        <Card padding="medium" style={{ marginTop: 16, gap: 12 }}>
          {rows.length === 0 ? (
            <Text variant="secondary">{t('common.messages.no_data')}</Text>
          ) : chart === 'table' ? (
            <View variant="transparent" style={{ gap: 8 }}>
              {rows.map(r => (
                <View key={r.key} variant="transparent" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text>{r.key}</Text>
                  <Text>{formatValue(r.value)}</Text>
                </View>
              ))}
            </View>
          ) : chart === 'bar' ? (
            <View variant="transparent" style={{ gap: 8 }}>
              {rows.map(r => (
                <View key={r.key} variant="transparent">
                  <Text variant="secondary" size="small">{r.key}</Text>
                  <RNView style={{ height: 18, backgroundColor: colors.card, borderRadius: 9, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
                    <RNView style={{ width: `${(scale(r.value) / 180) * 100}%`, backgroundColor: colors.primary, height: '100%' }} />
                  </RNView>
                  <Text variant="secondary" size="small" style={{ marginTop: 4 }}>{formatValue(r.value)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View variant="transparent" style={{ gap: 8 }}>
              <RNView onLayout={handleLineChartLayout}>
                <RNHScrollView
                  horizontal
                  showsHorizontalScrollIndicator
                  contentContainerStyle={{ paddingBottom: 8 }}
                >
                  <RNView>
                    <RNView
                      style={[
                        styles.lineChartSurface,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                          width: chartContentWidth || undefined,
                        },
                      ]}
                    >
                      {chartContentWidth > 0 && (
                        <RNView style={{ flex: 1 }}>
                          {lineSegments.map((segment) => (
                            <RNView
                              key={segment.id}
                              style={{
                                position: 'absolute',
                                left: segment.cx - segment.length / 2,
                                top: segment.cy - 1,
                                width: segment.length,
                                height: 2,
                                backgroundColor: colors.primary,
                                transform: [{ rotate: `${segment.angle}deg` }],
                              }}
                            />
                          ))}
                          {linePoints.map((point) => (
                            <RNView
                              key={`point-${point.key}`}
                              style={{
                                position: 'absolute',
                                left: point.x - 5,
                                top: point.y - 5,
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: colors.primary,
                                borderWidth: 1,
                                borderColor: colors.onPrimary,
                              }}
                            />
                          ))}
                          {linePoints.map((point) => (
                            <Text
                              key={`point-value-${point.key}`}
                              variant="secondary"
                              size="small"
                              style={{
                                position: 'absolute',
                                left: point.x - 50,
                                top: Math.max(point.y - 28, 4),
                                width: 100,
                                textAlign: 'center',
                                backgroundColor: colors.card,
                                borderRadius: 6,
                                paddingHorizontal: 4,
                                paddingVertical: 2,
                                borderWidth: 1,
                                borderColor: colors.border,
                              }}
                            >
                              {formatValue(point.value)}
                            </Text>
                          ))}
                        </RNView>
                      )}
                    </RNView>
                    {linePoints.length > 0 && (
                      <RNView style={[styles.lineChartLabels, { width: chartContentWidth || undefined }]}>
                        {linePoints.map((point) => (
                          <Text
                            key={`label-${point.key}`}
                            variant="secondary"
                            size="small"
                            style={{
                              position: 'absolute',
                              left: point.x - 40,
                              width: 80,
                              textAlign: 'center',
                            }}
                          >
                            {point.key}
                          </Text>
                        ))}
                      </RNView>
                    )}
                  </RNView>
                </RNHScrollView>
              </RNView>
            </View>
          )}
        </Card>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filters: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 1, gap: 6 },
  datePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clearButton: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  chartOptions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toggle: { flexGrow: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999, borderWidth: 1, minWidth: 90 },
  reportNameField: { gap: 6 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8 },
  lineChartSurface: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, justifyContent: 'center', height: 220 },
  lineChartLabels: { position: 'relative', height: 28, marginTop: 8 },
});

export default ReportBuilderScreen;
