// IncomeQuickActionsSection - Gelir hızlı eylemler bölümü
import React from 'react';
import { View, Text, Button } from '@/components';
import { useLocale } from '@/hooks';
import { useNavigation } from '@/contexts';

const IncomeQuickActionsSection: React.FC = () => {
  const { t } = useLocale();
  const { navigateTo } = useNavigation();

  return (
    <View style={{ marginBottom: 32 }}>
      <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 16 }}>
        {t('screens.incomes.quick_actions') || 'Hızlı Eylemler'}
      </Text>
      
      <View style={{ gap: 12 }}>
        <Button
          variant="primary"
          size="large"
          onPress={() => navigateTo('addEntry', { type: 'income' })}
          icon="➕"
          title={t('screens.incomes.add_income') || 'Yeni Gelir Ekle'}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

export default IncomeQuickActionsSection;
