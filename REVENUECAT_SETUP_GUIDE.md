# RevenueCat & In-App Purchases Kurulum Rehberi

## ✅ Kontrol Listesi

### 1. App Store Connect - In-App Products

#### Adım 1: App Store Connect'e Giriş
1. https://appstoreconnect.apple.com/ → Giriş yap
2. "My Apps" → **TarotNova** seç

#### Adım 2: Subscription Products Kontrol
1. Sol menüden "In-App Purchases" (veya "Subscriptions") seç
2. Şu product ID'lerin var olduğunu doğrula:
   - ✅ `tarotnova_premium_monthly` (Aylık Premium)
   - ✅ `tarotnova_premium_yearly` (Yıllık Premium)

#### Adım 3: Her Product için Kontrol
- **Status**: "Ready to Submit" veya "Approved" olmalı
- **Price**:
  - Monthly: Örn. $4.99/month (veya ₺49.99)
  - Yearly: Örn. $39.99/year (veya ₺399.99)
- **Localized Descriptions**:
  - 🇹🇷 Türkçe: "Premium Aylık Abonelik"
  - 🇺🇸 İngilizce: "Premium Monthly Subscription"

#### Yoksa Oluştur:
```
1. "+" butonu → "Auto-Renewable Subscription"
2. Product ID: tarotnova_premium_monthly
3. Subscription Group: "Premium" (yeni grup oluştur)
4. Duration: 1 month
5. Price: Tier 5 ($4.99) veya istediğin tier
6. Localized Descriptions ekle
7. Save
```

---

### 2. Google Play Console - Subscriptions

#### Adım 1: Play Console'a Giriş
1. https://play.google.com/console/ → Giriş yap
2. **TarotNova** app'i seç (yoksa "Create app" ile oluştur)

#### Adım 2: App Oluşturma (Eğer yoksa)
```
1. "Create app" butonu
2. App name: TarotNova
3. Language: Turkish / English
4. App or game: App
5. Free or paid: Free
6. Accept declarations
7. Create app
```

#### Adım 3: Subscriptions Oluştur
1. Sol menüden "Monetize" → "Subscriptions"
2. "Create subscription" butonu

**Monthly Subscription:**
```
Product ID: tarotnova_premium_monthly
Name: Premium Aylık Abonelik
Description: TarotNova'nın tüm premium özelliklerine aylık erişim
Billing period: Every 1 month
Price: ₺49.99 (veya $4.99)
Free trial: Yok (veya 3 gün)
Grace period: 3 days
```

**Yearly Subscription:**
```
Product ID: tarotnova_premium_yearly
Name: Premium Yıllık Abonelik
Description: TarotNova'nın tüm premium özelliklerine yıllık erişim (%40 tasarruf)
Billing period: Every 1 year
Price: ₺399.99 (veya $39.99)
Free trial: Yok (veya 7 gün)
Grace period: 3 days
```

5. Her subscription için **"Activate"** butonuna tıkla

---

### 3. RevenueCat Dashboard Konfigürasyonu

#### Adım 1: RevenueCat'e Giriş
1. https://app.revenuecat.com/ → Giriş yap
2. **TarotNova** project'i seç

#### Adım 2: iOS Setup (App Store Connect)

**App-Specific Shared Secret:**
1. RevenueCat Dashboard → "App Store" tab
2. "App-Specific Shared Secret" alanını kontrol et
3. Eğer boşsa:
   - App Store Connect → TarotNova → "App Information"
   - "App-Specific Shared Secret" altında "Manage" → "Generate"
   - Oluşturulan anahtarı kopyala
   - RevenueCat'e yapıştır ve kaydet

**Bundle ID Kontrolü:**
- Bundle ID: `com.mahirturksoy.tarotnova` olmalı

#### Adım 3: Android Setup (Play Console)

**Service Account Credentials:**
1. RevenueCat Dashboard → "Google Play" tab
2. "Service Account Credentials" alanını kontrol et
3. Eğer yoksa:

