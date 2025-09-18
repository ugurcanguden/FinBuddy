# FinBuddy - Geliştirici Rehberi

## 📋 Proje Genel Bakış

FinBuddy, kişisel finans yönetimi için geliştirilmiş bir React Native (Expo) uygulamasıdır. Bu doküman, projeye katkıda bulunan tüm geliştiriciler için kodlama standartları, proje yapısı ve geliştirme süreçlerini açıklar.

## 🏗️ Proje Yapısı

```
FinBuddy/
├── src/
│   ├── components/          # Yeniden kullanılabilir UI bileşenleri
│   │   ├── common/         # Genel amaçlı bileşenler
│   │   │   ├── View.tsx        # Tema destekli View bileşeni
│   │   │   ├── Text.tsx        # Tema destekli Text bileşeni
│   │   │   ├── ScrollView.tsx  # Tema destekli ScrollView bileşeni
│   │   │   ├── TouchableOpacity.tsx # Tema destekli TouchableOpacity bileşeni
│   │   │   ├── Switch.tsx      # Tema destekli Switch bileşeni
│   │   │   ├── StatusBar.tsx   # Tema destekli StatusBar bileşeni
│   │   │   ├── SafeArea.tsx    # Tema destekli SafeAreaView bileşeni
│   │   │   ├── Container.tsx   # Tema destekli container bileşeni
│   │   │   ├── Card.tsx        # Tema destekli kart bileşeni
│   │   │   ├── Button.tsx      # Tema destekli buton bileşeni
│   │   │   ├── Dropdown.tsx    # Açılır menü bileşeni
│   │   │   ├── RadioButton.tsx # Radyo buton bileşeni
│   │   │   ├── PageHeader.tsx  # Sayfa başlığı bileşeni
│   │   │   ├── Layout.tsx      # Ana layout bileşeni
│   │   │   └── BottomTabBar.tsx # Alt navigasyon bileşeni
│   │   ├── navigation/     # Navigasyon bileşenleri
│   │   └── AppNavigator.tsx # Ana navigasyon bileşeni
│   ├── screens/            # Ekran bileşenleri
│   │   ├── HomeScreen.tsx  # Ana sayfa
│   │   ├── SettingsScreen.tsx # Ayarlar sayfası
│   │   └── CategoriesScreen.tsx # Kategoriler sayfası
│   ├── services/           # Servis katmanı
│   │   ├── database/       # Veritabanı servisleri
│   │   ├── locale/         # Çok dilli servis
│   │   └── text/           # Text entity servisi
│   ├── hooks/              # React hookları
│   │   ├── useStorage.ts   # Storage hookları
│   │   ├── useLocale.ts    # Çok dilli hook
│   │   └── useNavigation.ts # Navigasyon hook
│   ├── constants/          # Sabitler ve konfigürasyon
│   │   ├── colors.ts       # Tema renkleri
│   │   ├── storageKeys.ts  # Storage anahtarları
│   │   └── scripts/        # SQL scriptleri
│   ├── locales/            # Çok dilli dosyalar
│   │   ├── tr/             # Türkçe
│   │   ├── en/             # İngilizce
│   │   ├── de/             # Almanca
│   │   ├── fr/             # Fransızca
│   │   ├── it/             # İtalyanca
│   │   └── es/             # İspanyolca
│   └── types/              # TypeScript tip tanımları
├── docs/                   # Proje dokümantasyonu
├── App.tsx                 # Ana uygulama bileşeni
└── package.json
```

## 📝 Kodlama Standartları

### 1. Genel Kurallar

- **Dil**: Tüm kod yorumları ve değişken isimleri Türkçe olacak
- **TypeScript**: Tüm dosyalar .tsx/.ts uzantısı ile yazılacak
- **Format**: Prettier ve ESLint kullanılacak
- **Indentation**: 2 boşluk kullanılacak
- **Satır Uzunluğu**: Maksimum 100 karakter
- **Dosya Adlandırma**: PascalCase (bileşenler), camelCase (fonksiyonlar), kebab-case (dosyalar)
- **Tip Güvenliği**: Tüm fonksiyonlar ve bileşenler için tip tanımları zorunlu

### 2. TypeScript Alias Kullanımı

#### Alias Yapılandırması
Projede TypeScript alias'ları kullanarak temiz import'lar sağlıyoruz. Her klasörde `index.tsx` dosyası ile export'ları organize ediyoruz.

#### Klasör Yapısı ve Export'lar
```
src/
├── components/
│   ├── index.tsx          # Tüm bileşenler buradan export edilir
│   └── common/
│       ├── index.tsx      # Common bileşenler
│       └── Button.tsx
├── screens/
│   ├── index.tsx          # Tüm ekranlar buradan export edilir
│   ├── auth/
│   │   └── index.tsx      # Auth ekranları
│   └── main/
│       └── index.tsx      # Main ekranları
├── services/
│   └── index.tsx          # Tüm servisler
├── hooks/
│   └── index.tsx          # Tüm hooklar
├── utils/
│   └── index.tsx          # Tüm yardımcı fonksiyonlar
├── constants/
│   └── index.tsx          # Tüm sabitler
├── types/
│   └── index.tsx          # Tüm tip tanımları
└── index.tsx              # Ana export dosyası
```

