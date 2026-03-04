// app/services/adService.ts

import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { AD_CONFIG } from '../config/adConfig';
import revenueCatService from './revenueCatService';

/**
 * AdService — TarotNova Reklam Yönetim Servisi
 *
 * Interstitial: HER okumada gösterilir (agresif mod)
 *   - "Yorumla" butonuna basıldığında → API'den ÖNCE
 *   - "Yeni Okuma" butonuna basıldığında → ReadingScreen'den çıkarken
 *
 * Rewarded: Günlük limit dolduğunda → "Reklam İzle → +1 Hak"
 *
 * Banner: ReadingHistoryScreen alt kısmında
 *
 * Premium kullanıcılara HİÇBİR reklam gösterilmez.
 */
class AdService {
  private interstitialAd: InterstitialAd | null = null;
  private rewardedAd: RewardedAd | null = null;
  private isInterstitialLoaded: boolean = false;
  private isRewardedLoaded: boolean = false;
  private isInitialized: boolean = false;

  // ═══════════════════════════════════
  // BAŞLATMA
  // ═══════════════════════════════════

  /**
   * Reklam servisini başlat
   * App.tsx'te çağrılmalı — Premium kullanıcı ise skip eder
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ AdService already initialized');
      return;
    }

    const isPremium = await this.isUserPremium();
    if (isPremium) {
      console.log('👑 Premium user — skipping ad initialization');
      return;
    }

    console.log('📺 Initializing AdService...');
    this.preloadInterstitial();
    this.preloadRewarded();
    this.isInitialized = true;
    console.log('✅ AdService initialized');
  }

  /**
   * Premium durumunu kontrol et
   */
  private async isUserPremium(): Promise<boolean> {
    try {
      return await revenueCatService.checkPremiumStatus();
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════
  // INTERSTITIAL REKLAM
  // ═══════════════════════════════════

  /**
   * Interstitial reklamı önceden yükle
   */
  private preloadInterstitial(): void {
    try {
      this.interstitialAd = InterstitialAd.createForAdRequest(
        AD_CONFIG.INTERSTITIAL_ID
      );

      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        this.isInterstitialLoaded = true;
        console.log('✅ Interstitial ad loaded');
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        this.isInterstitialLoaded = false;
        // Kapandıktan sonra hemen yenisini yükle
        this.preloadInterstitial();
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error: Error) => {
        console.error('❌ Interstitial ad error:', error);
        this.isInterstitialLoaded = false;
        // 30 saniye sonra tekrar dene
        setTimeout(() => this.preloadInterstitial(), 30000);
      });

      this.interstitialAd.load();
    } catch (error) {
      console.error('❌ Failed to preload interstitial:', error);
    }
  }

  /**
   * Interstitial reklamı göster
   *
   * HER okumada çağrılır (agresif mod):
   *  1) CardSelectionScreen — "Yorumla" butonuna basınca (API'den önce)
   *  2) ReadingScreen — "Yeni Okuma" / "Geçmiş" butonlarına basınca
   *
   * Premium kullanıcıda gösterilmez.
   *
   * @returns true: reklam gösterildi veya premium, false: yüklenemedi (skip)
   */
  async showInterstitial(): Promise<boolean> {
    // Premium kontrolü
    const isPremium = await this.isUserPremium();
    if (isPremium) return true; // Premium → reklam atla, akışa devam

    if (!this.isInterstitialLoaded || !this.interstitialAd) {
      console.log('⚠️ Interstitial not loaded — skipping');
      // Reklam yüklenememiş olsa bile akışı engelleme
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const closeListener = this.interstitialAd!.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          closeListener();
          resolve(true);
        }
      );

      this.interstitialAd!.show().catch((error: Error) => {
        console.error('❌ Failed to show interstitial:', error);
        closeListener();
        resolve(true); // Hata olsa bile akışı engelleme
      });
    });
  }

  // ═══════════════════════════════════
  // REWARDED REKLAM
  // ═══════════════════════════════════

  /**
   * Rewarded reklamı önceden yükle
   */
  private preloadRewarded(): void {
    try {
      this.rewardedAd = RewardedAd.createForAdRequest(
        AD_CONFIG.REWARDED_ID
      );

      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.isRewardedLoaded = true;
        console.log('✅ Rewarded ad loaded');
      });

      this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        this.isRewardedLoaded = false;
        // Kapandıktan sonra yenisini yükle
        this.preloadRewarded();
      });

      this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error: Error) => {
        console.error('❌ Rewarded ad error:', error);
        this.isRewardedLoaded = false;
        setTimeout(() => this.preloadRewarded(), 30000);
      });

      this.rewardedAd.load();
    } catch (error) {
      console.error('❌ Failed to preload rewarded:', error);
    }
  }

  /**
   * Rewarded reklam göster — kullanıcı "Reklam İzle → +1 Hak" butonuna basınca
   *
   * @returns true: kullanıcı ödül kazandı, false: izleyemedi/iptal etti
   */
  showRewarded(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isRewardedLoaded || !this.rewardedAd) {
        console.log('⚠️ Rewarded ad not loaded');
        resolve(false);
        return;
      }

      let rewarded = false;

      const rewardListener = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          rewarded = true;
          console.log('🎁 User earned reward from ad');
        }
      );

      const closeListener = this.rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          rewardListener();
          closeListener();
          resolve(rewarded);
        }
      );

      this.rewardedAd.show().catch((error: Error) => {
        console.error('❌ Failed to show rewarded:', error);
        rewardListener();
        closeListener();
        resolve(false);
      });
    });
  }

  /**
   * Rewarded reklam yüklü mü?
   * MysticLimitModal'da butonun aktif/pasif durumu için
   */
  isRewardedReady(): boolean {
    return this.isRewardedLoaded;
  }

  // ═══════════════════════════════════
  // BANNER YARDIMCI
  // ═══════════════════════════════════

  /**
   * Banner gösterilmeli mi?
   * Premium kullanıcıda false döner
   */
  async shouldShowBanner(): Promise<boolean> {
    return !(await this.isUserPremium());
  }

  // ═══════════════════════════════════
  // TEMİZLİK
  // ═══════════════════════════════════

  /**
   * Kaynakları temizle
   */
  cleanup(): void {
    this.isInitialized = false;
    this.isInterstitialLoaded = false;
    this.isRewardedLoaded = false;
    this.interstitialAd = null;
    this.rewardedAd = null;
    console.log('✅ AdService cleaned up');
  }
}

// Singleton instance
const adService = new AdService();
export default adService;
