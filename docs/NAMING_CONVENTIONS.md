# Naming Conventions

Tutarlı isimlendirme, okunabilirliği ve aramayı kolaylaştırır.

## Dosya/Klasör
- Bileşen/Sayfa dosyaları: PascalCase (`EditCategoryScreen.tsx`, `Button.tsx`)
- Hook’lar: camelCase ve `use` prefix (`useCategories.ts`)
- Store/Service: kebab-case veya camelCase dosya adı; içeride export’lar anlamlı
- Stil dosyaları: `ComponentName.styles.ts`
- Test: `*.test.ts(x)`

## Kod
- Bileşen ve sınıflar: PascalCase
- Fonksiyon/değişken: camelCase
- Sabitler/enum: UPPER_SNAKE_CASE veya PascalCase enum
- Event handler’lar: `onX`, `handleX` kalıpları

## Ekran ve Navigasyon
- Ekran bileşeni: `XyzScreen`
- Stack/Tab tanımları: `XyzStack`, `MainTab`
- Route param tipleri: `XyzStackParamList`

