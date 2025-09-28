// WalletSection - Cüzdan bölümü
import React from 'react';
import { WalletCard } from '@/components';
import { useCurrency } from '@/contexts';
import { useLocale } from '@/hooks';

interface WalletSectionProps {
  netCash: number;
  incomePaid: number;
  expensePaid: number;
  loading: boolean;
}

const WalletSection: React.FC<WalletSectionProps> = ({
  netCash,
  incomePaid,
  expensePaid,
  loading
}) => {
  const { currency } = useCurrency();
  const { t } = useLocale();
  
  // Debug için
  console.log('WalletSection - t result:', t('screens.wallet.title'));

  return (
    <WalletCard
      title={t('screens.wallet.title')}
      balance={netCash}
      income={incomePaid}
      expense={expensePaid}
      currency={currency}
      animated={true}
      loading={loading}
      style={{ marginBottom: 16 }}
    />
  );
};

export default WalletSection;
