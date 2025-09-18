// Add Payment Screen - Yeni ödeme ekle
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Layout, PageHeader, ScrollView, View, Text, TextInput, Dropdown, TouchableOpacity, DatePickerField, DatePickerFieldNative } from '@/components';
import { Platform } from 'react-native';
import { useLocale } from '@/hooks';
import { paymentService } from '@/services';
import { useNavigation, useTheme } from '@/contexts';
import { useCategories } from '@/hooks';

interface FormState {
  amount: string;
  months: string;
  startDate: string; // ISO veya YYYY-MM-DD string
  title: string;
  categoryId: string;
}

interface AddPaymentScreenProps {
  entryType?: 'expense' | 'income';
  i18nKey?: 'add_payment' | 'add_income';
  embedded?: boolean; // AddEntryScreen içinde içerik olarak kullanmak için
}

const AddPaymentScreen: React.FC<AddPaymentScreenProps> = ({ entryType = 'expense', i18nKey = 'add_payment', embedded = false }) => {
  const { goBack } = useNavigation();
  const { colors } = useTheme();
  const { categories, getDisplayName } = useCategories();
  const { t } = useLocale();

  const getIconEmoji = (iconName: string): string => {
    const iconMap: Record<string, string> = {
      home: '🏠',
      receipt_long: '🧾',
      school: '🎓',
      fastfood: '🍔',
      directions_bus: '🚌',
      favorite: '❤️',
      movie: '🎬',
      apps: '📱',
      shopping_cart: '🛒',
      sports: '⚽',
      work: '💼',
      travel: '✈️',
    };
    return iconMap[iconName] || '📁';
  };

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((c) => c.is_active)
        .map((c) => ({ value: c.id, label: getDisplayName(c, t), nativeName: '', flag: getIconEmoji(c.icon) })),
    [categories, getDisplayName, t]
  );

  const [form, setForm] = useState<FormState>({ amount: '', months: '', startDate: '', title: '', categoryId: '' });

  const isValid = useMemo(() => {
    const amountNum = Number(form.amount);
    const monthsNum = Number(form.months);
    return (
      !!form.title.trim() && !!form.categoryId && amountNum > 0 && Number.isFinite(amountNum) && (monthsNum === 0 || monthsNum >= 1)
    );
  }, [form]);

  const handleSave = async () => {
    if (!isValid) return;
    try {
      await paymentService.createEntryWithSchedule({
        categoryId: form.categoryId,
        title: form.title.trim(),
        amount: Number(form.amount),
        months: Number(form.months || 0),
        startDate: form.startDate || new Date().toISOString().slice(0, 10),
        type: entryType,
      });
      Alert.alert(t('common.messages.success'), t('common.messages.created'));
      goBack();
    } catch (e) {
      Alert.alert(t('common.messages.error'), String((e as Error).message || ''));
    }
  };

  const formContent = (
    <>
      {/* Tutar */}
      <View variant="surface" style={[styles.fieldCard, { borderColor: colors.border }] as any}>
        <Text variant="primary" size="medium" weight="semibold">{t(`screens.${i18nKey}.amount`)}</Text>
        <TextInput
          placeholder={t(`screens.${i18nKey}.amount_placeholder`)}
          keyboardType="numeric"
          value={form.amount}
          onChangeText={(amount) => setForm((s) => ({ ...s, amount }))}
          variant="outlined"
        />
      </View>

      {/* Toplam Ay */}
      <View variant="surface" style={[styles.fieldCard, { borderColor: colors.border }] as any}>
        <Text variant="primary" size="medium" weight="semibold">{t(`screens.${i18nKey}.months`)}</Text>
        <TextInput
          placeholder={t(`screens.${i18nKey}.months_placeholder`)}
          keyboardType="numeric"
          value={form.months}
          onChangeText={(months) => setForm((s) => ({ ...s, months }))}
          variant="outlined"
        />
      </View>

      {/* Başlangıç Tarihi */}
      <View variant="surface" style={[styles.fieldCard, { borderColor: colors.border }] as any}>
        <Text variant="primary" size="medium" weight="semibold">{t(`screens.${i18nKey}.start_date`)}</Text>
        {Platform.OS === 'web' ? (
          <DatePickerField
            value={form.startDate}
            onChange={(startDate) => setForm((s) => ({ ...s, startDate }))}
            placeholder={t(`screens.${i18nKey}.start_date`)}
          />
        ) : (
          <DatePickerFieldNative
            value={form.startDate}
            onChange={(startDate) => setForm((s) => ({ ...s, startDate }))}
            placeholder={t(`screens.${i18nKey}.start_date`)}
          />
        )}
      </View>

      {/* Başlık */}
      <View variant="surface" style={[styles.fieldCard, { borderColor: colors.border }] as any}>
        <Text variant="primary" size="medium" weight="semibold">{t(`screens.${i18nKey}.payment_title`)}</Text>
        <TextInput
          placeholder={t(`screens.${i18nKey}.payment_title_placeholder`)}
          value={form.title}
          onChangeText={(title) => setForm((s) => ({ ...s, title }))}
          variant="outlined"
        />
      </View>

      {/* Kategori */}
      <View variant="surface" style={[styles.fieldCard, { borderColor: colors.border }] as any}>
        <Text variant="primary" size="medium" weight="semibold">{t(`screens.${i18nKey}.category`)}</Text>
        <Dropdown
          options={categoryOptions}
          selectedValue={form.categoryId}
          onSelect={(categoryId) => setForm((s) => ({ ...s, categoryId }))}
          placeholder={t(`screens.${i18nKey}.category_placeholder`)}
        />
      </View>

      {/* Kaydet butonu (inline) */}
      <View variant="transparent" style={{ padding: 16 }}>
        <TouchableOpacity
          variant="primary"
          onPress={handleSave}
          disabled={!isValid}
          style={{ backgroundColor: isValid ? colors.accent : colors.border, borderRadius: 999, paddingVertical: 14, alignItems: 'center' }}
        >
          <Text weight="bold" style={{ color: colors.onPrimary }}>{t('common.buttons.save')}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  if (embedded) {
    return <View variant="transparent" style={styles.container}>{formContent}</View>;
  }

  return (
    <Layout headerComponent={<PageHeader title={t(`screens.${i18nKey}.title`)} showBackButton onBackPress={goBack} />}>
      <ScrollView style={styles.container}>{formContent}</ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  fieldCard: { gap: 8, borderRadius: 12, padding: 16, borderWidth: 1 },
});

export default AddPaymentScreen;
