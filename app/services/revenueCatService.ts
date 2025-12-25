import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG } from '../config/revenueCatConfig';
import { auth, firestore } from '../config/firebaseConfig';
// Web SDK import kaldırıldı - Native SDK kullanılıyor

class RevenueCatService {
  private isConfigured = false;
  private isListenerAttached = false;
  private isSyncing = false;
  private lastSyncedUserId: string | null = null;

  /**
   * RevenueCat SDK'yı başlat
   * App.tsx içinde çağrılmalı
   */
  async initialize(): Promise<void> {
    if (this.isConfigured) {
      console.log('⚠️  RevenueCat already initialized');
      return;
    }

    try {
      // Debug mode (development ortamında)
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // API key kontrolü
      if (!REVENUECAT_CONFIG.apiKey) {
        console.error('❌ RevenueCat API key missing! Check .env file');
        return;
      }

      // RevenueCat SDK'yı yapılandır
      await Purchases.configure({
        apiKey: REVENUECAT_CONFIG.apiKey,
      });

      this.isConfigured = true;

      // NOT: Kullanıcı girişini App.tsx'teki auth listener yönetir
      // Burada logIn çağrısı yapmıyoruz (double login riskini önler)

      // Listener ekle: Purchase güncellendi mi?
      if (!this.isListenerAttached) {
        Purchases.addCustomerInfoUpdateListener(this.handleCustomerInfoUpdate);
        this.isListenerAttached = true;
      }

      console.log('✅ RevenueCat initialized successfully');
    } catch (error) {
      console.error('❌ RevenueCat initialization failed:', error);
    }
  }

  /**
   * Kullanıcı değiştiğinde çağır (login/logout)
   * App.tsx içinde auth state değiştiğinde kullanılır
   * Race condition safe: Overlapping sync calls are prevented
   */
  async syncUser(userId: string | null): Promise<void> {
    if (!this.isConfigured) {
      console.warn('⚠️  RevenueCat not initialized yet');
      return;
    }

    // Aynı user ID ile zaten senkronize edildiyse skip et
    if (userId === this.lastSyncedUserId) {
      console.log('ℹ️  User already synced, skipping:', userId);
      return;
    }

    // Şu an senkronizasyon devam ediyorsa bekle
    if (this.isSyncing) {
      console.warn('⚠️  Sync already in progress, waiting...');
      // Maksimum 3 saniye bekle
      let waitTime = 0;
      while (this.isSyncing && waitTime < 3000) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitTime += 100;
      }
      if (this.isSyncing) {
        console.error('❌ Sync timeout, aborting');
        return;
      }
    }

    this.isSyncing = true;

