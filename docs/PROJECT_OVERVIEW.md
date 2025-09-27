# Project Overview

Bu dosya, projenin amacını, kapsamını ve başarı ölçütlerini tek yerde toplar.

## Amaç (Why)
Kullanıcıların kişisel bütçe ve ödemelerini düzenli yönetmesini sağlamak: gider/gelir/alacak kayıtları, tek seferlik veya taksitli ödemeler, hatırlatmalar ve ödenenlerin hızlıca işaretlenmesi.

## Hedefler (Goals)
- [x] Kullanıcı kategoriler oluşturup düzenleyebilir (varsayılan + özel)
- [x] Kategoriler gelen ve giden ödemeler için ayrı tiplere sahip
- [x] Tek seferlik ve taksitli gider/gelir girişleri yapılabilir
- [x] Vade günü yaklaşan ödemeler için hatırlatma üretilebilir; "N gün kala" kullanıcı tarafından ayarlanabilir (varsayılan 1)
- [x] Ödeme/Alacaklar "ödendi/alındı" olarak işaretlenebilir (check)
- [x] Bildirimler kullanıcı ayarlarına göre yönetilir (açık/kapalı)
- [x] İlk kurulumda dil ve para birimi seçimi
- [x] Modern UI/UX tasarımı
- [x] Çoklu dil desteği (6 dil)
- [x] Tema sistemi (6 tema modu)

## Kapsam (In-scope)
- Kategori yönetimi (varsayılanlar + kullanıcı kategorileri)
- **Kategori Tipleri**: Gider ve gelir kategorileri ayrı ayrı yönetilir
- Gider/gelir/alacak kayıtları
- Taksit planı (örn. 10 ay, her ayın 1'i)
- Hatırlatma mekanizması (due date'e göre; N gün kala ayarlanabilir)
- Bildirim tercihleri (uygulama içi/yerel bildirim)
- **İlk Kurulum**: Dil ve para birimi seçimi
- **Modern UI**: 6 tema modu, animasyonlar, responsive tasarım
- **Çoklu Dil**: 6 dil desteği (TR, EN, DE, FR, IT, ES)
- **Raporlama**: Grafik ve analiz araçları
- **Dashboard**: Finansal özet ve istatistikler

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
