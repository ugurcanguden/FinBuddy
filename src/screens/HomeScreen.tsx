// Home Screen - Ana sayfa
import React from 'react';
import { StyleSheet } from 'react-native';
import { useLocale } from '@/hooks';
import { SafeArea, Container, Text, StatusBar, BottomTabBar } from '@/components';

const HomeScreen: React.FC = () => {
  const { t } = useLocale();

  return (
    <SafeArea  >
      <StatusBar />
      
      {/* Header */}
      <Container variant="surface" padding="small" style={styles.header}>
        <Text variant="primary" size="large" weight="bold">
          {t('screens.home.title')}
        </Text>
        <Text variant="secondary" size="small" style={styles.headerSubtitle}>
          {t('screens.home.subtitle')}
        </Text>
      </Container>

      {/* Content */}
      <Container padding="large" style={styles.content}>
        <Text variant="primary" size="large" align="center">
          Ana sayfa içeriği buraya gelecek
        </Text>
      </Container>

      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  headerSubtitle: {
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;