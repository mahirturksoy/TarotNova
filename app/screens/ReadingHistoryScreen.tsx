// app/screens/ReadingHistoryScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
  Image,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'; // EKLENDİ
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ReadingHistoryItem,
  getReadingHistory,
  toggleReadingFavorite,
  deleteReading,
} from '../services/readingHistoryService';
import type { RootStackParamList, TabParamList } from '../types/navigation'; // TabParamList eklendi
import { MAJOR_ARCANA, getCardImage } from '../constants/tarotDeck';
import MysticConfirmationModal from '../components/MysticConfirmationModal';

const cardDataMap = new Map(MAJOR_ARCANA.map(card => [card.name, card]));

// DÜZELTME: Navigasyon tipi Composite olarak güncellendi
// Hem Tab ("Geçmiş") hem de Stack (Root) özelliklerini birleştiriyoruz.
type ReadingHistoryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Geçmiş'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type FilterType = 'all' | 'thisWeek' | 'thisMonth';

const ReadingHistoryScreen: React.FC = () => {
  const navigation = useNavigation<ReadingHistoryScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  
  const [readings, setReadings] = useState<ReadingHistoryItem[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<ReadingHistoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { loadReadings(); }, []));

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

  const applyFilter = (readingsToFilter: ReadingHistoryItem[], filter: FilterType) => {
    let filtered = [...readingsToFilter];
    const now = new Date();
    switch (filter) {
      case 'thisWeek':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = readingsToFilter.filter(reading => new Date(reading.createdAt) >= weekAgo);
        break;
      case 'thisMonth':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = readingsToFilter.filter(reading => new Date(reading.createdAt) >= monthAgo);
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
    setRefreshing(false);
  };

  const handleFavoriteToggle = async (readingId: string) => {
    try {
      await toggleReadingFavorite(readingId);
      await loadReadings();
    } catch (error) { console.error('Favori durumu değiştirilemedi:', error); }
  };

  const handleDeleteReading = (readingId: string) => {
    setReadingToDelete(readingId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!readingToDelete) return;
    try {
      await deleteReading(readingToDelete);
      setDeleteModalVisible(false);
      await loadReadings();
    } catch (error) {
      console.error('Okuma silinemedi:', error);
      setDeleteModalVisible(false);
      Alert.alert('Hata', 'Okuma silinemedi');
    } finally {
      setReadingToDelete(null);
    }
  };

  const handleReadingPress = (reading: ReadingHistoryItem) => {
    navigation.navigate('ReadingDetail', { reading });
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {[{ key: 'all', label: 'Tümü' }, { key: 'thisWeek', label: 'Bu Hafta' }, { key: 'thisMonth', label: 'Bu Ay' }].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[styles.filterButton, activeFilter === filter.key as FilterType && styles.activeFilterButton]}
          onPress={() => handleFilterChange(filter.key as FilterType)}
        >
          <Text style={[styles.filterButtonText, activeFilter === filter.key as FilterType && styles.activeFilterButtonText]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderReadingItem = ({ item }: { item: ReadingHistoryItem }) => {
    const readingDate = new Date(item.createdAt);
    const formattedDate = readingDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
      <TouchableOpacity style={styles.readingCard} onPress={() => handleReadingPress(item)} activeOpacity={0.8}>
        <LinearGradient colors={['rgba(74, 4, 78, 0.3)', 'rgba(74, 4, 78, 0.5)']} style={styles.readingCardGradient}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardQuestion} numberOfLines={2}>"{item.question}"</Text>
            <TouchableOpacity style={styles.favoriteButton} onPress={() => handleFavoriteToggle(item.id)}>
              <Text style={[styles.favoriteIcon, item.isFavorite && styles.favoriteIconActive]}>{item.isFavorite ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardImageGallery}>
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

          <View style={styles.cardFooter}>
            <Text style={styles.metaDataText} numberOfLines={1}>
              {formattedDate} • {item.spreadType?.name || 'Klasik Okuma'}
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteReading(item.id)}>
              <Text style={styles.deleteButtonIcon}>✕</Text>
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
      <Text style={styles.emptyStateText}>İlk tarot okumanızı yapın ve burada görüntüleyin</Text>
      {/* DÜZELTME: Home yerine Ana Sayfa */}
      <TouchableOpacity style={styles.emptyStateButton} onPress={() => navigation.navigate('Main', { screen: 'Ana Sayfa' } as any)}>
        <LinearGradient colors={['#701a75', '#4a044e']} style={styles.emptyStateButtonGradient}>
          <Text style={styles.emptyStateButtonText}>İlk Okumamı Yap</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <LinearGradient colors={['#1d112b', '#2b173f', '#1d112b']} style={styles.container}>
        <View style={{ flex: 1, paddingTop: insets.top }}>
            {readings.length > 0 && renderFilterButtons()}
            <FlatList 
                data={filteredReadings} 
                renderItem={renderReadingItem} 
                keyExtractor={(item) => item.id} 
                contentContainerStyle={styles.listContainer} 
                showsVerticalScrollIndicator={false} 
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d4af37" />} 
                ListEmptyComponent={isLoading ? null : renderEmptyState} 
            />
        </View>
      </LinearGradient>

      <MysticConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Sonsuzluğa Uğurla"
        subtitle="Bu okumayı anılar arasından sonsuzluğa uğurlamak bir daha geri getiremez. Devam edilsin mi?"
        buttons={[
          { text: 'İptal', onPress: () => setDeleteModalVisible(false), style: 'default' },
          { text: 'Sil', onPress: confirmDelete, style: 'destructive' },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10, marginBottom: 20, gap: 10 },
  filterButton: { flex: 1, paddingVertical: 10, backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)', alignItems: 'center' },
  activeFilterButton: { backgroundColor: '#d4af37', borderColor: '#d4af37' },
  filterButtonText: { fontSize: 14, color: '#d4af37', fontWeight: '600', fontFamily: Platform.select({ios: 'Georgia', android: 'serif'}) },
  activeFilterButtonText: { color: '#1d112b' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  readingCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#701a75' },
  readingCardGradient: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardQuestion: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#d4af37', fontFamily: Platform.select({ios: 'Georgia-Bold', android: 'serif'}), lineHeight: 24, marginRight: 10 },
  favoriteButton: { padding: 4 },
  favoriteIcon: { fontSize: 22, color: 'rgba(243, 232, 255, 0.5)' },
  favoriteIconActive: { color: '#d4af37' },
  cardImageGallery: { paddingBottom: 16, gap: 8 },
  miniCardContainer: { width: 60, aspectRatio: 0.6, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)' },
  miniCardImage: { width: '100%', height: '100%' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(212, 175, 55, 0.2)', paddingTop: 12 },
  metaDataText: { flex: 1, fontSize: 12, color: 'rgba(243, 232, 255, 0.7)', fontFamily: Platform.select({ios: 'Georgia', android: 'serif'}) },
  deleteButton: { padding: 4 },
  deleteButtonIcon: { fontSize: 22, color: '#d4af37', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyStateIcon: { fontSize: 64, marginBottom: 16 },
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#f3e8ff', marginBottom: 8, textAlign: 'center', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
  emptyStateText: { fontSize: 16, color: 'rgba(243, 232, 255, 0.8)', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  emptyStateButton: { borderRadius: 12, overflow: 'hidden' },
  emptyStateButtonGradient: { paddingHorizontal: 24, paddingVertical: 12 },
  emptyStateButtonText: { fontSize: 16, fontWeight: 'bold', color: '#f3e8ff' },
});

export default ReadingHistoryScreen;