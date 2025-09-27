// Settings Screen - Ayarlar sayfası
import React, { useCallback, useEffect } from 'react';
import { Alert, StyleSheet, Platform } from 'react-native';
import type { ThemeMode } from '@/contexts';
import { LANGUAGE_OPTIONS } from '@/constants/languageOptions';
import { useLocale, usePaymentReminders, useBiometric } from '@/hooks';
import { useNavigation, useTheme, useCurrency } from '@/contexts';
import { migrationService, categoryService, notificationService } from '@/services';
import type { PaymentReminderChannel } from '@/types';
import { isDevelopment } from '@/utils';
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
import { StatCard, Badge } from '@/components/common';
import { CURRENCY_OPTIONS } from '@/constants';
import type { Currency } from '@/models';

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
        {/* Uygulama Bilgileri */}
        <View style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            Uygulama Bilgileri
          </Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Versiyon"
              value="1.0.0"
              subtitle={t('screens.settings.current') || 'güncel'}
              icon="📱"
              variant="info"
              animated={true}
              style={styles.statCard}
            />
            
            <StatCard
              title="Tema"
              value={currentTheme}
              subtitle="aktif"
              icon="🎨"
              variant="primary"
              animated={true}
              style={styles.statCard}
            />
            
            <StatCard
              title="Dil"
              value={currentLanguage.toUpperCase()}
              subtitle={t('screens.settings.selected') || 'seçili'}
              icon="🌍"
              variant="success"
              animated={true}
              style={styles.statCard}
            />
            
            <StatCard
              title="Para Birimi"
              value={currency}
              subtitle={t('screens.settings.default') || 'varsayılan'}
              icon="💰"
              variant="warning"
              animated={true}
              style={styles.statCard}
            />
          </View>
        </View>
        {/* Genel Ayarlar */}
        <View style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            {t('screens.settings.general.title')}
          </Text>
          
          <Card variant="default" padding="none" style={styles.card}>
            {/* Dil Seçimi */}
            <View style={[styles.settingItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Text variant="primary" size="medium" weight="medium">
                  🌍 {t('screens.settings.general.language')}
                </Text>
                <Text variant="secondary" size="small">
                  Uygulama dili
                </Text>
              </View>
              <View style={styles.dropdownContainer}>
                <Dropdown
                  options={LANGUAGE_OPTIONS}
                  selectedValue={currentLanguage}
                  onSelect={handleLanguageChange}
                  style={styles.languageDropdown}
                />
              </View>
            </View>

            {/* Para Birimi */}
            <View style={[styles.settingItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Text variant="primary" size="medium" weight="medium">
                  💰 {t('screens.settings.general.currency') || t('common.currency')}
                </Text>
                <Text variant="secondary" size="small">
                  Para birimi
                </Text>
              </View>
              <View style={styles.dropdownContainer}>
                <Dropdown
                  options={CURRENCY_OPTIONS}
                  selectedValue={currency}
                  onSelect={handleCurrencyChange}
                  style={styles.languageDropdown}
                />
              </View>
            </View>

            {/* Tema Seçimi */}
            <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <Text variant="primary" size="medium" weight="medium">
                  🎨 {t('screens.settings.general.theme')}
                </Text>
                <Text variant="secondary" size="small">
                  Görünüm teması
                </Text>
              </View>
            </View>

            {/* Tema Seçici */}
            <View style={styles.themeSelector}>
              <View style={styles.themeGrid}>
                {[
                  { key: 'light', name: 'Açık', icon: '☀️', color: '#FFD700' },
                  { key: 'dark', name: 'Koyu', icon: '🌙', color: '#2C3E50' },
                  { key: 'colorful', name: 'Renkli', icon: '🌈', color: '#E74C3C' },
                  { key: 'ocean', name: 'Okyanus', icon: '🌊', color: '#3498DB' },
                  { key: 'sunset', name: 'Gün Batımı', icon: '🌅', color: '#E67E22' },
                  { key: 'forest', name: 'Orman', icon: '🌲', color: '#27AE60' },
                ].map((theme) => (
                  <TouchableOpacity
                    key={theme.key}
                    style={[
                      styles.themeOption,
                      currentTheme === theme.key && styles.themeOptionSelected
                    ]}
                    onPress={() => handleThemeSelect(theme.key as ThemeMode)}
                  >
                    <View style={[
                      styles.themePreview,
                      { backgroundColor: theme.color },
                      currentTheme === theme.key && styles.themePreviewSelected
                    ]}>
                      <Text style={styles.themeIcon}>{theme.icon}</Text>
                    </View>
                    <Text 
                      variant={currentTheme === theme.key ? 'primary' : 'secondary'} 
                      size="small" 
                      style={styles.themeLabel}
                    >
                      {theme.name}
                    </Text>
                    {currentTheme === theme.key && (
                      <Badge variant="success" size="small" style={styles.themeBadge}>
                        ✓
                      </Badge>
                    )}
                  </TouchableOpacity>
                ))}
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
            {paymentReminders.enabled && (
              <>
                <View
                  variant="transparent"
                  style={[
                    styles.settingItem,
                    {
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      borderBottomWidth: 1,
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
                  />
                </View>

                <View
                  variant="transparent"
                  style={[
                    styles.settingItem,
                    {
                      borderBottomWidth: 1,
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
                  />
                </View>
              </>
            )}

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
                  placeholder={t('screens.settings.select_time') || 'Saat seçin'}
                />
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

        {/* Profil Bölümü - Sadece Development'ta görünür */}
        {isDevelopment() && (
          <View style={styles.section}>
            <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
              👤 Profil
            </Text>
            
            <Card variant="default" padding="none" style={styles.card}>
              <TouchableOpacity 
                variant="transparent"
                style={[styles.settingItem, { borderBottomWidth: 0 }]}
                onPress={() => navigateTo('profile')}
              >
                <View variant="transparent" style={styles.settingInfo}>
                  <Text variant="primary" size="medium">
                    Profil Sayfası
                  </Text>
                  <Text variant="secondary" size="small">
                    Profil bilgilerinizi görüntüleyin ve düzenleyin
                  </Text>
                </View>
                <View variant="transparent" style={styles.settingAction}>
                  <Text variant="secondary" size="medium">👤</Text>
                </View>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Geliştirici Bölümü - Sadece Development'ta görünür */}
        {isDevelopment() && (
          <View style={styles.section}>
            <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
              🛠️ Geliştirici
            </Text>
            
            <Card variant="default" padding="none" style={styles.card}>
              <TouchableOpacity 
                variant="transparent"
                style={[styles.settingItem, { borderBottomWidth: 0 }]}
                onPress={() => navigateTo('uiDemo')}
              >
                <View variant="transparent" style={styles.settingInfo}>
                  <Text variant="primary" size="medium">
                    UI Bileşenleri Demo
                  </Text>
                  <Text variant="secondary" size="small">
                    Yeni UI bileşenlerini test edin
                  </Text>
                </View>
                <View variant="transparent" style={styles.settingAction}>
                  <Text variant="secondary" size="medium">🎨</Text>
                </View>
              </TouchableOpacity>
            </Card>
          </View>
        )}
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
  settingAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
  },
  themeSelector: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  themeOptionSelected: {
    transform: [{ scale: 1.05 }],
  },
  themePreviewSelected: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  themeIcon: {
    fontSize: 24,
  },
  themeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});

export default SettingsScreen;
