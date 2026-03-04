// app/services/queryLimitService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../config/firebaseConfig';
import revenueCatService from './revenueCatService';

// ═══════════════════════════════════
// LİMİT SABİTLERİ
// ═══════════════════════════════════

const LIMITS = {
  GUEST: 1,        // Giriş yapmayan kullanıcı
  REGISTERED: 3,   // Giriş yapmış (free) kullanıcı
  PREMIUM: 5,      // Premium kullanıcı
} as const;

const MAX_REWARDED_ADS = {
  GUEST: 1,        // Misafir: günde 1 rewarded ad
  REGISTERED: 2,   // Kayıtlı: günde 2 rewarded ad
  PREMIUM: 0,      // Premium: reklam yok
} as const;

// ═══════════════════════════════════
// TİPLER
// ═══════════════════════════════════

type UserType = 'GUEST' | 'REGISTERED' | 'PREMIUM';

interface DailyUsage {
  date: string;               // "YYYY-MM-DD" formatında
  queryCount: number;          // Bugün yapılan sorgu sayısı
  rewardedAdsWatched: number;  // Bugün izlenen reklam sayısı
  bonusQueries: number;        // Reklam izleyerek kazanılan ekstra hak
}

export interface QueryCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  used?: number;
  remaining?: number;
  canWatchAd?: boolean;
  userType?: UserType;
}

export interface RemainingInfo {
  limit: number;
  used: number;
  bonus: number;
  remaining: number;
  userType: UserType;
}

// ═══════════════════════════════════
// QUERYLIMT SERVİSİ
// ═══════════════════════════════════

/**
 * QueryLimitService — Günlük sorgu limiti yönetim servisi (singleton)
 *
 * Kullanıcı tipleri:
 *  - GUEST:      1 sorgu/gün, 1 rewarded ad/gün
 *  - REGISTERED: 3 sorgu/gün, 2 rewarded ad/gün
 *  - PREMIUM:    5 sorgu/gün, reklam yok
 *
 * Veri saklama:
 *  - Misafir:  AsyncStorage (@daily_usage)
 *  - Kayıtlı:  Firestore (users/{uid}.queryUsage)
 *
 * Gün sıfırlama: Client-side, UTC gece yarısı
 */
class QueryLimitService {

  // ═══════════════════════════════════
  // YARDIMCI METODLAR
  // ═══════════════════════════════════

  /**
   * Bugünün tarihini "YYYY-MM-DD" formatında döndür (UTC)
   */
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Kullanıcı tipini belirle (GUEST | REGISTERED | PREMIUM)
   */
  private async getUserType(): Promise<UserType> {
    const user = auth.currentUser;
    if (!user) return 'GUEST';

    try {
      const isPremium = await revenueCatService.checkPremiumStatus();
      return isPremium ? 'PREMIUM' : 'REGISTERED';
    } catch {
      return 'REGISTERED';
    }
  }

  // ═══════════════════════════════════
  // VERİ OKUMA / YAZMA
  // ═══════════════════════════════════

  /**
   * Günlük kullanım verilerini oku
   * Misafir → AsyncStorage | Kayıtlı → Firestore
   *
   * Gün değiştiyse otomatik olarak sıfırlanmış veri döner
   */
  async getDailyUsage(): Promise<DailyUsage> {
    const today = this.getTodayString();
    const user = auth.currentUser;

    const defaultUsage: DailyUsage = {
      date: today,
      queryCount: 0,
      rewardedAdsWatched: 0,
      bonusQueries: 0,
    };

    try {
      if (!user) {
        // ── MİSAFİR: AsyncStorage ──
        const stored = await AsyncStorage.getItem('@daily_usage');
        if (stored) {
          const parsed: DailyUsage = JSON.parse(stored);
          // Gün değiştiyse sıfırla
          if (parsed.date !== today) return defaultUsage;
          return parsed;
        }
        return defaultUsage;
      }

      // ── KAYITLI KULLANICI: Firestore ──
      const userDoc = await firestore
        .collection('users')
        .doc(user.uid)
        .get();

      const userData = userDoc.data();
      const usage = userData?.queryUsage;

      if (usage && usage.date === today) {
        return {
          date: usage.date,
          queryCount: usage.queryCount || 0,
          rewardedAdsWatched: usage.rewardedAdsWatched || 0,
          bonusQueries: usage.bonusQueries || 0,
        };
      }

      return defaultUsage;
    } catch (error) {
      console.error('❌ Failed to get daily usage:', error);
      return defaultUsage;
    }
  }

