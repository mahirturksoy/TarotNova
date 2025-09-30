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
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useReadingContext } from '../context/ReadingContext';
import { MAJOR_ARCANA, TarotCardData } from '../constants/tarotDeck';
import { SpreadType } from '../constants/spreadTypes';
import type { RootStackParamList } from '../types/navigation';
import TarotCard from '../components/TarotCard';

type CardSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CardSelection'>;

const { width } = Dimensions.get('window');

interface RouteParams {
  question: string;
  mood: string;
  spreadType?: SpreadType;
}

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
  const { generateReading, isLoading } = useReadingContext();

  const params = route.params as RouteParams;
  const { question, mood, spreadType } = params;

  const requiredCardCount = spreadType?.cardCount || 3;
  const spreadName = spreadType?.name || 'Geçmiş - Şimdi - Gelecek';

  const [shuffledDeck, setShuffledDeck] = useState<TarotCardData[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    setShuffledDeck(shuffleDeck(MAJOR_ARCANA));
  }, []);

  const handleCardSelect = (index: number): void => {
    // YENİ KONTROL: Eğer kart zaten seçiliyse hiçbir şey yapma.
    // Sadece kart seçili değilse VE hala yer varsa seçim yap.
    if (!selectedIndices.includes(index) && selectedIndices.length < requiredCardCount) {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleCompleteSelection = async (): Promise<void> => {
    if (selectedIndices.length === requiredCardCount && !isLoading) {
      const finalSelectedCards = selectedIndices.map(index => shuffledDeck[index].name);
      try {
        await generateReading(question, mood, finalSelectedCards, spreadType);
        navigation.navigate('Reading');
      } catch (error) {
        console.error('Kart seçimi hatası:', error);
        navigation.navigate('Reading');
      }
    }
  };

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
    <LinearGradient
      colors={['#1d112b', '#2b173f', '#1d112b']}
      style={styles.container}
    >
      <LinearGradient
        colors={['#701a75', '#4a044e']}
        style={styles.header}
      >
        <Text style={styles.title}>Kartlarınızı Seçin</Text>
        <Text style={styles.spreadName}>{spreadName}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {selectedIndices.length}/{requiredCardCount} kart seçildi
          </Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${(selectedIndices.length / requiredCardCount) * 100}%` }
            ]} />
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={shuffledDeck}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />

      {selectedIndices.length === requiredCardCount && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteSelection}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#d4af37', '#F59E0B']}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#1d112b" />
                  <Text style={styles.loadingText}>Nova Analiz Ediyor...</Text>
                </View>
              ) : (
                <Text style={styles.completeButtonText}>
                  Kartları Yorumla
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#4a044e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#d4af37',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.select({
      ios: 'Georgia-Bold',
      android: 'serif',
      default: 'serif',
    }),
  },
  spreadName: {
    fontSize: 15,
    color: '#d4af37',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    color: '#d4af37',
    marginBottom: 6,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(243, 232, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d4af37',
    borderRadius: 2,
  },
  cardsContainer: {
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 120,
  },
  row: {
    justifyContent: 'space-around',
  },
  cardContainer: {
    width: (width - 40) / 3,
    marginBottom: 10,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 95,
    left: 20,
    right: 20,
  },
  completeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1d112b',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1d112b',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
});

export default CardSelectionScreen;