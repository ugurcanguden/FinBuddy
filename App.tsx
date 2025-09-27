import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLocale } from '@/hooks';
import { NavigationProvider, ThemeProvider, CurrencyProvider } from '@/contexts';
import { databaseService, migrationService, categoryService, notificationService, loggerService } from '@/services';
import * as Notifications from 'expo-notifications';
import AppNavigator from '@/components/AppNavigator';
// import SplashScreen from '@/screens/SplashScreen';
// import OnboardingScreen from '@/screens/OnboardingScreen';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://e192d56c5f16b33da2754569063f4271@o4510093130727424.ingest.de.sentry.io/4510093132759120',

  // Environment ve Release tanımla
  environment: __DEV__ ? 'development' : 'production',
  release: `com.finbuddy@${require('./package.json').version}+${Date.now()}`,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring.
  // Production'da 0.1-0.3 arası önerilir
  tracesSampleRate: __DEV__ ? 1.0 : 0.1, // Production'da daha da az
 
  // Enable Logs
  enableLogs: true,

  // Configure Session Replay - Production'da çok az
  replaysSessionSampleRate: __DEV__ ? 0.1 : 0.01, // Production'da %1
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // Development'da Spotlight'ı etkinleştir
  spotlight: __DEV__,
});

const App: React.FC = () => {
  const { loading: localeLoading } = useLocale();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  // Artık AppNavigator'da yönlendirme yapılıyor

  // Varsayılan olarak sadece error loglarını aç
  useEffect(() => {
    loggerService.disableAllLogging(); // Sadece error'ları açık tut
  }, []);

  // Veritabanını başlat
  useEffect(() => {
    const initializeDatabase = async () => {
      const startTime = Date.now();
      
      try {
        loggerService.info('Starting app initialization', { 
          screen: 'App', 
          action: 'initialize' 
        });
        
        await databaseService.initialize();
        loggerService.database('initialize', 'database', Date.now() - startTime);
        
        await migrationService.migrateToLatest();
        loggerService.database('migrate', 'database', Date.now() - startTime);
        
        await categoryService.initialize();
        loggerService.database('initialize', 'categories', Date.now() - startTime);
        
        await notificationService.initialize();
        loggerService.info('Notifications initialized', { 
          screen: 'App', 
          action: 'notifications_init' 
        });
        
        // Artık AppNavigator'da yönlendirme yapılıyor
        loggerService.info('App ready - AppNavigator will handle navigation', { 
          screen: 'App', 
          action: 'ready' 
        });
        
        setDbInitialized(true);
        loggerService.performance('App initialization', Date.now() - startTime, {
          screen: 'App',
          action: 'complete'
        });
      } catch (error) {
        loggerService.error('App initialization failed', error as Error, {
          screen: 'App',
          action: 'initialize_failed',
          duration: Date.now() - startTime
        });
        setDbError(error instanceof Error ? error.message : 'Veritabanı başlatılamadı');
        setDbInitialized(true); // Hata durumunda da devam et
      }
    };

    initializeDatabase();
  }, []);

  // Bildirim listener'ları
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      loggerService.info('Notification received', {
        screen: 'App',
        action: 'notification_received',
        notificationId: notification.request.identifier,
        notificationTitle: notification.request.content.title
      });
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      loggerService.userAction('notification_response', 'App', {
        notificationId: response.notification.request.identifier,
        actionIdentifier: response.actionIdentifier
      });
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (localeLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Dil yükleniyor...</Text>
      </View>
    );
  }

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Veritabanı yükleniyor...</Text>
        {dbError && <Text style={{ color: 'red', marginTop: 10 }}>{dbError}</Text>}
      </View>
    );
  }

  loggerService.debug('Rendering main app', { 
    screen: 'App', 
    action: 'render',
    dbInitialized 
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <NavigationProvider>
            <AppNavigator />
          </NavigationProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

 

export default Sentry.wrap(App);