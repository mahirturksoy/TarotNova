import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Share,
  Linking,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CATEGORY_COLORS } from '../constants/spreadTypes';
import { toggleReadingFavorite, deleteReading } from '../services/readingHistoryService';
import type { RootStackParamList } from '../types/navigation';
import type { ReadingHistoryItem } from '../services/readingHistoryService';

type ReadingDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReadingDetail'>;

interface RouteParams {
  reading: ReadingHistoryItem;
}

const { width } = Dimensions.get('window');

const ReadingDetailScreen: React.FC = () => {
  const navigation = useNavigation<ReadingDetailScreenNavigationProp>();
  const route = useRoute();
  const { reading: initialReading } = route.params as RouteParams;

  const [reading, setReading] = useState<ReadingHistoryItem>(initialReading);
  const [isUpdating, setIsUpdating] = useState(false);

  const spreadColors = reading.spreadType 
    ? CATEGORY_COLORS[reading.spreadType.category]
    : CATEGORY_COLORS.general;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShareReading = async () => {
    try {
      const shareText = `🔮 ${reading.readingTitle}

📝 Soru: "${reading.question}"
🎯 Ruh Hali: ${reading.mood}
🎴 Spread: ${reading.spreadType?.name || 'Klasik Okuma'}

✨ ${reading.summary}

TarotNova ile tarot okuması yaptım!`;

      await Share.share(
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
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      const shareText = `🔮 ${reading.readingTitle}

📝 Soru: "${reading.question}"
🎯 Ruh Hali: ${reading.mood}

✨ Özet:
${reading.summary}

TarotNova ile tarot okuması yaptım!`;

      const encodedText = encodeURIComponent(shareText);
      
      const whatsappUrls = [
        `whatsapp://send?text=${encodedText}`,
        `https://wa.me/?text=${encodedText}`,
        `https://api.whatsapp.com/send?text=${encodedText}`
      ];
      
      let opened = false;
      
      for (const url of whatsappUrls) {
        try {
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            opened = true;
            break;
          }
        } catch (urlError) {
          continue;
        }
      }
      
      if (!opened) {
        handleShareReading();
      }
      
    } catch (error) {
      console.error('WhatsApp paylaşım hatası:', error);
      handleShareReading();
    }
  };

  const handleFavoriteToggle = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      await toggleReadingFavorite(reading.id);
      setReading(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    } catch (error) {
      console.error('Favori durumu değiştirilemedi:', error);
      Alert.alert('Hata', 'Favori durumu değiştirilemedi');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReading = () => {
    Alert.alert(
      'Okumayı Sil',
      'Bu okumayı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReading(reading.id);
              navigation.goBack();
            } catch (error) {
              console.error('Okuma silinemedi:', error);
              Alert.alert('Hata', 'Okuma silinemedi');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#1e3c72']}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <LinearGradient
          colors={[spreadColors.primary, spreadColors.light]}
          style={styles.headerSection}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={handleFavoriteToggle}
                disabled={isUpdating}
              >
                <Text style={[
                  styles.favoriteIcon,
                  reading.isFavorite && styles.favoriteIconActive
                ]}>
                  {reading.isFavorite ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteReading}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.readingTitle}>{reading.readingTitle}</Text>
          
          <View style={styles.metaInfo}>
            {reading.spreadType && (
              <View style={[
                styles.spreadBadge,
                { backgroundColor: spreadColors.background }
              ]}>
                <Text style={[
                  styles.spreadBadgeText,
                  { color: spreadColors.primary }
                ]}>
                  {reading.spreadType.name}
                </Text>
              </View>
            )}
            
            <Text style={styles.cardCount}>
              {reading.cards.length} kart
            </Text>
          </View>
          
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>Soru:</Text>
            <Text style={styles.questionText}>"{reading.question}"</Text>
            <Text style={styles.moodText}>Ruh hali: {reading.mood}</Text>
          </View>
          
          <Text style={styles.dateText}>
            {formatDate(reading.createdAt)}
          </Text>
        </LinearGradient>

        {/* Genel Yorum */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🔮</Text>
            <Text style={styles.sectionTitle}>Genel Yorum</Text>
          </View>
          <Text style={styles.interpretationText}>
            {reading.holisticInterpretation}
          </Text>
        </View>

        {/* Kart Detayları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎴</Text>
            <Text style={styles.sectionTitle}>Kart Analizleri</Text>
          </View>
          
          {reading.cardDetails.map((card, index) => (
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

        {/* Yaşam Alanları */}
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
            <Text style={styles.aspectText}>{reading.lifeAspects.love}</Text>
          </View>
          
          <View style={styles.lifeAspectContainer}>
            <View style={styles.aspectHeader}>
              <Text style={styles.aspectIcon}>💼</Text>
              <Text style={styles.aspectTitle}>Kariyer & İş</Text>
            </View>
            <Text style={styles.aspectText}>{reading.lifeAspects.career}</Text>
          </View>
          
          <View style={styles.lifeAspectContainer}>
            <View style={styles.aspectHeader}>
              <Text style={styles.aspectIcon}>🌱</Text>
              <Text style={styles.aspectTitle}>Kişisel Gelişim</Text>
            </View>
            <Text style={styles.aspectText}>{reading.lifeAspects.personal}</Text>
          </View>
        </View>

        {/* Özet */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={styles.sectionTitle}>Özet</Text>
          </View>
          <LinearGradient
            colors={[spreadColors.background, 'transparent']}
            style={styles.summaryContainer}
          >
            <Text style={styles.summaryText}>{reading.summary}</Text>
          </LinearGradient>
        </View>

        {/* Yansıtma Butonu - YENİ */}
        <View style={styles.shareSection}>
          <View style={styles.reflectionButtonContainer}>
            <TouchableOpacity
              style={styles.reflectionButton}
              onPress={() => navigation.navigate('Reflection', { reading })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED', '#6B46C1']}
                style={styles.reflectionButtonGradient}
              >
                <Text style={styles.reflectionButtonIcon}>💭</Text>
                <Text style={styles.reflectionButtonText}>Derin Düşünce Ekle</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Paylaşım Butonları */}
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
        </View>

        {/* Güvenilirlik */}
        <View style={styles.confidenceSection}>
          <Text style={styles.confidenceText}>
            Güvenilirlik: %{reading.confidence}
          </Text>
        </View>
      </LinearGradient>
    </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    marginBottom: 20,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  favoriteIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  favoriteIconActive: {
    color: '#FFD700',
  },
  
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  deleteButtonText: {
    fontSize: 18,
  },
  
  readingTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  
  spreadBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  spreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  cardCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  
  questionLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    fontWeight: '500',
  },
  
  questionText: {
    fontSize: 16,
    color: '#ffffff',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 22,
  },
  
  moodText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    fontWeight: '500',
  },
  
  shareSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  
  // YENİ - Yansıtma butonu stilleri
  reflectionButtonContainer: {
    marginBottom: 16,
  },
  
  reflectionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  reflectionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  
  reflectionButtonIcon: {
    fontSize: 18,
  },
  
  reflectionButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#ffffff',
  },
  
  shareButtonsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  
  whatsappButton: {
    flex: 1,
    backgroundColor: '#25D366',
    borderRadius: 12,
    padding: 16,
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
    padding: 16,
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
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  confidenceSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  confidenceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
});

export default ReadingDetailScreen;