import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import type { NotificationContentInput, TimeIntervalTriggerInput } from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { localeService } from '../locale';
import { paymentService } from '../payment';
import type { PaymentReminderChannel, PaymentRemindersSettings } from '@/types';

type PaymentReminderTemplate = {
  dayBeforeTitle: string;
  dayOfTitle: string;
  body: string;
};

const PAYMENT_REMINDER_TEMPLATES: Record<string, Record<PaymentReminderChannel, PaymentReminderTemplate>> = {
  en: {
    myPayments: {
      dayBeforeTitle: 'Payment due tomorrow',
      dayOfTitle: 'Payment due today',
      body: "Don't forget {title} due on {dueDate}.",
    },
    upcomingPayments: {
      dayBeforeTitle: 'Incoming payment expected tomorrow',
      dayOfTitle: 'Incoming payment expected today',
      body: 'Keep an eye on {title} scheduled for {dueDate}.',
    },
  },
  tr: {
    myPayments: {
      dayBeforeTitle: 'Ödemenin son günü yarın',
      dayOfTitle: 'Ödemenin son günü bugün',
      body: '{title} ödemesini {dueDate} tarihinde tamamlamayı unutmayın.',
    },
    upcomingPayments: {
      dayBeforeTitle: 'Beklenen ödeme yarın',
      dayOfTitle: 'Beklenen ödeme bugün',
      body: '{title} ödemesinin {dueDate} tarihinde hesabınıza geçmesi bekleniyor.',
    },
  },
  de: {
    myPayments: {
      dayBeforeTitle: 'Zahlung fällig morgen',
      dayOfTitle: 'Zahlung heute fällig',
      body: 'Vergiss nicht, {title} bis {dueDate} zu begleichen.',
    },
    upcomingPayments: {
      dayBeforeTitle: 'Eingangszahlung erwartet morgen',
      dayOfTitle: 'Eingangszahlung erwartet heute',
      body: 'Behalte {title} im Blick, geplant für den {dueDate}.',
    },
  },
  fr: {
    myPayments: {
      dayBeforeTitle: 'Paiement dû demain',
      dayOfTitle: "Paiement dû aujourd'hui",
      body: "N'oubliez pas de régler {title} avant le {dueDate}.",
    },
    upcomingPayments: {
      dayBeforeTitle: 'Encaissement attendu demain',
      dayOfTitle: "Encaissement attendu aujourd'hui",
      body: 'Surveillez {title} prévu pour le {dueDate}.',
    },
  },
  it: {
    myPayments: {
      dayBeforeTitle: 'Pagamento in scadenza domani',
      dayOfTitle: 'Pagamento in scadenza oggi',
      body: 'Ricordati di saldare {title} entro il {dueDate}.',
    },
    upcomingPayments: {
      dayBeforeTitle: 'Entrata prevista domani',
      dayOfTitle: 'Entrata prevista oggi',
      body: 'Tieniti pronto per {title} previsto per il {dueDate}.',
    },
  },
  es: {
    myPayments: {
      dayBeforeTitle: 'Pago vence mañana',
      dayOfTitle: 'Pago vence hoy',
      body: 'No olvides liquidar {title} antes del {dueDate}.',
    },
    upcomingPayments: {
      dayBeforeTitle: 'Cobro esperado mañana',
      dayOfTitle: 'Cobro esperado hoy',
      body: 'Presta atención a {title} programado para el {dueDate}.',
    },
  },
};

const PAYMENT_TITLE_FALLBACKS: Record<string, Record<PaymentReminderChannel, string>> = {
  en: { myPayments: 'this payment', upcomingPayments: 'this payment' },
  tr: { myPayments: 'bu ödeme', upcomingPayments: 'bu ödeme' },
  de: { myPayments: 'diese Zahlung', upcomingPayments: 'diese Zahlung' },
  fr: { myPayments: 'ce paiement', upcomingPayments: 'ce paiement' },
  it: { myPayments: 'questo pagamento', upcomingPayments: 'questo pagamento' },
  es: { myPayments: 'este pago', upcomingPayments: 'este pago' },
};

const PAYMENT_LOOKAHEAD_DAYS = 30;
const MAX_SCHEDULED_PAYMENTS_PER_CHANNEL = 50;
const DEFAULT_TEMPLATE_LANGUAGE = 'en';

