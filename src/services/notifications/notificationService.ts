import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import type { TimeIntervalTriggerInput } from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { localeService } from '../locale';

// Bildirim davranışını yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface PaymentReminderSettings {
  enabled: boolean;
  time: string; // HH:MM formatı
  days?: number[];
}

export class NotificationService {
  static async initialize(): Promise<boolean> {
    try {
      const granted = await this.requestPermissions();
      if (!granted) {
        console.warn('Notification permissions not granted during initialization');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      throw error;
    }
  }

  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Not a device, cannot request permissions');
      return false;
    }

    try {
      // Android için bildirim kanalı oluştur
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'WordHang Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C'
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Existing notification permission status:', existingStatus);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('New notification permission status:', status);
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted. Final status:', finalStatus);
        return false;
      }
      
      console.log('Notification permission granted successfully');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleDailyNotification(hour: number, minute: number, language: string = 'tr'): Promise<string | null> {
    try {
      // Önce mevcut bildirimleri kontrol et ve iptal et
      const existingNotifications = await this.getScheduledNotifications();
      if (existingNotifications.length > 0) {
        await this.cancelAllNotifications();
      }
      
      // Dil bazlı bildirim mesajları
      const notificationMessages = this.getNotificationMessages(language);
      
      console.log(`Scheduling notification for ${hour}:${minute} in language: ${language}`);
      
      // Yeni bildirim planla
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationMessages.title,
          body: notificationMessages.body,
          data: { type: 'daily_reminder', hour, minute, language } 
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true,
          type: 'daily'
        } as any,
      });
      
      console.log(`Notification scheduled successfully with ID: ${identifier}`);
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async schedulePaymentReminders(
    settings: PaymentReminderSettings,
    language?: string
  ): Promise<string | null> {
    try {
      if (!settings.enabled) {
        await this.cancelAllNotifications();
        return null;
      }

      const [hours, minutes] = this.parseTime(settings.time);
      const resolvedLanguage = language || localeService.getCurrentLanguage();

      return await this.scheduleDailyNotification(hours, minutes, resolvedLanguage);
    } catch (error) {
      console.error('Error scheduling payment reminders:', error);
      throw error;
    }
  }

  static async updateNotificationLanguage(language: string): Promise<boolean> {
    try {
      const existingNotifications = await this.getScheduledNotifications();
      
      if (existingNotifications.length === 0) {
        console.log('No existing notifications to update');
        return true;
      }
      
      // Mevcut bildirimleri iptal et
      await this.cancelAllNotifications();
      
      // İlk bildirimi bul ve ayarlarını al
      const firstNotification = existingNotifications[0];
      const data = firstNotification!.content.data as any;
      
      if (data && data.hour !== undefined && data.minute !== undefined) {
        // Yeni dilde bildirimi yeniden planla
        const result = await this.scheduleDailyNotification(data.hour, data.minute, language);
        return result !== null;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating notification language:', error);
      return false;
    }
  }

  static async cancelAllScheduledNotifications(): Promise<void> {
    await this.cancelAllNotifications();
  }

  static async sendTestNotification(language?: string): Promise<string | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Notification permissions not granted');
        }
      }

      const resolvedLanguage = language || localeService.getCurrentLanguage();
      const messages = this.getNotificationMessages(resolvedLanguage);

      const trigger: TimeIntervalTriggerInput = {
        seconds: 2,
        repeats: false,
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      };

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: messages.title || 'FinBuddy',
          body: messages.body || 'Test bildirimi gönderildi',
          data: { type: 'test_notification' },
        },
        trigger,
      });

      return identifier;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      // Silent error handling
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      return [];
    }
  }

  static async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }

  // Dil bazlı bildirim mesajlarını al
  private static getNotificationMessages(language: string) {
    switch (language) {
      case 'tr':
        return {
          title: 'FinBuddy Hatırlatma',
          body: 'Bugünkü mali durumunuzu kontrol etmeyi unutmayın!',
        };
      case 'de':
        return {
          title: 'FinBuddy Erinnerung',
          body: 'Vergiss nicht, heute deine Finanzen zu prüfen!',
        };
      case 'fr':
        return {
          title: 'Rappel FinBuddy',
          body: 'N’oubliez pas de vérifier vos finances aujourd’hui !',
        };
      case 'it':
        return {
          title: 'Promemoria FinBuddy',
          body: 'Non dimenticare di controllare le tue finanze oggi!',
        };
      case 'es':
        return {
          title: 'Recordatorio FinBuddy',
          body: '¡No olvides revisar tus finanzas hoy!',
        };
      case 'en':
      default:
        return {
          title: 'FinBuddy Reminder',
          body: 'Do not forget to review your finances today!',
        };
    }
  }

  private static parseTime(time: string): [number, number] {
    const [hourStr, minuteStr] = time.split(':');

    if (!hourStr || !minuteStr) {
      throw new Error(`Invalid time format: ${time}`);
    }

    const hour = Number.parseInt(hourStr, 10);
    const minute = Number.parseInt(minuteStr, 10);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      throw new Error(`Invalid time format: ${time}`);
    }

    return [hour, minute];
  }


  // Eski API uyumluluğu için
  static async scheduleDailyReminder(reminderSettings: any, language: string = 'tr'): Promise<void> {
    if (!reminderSettings.enabled) return;

    const [hours, minutes] = this.parseTime(reminderSettings.time);
    await this.scheduleDailyNotification(hours, minutes, language);
  }

  static async cancelDailyReminder(): Promise<void> {
    await this.cancelAllNotifications();
  }
}

export default NotificationService;