#### Import Kullanım Örnekleri
```typescript
// ✅ Doğru - Alias kullanımı
import { Button, Input } from '@/components';
import { AnaSayfa, ProfilEkranı } from '@/screens';
import { storageService } from '@/services';
import { useThemeSettings, useUserSettings } from '@/hooks';
import { formatTarih, hesaplaToplam } from '@/utils';
import { STORAGE_KEYS } from '@/constants';
import { BaseComponentProps, ApiResponse } from '@/types';

// ❌ Yanlış - Relative path kullanımı
import { Button } from '../components/common/Button';
import { AnaSayfa } from '../screens/main/AnaSayfa';
import { storageService } from '../services/storage';
```

#### Index.tsx Dosyası Örneği
```typescript
// src/components/index.tsx
export { default as Button } from './common/Button';
export { default as Input } from './common/Input';
export { default as Card } from './common/Card';

// src/components/common/index.tsx
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';

// src/services/index.tsx
export { default as ApiServisi } from './apiServisi';
export { default as AuthServisi } from './authServisi';
export { default as StorageServisi } from './storageServisi';
```

#### tsconfig.json Alias Yapılandırması
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components": ["src/components"],
      "@/screens": ["src/screens"],
      "@/services": ["src/services"],
      "@/hooks": ["src/hooks"],
      "@/utils": ["src/utils"],
      "@/constants": ["src/constants"],
      "@/types": ["src/types"],
      "@/assets": ["src/assets"],
      "@/navigation": ["src/navigation"]
    }
  }
}
```

### 3. Component Props Organizasyonu

#### Props Tiplerini Nerede Tanımlamalı?
Component'lerin props tiplerini kendi dosyalarında tanımlamak en iyi pratiktir. Bu sayede:
- Component ve props'u birlikte tutar
- Daha kolay bakım yapılır
- Import'lar daha temiz olur
- Component bağımsızlığı sağlanır

#### Doğru Yaklaşım
```typescript
// src/components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BaseComponentProps } from '@/types';

// ✅ Props tipini component dosyasında tanımla
export interface ButtonProps extends BaseComponentProps {
  başlık: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({ başlık, onPress, ...props }) => {
  // Component içeriği
};

export default Button;
```

#### Index.tsx'te Export
```typescript
// src/components/common/index.tsx
// Component'i export et
export { default as Button } from './Button';

// Props tipini de export et
export type { ButtonProps } from './Button';
```

#### Kullanım
```typescript
// Başka bir dosyada kullanım
import { Button, ButtonProps } from '@/components';

// Veya sadece tip için
import type { ButtonProps } from '@/components';
```

#### Yanlış Yaklaşım
```typescript
// ❌ Tüm props tiplerini types/index.tsx'te toplamak
// types/index.tsx
export interface ButtonProps { ... }
export interface InputProps { ... }
export interface CardProps { ... }
// Bu yaklaşım dosyayı şişirir ve bakımı zorlaştırır
```

#### Genel Tipler
Sadece gerçekten genel olan tipleri `types/index.tsx`'te tutun:
```typescript
// types/index.tsx - Sadece genel tipler
export interface BaseComponentProps {
  testID?: string;
  style?: any;
}

export interface ApiResponse<T> {
  başarılı: boolean;
  veri?: T;
  hata?: string;
}

export type ParaBirimi = 'TRY' | 'USD' | 'EUR';
```

### 4. Çok Dilli Sistem (i18n)

#### Dil Yapısı
Projede 6 dil desteği bulunmaktadır: Türkçe, İngilizce, Almanca, Fransızca, İtalyanca, İspanyolca. Her dil için ayrı klasör yapısı kullanılmaktadır.

#### Dil Dosya Organizasyonu
```
src/locales/
├── tr/                    # Türkçe
│   ├── categories/
│   │   ├── common.json    # Genel metinler
│   │   └── navigation.json # Navigasyon metinleri
│   └── screens/
│       ├── home.json      # Ana sayfa metinleri
│       └── settings.json  # Ayarlar metinleri
├── en/                    # İngilizce
├── de/                    # Almanca
├── fr/                    # Fransızca
├── it/                    # İtalyanca
└── es/                    # İspanyolca
```

#### LocaleService Kullanımı
```typescript
// Locale servisi kullanımı
import { localeService } from '@/services';

// Dil değiştirme
await localeService.setLanguage('en');

// Çeviri alma
const title = localeService.getTranslation('screens.home.title');

// Parametreli çeviri
const message = localeService.getTranslationWithParams('common.messages.welcome', { name: 'Ahmet' });
```

#### useLocale Hook Kullanımı
```typescript
// React bileşenlerinde kullanım
import { useLocale } from '@/hooks';

const MyComponent = () => {
  const { 
    currentLanguage, 
    loading, 
    t, 
    changeLanguage, 
    getSupportedLanguages 
  } = useLocale();

  return (
    <View>
      <Text>{t('screens.home.title')}</Text>
      <Button 
        title={t('common.buttons.change_language')} 
        onPress={() => changeLanguage('en')} 
      />
    </View>
  );
};
```

#### usePaymentReminders Hook Kullanımı
```typescript
// Payment reminders ayarları için hook
import { usePaymentReminders } from '@/hooks';

const MyComponent = () => {
  const { 
    settings, 
    loading, 
    toggleReminders, 
    updateTime, 
    updateDays 
  } = usePaymentReminders();

  return (
    <View>
      <Switch 
        value={settings.enabled}
        onValueChange={toggleReminders}
      />
      <Text>Zaman: {settings.time}</Text>
      <Text>Günler: {settings.days.join(', ')}</Text>
    </View>
  );
};
```

### 7. Layout Yapısı

#### Layout Component Kullanımı
Projede tüm sayfalarda tutarlı yapı için Layout component'i kullanılmaktadır. Bu component header, body ve footer alanlarını organize eder.

#### Layout Yapısı
```
┌─────────────────────────────────┐
│           HEADER                │ ← PageHeader veya özel component
├─────────────────────────────────┤
│                                 │
│           BODY                  │ ← Ana içerik (flex: 1)
│        (Content Area)           │
│                                 │
├─────────────────────────────────┤
│           FOOTER                │ ← BottomTabBar veya özel component
└─────────────────────────────────┘
```

#### Layout Props
```typescript
interface LayoutProps {
  children: React.ReactNode;           // Ana içerik
  showHeader?: boolean;                // Header göster/gizle (default: true)
  showFooter?: boolean;                // Footer göster/gizle (default: true)
  headerComponent?: React.ReactNode;   // Özel header component
  footerComponent?: React.ReactNode;   // Özel footer component
  style?: any;                        // Layout stili
  contentStyle?: any;                 // Content stili
}
```

#### Layout Kullanım Örnekleri
```typescript
// Basit layout
<Layout>
  <Text>Ana içerik</Text>
</Layout>

// Header ile layout
<Layout
  headerComponent={
    <PageHeader
      title="Sayfa Başlığı"
      showBackButton={true}
      onBackPress={goBack}
    />
  }
>
  <ScrollView>
    <Text>Ana içerik</Text>
  </ScrollView>
</Layout>

// Özel footer ile layout
<Layout
  headerComponent={<PageHeader title="Ayarlar" />}
  footerComponent={<CustomFooter />}
>
  <Text>Ayarlar içeriği</Text>
</Layout>

// Header ve footer olmadan layout
<Layout showHeader={false} showFooter={false}>
  <Text>Sadece içerik</Text>
</Layout>
```

#### PageHeader Component
Sayfa başlıkları için tutarlı tasarım sağlar.

```typescript
interface PageHeaderProps {
  title: string;                      // Sayfa başlığı (zorunlu)
  showBackButton?: boolean;           // Geri butonu göster/gizle
  onBackPress?: () => void;          // Geri butonu tıklama fonksiyonu
  rightElement?: React.ReactNode;     // Sağ tarafta gösterilecek element
  style?: any;                       // Özel stil
}
```

#### PageHeader Kullanım Örnekleri
```typescript
// Basit başlık
<PageHeader title="Ana Sayfa" />

// Geri butonu ile
<PageHeader 
  title="Kategoriler" 
  showBackButton={true} 
  onBackPress={goBack} 
/>

// Sağ element ile
<PageHeader 
  title="Ana Sayfa" 
  rightElement={<Text>Alt başlık</Text>} 
/>
```

#### Layout Avantajları
- ✅ **Tutarlılık** - Tüm sayfalarda aynı yapı
- ✅ **Bakım Kolaylığı** - Tek yerden değişiklik
- ✅ **Kod Temizliği** - Tekrar eden kod yok
- ✅ **Esneklik** - İsteğe bağlı header/footer
- ✅ **Tema Uyumu** - Otomatik tema renkleri
- ✅ **Responsive** - Tüm ekran boyutlarında uyumlu

### 8. Base Components Kullanımı

#### ⚠️ ÖNEMLİ KURAL: React Native Component'leri Kullanma
**Projede React Native'den direkt component kullanmak YASAKTIR!** Tüm component'ler base components'ten alınmalıdır.

#### ❌ YANLIŞ KULLANIM
```typescript
// YASAK - React Native'den direkt import
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const MyComponent = () => {
  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text }}>Metin</Text>
      <TouchableOpacity onPress={() => {}}>
        <Text>Buton</Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### ✅ DOĞRU KULLANIM
