// Payment Reminders Hook - Ödeme hatırlatıcıları ayarları
import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/services';
import { STORAGE_KEYS } from '@/constants';
import type {
  PaymentReminderChannel,
  PaymentReminderChannelsSettings,
  PaymentRemindersSettings,
} from '@/types';

const defaultSettings: PaymentRemindersSettings = {
  enabled: true,
  time: '09:00',
  days: [1, 2, 3, 4, 5], // Hafta içi günler
  channels: {
    myPayments: true,
    upcomingPayments: true,
  },
};

export const usePaymentReminders = () => {
  const [settings, setSettings] = useState<PaymentRemindersSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Ayarları yükle
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const savedSettings = await storageService.get(STORAGE_KEYS.PAYMENT_REMINDERS);
      
      if (savedSettings) {
        setSettings({
          ...defaultSettings,
          ...savedSettings,
          channels: {
            ...defaultSettings.channels,
            ...(savedSettings.channels ?? {}),
          },
        });
      } else {
        // İlk kez açılıyorsa default ayarları kaydet
        await storageService.set(STORAGE_KEYS.PAYMENT_REMINDERS, defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Payment reminders ayarları yüklenemedi:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ayarları kaydet
  const saveSettings = useCallback(async (newSettings: PaymentRemindersSettings) => {
    try {
      await storageService.set(STORAGE_KEYS.PAYMENT_REMINDERS, newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Payment reminders ayarları kaydedilemedi:', error);
    }
  }, []);

  // Hatırlatıcıları aç/kapat
  const toggleReminders = useCallback(async (enabled: boolean) => {
    const newSettings: PaymentRemindersSettings = {
      ...settings,
      enabled,
      channels: {
        ...settings.channels,
      },
    };
    await saveSettings(newSettings);
    return newSettings;
  }, [settings, saveSettings]);

  // Zamanı güncelle
  const updateTime = useCallback(async (time: string) => {
    const newSettings: PaymentRemindersSettings = {
      ...settings,
      time,
      channels: {
        ...settings.channels,
      },
    };
    await saveSettings(newSettings);
    return newSettings;
  }, [settings, saveSettings]);

  // Günleri güncelle
  const updateDays = useCallback(async (days: number[]) => {
    const newSettings: PaymentRemindersSettings = {
      ...settings,
      days,
      channels: {
        ...settings.channels,
      },
    };
    await saveSettings(newSettings);
    return newSettings;
  }, [settings, saveSettings]);

  // Tüm ayarları güncelle
  const updateSettings = useCallback(async (newSettings: Partial<PaymentRemindersSettings>) => {
    const updatedSettings: PaymentRemindersSettings = {
      ...settings,
      ...newSettings,
      channels: {
        ...settings.channels,
        ...(newSettings.channels ?? {}),
      },
    };
    await saveSettings(updatedSettings);
    return updatedSettings;
  }, [settings, saveSettings]);

  // Ayarları sıfırla
  const resetSettings = useCallback(async () => {
    await saveSettings(defaultSettings);
  }, [saveSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    toggleReminders,
    updateTime,
    updateDays,
    updateSettings,
    resetSettings,
  };
};
