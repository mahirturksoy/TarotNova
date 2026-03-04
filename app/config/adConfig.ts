// app/config/adConfig.ts

import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const isTestMode = __DEV__;

export const AD_CONFIG = {
  // ═══════════════════════════════════
  // BANNER AD UNIT ID
  // ═══════════════════════════════════
  BANNER_ID: isTestMode
    ? TestIds.ADAPTIVE_BANNER
    : Platform.select({
        ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS || '',
        android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID || '',
      }) || '',

  // ═══════════════════════════════════
  // INTERSTITIAL AD UNIT ID
  // ═══════════════════════════════════
  INTERSTITIAL_ID: isTestMode
    ? TestIds.INTERSTITIAL
    : Platform.select({
        ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS || '',
        android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID || '',
      }) || '',

  // ═══════════════════════════════════
  // REWARDED AD UNIT ID
  // ═══════════════════════════════════
  REWARDED_ID: isTestMode
    ? TestIds.REWARDED
    : Platform.select({
        ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS || '',
        android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID || '',
      }) || '',

  // ═══════════════════════════════════
  // REKLAM POLİTİKASI
  // ═══════════════════════════════════

  // Günde kaç kez rewarded ad izlenebilsin (limit dolunca +1 hak)
  MAX_REWARDED_PER_DAY: 2,
};
