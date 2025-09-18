// Add Entry Screen - Ödeme/Gelir ekleme için iki sekmeli ekran
import React, { useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Layout, PageHeader, View, Text, TouchableOpacity, ScrollView } from '@/components';
import { useNavigation, useTheme } from '@/contexts';
import AddPaymentScreen from './AddPaymentScreen';
import { useLocale } from '@/hooks';

const AddEntryScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const { colors } = useTheme();
  const { t } = useLocale();
  const [tab, setTab] = useState<'expense' | 'income'>('expense');

  return (
    <Layout headerComponent={<PageHeader title={t('screens.add_entry.title')} showBackButton onBackPress={goBack} />} showFooter={false}>
      <ScrollView style={styles.container}>
        {/* Tabs */}
        <View variant="transparent" style={styles.tabs}>
          {(['expense','income'] as const).map((key) => (
            <TouchableOpacity
              key={key}
              variant="transparent"
              style={[styles.tabBtn, { borderColor: colors.border, backgroundColor: tab === key ? colors.primary : 'transparent' }] as any}
              onPress={() => setTab(key)}
            >
              <Text style={{ color: tab === key ? colors.onPrimary : colors.text }}>
                {key === 'expense' ? t('screens.add_entry.tab_expense') : t('screens.add_entry.tab_income')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content (embedded) */}
        {tab === 'expense' ? (
          <AddPaymentScreen entryType="expense" i18nKey="add_payment" embedded />
        ) : (
          <AddPaymentScreen entryType="income" i18nKey="add_income" embedded />
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  tabBtn: { flex: 1, borderWidth: 1, borderRadius: 999, alignItems: 'center', paddingVertical: 10 },
});

export default AddEntryScreen;
