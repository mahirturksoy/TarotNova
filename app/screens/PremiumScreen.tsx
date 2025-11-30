// app/screens/PremiumScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'; // <-- ÇEVİRİ EKLENDİ

import PurchaseService from '../services/purchaseService'; // <-- SERVİS EKLENDİ

const PremiumScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation(); // <-- HOOK
  const [loading, setLoading] = useState(false);
  const [priceText, setPriceText] = useState(t('common.loading')); 
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    loadOfferings();
  }, [t]); 

  const loadOfferings = async () => {
    const offerings = await PurchaseService.getOfferings();
    
    // Dil kontrolü: Türkçe ise 'Ay', değilse 'Month'
    const monthLabel = i18n.language === 'tr' ? 'Ay' : 'Month';

    if (offerings.length > 0) {
      setPackages(offerings);
      setPriceText(`${offerings[0].product.priceString} / ${monthLabel}`);
    } else {
      setPriceText(t('premium.price')); // Fallback: Dil dosyasından gelir (₺50.00 / Ay)
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    const success = await PurchaseService.purchasePackage(packages[0] || null);
    setLoading(false);

    if (success) {
      navigation.goBack();
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
  
  closeButton: { 
    padding: 12 
  },
  closeButtonText: { 
    color: 'rgba(243, 232, 255, 0.4)', 
    fontSize: 15,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' })
  },
});

export default PremiumScreen;