  /**
   * Günlük kullanım verilerini kaydet
   */
  private async saveDailyUsage(usage: DailyUsage): Promise<void> {
    const user = auth.currentUser;

    try {
      if (!user) {
        // ── MİSAFİR: AsyncStorage ──
        await AsyncStorage.setItem('@daily_usage', JSON.stringify(usage));
        return;
      }

      // ── KAYITLI KULLANICI: Firestore ──
      await firestore
        .collection('users')
        .doc(user.uid)
        .set({ queryUsage: usage }, { merge: true });
    } catch (error) {
      console.error('❌ Failed to save daily usage:', error);
    }
  }

  // ═══════════════════════════════════
  // ANA KONTROL FONKSİYONLARI
  // ═══════════════════════════════════

  /**
   * Sorgu yapılabilir mi? (ANA KONTROL FONKSİYONU)
   *
   * CardSelectionScreen.handleInterpret() fonksiyonunun BAŞINDA çağrılır.
   * API çağrısından ÖNCE kontrol eder → gereksiz maliyet engellenir.
   *
   * @returns { allowed: true } veya { allowed: false, reason, limit, used, canWatchAd }
   */
  async canMakeQuery(): Promise<QueryCheckResult> {
    const userType = await this.getUserType();
    const usage = await this.getDailyUsage();
    const limit = LIMITS[userType];
    const totalAllowed = limit + usage.bonusQueries;
    const remaining = totalAllowed - usage.queryCount;

    if (remaining > 0) {
      return {
        allowed: true,
        remaining,
        limit,
        used: usage.queryCount,
        userType,
      };
    }

    // Limit doldu — reklam izleyebilir mi?
    const maxAds = MAX_REWARDED_ADS[userType];
    const canWatchAd = usage.rewardedAdsWatched < maxAds;

    return {
      allowed: false,
      reason: 'daily_limit_reached',
      limit,
      used: usage.queryCount,
      remaining: 0,
      canWatchAd,
      userType,
    };
  }

  /**
   * Sorgu yapıldığında sayacı artır
   *
   * CardSelectionScreen'de API çağrısı BAŞARILI olduktan sonra çağrılır.
   */
  async recordQuery(): Promise<void> {
    const usage = await this.getDailyUsage();
    const today = this.getTodayString();

    const updatedUsage: DailyUsage = {
      ...usage,
      date: today,
      queryCount: usage.queryCount + 1,
    };

    await this.saveDailyUsage(updatedUsage);
    console.log(`📊 Query recorded: ${updatedUsage.queryCount}/${LIMITS[await this.getUserType()]}`);
  }

  /**
   * Rewarded reklam izlendiğinde +1 hak ver
   *
   * MysticLimitModal'da "Reklam İzle" butonuna basılıp
   * adService.showRewarded() başarılı olduktan sonra çağrılır.
   *
   * @returns true: bonus verildi, false: günlük reklam limiti doldu
   */
  async grantBonusFromAd(): Promise<boolean> {
    const userType = await this.getUserType();
    const usage = await this.getDailyUsage();
    const maxAds = MAX_REWARDED_ADS[userType];

    if (usage.rewardedAdsWatched >= maxAds) {
      console.warn('⚠️ Max rewarded ads reached for today');
      return false;
    }

    const updatedUsage: DailyUsage = {
      ...usage,
      date: this.getTodayString(),
      rewardedAdsWatched: usage.rewardedAdsWatched + 1,
      bonusQueries: usage.bonusQueries + 1,
    };

    await this.saveDailyUsage(updatedUsage);
    console.log('🎁 Bonus query granted from ad. New total:', updatedUsage.bonusQueries);
    return true;
  }

  /**
   * Kalan hak bilgisini al (UI gösterimi için)
   *
   * Opsiyonel: HomeScreen'de "Kalan: 2/3 okuma" göstermek için
   */
  async getRemainingInfo(): Promise<RemainingInfo> {
    const userType = await this.getUserType();
    const usage = await this.getDailyUsage();
    const limit = LIMITS[userType];
    const remaining = Math.max(0, limit + usage.bonusQueries - usage.queryCount);

    return {
      limit,
      used: usage.queryCount,
      bonus: usage.bonusQueries,
      remaining,
      userType,
    };
  }
}

const queryLimitService = new QueryLimitService();
export default queryLimitService;
