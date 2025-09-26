// Locale Service - Çok dilli yapı yönetimi
import { storageService } from '../storage';

export type SupportedLanguage = 'en' | 'tr' | 'de' | 'fr' | 'it' | 'es';

export interface LocaleConfig {
  language: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
}

class LocaleService {
  private currentLanguage: SupportedLanguage = 'en';
  private fallbackLanguage: SupportedLanguage = 'en';
  private translations: Record<string, any> = {};
  private fallbackTranslations: Record<string, any> = {};

  // Dil servisini başlat
  async initialize(): Promise<void> {
    try {
      // Kayıtlı dili yükle
      const savedLanguage = await storageService.get<SupportedLanguage>('selected_language');
      if (savedLanguage && this.isValidLanguage(savedLanguage)) {
        this.currentLanguage = savedLanguage;
      }

      // Yedek çevirileri hazırla ve ardından aktif dili yükle
      await this.ensureFallbackTranslationsLoaded();
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
    await this.ensureFallbackTranslationsLoaded();

    try {
      // Statik import kullan
      const translations = await this.getTranslationsForLanguage(language);
      this.translations = translations;
    } catch (error) {
      console.error(`❌ Failed to load translations for ${language}:`, error);
      this.translations = this.fallbackTranslations;
    }
  }

  private async ensureFallbackTranslationsLoaded(): Promise<void> {
    if (Object.keys(this.fallbackTranslations).length > 0) {
      return;
    }

    try {
      this.fallbackTranslations = await this.getTranslationsForLanguage(this.fallbackLanguage);
    } catch (error) {
      console.error(`❌ Failed to load fallback translations for ${this.fallbackLanguage}:`, error);
      this.fallbackTranslations = {};
    }
  }

  // Dil için çevirileri al
  private async getTranslationsForLanguage(language: SupportedLanguage): Promise<any> {
    switch (language) {
      case 'en':
        return {
          common: await this.unwrapJsonModule(import('@/locales/en/common.json')),
          navigation: await this.unwrapJsonModule(import('@/locales/en/navigation.json')),
          screens: {
            home: await this.unwrapJsonModule(import('@/locales/en/screens/home.json')),
            settings: await this.unwrapJsonModule(import('@/locales/en/screens/settings.json')),
            categories: await this.unwrapJsonModule(import('@/locales/en/screens/categories.json')),
            add_income: await this.unwrapJsonModule(import('@/locales/en/screens/add_income.json')),
            add_payment: await this.unwrapJsonModule(import('@/locales/en/screens/add_payment.json')),
            add_entry: await this.unwrapJsonModule(import('@/locales/en/screens/add_entry.json')),
            payments_hub: await this.unwrapJsonModule(import('@/locales/en/screens/payments_hub.json')),
            reports: await this.unwrapJsonModule(import('@/locales/en/screens/reports.json')),
            report_builder: await this.unwrapJsonModule(import('@/locales/en/screens/report_builder.json')),
            payments: await this.unwrapJsonModule(import('@/locales/en/screens/payments.json')),
            incomes: await this.unwrapJsonModule(import('@/locales/en/screens/incomes.json')),
            reports_hub: await this.unwrapJsonModule(import('@/locales/en/screens/reports_hub.json')),
            profile: await this.unwrapJsonModule(import('@/locales/en/screens/profile.json')),
            ui_demo: await this.unwrapJsonModule(import('@/locales/en/screens/ui_demo.json')),
          }
        };
      case 'tr':
        return {
          common: await this.unwrapJsonModule(import('@/locales/tr/common.json')),
          navigation: await this.unwrapJsonModule(import('@/locales/tr/navigation.json')),
          screens: {
            home: await this.unwrapJsonModule(import('@/locales/tr/screens/home.json')),
            settings: await this.unwrapJsonModule(import('@/locales/tr/screens/settings.json')),
            categories: await this.unwrapJsonModule(import('@/locales/tr/screens/categories.json')),
            add_income: await this.unwrapJsonModule(import('@/locales/tr/screens/add_income.json')),
            add_payment: await this.unwrapJsonModule(import('@/locales/tr/screens/add_payment.json')),
            add_entry: await this.unwrapJsonModule(import('@/locales/tr/screens/add_entry.json')),
            payments_hub: await this.unwrapJsonModule(import('@/locales/tr/screens/payments_hub.json')),
            reports: await this.unwrapJsonModule(import('@/locales/tr/screens/reports.json')),
            report_builder: await this.unwrapJsonModule(import('@/locales/tr/screens/report_builder.json')),
            payments: await this.unwrapJsonModule(import('@/locales/tr/screens/payments.json')),
            incomes: await this.unwrapJsonModule(import('@/locales/tr/screens/incomes.json')),
            reports_hub: await this.unwrapJsonModule(import('@/locales/tr/screens/reports_hub.json')),
            profile: await this.unwrapJsonModule(import('@/locales/tr/screens/profile.json')),
            ui_demo: await this.unwrapJsonModule(import('@/locales/tr/screens/ui_demo.json')),
          }
        };
      case 'de':
        return {
          common: await this.unwrapJsonModule(import('@/locales/de/common.json')),
          navigation: await this.unwrapJsonModule(import('@/locales/de/navigation.json')),
          screens: {
            home: await this.unwrapJsonModule(import('@/locales/de/screens/home.json')),
            settings: await this.unwrapJsonModule(import('@/locales/de/screens/settings.json')),
            categories: await this.unwrapJsonModule(import('@/locales/de/screens/categories.json')),
            add_payment: await this.unwrapJsonModule(import('@/locales/de/screens/add_payment.json')),
            payments: await this.unwrapJsonModule(import('@/locales/de/screens/payments.json')),
            incomes: await this.unwrapJsonModule(import('@/locales/de/screens/incomes.json')),
            reports_hub: await this.unwrapJsonModule(import('@/locales/de/screens/reports_hub.json')),
            profile: await this.unwrapJsonModule(import('@/locales/de/screens/profile.json')),
            ui_demo: await this.unwrapJsonModule(import('@/locales/de/screens/ui_demo.json')),
          }
        };
      case 'fr':
        return {
          common: await this.unwrapJsonModule(import('@/locales/fr/common.json')),
          navigation: await this.unwrapJsonModule(import('@/locales/fr/navigation.json')),
          screens: {
            home: await this.unwrapJsonModule(import('@/locales/fr/screens/home.json')),
            settings: await this.unwrapJsonModule(import('@/locales/fr/screens/settings.json')),
            categories: await this.unwrapJsonModule(import('@/locales/fr/screens/categories.json')),
            add_payment: await this.unwrapJsonModule(import('@/locales/fr/screens/add_payment.json')),
            payments: await this.unwrapJsonModule(import('@/locales/fr/screens/payments.json')),
            incomes: await this.unwrapJsonModule(import('@/locales/fr/screens/incomes.json')),
            reports_hub: await this.unwrapJsonModule(import('@/locales/fr/screens/reports_hub.json')),
            profile: await this.unwrapJsonModule(import('@/locales/fr/screens/profile.json')),
            ui_demo: await this.unwrapJsonModule(import('@/locales/fr/screens/ui_demo.json')),
          }
        };
      case 'it':
        return {
          common: await this.unwrapJsonModule(import('@/locales/it/common.json')),
          navigation: await this.unwrapJsonModule(import('@/locales/it/navigation.json')),
          screens: {
            home: await this.unwrapJsonModule(import('@/locales/it/screens/home.json')),
            settings: await this.unwrapJsonModule(import('@/locales/it/screens/settings.json')),
            categories: await this.unwrapJsonModule(import('@/locales/it/screens/categories.json')),
            add_payment: await this.unwrapJsonModule(import('@/locales/it/screens/add_payment.json')),
            payments: await this.unwrapJsonModule(import('@/locales/it/screens/payments.json')),
            incomes: await this.unwrapJsonModule(import('@/locales/it/screens/incomes.json')),
            reports_hub: await this.unwrapJsonModule(import('@/locales/it/screens/reports_hub.json')),
            profile: await this.unwrapJsonModule(import('@/locales/it/screens/profile.json')),
            ui_demo: await this.unwrapJsonModule(import('@/locales/it/screens/ui_demo.json')),
          }
        };
      case 'es':
        return {
          common: await this.unwrapJsonModule(import('@/locales/es/common.json')),
          navigation: await this.unwrapJsonModule(import('@/locales/es/navigation.json')),
          screens: {
            home: await this.unwrapJsonModule(import('@/locales/es/screens/home.json')),
            settings: await this.unwrapJsonModule(import('@/locales/es/screens/settings.json')),
            categories: await this.unwrapJsonModule(import('@/locales/es/screens/categories.json')),
            add_payment: await this.unwrapJsonModule(import('@/locales/es/screens/add_payment.json')),
            payments: await this.unwrapJsonModule(import('@/locales/es/screens/payments.json')),
            incomes: await this.unwrapJsonModule(import('@/locales/es/screens/incomes.json')),
            reports_hub: await this.unwrapJsonModule(import('@/locales/es/screens/reports_hub.json')),
            profile: await this.unwrapJsonModule(import('@/locales/es/screens/profile.json')),
            ui_demo: await this.unwrapJsonModule(import('@/locales/es/screens/ui_demo.json')),
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
    let value = this.getTranslationValue(this.translations, key);

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
    if (Object.keys(this.fallbackTranslations).length > 0) {
      const fallbackValue = this.getTranslationValue(this.fallbackTranslations, key);
      if (typeof fallbackValue === 'string') {
        return fallbackValue;
      }
    }

    const currentValue = this.getTranslationValue(this.translations, key);
    if (typeof currentValue === 'string') {
      return currentValue;
    }

    return key;
  }

  private getTranslationValue(source: Record<string, any>, key: string): any {
    return key.split('.').reduce<any>((acc, current) => {
      if (acc && typeof acc === 'object' && current in acc) {
        return acc[current];
      }

      return undefined;
    }, source);
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

  private async unwrapJsonModule<T>(loader: Promise<any>): Promise<T> {
    const mod = await loader;

    if (mod == null) {
      throw new Error('Failed to load translation module');
    }

    return (mod.default ?? mod) as T;
  }
}

// Singleton instance
export const localeService = new LocaleService();
export default localeService;
