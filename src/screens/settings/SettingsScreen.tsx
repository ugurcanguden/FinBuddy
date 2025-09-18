// Settings Screen - Ayarlar sayfası
import React, { useCallback } from 'react';
import { Alert, StyleSheet } from 'react-native';
import type { ThemeMode } from '@/contexts';
import { themes } from '@/contexts';
import { LANGUAGE_OPTIONS } from '@/constants/languageOptions';
import { useLocale, usePaymentReminders } from '@/hooks';
import { useNavigation, useTheme, useCurrency } from '@/contexts';
import { migrationService, categoryService } from '@/services';
import { 
  Container, 
  Text, 
  Card, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Dropdown, 
  View,
  PageHeader,
  Layout
} from '@/components';
import { CURRENCY_OPTIONS } from '@/constants';
import type { Currency } from '@/types';

const SettingsScreen: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useLocale();
  const { settings: paymentReminders, toggleReminders } = usePaymentReminders();
  const { currentTheme, setTheme, colors } = useTheme();
  const { goBack, navigateTo } = useNavigation();
  const { currency, setCurrency } = useCurrency();


  const handleThemeSelect = async (selectedTheme: ThemeMode) => {
    try {
      await setTheme(selectedTheme);
    } catch (error) {
      console.error('Tema değiştirme hatası:', error);
    }
  };

  const handleEditProfile = () => {
    Alert.alert(
      t('screens.settings.profile.edit_profile'),
      t('screens.settings.profile.edit_profile_message')
    );
  };

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode as any);
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    await setCurrency(currencyCode as Currency);
  };

  const handlePaymentRemindersToggle = async (enabled: boolean) => {
    await toggleReminders(enabled);
  };

  const handleResetData = useCallback(() => {
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
  }, [t]);


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
        <Container padding="medium" style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold">
            {t('screens.settings.general.title')}
          </Text>
          
          <Card variant="default" padding="none">
            {/* Dil Seçimi */}
            <Container padding="medium"  >
              <Text variant="primary" size="medium">
                {t('screens.settings.general.language')}
              </Text>
              <View variant="transparent" style={styles.dropdownContainer}>
                <Dropdown
                  options={LANGUAGE_OPTIONS}
                  selectedValue={currentLanguage}
                  onSelect={handleLanguageChange}
                  style={styles.languageDropdown}
                />
              </View>
            </Container>

            <Container padding="medium" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text variant="primary" size="medium">
                {t('screens.settings.general.currency') || t('common.currency')}
              </Text>
              <View variant="transparent" style={styles.dropdownContainer}>
                <Dropdown
                  options={CURRENCY_OPTIONS}
                  selectedValue={currency}
                  onSelect={handleCurrencyChange}
                  style={styles.languageDropdown}
                />
              </View>
            </Container>

            {/* Tema Seçimi */}
            <View variant="transparent" style={[styles.settingItem, { borderBottomColor: colors.border } as any]}>
              <Text variant="primary" size="medium">
                {t('screens.settings.general.theme')}
              </Text>
              <Text variant="secondary" size="medium">›</Text>
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
        </Container>

        {/* Bildirimler */}
        <View style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold">
            {t('screens.settings.notifications.title')}
          </Text>
          <Card variant="default" padding="medium">
            <View variant="transparent" style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <View variant="transparent" style={styles.settingInfo}>
                <Text variant="primary" size="medium">
                  {t('screens.settings.notifications.payment_reminders')}
                </Text>
                <Text variant="secondary" size="small">
                  {t('screens.settings.notifications.payment_reminders_message')}
                </Text>
              </View>
              <Switch
                value={paymentReminders.enabled}
                onValueChange={handlePaymentRemindersToggle}
              />
            </View>
          </Card>
        </View>

        {/* Veri temizliği */}
        <View style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold">
            {t('screens.settings.data.title')}
          </Text>
          <Card variant="default" padding="medium" style={{ gap: 12 }}>
            <Text variant="secondary" size="small">
              {t('screens.settings.data.description')}
            </Text>
            <TouchableOpacity
              variant="transparent"
              style={[styles.dangerButton, { borderColor: colors.danger }]}
              onPress={handleResetData}
            >
              <Text style={[styles.dangerButtonText, { color: colors.danger }]}>
                {t('screens.settings.data.reset_button')}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Kategoriler */}
        <View style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold">
            {t('screens.categories.title')}
          </Text>
          <Card variant="default" padding="none">
            <TouchableOpacity 
              variant="transparent"
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={() => navigateTo('categories')}
            >
              <Text variant="primary" size="medium">
                {t('screens.categories.title')}
              </Text>
              <Text variant="secondary" size="medium">›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Profil */}
        <View style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold">
            {t('screens.settings.profile.title')}
          </Text>
          <Card variant="default" padding="none">
            <TouchableOpacity 
              variant="transparent"
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={handleEditProfile}
            >
              <Text variant="primary" size="medium">
                {t('screens.settings.profile.edit_profile')}
              </Text>
              <Text variant="secondary" size="medium">›</Text>
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
    marginBottom: 12,
    paddingHorizontal: 8,
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
});

export default SettingsScreen;
