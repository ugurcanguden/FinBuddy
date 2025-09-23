// Add Entry Screen - Ödeme/Gelir ekleme için iki sekmeli ekran
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, PageHeader, View, Text, TouchableOpacity, KeyboardAwareScrollView, Button } from '@/components';
import { useNavigation, useTheme } from '@/contexts';
import AddPaymentScreen, { AddPaymentScreenHandle } from './AddPaymentScreen';
import { useLocale } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AddEntryScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const { colors } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const expenseRef = useRef<AddPaymentScreenHandle>(null);
  const incomeRef = useRef<AddPaymentScreenHandle>(null);
  const [expenseValid, setExpenseValid] = useState(false);
  const [incomeValid, setIncomeValid] = useState(false);

  const currentValid = useMemo(() => (tab === 'expense' ? expenseValid : incomeValid), [expenseValid, incomeValid, tab]);

  const handleSubmit = useCallback(async () => {
    const ref = tab === 'expense' ? expenseRef.current : incomeRef.current;
    if (!ref) return;

    const success = await ref.submit();
    if (success) {
      goBack();
    }
  }, [goBack, tab]);

  return (
    <Layout headerComponent={<PageHeader title={t('screens.add_entry.title')} showBackButton onBackPress={goBack} />} showFooter={false}>
      <View style={styles.page}>
        <View variant="transparent" style={styles.tabsContainer}>
          <View variant="transparent" style={styles.tabs}>
            {(['expense', 'income'] as const).map((key) => (
              <TouchableOpacity
                key={key}
                variant="transparent"
                style={[
                  styles.tabBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: tab === key ? colors.primary : colors.card,
                  },
                ] as any}
                onPress={() => setTab(key)}
              >
                <Text style={{ color: tab === key ? colors.onPrimary : colors.text }}>
                  {key === 'expense' ? t('screens.add_entry.tab_expense') : t('screens.add_entry.tab_income')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          <View style={styles.formSwitcher}>
            <View style={[styles.formPane, tab === 'expense' ? styles.formActive : styles.formHidden]}>
              <AddPaymentScreen
                ref={expenseRef}
                entryType="expense"
                i18nKey="add_payment"
                embedded
                onValidityChange={setExpenseValid}
              />
            </View>
            <View style={[styles.formPane, tab === 'income' ? styles.formActive : styles.formHidden]}>
              <AddPaymentScreen
                ref={incomeRef}
                entryType="income"
                i18nKey="add_income"
                embedded
                onValidityChange={setIncomeValid}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + 16,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Button
            title={t('common.buttons.save')}
            onPress={handleSubmit}
            disabled={!currentValid}
            style={styles.footerButton}
          />
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  tabsContainer: { paddingHorizontal: 20, paddingTop: 16 },
  tabs: { flexDirection: 'row', gap: 12 },
  tabBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    paddingVertical: 10,
  },
  formSwitcher: { flex: 1 },
  formPane: { flex: 1 },
  formActive: { display: 'flex' },
  formHidden: { display: 'none' },
  footer: {
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  footerButton: { width: '100%' },
});

export default AddEntryScreen;
