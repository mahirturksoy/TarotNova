// SpreadSelectionScreen.tsx - Düzenlenmiş versiyon

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SPREAD_TYPES, CATEGORY_COLORS, DIFFICULTY_LABELS, SpreadType } from '../constants/spreadTypes';
import type { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

type SpreadSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SpreadSelection'>;

interface RouteParams {
  question: string;
  mood: string;
}

const SpreadSelectionScreen: React.FC = () => {
  const navigation = useNavigation<SpreadSelectionScreenNavigationProp>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { question, mood } = params;

  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);

  const handleSpreadSelect = (spread: SpreadType) => {
    setSelectedSpread(spread);
  };

  const handleContinue = () => {
    if (selectedSpread) {
      navigation.navigate('CardSelection', {
        question,
        mood,
        spreadType: selectedSpread
      });
    }
  };

  const renderSpreadCard = (spread: SpreadType) => {
    const isSelected = selectedSpread?.id === spread.id;
    const categoryColor = CATEGORY_COLORS[spread.category];
    const difficultyInfo = DIFFICULTY_LABELS[spread.difficulty];

    return (
      <TouchableOpacity
        key={spread.id}
        style={[
          styles.spreadCard,
          isSelected && styles.selectedSpreadCard
        ]}
        onPress={() => handleSpreadSelect(spread)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isSelected 
            ? [categoryColor.primary, categoryColor.light]
            : ['#2D3748', '#4A5568']}
          style={styles.cardGradient}
        >
          {/* Kart sayısı badge */}
          <View style={styles.cardCountBadge}>
            <Text style={styles.cardCountNumber}>{spread.cardCount}</Text>
            <Text style={styles.cardCountLabel}>KART</Text>
          </View>

          {/* Ana içerik */}
          <View style={styles.cardContent}>
            <Text style={[
              styles.spreadName,
              isSelected && styles.selectedText
            ]}>
              {spread.name}
            </Text>
            
            <Text style={[
              styles.spreadDescription,
              isSelected && styles.selectedText
            ]} numberOfLines={2}>
              {spread.description}
            </Text>

            {/* Meta bilgiler */}
            <View style={styles.metaRow}>
              <View style={[
                styles.categoryBadge,
                { backgroundColor: categoryColor.background }
              ]}>
                <Text style={[
                  styles.categoryText,
                  { color: categoryColor.primary }
                ]}>
                  {spread.category.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.difficultyBadge}>
                <Text style={[
                  styles.difficultyText,
                  { color: difficultyInfo.color }
                ]}>
                  {difficultyInfo.label}
                </Text>
              </View>
              
              <Text style={[
                styles.timeText,
                isSelected && styles.selectedText
              ]}>
                ⏱ {spread.estimatedTime}
              </Text>
            </View>
          </View>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      style={styles.container}
    >
      {/* Kompakt Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Okuma Türü Seçin</Text>
        <Text style={styles.subtitle}>
          Sorunuza en uygun spread'i belirleyin
        </Text>
      </View>

      {/* Spread Kartları */}
      <ScrollView 
        style={styles.spreadsContainer}
        contentContainerStyle={styles.spreadsContent}
        showsVerticalScrollIndicator={false}
      >
        {SPREAD_TYPES.map(renderSpreadCard)}
        
        {/* Tab bar için boşluk */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Continue Button */}
      {selectedSpread && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#E8B923', '#F59E0B']}
              style={styles.buttonGradient}
            >
              <Text style={styles.continueButtonText}>
                {selectedSpread.cardCount} Kart Seç →
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
  },
  
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  
  spreadsContainer: {
    flex: 1,
  },
  
  spreadsContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  
  spreadCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  selectedSpreadCard: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  cardGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  
  cardCountBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  cardCountNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  cardCountLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  
  cardContent: {
    flex: 1,
  },
  
  spreadName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  
  spreadDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
    marginBottom: 10,
  },
  
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  timeText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkmark: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  selectedText: {
    color: '#ffffff',
  },
  
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 95,
    left: 20,
    right: 20,
  },
  
  continueButton: {
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
  
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0A0F',
  },
});

export default SpreadSelectionScreen;