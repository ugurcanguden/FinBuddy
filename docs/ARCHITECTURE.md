# Architecture

Bu doküman, uygulamanın katmanlarını, klasör yapılanmasını ve akışlarını açıklar.

## Katmanlar
- UI (Screens & Components): Ekranlar `screens/`, tekrar kullanılabilir bileşenler `components/`.
- Navigation: `navigation/` altında yönlendirme ve tipler.
- State Management: `store/` (Redux/Zustand/Recoil, ekip tercihinize göre).
- Data/Services: `services/` altında API, storage, adapterlar.
- Utilities/Theme/Types: Yardımcılar, tema token’ları ve paylaşılan tipler.

## Önerilen Dizin Yapısı
```
src/
  App.tsx
  navigation/
    AppNavigator.tsx
    types.ts
  screens/
    CategoriesScreen.tsx
    EditCategoryScreen.tsx
  components/
    Button/
      Button.tsx
      Button.styles.ts
      index.ts
  hooks/
    useCategories.ts
  services/
    api/
      client.ts
      categories.api.ts
    storage/
      mmkv.ts
  store/
    categories.store.ts
  theme/
    colors.ts
    spacing.ts
  types/
    index.ts
  utils/
    format.ts
```

## Veri Akışı
1) UI etkileşimi (Screen/Component)
2) İş kuralları + state güncelleme (`store/` veya local state)
3) Gerekirse servis çağrısı (`services/api/...`)
4) Sonuç UI’a yansır

## Hatalar ve Yükleniyor Durumu
- API çağrıları için loading ve error state’lerini merkezi veya lokal yönetin.
- Kullanıcıya anlaşılır geri bildirim: Toast/Alert veya inline hata mesajı.

## Navigasyon İlkeleri
- Rotalar `navigation/` içinde tipiyle tanımlanır.
- Ekranlar, route params’larını props tipiyle açıkça alır.

## Modül Sınırları
- Ekrana özgü yardımcıları ekran klasöründe tutun.
- Genel yardımcıları `utils/` altında tutun.
- Servislerin UI’yı import etmesine izin vermeyin (tek yönlü bağımlılık).

