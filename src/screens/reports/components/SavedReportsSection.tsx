// SavedReportsSection - Kayıtlı raporlar bölümü
import React from 'react';
import { View, Text, Card, TouchableOpacity, Button } from '@/components';
import { useLocale } from '@/hooks';
import { useNavigation } from '@/contexts';
import type { ReportDef, ReportConfig } from '@/services';

interface SavedReportsSectionProps {
  savedReports: ReportDef[];
  savedLoading: boolean;
  onOpenSaved: (report: ReportDef) => void;
  onOpenPreview: (report: ReportDef) => void;
  onDeleteSaved: (report: ReportDef) => void;
}

const SavedReportsSection: React.FC<SavedReportsSectionProps> = ({
  savedReports,
  savedLoading,
  onOpenSaved,
  onOpenPreview,
  onDeleteSaved
}) => {
  const { t } = useLocale();
  const { navigateTo } = useNavigation();

  const factText = (fact: ReportConfig['fact']) => {
    const map: Record<string, string> = {
      payments_expense: t('screens.report_builder.fact_payments_expense') || 'Giderler',
      payments_income: t('screens.report_builder.fact_payments_income') || 'Gelirler',
    };
    return map[fact] ?? String(fact);
  };

  const dimensionText = (dim: ReportConfig['dimension']) => {
    const map = {
      month: t('screens.report_builder.dimension_month') || 'Ay',
      category: t('screens.report_builder.dimension_category') || 'Kategori',
      status: t('screens.report_builder.dimension_status') || 'Durum',
      type: t('screens.report_builder.dimension_type') || 'Tip',
    };
    return map[dim] ?? String(dim);
  };

  const measureText = (msr: ReportConfig['measure']) => {
    const map = {
      sum: t('screens.report_builder.measure_sum') || 'Toplam',
      count: t('screens.report_builder.measure_count') || 'Sayı',
      avg: t('screens.report_builder.measure_avg') || 'Ortalama',
    };
    return map[msr] ?? String(msr);
  };

  const chartText = (chart?: ReportConfig['chart']) => {
    if (chart === 'bar') return t('screens.report_builder.chart_bar') || 'Bar';
    if (chart === 'line') return t('screens.report_builder.chart_line') || 'Çizgi';
    return t('screens.report_builder.chart_table') || 'Tablo';
  };

  return (
    <View style={{ marginBottom: 32 }}>
      <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 16 }}>
        {t('screens.reports.saved_reports')}
      </Text>
      
      {savedLoading ? (
        <Card variant="default" style={{ padding: 24, alignItems: 'center' }}>
          <Text variant="secondary" size="medium" style={{ textAlign: 'center' }}>
            {t('common.messages.loading')}
          </Text>
        </Card>
      ) : savedReports.length > 0 ? (
        <View style={{ gap: 12 }}>
          {savedReports.map((report) => (
            <Card key={report.id} variant="elevated" style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text variant="primary" size="medium" weight="bold" style={{ flex: 1, marginRight: 12 }}>
                  {report.name}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity 
                    onPress={() => onOpenPreview(report)} 
                    style={{ padding: 8, borderRadius: 8, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  >
                    <Text variant="primary" size="medium">👁️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => onOpenSaved(report)} 
                    style={{ padding: 8, borderRadius: 8, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  >
                    <Text variant="primary" size="medium">✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => onDeleteSaved(report)} 
                    style={{ padding: 8, borderRadius: 8, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  >
                    <Text variant="error" size="medium">🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text variant="secondary" size="small" style={{ marginBottom: 8 }}>
                {factText(report.config.fact)} • {dimensionText(report.config.dimension)} • {measureText(report.config.measure)}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant="secondary" size="small" weight="medium">
                  📊 {chartText(report.config.chart)}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <Card variant="outlined" style={{ padding: 32, alignItems: 'center' }}>
          <Text variant="secondary" size="medium" style={{ textAlign: 'center', marginBottom: 16 }}>
            {t('screens.reports_hub.no_saved_reports')}
          </Text>
          <Button
            variant="outline"
            size="small"
            onPress={() => navigateTo('reportBuilder')}
            title={t('screens.reports_hub.first_report')}
            style={{ alignSelf: 'center' }}
          />
        </Card>
      )}
    </View>
  );
};

export default SavedReportsSection;
