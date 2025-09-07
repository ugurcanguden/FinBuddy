// App Navigator - Ana navigasyon bileşeni
import React from 'react';
import { useNavigation, useTheme } from '@/contexts';
import HomeScreen from '@/screens/HomeScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import CategoriesScreen from '@/screens/CategoriesScreen';
import { SafeArea } from './common';

interface AppNavigatorProps {
  // Tema değişikliği artık SettingsScreen'de yönetiliyor
}

const AppNavigator: React.FC<AppNavigatorProps> = () => {
  const { currentScreen } = useNavigation();


  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'transactions':
        return <HomeScreen />;
      case 'accounts':
        return <HomeScreen />;
      case 'reports':
        return <HomeScreen />;
      case 'categories':
        return <CategoriesScreen />;
      default:
        return <HomeScreen />;
    }
  }; 
  return <SafeArea>{renderScreen()}</SafeArea>;
};

export default AppNavigator;
