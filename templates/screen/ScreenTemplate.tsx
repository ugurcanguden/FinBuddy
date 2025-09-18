// Screen Template - Yeni ekranlar için başlangıç dosyası
import React from 'react';
import { StyleSheet } from 'react-native';
import { Layout, PageHeader, ScrollView, Text, View } from '@/components';
import { useNavigation } from '@/contexts';
import { useLocale } from '@/hooks';

const ScreenTemplate: React.FC = () => {
  const { t } = useLocale();
  const { goBack } = useNavigation();

  return (
    <Layout
      headerComponent={
        <PageHeader
          title={t('common.app_name')}
          showBackButton
          onBackPress={goBack}
        />
      }
    >
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text size="large" weight="semibold">Yeni Ekran</Text>
          <Text variant="secondary">İçeriği buraya ekleyin.</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    gap: 8,
  },
});

export default ScreenTemplate;

