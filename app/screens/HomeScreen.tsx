import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Bileşenler ve context
import UserInputFormComponent from '../components/UserInputFormComponent';
import { useReadingContext } from '../context/ReadingContext';

// Navigasyon tipleri
import { RootStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

// HomeScreen bileşeni - Yeniden tasarlanmış ana giriş ekranı
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isLoading } = useReadingContext();
  
  // Form submit işlemi - artık kart seçimi ekranına yönlendiriyor
  const handleFormSubmit = async (question: string, mood: string) => {
    try {
      console.log('Form gönderildi:', { question, mood });
      
      // Kart seçimi ekranına yönlendir (artık direkt reading'e gitmiyor)
      navigation.navigate('CardSelection', { question, mood });
      
    } catch (error) {
      console.error('Form submit hatası:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo ve Başlık Bölümü */}
        <View style={styles.heroSection}>
          {/* Mistik Kedi SVG Placeholder */}
          <View style={styles.logoContainer}>
            <View style={styles.catSilhouette}>
              <View style={styles.catBody}>
                {/* Yıldız efektleri */}
                <View style={[styles.star, styles.star1]} />
                <View style={[styles.star, styles.star2]} />
                <View style={[styles.star, styles.star3]} />
                <View style={[styles.star, styles.star4]} />
                <View style={[styles.star, styles.star5]} />
                <View style={[styles.crescent, styles.crescent1]} />
                <View style={[styles.crescent, styles.crescent2]} />
              </View>
            </View>
          </View>
          
          <Text style={styles.appTitle}>TarotNova</Text>
          <Text style={styles.appSubtitle}>
            Yapay zeka destekli mistik yolculuğunuz
          </Text>
        </View>

        {/* Form Bölümü */}
        <View style={styles.formContainer}>
          <UserInputFormComponent 
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
          />
        </View>

        {/* Alt Bilgi */}
        <View style={styles.footerSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Kendi kartlarınızı seçin ve özel yorumunuzu alın
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// Stil tanımlamaları
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    minHeight: height,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 30,
  },
  catSilhouette: {
    width: 200,
    height: 120,
    backgroundColor: '#1a365d',
    borderRadius: 60,
    position: 'relative',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  catBody: {
    flex: 1,
    borderRadius: 60,
    position: 'relative',
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  star1: { top: 20, left: 30 },
  star2: { top: 40, left: 80 },
  star3: { top: 60, left: 45 },
  star4: { top: 30, left: 120 },
  star5: { top: 70, left: 160 },
  crescent: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 6,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  crescent1: { top: 25, left: 60 },
  crescent2: { top: 55, left: 110 },
  appTitle: {
    fontSize: 36,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#b3d9ff',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  formContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  footerSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoText: {
    color: '#e6f3ff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '300',
  },
});

export default HomeScreen;