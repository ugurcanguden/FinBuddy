// CategoryListSection - Kategoriler listesi
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components';
import { useLocale, useCategories } from '@/hooks';
import { Category } from '@/models';
import { CategoryCard } from './CategoryCard';

interface CategoryListSectionProps {
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
}

export const CategoryListSection: React.FC<CategoryListSectionProps> = ({
  onEditCategory,
  onDeleteCategory,
}) => {
  const { t } = useLocale();
  const { 
    categories, 
    loading, 
    error
  } = useCategories();

  // Kategorileri tip göre grupla
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="secondary" size="medium">
          {t('screens.categories.loading')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="error" size="medium">
          {error}
        </Text>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="secondary" size="medium">
          {t('screens.categories.no_categories')}
        </Text>
        <Text variant="secondary" size="small" style={styles.emptySubtext}>
          {t('screens.categories.add_first_category')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.categoriesList}>
      {/* Gider Kategorileri */}
      {expenseCategories.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text variant="primary" size="large" weight="semibold" style={styles.sectionTitle}>
              💸 Gider Kategorileri
            </Text>
          </View>
          {expenseCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={onEditCategory}
              onDelete={onDeleteCategory}
            />
          ))}
        </>
      )}

      {/* Gelir Kategorileri */}
      {incomeCategories.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text variant="primary" size="large" weight="semibold" style={styles.sectionTitle}>
              💰 Gelir Kategorileri
            </Text>
          </View>
          {incomeCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={onEditCategory}
              onDelete={onDeleteCategory}
            />
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesList: {
    gap: 16,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
});
