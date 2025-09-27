// ExpenseReportSection - Gider raporu bölümü
import React, { useMemo } from 'react';
import { View, Text, Card, GroupedColumnChart } from '@/components';
import type { GroupedDatum } from '@/components/common';
import { useLocale } from '@/hooks';
import { useTheme } from '@/contexts';

interface ExpenseReportSectionProps {
  expenseSeries: Array<{ ym: string; total: number; paid: number }>;
  formatCurrency: (value: number) => string;
  formatMonthLabel: (ym: string) => string;
}

const ExpenseReportSection: React.FC<ExpenseReportSectionProps> = ({
  expenseSeries,
  formatCurrency,
  formatMonthLabel
}) => {
  const { t } = useLocale();
  const { colors } = useTheme();

  const latestExpense = expenseSeries.length ? expenseSeries[expenseSeries.length - 1]!.total : 0;

  // GroupedColumnChart için gider verisi
  const expenseGroupedData: GroupedDatum[] = useMemo(() => {
    const sortedData = [...expenseSeries].sort((a, b) => a.ym.localeCompare(b.ym));
    return sortedData.map(s => {
      const paid = s.paid || 0;
      const unpaid = s.total - paid;
      const isOverdue = new Date(s.ym + '-01') < new Date();
      const label = formatMonthLabel(s.ym);
      
      return {
        label,
        values: {
          [t('screens.home.paid') || 'Ödenen']: paid,
          [t('screens.home.pending') || 'Bekleyen']: isOverdue ? 0 : unpaid,
          [t('screens.home.overdue') || 'Geciken']: isOverdue ? unpaid : 0,
        }
      };
    });
  }, [expenseSeries, formatMonthLabel, t]);

  const expenseGroupedColors = useMemo(() => ({
    [t('screens.home.paid') || 'Ödenen']: colors.success,
    [t('screens.home.pending') || 'Bekleyen']: colors.warning,
    [t('screens.home.overdue') || 'Geciken']: colors.danger,
  }), [t, colors]);

  return (
    <View style={{ marginTop: 16 }}>
      {/* Gider GroupedColumnChart */}
      <Card variant="elevated" padding="medium" style={{ gap: 12 }}>
        <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 16 }}>
          {t('screens.home.expenses_chart_title') || 'Giderler'}
        </Text>
        <Text variant="secondary" size="small" style={{ marginBottom: 16 }}>
          {`${t('screens.home.last_month') || 'Son ay'}: ${formatCurrency(latestExpense)}`}
        </Text>
        <GroupedColumnChart
          data={expenseGroupedData}
          colors={expenseGroupedColors}
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

export default ExpenseReportSection;
