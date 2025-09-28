// Debug Screen - Bildirim sistemini test etmek için
import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, Layout, PageHeader, ScrollView } from '@/components';
import { NotificationTest, paymentService } from '@/services';
import { createTestPayments, clearTestPayments } from '@/utils/testData';
import { useLocale } from '@/hooks';

const DebugScreen: React.FC = () => {
  // Production'da bu ekran gösterilmemeli
  if (!__DEV__) {
    return null;
  }

  const { t } = useLocale();

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

  const handleUpdatePaymentStatuses = async () => {
    try {
      console.log('🔧 Debug butonu tıklandı - updateAllPaymentStatuses çağrılıyor...');
      await paymentService.updateAllPaymentStatuses();
      console.log('✅ updateAllPaymentStatuses tamamlandı');
      Alert.alert('Payment Status', 'Tüm payment status\'ları güncellendi');
    } catch (error) {
      console.error('❌ Debug butonu hatası:', error);
      Alert.alert('Hata', `Payment status güncelleme hatası: ${error}`);
    }
  };

  const handleManualSQLUpdate = async () => {
    try {
      console.log('🔧 Manuel SQL güncelleme başlatılıyor...');
      
      // Doğrudan SQL komutları
      const { databaseService } = await import('@/services');
      
      console.log('Gelir payment\'larını received yapıyor...');
      await databaseService.run(`
        UPDATE payments 
        SET status = 'received' 
        WHERE id IN (
          SELECT p.id 
          FROM payments p 
          JOIN entries e ON e.id = p.entry_id 
          WHERE e.type = 'income' AND p.is_active = 1 AND e.is_active = 1
        )
      `);
      
      console.log('Gider payment\'larını paid yapıyor...');
      await databaseService.run(`
        UPDATE payments 
        SET status = 'paid' 
        WHERE id IN (
          SELECT p.id 
          FROM payments p 
          JOIN entries e ON e.id = p.entry_id 
          WHERE e.type = 'expense' AND p.is_active = 1 AND e.is_active = 1
        )
      `);
      
      console.log('✅ Manuel SQL güncelleme tamamlandı');
      Alert.alert('Manuel SQL', 'Payment status\'ları manuel olarak güncellendi');
    } catch (error) {
      console.error('❌ Manuel SQL hatası:', error);
      Alert.alert('Hata', `Manuel SQL hatası: ${error}`);
    }
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
            {t('screens.debug.sections.notifications')}
          </Text>
          
          <Button
            title={t('screens.debug.buttons.send_test_notification')}
            onPress={handleTestNotification}
            style={styles.button}
            variant="primary"
          />
          
          <Button
            title={t('screens.debug.buttons.check_permissions')}
            onPress={handleCheckPermissions}
            style={styles.button}
            variant="outline"
          />
        </Card>

        <Card style={styles.card}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            {t('screens.debug.sections.payments')}
          </Text>
          
          <Button
            title={t('screens.debug.buttons.check_pending_payments')}
            onPress={handleCheckPayments}
            style={styles.button}
            variant="outline"
          />
          
          <Button
            title={t('screens.debug.buttons.test_settings')}
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
            title={t('screens.debug.buttons.create_test_payments')}
            onPress={handleCreateTestData}
            style={styles.button}
            variant="outline"
          />
          
          <Button
            title={t('screens.debug.buttons.clear_test_payments')}
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
            title={t('screens.debug.buttons.update_payment_statuses')}
            onPress={handleUpdatePaymentStatuses}
            style={styles.button}
            variant="primary"
          />
          
          <Button
            title={t('screens.debug.buttons.manual_sql_update')}
            onPress={handleManualSQLUpdate}
            style={styles.button}
            variant="outline"
          />
          
          <Button
            title={t('screens.debug.buttons.cancel_all_notifications')}
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
