// Locale Service - Çok dilli yapı yönetimi
import { storageService } from '@/services';

export type SupportedLanguage = 'en' | 'tr' | 'de' | 'fr' | 'it' | 'es';

export interface LocaleConfig {
  language: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
}

class LocaleService {
  private currentLanguage: SupportedLanguage = 'en';
  private fallbackLanguage: SupportedLanguage = 'en';
  private translations: Record<string, any> = {};

  // Dil servisini başlat
  async initialize(): Promise<void> {
    try {
      // Kayıtlı dili yükle
      const savedLanguage = await storageService.get<SupportedLanguage>('selected_language');
      if (savedLanguage && this.isValidLanguage(savedLanguage)) {
        this.currentLanguage = savedLanguage;
      }

      // Çevirileri yükle
      await this.loadTranslations(this.currentLanguage);
      console.log('✅ Locale service initialized');
    } catch (error) {
      console.error('❌ Locale service initialization failed:', error);
      throw error;
    }
  }

  // Geçerli dili kontrol et
  private isValidLanguage(lang: string): lang is SupportedLanguage {
    return ['en', 'tr', 'de', 'fr', 'it', 'es'].includes(lang);
  }

  // Çevirileri yükle
  private async loadTranslations(language: SupportedLanguage): Promise<void> {
    try {
      // Statik import kullan
      const translations = await this.getTranslationsForLanguage(language);
      this.translations = translations;
    } catch (error) {
      console.error(`❌ Failed to load translations for ${language}:`, error);
      // Fallback dilini dene
      if (language !== this.fallbackLanguage) {
        await this.loadTranslations(this.fallbackLanguage);
      }
    }
  }

  // Dil için çevirileri al
  private async getTranslationsForLanguage(language: SupportedLanguage): Promise<any> {
    switch (language) {
      case 'en':
        return {
          common: (await import('@/locales/en/common.json')).default,
          navigation: (await import('@/locales/en/categories/navigation.json')).default,
          screens: {
            home: (await import('@/locales/en/screens/home.json')).default,
            settings: (await import('@/locales/en/screens/settings.json')).default,
            categories: (await import('@/locales/en/screens/categories.json')).default,
          }
        };
      case 'tr':
        return {
          common: (await import('@/locales/tr/common.json')).default,
          navigation: (await import('@/locales/tr/categories/navigation.json')).default,
          screens: {
            home: (await import('@/locales/tr/screens/home.json')).default,
            settings: (await import('@/locales/tr/screens/settings.json')).default,
            categories: (await import('@/locales/tr/screens/categories.json')).default,
          }
        };
      case 'de':
        return {
          common: (await import('@/locales/de/common.json')).default,
          navigation: (await import('@/locales/de/categories/navigation.json')).default,
          screens: {
            home: (await import('@/locales/de/screens/home.json')).default,
            settings: (await import('@/locales/de/screens/settings.json')).default,
            categories: (await import('@/locales/de/screens/categories.json')).default,
          }
        };
      case 'fr':
        return {
          common: (await import('@/locales/fr/common.json')).default,
          navigation: (await import('@/locales/fr/categories/navigation.json')).default,
          screens: {
            home: (await import('@/locales/fr/screens/home.json')).default,
            settings: (await import('@/locales/fr/screens/settings.json')).default,
            categories: (await import('@/locales/fr/screens/categories.json')).default,
          }
        };
      case 'it':
        return {
          common: (await import('@/locales/it/common.json')).default,
          navigation: (await import('@/locales/it/categories/navigation.json')).default,
          screens: {
            home: (await import('@/locales/it/screens/home.json')).default,
            settings: (await import('@/locales/it/screens/settings.json')).default,
            categories: (await import('@/locales/it/screens/categories.json')).default,
          }
        };
      case 'es':
        return {
          common: (await import('@/locales/es/common.json')).default,
          navigation: (await import('@/locales/es/categories/navigation.json')).default,
          screens: {
            home: (await import('@/locales/es/screens/home.json')).default,
            settings: (await import('@/locales/es/screens/settings.json')).default,
            categories: (await import('@/locales/es/screens/categories.json')).default,
          }
        };
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  // Dil değiştir
  async setLanguage(language: SupportedLanguage): Promise<void> {
    if (!this.isValidLanguage(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }

    try {
      this.currentLanguage = language;
      await this.loadTranslations(language);
      await storageService.set('selected_language', language);
      console.log(`✅ Language changed to ${language}`);
    } catch (error) {
      console.error('❌ Failed to change language:', error);
      throw error;
    }
  }

  // Çeviri al
  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = this.translations;

    // Nested key'e git
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback dilini dene
        value = this.getFallbackTranslation(key);
        break;
      }
    }

    // String değilse fallback'e git
    if (typeof value !== 'string') {
      value = this.getFallbackTranslation(key);
    }

    // Parametreleri değiştir
    if (params) {
      return this.replaceParams(value, params);
    }

    return value;
  }

  // Fallback çevirisi al
  private getFallbackTranslation(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Key'i döndür
      }
    }

    return typeof value === 'string' ? value : key;
  }

  // Parametreleri değiştir
  private replaceParams(text: string, params: Record<string, string | number>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  // Geçerli dili al
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  // Desteklenen dilleri al
  getSupportedLanguages(): Array<{ code: SupportedLanguage; name: string; nativeName: string }> {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
    ];
  }

  // Dil adını al
  getLanguageName(code: SupportedLanguage): string {
    const language = this.getSupportedLanguages().find(lang => lang.code === code);
    return language?.nativeName || code;
  }
}

// Singleton instance
export const localeService = new LocaleService();
export default localeService;
