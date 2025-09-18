# Project Overview

Bu dosya, projenin amacını, kapsamını ve başarı ölçütlerini tek yerde toplar.

## Amaç (Why)
Kullanıcıların kişisel bütçe ve ödemelerini düzenli yönetmesini sağlamak: gider/gelir/alacak kayıtları, tek seferlik veya taksitli ödemeler, hatırlatmalar ve ödenenlerin hızlıca işaretlenmesi.

## Hedefler (Goals)
- [ ] Kullanıcı kategoriler oluşturup düzenleyebilir (varsayılan + özel)
- [ ] Tek seferlik ve taksitli gider/gelir girişleri yapılabilir
- [ ] Vade günü yaklaşan ödemeler için hatırlatma üretilebilir; "N gün kala" kullanıcı tarafından ayarlanabilir (varsayılan 1)
- [ ] Ödeme/Alacaklar “ödendi/alındı” olarak işaretlenebilir (check)
- [ ] Bildirimler kullanıcı ayarlarına göre yönetilir (açık/kapalı)

## Kapsam (In-scope)
- Kategori yönetimi (varsayılanlar + kullanıcı kategorileri)
- Gider/gelir/alacak kayıtları
- Taksit planı (örn. 10 ay, her ayın 1’i)
- Hatırlatma mekanizması (due date’e göre; N gün kala ayarlanabilir)
- Bildirim tercihleri (uygulama içi/yerel bildirim)

## Kapsam Dışı (Out-of-scope)
- Banka entegrasyonları, otomatik hesap eşleştirme
- Bulut senkronizasyonu, çoklu cihaz (ilk sürüm için)
- Karmaşık bütçe raporları ve AI analizleri (ileriki sürüm)

## Kullanıcı Personaları
- Bireysel kullanıcı: Kredi/taksit/abonelik ödemelerini ve gelir/alışlarını takip etmek isteyen kullanıcı.

## Başarı Ölçütleri (Success Metrics)
- Haftalık aktif kullanıcı oranı (WAU)
- Hatırlatma gösteriminden sonra “ödendi” işaretleme oranı
- İlk hafta içinde en az 1 kategori + 1 kayıt ekleme oranı

## Temel Akışlar
- Taksitli kredi ekleme: Kategori seç → 10 taksit → vade günü: her ayın 1’i → hatırlatma: 1 gün önce → her ay ödeme sonrası “ödendi” olarak işaretle.
- Gelir girişi: Tek seferlik gelir ekle → tarih geldiğinde “alındı” olarak işaretle.
- Alacak takibi: Alacak kaydı oluştur → hatırlatma açık ise vade öncesi uyar → tahsil edilince “alındı” olarak işaretle.

## Riskler ve Varsayımlar
- Varsayım: Uygulama yerel bildirimlerle (push olmadan) hatırlatma yapacak.
- Risk: Arka planda hatırlatma üretimi platform kısıtlarına takılabilir; çözüm: uygulama açılışında/odaklanınca due hesaplama + planlı yerel bildirimler.

## Notlar
- Vade yaklaşımı “N gün kala” (varsayılan 1 gün) kullanıcı ayarından yapılandırılabilir.
