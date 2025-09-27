// Edit Category Screen - Kategori düzenleme sayfası
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useLocale, useCategories } from '@/hooks';
import { useNavigation } from '@/contexts';
import { 
  Text, 
  View,
  CategoryForm,
  PageHeader,
  Layout
} from '@/components';
import { Category, CategoryFormData } from '@/models';

interface EditCategoryScreenProps {
  categoryId: string;
}

const EditCategoryScreen: React.FC<EditCategoryScreenProps> = ({ categoryId }) => {
  const { t } = useLocale();
  const { goBack } = useNavigation();
  const { 
    categories, 
    updateCategory,
    getCategoryById
  } = useCategories();

  // Form state'leri
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => { 
    const loadCategory = async () => {
      try {
        const foundCategory = await getCategoryById(categoryId);
        if (foundCategory) {
          setCategory(foundCategory);
        } else {
          Alert.alert(
            t('common.error'),
            t('common.messages.not_found'),
            [{ text: t('common.buttons.ok'), onPress: goBack }]
          );
        }
      } catch (error) {
        Alert.alert(
          t('common.error'),
          t('common.messages.not_found'),
          [{ text: t('common.buttons.ok'), onPress: goBack }]
        );
      }
    };
    loadCategory();
  }, [categoryId, categories, t, goBack]);

  const handleSave = async (formData: CategoryFormData) => {
    if (!category) return;

    try {
      await updateCategory(category.id, formData);
      
      Alert.alert(
        t('common.messages.update_success'),
        t('common.messages.updated'),
        [
          {
            text: t('common.buttons.ok'),
            onPress: goBack
          }
        ]
      );
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      Alert.alert(
        t('common.error'),
        t('common.messages.update_error')
      );
    }
  };

  const handleCancel = () => {
    goBack();
  };

  if (!category) {
    return (
      <Layout
        headerComponent={
        <PageHeader
          title={t('screens.categories.edit_category.title')}
          showBackButton={true}
          onBackPress={goBack}
        />
        }
        keyboardAvoidingView={false}
      >
        <View variant="transparent" style={styles.loadingContainer}>
          <Text variant="secondary" size="medium">
            {t('screens.categories.loading')}
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout
      headerComponent={
        <PageHeader
          title={t('screens.categories.edit_category.title')}
          showBackButton={true}
          onBackPress={goBack}
        />
      }
      keyboardAvoidingView={false}
    >
      <CategoryForm
        category={category}
        onSave={handleSave}
        onCancel={handleCancel}
        visible={true}
      />
    </Layout>
  );
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
};

export default EditCategoryScreen;
