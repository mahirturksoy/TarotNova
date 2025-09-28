import React from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Share,
  Linking,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useReadingContext } from '../context/ReadingContext';
import { CATEGORY_COLORS } from '../constants/spreadTypes';
import type { RootStackParamList } from '../types/navigation';

type ReadingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reading'>;

const { width } = Dimensions.get('window');

/**
 * ReadingScreen - Tarot yorumlarını gösteren ana ekran
 * WhatsApp paylaşım desteği ve kullanıcı günlüğü entegrasyonu ile
 */
const ReadingScreen: React.FC = () => {
  const navigation = useNavigation<ReadingScreenNavigationProp>();
  const { 
    isLoading, 
    readingResult, 
    error, 
    clearReading, 
    currentSpread,
    lastQuestion,
    lastMood,
    lastCards 
  } = useReadingContext();

  // Yeni okuma başlatma fonksiyonu
  const handleNewReading = () => {
    clearReading();
    navigation.navigate('Home');
  };

  // Okuma geçmişine gitme
  const handleViewHistory = () => {
    navigation.navigate('ReadingHistory');
  };

  // Normal paylaşım fonksiyonu
  const handleShareReading = async () => {
    if (!readingResult) return;

    try {
      const shareText = `🔮 ${readingResult.readingTitle}

📝 Soru: "${lastQuestion}"
🎯 Ruh Hali: ${lastMood}
🎴 Spread: ${currentSpread?.name || 'Klasik Okuma'}

✨ ${readingResult.summary}

TarotNova ile tarot okuması yaptım!`;

      const result = await Share.share(
        {
          message: shareText,
          title: 'TarotNova Okumam'
        },
        {
          dialogTitle: 'Tarot okumamı paylaş',
          excludedActivityTypes: [],
          tintColor: '#E8B923'
        }
      );

      console.log('Paylaşım sonucu:', result);
      
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  // WhatsApp'a özel paylaşım fonksiyonu - Mobil uyumlu versiyon
  const handleWhatsAppShare = async () => {
    if (!readingResult) return;

    try {
      // WhatsApp için optimize edilmiş metin
      const shareText = `🔮 ${readingResult.readingTitle}

📝 Soru: "${lastQuestion}"
🎯 Ruh Hali: ${lastMood}

✨ Özet:
${readingResult.summary}

TarotNova ile tarot okuması yaptım!`;

      // Platform bazlı URL oluşturma
      const encodedText = encodeURIComponent(shareText);
      
      // iOS ve Android için farklı URL scheme'ler dene
      const whatsappUrls = [
        `whatsapp://send?text=${encodedText}`,
        `https://wa.me/?text=${encodedText}`,
        `https://api.whatsapp.com/send?text=${encodedText}`
      ];
      
      console.log('WhatsApp paylaşımı deneniyor...');
      
      let opened = false;
      
      for (const url of whatsappUrls) {
        try {
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            console.log('WhatsApp başarıyla açıldı:', url);
            opened = true;
            break;
          }
        } catch (urlError) {
          console.log('URL denenemedi:', url, urlError);
          continue;
        }
      }
      
      if (!opened) {
        // WhatsApp açılamazsa normal paylaşım
        console.log('WhatsApp açılamadı, normal paylaşım kullanılıyor');
        handleShareReading();
      }
      
    } catch (error) {
      console.error('WhatsApp paylaşım hatası:', error);
      handleShareReading();
    }
  };

  // Spread renk temasını belirle
  const getSpreadColors = () => {
    if (!currentSpread) return CATEGORY_COLORS.general;
    return CATEGORY_COLORS[currentSpread.category];
  };

  const spreadColors = getSpreadColors();

  // Hata durumu gösterimi
  if (error && !isLoading) {
    return (
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#1e3c72']}
        style={styles.container}
      >
        <View style={styles.errorSection}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Bir Hata Oluştu</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          
          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.retryButton} onPress={handleNewReading}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Yeniden Dene</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
              <LinearGradient
                colors={['#6B7280', '#4B5563']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Geçmişi Gör</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Yükleme durumu gösterimi
  if (isLoading) {
    return (
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#1e3c72']}
        style={styles.container}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Nova Yorumunuz Hazırlanıyor</Text>
          {currentSpread && (
            <Text style={styles.spreadTitle}>{currentSpread.name}</Text>
          )}
          <Text style={styles.subtitle}>AI kartları analiz ediyor...</Text>
        </View>

        <View style={styles.loadingSection}>
          <ActivityIndicator 
            size="large" 
            color="#E8B923" 
            style={styles.loadingIndicator}
          />
          <Text style={styles.loadingText}>Nova AI Analiz Ediyor...</Text>
          <Text style={styles.loadingDescription}>
            {lastCards.length} kart analiz ediliyor ve size özel yorum hazırlanıyor.
          </Text>
          
          <View style={styles.selectedCardsDisplay}>
            <Text style={styles.selectedCardsTitle}>Seçilen Kartlar:</Text>
            <View style={styles.cardsList}>
              {lastCards.map((card, index) => (
                <View key={index} style={styles.cardChip}>
                  <Text style={styles.cardChipText}>{card}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            🌟 Her Nova yorumu yapay zeka ile kişisel durumunuza özel hazırlanır.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // Sonuç gösterimi
  if (readingResult) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <LinearGradient
          colors={['#1e3c72', '#2a5298', '#1e3c72']}
          style={styles.backgroundGradient}
        >
          <LinearGradient
            colors={[spreadColors.primary, spreadColors.light]}
            style={styles.resultHeaderSection}
          >
            <Text style={styles.resultTitle}>{readingResult.readingTitle}</Text>
            {currentSpread && (
              <Text style={styles.spreadInfo}>
                {currentSpread.name} • {lastCards.length} Kart
              </Text>
            )}
            <Text style={styles.confidence}>
              Güvenilirlik: %{readingResult.confidence}
            </Text>
            
            <View style={styles.questionInfo}>
              <Text style={styles.questionInfoText}>
                "{lastQuestion}" • {lastMood}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔮</Text>
              <Text style={styles.sectionTitle}>Genel Yorum</Text>
            </View>
            <Text style={styles.interpretationText}>
              {readingResult.holisticInterpretation}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🎴</Text>
              <Text style={styles.sectionTitle}>Kart Analizleri</Text>
            </View>
            {readingResult.cardDetails.map((card, index) => (
              <View key={index} style={styles.cardDetailContainer}>
                <LinearGradient
                  colors={['#2D3748', '#4A5568']}
                  style={styles.cardDetailGradient}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{card.cardName}</Text>
                    <View style={[
                      styles.positionBadge,
                      { backgroundColor: spreadColors.background }
                    ]}>
                      <Text style={[
                        styles.positionText,
                        { color: spreadColors.primary }
                      ]}>
                        {card.position}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardMeaning}>
                    <Text style={styles.boldText}>Anlam: </Text>
                    {card.meaning}
                  </Text>
                  <Text style={styles.cardAdvice}>
                    <Text style={styles.boldText}>Tavsiye: </Text>
                    {card.advice}
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🌟</Text>
              <Text style={styles.sectionTitle}>Yaşam Alanları</Text>
            </View>
            
            <View style={styles.lifeAspectContainer}>
              <View style={styles.aspectHeader}>
                <Text style={styles.aspectIcon}>💕</Text>
                <Text style={styles.aspectTitle}>Aşk & İlişkiler</Text>
              </View>
              <Text style={styles.aspectText}>{readingResult.lifeAspects.love}</Text>
            </View>
            
            <View style={styles.lifeAspectContainer}>
              <View style={styles.aspectHeader}>
                <Text style={styles.aspectIcon}>💼</Text>
                <Text style={styles.aspectTitle}>Kariyer & İş</Text>
              </View>
              <Text style={styles.aspectText}>{readingResult.lifeAspects.career}</Text>
            </View>
            
            <View style={styles.lifeAspectContainer}>
              <View style={styles.aspectHeader}>
                <Text style={styles.aspectIcon}>🌱</Text>
                <Text style={styles.aspectTitle}>Kişisel Gelişim</Text>
              </View>
              <Text style={styles.aspectText}>{readingResult.lifeAspects.personal}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📋</Text>
              <Text style={styles.sectionTitle}>Özet</Text>
            </View>
            <LinearGradient
              colors={[spreadColors.background, 'transparent']}
              style={styles.summaryContainer}
            >
              <Text style={styles.summaryText}>{readingResult.summary}</Text>
            </LinearGradient>
          </View>

          <View style={styles.actionSection}>
            <View style={styles.shareButtonsRow}>
              <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppShare}>
                <View style={styles.socialButtonContent}>
                  <Text style={styles.socialButtonIcon}>💬</Text>
                  <Text style={styles.socialButtonText}>WhatsApp</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareButton} onPress={handleShareReading}>
                <View style={styles.socialButtonContent}>
                  <Text style={styles.socialButtonIcon}>📤</Text>
                  <Text style={styles.socialButtonText}>Diğer</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.mainActionsRow}>
              <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
                <LinearGradient
                  colors={['#6366F1', '#4F46E5']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>📚 Geçmiş</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.newReadingButton} onPress={handleNewReading}>
                <LinearGradient
                  colors={['#E8B923', '#F59E0B']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>✨ Yeni Okuma</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timestampSection}>
            <Text style={styles.timestampText}>
              Okuma Zamanı: {new Date(readingResult.timestamp).toLocaleString('tr-TR')}
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    );
  }

  // Varsayılan durum (hiç okuma yok)
  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      style={styles.container}
    >
      <View style={styles.noDataSection}>
        <Text style={styles.noDataIcon}>🔮</Text>
        <Text style={styles.noDataTitle}>Henüz Nova Yorumu Yapılmadı</Text>
        <Text style={styles.noDataDescription}>
          Ana sayfaya dönüp yeni bir AI destekli tarot yorumu başlatabilirsiniz.
        </Text>
        
        <TouchableOpacity style={styles.backButton} onPress={handleNewReading}>
          <LinearGradient
            colors={['#E8B923', '#F59E0B']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Ana Sayfaya Dön</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
          <LinearGradient
            colors={['#6B7280', '#4B5563']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Geçmişi Gör</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  backgroundGradient: {
    flex: 1,
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
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  spreadTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
    fontWeight: '600' as const,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  loadingDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  
  selectedCardsDisplay: {
    width: '100%',
    alignItems: 'center',
  },
  
  selectedCardsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#E8B923',
    marginBottom: 12,
  },
  
  cardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  
  cardChip: {
    backgroundColor: 'rgba(232, 185, 35, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(232, 185, 35, 0.4)',
  },
  
  cardChipText: {
    fontSize: 12,
    color: '#E8B923',
    fontWeight: '500' as const,
  },
  
  infoSection: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E8B923',
  },
  
  resultHeaderSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginBottom: 20,
  },
  
  resultTitle: {
    fontSize: 26,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  spreadInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  
  confidence: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  
  questionInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  questionInfoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
  },
  
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#2d3748',
  },
  
  interpretationText: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
  },
  
  cardDetailContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  cardDetailGradient: {
    padding: 16,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  cardName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    flex: 1,
  },
  
  positionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  positionText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  
  cardMeaning: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  cardAdvice: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  
  boldText: {
    fontWeight: 'bold' as const,
    color: '#ffffff',
  },
  
  lifeAspectContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E8B923',
  },
  
  aspectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  aspectIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  
  aspectTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#2d3748',
  },
  
  aspectText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
  },
  
  summaryText: {
    fontSize: 15,
    color: '#2d3748',
    lineHeight: 24,
    textAlign: 'justify',
    fontWeight: '500' as const,
  },
  
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  
  shareButtonsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16, // Telegram butonu olmadığı için gap artırıldı
  },
  
  mainActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  whatsappButton: {
    flex: 1,
    backgroundColor: '#25D366',
    borderRadius: 12,
    padding: 16, // Daha büyük padding - sadece 2 buton var
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  shareButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16, // Daha büyük padding
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  socialButtonContent: {
    alignItems: 'center',
  },
  
  socialButtonIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  
  socialButtonText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#ffffff',
  },
  
  historyButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  newReadingButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#ffffff',
  },
  
  timestampSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  timestampText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  
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
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  
  errorButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  
  retryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
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
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  noDataDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  
  backButton: {
    width: '80%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default ReadingScreen;