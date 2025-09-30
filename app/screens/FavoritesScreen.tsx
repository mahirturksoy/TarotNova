// app/screens/FavoritesScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  Image,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  ReadingHistoryItem,
  getFavoriteReadings,
  toggleReadingFavorite
} from '../services/readingHistoryService';
import type { RootStackParamList } from '../types/navigation';
import { MAJOR_ARCANA, getCardImage } from '../constants/tarotDeck';
import MysticConfirmationModal from '../components/MysticConfirmationModal';

const cardDataMap = new Map(MAJOR_ARCANA.map(card => [card.name, card]));
type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  
  const [favoriteReadings, setFavoriteReadings] = useState<ReadingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [readingToUnfavorite, setReadingToUnfavorite] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { loadFavoriteReadings(); }, []));

  const loadFavoriteReadings = async () => {
    try {
      setIsLoading(true);
      const favorites = await getFavoriteReadings();
      setFavoriteReadings(favorites);
    } catch (error) {
      console.error('Favori okumalar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = (readingId: string) => {
    setReadingToUnfavorite(readingId);
    setModalVisible(true);
  };

  const confirmUnfavorite = async () => {
    if (!readingToUnfavorite) return;
    try {
      await toggleReadingFavorite(readingToUnfavorite);
      setModalVisible(false);
      await loadFavoriteReadings();
    } catch (error) {
      console.error('Favorilerden çıkarılamadı:', error);
      setModalVisible(false);
    } finally {
      setReadingToUnfavorite(null);
    }
  };

  const handleReadingPress = (reading: ReadingHistoryItem) => {
    navigation.navigate('ReadingDetail', { reading });
  };
  
  const renderFavoriteCard = ({ item }: { item: ReadingHistoryItem }) => {
    return (
      <TouchableOpacity
        style={styles.favoriteCard}
        onPress={() => handleReadingPress(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(74, 4, 78, 0.3)', 'rgba(74, 4, 78, 0.5)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardQuestion} numberOfLines={2}>"{item.question}"</Text>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => handleRemoveFavorite(item.id)}
            >
              <Text style={styles.favoriteIcon}>★</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardImageGallery}
          >
            {item.cards.map((cardName, index) => {
              const card = cardDataMap.get(cardName);
              if (!card) return null;
              const cardImage = getCardImage(card.imageName);
              return (
                <View key={index} style={styles.miniCardContainer}>
                  <Image source={cardImage} style={styles.miniCardImage} />
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.wisdomContainer}>
            <Text style={styles.wisdomText} numberOfLines={3}>
              {item.summary}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>⭐</Text>
      <Text style={styles.emptyStateTitle}>Henüz favori okumanız yok</Text>
      <Text style={styles.emptyStateText}>
        Beğendiğiniz okumaları favorilere ekleyerek buradan kolayca erişebilirsiniz
      </Text>
    </View>
  );

  return (
    <>
      <LinearGradient colors={['#1d112b', '#2b173f', '#1d112b']} style={styles.container}>
        <FlatList
          data={favoriteReadings}
          renderItem={renderFavoriteCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </LinearGradient>

      <MysticConfirmationModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title="Favorilerden Çıkar"
        subtitle="Bu özel anıyı favorileriniz arasından kaldırmak istediğinize emin misiniz?"
        buttons={[
          { text: 'İptal', onPress: () => setModalVisible(false), style: 'default' },
          { text: 'Çıkar', onPress: confirmUnfavorite, style: 'destructive' },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  favoriteCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#701a75',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardQuestion: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    // DEĞİŞİKLİK: Sorgu başlığı artık markamızın altın rengi
    color: '#d4af37',
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }),
    lineHeight: 24,
    marginRight: 10,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 22,
    color: '#d4af37',
  },
  cardImageGallery: {
    paddingBottom: 16,
    gap: 8,
  },
  miniCardContainer: {
    width: 60,
    aspectRatio: 0.6,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  miniCardImage: {
    width: '100%',
    height: '100%',
  },
  wisdomContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    paddingTop: 12,
  },
  wisdomText: {
    fontSize: 14,
    color: 'rgba(243, 232, 255, 0.8)',
    fontFamily: Platform.select({ ios: 'Georgia-Italic', android: 'serif' }),
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginTop: '30%',
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3e8ff',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(243, 232, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default FavoritesScreen;