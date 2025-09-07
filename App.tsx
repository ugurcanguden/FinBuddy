import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocale } from '@/hooks';
import { NavigationProvider, ThemeProvider } from '@/contexts';
import { databaseService, categoryService } from '@/services';
import AppNavigator from '@/components/AppNavigator';

const App: React.FC = () => {
  const { loading: localeLoading, t } = useLocale();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Veritabanını başlat
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseService.initialize();
        await categoryService.initialize();
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
      <NavigationProvider>
        <AppNavigator/>
      </NavigationProvider>
    </ThemeProvider>
  );
};

 

export default App;