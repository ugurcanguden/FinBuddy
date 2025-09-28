// Debug Screen - Bildirim sistemini test etmek için
import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { View, Text, Button, Card, Layout, PageHeader, ScrollView } from '@/components';
import { NotificationTest } from '@/services';
import { createTestPayments, clearTestPayments } from '@/utils/testData';
import { useTheme } from '@/contexts';

const DebugScreen: React.FC = () => {
  const { colors } = useTheme();

  const handleTestNotification = async () => {
    await NotificationTest.sendTestNotification();
    Alert.alert('Test Bildirimi', 'Test bildirimi 5 saniye sonra gönderilecek');
  };

  const handleCheckPayments = async () => {
    await NotificationTest.checkPendingPayments();
  };

  const handleTestSettings = async () => {
    await NotificationTest.testNotificationSettings();
  };

  const handleCancelNotifications = async () => {
    await NotificationTest.cancelAllNotifications();
    Alert.alert('Bildirimler', 'Tüm bildirimler iptal edildi');
  };

  const handleCheckPermissions = async () => {
    await NotificationTest.checkPermissions();
  };

  const handleCreateTestData = async () => {
    await createTestPayments();
    Alert.alert('Test Verisi', 'Test ödemeleri oluşturuldu');
  };

  const handleClearTestData = async () => {
    await clearTestPayments();
    Alert.alert('Test Verisi', 'Test ödemeleri temizlendi');
  };

  return (
    <Layout>
      <PageHeader title="Debug - Bildirim Testi" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Text variant="title" style={styles.title}>
            🔔 Bildirim Sistemi Testi
          </Text>
          <Text variant="secondary" style={styles.description}>
            Bildirim sistemini test etmek için aşağıdaki butonları kullanın
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            📱 Temel Testler
          </Text>
          
          <Button
            title="Test Bildirimi Gönder (5 saniye)"
            onPress={handleTestNotification}
            style={styles.button}
            variant="primary"
          />
          
          <Button
            title="Bildirim İzinlerini Kontrol Et"
            onPress={handleCheckPermissions}
            style={styles.button}
            variant="outline"
          />
        </Card>

        <Card style={styles.card}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            💰 Ödeme Kontrolleri
          </Text>
          
          <Button
            title="Bekleyen Ödemeleri Kontrol Et"
            onPress={handleCheckPayments}
            style={styles.button}
            variant="outline"
          />
          
          <Button
            title="Bildirim Ayarlarını Test Et"
            onPress={handleTestSettings}
            style={styles.button}
            variant="outline"
          />
        </Card>

        <Card style={styles.card}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            🧪 Test Verileri
          </Text>
          
          <Button
            title="Test Ödemeleri Oluştur"
            onPress={handleCreateTestData}
            style={styles.button}
            variant="outline"
          />
          
          <Button
            title="Test Ödemelerini Temizle"
            onPress={handleClearTestData}
            style={styles.button}
            variant="outline"
          />
        </Card>

        <Card style={styles.card}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            🛠️ Yönetim
          </Text>
          
          <Button
            title="Tüm Bildirimleri İptal Et"
            onPress={handleCancelNotifications}
            style={styles.button}
            variant="danger"
          />
        </Card>

        <Card style={styles.card}>
          <Text variant="secondary" style={styles.info}>
            💡 Test sonuçları console'da görünecektir.
            Metro bundler terminalini kontrol edin.
          </Text>
        </Card>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default DebugScreen;
