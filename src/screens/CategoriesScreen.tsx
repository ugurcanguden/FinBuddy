// Categories Screen - Kategoriler yönetim sayfası
import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useLocale } from '@/hooks';
import { useNavigation } from '@/contexts';
import { 
  SafeArea, 
  Container, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  BottomTabBar,
  View
} from '@/components';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const CategoriesScreen: React.FC = () => {
  const { t } = useLocale();
  const { goBack } = useNavigation();

  // Örnek kategoriler
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Kira', icon: 'home', color: '#29382f' },
    { id: '2', name: 'Faturalar', icon: 'receipt_long', color: '#29382f' },
    { id: '3', name: 'Eğitim', icon: 'school', color: '#29382f' },
    { id: '4', name: 'Yemek', icon: 'fastfood', color: '#29382f' },
    { id: '5', name: 'Ulaşım', icon: 'directions_bus', color: '#29382f' },
    { id: '6', name: 'Sağlık', icon: 'favorite', color: '#29382f' },
    { id: '7', name: 'Eğlence', icon: 'movie', color: '#29382f' },
    { id: '8', name: 'Diğer', icon: 'apps', color: '#29382f' },
  ]);


  const getIconStyle = (category: Category) => {
    return {
      backgroundColor: category.color + '20',
      color: category.color,
    };
  };

  const handleEditCategory = (category: Category) => {
    Alert.alert(
      t('screens.categories.edit_category'),
      `${category.name} ${t('screens.categories.edit_category_message')}`,
      [
        { text: t('screens.categories.cancel'), style: 'cancel' },
        { text: t('screens.categories.edit'), onPress: () => console.log('Edit category:', category.id) }
      ]
    );
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      t('screens.categories.delete_category'),
      `${category.name} ${t('screens.categories.delete_category_message')}`,
      [
        { text: t('screens.categories.cancel'), style: 'cancel' },
        { 
          text: t('screens.categories.delete'), 
          style: 'destructive',
          onPress: () => {
            setCategories(categories.filter(cat => cat.id !== category.id));
          }
        }
      ]
    );
  };

  const handleAddCategory = () => {
    Alert.alert(
      t('screens.categories.new_category'),
      t('screens.categories.new_category_message'),
      [{ text: t('screens.categories.ok') }]
    );
  };

  const renderCategory = (category: Category) => (
    <View key={category.id} style={styles.categoryCard}>
      <View style={styles.categoryInfo}>
        <View variant="transparent" style={[styles.categoryIcon, getIconStyle(category)] as any}>
          <Text style={styles.iconText}>{category.icon}</Text>
        </View>
        <Text variant="primary" size="medium">
          {category.name}
        </Text>
      </View>
      <View style={styles.categoryActions}>
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
      </View>
    </View>
  );

  return (
    <SafeArea style={styles.container}>
      <StatusBar />
      
      {/* Header */}
      <Container variant="surface" padding="small" style={styles.header}>
        <TouchableOpacity variant="transparent" style={styles.backButton} onPress={goBack}>
          <Text variant="secondary" size="medium">
            ←
          </Text>
        </TouchableOpacity>
        <Text variant="primary" size="large" weight="bold">
          {t('screens.categories.title')}
        </Text>
        <View style={styles.headerSpacer} />
      </Container>

      {/* Content */}
      <ScrollView variant="transparent" style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesList}>
          {categories.map(renderCategory)}
        </View>
      </ScrollView>

      {/* Add Button */}
      <Container variant="background" padding="medium" style={styles.addButtonContainer}>
        <TouchableOpacity
          variant="primary"
          style={styles.addButton}
          onPress={handleAddCategory}
        >
          <Text variant="primary" size="large">+</Text>
          <Text variant="primary" size="medium" weight="semibold">
            {t('screens.categories.add_category')}
          </Text>
        </TouchableOpacity>
      </Container>

      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </SafeArea>
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
});

export default CategoriesScreen;
