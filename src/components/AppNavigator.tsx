// App Navigator - Ana navigasyon bileşeni
import React from 'react';
import { useNavigation } from '@/contexts';
import { loggerService } from '@/services';
import {
  SplashScreen,
  HomeScreen,
  SettingsScreen,
  ProfileScreen,
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
  InitialSetupScreen,
  PrivacyTermsScreen,
  UIDemoScreen,
  DebugScreen,
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
      case 'splash':
        return <SplashScreen onAnimationComplete={async () => {
          loggerService.info('Splash animation completed', {
            screen: 'SplashScreen',
            action: 'animation_complete'
          });
          
          // İlk kurulum kontrolü
          const { storageService } = await import('@/services');
          const { STORAGE_KEYS } = await import('@/constants');
          const { PRIVACY_TERMS_ACCEPTED_KEY, PRIVACY_TERMS_VERSION_KEY, PRIVACY_TERMS_VERSION } = await import('@/constants/legal/privacy-terms');
          
          const initialSetupCompleted = await storageService.get<boolean>(STORAGE_KEYS.INITIAL_SETUP_COMPLETED);
          const onboardingCompleted = await storageService.get<boolean>('onboarding_completed');
          const privacyTermsAccepted = await storageService.get<boolean>(PRIVACY_TERMS_ACCEPTED_KEY);
          const privacyTermsVersion = await storageService.get<string>(PRIVACY_TERMS_VERSION_KEY);
          
          loggerService.info('Setup status check', {
            screen: 'AppNavigator',
            action: 'setup_check',
            initialSetupCompleted,
            onboardingCompleted,
            privacyTermsAccepted,
            privacyTermsVersion
          });
          
          // Gizlilik politikası kontrolü
          if (!privacyTermsAccepted || privacyTermsVersion !== PRIVACY_TERMS_VERSION) {
            loggerService.navigation('splash', 'privacyTermsInitial');
            navigation.navigateTo('privacyTermsInitial');
          } else if (!initialSetupCompleted) {
            loggerService.navigation('splash', 'initialSetup');
            navigation.navigateTo('initialSetup');
          } else if (!onboardingCompleted) {
            loggerService.navigation('splash', 'onboarding');
            navigation.navigateTo('onboarding');
          } else {
            loggerService.navigation('splash', 'home');
            navigation.navigateTo('home');
          }
        }} />;
      case 'initialSetup':
        return <InitialSetupScreen />;
      case 'privacyTerms':
        return <PrivacyTermsScreen fromSettings={true} />;
      case 'privacyTermsInitial':
        return <PrivacyTermsScreen fromSettings={false} />;
      case 'onboarding':
        return <HomeScreen />; // OnboardingScreen henüz yok, geçici olarak HomeScreen
      case 'home':
        return <HomeScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'addCategory':
        return <AddCategoryScreen />;
      case 'addPayment':
        return <AddPaymentScreen />;
      case 'addEntry':
        return <AddEntryScreen type={currentParams?.['type'] as 'expense' | 'income'} />;
      case 'editCategory':
        return <EditCategoryScreen categoryId={currentParams?.['categoryId'] as string} />;
      case 'payments':
        return <PaymentsScreen/>;
      case 'paymentsHub':
        return <PaymentsHubScreen/>;
      case 'paymentDetails':
        return <PaymentDetailsScreen entryId={currentParams?.['entryId'] as string}/>;
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
      case 'uiDemo':
        return <UIDemoScreen />;
      case 'debug':
        return <DebugScreen />;
      default:
        return <HomeScreen />;
    }
  }; 
  // InitialSetupScreen ve PrivacyTermsScreen için SafeArea kullanma
  if (currentScreen === 'initialSetup' || currentScreen === 'privacyTerms') {
    return renderScreen();
  }
  
  return <SafeArea>{renderScreen()}</SafeArea>;
};

export default AppNavigator;
