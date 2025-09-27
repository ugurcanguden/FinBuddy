import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useLocale } from '@/hooks';
import { useNavigation } from '@/contexts';
import { storageService } from '@/services';
import { PRIVACY_TERMS, PRIVACY_TERMS_ACCEPTED_KEY, PRIVACY_TERMS_VERSION_KEY, PRIVACY_TERMS_VERSION } from '@/constants/legal/privacy-terms';
import { LANGUAGE_OPTIONS } from '@/constants/languageOptions';
import { 
  View, 
  Text, 
  Button, 
  Card,
  ScrollView as CustomScrollView,
  Dropdown,
  SafeArea
} from '@/components';

interface PrivacyTermsScreenProps {
  fromSettings?: boolean;
}

const PrivacyTermsScreen: React.FC<PrivacyTermsScreenProps> = ({ fromSettings = false }) => {
  const { t, changeLanguage } = useLocale();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(t('common.language_code') || 'tr');

  const handleLanguageChange = async (languageCode: string) => {
    try {
      setSelectedLanguage(languageCode);
      await changeLanguage(languageCode as any);
    } catch (error) {
      Alert.alert('Hata', 'Dil değiştirilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      
      // Kullanıcı onayını kaydet
      await storageService.set(PRIVACY_TERMS_ACCEPTED_KEY, true);
      await storageService.set(PRIVACY_TERMS_VERSION_KEY, PRIVACY_TERMS_VERSION);
      
      // Ayarlardan geliyorsa geri dön, değilse ana uygulamaya yönlendir
      if (fromSettings) {
        navigation.goBack();
      } else {
        navigation.navigateTo('home');
      }
    } catch (error) {
      Alert.alert(
        'Hata',
        'Onay kaydedilemedi. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    if (fromSettings) {
      // Ayarlardan geliyorsa sadece geri dön
      navigation.goBack();
    } else {
      // İlk açılışta ise uygulamayı kapat
      Alert.alert(
        'Uygulamayı Kapat',
        'Gizlilik politikasını kabul etmeden uygulamayı kullanamazsınız. Uygulamayı kapatmak istediğinizden emin misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Kapat',
            style: 'destructive',
            onPress: () => {
              // Uygulamayı kapat (React Native'de bu genellikle BackHandler ile yapılır)
              // Bu durumda kullanıcıyı splash ekranına geri gönderelim
              navigation.navigateTo('splash');
            }
          }
        ]
      );
    }
  };

  const currentLanguage = t('common.language_code') || 'tr';
  const terms = PRIVACY_TERMS[currentLanguage as keyof typeof PRIVACY_TERMS] || PRIVACY_TERMS.tr;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="primary" size="large" weight="bold" style={styles.title}>
          {t('screens.privacy_terms.title')}
        </Text>
        <Text variant="secondary" size="medium" style={styles.subtitle}>
          {t('screens.privacy_terms.subtitle')}
        </Text>
        
        {/* Dil Seçimi */}
        <Card variant="default" style={styles.languageCard}>
          <Text variant="primary" size="medium" weight="semibold" style={styles.languageTitle}>
            {t('screens.privacy_terms.select_language')}
          </Text>
          <Dropdown
            options={LANGUAGE_OPTIONS}
            selectedValue={selectedLanguage}
            onSelect={handleLanguageChange}
            placeholder={t('screens.privacy_terms.select_language')}
            style={styles.languageDropdown}
          />
        </Card>
      </View>

      <CustomScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Gizlilik Politikası */}
        <Card variant="default" style={styles.card}>
          <Text variant="primary" size="medium" weight="semibold" style={styles.sectionTitle}>
            {t('screens.privacy_terms.privacy_policy')}
          </Text>
          <Text variant="secondary" size="small" style={styles.termsText}>
            {terms.privacy}
          </Text>
        </Card>

        {/* Kullanım Şartları */}
        <Card variant="default" style={styles.card}>
          <Text variant="primary" size="medium" weight="semibold" style={styles.sectionTitle}>
            {t('screens.privacy_terms.terms_of_use')}
          </Text>
          <Text variant="secondary" size="small" style={styles.termsText}>
            {terms.terms}
          </Text>
        </Card>
      </CustomScrollView>

      {/* Alt Butonlar - SafeArea içinde */}
      <SafeArea style={styles.safeArea}>
        <View style={styles.footer}>
          {!fromSettings && (
            <Button
              variant="outline"
              onPress={handleDecline}
              style={styles.declineButton}
              disabled={isLoading}
              title={t('screens.privacy_terms.decline')}
            />
          )}
          
          <Button
            variant="primary"
            onPress={handleAccept}
            style={fromSettings ? styles.singleButton : styles.acceptButton}
            loading={isLoading}
            title={fromSettings ? 'Tamam' : t('screens.privacy_terms.accept')}
          />
        </View>
      </SafeArea>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  languageCard: {
    marginTop: 20,
    padding: 16,
    width: '100%',
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  languageDropdown: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  safeArea: {
    backgroundColor: '#f8f9fa',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 12,
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    flex: 1,
    maxWidth: 150,
  },
  acceptButton: {
    flex: 1,
    maxWidth: 150,
  },
  singleButton: {
    flex: 1,
    maxWidth: 200,
  },
});

export default PrivacyTermsScreen;
