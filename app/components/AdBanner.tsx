// app/components/AdBanner.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { AD_CONFIG } from '../config/adConfig';
import adService from '../services/adService';

interface AdBannerProps {
  style?: object;
}

/**
 * AdBanner — Banner reklam bileşeni
 *
 * Premium kullanıcıya gösterilmez (adService.shouldShowBanner() kontrolü).
 * ReadingHistoryScreen'in alt kısmında kullanılır.
 *
 * Adaptive banner boyutu kullanır — ekran genişliğine otomatik uyum sağlar.
 */
const AdBanner: React.FC<AdBannerProps> = ({ style }) => {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    checkPremium();
  }, []);

  const checkPremium = async () => {
    const shouldShow = await adService.shouldShowBanner();
    setShowAd(shouldShow);
  };

  if (!showAd) return null;

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={AD_CONFIG.BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error: Error) => {
          console.error('❌ Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#1d112b',
  },
});

export default AdBanner;
