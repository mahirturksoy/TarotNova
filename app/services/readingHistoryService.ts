// app/services/readingHistoryService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebaseConfig';

const STORAGE_KEY = '@tarot_readings';

export interface CardDetail {
  cardName: string;
  position: string;
  meaning: string;
  advice: string;
}

export interface LifeAspects {
  love: string;
  career: string;
  personal: string;
}

// DÜZELTME: SpreadType artık tam 'SpreadType' değil, basitleştirilmiş obje.
// Bu sayede Context'ten gelen veriyle uyuşur.
interface SavedSpreadType {
  id: string;
  name: string;
  cardCount: number;
}

export interface ReadingHistoryItem {
  id: string;
  userId: string;
  question: string;
  mood: string;
  cards: string[];
  spreadType?: SavedSpreadType; // <-- GÜNCELLENDİ
  holisticInterpretation: string;
  cardDetails: CardDetail[];
  lifeAspects: LifeAspects;
  summary: string;
  confidence: number;
  readingTitle: string;
  createdAt: string;
  isFavorite: boolean;
}

export interface UserStats {
  totalReadings: number;
  favoriteReadings: number;
  streakDays: number;
  mostUsedSpread: string;
  lastReadingDate: string | null;
}

const getAllReadingsRaw = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const readings = await AsyncStorage.getItem(STORAGE_KEY);
    return readings ? JSON.parse(readings) : [];
  } catch (error) {
    console.error('Ham veri okunamadı:', error);
    return [];
  }
};

export const saveReading = async (reading: Omit<ReadingHistoryItem, 'id' | 'createdAt' | 'isFavorite' | 'userId'>): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    const currentUserId = currentUser ? currentUser.uid : 'guest';

    const existingReadings = await getAllReadingsRaw();
    
    const newReading: ReadingHistoryItem = {
      ...reading,
      id: Date.now().toString(),
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      isFavorite: false
    };
    
    const updatedReadings = [newReading, ...existingReadings];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReadings));
  } catch (error) {
    console.error('Okuma kaydedilemedi:', error);
    throw error;
  }
};

export const getReadingHistory = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const allReadings = await getAllReadingsRaw();
    const currentUser = auth.currentUser;
    const currentUserId = currentUser ? currentUser.uid : 'guest';

    return allReadings.filter(item => {
      const itemOwner = item.userId || 'guest';
      return itemOwner === currentUserId;
    });
  } catch (error) {
    console.error('Okumalar alınamadı:', error);
    return [];
  }
};

export const getFavoriteReadings = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const userReadings = await getReadingHistory();
    return userReadings.filter(reading => reading.isFavorite);
  } catch (error) {
    console.error('Favori okumalar alınamadı:', error);
    return [];
  }
};

export const toggleReadingFavorite = async (readingId: string): Promise<void> => {
  try {
    const allReadings = await getAllReadingsRaw();
    const updatedReadings = allReadings.map(reading => {
      if (reading.id === readingId) {
        return { ...reading, isFavorite: !reading.isFavorite };
      }
      return reading;
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReadings));
  } catch (error) {
    console.error('Favori durumu değiştirilemedi:', error);
    throw error;
  }
};

export const deleteReading = async (readingId: string): Promise<void> => {
  try {
    const allReadings = await getAllReadingsRaw();
    const filteredReadings = allReadings.filter(reading => reading.id !== readingId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredReadings));
  } catch (error) {
    console.error('Okuma silinemedi:', error);
    throw error;
  }
};

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const readings = await getReadingHistory();
    
    if (readings.length === 0) {
      return {
        totalReadings: 0,
        favoriteReadings: 0,
        streakDays: 0,
        mostUsedSpread: 'Henüz okuma yok',
        lastReadingDate: null
      };
    }
    
    const spreadCounts: Record<string, number> = {};
    readings.forEach(reading => {
      const spreadName = reading.spreadType?.name || 'Klasik';
      spreadCounts[spreadName] = (spreadCounts[spreadName] || 0) + 1;
    });
    
    const mostUsedSpread = Object.entries(spreadCounts)
      .sort(([, a], [, b]) => b - a)[0][0];
    
    const today = new Date();
    const lastReading = new Date(readings[0].createdAt);
    const daysSinceLastReading = Math.floor((today.getTime() - lastReading.getTime()) / (1000 * 60 * 60 * 24));
    
    let streakDays = 0;
    if (daysSinceLastReading <= 1) {
      streakDays = 1;
      for (let i = 1; i < readings.length; i++) {
        const currentDate = new Date(readings[i].createdAt);
        const prevDate = new Date(readings[i - 1].createdAt);
        const daysDiff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) {
          streakDays++;
        } else {
          break;
        }
      }
    }
    
    return {
      totalReadings: readings.length,
      favoriteReadings: readings.filter(r => r.isFavorite).length,
      streakDays,
      mostUsedSpread,
      lastReadingDate: readings[0]?.createdAt || null
    };
  } catch (error) {
    console.error('İstatistikler alınamadı:', error);
    return {
      totalReadings: 0,
      favoriteReadings: 0,
      streakDays: 0,
      mostUsedSpread: 'Henüz okuma yok',
      lastReadingDate: null
    };
  }
};

export const migrateGuestDataToUser = async (): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const allReadings = await getAllReadingsRaw();
    const updatedReadings = allReadings.map(item => {
      if (!item.userId || item.userId === 'guest') {
        return { ...item, userId: currentUser.uid };
      }
      return item;
    });

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReadings));
  } catch (error) {
    console.error('Veri taşıma hatası:', error);
  }
};

export const clearAllHistory = async (): Promise<void> => {
  try {
    const allReadings = await getAllReadingsRaw();
    const currentUser = auth.currentUser;
    const currentUserId = currentUser ? currentUser.uid : 'guest';

    const readingsToKeep = allReadings.filter(item => {
       const itemOwner = item.userId || 'guest';
       return itemOwner !== currentUserId;
    });

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(readingsToKeep));
  } catch (error) {
    console.error('Geçmiş temizlenemedi:', error);
    throw error;
  }
};