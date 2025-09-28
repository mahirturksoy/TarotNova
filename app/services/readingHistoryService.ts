import AsyncStorage from '@react-native-async-storage/async-storage';
import { TarotReading } from './tarotAPIService';
import { SpreadType } from '../constants/spreadTypes';

// Okuma geçmişi için genişletilmiş tip
export interface ReadingHistoryItem extends TarotReading {
  id: string;
  question: string;
  mood: string;
  cards: string[];
  spreadType: SpreadType | null;
  isFavorite: boolean;
  createdAt: string;
}

// Storage key'leri
const STORAGE_KEYS = {
  READING_HISTORY: '@tarot_nova_reading_history',
  USER_STATS: '@tarot_nova_user_stats'
};

// Kullanıcı istatistikleri
export interface UserStats {
  totalReadings: number;
  favoriteReadings: number;
  streakDays: number;
  lastReadingDate: string;
  mostUsedSpread: string;
  readingsByMonth: Record<string, number>;
}

/**
 * Unique ID generator for readings
 */
const generateReadingId = (): string => {
  return `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Okuma geçmişine yeni kayıt ekleme
 */
export const saveReadingToHistory = async (
  reading: TarotReading,
  question: string,
  mood: string,
  cards: string[],
  spreadType: SpreadType | null
): Promise<void> => {
  try {
    // Mevcut geçmişi al
    const existingHistory = await getReadingHistory();
    
    // Yeni okuma kaydı oluştur
    const newReading: ReadingHistoryItem = {
      ...reading,
      id: generateReadingId(),
      question,
      mood,
      cards,
      spreadType,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };
    
    // Yeni okumayı listenin başına ekle (en yeni üstte)
    const updatedHistory = [newReading, ...existingHistory];
    
    // Storage'a kaydet (son 100 okumayı sakla)
    const limitedHistory = updatedHistory.slice(0, 100);
    await AsyncStorage.setItem(
      STORAGE_KEYS.READING_HISTORY, 
      JSON.stringify(limitedHistory)
    );
    
    // Kullanıcı istatistiklerini güncelle
    await updateUserStats(newReading);
    
  } catch (error) {
    console.error('Error saving reading to history:', error);
    throw error;
  }
};

/**
 * Okuma geçmişini getir
 */
export const getReadingHistory = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.READING_HISTORY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting reading history:', error);
    return [];
  }
};

/**
 * Favorilere ekleme/çıkarma
 */
export const toggleReadingFavorite = async (readingId: string): Promise<void> => {
  try {
    const history = await getReadingHistory();
    const updatedHistory = history.map(reading => 
      reading.id === readingId 
        ? { ...reading, isFavorite: !reading.isFavorite }
        : reading
    );
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.READING_HISTORY, 
      JSON.stringify(updatedHistory)
    );
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

/**
 * Okuma silme
 */
export const deleteReading = async (readingId: string): Promise<void> => {
  try {
    const history = await getReadingHistory();
    const updatedHistory = history.filter(reading => reading.id !== readingId);
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.READING_HISTORY, 
      JSON.stringify(updatedHistory)
    );
  } catch (error) {
    console.error('Error deleting reading:', error);
    throw error;
  }
};

/**
 * Filtrelenmiş okuma geçmişi getir
 */
export const getFilteredReadings = async (filters: {
  favoritesOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
  spreadType?: string;
}): Promise<ReadingHistoryItem[]> => {
  try {
    let history = await getReadingHistory();
    
    // Favoriler filtresi
    if (filters.favoritesOnly) {
      history = history.filter(reading => reading.isFavorite);
    }
    
    // Tarih aralığı filtresi
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      history = history.filter(reading => new Date(reading.createdAt) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      history = history.filter(reading => new Date(reading.createdAt) <= toDate);
    }
    
    // Spread türü filtresi
    if (filters.spreadType) {
      history = history.filter(reading => 
        reading.spreadType?.name === filters.spreadType
      );
    }
    
    return history;
  } catch (error) {
    console.error('Error filtering readings:', error);
    return [];
  }
};

/**
 * Sadece favori okumalarını getir
 */
export const getFavoriteReadings = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const history = await getReadingHistory();
    return history.filter(reading => reading.isFavorite);
  } catch (error) {
    console.error('Error getting favorite readings:', error);
    return [];
  }
};

/**
 * Tarih aralığına göre okuma getir
 */
export const getReadingsByDateRange = async (
  startDate: Date, 
  endDate: Date
): Promise<ReadingHistoryItem[]> => {
  try {
    const history = await getReadingHistory();
    
    return history.filter(reading => {
      const readingDate = new Date(reading.createdAt);
      return readingDate >= startDate && readingDate <= endDate;
    });
  } catch (error) {
    console.error('Error getting readings by date range:', error);
    return [];
  }
};

/**
 * Bu hafta yapılan okumalar
 */
export const getThisWeekReadings = async (): Promise<ReadingHistoryItem[]> => {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
  
  return getReadingsByDateRange(weekStart, weekEnd);
};

/**
 * Bu ay yapılan okumalar
 */
export const getThisMonthReadings = async (): Promise<ReadingHistoryItem[]> => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return getReadingsByDateRange(monthStart, monthEnd);
};

/**
 * Kullanıcı istatistiklerini güncelle
 */
const updateUserStats = async (newReading: ReadingHistoryItem): Promise<void> => {
  try {
    const currentStats = await getUserStats();
    const history = await getReadingHistory();
    
    const readingMonth = new Date(newReading.createdAt).toISOString().slice(0, 7); // YYYY-MM
    const favoriteCount = history.filter(r => r.isFavorite).length;
    
    // En çok kullanılan spread'i bul
    const spreadCounts: Record<string, number> = {};
    history.forEach(reading => {
      const spreadName = reading.spreadType?.name || 'Klasik Okuma';
      spreadCounts[spreadName] = (spreadCounts[spreadName] || 0) + 1;
    });
    
    const mostUsedSpread = Object.entries(spreadCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Klasik Okuma';
    
    const updatedStats: UserStats = {
      totalReadings: history.length,
      favoriteReadings: favoriteCount,
      lastReadingDate: newReading.createdAt,
      mostUsedSpread,
      streakDays: calculateStreak(currentStats.lastReadingDate, newReading.createdAt),
      readingsByMonth: {
        ...currentStats.readingsByMonth,
        [readingMonth]: (currentStats.readingsByMonth[readingMonth] || 0) + 1
      }
    };
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_STATS, 
      JSON.stringify(updatedStats)
    );
    
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

/**
 * Kullanıcı istatistiklerini getir
 */
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const statsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
    
    if (statsJson) {
      return JSON.parse(statsJson);
    }
    
    // Varsayılan istatistikler
    return {
      totalReadings: 0,
      favoriteReadings: 0,
      streakDays: 0,
      lastReadingDate: '',
      mostUsedSpread: 'Klasik Okuma',
      readingsByMonth: {}
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalReadings: 0,
      favoriteReadings: 0,
      streakDays: 0,
      lastReadingDate: '',
      mostUsedSpread: 'Klasik Okuma',
      readingsByMonth: {}
    };
  }
};

/**
 * Günlük streak hesaplama
 */
const calculateStreak = (lastReadingDate: string, newReadingDate: string): number => {
  if (!lastReadingDate) return 1;
  
  const lastDate = new Date(lastReadingDate);
  const newDate = new Date(newReadingDate);
  
  // Günlük farkı hesapla
  const diffTime = Math.abs(newDate.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Aynı gün ise streak aynı kalır
  if (diffDays === 0) return 1;
  
  // Ardışık günler ise streak artar
  if (diffDays === 1) return 2;
  
  // Daha uzun ara ise streak sıfırlanır
  return 1;
};

/**
 * Spread türü bazında istatistik
 */
export const getSpreadStatistics = async (): Promise<Record<string, number>> => {
  try {
    const history = await getReadingHistory();
    const spreadCounts: Record<string, number> = {};
    
    history.forEach(reading => {
      const spreadName = reading.spreadType?.name || 'Klasik Okuma';
      spreadCounts[spreadName] = (spreadCounts[spreadName] || 0) + 1;
    });
    
    return spreadCounts;
  } catch (error) {
    console.error('Error getting spread statistics:', error);
    return {};
  }
};

/**
 * Aylık okuma istatistikleri
 */
export const getMonthlyStatistics = async (): Promise<Record<string, number>> => {
  try {
    const history = await getReadingHistory();
    const monthCounts: Record<string, number> = {};
    
    history.forEach(reading => {
      const month = new Date(reading.createdAt).toISOString().slice(0, 7);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    return monthCounts;
  } catch (error) {
    console.error('Error getting monthly statistics:', error);
    return {};
  }
};

/**
 * Tüm geçmişi temizle
 */
export const clearAllHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.READING_HISTORY);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_STATS);
    console.log('All history cleared successfully');
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

/**
 * Favori durumunu toggle et (alias function)
 */
export const toggleFavoriteReading = async (readingId: string): Promise<void> => {
  return toggleReadingFavorite(readingId);
};