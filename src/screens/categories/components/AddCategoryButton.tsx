// AddCategoryButton - Kategori ekleme butonu
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View, TouchableOpacity } from '@/components';
import { useTheme } from '@/contexts';
import { useLocale } from '@/hooks';

interface AddCategoryButtonProps {
  onAddCategory: () => void;
}

export const AddCategoryButton: React.FC<AddCategoryButtonProps> = ({
  onAddCategory,
}) => {
  const { t } = useLocale();
  const { colors } = useTheme();

  return (
    <View style={styles.addButtonContainer}>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={onAddCategory}
        activeOpacity={0.9}
      >
        <Text style={styles.addButtonIcon}>＋</Text>
        <Text style={[styles.addButtonText, { color: colors.onPrimary }] as any}>
          {t('screens.categories.add_category.title')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
