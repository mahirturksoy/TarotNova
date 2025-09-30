// app/services/readingHistoryService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpreadType } from '../constants/spreadTypes';

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

export interface ReadingHistoryItem {
  id: string;
  question: string;
  mood: string;
  cards: string[];
  spreadType?: SpreadType;
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

// Yeni okuma kaydetme
export const saveReading = async (reading: Omit<ReadingHistoryItem, 'id' | 'createdAt' | 'isFavorite'>): Promise<void> => {
  try {
    const existingReadings = await getReadingHistory();
    
    const newReading: ReadingHistoryItem = {
      ...reading,
      id: Date.now().toString(),
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

// Tüm okumaları getir
export const getReadingHistory = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const readings = await AsyncStorage.getItem(STORAGE_KEY);
    return readings ? JSON.parse(readings) : [];
  } catch (error) {
    console.error('Okumalar alınamadı:', error);
    return [];
  }
};

// Favori okumaları getir
export const getFavoriteReadings = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const allReadings = await getReadingHistory();
    return allReadings.filter(reading => reading.isFavorite);
  } catch (error) {
    console.error('Favori okumalar alınamadı:', error);
    return [];
  }
};

// Favori durumunu değiştir
export const toggleReadingFavorite = async (readingId: string): Promise<void> => {
  try {
    const readings = await getReadingHistory();
    const updatedReadings = readings.map(reading => {
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

// Okuma sil
export const deleteReading = async (readingId: string): Promise<void> => {
  try {
    const readings = await getReadingHistory();
    const filteredReadings = readings.filter(reading => reading.id !== readingId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredReadings));
  } catch (error) {
    console.error('Okuma silinemedi:', error);
    throw error;
  }
};

// Kullanıcı istatistiklerini getir
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
    
    // En çok kullanılan spread
    const spreadCounts: Record<string, number> = {};
    readings.forEach(reading => {
      const spreadName = reading.spreadType?.name || 'Klasik';
      spreadCounts[spreadName] = (spreadCounts[spreadName] || 0) + 1;
    });
    
    const mostUsedSpread = Object.entries(spreadCounts)
      .sort(([, a], [, b]) => b - a)[0][0];
    
    // Streak hesapla
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

// Tüm geçmişi temizle
export const clearAllHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Geçmiş temizlenemedi:', error);
    throw error;
  }
};