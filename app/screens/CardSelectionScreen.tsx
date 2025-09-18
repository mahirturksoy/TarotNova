import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

// Context ve servisler
import { useReadingContext } from '../context/ReadingContext';
import { MAJOR_ARCANA } from '../constants/tarotDeck';

// Navigasyon tipleri
import { RootStackParamList } from '../types/navigation';

type CardSelectionScreenProps = NativeStackScreenProps<RootStackParamList, 'CardSelection'>;
type CardSelectionNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CardSelection'>;

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 3; // 3 kart yan yana, padding ile

// Kart seçimi ekranı - Kullanıcı tarot kartlarını seçer
const CardSelectionScreen: React.FC<CardSelectionScreenProps> = () => {
  const navigation = useNavigation<CardSelectionNavigationProp>();
  const route = useRoute<CardSelectionScreenProps['route']>();
  const { generateReading } = useReadingContext();
  
  // Route parametrelerini al
  const { question, mood } = route.params;
  
  // Seçili kartlar state
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  
  // Kart seçme fonksiyonu
  const handleCardSelect = (cardName: string) => {
    if (selectedCards.includes(cardName)) {
      // Kart zaten seçili ise çıkar
      setSelectedCards(selectedCards.filter(card => card !== cardName));
    } else if (selectedCards.length < 3) {
      // Henüz 3 kart seçilmemişse ekle
      setSelectedCards([...selectedCards, cardName]);
    }
  };

  // Seçimi tamamla ve reading ekranına git
  const handleCompleteSelection = async () => {
    if (selectedCards.length === 3) {
      try {
        // Seçilen kartlarla tarot okuması oluştur
        await generateReading(question, mood, selectedCards);
        
        // Reading ekranına yönlendir
        navigation.navigate('Reading');
      } catch (error) {
        console.error('Kart seçimi hatası:', error);
        navigation.navigate('Reading');
      }
    }
  };

  // Kart render fonksiyonu
  const renderCard = ({ item }: { item: typeof MAJOR_ARCANA[0] }) => {
    const isSelected = selectedCards.includes(item.name);
    
    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.selectedCard
        ]}
        onPress={() => handleCardSelect(item.name)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardNumber}>{item.id}</Text>
          </View>
          <Text style={[
            styles.cardName,
            isSelected && styles.selectedCardName
          ]}>
            {item.name}
          </Text>
          {isSelected && (
            <View style={styles.selectionIndicator}>
              <Text style={styles.selectionNumber}>
                {selectedCards.indexOf(item.name) + 1}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* Başlık ve açıklama */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Kartlarınızı Seçin</Text>
        <Text style={styles.subtitle}>
          3 kart seçin ({selectedCards.length}/3)
        </Text>
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>Sorunuz:</Text>
          <Text style={styles.questionText}>"{question}"</Text>
          <Text style={styles.moodText}>Ruh haliniz: {mood}</Text>
        </View>
      </View>

      {/* Kart listesi */}
      <FlatList
        data={MAJOR_ARCANA}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Alt buton */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            selectedCards.length !== 3 && styles.completeButtonDisabled
          ]}
          onPress={handleCompleteSelection}
          disabled={selectedCards.length !== 3}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.completeButtonText,
            selectedCards.length !== 3 && styles.completeButtonTextDisabled
          ]}>
            {selectedCards.length === 3 
              ? 'Kartları Yorumla' 
              : `${3 - selectedCards.length} kart daha seçin`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

// Stil tanımlamaları
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#b3d9ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  questionLabel: {
    fontSize: 14,
    color: '#b3d9ff',
    marginBottom: 5,
  },
  questionText: {
    fontSize: 16,
    color: '#ffffff',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  moodText: {
    fontSize: 14,
    color: '#b3d9ff',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    width: cardWidth,
    marginRight: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#ffd700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  cardContent: {
    alignItems: 'center',
    position: 'relative',
  },
  cardImagePlaceholder: {
    width: cardWidth - 20,
    height: (cardWidth - 20) * 1.5,
    backgroundColor: '#2d3748',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedCardName: {
    color: '#b8860b',
  },
  selectionIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    backgroundColor: '#ffd700',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  completeButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  completeButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default CardSelectionScreen;