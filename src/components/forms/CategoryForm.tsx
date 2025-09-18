// Category Form - Kategori ekleme/düzenleme formu
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useLocale } from '@/hooks';
import { useTheme } from '@/contexts';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  Container,
  ScrollView,
  IconDropdown
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
  const colorOptions = [
    colors.primary, colors.danger, colors.info, colors.warning,
    colors.accent, colors.success, colors.text, colors.textSecondary,
    '#2ecc71', '#8e44ad', '#16a085', '#f1c40f'
  ];

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


  const renderColorOption = (color: string) => (
    <TouchableOpacity
      key={color}
      onPress={() => setFormData({ ...formData, color })}
    >
      <View variant="transparent" />
    </TouchableOpacity>
  );

  if (!visible) return null;

  const isValid = formData.custom_name.trim().length >= 3;

  return (
      <ScrollView variant="transparent" showsVerticalScrollIndicator={false}>
        
        <Container variant="surface" padding="medium">
          <Text variant="primary" size="medium" weight="semibold">
            {t('common.labels.name')}
          </Text>
          <TextInput
            value={formData.custom_name}
            onChangeText={(text) => setFormData({ ...formData, custom_name: text })}
            placeholder={t('screens.categories.enter_category_name')}
            autoFocus={true}
            returnKeyType="done"
            variant="outlined"
            size="medium"
          />
          {!isValid && (
            <Text variant="warning" size="small" style={{ marginTop: 6 }}>
              {t('screens.categories.name_required')}
            </Text>
          )}
        </Container>
 
        <Container variant="surface" padding="medium">
          <Text variant="primary" size="medium" weight="semibold">
            {t('screens.categories.category_icon')}
          </Text>
          <IconDropdown
            options={iconOptions}
            selectedValue={formData.icon}
            onSelect={(value) => setFormData({ ...formData, icon: value })}
            placeholder={t('screens.categories.select_icon')}
          />
        </Container>
 
        <Container variant="surface" padding="medium">
          <Text variant="primary" size="medium" weight="semibold">
            {t('screens.categories.category_color')}
          </Text>
          <View variant="transparent" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
            {colorOptions.map((color, idx) => (
              <TouchableOpacity
                key={`${color}-${idx}`}
                variant="transparent"
                onPress={() => setFormData({ ...formData, color })}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: formData.color === color ? 2 : 1,
                  borderColor: formData.color === color ? colors.primary : colors.border,
                  backgroundColor: color + '20',
                }}
              >
                <View variant="transparent" style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: color }} />
              </TouchableOpacity>
            ))}
          </View>
        </Container>
 
        <Container variant="surface" padding="medium">
          <Text variant="primary" size="medium" weight="semibold">
            {t('screens.categories.preview')}
          </Text>
          <View variant="transparent" style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            padding: 16, 
            borderRadius: 12, 
            backgroundColor: colors.card,
            marginTop: 12,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <View variant="transparent" style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
              backgroundColor: formData.color + '20'
            }}>
              <Text style={{ fontSize: 24 }}>
                {iconOptions.find(opt => opt.value === formData.icon)?.emoji || '🏠'}
              </Text>
            </View>
            <View variant="transparent" style={{ flex: 1 }}>
              <Text variant="primary" size="medium" weight="medium">
                {formData.custom_name || t('screens.categories.category_name')}
              </Text>
              <Text variant="secondary" size="small">
                {t('screens.categories.preview_description')}
              </Text>
            </View>
          </View>
        </Container>

      <Container variant="background" padding="medium">
        <View variant="transparent" style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            variant="transparent"
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
            onPress={onCancel}
          >
            <Text variant="secondary" size="medium" weight="semibold">
              {t('common.buttons.cancel')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            variant="primary"
            style={{ 
              flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', 
              backgroundColor: isValid ? colors.primary : colors.border 
            }}
            onPress={handleSave}
            disabled={loading || !isValid}
          >
            <Text weight="semibold" style={{ color: colors.onPrimary }}>
              {loading ? t('common.buttons.loading') : t('common.buttons.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </Container>        
      </ScrollView> 

  );
};


export default CategoryForm;
