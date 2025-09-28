// Notification Test - Bildirim sistemini test etmek için
import { NotificationService } from './notificationService';
import { paymentService } from '../payment';
import { loggerService } from '../logging/loggerService';

export class NotificationTest {
  // Test bildirimi gönder
  static async sendTestNotification(): Promise<void> {
    try {
      const identifier = await NotificationService.scheduleNotification({
        title: 'FinBuddy Test',
        body: 'Bu bir test bildirimidir. Bildirim sistemi çalışıyor!',
        trigger: { seconds: 5 }, // 5 saniye sonra
      });

      if (identifier) {
        loggerService.info('Test notification scheduled', {
          service: 'NotificationTest',
          action: 'sendTestNotification',
          identifier
        });
        console.log('✅ Test bildirimi 5 saniye sonra gönderilecek');
      } else {
        console.log('❌ Test bildirimi gönderilemedi');
      }
    } catch (error) {
      loggerService.error('Failed to send test notification', error, {
        service: 'NotificationTest',
        action: 'sendTestNotification'
      });
      console.error('❌ Test bildirimi hatası:', error);
    }
  }

  // Bekleyen ödemeleri kontrol et
  static async checkPendingPayments(): Promise<void> {
    try {
      console.log('🔍 Bekleyen ödemeler kontrol ediliyor...');
      
      // Gider ödemeleri
      const expenses = await paymentService.getPendingPayments({
        type: 'expense',
        daysAhead: 7, // 7 gün içinde
        limit: 10
      });

      console.log(`📊 Gider ödemeleri (7 gün): ${expenses.length} adet`);
      expenses.forEach((payment, index) => {
        console.log(`  ${index + 1}. ${payment.title} - ${payment.due_date} - ${payment.amount} TL`);
      });

      // Gelir ödemeleri
      const incomes = await paymentService.getPendingPayments({
        type: 'income',
        daysAhead: 7, // 7 gün içinde
        limit: 10
      });

      console.log(`📊 Gelir ödemeleri (7 gün): ${incomes.length} adet`);
      incomes.forEach((payment, index) => {
        console.log(`  ${index + 1}. ${payment.title} - ${payment.due_date} - ${payment.amount} TL`);
      });

      // Toplam
      console.log(`📊 Toplam bekleyen ödeme: ${expenses.length + incomes.length} adet`);

    } catch (error) {
      loggerService.error('Failed to check pending payments', error, {
        service: 'NotificationTest',
        action: 'checkPendingPayments'
      });
      console.error('❌ Bekleyen ödemeler kontrol hatası:', error);
    }
  }

  // Bildirim ayarlarını test et
  static async testNotificationSettings(): Promise<void> {
    try {
      console.log('🔔 Bildirim ayarları test ediliyor...');
      
      const testSettings = {
        enabled: true,
        time: '09:00',
        channels: {
          myPayments: true,
          upcomingPayments: true
        }
      };

      const identifiers = await NotificationService.schedulePaymentReminders(testSettings, 'tr');
      
      if (identifiers && identifiers.length > 0) {
        console.log(`✅ ${identifiers.length} adet bildirim planlandı`);
        console.log('Bildirim ID\'leri:', identifiers);
      } else {
        console.log('ℹ️ Planlanacak bildirim bulunamadı');
      }

    } catch (error) {
      loggerService.error('Failed to test notification settings', error, {
        service: 'NotificationTest',
        action: 'testNotificationSettings'
      });
      console.error('❌ Bildirim ayarları test hatası:', error);
    }
  }

  // Tüm bildirimleri iptal et
  static async cancelAllNotifications(): Promise<void> {
    try {
      await NotificationService.cancelAllNotifications();
      console.log('✅ Tüm bildirimler iptal edildi');
    } catch (error) {
      loggerService.error('Failed to cancel notifications', error, {
        service: 'NotificationTest',
        action: 'cancelAllNotifications'
      });
      console.error('❌ Bildirim iptal hatası:', error);
    }
  }

  // Bildirim izinlerini kontrol et
  static async checkPermissions(): Promise<void> {
    try {
      const granted = await NotificationService.requestPermissions();
      if (granted) {
        console.log('✅ Bildirim izinleri verildi');
      } else {
        console.log('❌ Bildirim izinleri verilmedi');
      }
    } catch (error) {
      loggerService.error('Failed to check permissions', error, {
        service: 'NotificationTest',
        action: 'checkPermissions'
      });
      console.error('❌ İzin kontrol hatası:', error);
    }
  }
}
