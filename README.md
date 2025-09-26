# FinBuddy 💰

Kişisel finans yönetimi için geliştirilmiş modern React Native uygulaması.

## ✨ Özellikler

### 📊 Finans Yönetimi
- **Gider Takibi**: Harcamalarınızı kategorilere göre takip edin
- **Gelir Takibi**: Gelirlerinizi düzenli olarak kaydedin
- **Kategori Sistemi**: Gelen ve giden ödemeler için ayrı kategoriler
- **Taksitli Ödemeler**: Aylık taksitli ödemelerinizi planlayın
- **Hatırlatıcılar**: Ödeme tarihlerinizi unutmayın

### 🎨 Modern UI/UX
- **Tema Desteği**: Açık/koyu/renkli tema seçenekleri
- **Çoklu Dil**: Türkçe, İngilizce ve daha fazlası
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm
- **Animasyonlar**: Akıcı ve modern kullanıcı deneyimi

### 📱 Teknik Özellikler
- **Expo 54**: En güncel React Native framework
- **TypeScript**: Tip güvenli kod yapısı
- **SQLite**: Yerel veritabanı ile hızlı erişim
- **Offline First**: İnternet bağlantısı olmadan çalışır

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- Yarn
- Expo CLI
- iOS Simulator veya Android Emulator

### Kurulum
```bash
# Projeyi klonlayın
git clone https://github.com/your-username/FinBuddy.git
cd FinBuddy

# Bağımlılıkları yükleyin
yarn install

# Uygulamayı başlatın
yarn start
```

### Geliştirme Komutları
```bash
# Geliştirme sunucusunu başlat
yarn start

# iOS'ta çalıştır
yarn ios

# Android'de çalıştır
yarn android

# Web'de çalıştır
yarn web

# TypeScript kontrolü
yarn type-check

# Linting
yarn lint

# Test çalıştır
yarn test
```

## 🏗️ Proje Yapısı

```
src/
├── components/          # UI bileşenleri
│   ├── common/         # Genel bileşenler
│   ├── forms/          # Form bileşenleri
│   └── navigation/     # Navigasyon
├── screens/            # Ekranlar
├── services/           # Servis katmanı
├── hooks/              # Custom hooks
├── contexts/           # React Context
├── types/              # TypeScript tipleri
├── constants/          # Sabitler
├── locales/            # Çoklu dil
└── utils/              # Yardımcı fonksiyonlar
```

## 📋 Kategori Sistemi

### Gider Kategorileri 💸
- Kira
- Faturalar
- Eğitim
- Yemek
- Ulaşım
- Sağlık
- Eğlence
- Diğer

### Gelir Kategorileri 💰
- Maaş
- Freelance
- Yatırım
- Prim
- Kira Geliri
- Diğer Gelir

## 🛠️ Geliştirme

### Kod Standartları
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Component-based architecture

### Veritabanı
- SQLite ile yerel veri saklama
- Migration sistemi
- Soft delete desteği
- Transaction güvenliği

### Test Stratejisi
- Unit testler (Vitest)
- Component testler
- Integration testler
- E2E testler (gelecekte)

## 📚 Dokümantasyon

Detaylı dokümantasyon için `docs/` klasörüne bakın:

- [Geliştirici Rehberi](docs/DEVELOPMENT_GUIDE.md)
- [Mimari Dokümantasyonu](docs/ARCHITECTURE.md)
- [Kod Standartları](docs/CODING_STANDARDS.md)
- [Veri Modeli](docs/DATA_MODEL.md)
- [Proje Yol Haritası](docs/ROADMAP.md)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- [Expo](https://expo.dev/) - React Native framework
- [React Native](https://reactnative.dev/) - Mobile development
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [SQLite](https://www.sqlite.org/) - Database

## 📞 İletişim

- Proje Sahibi: [Your Name](https://github.com/your-username)
- Email: your.email@example.com
- Proje Linki: [https://github.com/your-username/FinBuddy](https://github.com/your-username/FinBuddy)

---

**FinBuddy** ile finansal hedeflerinize ulaşın! 🎯
