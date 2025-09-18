import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Context ve tipler
import { useReadingContext } from '../context/ReadingContext';
import { RootStackParamList } from '../types/navigation';

type ReadingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reading'>;

// ReadingScreen bileşeni - Tarot yorumunun gösterileceği ekran
const ReadingScreen: React.FC = () => {
  const navigation = useNavigation<ReadingScreenNavigationProp>();
  const { isLoading, readingResult, error, clearReading } = useReadingContext();

  // Yeni okuma başlatma fonksiyonu
  const handleNewReading = () => {
    clearReading();
    navigation.navigate('Home');
  };

  // Hata durumu gösterimi
  if (error && !isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.errorSection}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Bir Hata Oluştu</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          
          <TouchableOpacity style={styles.retryButton} onPress={handleNewReading}>
            <Text style={styles.retryButtonText}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Yükleme durumu gösterimi
  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Başlık bölümü */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>🌟 Nova Yorumu</Text>
          <Text style={styles.subtitle}>AI kartları analiz ediyor...</Text>
        </View>

        {/* Yükleniyor göstergesi bölümü */}
        <View style={styles.loadingSection}>
          <ActivityIndicator 
            size="large" 
            color="#007AFF" 
            style={styles.loadingIndicator}
          />
          <Text style={styles.loadingText}>Nova AI Analiz Ediyor...</Text>
          <Text style={styles.loadingDescription}>
            Yapay zeka kartları inceliyor ve size özel yorum hazırlıyor.
          </Text>
        </View>

        {/* Ek bilgi bölümü */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            🌟 Her Nova yorumu yapay zeka ile kişisel durumunuza özel hazırlanır.
          </Text>
        </View>
      </View>
    );
  }

  // Sonuç gösterimi
  if (readingResult) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Başlık */}
        <View style={styles.resultHeaderSection}>
          <Text style={styles.resultTitle}>{readingResult.readingTitle}</Text>
          <Text style={styles.confidence}>
            Güvenilirlik: %{readingResult.confidence}
          </Text>
        </View>

        {/* Genel Yorum */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 Genel Yorum</Text>
          <Text style={styles.interpretationText}>
            {readingResult.holisticInterpretation}
          </Text>
        </View>

        {/* Kart Detayları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎴 Kart Analizleri</Text>
          {readingResult.cardDetails.map((card, index) => (
            <View key={index} style={styles.cardDetailContainer}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{card.cardName}</Text>
                <Text style={styles.cardPosition}>{card.position}</Text>
              </View>
              <Text style={styles.cardMeaning}>
                <Text style={styles.boldText}>Anlam: </Text>
                {card.meaning}
              </Text>
              <Text style={styles.cardAdvice}>
                <Text style={styles.boldText}>Tavsiye: </Text>
                {card.advice}
              </Text>
            </View>
          ))}
        </View>

        {/* Yaşam Alanları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Yaşam Alanları</Text>
          
          <View style={styles.lifeAspectContainer}>
            <Text style={styles.aspectTitle}>💕 Aşk & İlişkiler</Text>
            <Text style={styles.aspectText}>{readingResult.lifeAspects.love}</Text>
          </View>
          
          <View style={styles.lifeAspectContainer}>
            <Text style={styles.aspectTitle}>💼 Kariyer & İş</Text>
            <Text style={styles.aspectText}>{readingResult.lifeAspects.career}</Text>
          </View>
          
          <View style={styles.lifeAspectContainer}>
            <Text style={styles.aspectTitle}>🌱 Kişisel Gelişim</Text>
            <Text style={styles.aspectText}>{readingResult.lifeAspects.personal}</Text>
          </View>
        </View>

        {/* Özet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Özet</Text>
          <Text style={styles.summaryText}>{readingResult.summary}</Text>
        </View>

        {/* Yeni Okuma Butonu */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.newReadingButton} onPress={handleNewReading}>
            <Text style={styles.newReadingButtonText}>✨ Yeni Nova Yorumu</Text>
          </TouchableOpacity>
        </View>

        {/* Zaman damgası */}
        <View style={styles.timestampSection}>
          <Text style={styles.timestampText}>
            Okuma Zamanı: {new Date(readingResult.timestamp).toLocaleString('tr-TR')}
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Varsayılan durum (hiç okuma yok)
  return (
    <View style={styles.container}>
      <View style={styles.noDataSection}>
        <Text style={styles.noDataIcon}>🔮</Text>
        <Text style={styles.noDataTitle}>Henüz Nova Yorumu Yapılmadı</Text>
        <Text style={styles.noDataDescription}>
          Ana sayfaya dönüp yeni bir AI destekli tarot yorumu başlatabilirsiniz.
        </Text>
        
        <TouchableOpacity style={styles.backButton} onPress={handleNewReading}>
          <Text style={styles.backButtonText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Stil tanımlamaları
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  loadingSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 80,
  },
  loadingIndicator: {
    marginBottom: 24,
    transform: [{ scale: 1.5 }],
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  infoSection: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  // Sonuç gösterimi stilleri
  resultHeaderSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  confidence: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  interpretationText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
  },
  cardDetailContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  cardPosition: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardMeaning: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
  cardAdvice: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  lifeAspectContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  aspectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  aspectText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  summaryText: {
    fontSize: 15,
    color: '#34495e',
    lineHeight: 24,
    textAlign: 'justify',
  },
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  newReadingButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  newReadingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timestampSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timestampText: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  // Hata durumu stilleri
  errorSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Veri yok durumu stilleri
  noDataSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noDataIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReadingScreen;