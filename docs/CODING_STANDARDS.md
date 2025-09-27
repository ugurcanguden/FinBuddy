# Coding Standards

Takımın ortak geliştirme kuralları ve tercihleri.

## TypeScript
- `strict` mod aktif ve açık tipler tercih edilir.
- Fonksiyon dönüş tiplerini belirtin; `any` kullanımı yasaktır.
- Entity tipleri `src/models/` altında tanımlanır.
- `src/types/` deprecated, `src/models/` kullanın.

## React (Native)
- Fonksiyonel bileşenler ve hooks kullanın.
- Side effect'leri `useEffect` içinde yönetin; temizleme fonksiyonlarını unutmayın.
- Bileşenleri küçük ve tek sorumlu tutun; prop sayısı artıyorsa parçalara bölün.
- Performans: `useMemo`, `useCallback`, `React.memo` gerekli yerlerde.
- Erişilebilirlik: `accessible` prop'ları, `accessibilityLabel` ve uygun rol/etiketler.
- **ÖNEMLİ**: React Native component'lerini direkt kullanmayın, base components'ten import edin.

## Stil ve Tema
- Renk/spacing gibi değerleri `theme/` üzerinden kullanın; sabit değer gömmeyin.
- StyleSheet veya styled yaklaşımı; projedeki mevcut pattern'e uyun.
- Base components kullanın; inline style'dan kaçının.
- Tema uyumlu renkler kullanın; hardcoded renkler yasaktır.

## İçe Aktarım Düzeni
1) React/React Native
2) Üçüncü parti
3) Proje içi mutlak/bağıl importlar (`@/` alias kullanın)
4) Stil/asset importları

### Import Örnekleri
```typescript
// ✅ Doğru
import React, { useState } from 'react'
import { View, Text } from '@/components'
import { useLocale } from '@/hooks'
import { Category } from '@/models'

// ❌ Yanlış
import { View, Text } from 'react-native'
import { Category } from '@/types'
```

## Hata Yönetimi
- Servis katmanında hata yakalayın ve anlamlı hatalar üretin.
- UI’da kullanıcı dostu mesaj gösterin; yalnızca konsol log bırakmayın.

## Testler
- Varsa birim testler `__tests__` veya `*.test.ts(x)` olarak.
- Saf yardımcı fonksiyonları test etmek en hızlı kazanımdır.

## Commit Mesajları
- Conventional Commits: `feat`, `fix`, `refactor`, `docs`, `chore`, `test` vb.
- Kısa özet + isteğe bağlı detay açıklama.

### Commit Örnekleri
```
feat: add initial setup screen for language and currency selection
fix: resolve TypeScript errors in payment service
refactor: break down HomeScreen into smaller components
docs: update API documentation with new service methods
chore: remove unused imports and clean up code
test: add unit tests for category service
```

## Yeni Özellik Geliştirme
- İlk kurulum ekranı eklendi
- 6 tema modu ve 6 dil desteği
- Modern UI bileşenleri (20+ yeni bileşen)
- Tip güvenliği artırıldı (`any` kaldırıldı)
- Entity modelleri oluşturuldu (`src/models/`)
- Kod organizasyonu iyileştirildi (refactor)

