// CategoryDistributionSection - Kategori dağılımı bölümü
import React, { useMemo } from 'react';
import { View, Text, Card, GroupedColumnChart } from '@/components';
import type { GroupedDatum } from '@/components/common';
import { useLocale } from '@/hooks';
import { useTheme } from '@/contexts';

interface CategoryDistributionSectionProps {
  byCat: Array<{ category_id: string; total: number }>;
  expenseCategories: Array<{ id: string; name: string; custom_name?: string; is_default: boolean }>;
  formatCurrencyValue: (value: number) => string;
}

const CategoryDistributionSection: React.FC<CategoryDistributionSectionProps> = ({
  byCat,
  expenseCategories,
  formatCurrencyValue
}) => {
  const { t } = useLocale();
  const { colors } = useTheme();

  // Kategori grafik verisi - GroupedColumnChart için
  const categoryGroupedData: GroupedDatum[] = useMemo(() => {
    return byCat.slice(0, 6).map((item) => {
      let categoryName = item.category_id;
      
      // Kategori listesi yüklenmişse ve find fonksiyonu varsa
      if (expenseCategories && Array.isArray(expenseCategories) && expenseCategories.find) {
        const category = expenseCategories.find(cat => cat.id === item.category_id);
        
        if (category) {
          // Eğer varsayılan kategori ise dil karşılığını dene
          if (category.is_default) {
            const translationKey = `screens.categories.default.${category.id.replace('cat_', '')}`;
            const translatedName = t(translationKey);
            
            // Eğer çeviri varsa ve gerçek bir çeviri ise (anahtar değil) kullan
            if (translatedName && translatedName !== translationKey) {
              categoryName = translatedName;
            } else {
              // Çeviri yoksa kategori adını kullan
              categoryName = category.name || item.category_id;
            }
          } else {
            // Kullanıcı oluşturduğu kategori ise custom_name'i kullan, yoksa name'i kullan
            categoryName = category.custom_name || category.name || item.category_id;
          }
        } else {
          // Fallback: basit formatla
          categoryName = item.category_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      } else {
        // Kategori listesi henüz yüklenmemişse basit formatla
        categoryName = item.category_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      return {
        label: categoryName,
        values: {
          [t('screens.reports_hub.total_expense') || 'Gider']: item.total,
        }
      };
    });
  }, [byCat, t, expenseCategories]);

  // Kategori grafik renkleri
  const categoryGroupedColors = useMemo(() => ({
    [t('screens.reports_hub.total_expense') || 'Gider']: colors.danger,
  }), [t, colors]);

  // Kategori toplam bilgileri
  const categorySummaryTotals = useMemo(() => {
    if (!categoryGroupedData.length) return { totalExpense: 0 };
    
    const totalExpense = categoryGroupedData.reduce((acc, category) => {
      const expense = category.values[t('screens.reports_hub.total_expense') || 'Gider'] || 0;
      return acc + expense;
    }, 0);
    
    return { totalExpense };
  }, [categoryGroupedData, t]);

  if (byCat.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 32 }}>
      <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 16 }}>
        {t('screens.reports.category_distribution')}
      </Text>
      
      <View style={{ gap: 16 }}>
        {/* Toplam Bilgi Kartı */}
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Card variant="outlined" padding="small" style={{ flex: 1, minWidth: 100, alignItems: 'center' }}>
            <Text variant="secondary" size="small" style={{ marginBottom: 4, textAlign: 'center' }}>
              {t('screens.reports_hub.total_expense')}
            </Text>
            <Text variant="error" size="medium" weight="bold">
              {formatCurrencyValue(categorySummaryTotals.totalExpense)}
            </Text>
          </Card>
        </View>
        
        {/* Grafik */}
        <Card variant="elevated" padding="medium" style={{ marginTop: 8 }}>
          <GroupedColumnChart
            data={categoryGroupedData}
            colors={categoryGroupedColors}
            height={200}
            barWidth={18}
            barGap={10}
            groupGap={28}
            yTicks={5}
            formatValue={(n) => formatCurrencyValue(n)}
            axisWidth={50}
          />
        </Card>
      </View>
    </View>
  );
};

export default CategoryDistributionSection;