    try {
      if (userId) {
        // Kullanıcı giriş yaptı
        await Purchases.logIn(userId);
        console.log('✅ RevenueCat user synced:', userId);

        // Premium durumunu kontrol et ve Firestore'a kaydet
        const customerInfo = await Purchases.getCustomerInfo();
        const isPremium = this.checkPremiumStatusFromCustomerInfo(customerInfo);
        await this.savePremiumStatusToFirestore(isPremium, customerInfo);

        this.lastSyncedUserId = userId;
      } else {
        // Kullanıcı çıkış yaptı
        await Purchases.logOut();
        console.log('✅ RevenueCat user logged out');

        this.lastSyncedUserId = null;
      }
    } catch (error) {
      console.error('❌ RevenueCat user sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Mevcut paketleri getir (Monthly, Yearly)
   * PremiumScreen'de kullanılır
   */
  async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        console.log('✅ RevenueCat offerings loaded:', offerings.current.availablePackages.length);
        return offerings.current.availablePackages;
      }

      console.warn('⚠️  No offerings available. Check RevenueCat Dashboard.');
      return [];
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      return [];
    }
  }

  /**
   * Satın alma işlemi
   * PremiumScreen'de "Premium Satın Al" butonuna basıldığında çağrılır
   */
  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<boolean> {
    try {
      console.log('🛒 Starting purchase:', packageToPurchase.identifier);

      // RevenueCat üzerinden satın alma işlemi başlat
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

      // Premium kontrolü
      const isPremium = this.checkPremiumStatusFromCustomerInfo(customerInfo);

      if (isPremium) {
        console.log('✅ Purchase successful! User is now premium');

        // Firestore'a premium bilgisini kaydet
        await this.savePremiumStatusToFirestore(true, customerInfo);

        return true;
      }

      console.warn('⚠️  Purchase completed but user is not premium');
      return false;
    } catch (error: unknown) {
      // Kullanıcı iptali
      if (error && typeof error === 'object' && 'userCancelled' in error && error.userCancelled) {
        console.log('ℹ️  User cancelled purchase');
        return false;
      }

      console.error('❌ Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Restore Purchases (Satın Alımları Geri Yükle)
   * PremiumScreen'de "Satın Alımları Geri Yükle" butonuna basıldığında çağrılır
   * Kullanıcı telefon değiştirdiğinde veya uygulamayı silip tekrar yüklediğinde kullanılır
   */
  async restorePurchases(): Promise<boolean> {
    try {
      console.log('🔄 Restoring purchases...');

      const customerInfo = await Purchases.restorePurchases();
      const isPremium = this.checkPremiumStatusFromCustomerInfo(customerInfo);

      await this.savePremiumStatusToFirestore(isPremium, customerInfo);

      if (isPremium) {
        console.log('✅ Purchases restored! User is premium');
      } else {
        console.log('ℹ️  No active purchases found');
      }

      return isPremium;
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return false;
    }
  }

  /**
   * Kullanıcının premium durumunu kontrol et
   * SpreadSelectionScreen'de spread seçmeden önce çağrılır
   */
  async checkPremiumStatus(): Promise<boolean> {
    try {
      // Önce RevenueCat'ten kontrol et (en güncel bilgi)
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = this.checkPremiumStatusFromCustomerInfo(customerInfo);

      // Firestore'a kaydet (sync için)
      await this.savePremiumStatusToFirestore(isPremium, customerInfo);

      return isPremium;
    } catch (error) {
      console.error('❌ Failed to check premium status from RevenueCat:', error);

      // RevenueCat erişilemezse Firestore'dan fallback
      return await this.getPremiumStatusFromFirestore();
    }
  }

  /**
   * CustomerInfo'dan premium durumunu çıkar
   * Private helper method
   */
  private checkPremiumStatusFromCustomerInfo(customerInfo: CustomerInfo): boolean {
    // Entitlement kontrolü (RevenueCat'in önerdiği yöntem)
    const hasPremiumEntitlement = typeof customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID] !== 'undefined';

    if (hasPremiumEntitlement) {
      console.log('✅ User has premium entitlement');
      return true;
    }

    // Alternatif: Active subscriptions kontrolü
    const hasActiveSubscription = customerInfo.activeSubscriptions.length > 0;

    if (hasActiveSubscription) {
      console.log('✅ User has active subscription');
      return true;
    }

    console.log('ℹ️  User does not have premium');
    return false;
  }

  /**
   * Premium durumunu Firestore'a kaydet
   * Client-side validation (Cloud Functions olmadan)
   */
  private async savePremiumStatusToFirestore(
    isPremium: boolean,
    customerInfo: CustomerInfo
  ): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('⚠️  Cannot save premium status: No user logged in');
        return;
      }

      // Native SDK kullanımı
      const userRef = firestore.collection('users').doc(currentUser.uid);

      // Premium bilgilerini hazırla
      const premiumData = {
        isPremium,
        originalAppUserId: customerInfo.originalAppUserId,
        latestExpirationDate: customerInfo.latestExpirationDate || null,
        productIdentifier: customerInfo.activeSubscriptions[0] || null,
        updatedAt: new Date().toISOString(),
        platform: Platform.OS,
      };

      // Firestore'a kaydet (merge: true ile mevcut data'yı koruyoruz)
      await userRef.set({
        premium: premiumData,
      }, { merge: true });

      console.log('✅ Premium status saved to Firestore:', isPremium);
    } catch (error) {
      console.error('❌ Failed to save premium status to Firestore:', error);
    }
  }

  /**
   * Firestore'dan premium durumunu oku
   * RevenueCat erişilemezse fallback olarak kullanılır
   */
  async getPremiumStatusFromFirestore(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('⚠️  Cannot get premium status: No user logged in');
        return false;
      }

      // Native SDK kullanımı
      const userRef = firestore.collection('users').doc(currentUser.uid);
      const docSnap = await userRef.get();
      const userData = docSnap.data();

      if (userData) {
        const isPremium = userData?.premium?.isPremium || false;

        console.log('ℹ️  Premium status from Firestore:', isPremium);
        return isPremium;
      }

      console.log('ℹ️  No user document found in Firestore');
      return false;
    } catch (error) {
      console.error('❌ Failed to get premium status from Firestore:', error);
      return false;
    }
  }

  /**
   * CustomerInfo güncellendiğinde otomatik çağrılır
   * RevenueCat listener callback
   */
  private handleCustomerInfoUpdate = async (customerInfo: CustomerInfo) => {
    console.log('🔔 Customer info updated');
    const isPremium = this.checkPremiumStatusFromCustomerInfo(customerInfo);
    await this.savePremiumStatusToFirestore(isPremium, customerInfo);
  };

  /**
   * Debug: Kullanıcı bilgilerini konsola yazdır
   * Development ortamında kullanılır
   */
  async debugCustomerInfo(): Promise<void> {
    if (!__DEV__) return;

    try {
      const customerInfo = await Purchases.getCustomerInfo();

      console.log('=== RevenueCat Customer Info ===');
      console.log('Original App User ID:', customerInfo.originalAppUserId);
      console.log('Active Subscriptions:', customerInfo.activeSubscriptions);
      console.log('All Purchased Product IDs:', customerInfo.allPurchasedProductIdentifiers);
      console.log('Latest Expiration Date:', customerInfo.latestExpirationDate);
      console.log('Entitlements:', Object.keys(customerInfo.entitlements.active));
      console.log('Is Premium:', this.checkPremiumStatusFromCustomerInfo(customerInfo));
      console.log('================================');
    } catch (error) {
      console.error('Debug failed:', error);
    }
  }

  /**
   * RevenueCat listener'ı temizle (memory leak prevention)
   * App unmount veya logout sırasında çağrılmalı
   */
  cleanup(): void {
    if (this.isListenerAttached) {
      Purchases.removeCustomerInfoUpdateListener(this.handleCustomerInfoUpdate);
      this.isListenerAttached = false;
      console.log('✅ RevenueCat listener cleaned up');
    }
  }
}

// Singleton instance
const revenueCatService = new RevenueCatService();
export default revenueCatService;
