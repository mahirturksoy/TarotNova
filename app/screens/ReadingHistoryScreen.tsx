import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { 
  ReadingHistoryItem, 
  getReadingHistory, 
  getFavoriteReadings,
  toggleReadingFavorite,
  deleteReading,
  getUserStats,
  UserStats
} from '../services/readingHistoryService';
import { CATEGORY_COLORS } from '../constants/spreadTypes';
import type { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

type ReadingHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReadingHistory'>;

type FilterType = 'all' | 'thisWeek' | 'thisMonth';

const ReadingHistoryScreen: React.FC = () => {
  const navigation = useNavigation<ReadingHistoryScreenNavigationProp>();
  
  const [readings, setReadings] = useState<ReadingHistoryItem[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<ReadingHistoryItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sayfa odaklandığında verileri yükle
  useFocusEffect(
    useCallback(() => {
      loadReadings();
      loadUserStats();
    }, [])
  );

  const loadReadings = async () => {
    try {
      setIsLoading(true);
      const history = await getReadingHistory();
      setReadings(history);
      applyFilter(history, activeFilter);
    } catch (error) {
      console.error('Okuma geçmişi yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const applyFilter = (readings: ReadingHistoryItem[], filter: FilterType) => {
  let filtered = [...readings];
  
  switch (filter) {
    case 'thisWeek':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = readings.filter(reading => new Date(reading.createdAt) >= weekAgo);
      break;
    case 'thisMonth':
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = readings.filter(reading => new Date(reading.createdAt) >= monthAgo);
      break;
    default:
      // 'all' - değişiklik yok
      break;
  }
  
  setFilteredReadings(filtered);
};

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    applyFilter(readings, filter);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReadings();
    await loadUserStats();
    setRefreshing(false);
  };

  const handleFavoriteToggle = async (readingId: string) => {
    try {
      await toggleReadingFavorite(readingId);
      await loadReadings(); // Verileri yenile
    } catch (error) {
      console.error('Favori durumu değiştirilemedi:', error);
    }
  };

  const handleDeleteReading = (readingId: string) => {
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
              await deleteReading(readingId);
              await loadReadings();
            } catch (error) {
              console.error('Okuma silinemedi:', error);
            }
          }
        }
      ]
    );
  };

  const handleReadingPress = (reading: ReadingHistoryItem) => {
    // Okuma detaylarını göstermek için ReadingDetail sayfasına yönlendir
    navigation.navigate('ReadingDetail', { reading });
  };

  const renderStatsCard = () => {
    if (!userStats) return null;

    return (
      <LinearGradient
        colors={['#6B46C1', '#7C3AED', '#8B5CF6']}
        style={styles.statsCard}
      >
        <Text style={styles.statsTitle}>İstatistikleriniz</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.totalReadings}</Text>
            <Text style={styles.statLabel}>Toplam Okuma</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{readings.filter(r => r.isFavorite).length}</Text>
            <Text style={styles.statLabel}>Favori</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.streakDays}</Text>
            <Text style={styles.statLabel}>Streak Gün</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.mostUsedSpread}</Text>
            <Text style={styles.statLabel}>En Çok Kullanılan</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderFilterButtons = () => {
    const filters: { key: FilterType; label: string }[] = [
      { key: 'all', label: 'Tümü' },
      { key: 'thisWeek', label: 'Bu Hafta' },
      { key: 'thisMonth', label: 'Bu Ay' }
    ];

    return (
    <View style={styles.filterContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            activeFilter === filter.key && styles.activeFilterButton
          ]}
          onPress={() => handleFilterChange(filter.key)}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === filter.key && styles.activeFilterButtonText
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  };

  const renderReadingItem = ({ item }: { item: ReadingHistoryItem }) => {
    const spreadColor = item.spreadType 
      ? CATEGORY_COLORS[item.spreadType.category]
      : CATEGORY_COLORS.general;

    const readingDate = new Date(item.createdAt);
    const formattedDate = readingDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <TouchableOpacity 
        style={styles.readingCard}
        onPress={() => handleReadingPress(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.readingCardGradient}
        >
          {/* Header */}
          <View style={styles.readingCardHeader}>
            <View style={styles.readingCardHeaderLeft}>
              <Text style={styles.readingTitle} numberOfLines={1}>
                {item.readingTitle}
              </Text>
              <Text style={styles.readingQuestion} numberOfLines={1}>
                "{item.question}"
              </Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => handleFavoriteToggle(item.id)}
            >
              <Text style={[
                styles.favoriteIcon,
                item.isFavorite && styles.favoriteIconActive
              ]}>
                {item.isFavorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spread Info */}
          <View style={styles.spreadInfo}>
            <View style={[
              styles.spreadBadge,
              { backgroundColor: spreadColor.background }
            ]}>
              <Text style={[
                styles.spreadBadgeText,
                { color: spreadColor.primary }
              ]}>
                {item.spreadType?.name || 'Klasik Okuma'}
              </Text>
            </View>
            <Text style={styles.cardCount}>
              {item.cards.length} kart
            </Text>
          </View>

          {/* Cards Preview */}
          <View style={styles.cardsPreview}>
            {item.cards.slice(0, 3).map((card, index) => (
              <View key={index} style={styles.cardPreviewItem}>
                <Text style={styles.cardPreviewText}>{card}</Text>
              </View>
            ))}
            {item.cards.length > 3 && (
              <Text style={styles.moreCardsText}>+{item.cards.length - 3}</Text>
            )}
          </View>

          {/* Footer */}
          <View style={styles.readingCardFooter}>
            <View style={styles.readingCardFooterLeft}>
              <Text style={styles.readingDate}>{formattedDate}</Text>
              <Text style={styles.readingMood}>{item.mood}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteReading(item.id)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📚</Text>
      <Text style={styles.emptyStateTitle}>Henüz okuma geçmişiniz yok</Text>
      <Text style={styles.emptyStateText}>
        İlk tarot okumanızı yapın ve burada görüntüleyin
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.emptyStateButtonText}>İlk Okumamı Yap</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Okuma Geçmişi</Text>
      </View>

      {/* Stats Card */}
      {userStats && userStats.totalReadings > 0 && renderStatsCard()}

      {/* Filter Buttons */}
      {readings.length > 0 && renderFilterButtons()}

      {/* Readings List */}
      <FlatList
        data={filteredReadings}
        renderItem={renderReadingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={readings.length === 0 ? renderEmptyState : null}
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
    paddingBottom: 16,
  },
  
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center',
  },
  
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#ffffff',
  },
  
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
  },
  
  activeFilterButton: {
    backgroundColor: '#E8B923',
  },
  
  filterButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500' as const,
  },
  
  activeFilterButtonText: {
    color: '#0A0A0F',
    fontWeight: 'bold' as const,
  },
  
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  readingCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  readingCardGradient: {
    padding: 16,
  },
  
  readingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  readingCardHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  
  readingTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 4,
  },
  
  readingQuestion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  
  favoriteButton: {
    padding: 4,
  },
  
  favoriteIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  
  favoriteIconActive: {
    color: '#E8B923',
  },
  
  spreadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  
  spreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  spreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  
  cardCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  
  cardsPreview: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  
  cardPreviewItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  cardPreviewText: {
    fontSize: 10,
    color: '#ffffff',
  },
  
  moreCardsText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'center',
  },
  
  readingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  readingCardFooterLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  
  readingDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  
  readingMood: {
    fontSize: 12,
    color: '#E8B923',
    fontWeight: '500' as const,
  },
  
  deleteButton: {
    padding: 4,
  },
  
  deleteButtonText: {
    fontSize: 16,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  
  emptyStateButton: {
    backgroundColor: '#E8B923',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#0A0A0F',
  },
});

export default ReadingHistoryScreen;