import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocale } from '@/hooks';
import { NavigationProvider, ThemeProvider, CurrencyProvider } from '@/contexts';
import { databaseService, migrationService, categoryService, storageService } from '@/services';
import AppNavigator from '@/components/AppNavigator';
import OnboardingScreen from '@/screens/OnboardingScreen';

const App: React.FC = () => {
  const { loading: localeLoading, t } = useLocale();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Veritabanını başlat
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseService.initialize();
        await migrationService.migrateToLatest();
        await categoryService.initialize();
        const done = await storageService.get<boolean>('onboarding_completed');
        setShowOnboarding(!done);
        setDbInitialized(true);
        console.log('✅ App initialization completed');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        setDbError(error instanceof Error ? error.message : 'Veritabanı başlatılamadı');
      }
    };

    initializeDatabase();
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
    <ThemeProvider>
      <CurrencyProvider>
        <NavigationProvider>
        {showOnboarding ? (
          <OnboardingScreen
            onComplete={async () => {
              await storageService.set('onboarding_completed', true);
              setShowOnboarding(false);
            }}
          />
        ) : (
          <AppNavigator/>
        )}
        </NavigationProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
};

 

export default App;