```typescript
// DOĞRU - Base components'ten import
import { View, Text, TouchableOpacity, ScrollView } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  return (
    <View theme={theme} variant="surface">
      <Text theme={theme} variant="primary">Metin</Text>
      <TouchableOpacity theme={theme} variant="primary" onPress={() => {}}>
        <Text theme={theme} variant="primary">Buton</Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### Temel Bileşenler
Projede tüm sayfalarda tutarlı tasarım için tema destekli base component'ler kullanılmaktadır. Bu component'ler React Native'in temel bileşenlerini sarmalayarak tema sistemi ile entegre eder.

#### Button Bileşeni
```typescript
// Button kullanımı
import { Button } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  return (
    <Button
      title="Buton Başlığı"
      onPress={() => console.log('Button pressed')}
      theme={theme}
      variant="primary" // primary, secondary, outline, ghost
      size="medium" // small, medium, large
      disabled={false}
    />
  );
};
```

#### Card Bileşeni
```typescript
// Card kullanımı
import { Card } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  return (
    <Card
      theme={theme}
      variant="default" // default, elevated, outlined
      padding="medium" // none, small, medium, large
    >
      <Text>Kart içeriği</Text>
    </Card>
  );
};
```

#### Text Bileşeni
```typescript
// Text kullanımı
import { Text } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  return (
    <Text
      theme={theme}
      variant="primary" // primary, secondary, accent, error, success, warning
      size="medium" // small, medium, large, xlarge
      weight="normal" // normal, medium, semibold, bold
      align="left" // left, center, right
    >
      Metin içeriği
    </Text>
  );
};
```

#### Container Bileşeni
```typescript
// Container kullanımı
import { Container } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  return (
    <Container
      theme={theme}
      variant="default" // default, surface, background
      padding="medium" // none, small, medium, large
      margin="none" // none, small, medium, large
    >
      <Text>Container içeriği</Text>
    </Container>
  );
};
```

#### SafeArea Bileşeni
```typescript
// SafeArea kullanımı
import { SafeArea } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  return (
    <SafeArea
      theme={theme}
      variant="default" // default, surface, background
    >
      <Text>SafeArea içeriği</Text>
    </SafeArea>
  );
};
```

#### View Bileşeni
```typescript
// View kullanımı
import { View } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  return (
    <View
      theme={theme}
      variant="surface" // default, surface, background, transparent
    >
      <Text>View içeriği</Text>
    </View>
  );
};
```

#### ScrollView Bileşeni
```typescript
// ScrollView kullanımı
import { ScrollView } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  return (
    <ScrollView
      theme={theme}
      variant="transparent" // default, surface, background, transparent
      showsVerticalScrollIndicator={false}
    >
      <Text>ScrollView içeriği</Text>
    </ScrollView>
  );
};
```

#### TouchableOpacity Bileşeni
```typescript
// TouchableOpacity kullanımı
import { TouchableOpacity } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  return (
    <TouchableOpacity
      theme={theme}
      variant="primary" // default, primary, secondary, transparent
      onPress={() => console.log('Pressed')}
    >
      <Text>TouchableOpacity içeriği</Text>
    </TouchableOpacity>
  );
};
```

#### Switch Bileşeni
```typescript
// Switch kullanımı
import { Switch } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <Switch
      theme={theme}
      value={isEnabled}
      onValueChange={setIsEnabled}
    />
  );
};
```

#### StatusBar Bileşeni
```typescript
// StatusBar kullanımı
import { StatusBar } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  return (
    <StatusBar
      theme={theme}
      backgroundColor={theme === 'colorful' ? '#001f3f' : undefined}
    />
  );
};
```

#### Layout Bileşeni
```typescript
// Layout kullanımı
import { Layout, PageHeader } from '@/components';

const MyScreen = () => {
  return (
    <Layout
      headerComponent={
        <PageHeader
          title="Sayfa Başlığı"
          showBackButton={true}
          onBackPress={goBack}
        />
      }
    >
      <ScrollView>
        <Text>Ana içerik</Text>
      </ScrollView>
    </Layout>
  );
};
```

#### PageHeader Bileşeni
```typescript
// PageHeader kullanımı
import { PageHeader } from '@/components';

const MyScreen = () => {
  return (
    <PageHeader
      title="Sayfa Başlığı"
      showBackButton={true}
      onBackPress={goBack}
      rightElement={<Text>Sağ element</Text>}
    />
  );
};
```

#### BottomTabBar Bileşeni
```typescript
// BottomTabBar kullanımı
import { BottomTabBar } from '@/components';

const MyScreen = ({ theme }: { theme: ThemeMode }) => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <View style={{ flex: 1 }}>
      {/* Sayfa içeriği */}
      
      <BottomTabBar
        theme={theme}
        activeTab={activeTab}
        onNavigateToHome={() => navigateTo('home')}
        onNavigateToAddPayment={() => console.log('Add payment')}
        onNavigateToCategories={() => navigateTo('categories')}
        onNavigateToReports={() => console.log('Reports')}
        onNavigateToSettings={() => navigateTo('settings')}
      />
    </View>
  );
};
```

#### Dropdown Bileşeni
```typescript
// Dropdown kullanımı
import { Dropdown } from '@/components';
import { LANGUAGE_OPTIONS } from '@/constants';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('tr');

  return (
    <Dropdown
      options={LANGUAGE_OPTIONS}
      selectedValue={selectedLanguage}
      onSelect={setSelectedLanguage}
      theme={theme}
      placeholder="Dil Seçiniz"
    />
  );
};
```

#### RadioButton Bileşeni
```typescript
// RadioButton kullanımı
import { RadioButton } from '@/components';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  const [selectedTheme, setSelectedTheme] = useState('light');

  const themeOptions = [
    { value: 'light', label: 'Açık Tema', description: 'Beyaz arka plan' },
    { value: 'dark', label: 'Koyu Tema', description: 'Siyah arka plan' },
    { value: 'colorful', label: 'Renkli Tema', description: 'Gradient arka plan' },
  ];

  return (
    <RadioButton
      options={themeOptions}
      selectedValue={selectedTheme}
      onSelect={setSelectedTheme}
      theme={theme}
      orientation="vertical"
    />
  );
};
```

#### Bileşen Props Tipleri
```typescript
// Button props
interface ButtonProps {
  title: string;
  onPress: () => void;
  theme: ThemeMode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

// Card props
interface CardProps {
  children: React.ReactNode;
  theme: ThemeMode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string;
}

// Text props
interface TextProps {
  children: React.ReactNode;
  theme: ThemeMode;
  variant?: 'primary' | 'secondary' | 'accent' | 'error' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  testID?: string;
}

// Container props
interface ContainerProps {
  children: React.ReactNode;
  theme: ThemeMode;
  variant?: 'default' | 'surface' | 'background';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string;
}

// SafeArea props
interface SafeAreaProps {
  children: React.ReactNode;
  theme: ThemeMode;
  variant?: 'default' | 'surface' | 'background';
  style?: ViewStyle;
  testID?: string;
}

// View props
interface ViewProps {
  children?: React.ReactNode;
  theme: ThemeMode;
  variant?: 'default' | 'surface' | 'background' | 'transparent';
  style?: ViewStyle;
  testID?: string;
}

// ScrollView props
interface ScrollViewProps {
  children: React.ReactNode;
  theme: ThemeMode;
  variant?: 'default' | 'surface' | 'background' | 'transparent';
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// TouchableOpacity props
interface TouchableOpacityProps {
  children: React.ReactNode;
  theme: ThemeMode;
  variant?: 'default' | 'primary' | 'secondary' | 'transparent';
  onPress: () => void;
  disabled?: boolean;
  activeOpacity?: number;
  style?: ViewStyle;
  testID?: string;
}

// Switch props
interface SwitchProps {
  theme: ThemeMode;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

// StatusBar props
interface StatusBarProps {
  theme: ThemeMode;
  backgroundColor?: string;
}

// BottomTabBar props
interface BottomTabBarProps {
  theme: ThemeMode;
  activeTab: string;
  onNavigateToHome: () => void;
  onNavigateToAddPayment: () => void;
  onNavigateToCategories: () => void;
  onNavigateToReports: () => void;
  onNavigateToSettings: () => void;
}

// Dropdown props
interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  theme: ThemeMode;
  disabled?: boolean;
  style?: any;
}

// RadioButton props
interface RadioButtonProps {
  options: RadioOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  theme: ThemeMode;
  disabled?: boolean;
  style?: any;
  orientation?: 'vertical' | 'horizontal';
}

// Layout props
interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  style?: any;
  contentStyle?: any;
}

// PageHeader props
interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  style?: any;
}
```

#### Dil Ekleme Süreci
1. Yeni dil klasörü oluştur: `src/locales/xx/`
2. Kategorilere göre JSON dosyaları oluştur
3. `localeService.ts`'te yeni dili ekle
4. `SupportedLanguage` tipine yeni dili ekle

### 5. Navigasyon Sistemi

#### useNavigation Hook
```typescript
// Navigasyon hook kullanımı
import { useNavigation } from '@/hooks';

const MyComponent = () => {
  const { currentScreen, navigateTo, goBack, resetToHome } = useNavigation();

  return (
    <View>
      <Button title="Ayarlar" onPress={() => navigateTo('settings')} />
      <Button title="Geri" onPress={goBack} />
      <Button title="Ana Sayfa" onPress={resetToHome} />
    </View>
  );
};
```

#### AppNavigator Bileşeni
```typescript
// Ana navigasyon bileşeni
import AppNavigator from '@/components/AppNavigator';

const App = () => {
  const [theme, setTheme] = useState<ThemeMode>('light');
  
  return (
    <AppNavigator 
      theme={theme} 
      onThemeChange={setTheme}
    />
  );
};
```

#### Desteklenen Ekranlar
- `home`: Ana sayfa
- `settings`: Ayarlar sayfası
- `categories`: Kategoriler sayfası
- `transactions`: İşlemler sayfası
- `accounts`: Hesaplar sayfası
- `reports`: Raporlar sayfası

### 6. Tema Yönetimi

#### Tema Modları
Projede 3 farklı tema modu bulunmaktadır:
- **Light Mode**: Açık tema (beyaz arka plan)
- **Dark Mode**: Koyu tema (siyah arka plan)
- **Colorful Mode**: Renkli tema (gradient arka plan)

#### Renk Paletleri
```typescript
// Renk sabitleri kullanımı
import { COLORS, ThemeMode } from '@/constants/colors';

