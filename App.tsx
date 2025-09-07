import React from 'react';
import { View, Text } from 'react-native';
import { useLocale } from '@/hooks';
import { NavigationProvider, ThemeProvider, useTheme } from '@/contexts';
import AppNavigator from '@/components/AppNavigator';

const App: React.FC = () => {
  const { loading: localeLoading, t } = useLocale();

  if (localeLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{t('common.messages.loading')}</Text>
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