// PageHeader Component - Sayfa başlığı için global component
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
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
  style,
}) => {
  const { colors, tokens } = useTheme();

  const containerStyle = useMemo(
    () => ({
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outline,
      backgroundColor: colors.card,
    }),
    [colors.card, colors.outline, tokens.spacing.lg, tokens.spacing.md],
  );

  const backButtonStyle = useMemo(
    () => ({
      padding: tokens.spacing.xs,
      borderRadius: tokens.radii.sm,
      backgroundColor: colors.cardMuted,
    }),
    [colors.cardMuted, tokens.radii.sm, tokens.spacing.xs],
  );

  const addButtonStyle = useMemo(
    () => ({
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.xs,
      borderRadius: tokens.radii.md,
      backgroundColor: colors.primary,
      ...tokens.shadows.level1,
    }),
    [colors.primary, tokens.radii.md, tokens.shadows.level1, tokens.spacing.md, tokens.spacing.xs],
  );

  return (
    <View variant="surface" style={[containerStyle, tokens.shadows.level1, style]}>
      {/* Sol taraf - Geri butonu veya boşluk */}
      <View variant="transparent" style={{ minWidth: 40 }}>
        {showBackButton && onBackPress ? (
          <TouchableOpacity
            variant="transparent"
            onPress={onBackPress}
            style={backButtonStyle}
          >
            <Text
              variant="secondary"
              size="medium"
              weight="semibold"
              style={{ fontFamily: tokens.typography.headingFamily }}
            >
              ←
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Orta - Başlık */}
      <View variant="transparent" style={{ flex: 1, alignItems: 'center' }}>
        <Text
          variant="primary"
          size="large"
          weight="bold"
          style={{ fontFamily: tokens.typography.headingFamily, letterSpacing: 0.2 }}
        >
          {title}
        </Text>
      </View>

      {/* Sağ taraf - Add butonu, sağ element veya boşluk */}
      <View variant="transparent" style={{ minWidth: 40, alignItems: 'flex-end' }}>
        {showAddButton && onAddPress ? (
          <TouchableOpacity
            variant="primary"
            onPress={onAddPress}
            style={addButtonStyle}
          >
            <Text
              variant="secondary"
              size="small"
              weight="semibold"
              style={{ color: colors.onPrimary, fontFamily: tokens.typography.fontFamily }}
            >
              {addButtonText}
            </Text>
          </TouchableOpacity>
        ) : rightElement || null}
      </View>
    </View>
  );
};

export default PageHeader;
