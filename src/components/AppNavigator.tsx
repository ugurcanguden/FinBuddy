// App Navigator - Ana navigasyon bileşeni
import React from 'react';
import { useNavigation } from '@/contexts';
import { HomeScreen, SettingsScreen, CategoriesScreen, AddCategoryScreen, EditCategoryScreen } from '@/screens';
import { SafeArea } from './common';

interface AppNavigatorProps {
  // Tema değişikliği artık SettingsScreen'de yönetiliyor
}

const AppNavigator: React.FC<AppNavigatorProps> = () => {
  const { currentScreen, currentParams } = useNavigation();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'addCategory':
        return <AddCategoryScreen />;
      case 'editCategory':
        return <EditCategoryScreen categoryId={currentParams?.categoryId} />;
      case 'transactions':
        return <HomeScreen />;
      case 'accounts':
        return <HomeScreen />;
      case 'reports':
        return <HomeScreen />;
      default:
        return <HomeScreen />;
    }
  }; 
  return <SafeArea>{renderScreen()}</SafeArea>;
};

export default AppNavigator;
