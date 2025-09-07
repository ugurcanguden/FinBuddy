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
  SafeArea,
  StatusBar,
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
    name: '',
    icon: 'home',
    color: colors.primary
  });
  const [loading, setLoading] = useState(false);

  // Form verilerini başlat
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.custom_name || '',
        icon: category.icon,
        color: category.color
      });
    } else {
      setFormData({
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
    if (!formData.name.trim()) {
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

  return (
    <SafeArea>
      <StatusBar />
      
      {/* Header */}
      <Container variant="surface" padding="small">
        <TouchableOpacity variant="transparent" onPress={onCancel}>
          <Text variant="secondary" size="medium">←</Text>
        </TouchableOpacity>
        <Text variant="primary" size="large" weight="bold">
          {category ? t('screens.categories.edit_category') : t('screens.categories.add_category.title')}
        </Text>
        <View variant="transparent" />
      </Container>

      <ScrollView variant="transparent" showsVerticalScrollIndicator={false}>
        {/* Kategori Adı */}
        <Container variant="surface" padding="medium">
          <Text variant="primary" size="medium" weight="semibold">
            {t('common.labels.name')}
          </Text>
          <TextInput
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder={t('screens.categories.enter_category_name')}
            autoFocus={true}
            returnKeyType="done"
            variant="outlined"
            size="medium"
          />
        </Container>

        {/* İkon Seçimi */}
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

        {/* Renk Seçimi */}
        <Container variant="surface" padding="medium">
          <Text variant="primary" size="medium" weight="semibold">
            {t('screens.categories.category_color')}
          </Text>
          <View variant="transparent">
            {colorOptions.map(renderColorOption)}
          </View>
        </Container>

        {/* Önizleme */}
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
                {formData.name || t('screens.categories.category_name')}
              </Text>
              <Text variant="secondary" size="small">
                {t('screens.categories.preview_description')}
              </Text>
            </View>
          </View>
        </Container>
      </ScrollView>

      {/* Footer */}
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
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary }}
            onPress={handleSave}
            disabled={loading}
          >
            <Text variant="primary" size="medium" weight="semibold">
              {loading ? t('common.buttons.loading') : t('common.buttons.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </Container>
    </SafeArea>
  );
};


export default CategoryForm;
