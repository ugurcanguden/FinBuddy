// IncomeReportSection - Gelir raporu bölümü
import React, { useMemo } from 'react';
import { View, Text, Card, Dropdown, GroupedColumnChart } from '@/components';
import type { GroupedDatum } from '@/components/common';
import { useLocale } from '@/hooks';
import { useTheme } from '@/contexts';

interface IncomeReportSectionProps {
  incomeSeries: Array<{ ym: string; total: number; paid: number }>;
  availableYears: string[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  formatCurrency: (value: number) => string;
  formatMonthLabel: (ym: string) => string;
}

const IncomeReportSection: React.FC<IncomeReportSectionProps> = ({
  incomeSeries,
  availableYears,
  selectedYear,
  onYearChange,
  formatCurrency,
  formatMonthLabel
}) => {
  const { t } = useLocale();
  const { colors } = useTheme();

  const latestIncome = incomeSeries.length ? incomeSeries[incomeSeries.length - 1]!.total : 0;

  // GroupedColumnChart için gelir verisi
  const incomeGroupedData: GroupedDatum[] = useMemo(() => {
    const sortedData = [...incomeSeries].sort((a, b) => a.ym.localeCompare(b.ym));
    return sortedData.map(s => {
      const paid = s.paid || 0;
      const unpaid = s.total - paid;
      const isOverdue = new Date(s.ym + '-01') < new Date();
      const label = formatMonthLabel(s.ym);
      
      return {
        label,
        values: {
          [t('screens.home.received') || 'Alınan']: paid,
          [t('screens.home.pending') || 'Bekleyen']: isOverdue ? 0 : unpaid,
          [t('screens.home.overdue') || 'Geciken']: isOverdue ? unpaid : 0,
        }
      };
    });
  }, [incomeSeries, formatMonthLabel, t]);

  const incomeGroupedColors = useMemo(() => ({
    [t('screens.home.received') || 'Alınan']: colors.success,
    [t('screens.home.pending') || 'Bekleyen']: colors.warning,
    [t('screens.home.overdue') || 'Geciken']: colors.danger,
  }), [t, colors]);

  return (
    <View style={{ marginTop: 24, gap: 16 }}>
      <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 4 }}>
        {t('screens.home.income_and_expenses') || 'Gelir ve Giderler'}
      </Text>
      
      <View variant="transparent" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Text variant="secondary" size="small" weight="medium">
          {t('screens.home.year_filter_label') || 'Yıl'}
        </Text>
        <Dropdown
          options={availableYears.map((year) => ({ value: year, label: year, nativeName: '', flag: '' }))}
          selectedValue={selectedYear}
          onSelect={onYearChange}
          style={{ flex: 0, minWidth: 140 }}
          disabled={availableYears.length === 0}
        />
      </View>

      {/* Gelir GroupedColumnChart */}
      <Card variant="elevated" padding="medium" style={{ gap: 12 }}>
        <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 16 }}>
          {t('screens.home.income_chart_title') || 'Gelir'}
        </Text>
        <Text variant="secondary" size="small" style={{ marginBottom: 16 }}>
          {`${t('screens.home.last_month') || 'Son ay'}: ${formatCurrency(latestIncome)}`}
        </Text>
        <GroupedColumnChart
          data={incomeGroupedData}
          colors={incomeGroupedColors}
          height={200}
          barWidth={18}
          barGap={10}
          groupGap={28}
          yTicks={5}
          formatValue={(n) => formatCurrency(n)}
          axisWidth={50}
        />
      </Card>
    </View>
  );
};

export default IncomeReportSection;
