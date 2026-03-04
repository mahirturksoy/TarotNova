// app/screens/PremiumScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'; // <-- ÇEVİRİ EKLENDİ

import PurchaseService, { OfferingPackage } from '../services/purchaseService'; // <-- SERVİS EKLENDİ
import Toast from 'react-native-toast-message';

const TERMS_URL = 'https://mahirturksoy.github.io/tarotnova-legal/terms.html';
const PRIVACY_URL = 'https://mahirturksoy.github.io/tarotnova-legal/privacy-policy.html';

const PremiumScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation(); // <-- HOOK
  const [loading, setLoading] = useState(false);
  const [priceText, setPriceText] = useState(t('common.loading'));
  const [packages, setPackages] = useState<OfferingPackage[]>([]); // <-- TİP DEĞİŞTİ

  useEffect(() => {
    loadOfferings();
  }, [t]); 

  const loadOfferings = async () => {
    try {
      const offerings = await PurchaseService.getOfferings();

      // Dil kontrolü: Türkçe ise 'Ay', değilse 'Month'
      const monthLabel = i18n.language === 'tr' ? 'Ay' : 'Month';
      const yearLabel = i18n.language === 'tr' ? 'Yıl' : 'Year';

      if (offerings.length > 0) {
        setPackages(offerings);

        // Monthly paketi öncelikli göster
        const monthlyPkg = offerings.find(p => p.identifier.toLowerCase().includes('monthly'));
        const yearlyPkg = offerings.find(p => p.identifier.toLowerCase().includes('annual') || p.identifier.toLowerCase().includes('yearly'));

        if (monthlyPkg) {
          setPriceText(`${monthlyPkg.product.priceString} / ${monthLabel}`);
        } else if (offerings[0]) {
          setPriceText(`${offerings[0].product.priceString} / ${monthLabel}`);
        }
      } else {
        // Offerings yüklenemedi - kullanıcıya bildir
        Toast.show({
          type: 'error',
          text1: i18n.language === 'tr' ? 'Bağlantı Hatası' : 'Connection Error',
          text2: i18n.language === 'tr' ? 'Premium paketler yüklenemedi. Lütfen tekrar deneyin.' : 'Failed to load premium packages. Please try again.',
        });
        setPriceText(t('premium.price')); // Fallback: Dil dosyasından gelir (₺50.00 / Ay)
      }
    } catch (error) {
      console.error('❌ Load offerings error:', error);
      Toast.show({
        type: 'error',
        text1: i18n.language === 'tr' ? 'Hata' : 'Error',
        text2: i18n.language === 'tr' ? 'Bir hata oluştu. Lütfen tekrar deneyin.' : 'An error occurred. Please try again.',
      });
      setPriceText(t('premium.price'));
    }
  };

  const handlePurchase = async () => {
    if (packages.length === 0) {
      Toast.show({
        type: 'error',
        text1: i18n.language === 'tr' ? 'Hata' : 'Error',
        text2: i18n.language === 'tr' ? 'Paketler yüklenemedi' : 'Failed to load packages',
      });
      return;
    }

    setLoading(true);

    // Monthly paketi öncelikli kullan
    const selectedPackage = packages.find(p => p.identifier.toLowerCase().includes('monthly')) || packages[0];

    // Type safety: packages.length kontrolü üstte yapıldı ama yine de assert edelim
    if (!selectedPackage) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: i18n.language === 'tr' ? 'Hata' : 'Error',
        text2: i18n.language === 'tr' ? 'Paket seçilemedi' : 'Failed to select package',
      });
      return;
    }

    const success = await PurchaseService.purchasePackage(selectedPackage);

    setLoading(false);

    if (success) {
      Toast.show({
        type: 'success',
        text1: i18n.language === 'tr' ? '✨ Tebrikler!' : '✨ Congratulations!',
        text2: i18n.language === 'tr' ? 'Premium üyeliğiniz aktif' : 'Your premium membership is active',
      });

      // Kısa bir delay sonra geri dön (toast görünsün diye)
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } else {
      Toast.show({
        type: 'info',
        text1: i18n.language === 'tr' ? 'İptal Edildi' : 'Cancelled',
        text2: i18n.language === 'tr' ? 'Satın alma iptal edildi' : 'Purchase was cancelled',
      });
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const restored = await PurchaseService.restorePurchases();
    setLoading(false);

    if (restored) {
      Toast.show({
        type: 'success',
        text1: i18n.language === 'tr' ? '✅ Geri Yüklendi' : '✅ Restored',
        text2: i18n.language === 'tr' ? 'Satın alımlarınız geri yüklendi' : 'Your purchases have been restored',
      });

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } else {
      Toast.show({
        type: 'info',
        text1: i18n.language === 'tr' ? 'Bilgi' : 'Info',
        text2: i18n.language === 'tr' ? 'Aktif abonelik bulunamadı' : 'No active subscription found',
      });
    }
  };

  return (
    <LinearGradient colors={['#2b173f', '#1d112b']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
             <View style={styles.iconContainer}>
            <Text style={styles.mysticIcon}>✦</Text>
          </View>     
          <Text style={styles.title}>{t('premium.title')}</Text>
          <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>
        </View>

        <View style={styles.featuresContainer}>
          {/* Emojiler ve Yapı Aynen Korundu, Sadece Metinler Çevrildi */}
          <FeatureItem icon="🔓 " text={t('premium.features.f1')} />
          <FeatureItem icon="∞  " text={t('premium.features.f2')} />
          <FeatureItem icon="⚡️ " text={t('premium.features.f3')} />
          <FeatureItem icon="🚫 " text={t('premium.features.f4')} />
        </View>

        <TouchableOpacity 
          style={styles.upgradeButton} 
          activeOpacity={0.8}
          onPress={handlePurchase}
          disabled={loading}
        >
          <LinearGradient colors={['#d4af37', '#F59E0B']} style={styles.buttonGradient}>
            {loading ? (
                <ActivityIndicator color="#1d112b" />
            ) : (
                <>
                    <Text style={styles.buttonText}>{t('premium.btn')}</Text>
                    <Text style={styles.priceText}>{priceText}</Text>
                </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={loading}
        >
          <Text style={styles.restoreButtonText}>
            {i18n.language === 'tr' ? 'Satın Alımları Geri Yükle' : 'Restore Purchases'}
          </Text>
        </TouchableOpacity>

        {/* Subscription Details - Apple Guideline 3.1.2 Compliance */}
        <View style={styles.subscriptionInfoContainer}>
          <Text style={styles.subscriptionInfoText}>
            {t('premium.subscriptionInfo')}
          </Text>
          <Text style={styles.autoRenewText}>
            {t('premium.autoRenewInfo')}
          </Text>
        </View>

        {/* Legal Links - Tappable */}
        <View style={styles.legalLinksContainer}>
          <Text style={styles.legalNoticeText}>
            {t('premium.legalPrefix')}
          </Text>
          <View style={styles.legalLinksRow}>
            <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
              <Text style={styles.legalLinkText}>{t('profile.account.terms')}</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}> {t('common.and')} </Text>
            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
              <Text style={styles.legalLinkText}>{t('profile.account.privacy')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.legalNoticeText}>
            {t('premium.legalSuffix')}
          </Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>{t('premium.notNow')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.featureRow}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
  
  header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  iconContainer: {
    marginBottom: 16,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  mysticIcon: { 
    fontSize: 72, 
    color: '#d4af37',
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#f3e8ff', 
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }), 
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: { 
    fontSize: 16, 
    color: 'rgba(243, 232, 255, 0.6)', 
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' })
  },

  featuresContainer: { 
    width: '100%', 
    marginBottom: 40, 
    backgroundColor: 'rgba(43, 23, 63, 0.5)', 
    borderRadius: 24, 
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)'
  },
  featureRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  iconBox: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureIcon: { 
    fontSize: 28, 
    color: '#d4af37', // İkonları Altın Yaptık
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    marginRight: 15, // İkon ile yazı arasına biraz boşluk
  },
  textContainer: {
    flex: 1,
  },
  featureText: { 
    fontSize: 16, 
    color: '#f3e8ff', 
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    marginBottom: 2,
    flex: 1 // Metnin sığması için
  },
  featureDescription: {
    fontSize: 12,
    color: 'rgba(243, 232, 255, 0.5)',
  },

  upgradeButton: { 
    width: '100%', 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginBottom: 16, 
    shadowColor: '#d4af37', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 12, 
    elevation: 8 
  },
  buttonGradient: { 
    paddingVertical: 18, 
    alignItems: 'center' 
  },
  buttonText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1d112b',
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' })
  },
  priceText: {
    fontSize: 14,
    color: '#1d112b',
    marginTop: 4,
    fontWeight: '600',
    opacity: 0.8
  },

  restoreButton: {
    padding: 12,
    marginBottom: 8,
  },
  restoreButtonText: {
    color: 'rgba(243, 232, 255, 0.6)',
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textDecorationLine: 'underline',
    textAlign: 'center',
  },

  legalNoticeText: {
    color: 'rgba(243, 232, 255, 0.5)',
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 16,
  },

  subscriptionInfoContainer: {
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  subscriptionInfoText: {
    color: 'rgba(243, 232, 255, 0.5)',
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textAlign: 'center',
    lineHeight: 16,
  },
  autoRenewText: {
    color: 'rgba(243, 232, 255, 0.5)',
    fontSize: 10,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 4,
  },

  legalLinksContainer: {
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legalLinkText: {
    color: '#d4af37',
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: 'rgba(243, 232, 255, 0.5)',
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },

  closeButton: {
    padding: 12
  },
  closeButtonText: {
    color: 'rgba(243, 232, 255, 0.4)',
    fontSize: 15,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textAlign: 'center',
  },
});

export default PremiumScreen;