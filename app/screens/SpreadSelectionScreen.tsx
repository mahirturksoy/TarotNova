// app/screens/SpreadSelectionScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert
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

  // GEÇİCİ PREMIUM KONTROLÜ
  // İleride buraya gerçek kullanıcı premium durumu gelecek.
  // Şu an test için 'false' yapıyoruz ki kilitleri görelim.
  const isUserPremium = false; 

  const handleSpreadSelect = (spreadType: SpreadType) => {
    // PREMIUM KONTROLÜ
    if (spreadType.isPremium && !isUserPremium) {
      Alert.alert(
        "Premium Özellik 🌟",
        `"${spreadType.name}" açılımı sadece Premium üyeler içindir.\n\nSınırsız okuma ve tüm açılımlara erişmek için Premium'a geçin.`,
        [
          { text: "Vazgeç", style: "cancel" },
          { text: "İncele", onPress: () => console.log("Premium'a yönlendir") } // İleride Premium ekranına yönlendireceğiz
        ]
      );
      return;
    }

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
      decision: '⟷',
      timing: '⟳'
    };
    return icons[category] || '✦';
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
    const isLocked = spread.isPremium && !isUserPremium;

    return (
      <TouchableOpacity
        key={spread.id}
        style={[styles.spreadCard, isLocked && styles.spreadCardLocked]}
        onPress={() => handleSpreadSelect(spread)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isLocked 
            ? ['rgba(74, 4, 78, 0.15)', 'rgba(74, 4, 78, 0.25)'] // Kilitli: Soluk
            : ['rgba(74, 4, 78, 0.3)', 'rgba(74, 4, 78, 0.5)']  // Açık: Normal
          }
          style={styles.spreadCardGradient}
        >
          <View style={styles.spreadCardHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.spreadIcon, isLocked && {opacity: 0.5}]}>{getCategoryIcon(spread.category)}</Text>
                <Text style={[styles.spreadName, isLocked && {color: 'rgba(243, 232, 255, 0.6)'}]}>{spread.name}</Text>
            </View>
            
            {/* KİLİT veya PREMIUM BADGE */}
            {isLocked ? (
                <View style={styles.lockBadge}>
                    <Text style={styles.lockIcon}>🔒</Text>
                </View>
            ) : spread.isPremium ? (
                <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
            ) : null}
          </View>

          <View style={styles.spreadMetaContainer}>
            <View style={[styles.metaBadge, isLocked && {backgroundColor: 'rgba(255,255,255,0.05)'}]}>
              <Text style={[styles.metaText, isLocked && {color: 'rgba(255,255,255,0.4)'}]}>{spread.cardCount} Kart</Text>
            </View>
          </View>
          
          <Text style={[styles.spreadDescription, isLocked && {color: 'rgba(243, 232, 255, 0.4)'}]}>
            {spread.description}
          </Text>
          
          {/* Pozisyonlar: Kilitliyse gösterme, yerine "Premium Özel" yaz */}
          {!isLocked ? (
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
          ) : (
            <View style={styles.lockedContent}>
                <Text style={styles.lockedText}>Bu özel açılımı kullanmak için kilidi açın ✨</Text>
            </View>
          )}

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
  spreadCardLocked: {
    borderColor: 'rgba(255, 255, 255, 0.1)', // Kilitliyse çerçeve silikleşir
  },
  spreadCardGradient: {
    padding: 16,
  },
  spreadCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // İkon ve kilit için
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
  // KİLİT STİLLERİ
  lockBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 6,
  },
  lockIcon: {
    fontSize: 16,
  },
  premiumBadge: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    color: '#1d112b',
    fontSize: 10,
    fontWeight: 'bold',
  },
  lockedContent: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    alignItems: 'center'
  },
  lockedText: {
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    fontSize: 13,
  }
});

export default SpreadSelectionScreen;