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
  OnboardingTourScreen,
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
          const lastAppVersion = await storageService.get<string>('last_app_version');
          const currentAppVersion = '1.0.0'; // app.json'dan alınabilir
          
          console.log('🔍 Setup status check:', {
            initialSetupCompleted,
            onboardingCompleted,
            privacyTermsAccepted,
            privacyTermsVersion,
            lastAppVersion,
            currentAppVersion,
            isNewVersion: lastAppVersion !== currentAppVersion
          });
          
          // Yeni versiyon kontrolü - tour göster
          const isNewVersion = lastAppVersion !== currentAppVersion;
          if (isNewVersion) {
            await storageService.set('last_app_version', currentAppVersion);
            // Yeni versiyon için flag'leri sıfırla
            await storageService.set('onboarding_completed', false);
            await storageService.set(STORAGE_KEYS.INITIAL_SETUP_COMPLETED, false);
            console.log('New app version detected, flags reset', {
              lastAppVersion,
              currentAppVersion
            });
          }
          
          // Gizlilik politikası kontrolü
          if (!privacyTermsAccepted || privacyTermsVersion !== PRIVACY_TERMS_VERSION) {
            console.log('🔍 Navigating to privacy terms');
            navigation.navigateTo('privacyTermsInitial');
          } else if (!initialSetupCompleted) {
            console.log('🔍 Navigating to initial setup');
            navigation.navigateTo('initialSetup');
          } else {
            console.log('🔍 Navigating to home (tour check will happen there)');
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
        return <OnboardingTourScreen onComplete={() => {
          navigation.navigateTo('home');
        }} />;
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
        // Production'da debug ekranı gösterilmez
        if (__DEV__) {
          return <DebugScreen />;
        }
        return <HomeScreen />;
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
