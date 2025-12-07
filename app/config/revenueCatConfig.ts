import { Platform } from 'react-native';

export const REVENUECAT_CONFIG = {
  // Platform-specific API keys
  apiKey: Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY || '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY || '',
  }) || '',

  // Product IDs (App Store Connect ve Play Console'da oluşturduğunuz)
  PRODUCTS: {
    MONTHLY: 'tarotnova_premium_monthly',
    YEARLY: 'tarotnova_premium_yearly',
  },

  // Entitlement ID (RevenueCat Dashboard'da oluşturduğunuz)
  ENTITLEMENT_ID: 'premium',
};
