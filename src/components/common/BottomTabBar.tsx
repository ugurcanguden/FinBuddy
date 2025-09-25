// Bottom Tab Bar Component - Alt navigasyon bileşeni (theme-ready)
import React, { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useLocale } from '@/hooks';
import { useNavigation } from '@/contexts';
import { useTheme } from '@/contexts';
import { View, Text, TouchableOpacity } from '@/components';

export interface BottomTabBarProps {
  activeTab?: string; // opsiyonel — yoksa context'ten alınır
}

// 6-haneli hex'e alfa eklemek için küçük yardımcı (örn: #38e07b + 0.12)
const withAlpha = (hex: string, alpha: number) => {
  // alpha 0..1 -> 00..FF
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  // #RRGGBB(AA) formatı
  return hex.length === 7 ? `${hex}${a}` : hex;
};

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab: propActiveTab }) => {
  const { t } = useLocale();
  const { currentScreen, navigateTo } = useNavigation();
  const { colors, tokens } = useTheme();

  const activeTab = propActiveTab || currentScreen;

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.outline,
      backgroundColor: colors.cardMuted,
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.lg,
      ...tokens.shadows.level1,
    }),
    [colors.cardMuted, colors.outline, tokens.shadows.level1, tokens.spacing.lg, tokens.spacing.sm],
  );

  const tabRowStyle = useMemo<ViewStyle>(() => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: tokens.spacing.sm,
  }), [tokens.spacing.sm]);

  const baseTabStyle = useMemo<ViewStyle>(() => ({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xs,
    borderRadius: tokens.radii.md,
    gap: 4,
  }), [tokens.radii.md, tokens.spacing.sm, tokens.spacing.xs]);

  const iconBaseStyle = useMemo<TextStyle>(() => ({
    fontSize: tokens.typography.sizes.lg,
    marginBottom: 2,
  }), [tokens.typography.sizes.lg]);

  const labelBaseStyle = useMemo<TextStyle>(() => ({
    fontSize: tokens.typography.sizes.xs + 1,
    textAlign: 'center' as const,
    fontFamily: tokens.typography.fontFamily,
  }), [tokens.typography.fontFamily, tokens.typography.sizes.xs]);

  const fabSize = useMemo(() => tokens.spacing.xxl + tokens.spacing.xl, [tokens.spacing.xl, tokens.spacing.xxl]);

  const getTabContainerStyle = (tabKey: string): ViewStyle => {
    const isActive = activeTab === tabKey;
    const activeShadow: ViewStyle | undefined = isActive
      ? {
          shadowColor: colors.primary,
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 4,
        }
      : undefined;

    return {
      ...baseTabStyle,
      backgroundColor: isActive ? withAlpha(colors.primary, 0.18) : colors.card,
      borderWidth: isActive ? 1 : StyleSheet.hairlineWidth,
      borderColor: isActive ? withAlpha(colors.primary, 0.35) : colors.border,
      transform: isActive ? [{ translateY: -2 }] : undefined,
      ...(activeShadow ?? {}),
    };
  };

  const getIconTextStyle = (tabKey: string): TextStyle => ({
    ...iconBaseStyle,
    color: activeTab === tabKey ? colors.primary : colors.textSecondary,
  });

  const getLabelTextStyle = (tabKey: string): TextStyle => ({
    ...labelBaseStyle,
    color: activeTab === tabKey ? colors.primary : colors.textSecondary,
    fontWeight: activeTab === tabKey ? '700' : '500',
  });

  return (
    <View style={containerStyle}>
      <View style={tabRowStyle}>
        <TouchableOpacity
          style={getTabContainerStyle('home')}
          onPress={() => navigateTo('home')}
        >
          <Text style={getIconTextStyle('home')}>🏠</Text>
          <Text style={getLabelTextStyle('home')}>
            {t('navigation.tabs.home')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getTabContainerStyle('payments')}
          onPress={() => navigateTo('payments')}  
        >
          <Text style={getIconTextStyle('payments')}>💸</Text>
          <Text style={getLabelTextStyle('payments')}>
            Ödemeler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getTabContainerStyle('incomes')}
          onPress={() => navigateTo('incomes')}  
        >
          <Text style={getIconTextStyle('incomes')}>💰</Text>
          <Text style={getLabelTextStyle('incomes')}>
            Gelirler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getTabContainerStyle('reports')}
          onPress={() => navigateTo('reports')} 
        >
          <Text style={getIconTextStyle('reports')}>📊</Text>
          <Text style={getLabelTextStyle('reports')}>
            {t('navigation.tabs.reports')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getTabContainerStyle('settings')}
          onPress={() => navigateTo('settings')}  
        >
          <Text style={getIconTextStyle('settings')}>⚙️</Text>
          <Text style={getLabelTextStyle('settings')}>
            {t('navigation.tabs.settings') || 'Ayarlar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating central action */}
      <TouchableOpacity
        variant="primary"
        onPress={() => navigateTo('addEntry', { type: 'expense' })}
        style={{
          position: 'absolute',
          alignSelf: 'center',
          top: -fabSize / 2 - 8, // Biraz daha yukarı taşıdık
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          borderWidth: 2,
          borderColor: withAlpha(colors.primary, 0.32),
          ...tokens.shadows.level2,
        }}
      >
        <Text style={{ color: colors.onPrimary, fontSize: 28, lineHeight: 28 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomTabBar;
