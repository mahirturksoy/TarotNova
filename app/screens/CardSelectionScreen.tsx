// app/screens/CardSelectionScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next'; // Çeviri Kütüphanesi

import { useReadingContext } from '../context/ReadingContext';
import { MAJOR_ARCANA, TarotCardData } from '../constants/tarotDeck';
import { SpreadType } from '../constants/spreadTypes';
import type { RootStackParamList } from '../types/navigation';
import TarotCard from '../components/TarotCard'; // Resimli Kart Bileşeni
import { generateTarotInterpretation } from '../services/novaApiService';
import queryLimitService from '../services/queryLimitService';
import type { QueryCheckResult } from '../services/queryLimitService';
import adService from '../services/adService';
import MysticLimitModal from '../components/MysticLimitModal';

type CardSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CardSelection'>;

const { width } = Dimensions.get('window');

interface RouteParams {
  question: string;
  mood: string;
  spreadType: SpreadType;
}

// Desteyi karıştırma fonksiyonu
const shuffleDeck = (array: TarotCardData[]): TarotCardData[] => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const CardSelectionScreen: React.FC = () => {
  const navigation = useNavigation<CardSelectionScreenNavigationProp>();
  const route = useRoute();
  const { t } = useTranslation(); // Dil Hook'u
  const { startNewReading } = useReadingContext();

  const params = route.params as RouteParams;
  const { question, mood, spreadType } = params;

  const requiredCardCount = spreadType.cardCount;
  // Spread ismini çeviriden alıyoruz
  const spreadName = t(`spread.types.${spreadType.id}.name`);

  const [shuffledDeck, setShuffledDeck] = useState<TarotCardData[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [limitInfo, setLimitInfo] = useState<QueryCheckResult | null>(null);
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    setShuffledDeck(shuffleDeck(MAJOR_ARCANA));
  }, []);

  // KART SEÇME MANTIĞI (Katı Seçim Kuralı: Seçilen geri alınamaz)
  const handleCardSelect = (index: number): void => {
    // Sadece kart henüz seçilmemişse VE seçim hakkı dolmamışsa ekle
    if (!selectedIndices.includes(index) && selectedIndices.length < requiredCardCount) {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  // Yorumla Butonuna Basılınca
  const handleInterpret = async () => {
    if (selectedIndices.length !== requiredCardCount) return;

    // ── 1. GÜNLÜK LİMİT KONTROLÜ ──
    const checkResult = await queryLimitService.canMakeQuery();
    if (!checkResult.allowed) {
      setLimitInfo(checkResult);
      setLimitModalVisible(true);
      return; // API çağrısı yapılmaz
    }

    setIsAnalyzing(true);

    // Seçilen kartları API formatına hazırla
    const selectedCardsData = selectedIndices.map((deckIndex, posIndex) => {
      const card = shuffledDeck[deckIndex];
      return {
        cardName: card.name,
        // Pozisyon ismini çeviriden al
        position: t(`spread.types.${spreadType.id}.positions.${posIndex}`) 
      };
    });

    try {
      // ── 2. AGRESİF INTERSTITIAL — API'DEN ÖNCE ──
      await adService.showInterstitial();

      // ── 3. NOVA API'YE SOR ──
      const interpretation = await generateTarotInterpretation({
        question,
        mood,
        spreadType: spreadName, 
        cards: selectedCardsData
      });

      // ── 4. SORGU SAYACINI ARTIR ──
      await queryLimitService.recordQuery();

      // 5. Sonucu Context'e kaydet
      startNewReading({
        question,
        mood,
        spreadType: { id: spreadType.id, name: spreadName, cardCount: spreadType.cardCount },
        selectedCards: selectedCardsData.map(c => c.cardName)
      }, interpretation);

      // 6. Sonuç ekranına git
      navigation.navigate('Reading');

    } catch (error) {
      console.error('Kart yorumlama hatası:', error);
      Alert.alert(t('common.error'), "Yorum alınamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── LİMİT MODAL: REKLAM İZLE HANDLER ──
  const handleWatchAd = async () => {
    setIsAdLoading(true);
    try {
      const rewarded = await adService.showRewarded();
      if (rewarded) {
        const granted = await queryLimitService.grantBonusFromAd();
        if (granted) {
          setLimitModalVisible(false);
          setLimitInfo(null);
          // Kullanıcı artık tekrar "Yorumla" butonuna basabilir
        }
      }
    } finally {
      setIsAdLoading(false);
    }
  };

  // Kart Bileşenini Render Et
  const renderCard = ({ item, index }: { item: TarotCardData; index: number }) => {
    const isSelected = selectedIndices.includes(index);
    return (
      <View style={styles.cardContainer}>
        <TarotCard
          cardData={item}
          isSelected={isSelected}
          onPress={() => handleCardSelect(index)}
        />
      </View>
    );
  };

  return (
    <LinearGradient colors={['#1d112b', '#2b173f', '#1d112b']} style={styles.container}>
      
      {/* Üst Bilgi Alanı */}
      <LinearGradient colors={['#701a75', '#4a044e']} style={styles.header}>
        <Text style={styles.title}>{t('cardSelection.title')}</Text>
        <Text style={styles.spreadName}>{spreadName}</Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {selectedIndices.length}/{requiredCardCount} {t('cardSelection.selected')}
          </Text>
          
          {/* Progress Bar - Stil İsimleri Düzeltildi */}
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(selectedIndices.length / requiredCardCount) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </LinearGradient>

      {/* Kart Listesi */}
      <FlatList
        data={shuffledDeck}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />

      {/* Yorumla Butonu (Sadece seçim bitince görünür) */}
      {selectedIndices.length === requiredCardCount && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleInterpret}
            disabled={isAnalyzing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#d4af37', '#F59E0B']}
              style={styles.buttonGradient}
            >
              {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#1d112b" />
                  <Text style={styles.loadingText}>{t('home.analyzing')}</Text>
                </View>
              ) : (
                <Text style={styles.completeButtonText}>{t('cardSelection.button')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Günlük Limit Modalı */}
      {limitInfo && (
        <MysticLimitModal
          visible={limitModalVisible}
          userType={limitInfo.userType || 'GUEST'}
          limit={limitInfo.limit || 0}
          canWatchAd={limitInfo.canWatchAd || false}
          isAdLoading={isAdLoading}
          onClose={() => {
            setLimitModalVisible(false);
            setLimitInfo(null);
          }}
          onWatchAd={handleWatchAd}
          onGoPremium={() => {
            setLimitModalVisible(false);
            setLimitInfo(null);
            navigation.navigate('Premium');
          }}
          onGoRegister={limitInfo.userType === 'GUEST' ? () => {
            setLimitModalVisible(false);
            setLimitInfo(null);
            navigation.navigate('Auth');
          } : undefined}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#4a044e' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#d4af37', 
    textAlign: 'center', 
    marginBottom: 4, 
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif', default: 'serif' }) 
  },
  spreadName: { 
    fontSize: 15, 
    color: '#d4af37', 
    textAlign: 'center', 
    marginBottom: 12, 
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) 
  },
  progressContainer: { alignItems: 'center' },
  progressText: { 
    fontSize: 13, 
    color: '#d4af37', 
    marginBottom: 6, 
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) 
  },
  
  // Stil isimleri burada tanımlı, yukarıda (JSX) da aynısı kullanılmalı
  progressBar: { 
    width: '100%', 
    height: 4, 
    backgroundColor: 'rgba(243, 232, 255, 0.2)', 
    borderRadius: 2, 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: '#d4af37', 
    borderRadius: 2 
  },

  cardsContainer: { 
    paddingHorizontal: 10, 
    paddingTop: 15, 
    paddingBottom: 120 
  },
  row: { justifyContent: 'space-around' },
  cardContainer: { width: (width - 40) / 3, marginBottom: 10 },
  floatingButtonContainer: { position: 'absolute', bottom: 95, left: 20, right: 20 },
  completeButton: { 
    borderRadius: 12, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 8, 
    elevation: 8 
  },
  buttonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1d112b', 
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) 
  },
  completeButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1d112b', 
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) 
  },
});

export default CardSelectionScreen;