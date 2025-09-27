# Changelog

Tüm önemli değişiklikler bu dosyada belgelenecektir.

## [Unreleased]

### Added
- İlk kurulum ekranı (dil ve para birimi seçimi)
- 6 tema modu: Light, Dark, Colorful, Ocean, Sunset, Forest
- 6 dil desteği: Türkçe, İngilizce, Almanca, Fransızca, İtalyanca, İspanyolca
- Modern UI bileşenleri (20+ yeni bileşen)
- Dashboard ve raporlama sistemi
- Kategori sistemi (gider/gelir ayrımı)
- Ödeme takibi (tek seferlik ve taksitli)
- Hatırlatıcı sistemi
- Bildirim sistemi

### Changed
- HomeScreen refactor edildi (5 alt bileşene ayrıldı)
- ReportsHubScreen refactor edildi (3 alt bileşene ayrıldı)
- PaymentsScreen ve IncomesScreen refactor edildi
- CategoriesScreen refactor edildi
- Tip güvenliği artırıldı (`any` tipleri kaldırıldı)
- Entity modelleri oluşturuldu (`src/models/`)

### Fixed
- TypeScript hataları düzeltildi
- Navigation akışı iyileştirildi
- UI tutarlılığı sağlandı
- Layout çakışmaları çözüldü

### Technical
- `src/models/` dizini oluşturuldu
- Entity interface'leri tanımlandı
- TypeScript strict mode aktif
- Kod organizasyonu iyileştirildi
- Component'ler modüler hale getirildi

## [0.1.0] - 2024-12-19

### Added
- Temel proje yapısı
- SQLite veritabanı
- Kategori yönetimi
- Ödeme takibi
- Tema sistemi
- Çoklu dil desteği
