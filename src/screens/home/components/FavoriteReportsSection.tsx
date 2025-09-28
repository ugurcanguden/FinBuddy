// FavoriteReportsSection - Favori raporlar bölümü
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { View, Text, Card, ReportPreviewModal } from '@/components';
import { useTheme } from '@/contexts';
import { useLocale } from '@/hooks';
import type { ReportConfig } from '@/services';

interface FavoriteReport {
  id: string;
  name: string;
  config: ReportConfig;
}

interface FavoriteReportsSectionProps {
  reports: FavoriteReport[];
  onRemoveReport: (reportId: string) => void;
}

const FavoriteReportsSection: React.FC<FavoriteReportsSectionProps> = ({
  reports,
  onRemoveReport,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [previewReport, setPreviewReport] = useState<FavoriteReport | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Modal açma fonksiyonu
  const openPreview = (report: FavoriteReport) => {
    setPreviewReport(report);
    setPreviewVisible(true);
  };

  // Modal kapatma fonksiyonu
  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewReport(null);
  };

  if (reports.length === 0) {
    return null;
  }

  const getReportIcon = (config: FavoriteReport['config']) => {
    switch (config.chart) {
      case 'bar':
        return '📊';
      case 'line':
        return '📈';
      case 'pie':
        return '🥧';
      case 'table':
        return '📋';
      default:
        return '📊';
    }
  };

  const getReportDescription = (config: FavoriteReport['config']) => {
    const factMap: Record<string, string> = {
      'payments_all': t('screens.report_builder.fact_payments_all') || 'Tüm Ödemeler',
      'payments_expense': t('screens.report_builder.fact_payments_expense') || 'Giderler',
      'payments_income': t('screens.report_builder.fact_payments_income') || 'Gelirler',
      'payments': t('screens.report_builder.fact_payments') || 'Ödemeler',
      'entries': t('screens.report_builder.fact_entries') || 'Kayıtlar',
    };

    const dimensionMap: Record<string, string> = {
      'month': t('screens.report_builder.dimension_month') || 'Aylık',
      'category': t('screens.report_builder.dimension_category') || 'Kategori',
      'status': t('screens.report_builder.dimension_status') || 'Durum',
      'type': t('screens.report_builder.dimension_type') || 'Tip',
    };

    const measureMap: Record<string, string> = {
      'sum': t('screens.report_builder.measure_sum') || 'Toplam',
      'count': t('screens.report_builder.measure_count') || 'Sayı',
      'avg': t('screens.report_builder.measure_avg') || 'Ortalama',
    };

    return `${factMap[config.fact] || config.fact} - ${dimensionMap[config.dimension] || config.dimension} - ${measureMap[config.measure] || config.measure}`;
  };

  return (
    <View style={styles.container}>
      <Text variant="primary" weight="bold" style={{ ...styles.title, color: colors.text }}>
        ⭐ {t('screens.home.favorite_reports_title') || 'Favori Raporlar'}
      </Text>
      
      <View style={styles.reportsList}>
        {reports.map((report) => (
          <Card key={report.id} style={{ ...styles.reportCard, backgroundColor: colors.card }}>
            <View style={styles.reportHeader}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportIcon}>
                  {getReportIcon(report.config)}
                </Text>
                <View style={styles.reportDetails}>
                  <Text variant="primary" weight="semibold" style={{ ...styles.reportName, color: colors.text }}>
                    {report.name}
                  </Text>
                  <Text variant="secondary" size="small" style={{ ...styles.reportDescription, color: colors.textSecondary }}>
                    {getReportDescription(report.config)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.reportActions}>
                <TouchableOpacity
                  onPress={() => openPreview(report)}
                  style={{ ...styles.previewButton, backgroundColor: colors.primary + '20' }}
                >
                  <Text style={{ ...styles.previewButtonText, color: colors.primary }}>
                    👁️
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onRemoveReport(report.id)}
                  style={{ ...styles.removeButton, backgroundColor: colors.danger + '20' }}
                >
                  <Text style={{ ...styles.removeButtonText, color: colors.danger }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Rapor Önizleme Modal */}
      {previewReport && (
        <ReportPreviewModal
          visible={previewVisible}
          onClose={closePreview}
          report={{
            id: previewReport.id,
            name: previewReport.name,
            config: previewReport.config,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    marginBottom: 16,
    fontSize: 20,
  },
  reportsList: {
    gap: 12,
  },
  reportCard: {
    padding: 16,
    borderRadius: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  reportDetails: {
    flex: 1,
  },
  reportName: {
    fontSize: 16,
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoriteReportsSection;
