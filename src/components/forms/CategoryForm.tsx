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
  Button,
  RadioButton
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
    color: colors.primary,
    type: 'expense'
  });
  const [loading, setLoading] = useState(false);

  // Form verilerini başlat
  useEffect(() => {
    if (category) {
      setFormData({
        custom_name: category.custom_name || '',
        name: category.name_key || '',
        icon: category.icon,
        color: category.color,
        type: category.type
      });
    } else {
      setFormData({
        custom_name: '',
        name: '',
        icon: 'home',
        color: colors.primary,
        type: 'expense'
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
    { value: 'shopping_cart', emoji: '🛒', name: t('screens.categories.icons.shopping') },
    { value: 'apps', emoji: '📱', name: t('screens.categories.icons.other') },
    { value: 'work', emoji: '💼', name: t('screens.categories.icons.work') },
    { value: 'laptop', emoji: '💻', name: t('screens.categories.icons.laptop') },
    { value: 'trending_up', emoji: '📈', name: t('screens.categories.icons.trending_up') },
    { value: 'card_giftcard', emoji: '🎁', name: t('screens.categories.icons.card_giftcard') },
    { value: 'home_work', emoji: '🏢', name: t('screens.categories.icons.home_work') },
    { value: 'business', emoji: '🏢', name: t('screens.categories.icons.business') },
    { value: 'attach_money', emoji: '💰', name: t('screens.categories.icons.attach_money') },
    { value: 'sports', emoji: '⚽', name: t('screens.categories.icons.sports') },
    { value: 'travel', emoji: '✈️', name: t('screens.categories.icons.travel') },
  ];

  // Renk seçenekleri
  const colorOptions = useMemo(
    () => [
      '#E74C3C', // Kırmızı
      '#C0392B', // Koyu kırmızı
      '#8E44AD', // Mor
      '#E67E22', // Turuncu
      '#3498DB', // Mavi
      '#E91E63', // Pembe
      '#9B59B6', // Açık mor
      '#F39C12', // Sarı
      '#95A5A6', // Gri
      '#27AE60', // Yeşil
      '#2ECC71', // Açık yeşil
      '#16A085', // Teal
      '#1ABC9C', // Turkuaz
      '#58D68D', // Açık yeşil
      '#48C9B0', // Mavi-yeşil
      '#7DCEA0', // Pastel yeşil
    ],
    []
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
    <View variant="transparent" style={styles.container}>
      <KeyboardAwareScrollView
        variant="transparent"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
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
            title="Kategori Tipi"
            description="Bu kategori gider mi, gelir mi?"
          >
            <RadioButton
              options={[
                { value: 'expense', label: 'Gider', description: 'Harcama kategorisi' },
                { value: 'income', label: 'Gelir', description: 'Gelir kategorisi' }
              ]}
              selectedValue={formData.type}
              onSelect={(value) => setFormData({ ...formData, type: value as 'expense' | 'income' })}
            />
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
      </KeyboardAwareScrollView>

      {/* Sabit buton alanı */}
      <View variant="transparent" style={[styles.actionBar, { backgroundColor: colors.background }]}>
        <View variant="transparent" style={styles.actionRow}>
          <Button
            title={t('common.buttons.cancel')}
            variant="secondary"
            onPress={onCancel}
            style={styles.actionButton}
          />
          <Button
            title={loading ? t('common.buttons.loading') : t('common.buttons.save')}
            onPress={handleSave}
            disabled={loading || !isValid}
            style={styles.actionButton}
          />
        </View>
      </View>
    </View>
  );
};


export default CategoryForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100, // Buton alanı için boşluk
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Safe area için
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center', // Butonları ortalayalım
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    maxWidth: 400, // Maksimum genişlik sınırı
    width: '100%',
    justifyContent: 'center', // İçerideki butonları ortalayalım
  },
  actionButton: {
    flex: 1,
    minWidth: 120, // Minimum buton genişliği
  },
});
