// app/screens/CardSelectionScreen.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  FlatList,
  ActivityIndicator,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useReadingContext } from '../context/ReadingContext';
import { MAJOR_ARCANA, getCardImage } from '../constants/tarotDeck';
import { SpreadType } from '../constants/spreadTypes';
import type { RootStackParamList } from '../types/navigation';

type CardSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CardSelection'>;

const { width } = Dimensions.get('window');

interface RouteParams {
  question: string;
  mood: string;
  spreadType?: SpreadType;
}

const CardSelectionScreen: React.FC = () => {
  const navigation = useNavigation<CardSelectionScreenNavigationProp>();
  const route = useRoute();
  const { generateReading, isLoading } = useReadingContext();
  
  const params = route.params as RouteParams;
  const { question, mood, spreadType } = params;
  
  const requiredCardCount = spreadType?.cardCount || 3;
  const spreadName = spreadType?.name || 'Geçmiş - Şimdi - Gelecek';
  
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  
  const handleCardSelect = (cardName: string): void => {
    if (selectedCards.includes(cardName)) {
      setSelectedCards(selectedCards.filter(card => card !== cardName));
    } else if (selectedCards.length < requiredCardCount) {
      setSelectedCards([...selectedCards, cardName]);
    }
  };

  const handleCompleteSelection = async (): Promise<void> => {
    if (selectedCards.length === requiredCardCount && !isLoading) {
      try {
        await generateReading(question, mood, selectedCards, spreadType);
        navigation.navigate('Reading');
      } catch (error) {
        console.error('Kart seçimi hatası:', error);
        navigation.navigate('Reading');
      }
    }
  };

  const renderCard = ({ item }: { item: typeof MAJOR_ARCANA[0] }) => {
    const isSelected = selectedCards.includes(item.name);
    const selectionIndex = isSelected ? selectedCards.indexOf(item.name) + 1 : 0;
    const cardImage = getCardImage(item.imageName);
    
    return (
      <TouchableOpacity
        onPress={() => handleCardSelect(item.name)}
        activeOpacity={0.7}
        style={[
          styles.card,
          isSelected && styles.selectedCard
        ]}
      >
        {isSelected && (
          <View style={styles.selectionBadge}>
            <Text style={styles.selectionNumber}>{selectionIndex}</Text>
          </View>
        )}
        
        {cardImage ? (
          <Image
            source={cardImage}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.cardNumber}>{item.id}</Text>
            <Text style={styles.cardNamePlaceholder}>{item.name}</Text>
          </View>
        )}
        
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <LinearGradient
              colors={['transparent', 'rgba(232, 185, 35, 0.3)']}
              style={styles.selectedGradient}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      style={styles.container}
    >
      {/* Header */}
      <LinearGradient
        colors={['#6B46C1', '#7C3AED']}
        style={styles.header}
      >
        <Text style={styles.title}>Kartlarınızı Seçin</Text>
        <Text style={styles.spreadName}>{spreadName}</Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {selectedCards.length}/{requiredCardCount} kart seçildi
          </Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${(selectedCards.length / requiredCardCount) * 100}%` }
            ]} />
          </View>
        </View>
      </LinearGradient>

      {/* Kart Grid */}
      <FlatList
        data={MAJOR_ARCANA}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />

      {/* Floating Button */}
      {selectedCards.length === requiredCardCount && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteSelection}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#E8B923', '#F59E0B']}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0A0A0F" />
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
  },
  
  title: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  spreadName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  
  progressContainer: {
    alignItems: 'center',
  },
  
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 6,
  },
  
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#E8B923',
    borderRadius: 2,
  },
  
  cardsContainer: {
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 120,
  },
  
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  card: {
    width: (width - 30) / 3,
    aspectRatio: 0.6,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    position: 'relative',
  },
  
  selectedCard: {
    transform: [{ scale: 0.95 }],
    borderWidth: 2,
    borderColor: '#E8B923',
  },
  
  cardImage: {
    width: '100%',
    height: '100%',
  },
  
  placeholderCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    padding: 8,
  },
  
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 8,
  },
  
  cardNamePlaceholder: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  
  selectionBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8B923',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  
  selectionNumber: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#0A0A0F',
  },
  
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  selectedGradient: {
    flex: 1,
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
    color: '#0A0A0F',
  },
  
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#0A0A0F',
  },
});

export default CardSelectionScreen;