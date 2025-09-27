// WalletSection - Cüzdan bölümü
import React from 'react';
import { WalletCard } from '@/components';
import { useCurrency } from '@/contexts';

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

  return (
    <WalletCard
      title="Cüzdan"
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
