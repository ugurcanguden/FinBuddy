// Categories Screen - Kategoriler yönetim sayfası
import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useLocale, useCategories } from '@/hooks';
import { useNavigation } from '@/contexts';
import { 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  View,
  PageHeader,
  Layout
} from '@/components';
import { Category } from '@/types';
import { useTheme } from '@/contexts';

const CategoriesScreen: React.FC = () => {
  const { t } = useLocale();
  const { goBack, navigateTo } = useNavigation();
  const { colors } = useTheme();
  const { 
    categories, 
    loading, 
    error, 
    deleteCategory, 
    getDisplayName 
  } = useCategories();


  const getIconStyle = (category: Category) => {
    return {
      backgroundColor: category.color + '20',
      color: category.color,
    };
  };

  const getIconUnicode = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      'home': '🏠',
      'receipt_long': '🧾',
      'school': '🎓',
      'fastfood': '🍔',
      'directions_bus': '🚌',
      'favorite': '❤️',
      'movie': '🎬',
      'apps': '📱',
    };
    return iconMap[iconName] || '📁';
  };

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
        {loading ? (
          <View variant="transparent" style={styles.loadingContainer}>
            <Text variant="secondary" size="medium">
              {t('screens.categories.loading')}
            </Text>
          </View>
        ) : error ? (
          <View variant="transparent" style={styles.errorContainer}>
            <Text variant="error" size="medium">
              {error}
            </Text>
          </View>
        ) : categories.length === 0 ? (
          <View variant="transparent" style={styles.emptyContainer}>
            <Text variant="secondary" size="medium">
              {t('screens.categories.no_categories')}
            </Text>
            <Text variant="secondary" size="small" style={styles.emptySubtext}>
              {t('screens.categories.add_first_category')}
            </Text>
          </View>
        ) : (
          <View variant="transparent" style={styles.categoriesList}>
            {categories.map((category) => (
              <View key={category.id} variant="surface" style={[styles.categoryCard, { borderColor: colors.border }] as any}>
                <View variant="transparent" style={styles.categoryInfo}>
                  <View variant="transparent" style={[styles.categoryIcon, getIconStyle(category)] as any}>
                    <Text style={[styles.iconText, { color: category.color }] as any}>
                      {getIconUnicode(category.icon)}
                    </Text>
                  </View>
                  <View variant="transparent" style={styles.categoryTextContainer}>
                    <Text variant="primary" size="medium" weight="medium">
                      {getDisplayName(category, t)}
                    </Text>
                    {category.is_default && (
                      <Text variant="secondary" size="small" style={styles.defaultLabel}>
                        {t('screens.categories.default_category')}
                      </Text>
                    )}
                  </View>
                </View>
                <View variant="transparent" style={styles.categoryActions}>
                  {!category.is_default && (
                    <>
                      <TouchableOpacity
                        variant="transparent"
                        style={styles.actionButton}
                        onPress={() => handleEditCategory(category)}
                      >
                        <Text variant="secondary" size="medium">
                          {t('screens.categories.edit')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        variant="transparent"
                        style={styles.actionButton}
                        onPress={() => handleDeleteCategory(category)}
                      >
                        <Text variant="secondary" size="medium">
                          {t('screens.categories.delete')}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Add Button (tasarımla uyumlu) */}
      <View variant="transparent" style={styles.addButtonContainer}>
        <TouchableOpacity
          variant="transparent"
          style={[styles.addButton, { backgroundColor: colors.primary }] as any}
          onPress={handleAddCategory}
          activeOpacity={0.9}
        >
          <Text style={[styles.addButtonIcon] as any}>＋</Text>
          <Text style={[styles.addButtonText, { color: colors.onPrimary }] as any}>
            {t('screens.categories.add_category.title')}
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    fontFamily: 'MaterialSymbolsOutlined',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  categoriesList: {
    gap: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  defaultLabel: {
    marginTop: 2,
    fontStyle: 'italic',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
    fontFamily: 'MaterialSymbolsOutlined',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 20,
    fontFamily: 'MaterialSymbolsOutlined',
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
  },
  addButtonIcon: {
    fontSize: 20,
    fontFamily: 'MaterialSymbolsOutlined',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
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

export default CategoriesScreen;
