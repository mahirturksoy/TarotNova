// app/services/purchaseService.ts

// Bu dosya şimdilik "Taklit (Mock)" modundadır.
// Gerçek ödeme sistemi (RevenueCat) kurulana kadar arayüzün hata vermemesini sağlar.

export interface MockPackage {
  identifier: string;
  product: {
    priceString: string;
    title: string;
    description: string;
  };
}

class PurchaseService {
  // Paketleri Getir (Sahte Veri)
  async getOfferings(): Promise<MockPackage[]> {
    // Gerçekçi görünmesi için yarım saniye bekletiyoruz
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        identifier: 'premium_monthly',
        product: {
          priceString: '₺50.00',
          title: 'Premium Aylık',
          description: 'Sınırsız Erişim'
        }
      }
    ];
  }

  // Satın Al (Her zaman başarılı döner)
  async purchasePackage(pack: any): Promise<boolean> {
    // İşlem yapıyormuş gibi 1.5 saniye bekle
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true; // Başarılı
  }
}

const purchaseService = new PurchaseService();
export default purchaseService;