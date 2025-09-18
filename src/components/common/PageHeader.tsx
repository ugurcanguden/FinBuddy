// PageHeader Component - Sayfa başlığı için global component
import React from 'react';
import { View, Text, TouchableOpacity } from '@/components';
import { useTheme } from '@/contexts';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  showAddButton?: boolean;
  onAddPress?: () => void;
  addButtonText?: string;
  style?: any;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightElement,
  showAddButton = false,
  onAddPress,
  addButtonText = "+",
  style
}) => {
  const { colors } = useTheme();

  return (
    <View 
      variant="surface" 
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        style
      ]}
    >
      {/* Sol taraf - Geri butonu veya boşluk */}
      <View variant="transparent" style={{ minWidth: 40 }}>
        {showBackButton && onBackPress ? (
          <TouchableOpacity 
            variant="transparent" 
            onPress={onBackPress}
            style={{ padding: 4 }}
          >
            <Text variant="secondary" size="medium">←</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Orta - Başlık */}
      <View variant="transparent" style={{ flex: 1, alignItems: 'center' }}>
        <Text variant="primary" size="large" weight="bold">
          {title}
        </Text>
      </View>

      {/* Sağ taraf - Add butonu, sağ element veya boşluk */}
      <View variant="transparent" style={{ minWidth: 40, alignItems: 'flex-end' }}>
        {showAddButton && onAddPress ? (
          <TouchableOpacity 
            variant="primary" 
            onPress={onAddPress}
            style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 6,
              backgroundColor: colors.primary
            }}
          >
            <Text variant="secondary" size="small" weight="semibold" style={{ color: colors.onPrimary }}>
              {addButtonText}
            </Text>
          </TouchableOpacity>
        ) : rightElement || null}
      </View>
    </View>
  );
};

export default PageHeader;
