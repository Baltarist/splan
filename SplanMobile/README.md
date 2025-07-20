# Splan Mobile App

Personal Scrum uygulamasının React Native mobile versiyonu.

## Özellikler

- 🔐 Kullanıcı kimlik doğrulama (Login/Register)
- 🎯 Hedef yönetimi
- 🏃 Sprint planlama
- ✅ Görev takibi
- 📊 İlerleme analizi
- 🤖 AI destekli öneriler

## Teknolojiler

- React Native 0.73.0
- TypeScript
- Redux Toolkit
- React Navigation
- React Native Paper
- Axios

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. iOS için (macOS gerekli):
```bash
cd ios && pod install && cd ..
npm run ios
```

3. Android için:
```bash
npm run android
```

## Geliştirme

```bash
# Metro bundler'ı başlat
npm start

# TypeScript kontrolü
npm run type-check

# Linting
npm run lint
```

## Proje Yapısı

```
src/
├── components/     # Yeniden kullanılabilir bileşenler
├── screens/        # Ekran bileşenleri
│   ├── auth/      # Kimlik doğrulama ekranları
│   └── main/      # Ana uygulama ekranları
├── navigation/     # Navigasyon yapılandırması
├── store/         # Redux store ve slice'lar
├── services/      # API servisleri
├── utils/         # Yardımcı fonksiyonlar
└── types/         # TypeScript tip tanımları
```

## Backend Bağlantısı

Uygulama `http://localhost:3000` adresindeki backend API'sine bağlanır.

## Lisans

MIT 