const MyComponent = ({ theme }: { theme: ThemeMode }) => {
  const colors = COLORS[theme];
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        {colors.primary} // Ana renk
      </Text>
    </View>
  );
};
```

#### Tema Değiştirme
```typescript
// Tema değiştirme örneği
const handleThemeChange = (newTheme: ThemeMode) => {
  setCurrentTheme(newTheme);
  // Tema değişikliği tüm uygulamaya yansır
};
```

### 7. Veritabanı Yönetimi

#### SQLite Kullanımı
Projede verileri yönetmek için SQLite kullanıyoruz. Bu sayede karmaşık sorgular, ilişkisel veri yönetimi ve yüksek performans sağlanır.

#### Database Servisi
```typescript
// Database servisi kullanımı
import { databaseService } from '@/services';

// Veritabanını başlat
await databaseService.initialize();

// Sorgu çalıştır
const result = await databaseService.query('SELECT * FROM texts');

// Veri getir
const texts = await databaseService.getAll('SELECT * FROM texts');

// Transaction kullanımı
await databaseService.transaction(async () => {
  await databaseService.query('INSERT INTO texts ...');
  await databaseService.query('UPDATE texts ...');
});
```

#### Servis Katmanı
```typescript
// Text servisi kullanımı
import { textService } from '@/services';

// Text oluştur
const text = await textService.create({
  title: 'Başlık',
  content: 'İçerik metni'
});

// Text güncelle
await textService.update(text.id, {
  title: 'Güncellenmiş Başlık',
  content: 'Güncellenmiş içerik'
});

// Text sil
await textService.delete(text.id);

// Textleri getir
const texts = await textService.getAll();
const searchResults = await textService.search('arama terimi');
```

#### SQL Scripts Organizasyonu
```typescript
// Scripts klasör yapısı
src/constants/scripts/
└── textScripts/
    └── index.ts          # Text SQL scriptleri

// Script kullanımı
import { TEXT_SCRIPTS } from '@/constants/scripts';

const result = await databaseService.query(TEXT_SCRIPTS.INSERT, [
  id, title, content, is_active
]);
```

#### Veri Tipleri
```typescript
// Text tipi
interface Text {
  id: string;
  title: string;
  content?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Text oluşturma verisi
interface CreateTextData {
  title: string;
  content?: string;
}

// Text güncelleme verisi
interface UpdateTextData {
  title?: string;
  content?: string;
  is_active?: boolean;
}
```

#### Hata Yönetimi
```typescript
// Database hatalarını yakalama
try {
  await textService.create(textData);
} catch (error) {
  console.error('Database hatası:', error.message);
  // Kullanıcıya hata mesajı göster
}
```

#### Performans Optimizasyonu
```typescript
// Transaction kullanımı
await databaseService.transaction(async () => {
  // Birden fazla işlemi atomik olarak çalıştır
  await textService.create(text1);
  await textService.create(text2);
  await textService.update(text3.id, updateData);
});

// Batch işlemler
const texts = await textService.getAll();
const updatedTexts = texts.map(text => ({
  ...text,
  last_updated: new Date().toISOString()
}));
```

### 5. React Native Bileşen Kuralları

#### Bileşen Yapısı
```typescript
// 1. Import'lar (harici kütüphaneler önce)
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Yerel import'lar
import { CustomButton } from '@/components/common/CustomButton';
import { renkler } from '@/constants/renkler';
import { ButtonProps } from '@/types';

// 3. Tip tanımları
interface Props {
  başlık: string;
  onPress: () => void;
  testID?: string;
}

// 4. Bileşen tanımı
const ÖrnekBileşen: React.FC<Props> = ({ başlık, onPress, testID }) => {
  // 5. State ve hooks
  const [durum, setDurum] = useState<boolean>(false);

  // 6. Fonksiyonlar
  const handlePress = (): void => {
    setDurum(!durum);
    onPress();
  };

  // 7. Render
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.başlık}>{başlık}</Text>
      <CustomButton onPress={handlePress} />
    </View>
  );
};

// 8. Stil tanımları
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  başlık: {
    fontSize: 18,
    fontWeight: 'bold',
    color: renkler.ana,
  },
});

