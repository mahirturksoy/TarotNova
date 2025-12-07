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
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next'; // <-- ÇEVİRİ EKLENDİ

import {
  ReadingHistoryItem,
  getReadingHistory,
  toggleReadingFavorite,
  deleteReading,
} from '../services/readingHistoryService';
import type { RootStackParamList, TabParamList } from '../types/navigation';
import { MAJOR_ARCANA, getCardImage } from '../constants/tarotDeck';
import MysticConfirmationModal from '../components/MysticConfirmationModal';

const cardDataMap = new Map(MAJOR_ARCANA.map(card => [card.name, card]));

type ReadingHistoryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Geçmiş'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type FilterType = 'all' | 'thisWeek' | 'thisMonth';

const ReadingHistoryScreen: React.FC = () => {
  const navigation = useNavigation<ReadingHistoryScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation(); // <-- HOOK
  
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
      const sortedHistory = history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReadings(sortedHistory);
      applyFilter(sortedHistory, activeFilter);
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
      Alert.alert(t('common.error'), 'Okuma silinemedi');
    } finally {
      setReadingToDelete(null);
    }
  };

  const handleReadingPress = (reading: ReadingHistoryItem) => {
    navigation.navigate('ReadingDetail', { reading });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Dil desteği ile tarih formatlama
    return date.toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {[
          { key: 'all', label: t('history.filters.all') }, 
          { key: 'thisWeek', label: t('history.filters.week') }, 
          { key: 'thisMonth', label: t('history.filters.month') }
      ].map((filter) => (
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
    // Spread adını dinamik olarak çevir (varsa)
    const spreadName = item.spreadType?.id ? t(`spread.types.${item.spreadType.id}.name`) : item.spreadType?.name || t('spread.types.single-card.name');

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
              {formatDate(item.createdAt)} • {spreadName}
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteReading(item.id)}>
              <Text style={styles.deleteButtonIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // DÜZELTME: Mistik Parşömen İkonu ve Gradient Buton Eklendi
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      
      <View style={styles.mysticIconContainer}>
        <Text style={styles.mysticIconSmall}>✧</Text>
        <Text style={styles.mysticIconLarge}>📜</Text>
        <Text style={styles.mysticIconSmall}>✧</Text>
      </View>

      <Text style={styles.emptyStateTitle}>{t('history.empty.title')}</Text>
      <Text style={styles.emptyStateText}>{t('history.empty.subtitle')}</Text>
      
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate('Main', { screen: 'Ana Sayfa' })}
        activeOpacity={0.8}
      >
        <LinearGradient colors={['#d4af37', '#F59E0B']} style={styles.ctaGradient}>
          <Text style={styles.ctaButtonText}>{t('history.empty.btn')}</Text>
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
        title={t('history.deleteModal.title')}
        subtitle={t('history.deleteModal.message')}
        buttons={[
          { text: t('common.cancel'), onPress: () => setDeleteModalVisible(false), style: 'default' },
          { text: t('common.delete'), onPress: confirmDelete, style: 'destructive' },
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
  
  // YENİ BOŞ EKRAN STİLLERİ
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40, marginTop: '20%' },
  mysticIconContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  mysticIconLarge: { fontSize: 64, marginHorizontal: 10 }, // Parşömen İkonu
  mysticIconSmall: { fontSize: 32, color: '#d4af37', textShadowColor: 'rgba(212, 175, 55, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }, // Yıldızlar
  
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#f3e8ff', marginBottom: 8, textAlign: 'center', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
  emptyStateText: { fontSize: 16, color: 'rgba(243, 232, 255, 0.8)', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  
  // YENİ GRADIENT BUTON STİLİ
  ctaButton: { borderRadius: 12, overflow: 'hidden', shadowColor: '#d4af37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, width: '100%' },
  ctaGradient: { paddingVertical: 16, alignItems: 'center' },
  ctaButtonText: { fontSize: 18, fontWeight: 'bold', color: '#1d112b', fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
});

export default ReadingHistoryScreen;