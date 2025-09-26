// Environment Utilities - Ortam kontrolü için yardımcı fonksiyonlar
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Development ortamında mı kontrol eder
 * @returns {boolean} Development ortamında ise true
 */
export const isDevelopment = (): boolean => {
  // Expo development build kontrolü
  if (__DEV__) {
    return true;
  }

  // Environment variable kontrolü
  const environment = process.env['EXPO_PUBLIC_ENVIRONMENT'] || Constants.expoConfig?.extra?.['environment'];
  if (environment === 'development') {
    return true;
  }

  // Metro bundler kontrolü (development server)
  if (Constants.expoConfig?.hostUri) {
    return true;
  }

  return false;
};

/**
 * Production ortamında mı kontrol eder
 * @returns {boolean} Production ortamında ise true
 */
export const isProduction = (): boolean => {
  return !isDevelopment();
};

/**
 * Debug modunda mı kontrol eder
 * @returns {boolean} Debug modunda ise true
 */
export const isDebugMode = (): boolean => {
  return __DEV__ || Constants.expoConfig?.extra?.['debug'] === true;
};

/**
 * Platform bilgisi
 */
export const platformInfo = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
  platform: Platform.OS,
};

/**
 * Environment bilgilerini döndürür
 */
export const getEnvironmentInfo = () => {
  return {
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    isDebug: isDebugMode(),
    platform: platformInfo.platform,
    appVersion: Constants.expoConfig?.version || '1.0.0',
    buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1',
  };
};
