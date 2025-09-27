import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, ScrollView as RNScrollView, View as RNView, LayoutChangeEvent } from 'react-native';
import Card from './common/Card';
import View from './common/View';
import Text from './common/Text';
import TouchableOpacity from './common/TouchableOpacity';
import { useTheme, useCurrency } from '@/contexts';
import { useCategories, useLocale } from '@/hooks';
import { paymentService, type ReportDef } from '@/services';

type Chart = 'table' | 'bar' | 'line';

interface ReportPreviewModalProps {
  visible: boolean;
  report: ReportDef | null;
  onClose: () => void;
  initialRows?: Array<{ key: string; value: number }>;
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ visible, report, onClose, initialRows }) => {
  console.log('ReportPreviewModal render - visible:', visible, 'report:', report);
  const { colors } = useTheme();
  const { t } = useLocale();
  const { categories, getDisplayName: _getDisplayName } = useCategories();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Array<{ key: string; value: number }>>([]);
  const [selectedChart, setSelectedChart] = useState<Chart>('table');
  const [chartViewportWidth, setChartViewportWidth] = useState(0);

  const config = report?.config;

  useEffect(() => {
    if (!visible || !report) {
      setRows([]);
      setError(null);
      setLoading(false);
      return;
    }

    console.log('Modal opened with report:', report);
    console.log('Report config:', report.config);

    const configuredChart = (report.config.chart === 'table' || report.config.chart === 'bar' || report.config.chart === 'line')
      ? report.config.chart
      : 'table';
    setSelectedChart(configuredChart);

    if (initialRows && initialRows.length > 0) {
      console.log('Using initial rows:', initialRows);
      setRows(initialRows);
      setLoading(false);
      setError(null);
      return;
    }

    let isActive = true;
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Rapor config'inden fact'i belirle
        const fact: 'payments_expense' | 'payments_income' | 'payments_all' = (() => {
          if (config?.fact === 'payments_income') return 'payments_income';
          if (config?.fact === 'payments_expense') return 'payments_expense';
          if (config?.fact === 'payments_all' || config?.fact === 'payments' || config?.fact === 'entries') {
            return 'payments_all';
          }
          // Varsayılan olarak gider ödemeleri
          return 'payments_expense';
        })();

        console.log('Fetching data with fact:', fact, 'dimension:', config?.dimension, 'measure:', config?.measure);

        // Filtreleri hazırla
        const baseFilters = { ...(config?.filters ?? {}) } as Record<string, unknown>;
        const effectiveFilters = {
          ...baseFilters,
        };

        console.log('Effective filters:', effectiveFilters);

        const data = await paymentService.aggregate({
          fact,
          dimension: config?.dimension ?? 'category',
          measure: config?.measure ?? 'sum',
          filters: effectiveFilters,
        });

        if (isActive) {
          console.log('Modal preview data loaded:', data);
          setRows(data);
        }
      } catch (err) {
        console.error('Preview fetch error:', err);
        if (isActive) setError(String((err as Error).message || 'Veri yüklenirken hata oluştu'));
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchPreview();
    return () => {
      isActive = false;
    };
  }, [visible, report, config, initialRows]);

  const resolveLabel = useCallback(
    (key: string): string => {
      if (!config) return key;
      
      if (config.dimension === 'category') {
        const category = categories.find((c) => c.id === key);
        if (category) {
          // Eğer varsayılan kategori ise dil karşılığını dene
          if (category.is_default) {
            const translationKey = `screens.categories.default.${category.id.replace('cat_', '')}`;
            const translatedName = t(translationKey);
            
            // Eğer çeviri varsa ve gerçek bir çeviri ise (anahtar değil) kullan
            if (translatedName && translatedName !== translationKey) {
              return translatedName;
            } else {
              // Çeviri yoksa kategori adını kullan
              return category.name_key || key;
            }
          } else {
            // Kullanıcı oluşturduğu kategori ise direkt adını kullan (çeviri yapma)
            return category.name_key || key;
          }
        }
        return key;
      }
      
      if (config.dimension === 'type') {
        if (key === 'expense') return t('screens.report_builder.type_expense') || 'Expense';
        if (key === 'income') return t('screens.report_builder.type_income') || 'Income';
        if (key === 'receivable') return t('screens.report_builder.type_receivable') || 'Receivable';
      }
      
      if (config.dimension === 'status') {
        if (key === 'pending') return t('screens.report_builder.status_pending') || 'Pending';
        if (key === 'paid') return t('screens.report_builder.status_paid') || 'Paid';
        if (key === 'received') return t('screens.report_builder.status_received') || 'Received';
      }
      
      return key;
    },
    [categories, config, t]
  );

  const displayRows = useMemo(
    () => {
      return rows.map((row) => {
        const label = resolveLabel(row.key);
        return { ...row, label };
      });
    },
    [rows, resolveLabel]
  );

  const maxVal = useMemo(() => Math.max(0, ...displayRows.map((r) => r.value)), [displayRows]);
  const scale = useCallback((value: number) => (maxVal ? Math.max(6, Math.round((value / maxVal) * 180)) : 6), [maxVal]);

  const desiredChartWidth = useMemo(() => {
    if (displayRows.length === 0) return 0;
    const minWidth = 240;
    if (displayRows.length === 1) return minWidth;
    const minSpacing = 96;
    const horizontalPadding = 24;
    return Math.max(minWidth, horizontalPadding * 2 + minSpacing * (displayRows.length - 1));
  }, [displayRows.length]);

  const chartContentWidth = useMemo(() => {
    if (!displayRows.length) return 0;
    // Kullanılabilir genişliği min. istenen genişliğe göre ayarla ki çizgi grafikte yatay scroll oluşsun
    const width = chartViewportWidth > 0
      ? Math.max(chartViewportWidth, desiredChartWidth)
      : desiredChartWidth;
    console.log('Chart content width calculation:', { chartViewportWidth, desiredChartWidth, width, displayRowsLength: displayRows.length });
    return width;
  }, [chartViewportWidth, desiredChartWidth, displayRows.length]);


  const handleLineChartLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - chartViewportWidth) > 1) {
      setChartViewportWidth(width);
    }
  };

  const formatValue = useCallback(
    (value: number) => {
      if ((config?.measure ?? 'sum') === 'count') return value.toFixed(0);
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency,
          maximumFractionDigits: config?.measure === 'avg' ? 2 : 0,
        }).format(value);
      } catch {
        return `${value.toFixed(config?.measure === 'avg' ? 2 : 0)} ${currency}`;
      }
    },
    [config, currency]
  );

  const factText = useCallback((fact: string) => {
    switch (fact) {
      case 'payments_expense':
        return t('screens.report_builder.fact_payments_expense') || 'Gider Ödemeleri';
      case 'payments_income':
        return t('screens.report_builder.fact_payments_income') || 'Gelir Ödemeleri';
      case 'payments_all':
      case 'payments':
      case 'entries':
        return t('screens.report_builder.fact_payments_all') || 'Tüm Ödemeler';
      default:
        return t('screens.report_builder.fact_payments_expense') || 'Gider Ödemeleri';
    }
  }, [t]);

  const dimensionText = useCallback((dim: string) => {
    const map: Record<string, string> = {
      month: t('screens.report_builder.dimension_month') || 'Ay',
      category: t('screens.report_builder.dimension_category') || 'Kategori',
      status: t('screens.report_builder.dimension_status') || 'Durum',
      type: t('screens.report_builder.dimension_type') || 'Tür',
    };
    return map[dim] ?? String(dim);
  }, [t]);

  const measureText = useCallback((msr: string) => {
    const map: Record<string, string> = {
      sum: t('screens.report_builder.measure_sum') || 'Toplam',
      count: t('screens.report_builder.measure_count') || 'Adet',
      avg: t('screens.report_builder.measure_avg') || 'Ortalama',
    };
    return map[msr] ?? String(msr);
  }, [t]);

  const chart = selectedChart;

  const chartTabs: Chart[] = ['table', 'bar', 'line'];

  const linePoints = useMemo(() => {
    console.log('Line points calculation:', { chart, chartContentWidth, displayRowsLength: displayRows.length });
    if (chart !== 'line' || !chartContentWidth || displayRows.length === 0) {
      console.log('Line points not calculated');
      return [];
    }
    const horizontalPadding = 24;
    const verticalPadding = 16;
    const containerHeight = 220;
    const innerHeight = Math.max(containerHeight - verticalPadding * 2, 1);
    const usableWidth = Math.max(chartContentWidth - horizontalPadding * 2, 1);
    const ratioDenominator = displayRows.length > 1 ? displayRows.length - 1 : 1;

    const points = displayRows.map((row, index) => {
      const xRatio = displayRows.length === 1 ? 0.5 : index / ratioDenominator;
      const valueRatio = maxVal > 0 ? row.value / maxVal : 0.5;
      const x = horizontalPadding + usableWidth * xRatio;
      const y = verticalPadding + (1 - valueRatio) * innerHeight;
      return { ...row, x, y };
    });
    
    console.log('Line points calculated:', points.length, 'points');
    return points;
  }, [chart, chartContentWidth, displayRows, maxVal]);

  const lineSegments = useMemo(() => {
    console.log('Line segments calculation:', { linePointsLength: linePoints.length });
    if (linePoints.length < 2) {
      console.log('Line segments not calculated: not enough points');
      return [];
    }
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
    console.log('Line segments calculated:', segments.length, 'segments');
    return segments;
  }, [linePoints]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.text + '66' }]}>
        <Card padding="medium" style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }] as any}>
          <View variant="transparent" style={styles.header}>
            <View variant="transparent" style={{ flex: 1 }}>
              <Text variant="primary" size="large" weight="semibold">
                {report?.name || t('screens.reports.saved_reports_title')}
              </Text>
              {config && (
                <Text variant="secondary" size="small" style={{ marginTop: 4 }}>
                  {factText(config.fact)} • {dimensionText(config.dimension)} • {measureText(config.measure)}
                </Text>
              )}
            </View>
            <TouchableOpacity variant="transparent" onPress={onClose} style={[styles.closeButton, { borderColor: colors.border }] as any}>
              <Text variant="secondary" size="small">✕</Text>
            </TouchableOpacity>
          </View>

          <View variant="transparent" style={styles.tabRow}>
            {chartTabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                variant="transparent"
                style={[
                  styles.tabButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: selectedChart === tab ? colors.primary : 'transparent',
                  },
                ] as any}
                onPress={() => setSelectedChart(tab)}
              >
                <Text style={{ color: selectedChart === tab ? colors.onPrimary : colors.text }}>
                  {tab === 'table'
                    ? t('screens.report_builder.chart_table') || 'Table'
                    : tab === 'bar'
                    ? t('screens.report_builder.chart_bar') || 'Bar'
                    : t('screens.report_builder.chart_line') || 'Line'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View variant="transparent" style={styles.center}>
              <ActivityIndicator color={colors.primary} />
              <Text variant="secondary" style={{ marginTop: 8 }}>Yükleniyor...</Text>
            </View>
          ) : error ? (
            <View variant="transparent" style={styles.center}>
              <Text variant="error">{error}</Text>
            </View>
          ) : displayRows.length === 0 ? (
            <View variant="transparent" style={styles.center}>
              <Text variant="secondary">{t('common.messages.no_data')}</Text>
              <Text variant="secondary" size="small" style={{ marginTop: 4 }}>
                Veri bulunamadı. Rapor ayarlarını kontrol edin.
              </Text>
            </View>
          ) : (
            <RNScrollView
              style={{ maxHeight: 320 }}
              contentContainerStyle={{ paddingVertical: 4 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {chart === 'table' && (
                <View variant="transparent" style={{ gap: 8 }}>
                  {displayRows.map((row) => (
                    <View key={row.key} variant="transparent" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text>{row.label}</Text>
                      <Text>{formatValue(row.value)}</Text>
                    </View>
                  ))}
                </View>
              )}

              {chart === 'bar' && (
                <View variant="transparent" style={{ gap: 8 }}>
                  {displayRows.map((row) => (
                    <View key={row.key} variant="transparent">
                      <Text variant="secondary" size="small">{row.label}</Text>
                      <RNView style={{ height: 18, backgroundColor: colors.card, borderRadius: 9, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
                        <RNView style={{ width: `${(scale(row.value) / 180) * 100}%`, backgroundColor: colors.primary, height: '100%' }} />
                      </RNView>
                      <Text variant="secondary" size="small" style={{ marginTop: 4 }}>{formatValue(row.value)}</Text>
                    </View>
                  ))}
                </View>
              )}

              {chart === 'line' && (
                <View variant="transparent" style={{ gap: 8 }}>
                  <RNView onLayout={handleLineChartLayout}>
                    <RNScrollView
                      horizontal
                      showsHorizontalScrollIndicator
                      contentContainerStyle={{ paddingBottom: 8 }}
                      nestedScrollEnabled
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
                                  {point.label}
                                </Text>
                              ))}
                          </RNView>
                        )}
                      </RNView>
                    </RNScrollView>
                  </RNView>
                </View>
              )}
            </RNScrollView>
          )}
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 400, borderWidth: 1, borderRadius: 16, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  center: { alignItems: 'center', paddingVertical: 24 },
  tabRow: { flexDirection: 'row', gap: 8 },
  tabButton: { flex: 1, borderWidth: 1, borderRadius: 999, paddingVertical: 8, alignItems: 'center' },
  lineChartSurface: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, justifyContent: 'center', height: 220 },
  lineChartLabels: { position: 'relative', height: 28, marginTop: 8 },
});

export default ReportPreviewModal;
