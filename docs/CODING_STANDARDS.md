# Coding Standards

Takımın ortak geliştirme kuralları ve tercihleri.

## TypeScript
- `strict` mod (mümkünse) ve açık tipler tercih edilir.
- Fonksiyon dönüş tiplerini belirtin; `any` kaçınılır.
- Modül dışına açılan tipler `types/` altında paylaşılabilir.

## React (Native)
- Fonksiyonel bileşenler ve hooks kullanın.
- Side effect’leri `useEffect` içinde yönetin; temizleme fonksiyonlarını unutmayın.
- Bileşenleri küçük ve tek sorumlu tutun; prop sayısı artıyorsa parçalara bölün.
- Performans: `useMemo`, `useCallback`, `React.memo` gerekli yerlerde.
- Erişilebilirlik: `accessible` prop’ları, `accessibilityLabel` ve uygun rol/etiketler.

## Stil ve Tema
- Renk/spacing gibi değerleri `theme/` üzerinden kullanın; sabit değer gömmeyin.
- StyleSheet veya styled yaklaşımı; projedeki mevcut pattern’e uyun.

## İçe Aktarım Düzeni
1) React/React Native
2) Üçüncü parti
3) Proje içi mutlak/bağıl importlar
4) Stil/asset importları

## Hata Yönetimi
- Servis katmanında hata yakalayın ve anlamlı hatalar üretin.
- UI’da kullanıcı dostu mesaj gösterin; yalnızca konsol log bırakmayın.

## Testler
- Varsa birim testler `__tests__` veya `*.test.ts(x)` olarak.
- Saf yardımcı fonksiyonları test etmek en hızlı kazanımdır.

## Commit Mesajları
- Conventional Commits: `feat`, `fix`, `refactor`, `docs`, `chore`, `test` vb.
- Kısa özet + isteğe bağlı detay açıklama.

