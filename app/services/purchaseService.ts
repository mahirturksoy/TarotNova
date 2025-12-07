// app/services/purchaseService.ts
// RevenueCat wrapper servisi - PremiumScreen için basit interface

import revenueCatService from './revenueCatService';
import { PurchasesPackage } from 'react-native-purchases';

/**
 * PremiumScreen için offering package interface
 * RevenueCat'in gerçek paketini wrap eder
 */
export interface OfferingPackage {
  identifier: string; // 'monthly', 'annual', vb.
  product: {
    priceString: string; // '₺50.00', '$4.99', vb.
    title: string; // 'Premium Aylık'
    description: string; // 'Sınırsız Erişim'
  };
  rcPackage: PurchasesPackage; // Gerçek RevenueCat paketi (satın alma için gerekli)
}

class PurchaseService {
  /**
   * Paketleri Getir (Gerçek RevenueCat)
   * PremiumScreen'de useEffect içinde çağrılır
   */
  async getOfferings(): Promise<OfferingPackage[]> {
    try {
      console.log('📦 Loading offerings from RevenueCat...');

      // RevenueCat'ten gerçek paketleri al
      const packages = await revenueCatService.getOfferings();

      if (packages.length === 0) {
        console.warn('⚠️  No packages available');
        return [];
      }

      // RevenueCat paketlerini OfferingPackage formatına çevir
      const offerings: OfferingPackage[] = packages.map(pkg => ({
        identifier: pkg.identifier, // monthly, annual, vb.
        product: {
          priceString: pkg.product.priceString, // Fiyat string (₺50.00)
          title: pkg.product.title, // Ürün başlığı
          description: pkg.product.description, // Ürün açıklaması
        },
        rcPackage: pkg, // Orijinal paketi de sakla (satın alma için gerekli)
      }));

      console.log('✅ Offerings loaded:', offerings.length);
      return offerings;
    } catch (error) {
      console.error('❌ Failed to load offerings:', error);
      return [];
    }
  }

  /**
   * Satın Al (Gerçek RevenueCat)
   * PremiumScreen'de "Premium Satın Al" butonuna basıldığında çağrılır
   */
  async purchasePackage(offeringPackage: OfferingPackage): Promise<boolean> {
    try {
      console.log('🛒 Purchasing package:', offeringPackage.identifier);

      // RevenueCat ile gerçek satın alma işlemi
      const success = await revenueCatService.purchasePackage(offeringPackage.rcPackage);

      if (success) {
        console.log('✅ Purchase successful!');
      } else {
        console.log('ℹ️  Purchase cancelled or failed');
      }

      return success;
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      return false;
    }
  }

  /**
   * Satın Alımları Geri Yükle
   * PremiumScreen'de "Satın Alımları Geri Yükle" butonuna basıldığında çağrılır
   */
  async restorePurchases(): Promise<boolean> {
    try {
      console.log('🔄 Restoring purchases...');

      const restored = await revenueCatService.restorePurchases();

      if (restored) {
        console.log('✅ Purchases restored successfully!');
      } else {
        console.log('ℹ️  No active purchases found');
      }

      return restored;
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return false;
    }
  }

  /**
   * Premium durumunu kontrol et
   * SpreadSelectionScreen'de spread seçmeden önce çağrılır
   */
  async checkPremiumStatus(): Promise<boolean> {
    try {
      return await revenueCatService.checkPremiumStatus();
    } catch (error) {
      console.error('❌ Premium status check failed:', error);
      return false;
    }
  }
}

// Singleton instance
const purchaseService = new PurchaseService();
export default purchaseService;
