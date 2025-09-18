// App Navigator - Ana navigasyon bileşeni
import React from 'react';
import { useNavigation } from '@/contexts';
import {
  HomeScreen,
  SettingsScreen,
  CategoriesScreen,
  AddCategoryScreen,
  EditCategoryScreen,
  PaymentsScreen,
  PaymentsHubScreen,
  PaymentDetailsScreen,
  AddPaymentScreen,
  AddEntryScreen,
  IncomesScreen,
  ReportsHubScreen,
  ReportBuilderScreen,
} from '@/screens';
import { SafeArea } from './common';

interface AppNavigatorProps {
  // Tema değişikliği artık SettingsScreen'de yönetiliyor
}

const AppNavigator: React.FC<AppNavigatorProps> = () => {
  const navigation = useNavigation();
  const currentScreen = navigation.currentScreen;
  const currentParams = navigation.getCurrentParams();

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
      case 'addPayment':
        return <AddPaymentScreen />;
      case 'addEntry':
        return <AddEntryScreen />;
      case 'editCategory':
        return <EditCategoryScreen categoryId={currentParams?.categoryId} />;
      case 'payments':
        return <PaymentsScreen/>;
      case 'paymentsHub':
        return <PaymentsHubScreen/>;
      case 'paymentDetails':
        return <PaymentDetailsScreen entryId={currentParams?.entryId}/>;
      case 'transactions':
        return <HomeScreen />;
      case 'accounts':
        return <HomeScreen />;
      case 'reports':
        return <ReportsHubScreen />;
      case 'reportBuilder':
        return <ReportBuilderScreen />;
      case 'incomes':
        return <IncomesScreen/>;
      default:
        return <HomeScreen />;
    }
  }; 
  return <SafeArea>{renderScreen()}</SafeArea>;
};

export default AppNavigator;