**Play Console'da Service Account Oluştur:**
```
1. Play Console → Setup → API Access
2. "Create new service account" linkine tıkla
3. Google Cloud Console açılacak
4. Service account name: "RevenueCat API Access"
5. Service account ID: revenuecat-api
6. Role: "Finance" seç
7. "Done" → Service account oluşturuldu
8. Actions → "Manage keys" → "Add key" → "Create new key"
9. Key type: JSON
10. Create → JSON dosyası indirilecek
```

**JSON Key'i RevenueCat'e Ekle:**
```
1. RevenueCat Dashboard → Google Play tab
2. "Upload" butonuna tıkla
3. İndirdiğin JSON dosyasını seç
4. Upload
```

**Package Name Kontrolü:**
- Package name: `com.mahirturksoy.tarotnova` olmalı

#### Adım 4: Products & Offerings Mapping

**Offerings Kontrol:**
1. RevenueCat Dashboard → "Products" tab
2. "Offerings" seç
3. "Default" offering var mı kontrol et
4. Yoksa "Create offering" → Name: "Default" → Identifier: "default"

**Products Ekleme:**
1. "Products" tab → "Add product"
2. Product ekle:

**Monthly Product:**
```
Identifier: tarotnova_premium_monthly
Type: Subscription
App Store Product ID: tarotnova_premium_monthly
Google Play Product ID: tarotnova_premium_monthly
```

**Yearly Product:**
```
Identifier: tarotnova_premium_yearly
Type: Subscription
App Store Product ID: tarotnova_premium_yearly
Google Play Product ID: tarotnova_premium_yearly
```

**Offering'e Package Ekleme:**
1. "Offerings" → "Default" offering seç
2. "Add package" butonu
3. Monthly package:
   - Identifier: `monthly`
   - Product: `tarotnova_premium_monthly`
   - Platform: iOS + Android (her ikisini de seç)
4. Yearly package:
   - Identifier: `yearly`
   - Product: `tarotnova_premium_yearly`
   - Platform: iOS + Android

---

### 4. Test Etme

#### Sandbox Test (iOS)
1. iOS Cihazında Settings → App Store → Sandbox Account ekle
2. Uygulamayı TestFlight'tan indir
3. Premium screen'e git
4. Satın alma işlemini başlat
5. Sandbox hesabıyla giriş yap
6. Satın almayı tamamla
7. RevenueCat dashboard'da "Customers" → Sandbox kullanıcıyı görüyor musun?

#### Test Mode (Android)
1. Play Console → "License testing" → Test hesabı ekle
2. Internal testing track'e APK yükle
3. Test hesabıyla uygulamayı indir
4. Satın alma testi yap

---

## 🔍 Sorun Giderme

### Problem 1: "No offerings found"
**Çözüm:**
- RevenueCat API anahtarlarını kontrol et (.env dosyası)
- Offerings'in "Default" identifier'ı olduğunu doğrula
- purchaseService.ts'de offering ID'nin "default" olduğunu kontrol et

### Problem 2: "Products not available"
**Çözüm:**
- App Store Connect / Play Console'da products aktif mi?
- Product ID'ler doğru yazılmış mı?
- RevenueCat'te products mapping doğru mu?

### Problem 3: "Purchase failed"
**Çözüm:**
- Sandbox / test hesap kullanıyor musunuz?
- Bundle ID / Package name doğru mu?
- RevenueCat entitlement ID'si "premium" mi? (revenueCatConfig.ts)

---

## 📋 Final Kontrol Listesi

- [ ] App Store Connect: Monthly + Yearly subscriptions oluşturuldu
- [ ] Google Play Console: Monthly + Yearly subscriptions oluşturuldu ve aktif
- [ ] RevenueCat: App-Specific Shared Secret eklendi (iOS)
- [ ] RevenueCat: Service Account JSON eklendi (Android)
- [ ] RevenueCat: Products eklendi (monthly + yearly)
- [ ] RevenueCat: Default offering oluşturuldu
- [ ] RevenueCat: Packages eklendi (monthly + yearly)
- [ ] Test edildi: iOS Sandbox
- [ ] Test edildi: Android Test Mode

---

**Not**: Tüm adımları tamamladıktan sonra RevenueCat dashboard'da "Test" yapabilir ve entegrasyonu doğrulayabilirsiniz.
