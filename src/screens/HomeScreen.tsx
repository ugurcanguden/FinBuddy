// Home Screen - Ana sayfa
import React from 'react';
import { StyleSheet } from 'react-native';
import { useLocale } from '@/hooks';
import { Container, Text, PageHeader, Layout } from '@/components';

const HomeScreen: React.FC = () => {
  const { t } = useLocale();

  return (
    <Layout
      headerComponent={
        <PageHeader
          title={t('screens.home.title')}
          rightElement={
            <Text variant="secondary" size="small">
              {t('screens.home.subtitle')}
            </Text>
          }
        />
      }
    >
      {/* Content */}
      <Container padding="large" style={styles.content}>
        <Text variant="primary" size="large" align="center">
          Ana sayfa içeriği buraya gelecek
        </Text>
      </Container>

    </Layout>
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