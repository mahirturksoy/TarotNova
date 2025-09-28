// app/screens/FavoritesScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getFavoriteReadings, toggleReadingFavorite } from '../services/readingHistoryService';
import type { ReadingHistoryItem } from '../services/readingHistoryService';
import { CATEGORY_COLORS } from '../constants/spreadTypes';
import type { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const [favorites, setFavorites] = useState<ReadingHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const favs = await getFavoriteReadings();
      setFavorites(favs);
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (readingId: string) => {
    try {
      await toggleReadingFavorite(readingId);
      await loadFavorites();
    } catch (error) {
      console.error('Favori kaldırılamadı:', error);
    }
  };

  const handleReadingPress = (reading: ReadingHistoryItem) => {
    // @ts-ignore - Navigation typing issue
    navigation.navigate('Geçmiş', {
      screen: 'ReadingDetail',
      params: { reading }
    });
  };

  const renderFavoriteItem = ({ item }: { item: ReadingHistoryItem }) => {
    const spreadColor = item.spreadType 
      ? CATEGORY_COLORS[item.spreadType.category]
      : CATEGORY_COLORS.general;

    const readingDate = new Date(item.createdAt);
    const formattedDate = readingDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return (
      <TouchableOpacity 
        style={styles.favoriteCard}
        onPress={() => handleReadingPress(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[spreadColor.primary, spreadColor.light]}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.readingTitle}
              </Text>
              <Text style={styles.cardQuestion} numberOfLines={2}>
                "{item.question}"
              </Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => handleRemoveFavorite(item.id)}
            >
              <Text style={styles.favoriteIcon}>★</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardMeta}>
            <View style={styles.spreadBadge}>
              <Text style={styles.spreadText}>
                {item.spreadType?.name || 'Klasik'}
              </Text>
            </View>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <View style={styles.cardPreview}>
            <Text style={styles.previewText} numberOfLines={2}>
              {item.summary}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>⭐</Text>
      <Text style={styles.emptyTitle}>Henüz Favoriniz Yok</Text>
      <Text style={styles.emptyText}>
        Beğendiğiniz okumaları favori yaparak{'\n'}buradan kolayca erişebilirsiniz
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Favorilerim</Text>
        <Text style={styles.subtitle}>
          {favorites.length} favori okuma
        </Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#E8B923"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
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
    paddingBottom: 20,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  
  favoriteCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  cardGradient: {
    padding: 16,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  cardQuestion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  favoriteIcon: {
    fontSize: 20,
    color: '#FFD700',
  },
  
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  spreadBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  spreadText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  cardPreview: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  
  previewText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FavoritesScreen;