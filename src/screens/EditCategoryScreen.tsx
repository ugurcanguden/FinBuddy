// Edit Category Screen - Kategori düzenleme sayfası
import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useLocale, useCategories } from '@/hooks';
import { useNavigation } from '@/contexts';
import { 
  Container, 
  Text, 
  ScrollView, 
  View,
  CategoryForm,
  PageHeader,
  Layout
} from '@/components';
import { Category, CategoryFormData } from '@/types';

interface EditCategoryScreenProps {
  categoryId?: string;
}

const EditCategoryScreen: React.FC<EditCategoryScreenProps> = ({ categoryId }) => {
  const { t } = useLocale();
  const { goBack } = useNavigation();
  const { 
    categories, 
    updateCategory
  } = useCategories();

  // Form state'leri
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!categoryId) {
      Alert.alert(
        t('common.error'),
        t('common.messages.not_found'),
        [{ text: t('common.buttons.ok'), onPress: goBack }]
      );
      return;
    }

    const foundCategory = categories.find(cat => cat.id === categoryId);
    if (foundCategory) {
      setCategory(foundCategory);
    } else {
      Alert.alert(
        t('common.error'),
        t('common.messages.not_found'),
        [{ text: t('common.buttons.ok'), onPress: goBack }]
      );
    }
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
    >
      <ScrollView variant="transparent" style={styles.content} showsVerticalScrollIndicator={false}>
        <Container variant="background" padding="medium" style={styles.formContainer}>
          <CategoryForm
            category={category}
            onSave={handleSave}
            onCancel={handleCancel}
            visible={true}
          />
        </Container>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  formContainer: {
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default EditCategoryScreen;
