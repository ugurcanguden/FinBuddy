// Categories Screen - Kategoriler yönetim sayfası
import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useLocale, useCategories } from '@/hooks';
import { useNavigation } from '@/contexts';
import { 
  ScrollView, 
  PageHeader,
  Layout
} from '@/components';
import { Category } from '@/models';
import { 
  CategoryListSection,
  AddCategoryButton
} from './categories/components';

const CategoriesScreen: React.FC = () => {
  const { t } = useLocale();
  const { goBack, navigateTo } = useNavigation();
  const { deleteCategory, getDisplayName } = useCategories();

  const handleEditCategory = (category: Category) => {
    navigateTo('editCategory', { categoryId: category.id });
  };

  const handleAddCategory = () => {
    navigateTo('addCategory');
  };

  const handleDeleteCategory = (category: Category) => {
    const categoryName = getDisplayName(category, t);
    
    Alert.alert(
      t('screens.categories.delete_category'),
      `${categoryName} ${t('screens.categories.delete_category_message')}`,
      [
        { text: t('common.buttons.cancel'), style: 'cancel' },
        { 
          text: t('common.buttons.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert(t('common.messages.delete_success'));
            } catch (error) {
              Alert.alert(t('common.messages.delete_error'));
            }
          }
        }
      ]
    );
  };




  return (
    <Layout
      headerComponent={
        <PageHeader
          title={t('screens.categories.title')}
          showBackButton={true}
          onBackPress={goBack}
        />
      }
    >
      {/* Content */}
      <ScrollView variant="transparent" style={styles.content} showsVerticalScrollIndicator={false}>
        <CategoryListSection
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </ScrollView>

      {/* Sticky Add Button */}
      <AddCategoryButton onAddCategory={handleAddCategory} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

export default CategoriesScreen;
