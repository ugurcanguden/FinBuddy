// StatsSection - İstatistik kartları bölümü
import React, { useMemo } from 'react';
import { View, StatCard } from '@/components';
import { useLocale } from '@/hooks';

interface StatsSectionProps {
  summary: {
    expense: { total: number; paid: number; pending: number };
    income: { total: number; paid: number; pending: number };
  } | null;
  formatCurrency: (value: number) => string;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  summary,
  formatCurrency
}) => {
  const { t } = useLocale();

  const statItems = useMemo(() => {
    if (!summary) return [];
    
    // Trend hesaplamaları (basit örnek - gerçek uygulamada daha karmaşık olabilir)
    const expenseTrend = summary.expense.paid > 0 ? 'up' : 'neutral';
    const incomeTrend = summary.income.total > 0 ? 'up' : 'neutral';
    const pendingTrend = summary.expense.pending > 0 ? 'down' : 'neutral';
    
    return [
      { 
        title: t('screens.reports.expense_total') || 'Gider Toplam', 
        value: formatCurrency(summary.expense.total),
        icon: '💸',
        variant: 'danger' as const,
        trend: expenseTrend as 'up' | 'down' | 'neutral',
        trendValue: summary.expense.total > 0 ? t('screens.stats.trend_values.active') : t('screens.stats.trend_values.none'),
        subtitle: t('screens.stats.subtitles.expense_total')
      },
      { 
        title: t('screens.reports.expense_paid') || 'Ödenen', 
        value: formatCurrency(summary.expense.paid),
        icon: '✅',
        variant: 'success' as const,
        trend: 'up',
        trendValue: summary.expense.paid > 0 ? t('screens.stats.trend_values.paid') : t('screens.stats.trend_values.waiting'),
        subtitle: t('screens.stats.subtitles.expense_paid')
      },
      { 
        title: t('screens.reports.expense_pending') || 'Bekleyen', 
        value: formatCurrency(summary.expense.pending),
        icon: '⏳',
        variant: 'warning' as const,
        trend: pendingTrend as 'up' | 'down' | 'neutral',
        trendValue: summary.expense.pending > 0 ? t('screens.stats.trend_values.waiting') : t('screens.stats.trend_values.none'),
        subtitle: t('screens.stats.subtitles.expense_pending')
      },
      { 
        title: t('screens.reports.income_total') || 'Gelir Toplam', 
        value: formatCurrency(summary.income.total),
        icon: '💰',
        variant: 'primary' as const,
        trend: incomeTrend as 'up' | 'down' | 'neutral',
        trendValue: summary.income.total > 0 ? t('screens.stats.trend_values.received') : t('screens.stats.trend_values.waiting'),
        subtitle: t('screens.stats.subtitles.income_total')
      },
    ];
  }, [formatCurrency, summary, t]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      {statItems.map((item, idx) => (
        <StatCard
          key={idx}
          title={item.title}
          value={item.value}
          subtitle={item.subtitle}
          icon={item.icon}
          trend={item.trend as 'up' | 'neutral' | 'down'}
          trendValue={item.trendValue}
          variant={item.variant}
          animated={true} 
          style={{ width: '47%' }}
        />
      ))}
    </View>
  );
};

export default StatsSection;
