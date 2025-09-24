// Settings Screen - Ayarlar sayfası
import React, { useCallback, useEffect } from 'react';
import { Alert, StyleSheet, Platform } from 'react-native';
import type { ThemeMode } from '@/contexts';
import { themes } from '@/contexts';
import { LANGUAGE_OPTIONS } from '@/constants/languageOptions';
import { useLocale, usePaymentReminders, useBiometric } from '@/hooks';
import { useNavigation, useTheme, useCurrency } from '@/contexts';
import { migrationService, categoryService, notificationService } from '@/services';
import type { PaymentReminderChannel } from '@/types';
import { 
  Text, 
  Card, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Dropdown, 
  View,
  PageHeader,
  Layout,
  TimePicker
} from '@/components';
import { CURRENCY_OPTIONS } from '@/constants';
import type { Currency } from '@/types';

const SettingsScreen: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useLocale();
  const { settings: paymentReminders, toggleReminders, updateSettings } = usePaymentReminders();
  const { currentTheme, setTheme, colors } = useTheme();
  const { goBack, navigateTo } = useNavigation();
  const { currency, setCurrency } = useCurrency();
  const { authenticate, isAvailable, isEnrolled, checkBiometricAvailability } = useBiometric();
  // Component mount olduğunda biometric availability'yi kontrol et
  useEffect(() => {
    checkBiometricAvailability();
  }, [checkBiometricAvailability]);


  const handleThemeSelect = async (selectedTheme: ThemeMode) => {
    try {
      await setTheme(selectedTheme);
    } catch (error) {
      console.error('Tema değiştirme hatası:', error);
    }
  };


  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode as any);
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    await setCurrency(currencyCode as Currency);
  };

  const hasActiveReminderChannel = (channels: typeof paymentReminders.channels) =>
    channels.myPayments || channels.upcomingPayments;

  const handlePaymentRemindersToggle = async (enabled: boolean) => {
    const updatedSettings = await toggleReminders(enabled);

    if (enabled && hasActiveReminderChannel(updatedSettings.channels)) {
      // Bildirim izni iste
      const hasPermission = await notificationService.initialize();
      if (hasPermission) {
        await notificationService.schedulePaymentReminders(updatedSettings);
        console.log('✅ Bildirimler zamanlandı:', updatedSettings);
      } else {
        Alert.alert(
          'Bildirim İzni Gerekli',
          'FinBuddy size hatırlatma bildirimleri gönderebilmek için bildirim iznine ihtiyaç duyuyor.\n\nLütfen:\n1. Ayarlar > Bildirimler > FinBuddy\n2. "İzin Ver" seçeneğini açın\n3. Tekrar deneyin',
          [
            { text: 'Tamam', style: 'default' },
            { 
              text: 'Ayarlara Git', 
              onPress: () => {
                // iOS Settings'e yönlendirme (Android'de otomatik açılır)
                if (Platform.OS === 'ios') {
                  Alert.alert(
                    'Ayarlara Gidin',
                    'Lütfen Ayarlar > Bildirimler > FinBuddy bölümünden bildirim iznini açın.'
                  );
                }
              }
            }
          ]
        );
      }
    } else {
      // Bildirimleri iptal et
      await notificationService.cancelAllScheduledNotifications();
      console.log('❌ Bildirimler iptal edildi');
    }
  };

  // Saat değiştiğinde bildirimleri güncelle
  const handleNotificationTimeChange = async (time: string) => {
    const updatedSettings = await updateSettings({ time });

    // Eğer bildirimler açıksa ve kanal seçiliyse, yeni saatle yeniden zamanla
    if (updatedSettings.enabled && hasActiveReminderChannel(updatedSettings.channels)) {
      try {
        await notificationService.schedulePaymentReminders(updatedSettings);
        console.log('✅ Bildirim saati güncellendi:', updatedSettings);
      } catch (error) {
        console.error('❌ Bildirim saati güncellenirken hata:', error);
      }
    }
  };

  const handleReminderChannelToggle = async (
    channel: PaymentReminderChannel,
    enabled: boolean,
  ) => {
    const updatedSettings = await updateSettings({
      channels: {
        ...paymentReminders.channels,
        [channel]: enabled,
      },
    });

    if (updatedSettings.enabled && hasActiveReminderChannel(updatedSettings.channels)) {
      try {
        await notificationService.schedulePaymentReminders(updatedSettings);
        console.log('✅ Bildirim kanalı güncellendi:', updatedSettings);
      } catch (error) {
        console.error('❌ Bildirim kanalı güncellenirken hata:', error);
      }
    } else {
      await notificationService.cancelAllScheduledNotifications();
      console.log('❌ Bildirim kanalı devre dışı bırakıldı');
    }
  };

  const handleResetData = useCallback(async () => {
    // Önce biometric authentication kontrol et
    if (isAvailable && isEnrolled) {
      const authResult = await authenticate(t('screens.settings.data.biometric_prompt') || 'Please authenticate to reset all data');
      
      if (!authResult.success) {
        Alert.alert(
          t('common.messages.error'),
          authResult.error || t('screens.settings.data.biometric_failed') || 'Authentication failed'
        );
        return;
      }
    }

    // Biometric authentication başarılı veya mevcut değil, onay al
    Alert.alert(
      t('screens.settings.data.reset_title'),
      t('screens.settings.data.reset_message'),
      [
        { text: t('common.buttons.cancel'), style: 'cancel' },
        {
          text: t('screens.settings.data.reset_confirm') || t('common.buttons.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await migrationService.resetAppData();
              await categoryService.initialize();
              Alert.alert(t('common.messages.success'), t('screens.settings.data.reset_success'));
            } catch (error) {
              Alert.alert(t('common.messages.error'), String((error as Error).message || ''));
            }
          },
        },
      ]
    );
  }, [t, isAvailable, isEnrolled, authenticate]);


  const getThemePreviewStyle = (themeType: ThemeMode) => {
    const palette = themes[themeType].colors;
    const isSelected = currentTheme === themeType;
    
    return {
      backgroundColor: palette.background,
      borderColor: isSelected ? palette.primary : palette.border,
      borderWidth: isSelected ? 2 : 1,
    };
  };

  return (
    <Layout
      headerComponent={
        <PageHeader
          title={t('screens.settings.title')}
          showBackButton={true}
          onBackPress={goBack}
        />
      }
    >
      {/* Content */}
      <ScrollView variant="transparent" style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Genel Ayarlar */}
        <View style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold" style={styles.sectionTitle}>
            {t('screens.settings.general.title')}
          </Text>
          
          <Card variant="default" padding="none" style={styles.card}>
            {/* Dil Seçimi */}
            <View variant="transparent" style={[styles.settingItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View variant="transparent" style={styles.settingInfo}>
                <Text variant="primary" size="medium">
                  {t('screens.settings.general.language')}
                </Text>
              </View>
              <View variant="transparent" style={styles.dropdownContainer}>
                <Dropdown
                  options={LANGUAGE_OPTIONS}
                  selectedValue={currentLanguage}
                  onSelect={handleLanguageChange}
                  style={styles.languageDropdown}
                />
              </View>
            </View>

            {/* Para Birimi */}
            <View variant="transparent" style={[styles.settingItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View variant="transparent" style={styles.settingInfo}>
                <Text variant="primary" size="medium">
                  {t('screens.settings.general.currency') || t('common.currency')}
                </Text>
              </View>
              <View variant="transparent" style={styles.dropdownContainer}>
                <Dropdown
                  options={CURRENCY_OPTIONS}
                  selectedValue={currency}
                  onSelect={handleCurrencyChange}
                  style={styles.languageDropdown}
                />
              </View>
            </View>

            {/* Tema Seçimi */}
            <View variant="transparent" style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <View variant="transparent" style={styles.settingInfo}>
                <Text variant="primary" size="medium">
                  {t('screens.settings.general.theme')}
                </Text>
              </View>
            </View>

            {/* Tema Önizlemeleri */}
            <View variant="transparent" style={styles.themePreviewContainer}>
              <View variant="transparent" style={styles.themeGrid}>
                {/* Koyu Tema */}
                <TouchableOpacity 
                  variant="transparent"
                  style={styles.themeOption}
                  onPress={() => handleThemeSelect('dark')}
                >
                  <View variant="transparent" style={[styles.themePreview, getThemePreviewStyle('dark')] as any}>
                    <View variant="transparent" style={styles.themePreviewContent}>
                      <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: themes.dark.colors.border }] as any} />
                      <View variant="transparent" style={[styles.themePreviewCard, { backgroundColor: themes.dark.colors.card }] as any} />
                      <View variant="transparent" style={styles.themePreviewBottom}>
                        <View variant="transparent" style={[styles.themePreviewDot, { backgroundColor: themes.dark.colors.primary }] as any} />
                        <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: themes.dark.colors.textSecondary }] as any} />
                      </View>
                    </View>
                  </View>
                  <Text variant={currentTheme === 'dark' ? 'primary' : 'secondary'} size="small" align="center">
                    {t('screens.settings.general.theme_dark')}
                  </Text>
                </TouchableOpacity>

                {/* Açık Tema */}
                <TouchableOpacity 
                  variant="transparent"
                  style={styles.themeOption}
                  onPress={() => handleThemeSelect('light')}
                >
                  <View variant="transparent" style={[styles.themePreview, getThemePreviewStyle('light')] as any}>
                    <View variant="transparent" style={styles.themePreviewContent}>
                      <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: themes.light.colors.border }] as any} />
                      <View variant="transparent" style={[styles.themePreviewCard, { backgroundColor: themes.light.colors.card }] as any} />
                      <View variant="transparent" style={styles.themePreviewBottom}>
                        <View variant="transparent" style={[styles.themePreviewDot, { backgroundColor: themes.light.colors.primary }] as any} />
                        <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: themes.light.colors.textSecondary }] as any} />
                      </View>
                    </View>
                  </View>
                  <Text variant={currentTheme === 'light' ? 'primary' : 'secondary'} size="small" align="center">
                    {t('screens.settings.general.theme_light')}
                  </Text>
                </TouchableOpacity>

                {/* Gece Mavisi Tema */}
                <TouchableOpacity 
                  variant="transparent"
                  style={styles.themeOption}
                  onPress={() => handleThemeSelect('colorful')}
                >
                  <View variant="transparent" style={[styles.themePreview, getThemePreviewStyle('colorful')] as any}>
                    <View variant="transparent" style={styles.themePreviewContent}>
                      <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: themes.colorful.colors.border }] as any} />
                      <View variant="transparent" style={[styles.themePreviewCard, { backgroundColor: themes.colorful.colors.card }] as any} />
                      <View variant="transparent" style={styles.themePreviewBottom}>
                        <View variant="transparent" style={[styles.themePreviewDot, { backgroundColor: themes.colorful.colors.primary }] as any} />
                        <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: themes.colorful.colors.textSecondary }] as any} />
                      </View>
                    </View>
                  </View>
                  <Text variant={currentTheme === 'colorful' ? 'primary' : 'secondary'} size="small" align="center">
                    {t('screens.settings.general.theme_colorful')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>

        {/* Bildirimler */}
        <View style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold" style={styles.sectionTitle}>
            {t('screens.settings.notifications.title')}
          </Text>
          <Card variant="default" padding="none" style={styles.card}>
            {/* Bildirim Açma/Kapama */}
            <View variant="transparent" style={[styles.settingItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View variant="transparent" style={styles.settingInfo}>
                <Text variant="primary" size="medium">
                  {t('screens.settings.notifications.payment_reminders')}
                </Text>
                <Text variant="secondary" size="small" style={styles.settingDescription}>
                  {t('screens.settings.notifications.payment_reminders_message')}
                </Text>
              </View>
              <Switch
                value={paymentReminders.enabled}
                onValueChange={handlePaymentRemindersToggle}
              />
            </View>

            {/* Bildirim Kanalları */}
            <View
              variant="transparent"
              style={[
                styles.settingItem,
                {
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  borderBottomWidth: paymentReminders.enabled ? 1 : 0,
                  borderBottomColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                },
              ]}
            >
              <View variant="transparent" style={styles.settingInfo}>
                <Text variant="primary" size="medium">
                  {t('screens.settings.notifications.my_payments_title')}
                </Text>
                <Text variant="secondary" size="small" style={styles.settingDescription}>
                  {t('screens.settings.notifications.my_payments_message')}
                </Text>
              </View>
              <Switch
                value={paymentReminders.channels.myPayments}
                onValueChange={(value) => handleReminderChannelToggle('myPayments', value)}
                disabled={!paymentReminders.enabled}
              />
            </View>

            <View
              variant="transparent"
              style={[
                styles.settingItem,
                {
                  borderBottomWidth: paymentReminders.enabled ? 1 : 0,
                  borderBottomColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                },
              ]}
            >
              <View variant="transparent" style={styles.settingInfo}>
                <Text variant="primary" size="medium">
                  {t('screens.settings.notifications.upcoming_payments_title')}
                </Text>
                <Text variant="secondary" size="small" style={styles.settingDescription}>
                  {t('screens.settings.notifications.upcoming_payments_message')}
                </Text>
              </View>
              <Switch
                value={paymentReminders.channels.upcomingPayments}
                onValueChange={(value) => handleReminderChannelToggle('upcomingPayments', value)}
                disabled={!paymentReminders.enabled}
              />
            </View>

            {/* Bildirim Saati */}
            {paymentReminders.enabled && (
              <View variant="transparent" style={[styles.settingItem, { paddingHorizontal: 16, paddingVertical: 12 }]}>
                <View variant="transparent" style={styles.settingInfo}>
                  <Text variant="primary" size="medium">
                    Bildirim Saati
                  </Text>
                  <Text variant="secondary" size="small" style={styles.settingDescription}>
                    Günlük hatırlatma bildiriminin gönderileceği saat
                  </Text>
                </View>
                <TimePicker
                  value={paymentReminders.time}
                  onChange={handleNotificationTimeChange}
                  placeholder="Saat seçin"
                />
              </View>
            )}

            {/* Test Bildirimi */}
            {paymentReminders.enabled && (
              <View variant="transparent" style={[styles.settingItem, { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View variant="transparent" style={styles.settingInfo}>
                  <Text variant="primary" size="medium">
                    Test Bildirimi
                  </Text>
                  <Text variant="secondary" size="small" style={styles.settingDescription}>
                    Bildirim sisteminin çalışıp çalışmadığını test edin
                  </Text>
                </View>
                <TouchableOpacity
                  variant="transparent"
                  style={[styles.testButton, { backgroundColor: colors.primary }] as any}
                  onPress={async () => {
                    try {
                      console.log('🧪 Test bildirimi butonuna basıldı');
                      
                      // Önce mevcut bildirimleri kontrol et
                      const scheduled = await notificationService.getScheduledNotifications();
                      console.log('📋 Mevcut zamanlanan bildirimler:', scheduled.length);
                      
                      await notificationService.sendTestNotification();
                      
                      // Başarılı olduktan sonra tekrar kontrol et
                      const newScheduled = await notificationService.getScheduledNotifications();
                      console.log('📋 Yeni zamanlanan bildirimler:', newScheduled.length);
                      
                      Alert.alert(
                        'Test Bildirimi', 
                        `2 saniye içinde test bildirimi gelecek!\n\nZamanlanan bildirim sayısı: ${newScheduled.length}`,
                        [
                          { text: 'Tamam', style: 'default' },
                          { 
                            text: 'Bildirimleri Gör', 
                            onPress: async () => {
                              const allScheduled = await notificationService.getScheduledNotifications();
                              console.log('📋 Tüm zamanlanan bildirimler:', allScheduled);
                              Alert.alert('Zamanlanan Bildirimler', `Toplam ${allScheduled.length} bildirim zamanlandı`);
                            }
                          }
                        ]
                      );
                    } catch (error) {
                      console.error('❌ Test bildirimi hatası:', error);
                      Alert.alert('Hata', 'Test bildirimi gönderilemedi: ' + String(error));
                    }
                  }}
                >
                  <Text variant="primary" size="small" weight="semibold" style={{ color: 'white' }}>
                    Test Gönder
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </View>

        {/* Kategoriler */}
        <View style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold" style={styles.sectionTitle}>
            {t('screens.categories.title')}
          </Text>
          <Card variant="default" padding="none" style={styles.card}>
            <TouchableOpacity 
              variant="transparent"
              style={styles.settingItem}
              onPress={() => navigateTo('categories')}
            >
              <Text variant="primary" size="medium">
                {t('screens.categories.title')}
              </Text>
              <Text variant="secondary" size="medium">›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Veri temizliği - En altta */}
        <View style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold" style={styles.sectionTitle}>
            {t('screens.settings.data.title')}
          </Text>
          <Card variant="default" padding="medium" style={[styles.card, styles.dangerCard] as any}>
            <Text variant="secondary" size="small" style={styles.dangerDescription}>
              {t('screens.settings.data.description')}
            </Text>
            <TouchableOpacity
              variant="transparent"
              style={[styles.dangerButton, { borderColor: colors.danger }]}
              onPress={handleResetData}
            >
              <Text style={[styles.dangerButtonText, { color: colors.danger }] as any}>
                {t('screens.settings.data.reset_button')}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.2)',
  },
  dangerDescription: {
    marginBottom: 12,
    lineHeight: 18,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  dropdownContainer: {
    flex: 1,
    marginLeft: 16,
  },
  languageDropdown: {
    minHeight: 40,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValueText: {
    fontSize: 16,
  },
  arrowIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themePreviewContainer: {
    padding: 16,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
  },
  themePreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  themePreviewContent: {
    flex: 1,
    padding: 8,
  },
  themePreviewLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  themePreviewCard: {
    height: 32,
    borderRadius: 6,
    marginBottom: 4,
  },
  themePreviewBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  themePreviewDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeLabel: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  dangerButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontWeight: '600',
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});

export default SettingsScreen;
