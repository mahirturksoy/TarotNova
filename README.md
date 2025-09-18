# TarotNova

React Native ve Expo ile geliştirilmiş yapay zeka destekli tarot okuma mobil uygulaması.

## Özellikler

- **Etkileşimli Kart Seçimi**: Major Arcana destesinden kendi tarot kartlarınızı seçin
- **Yapay Zeka Destekli Okumalar**: Sorunuza ve ruh halinize göre kişiselleştirilmiş tarot yorumları alın
- **Modern UI/UX**: Mistik temalı güzel gradyan tasarım
- **TypeScript**: Uygulama genelinde tam tip güvenliği
- **React Navigation**: Ekranlar arası akıcı geçişler
- **Context API**: Okumalar için global durum yönetimi

## Ekran Görüntüleri

Uygulama üç ana ekran içerir:
1. **Ana Ekran**: Sorunuzu girin ve ruh halinizi seçin
2. **Kart Seçimi Ekranı**: Major Arcana destesinden 3 kart seçin
3. **Okuma Ekranı**: Kişiselleştirilmiş yapay zeka tarot yorumunuzu görüntüleyin

## Gereksinimler

Bu projeyi çalıştırmadan önce aşağıdakilerin yüklü olduğundan emin olun:

- **Node.js** (v16 veya üzeri)
- **npm** veya **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go uygulaması** (test için mobil cihazınızda)

## Kurulum

1. **Repository'i klonlayın**
```bash
git clone https://github.com/kullaniciadi/TarotNova.git
cd TarotNova
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Geliştirme sunucusunu başlatın**
```bash
npx expo start
```

4. **Cihazınızda çalıştırın**
   - Telefonunuza Expo Go uygulamasını yükleyin
   - Terminalde görüntülenen QR kodu tarayın
   - Veya web tarayıcısında çalıştırmak için `w` tuşuna basın

## Proje Yapısı

```
TarotNova/
├── app/
│   ├── components/          # Yeniden kullanılabilir UI bileşenleri
│   │   ├── TarotCardComponent.tsx
│   │   └── UserInputFormComponent.tsx
│   ├── constants/           # Uygulama sabitleri ve verileri
│   │   └── tarotDeck.ts
│   ├── context/            # Durum yönetimi için React Context
│   │   └── ReadingContext.tsx
│   ├── screens/            # Uygulama ekranları
│   │   ├── HomeScreen.tsx
│   │   ├── CardSelectionScreen.tsx
│   │   └── ReadingScreen.tsx
│   ├── services/           # API servisleri ve yardımcılar
│   │   └── tarotAPIService.ts
│   └── types/              # TypeScript tip tanımları
│       └── navigation.ts
├── assets/                 # Resimler, fontlar ve diğer varlıklar
├── App.tsx                 # Ana uygulama bileşeni
├── app.json               # Expo konfigürasyonu
├── package.json
└── tsconfig.json          # TypeScript konfigürasyonu
```

## Ana Teknolojiler

- **React Native**: Çapraz platform mobil geliştirme
- **Expo**: Geliştirme platformu ve araç zinciri
- **TypeScript**: Tip güvenli JavaScript
- **React Navigation**: Navigasyon kütüphanesi
- **Expo Linear Gradient**: Gradyan arka planlar
- **React Context API**: Durum yönetimi

## Nasıl Çalışır

1. **Kullanıcı Girişi**: Kullanıcılar sorularını girer ve mevcut ruh hallerini seçer
2. **Kart Seçimi**: Kullanıcılar 22 Major Arcana kartından 3 kart seçer
3. **Yapay Zeka İşleme**: Uygulama aşağıdakilere dayalı kişiselleştirilmiş okuma üretir:
   - Kullanıcının sorusu
   - Seçilen ruh hali
   - Seçilen tarot kartları
4. **Okuma Gösterimi**: Şunları içeren detaylı yorum gösterir:
   - Bireysel kart anlamları
   - Yaşam alanları (aşk, kariyer, kişisel)
   - Güven skoru ile genel özet

## Geliştirme

### Geliştirme Modunda Çalıştırma

```bash
# Expo geliştirme sunucusunu başlat
npx expo start

# iOS simülatöründe çalıştır (sadece macOS)
npx expo start --ios

# Android emülatöründe çalıştır
npx expo start --android

# Web tarayıcısında çalıştır
npx expo start --web
```

### Üretim için Build Alma

```bash
# iOS için build
expo build:ios

# Android için build
expo build:android
```

## Konfigürasyon

### Uygulamayı Özelleştirme

- **Uygulama Adı**: `app.json` dosyasındaki `name` alanını değiştirin
- **Renkler**: Ekran bileşenlerindeki gradyan renklerini güncelleyin
- **Tarot Destesi**: `app/constants/tarotDeck.ts` dosyasına daha fazla kart ekleyin
- **Yapay Zeka Servisi**: `tarotAPIService.ts` dosyasındaki mock verileri gerçek yapay zeka entegrasyonu ile değiştirin

### Gerçek Yapay Zeka Entegrasyonu Ekleme

Uygulama şu anda okumalar için mock veri kullanmaktadır. Gerçek bir yapay zeka servisi (OpenAI, Claude, vb.) ile entegrasyon için `app/services/tarotAPIService.ts` dosyasındaki `getAIPoweredReading` fonksiyonunu değiştirin.

## Sorun Giderme

### Yaygın Sorunlar

1. **Metro bundler sorunları**: `npx expo start --clear` ile önbelleği temizleyin
2. **Modül bulunamadı**: Tüm bağımlılıkların yüklü olduğundan emin olmak için `npm install` çalıştırın
3. **TypeScript hataları**: `tsconfig.json` dosyasını kontrol edin ve tüm tip tanımlarının doğru olduğundan emin olun

### Platform-Özel Sorunlar

- **iOS**: En son Expo Go uygulamasının yüklü olduğundan emin olun
- **Android**: Fiziksel cihaz kullanıyorsanız geliştirici modunu ve USB hata ayıklamayı etkinleştirin

## Katkıda Bulunma

1. Repository'i fork edin
2. Özellik dalınızı oluşturun (`git checkout -b feature/HarikaBirOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika bir özellik ekle'`)
4. Dalınıza push yapın (`git push origin feature/HarikaBirOzellik`)
5. Pull Request açın

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için LICENSE dosyasına bakın.

## Gelecek Geliştirmeler

- Gerçek yapay zeka entegrasyonu (OpenAI, Claude, vb.)
- Kart resimleri ve animasyonlar
- Kullanıcı hesapları ve okuma geçmişi
- Daha fazla tarot yayılımı (Celtic Cross, vb.)
- Sosyal paylaşım özellikleri
- Karanlık/aydınlık tema değiştirici

## Destek

Herhangi bir sorunla karşılaşırsanız veya sorularınız varsa, lütfen GitHub repository'sinde bir issue oluşturun.