// Bildirim davranışını yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
          name: 'FinBuddy Reminders',
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
    settings: PaymentRemindersSettings,
    language?: string
  ): Promise<string[] | null> {
    try {
      if (!settings.enabled || !this.hasActiveReminderChannel(settings.channels)) {
        await this.cancelAllNotifications();
        return null;
      }

      await this.cancelAllNotifications();

      const [hours, minutes] = this.parseTime(settings.time);
      const resolvedLanguage = language || localeService.getCurrentLanguage();
      const now = new Date();
      const identifiers: string[] = [];

      if (settings.channels.myPayments) {
        const expenses = await paymentService.getPendingPayments({
          type: 'expense',
          daysAhead: PAYMENT_LOOKAHEAD_DAYS,
          limit: MAX_SCHEDULED_PAYMENTS_PER_CHANNEL,
        });

        const scheduled = await this.scheduleNotificationsForPayments({
          payments: expenses,
          channel: 'myPayments',
          language: resolvedLanguage,
          hour: hours,
          minute: minutes,
          now,
        });

        identifiers.push(...scheduled);
      }

      if (settings.channels.upcomingPayments) {
        const incomes = await paymentService.getPendingPayments({
          type: 'income',
          daysAhead: PAYMENT_LOOKAHEAD_DAYS,
          limit: MAX_SCHEDULED_PAYMENTS_PER_CHANNEL,
        });

        const scheduled = await this.scheduleNotificationsForPayments({
          payments: incomes,
          channel: 'upcomingPayments',
          language: resolvedLanguage,
          hour: hours,
          minute: minutes,
          now,
        });

        identifiers.push(...scheduled);
      }

      return identifiers.length > 0 ? identifiers : null;
    } catch (error) {
      console.error('Error scheduling payment reminders:', error);
      throw error;
    }
  }

  private static hasActiveReminderChannel(channels: PaymentRemindersSettings['channels']): boolean {
    return Boolean(channels.myPayments || channels.upcomingPayments);
  }

  private static async scheduleNotificationsForPayments(params: {
    payments: Array<{ id: string; title: string | null; due_date: string }>;
    channel: PaymentReminderChannel;
    language: string;
    hour: number;
    minute: number;
    now: Date;
  }): Promise<string[]> {
    const identifiers: string[] = [];
    const template = this.getReminderTemplate(params.language, params.channel);

    for (const payment of params.payments) {
      const title = payment.title || this.getFallbackPaymentTitle(params.language, params.channel);
      const context = { title, dueDate: payment.due_date };

      const dayBefore = this.combineDateAndTime(payment.due_date, params.hour, params.minute, -1);
      if (dayBefore && dayBefore.getTime() > params.now.getTime()) {
        const identifier = await this.scheduleCalendarNotification(
          {
            title: template.dayBeforeTitle,
            body: this.formatTemplate(template.body, context),
            data: {
              type: 'payment_reminder',
              channel: params.channel,
              paymentId: payment.id,
              dueDate: payment.due_date,
              timing: 'dayBefore',
            },
          },
          dayBefore,
        );

        if (identifier) {
          identifiers.push(identifier);
        }
      }

      const dueDate = this.combineDateAndTime(payment.due_date, params.hour, params.minute, 0);
      if (dueDate && dueDate.getTime() > params.now.getTime()) {
        const identifier = await this.scheduleCalendarNotification(
          {
            title: template.dayOfTitle,
            body: this.formatTemplate(template.body, context),
            data: {
              type: 'payment_reminder',
              channel: params.channel,
              paymentId: payment.id,
              dueDate: payment.due_date,
              timing: 'dayOf',
            },
          },
          dueDate,
        );

        if (identifier) {
          identifiers.push(identifier);
        }
      }
    }

    return identifiers;
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

  private static combineDateAndTime(
    dueDate: string,
    hour: number,
    minute: number,
    dayOffset: number,
  ): Date | null {
    const [yearStr, monthStr, dayStr] = dueDate.split('-');
    const year = Number.parseInt(yearStr ?? '', 10);
    const month = Number.parseInt(monthStr ?? '', 10);
    const day = Number.parseInt(dayStr ?? '', 10);

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return null;
    }

    const date = new Date(year, month - 1, day, hour, minute, 0, 0);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    if (dayOffset !== 0) {
      date.setDate(date.getDate() + dayOffset);
    }

    return date;
  }

  private static formatTemplate(template: string, context: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => context[key] ?? '');
  }

  private static getReminderTemplate(language: string, channel: PaymentReminderChannel): PaymentReminderTemplate {
    const templates = PAYMENT_REMINDER_TEMPLATES[language] ?? PAYMENT_REMINDER_TEMPLATES[DEFAULT_TEMPLATE_LANGUAGE];
    return templates?.[channel] ?? PAYMENT_REMINDER_TEMPLATES[DEFAULT_TEMPLATE_LANGUAGE]?.[channel] ?? { dayBeforeTitle: '', dayOfTitle: '', body: '' };
  }

  private static getFallbackPaymentTitle(language: string, channel: PaymentReminderChannel): string {
    const titles = PAYMENT_TITLE_FALLBACKS[language] ?? PAYMENT_TITLE_FALLBACKS[DEFAULT_TEMPLATE_LANGUAGE];
    return titles?.[channel] ?? PAYMENT_TITLE_FALLBACKS[DEFAULT_TEMPLATE_LANGUAGE]?.[channel] ?? '';
  }

  private static async scheduleCalendarNotification(
    content: NotificationContentInput,
    triggerDate: Date,
  ): Promise<string | null> {
    try {
      return await Notifications.scheduleNotificationAsync({
        content,
        trigger: { 
          type: SchedulableTriggerInputTypes.DATE,
          date: triggerDate 
        },
      });
    } catch (error) {
      console.error('Error scheduling calendar notification:', error);
      return null;
    }
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
