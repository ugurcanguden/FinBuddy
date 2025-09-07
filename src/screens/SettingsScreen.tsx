// Settings Screen - Ayarlar sayfası
import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { ThemeMode, COLORS } from '@/constants/colors';
import { LANGUAGE_OPTIONS } from '@/constants/languageOptions';
import { useLocale, usePaymentReminders } from '@/hooks';
import { useNavigation, useTheme } from '@/contexts';
import { 
  SafeArea, 
  Container, 
  Text, 
  Card, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Switch, 
  Dropdown, 
  BottomTabBar, 
  View
} from '@/components';

const SettingsScreen: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useLocale();
  const { settings: paymentReminders, toggleReminders } = usePaymentReminders();
  const { currentTheme, setTheme } = useTheme();
  const { goBack } = useNavigation();


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

  const handlePaymentRemindersToggle = async (enabled: boolean) => {
    await toggleReminders(enabled);
  };


  const getThemePreviewStyle = (themeType: ThemeMode) => {
    const colors = COLORS[themeType];
    const isSelected = currentTheme === themeType;
    
    return {
      backgroundColor: colors.background,
      borderColor: isSelected ? colors.primary : colors.border,
      borderWidth: isSelected ? 2 : 1,
    };
  };

  return (
    <SafeArea>
      <StatusBar />
      
      {/* Header */}
      <Container variant="surface" padding="small" style={styles.header}>
        <TouchableOpacity variant="transparent" style={styles.backButton} onPress={goBack}>
          <Text variant="primary" size="medium">←</Text>
        </TouchableOpacity>
        <Text variant="primary" size="large" weight="bold">
          {t('screens.settings.title')}
        </Text>
        <View style={styles.headerSpacer} />
      </Container>

      {/* Content */}
      <ScrollView variant="transparent" style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Genel Ayarlar */}
        <Container padding="medium" style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold">
            {t('screens.settings.general.title')}
          </Text>
          
          <Card variant="default" padding="none">
            {/* Dil Seçimi */}
            <Container padding="medium" style={styles.settingItem}>
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

            {/* Tema Seçimi */}
            <View variant="transparent" style={styles.settingItem}>
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
                      <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: COLORS.dark.border }] as any} />
                      <View variant="transparent" style={[styles.themePreviewCard, { backgroundColor: COLORS.dark.surface }] as any} />
                      <View variant="transparent" style={styles.themePreviewBottom}>
                        <View variant="transparent" style={[styles.themePreviewDot, { backgroundColor: COLORS.dark.primary }] as any} />
                        <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: COLORS.dark.textSecondary }] as any} />
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
                      <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: COLORS.light.border }] as any} />
                      <View variant="transparent" style={[styles.themePreviewCard, { backgroundColor: COLORS.light.surface }] as any} />
                      <View variant="transparent" style={styles.themePreviewBottom}>
                        <View variant="transparent" style={[styles.themePreviewDot, { backgroundColor: COLORS.light.primary }] as any} />
                        <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: COLORS.light.textSecondary }] as any} />
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
                      <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: COLORS.colorful.border }] as any} />
                      <View variant="transparent" style={[styles.themePreviewCard, { backgroundColor: COLORS.colorful.surface }] as any} />
                      <View variant="transparent" style={styles.themePreviewBottom}>
                        <View variant="transparent" style={[styles.themePreviewDot, { backgroundColor: COLORS.colorful.primary }] as any} />
                        <View variant="transparent" style={[styles.themePreviewLine, { backgroundColor: COLORS.colorful.textSecondary }] as any} />
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
          
          <View variant="transparent" style={styles.sectionCard}>
            <View variant="transparent" style={styles.settingItem}>
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
          </View>
        </View>

        {/* Profil */}
        <View style={styles.section}>
          <Text variant="secondary" size="medium" weight="semibold">
            {t('screens.settings.profile.title')}
          </Text>
          
          <View variant="transparent" style={styles.sectionCard}>
            <TouchableOpacity 
              variant="transparent"
              style={styles.settingItem}
              onPress={handleEditProfile}
            >
              <Text variant="primary" size="medium">
                {t('screens.settings.profile.edit_profile')}
              </Text>
              <Text variant="secondary" size="medium">›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </SafeArea>
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
});

export default SettingsScreen;
