// PaymentStatsSection - Ödeme istatistikleri bölümü
import React from 'react';
import { View, Text, StatCard } from '@/components';
import { useLocale } from '@/hooks';

interface PaymentStatsSectionProps {
  stats: {
    totalAmount: number;
    installmentCount: number;
    oneTimeCount: number;
    totalMonths: number;
  };
  formatCurrency: (amount: number) => string;
}

const PaymentStatsSection: React.FC<PaymentStatsSectionProps> = ({
  stats,
  formatCurrency
}) => {
  const { t } = useLocale();

  return (
    <View style={{ marginBottom: 32 }}>
      <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 16 }}>
        {t('screens.payments.payment_statistics') || 'Ödeme İstatistikleri'}
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
        <StatCard
          title={t('screens.payments.total_amount') || 'Toplam Tutar'}
          value={formatCurrency(stats.totalAmount)}
          subtitle={t('screens.payments.total_payments_subtitle') || 'tüm ödemeler'}
          icon="💸"
          variant="danger"
          animated={true}
          style={{ width: '48%' }}
        />
        
        <StatCard
          title={t('screens.payments.installment') || 'Taksitli'}
          value={stats.installmentCount.toString()}
          subtitle={t('screens.payments.installment_subtitle') || 'ödeme'}
          icon="📅"
          variant="warning"
          animated={true}
          style={{ width: '48%' }}
        />
        
        <StatCard
          title={t('screens.payments.one_time') || 'Tek Seferlik'}
          value={stats.oneTimeCount.toString()}
          subtitle={t('screens.payments.one_time_subtitle') || 'ödeme'}
          icon="💳"
          variant="info"
          animated={true}
          style={{ width: '48%' }}
        />
        
        <StatCard
          title={t('screens.payments.total_installments') || 'Toplam Taksit'}
          value={stats.totalMonths.toString()}
          subtitle={t('screens.payments.total_installments_subtitle') || 'ay'}
          icon="📊"
          variant="primary"
          animated={true}
          style={{ width: '48%' }}
        />
      </View>
    </View>
  );
};

export default PaymentStatsSection;
