// Initial Setup Screen - İlk kurulum ekranı
import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useCurrency } from '@/contexts';
import { useNavigation } from '@/contexts';
import { useLocale } from '@/hooks';
import { storageService } from '@/services';
import { STORAGE_KEYS } from '@/constants';
import { LANGUAGE_OPTIONS } from '@/constants/languageOptions';
import { CURRENCY_OPTIONS } from '@/constants/currencyOptions';
import {
  View,
  Text,
  Button,
  Dropdown,
  Card
} from '@/components';

const InitialSetupScreen: React.FC = () => {
  const { changeLanguage } = useLocale();
  const { setCurrency } = useCurrency();
  const { navigateTo } = useNavigation();
  
  const [selectedLanguage, setSelectedLanguage] = useState('tr');
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Dil ve para birimini ayarla
      await changeLanguage(selectedLanguage as any);
      await setCurrency(selectedCurrency as any);
      
      // İlk kurulumun tamamlandığını işaretle
      await storageService.set(STORAGE_KEYS.INITIAL_SETUP_COMPLETED, true);
      
      // Onboarding flag'ini sıfırla (yeni kullanıcı için)
      await storageService.set('onboarding_completed', false);
      
      console.log('✅ Initial setup completed, onboarding flag reset');
      
      // Ana sayfaya yönlendir (tour kontrolü orada yapılacak)
      navigateTo('home');
    } catch (error) {
      // Initial setup failed
      Alert.alert(
        'Hata',
        'Kurulum sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="primary" size="large" weight="bold" style={styles.title}>
          FinBuddy'ye Hoş Geldiniz
        </Text>
        <Text variant="secondary" size="medium" style={styles.subtitle}>
          Başlamak için dil ve para biriminizi seçin
        </Text>
      </View>

      {/* Setup Form */}
      <Card style={styles.formCard}>
        <View style={styles.form}>
          {/* Language Selection */}
          <View style={styles.formGroup}>
            <Text variant="primary" size="medium" weight="medium" style={styles.label}>
              Dil / Language
            </Text>
            <Dropdown
              options={LANGUAGE_OPTIONS}
              selectedValue={selectedLanguage}
              onSelect={setSelectedLanguage}
              style={styles.dropdown}
            />
          </View>

          {/* Currency Selection */}
          <View style={styles.formGroup}>
            <Text variant="primary" size="medium" weight="medium" style={styles.label}>
              Para Birimi / Currency
            </Text>
            <Dropdown
              options={CURRENCY_OPTIONS}
              selectedValue={selectedCurrency}
              onSelect={setSelectedCurrency}
              style={styles.dropdown}
            />
          </View>
        </View>
      </Card>

      {/* Action Button */}
      <View style={styles.actions}>
        <Button
          variant="primary"
          size="large"
          onPress={handleComplete}
          loading={loading}
          disabled={loading}
          title="Devam Et"
          style={styles.continueButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa', // Full screen background
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  formCard: {
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  formGroup: {
    gap: 12,
  },
  label: {
    marginBottom: 8,
  },
  dropdown: {
    minHeight: 48,
  },
  actions: {
    alignItems: 'center',
  },
  continueButton: {
    minWidth: 200,
  },
});

export default InitialSetupScreen;
