// Add Entry Screen - Modern ödeme/gelir ekleme için iki sekmeli ekran
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, PageHeader, View, Text, TouchableOpacity, KeyboardAwareScrollView, Button, Card } from '@/components';
import { Badge } from '@/components/common';
import { useNavigation, useTheme } from '@/contexts';
import AddPaymentScreen, { AddPaymentScreenHandle } from './AddPaymentScreen';
import { useLocale } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AddEntryScreenProps {
  type?: 'expense' | 'income';
}

const AddEntryScreen: React.FC<AddEntryScreenProps> = ({ type = 'expense' }) => {
  const { goBack, getCurrentParams } = useNavigation();
  const { colors } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  // URL parametresinden veya prop'tan tab'ı belirle
  const params = getCurrentParams();
  const initialTab = (params?.['type'] as 'expense' | 'income') || type;
  const [tab, setTab] = useState<'expense' | 'income'>(initialTab);
  const expenseRef = useRef<AddPaymentScreenHandle>(null);
  const incomeRef = useRef<AddPaymentScreenHandle>(null);
  const [expenseValid, setExpenseValid] = useState(false);
  const [incomeValid, setIncomeValid] = useState(false);

  // Parametre değiştiğinde tab'ı güncelle (sadece ilk yüklemede)
  useEffect(() => {
    const newTab = (params?.['type'] as 'expense' | 'income') || type;
    setTab(newTab);
  }, [params, type]); // tab dependency'sini kaldırdık

  const currentValid = useMemo(() => (tab === 'expense' ? expenseValid : incomeValid), [expenseValid, incomeValid, tab]);

  const handleSubmit = useCallback(async () => {
    const ref = tab === 'expense' ? expenseRef.current : incomeRef.current;
    if (!ref) return;

    const success = await ref.submit();
    if (success) {
      goBack();
    }
  }, [goBack, tab]);

  const isExpense = tab === 'expense';
  const currentIcon = isExpense ? '💸' : '💰';
  const currentColor = isExpense ? '#E74C3C' : '#27AE60';
  const currentText = isExpense ? 'Ödeme' : 'Gelir';

  return (
    <Layout headerComponent={<PageHeader title={t('screens.add_entry.title')} showBackButton onBackPress={goBack} />} showFooter={false}>
      <View style={styles.page}>
        {/* Modern Header */}
        <Card variant="elevated" style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerIcon, { color: currentColor }] as any}>{currentIcon}</Text>
            <View style={styles.headerText}>
              <Text variant="primary" size="large" weight="bold" style={styles.headerTitle}>
                {isExpense ? 'Yeni Ödeme Ekle' : 'Yeni Gelir Ekle'}
              </Text>
              <Text variant="secondary" size="medium" style={styles.headerSubtitle}>
                {isExpense ? 'Ödeme bilgilerinizi girin' : 'Gelir bilgilerinizi girin'}
              </Text>
            </View>
            <Badge variant={isExpense ? 'danger' : 'success'} size="small">
              {currentText}
            </Badge>
          </View>
        </Card>

        {/* Modern Tabs */}
        <Card variant="outlined" style={styles.tabsCard}>
          <View style={styles.tabs}>
            {(['expense', 'income'] as const).map((key) => {
              const isActive = tab === key;
              const icon = key === 'expense' ? '💸' : '💰';
              const color = key === 'expense' ? '#E74C3C' : '#27AE60';
              
              return (
                <TouchableOpacity
                  key={key}
                  variant="transparent"
                  style={[
                    styles.tabBtn,
                    {
                      borderColor: isActive ? color : colors.border,
                      backgroundColor: isActive ? `${color}15` : 'transparent',
                    },
                  ] as any}
                  onPress={() => setTab(key)}
                >
                  <Text style={[styles.tabIcon, { color: isActive ? color : colors.textSecondary }] as any}>
                    {icon}
                  </Text>
                  <Text style={[styles.tabText, { color: isActive ? color : colors.text }] as any}>
                    {key === 'expense' ? t('screens.add_entry.tab_expense') : t('screens.add_entry.tab_income')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

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
  headerCard: {
    margin: 20,
    marginBottom: 16,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.8,
  },
  tabsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
  },
  tabs: { flexDirection: 'row', gap: 12 },
  tabBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
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
