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
  const { colors } = useTheme();

  const activeTab = propActiveTab || currentScreen;

  const getTabContainerStyle = (tabKey: string): ViewStyle => {
    const isActive = activeTab === tabKey;
    return {
      ...styles.tab,
      backgroundColor: isActive ? withAlpha(colors.primary, 0.12) : 'transparent',
      borderWidth: isActive ? 1 : 0,
      borderColor: isActive ? withAlpha(colors.primary, 0.24) : 'transparent',
    };
  };

  const getIconTextStyle = (tabKey: string): TextStyle => {
    const isActive = activeTab === tabKey;
    return {
      ...styles.tabIcon,
      color: isActive ? colors.primary : colors.textSecondary,
    };
  };

  const getLabelTextStyle = (tabKey: string): TextStyle => {
    const isActive = activeTab === tabKey;
    return {
      ...styles.tabLabel,
      color: isActive ? colors.primary : colors.textSecondary,
      fontWeight: isActive ? '700' : '400',
    };
  };

  const containerStyle = useMemo<ViewStyle>(() => {
    return {
      ...styles.container,
      backgroundColor: withAlpha(colors.card, 0.95), // hafif blur etkisi taklidi
      borderTopColor: colors.border,
      opacity:100,
    };
  }, [colors]);

  return (
    <View style={containerStyle}>
      <View style={styles.tabRow}>
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
          style={getTabContainerStyle('add_payment')}
          onPress={() => navigateTo('home')}  
        >
          <Text style={getIconTextStyle('add_payment')}>➕</Text>
          <Text style={getLabelTextStyle('add_payment')}>
            {t('navigation.tabs.add_payment')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getTabContainerStyle('categories')}
          onPress={() => navigateTo('categories')}  
        >
          <Text style={getIconTextStyle('categories')}>📂</Text>
          <Text style={getLabelTextStyle('categories')}>
            {t('navigation.tabs.categories')}
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
            {t('navigation.tabs.settings')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    gap: 2,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export default BottomTabBar;
