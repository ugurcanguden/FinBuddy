// CategoryCard - Tekil kategori kartı
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View, TouchableOpacity } from '@/components';
import { useTheme } from '@/contexts';
import { useLocale, useCategories } from '@/hooks';
import { Category } from '@/models';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  const { t } = useLocale();
  const { colors } = useTheme();
  const { getDisplayName } = useCategories();

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
      'shopping_cart': '🛒',
      'apps': '📱',
      'work': '💼',
      'laptop': '💻',
      'trending_up': '📈',
      'card_giftcard': '🎁',
      'home_work': '🏢',
      'business': '🏢',
      'attach_money': '💰',
    };
    return iconMap[iconName] || '📁';
  };

  return (
    <View style={[styles.categoryCard, { borderColor: colors.border }]}>
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryIcon, getIconStyle(category)]}>
          <Text style={[styles.iconText, { color: category.color }] as any}>
            {getIconUnicode(category.icon)}
          </Text>
        </View>
        <View style={styles.categoryTextContainer}>
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
      <View style={styles.categoryActions}>
        {!category.is_default && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(category)}
            >
              <Text variant="secondary" size="medium">
                {t('screens.categories.edit')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(category)}
            >
              <Text variant="secondary" size="medium">
                {t('screens.categories.delete')}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});
