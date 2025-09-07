// Payment Reminders Hook - Ödeme hatırlatıcıları ayarları
import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/services';
import { STORAGE_KEYS } from '@/constants';

interface PaymentRemindersSettings {
  enabled: boolean;
  time: string; // HH:MM formatında
  days: number[]; // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
}

const defaultSettings: PaymentRemindersSettings = {
  enabled: true,
  time: '09:00',
  days: [1, 2, 3, 4, 5], // Hafta içi günler
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
        setSettings({ ...defaultSettings, ...savedSettings });
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
    const newSettings = { ...settings, enabled };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Zamanı güncelle
  const updateTime = useCallback(async (time: string) => {
    const newSettings = { ...settings, time };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Günleri güncelle
  const updateDays = useCallback(async (days: number[]) => {
    const newSettings = { ...settings, days };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Tüm ayarları güncelle
  const updateSettings = useCallback(async (newSettings: Partial<PaymentRemindersSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    await saveSettings(updatedSettings);
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
