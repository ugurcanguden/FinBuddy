# Örnek Brif: Kategori Düzenleme Doğrulaması

## Bağlam
- `src/screens/CategoriesScreen.tsx`
- `src/screens/EditCategoryScreen.tsx`
- `src/hooks/useCategories.ts`
- `src/components/AppNavigator.tsx`

## Sorun / Hedef
EditCategory ekranında isim zorunlu olmalı ve min 3 karakter olmalı. Geçersizken kaydet butonu pasif ve hata mesajı görünür olmalı. Başarılı kayıt sonrası liste anında güncellenmeli.

## Sınırlar / Tercihler
- Mevcut stil ve mimariye uy; ilgisiz dosyaları değiştirme.

## Kabul Kriterleri
- [ ] <3 karakter veya boş girişte uyarı metni gösterilir
- [ ] Kaydet butonu yalnızca geçerli girişte aktif olur
- [ ] Başarılı kayıtta `CategoriesScreen` listesi güncellenir

## Yanıt İsteği
Önce plan; sonra patch; değişiklik özeti (dosya:Satır) ve manuel test adımları.

