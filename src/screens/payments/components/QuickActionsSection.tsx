// QuickActionsSection - Hızlı eylemler bölümü
import React from 'react';
import { View, Text, Button } from '@/components';
import { useLocale } from '@/hooks';
import { useNavigation } from '@/contexts';

const QuickActionsSection: React.FC = () => {
  const { t } = useLocale();
  const { navigateTo } = useNavigation();

  return (
    <View style={{ marginBottom: 32 }}>
      <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 16 }}>
        {t('screens.payments.quick_actions') || 'Hızlı Eylemler'}
      </Text>
      
      <View style={{ gap: 12 }}>
        <Button
          variant="primary"
          size="large"
          onPress={() => navigateTo('addEntry', { type: 'expense' })}
          icon="➕"
          title={t('screens.payments.add_payment') || 'Yeni Ödeme Ekle'}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

export default QuickActionsSection;
