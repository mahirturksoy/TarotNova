// app/screens/SpreadSelectionScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SPREAD_TYPES, SPREAD_CATEGORIES } from '../constants/spreadTypes';
import type { RootStackParamList } from '../types/navigation';
import type { SpreadType, SpreadCategory } from '../constants/spreadTypes';

type SpreadSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SpreadSelection'>;

interface RouteParams {
  question: string;
  mood: string;
}

const SpreadSelectionScreen: React.FC = () => {
  const navigation = useNavigation<SpreadSelectionScreenNavigationProp>();
  const route = useRoute();
  const { question, mood } = route.params as RouteParams;

  const [selectedCategory, setSelectedCategory] = useState<SpreadCategory>('general');

  const handleSpreadSelect = (spreadType: SpreadType) => {
    navigation.navigate('CardSelection', {
      question,
      mood,
      spreadType
    });
  };

  const filteredSpreads = SPREAD_TYPES.filter(spread => spread.category === selectedCategory);

  const getCategoryIcon = (category: SpreadCategory): string => {
    const icons: Record<SpreadCategory, string> = {
      general: '✦',
      love: '♡',
      career: '◈',
      spiritual: '☾',
      decision: '⟷', // <<< DEĞİŞİKLİK 1: İkon güncellendi
      timing: '⟳'
    };
    return icons[category];
  };

  const renderCategoryTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryTabsContent}
    >
      {SPREAD_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryTab,
            selectedCategory === category.id && styles.activeCategoryTab
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text style={[
            styles.categoryTabText,
            selectedCategory === category.id && styles.activeCategoryTabText
          ]}>
            {getCategoryIcon(category.id)} {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSpreadCard = (spread: SpreadType) => {
    return (
      <TouchableOpacity
        key={spread.id}
        style={styles.spreadCard}
        onPress={() => handleSpreadSelect(spread)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(74, 4, 78, 0.3)', 'rgba(74, 4, 78, 0.5)']}
          style={styles.spreadCardGradient}
        >
          <View style={styles.spreadCardHeader}>
            <Text style={styles.spreadIcon}>{getCategoryIcon(spread.category)}</Text>
            <Text style={styles.spreadName}>{spread.name}</Text>
          </View>

          <View style={styles.spreadMetaContainer}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{spread.cardCount} Kart</Text>
            </View>
            {/* <<< DEĞİŞİKLİK 2: Zorluk seviyesi etiketi kaldırıldı */}
          </View>
          
          <Text style={styles.spreadDescription}>{spread.description}</Text>
          
          <View style={styles.positionsContainer}>
            <Text style={styles.positionsTitle}>Pozisyonlar:</Text>
            <View style={styles.positionsList}>
              {spread.positions.map((position, index) => (
                <View key={index} style={styles.positionItem}>
                  <Text style={styles.positionText}>
                    <Text style={styles.positionNumber}>{index + 1}</Text> {position.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#1d112b', '#2b173f', '#1d112b']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.spreadsList}
        contentContainerStyle={styles.spreadsListContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionInfoContainer}>
          <Text style={styles.questionLabel}>Sorunuz:</Text>
          <Text style={styles.questionText}>"{question}"</Text>
          <Text style={styles.moodText}>Ruh Hali: {mood}</Text>
        </View>

        {renderCategoryTabs()}

        <View style={styles.categoryInfo}>
          <Text style={styles.categoryInfoTitle}>
            {SPREAD_CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </Text>
          <Text style={styles.categoryInfoDescription}>
            {SPREAD_CATEGORIES.find(c => c.id === selectedCategory)?.description}
          </Text>
        </View>

        {filteredSpreads.map(spread => renderSpreadCard(spread))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spreadsList: {
    flex: 1,
  },
  spreadsListContent: {
    paddingBottom: 100,
  },
  questionInfoContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(74, 4, 78, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#701a75',
  },
  questionLabel: {
    fontSize: 12,
    color: 'rgba(243, 232, 255, 0.7)',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    color: '#f3e8ff',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 22,
  },
  moodText: {
    fontSize: 14,
    color: '#d4af37',
    fontWeight: '500',
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  activeCategoryTab: {
    backgroundColor: '#d4af37',
    borderColor: '#d4af37',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#d4af37',
    fontWeight: '600',
  },
  activeCategoryTabText: {
    color: '#1d112b',
  },
  categoryInfo: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#d4af37',
  },
  categoryInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4af37',
    marginBottom: 4,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  categoryInfoDescription: {
    fontSize: 14,
    color: 'rgba(243, 232, 255, 0.8)',
    lineHeight: 20,
  },
  spreadCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#701a75',
  },
  spreadCardGradient: {
    padding: 16,
  },
  spreadCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spreadIcon: {
    fontSize: 20,
    color: '#d4af37',
    marginRight: 10,
  },
  spreadName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f3e8ff',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  spreadMetaContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#d4af37',
    fontWeight: 'bold',
  },
  spreadDescription: {
    fontSize: 14,
    color: 'rgba(243, 232, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 16,
  },
  positionsContainer: {
    marginTop: 8,
  },
  positionsTitle: {
    fontSize: 12,
    color: '#d4af37',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  positionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  positionNumber: {
    fontSize: 11,
    color: '#d4af37',
    fontWeight: 'bold',
  },
  positionText: {
    fontSize: 12,
    color: 'rgba(243, 232, 255, 0.9)',
  },
});

export default SpreadSelectionScreen;