# Roadmap

Bu dosya, sürüm planını ve kilometre taşlarını içerir.

## Vizyon ve Ölçütler
- Amaç: Kişisel bütçe ve ödemelerin takibini kolaylaştırmak.
- Ölçüt: Hatırlatma sonrası “ödendi/alındı” işaretleme oranı, haftalık aktiflik.

## Sürümler
- v0.1 (MVP)
  - [ ] Kategori yönetimi (varsayılan + özel)
  - [ ] Gider/gelir/alacak temel model ve CRUD
  - [ ] Taksit planı (periyodik aylık), vade günü hesaplama
  - [ ] Hatırlatma üretimi (N gün kala ayarlanabilir), yerel bildirim altyapısı
  - [ ] Ödeme/Alacak “check/işaretle” akışı
  - [ ] Basit liste ekranları (Home, Categories, Add/Edit, Settings)
- v0.2
  - [ ] Hatırlatma kuralları (ileri seviye: tekrar/çalışma saatleri)
  - [ ] Basit raporlama (kategori bazlı aylık toplamlar)
  - [ ] Çok dilli içeriklerin genişletilmesi
- v0.3
  - [ ] Veri dışa aktarım/İçeri aktarım (CSV)
  - [ ] Gelişmiş filtreleme ve arama

## Milestones
- M1: MVP veri modeli ve SQLite migration (v1)
- M2: Taksit akışı + hatırlatmalar (lokal notifikasyon)
- M3: Raporlama ve ayarlar genişletme

## Bağımlılıklar
- `expo-sqlite`, yerel bildirim için `expo-notifications` (plan)

## Notlar
- Arka plan hatırlatmaları için uygulama odaklanınca/başlangıçta senkronizasyon düşünülecek.
