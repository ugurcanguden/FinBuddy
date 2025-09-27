// IncomeStatsSection - Gelir istatistikleri bölümü
import React from 'react';
import { View, Text, StatCard } from '@/components';
import { useLocale } from '@/hooks';

interface IncomeStatsSectionProps {
  stats: {
    totalAmount: number;
    installmentCount: number;
    oneTimeCount: number;
    totalMonths: number;
  };
  formatCurrency: (amount: number) => string;
}

const IncomeStatsSection: React.FC<IncomeStatsSectionProps> = ({
  stats,
  formatCurrency
}) => {
  const { t } = useLocale();

  return (
    <View style={{ marginBottom: 32 }}>
      <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 16 }}>
        {t('screens.incomes.income_statistics') || 'Gelir İstatistikleri'}
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
        <StatCard
          title={t('screens.incomes.total_amount') || 'Toplam Tutar'}
          value={formatCurrency(stats.totalAmount)}
          subtitle={t('screens.incomes.total_incomes_subtitle') || 'tüm gelirler'}
          icon="💰"
          variant="success"
          animated={true}
          style={{ width: '48%' }}
        />
        
        <StatCard
          title={t('screens.incomes.installment') || 'Taksitli'}
          value={stats.installmentCount.toString()}
          subtitle={t('screens.incomes.installment_subtitle') || 'gelir'}
          icon="📅"
          variant="warning"
          animated={true}
          style={{ width: '48%' }}
        />
        
        <StatCard
          title={t('screens.incomes.one_time') || 'Tek Seferlik'}
          value={stats.oneTimeCount.toString()}
          subtitle={t('screens.incomes.one_time_subtitle') || 'gelir'}
          icon="💳"
          variant="info"
          animated={true}
          style={{ width: '48%' }}
        />
        
        <StatCard
          title={t('screens.incomes.total_installments') || 'Toplam Taksit'}
          value={stats.totalMonths.toString()}
          subtitle={t('screens.incomes.total_installments_subtitle') || 'ay'}
          icon="📊"
          variant="primary"
          animated={true}
          style={{ width: '48%' }}
        />
      </View>
    </View>
  );
};

export default IncomeStatsSection;
