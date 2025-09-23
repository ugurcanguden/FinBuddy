// Category Form - Kategori ekleme/düzenleme formu
import React, { useState, useEffect, useMemo } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useLocale } from '@/hooks';
import { useTheme } from '@/contexts';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  IconDropdown,
  KeyboardAwareScrollView,
  FormSection,
  Button
} from '@/components';
import { Category, CategoryFormData } from '@/types';

interface CategoryFormProps {
  category?: Category | null;
  onSave: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  visible: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  category, 
  onSave, 
  onCancel, 
  visible 
}) => {
  const { t } = useLocale();
  const { colors } = useTheme();
  const [formData, setFormData] = useState<CategoryFormData>({
    custom_name: '',
    name: '',
    icon: 'home',
    color: colors.primary
  });
  const [loading, setLoading] = useState(false);

  // Form verilerini başlat
  useEffect(() => {
    if (category) {
      setFormData({
        custom_name: category.custom_name || '',
        name: category.name_key || '',
        icon: category.icon,
        color: category.color
      });
    } else {
      setFormData({
        custom_name: '',
        name: '',
        icon: 'home',
        color: colors.primary
      });
    }
  }, [category]);

  // İkon seçenekleri
  const iconOptions = [
    { value: 'home', emoji: '🏠', name: t('screens.categories.icons.home') },
    { value: 'receipt_long', emoji: '🧾', name: t('screens.categories.icons.bills') },
    { value: 'school', emoji: '🎓', name: t('screens.categories.icons.education') },
    { value: 'fastfood', emoji: '🍔', name: t('screens.categories.icons.food') },
    { value: 'directions_bus', emoji: '🚌', name: t('screens.categories.icons.transport') },
    { value: 'favorite', emoji: '❤️', name: t('screens.categories.icons.health') },
    { value: 'movie', emoji: '🎬', name: t('screens.categories.icons.entertainment') },
    { value: 'apps', emoji: '📱', name: t('screens.categories.icons.other') },
    { value: 'shopping_cart', emoji: '🛒', name: t('screens.categories.icons.shopping') },
    { value: 'sports', emoji: '⚽', name: t('screens.categories.icons.sports') },
    { value: 'work', emoji: '💼', name: t('screens.categories.icons.work') },
    { value: 'travel', emoji: '✈️', name: t('screens.categories.icons.travel') },
  ];

  // Renk seçenekleri
  const colorOptions = useMemo(
    () => [
      colors.primary,
      colors.accent,
      colors.success,
      colors.warning,
      colors.info,
      colors.danger,
      '#2ecc71',
      '#8e44ad',
      '#16a085',
      '#f1c40f',
      '#1abc9c',
      '#ff6b6b',
    ],
    [colors]
  );

  const handleSave = async () => {
    if (!formData.custom_name.trim()) {
      Alert.alert(t('common.validation.required'));
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (error) {
      console.error('Save category error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const isValid = formData.custom_name.trim().length >= 3;
  const withAlpha = (hex: string, alpha: number) => {
    const sanitized = hex.replace('#', '');
    if (sanitized.length !== 6) return hex;
    const opacity = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0');
    return `#${sanitized}${opacity}`;
  };

  return (
      <KeyboardAwareScrollView
        variant="transparent"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContainer}
      >
        <View variant="transparent" style={styles.sectionStack}>
          <FormSection
            spacing="none"
            title={t('screens.categories.category_name')}
            description={t('screens.categories.enter_category_name')}
          >
            <View variant="transparent" style={styles.fieldStack}>
              <TextInput
                value={formData.custom_name}
                onChangeText={(text) => setFormData({ ...formData, custom_name: text })}
                placeholder={t('screens.categories.enter_category_name')}
                autoFocus={true}
                returnKeyType="done"
                variant="outlined"
                size="medium"
              />
              <View variant="transparent" style={styles.inlineMeta}>
                <Text variant={isValid ? 'secondary' : 'warning'} size="small">
                  {isValid
                    ? `${formData.custom_name.trim().length || 0}/32`
                    : t('screens.categories.name_required')}
                </Text>
              </View>
            </View>
          </FormSection>

          <FormSection
            title={t('screens.categories.category_icon')}
            description={t('screens.categories.select_icon')}
          >
            <IconDropdown
              options={iconOptions}
              selectedValue={formData.icon}
              onSelect={(value) => setFormData({ ...formData, icon: value })}
              placeholder={t('screens.categories.select_icon')}
            />
          </FormSection>

          <FormSection
            title={t('screens.categories.category_color')}
            description={t('screens.categories.preview_description')}
          >
            <View variant="transparent" style={styles.colorGrid}>
              {colorOptions.map((color) => {
                const isSelected = color === formData.color;
                return (
                  <TouchableOpacity
                    key={color}
                    variant="transparent"
                    onPress={() => setFormData({ ...formData, color })}
                    activeOpacity={0.85}
                    style={[
                      styles.colorSwatch,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: withAlpha(color, 0.12),
                      },
                      isSelected && { transform: [{ scale: 1.02 }] },
                    ]}
                  >
                    <View
                      variant="transparent"
                      style={[
                        styles.colorSwatchInner,
                        {
                          backgroundColor: color,
                          borderColor: isSelected ? colors.background : 'transparent',
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormSection>

          <FormSection
            title={t('screens.categories.preview')}
            description={t('screens.categories.preview_description')}
          >
            <View variant="transparent" style={[styles.previewCard, { borderColor: colors.border }] as any}>
              <View
                variant="transparent"
                style={[
                  styles.previewIcon,
                  { backgroundColor: withAlpha(formData.color, 0.2) },
                ]}
              >
                <Text style={styles.previewEmoji}>
                  {iconOptions.find((opt) => opt.value === formData.icon)?.emoji || '🏠'}
                </Text>
              </View>
              <View variant="transparent" style={styles.previewText}>
                <Text variant="primary" size="medium" weight="semibold">
                  {formData.custom_name.trim() || t('screens.categories.category_name')}
                </Text>
                <Text variant="secondary" size="small">
                  {t('screens.categories.preview_description')}
                </Text>
              </View>
            </View>
          </FormSection>
        </View>

        <View variant="transparent" style={styles.actionBar}>
          <View variant="transparent" style={styles.actionRow}>
            <Button
              title={t('common.buttons.cancel')}
              variant="secondary"
              onPress={onCancel}
              style={{ flex: 1 }}
            />
            <Button
              title={loading ? t('common.buttons.loading') : t('common.buttons.save')}
              onPress={handleSave}
              disabled={loading || !isValid}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

  );
};


export default CategoryForm;

const styles = StyleSheet.create({
  formContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
  },
  sectionStack: {
    flex: 1,
    gap: 20,
  },
  fieldStack: {
    gap: 8,
  },
  inlineMeta: {
    alignItems: 'flex-end',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  colorSwatchInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: {
    fontSize: 28,
  },
  previewText: {
    flex: 1,
    gap: 4,
  },
  actionBar: {
    marginTop: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
