// Add Payment Screen - Yeni ödeme ekle
import React, { useEffect, useImperativeHandle, useMemo, useState, forwardRef, useCallback } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Layout, PageHeader, View, TextInput, Dropdown, DatePickerField, DatePickerFieldNative, KeyboardAwareScrollView, FormSection, Button } from '@/components';
import { Platform } from 'react-native';
import { useLocale } from '@/hooks';
import { paymentService } from '@/services';
import { useNavigation } from '@/contexts';
import { useCategories } from '@/hooks';

interface FormState {
  amount: string;
  months: string;
  startDate: string; // ISO veya YYYY-MM-DD string
  title: string;
  categoryId: string;
}

export interface AddPaymentScreenHandle {
  submit: () => Promise<boolean>;
  isValid: () => boolean;
}

export interface AddPaymentScreenProps {
  entryType?: 'expense' | 'income';
  i18nKey?: 'add_payment' | 'add_income';
  embedded?: boolean;
  onValidityChange?: (valid: boolean) => void;
  onSubmitSuccess?: () => void;
}

const AddPaymentScreen = forwardRef<AddPaymentScreenHandle, AddPaymentScreenProps>(
  ({ entryType = 'expense', i18nKey = 'add_payment', embedded = false, onValidityChange, onSubmitSuccess }, ref) => {
    const { goBack } = useNavigation();
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

    useEffect(() => {
      onValidityChange?.(isValid);
    }, [isValid, onValidityChange]);

    const handleSave = useCallback(async () => {
      if (!isValid) {
        return false;
      }

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
        onSubmitSuccess?.();

        if (!embedded) {
          goBack();
        }

        return true;
      } catch (e) {
        Alert.alert(t('common.messages.error'), String((e as Error).message || ''));
        return false;
      }
    }, [embedded, entryType, form, goBack, isValid, onSubmitSuccess, t]);

    useImperativeHandle(
      ref,
      () => ({
        submit: handleSave,
        isValid: () => isValid,
      }),
      [handleSave, isValid]
    );

  const formContent = (
    <View variant="transparent" style={[styles.formStack, embedded && styles.embeddedStack]}>
      <FormSection
        spacing="none"
        title={t(`screens.${i18nKey}.payment_title`)}
        description={t(`screens.${i18nKey}.payment_title_placeholder`)}
      >
        <TextInput
          placeholder={t(`screens.${i18nKey}.payment_title_placeholder`)}
          value={form.title}
          onChangeText={(title) => setForm((s) => ({ ...s, title }))}
          variant="outlined"
          returnKeyType="next"
        />
      </FormSection>

      <FormSection
        title={t(`screens.${i18nKey}.amount`)}
        description={t(`screens.${i18nKey}.amount_placeholder`)}
      >
        <TextInput
          placeholder={t(`screens.${i18nKey}.amount_placeholder`)}
          keyboardType="numeric"
          value={form.amount}
          onChangeText={(amount) => setForm((s) => ({ ...s, amount }))}
          variant="outlined"
        />
      </FormSection>

      <FormSection
        title={t(`screens.${i18nKey}.months`)}
        description={t(`screens.${i18nKey}.months_placeholder`)}
      >
        <TextInput
          placeholder={t(`screens.${i18nKey}.months_placeholder`)}
          keyboardType="numeric"
          value={form.months}
          onChangeText={(months) => setForm((s) => ({ ...s, months }))}
          variant="outlined"
        />
      </FormSection>

      <FormSection
        title={t(`screens.${i18nKey}.start_date`)}
        description={t(`screens.${i18nKey}.start_date`)}
      >
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
      </FormSection>

      <FormSection
        title={t(`screens.${i18nKey}.category`)}
        description={t(`screens.${i18nKey}.category_placeholder`)}
      >
        <Dropdown
          options={categoryOptions}
          selectedValue={form.categoryId}
          onSelect={(categoryId) => setForm((s) => ({ ...s, categoryId }))}
          placeholder={t(`screens.${i18nKey}.category_placeholder`)}
        />
      </FormSection>

      {!embedded && (
        <View variant="transparent" style={styles.actions}>
          <Button
            title={t('common.buttons.save')}
            onPress={handleSave}
            disabled={!isValid}
            style={styles.fullWidthButton}
          />
        </View>
      )}
    </View>
  );

    if (embedded) {
      return <View variant="transparent" style={styles.container}>{formContent}</View>;
    }

    return (
      <Layout headerComponent={<PageHeader title={t(`screens.${i18nKey}.title`)} showBackButton onBackPress={goBack} />}>
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {formContent}
        </KeyboardAwareScrollView>
      </Layout>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formStack: { gap: 20 },
  embeddedStack: { paddingTop: 12 },
  actions: { marginTop: 12 },
  fullWidthButton: { width: '100%' },
});

AddPaymentScreen.displayName = 'AddPaymentScreen';

export default AddPaymentScreen;