// 9. Export
export default ÖrnekBileşen;
```

### 3. Dosya Adlandırma Kuralları

- **Bileşenler**: `PascalCase.tsx` (örn: `AnaEkran.tsx`, `KullanıcıProfil.tsx`)
- **Hooks**: `camelCase.ts` (örn: `useKullanıcıVerisi.ts`)
- **Servisler**: `camelCase.ts` (örn: `apiServisi.ts`)
- **Sabitler**: `camelCase.ts` (örn: `renkler.ts`, `apiEndpoints.ts`)
- **Tipler**: `camelCase.ts` (örn: `kullanıcıTipleri.ts`)
- **Utils**: `camelCase.ts` (örn: `formatTarih.ts`, `hesaplaToplam.ts`)

### 4. Değişken ve Fonksiyon Adlandırma

```javascript
// ✅ Doğru
const kullanıcıAdı = 'Ahmet';
const hesapBakiyesi = 1500.50;
const islemGeçmişi = [];

const hesaplaToplamGider = (giderler) => {
  return giderler.reduce((toplam, gider) => toplam + gider.tutar, 0);
};

// ❌ Yanlış
const userName = 'Ahmet';
const accountBalance = 1500.50;
const transactionHistory = [];

const calculateTotalExpense = (expenses) => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};
```

### 5. Stil Kuralları

#### StyleSheet Kullanımı
```javascript
const styles = StyleSheet.create({
  // Ana container'lar
  container: {
    flex: 1,
    backgroundColor: renkler.arkaPlan,
  },
  
  // Metin stilleri
  başlık: {
    fontSize: 24,
    fontWeight: 'bold',
    color: renkler.ana,
    marginBottom: 16,
  },
  
  // Buton stilleri
  buton: {
    backgroundColor: renkler.ana,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  // Responsive tasarım
  '@media (min-width: 768)': {
    container: {
      paddingHorizontal: 32,
    },
  },
});
```

### 6. State Yönetimi

#### useState Kullanımı
```javascript
// Basit state'ler için
const [yüklü, setYüklü] = useState(false);
const [hata, setHata] = useState(null);

// Karmaşık state'ler için
const [kullanıcı, setKullanıcı] = useState({
  ad: '',
  soyad: '',
  email: '',
  telefon: '',
});
```

#### useEffect Kullanımı
```javascript
useEffect(() => {
  // Bileşen mount olduğunda çalışır
  verileriYükle();
  
  // Cleanup fonksiyonu
  return () => {
    // Bileşen unmount olduğunda çalışır
    temizle();
  };
}, []); // Boş dependency array = sadece mount/unmount

useEffect(() => {
  // kullanıcıId değiştiğinde çalışır
  if (kullanıcıId) {
    kullanıcıVerileriniGetir(kullanıcıId);
  }
}, [kullanıcıId]);
```

### 7. API ve Servis Katmanı

#### Servis Dosyası Yapısı
```javascript
// src/services/apiServisi.js
import { API_BASE_URL } from '../constants/apiEndpoints';

class ApiServisi {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`);
      return await response.json();
    } catch (error) {
      throw new Error(`API Hatası: ${error.message}`);
    }
  }

  async post(endpoint, veri) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(veri),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`API Hatası: ${error.message}`);
    }
  }
}

export default new ApiServisi();
```

### 8. Hata Yönetimi

```javascript
// Try-catch kullanımı
const verileriYükle = async () => {
  try {
    setYüklü(false);
    setHata(null);
    
    const veri = await apiServisi.get('/kullanıcı/veriler');
    setKullanıcıVerisi(veri);
  } catch (error) {
    setHata(error.message);
    console.error('Veri yükleme hatası:', error);
  } finally {
    setYüklü(true);
  }
};

// Hata bileşeni
const HataMesajı = ({ hata, onTekrarDene }) => {
  if (!hata) return null;
  
  return (
    <View style={styles.hataContainer}>
      <Text style={styles.hataMetni}>{hata}</Text>
      <CustomButton 
        başlık="Tekrar Dene" 
        onPress={onTekrarDene} 
      />
    </View>
  );
};
```

### 9. Performans Optimizasyonu

#### Memoization
```javascript
import React, { memo, useMemo, useCallback } from 'react';

// Bileşen memoization
const PahalıBileşen = memo(({ veri, onPress }) => {
  // Bileşen içeriği
});

// Hesaplama memoization
const toplamGider = useMemo(() => {
  return giderler.reduce((toplam, gider) => toplam + gider.tutar, 0);
}, [giderler]);

// Fonksiyon memoization
const handlePress = useCallback((id) => {
  onItemPress(id);
}, [onItemPress]);
```

### 10. Test Yazma

```javascript
// src/components/__tests__/CustomButton.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../CustomButton';

describe('CustomButton', () => {
  it('doğru başlığı gösterir', () => {
    const { getByText } = render(
      <CustomButton başlık="Test Butonu" onPress={() => {}} />
    );
    
    expect(getByText('Test Butonu')).toBeTruthy();
  });

  it('onPress çağrılır', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CustomButton başlık="Test" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

## 🚀 Geliştirme Süreci

### 1. Yeni Özellik Geliştirme
1. Feature branch oluştur: `git checkout -b feature/yeni-ozellik`
2. Kodlama standartlarına uygun kod yaz
3. Test yaz ve çalıştır
4. Pull request oluştur

### 2. Code Review Kriterleri
- Kodlama standartlarına uygunluk
- Performans optimizasyonu
- Hata yönetimi
- Test coverage
- Dokümantasyon

### 3. Commit Mesajları
```
feat: yeni özellik eklendi
fix: hata düzeltildi
docs: dokümantasyon güncellendi
style: kod formatı düzeltildi
refactor: kod yeniden düzenlendi
test: test eklendi
```

## 📱 Platform Özellikleri

### iOS
- Safe Area kullanımı
- iOS native bileşenleri
- App Store guidelines

### Android
- Material Design
- Android native bileşenleri
- Play Store guidelines

## 🔧 Gerekli Araçlar

- Node.js (v16+)
- Expo CLI
- VS Code (önerilen)
- React Native Debugger
- Flipper (debugging)

## 📚 Faydalı Kaynaklar

- [React Native Dokümantasyonu](https://reactnative.dev/)
- [Expo Dokümantasyonu](https://docs.expo.dev/)
- [TypeScript Rehberi](https://www.typescriptlang.org/docs/)

---

**Not**: Bu rehber sürekli güncellenmektedir. Yeni kurallar veya değişiklikler için dokümanı kontrol edin.
# Development Guide

Bu kılavuz, günlük geliştirme akışını, çalıştırma komutlarını, değişiklik süreçlerini ve Definition of Done ölçütlerini tanımlar.

## Amaçlar
- Tutarlı bir geliştirme akışı sağlamak
- Ekipçe anlaşılır standartlarla ilerlemek
- PR süresini kısaltmak ve kaliteyi artırmak

## Geliştirme Ortamı
- Node.js LTS (örn. 18+). Paket yöneticisi: npm (varsayılan).
- React Native ortamı: Expo (varsayılan)
  - Kurulum: `npm install`
  - Başlatma: `npm run start`

## Kurulum ve Çalıştırma
- Bağımlılıklar: `npm install`
- Çalıştırma (Expo): `npm run start`
- Platform kısayolları:
  - Android: `npm run android`
  - iOS: `npm run ios`

Proje özel komutları için `package.json` içindeki `scripts` alanına bakın.

## Klasör Yapısı (özet)
`src/` altında temel dizinler:
- `screens/`: Ekranlar (örn. `CategoriesScreen.tsx`, `EditCategoryScreen.tsx`)
- `components/`: Tekrar kullanılabilir UI bileşenleri
- `navigation/`: Navigasyon katmanı (örn. `AppNavigator.tsx`)
- `hooks/`: Özel React hook’ları (örn. `useCategories.ts`)
- `services/`: API, yerel depolama, ağ katmanı
- `store/`: Global state (Redux/Zustand/Recoil tercihinize göre)
- `utils/`: Yardımcı fonksiyonlar
- `theme/`: Renkler, tipografi, spacing
- `types/`: Paylaşılan TypeScript tipleri

Detaylar için `docs/ARCHITECTURE.md`.

## Geliştirme Akışı
1) Issue/brief hazırla: `docs/TASK_BRIEF_TEMPLATE.md` şablonunu kısaca doldur.
2) Dal aç: `feature/<kısa-konu>` veya `fix/<kısa-konu>`
3) Uygula: Küçük, odaklı commit’ler (Conventional Commits önerilir)
4) Test et: Manuel senaryolar + varsa birim testler
5) PR aç: `docs/PR_CHECKLIST.md` üzerinden doğrula

## Definition of Done (DoD)
- Kabul kriterleri sağlandı (brief’e göre)
- Derleme hatası yok; TypeScript hatası yok
- Temel flow’lar manuel test edildi (ekranlar arası navigasyon dahil)
- UI tutarlılığı: tema ve bileşen standartlarına uygun
- İlgili dokümantasyon güncellendi (gerekirse)

## Commit ve PR Kuralları
- Commit: Conventional Commits (örn. `feat: add category validation`)
- PR başlığı: Kısa ve amaca yönelik; açıklamada “Ne, Neden, Nasıl”
- Küçük PR’lar tercih edilir (kolay review, hızlı geri bildirim)
- GitHub şablonları: `.github/ISSUE_TEMPLATE/*` ve `.github/pull_request_template.md`

## Şablonlar
- Ekran şablonu: `templates/screen/ScreenTemplate.tsx`
- Bileşen şablonu: `templates/component/ComponentTemplate.tsx`

## Testler
- Önerilen kurulum ve örnek için `docs/TESTING_SETUP.md`

## Sık Kararlar (Hızlı Rehber)
- Yeni ekran mı, bileşen mi? Ekrana özel ise `screens/`, tekrar kullanılabilir ise `components/`.
- State nerede tutulmalı? UI’a özgü: local state; ekranlar arası paylaşılan: `store/` veya `context`.
- API çağrıları: `services/api/` altında tek yerde toplanmalı.

## SSS
- Expo mu RN CLI mı? Mevcut projeye göre tercih edin; her ikisi için komutlar yukarıda.
- Tasarım sistemi? `theme/` altında renk ve spacing token’ları kullanın; inline renk tanımlamayın.
