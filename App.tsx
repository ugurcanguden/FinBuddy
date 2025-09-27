import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLocale } from '@/hooks';
import { NavigationProvider, ThemeProvider, CurrencyProvider } from '@/contexts';
import { databaseService, migrationService, categoryService, storageService, notificationService } from '@/services';
import { STORAGE_KEYS } from '@/constants';
import * as Notifications from 'expo-notifications';
import AppNavigator from '@/components/AppNavigator';
import OnboardingScreen from '@/screens/OnboardingScreen';

const App: React.FC = () => {
  const { loading: localeLoading, t } = useLocale();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInitialSetup, setShowInitialSetup] = useState(false);

  // Veritabanını başlat
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseService.initialize();
        await migrationService.migrateToLatest();
        await categoryService.initialize();
        
        // Bildirim servisini başlat
        await notificationService.initialize();
        
        // İlk kurulum kontrolü
        const initialSetupCompleted = await storageService.get<boolean>(STORAGE_KEYS.INITIAL_SETUP_COMPLETED);
        const onboardingCompleted = await storageService.get<boolean>('onboarding_completed');
        
        if (!initialSetupCompleted) {
          setShowInitialSetup(true);
        } else if (!onboardingCompleted) {
          setShowOnboarding(true);
        }
        
        setDbInitialized(true);
        console.log('✅ App initialization completed');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        setDbError(error instanceof Error ? error.message : 'Veritabanı başlatılamadı');
      }
    };

    initializeDatabase();
  }, []);

  // Bildirim listener'ları
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Bildirim alındı (received):', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 Bildirim yanıtı alındı (response):', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (localeLoading || !dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{t('common.messages.loading')}</Text>
        {dbError && <Text style={{ color: 'red', marginTop: 10 }}>{dbError}</Text>}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <NavigationProvider>
            {showInitialSetup ? (
              <AppNavigator />
            ) : showOnboarding ? (
              <OnboardingScreen
                onComplete={async () => {
                  await storageService.set('onboarding_completed', true);
                  setShowOnboarding(false);
                }}
              />
            ) : (
              <AppNavigator />
            )}
          </NavigationProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

 

export default App;
