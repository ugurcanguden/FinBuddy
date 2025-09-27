// Add Category Screen - Yeni kategori ekleme sayfası
import React from 'react';
import { Alert } from 'react-native';
import { useLocale, useCategories } from '@/hooks';
import { useNavigation } from '@/contexts';
import {
  CategoryForm,
  PageHeader,
  Layout
} from '@/components';
import { CategoryFormData } from '@/models';

const AddCategoryScreen: React.FC = () => {
  const { t } = useLocale();
  const { goBack } = useNavigation();
  const { createCategory } = useCategories();


  const handleSave = async (formData: CategoryFormData) => {
    try {
      await createCategory(formData);
      
      Alert.alert(
        t('common.messages.create_success'),
        t('common.messages.created'),
        [
          {
            text: t('common.buttons.ok'),
            onPress: goBack
          }
        ]
      );
    } catch (error) {
      console.error('Kategori oluşturma hatası:', error);
      Alert.alert(
        t('common.error'),
        t('common.messages.create_error')
      );
    }
  };

  const handleCancel = () => {
    goBack();
  };

  return (
    <Layout
      headerComponent={
        <PageHeader
          title={t('screens.categories.add_category.title')}
          showBackButton={true}
          onBackPress={goBack}
        />
      }
    >
      <CategoryForm
        category={null}
        onSave={handleSave}
        onCancel={handleCancel}
        visible={true}
      />
    </Layout>
  );
};


export default AddCategoryScreen;
