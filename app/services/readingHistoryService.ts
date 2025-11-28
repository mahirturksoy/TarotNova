// app/services/readingHistoryService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpreadType } from '../constants/spreadTypes';
import { auth } from '../config/firebaseConfig'; // Auth eklendi

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
  userId: string; // <-- YENİ: Kullanıcı ayrımı için eklendi
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

// YARDIMCI: Tüm ham veriyi çeker (Filtrelemeden)
// Bu, silme ve güncelleme işlemlerinde diğer kullanıcıların verisini korumak için gereklidir.
const getAllReadingsRaw = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const readings = await AsyncStorage.getItem(STORAGE_KEY);
    return readings ? JSON.parse(readings) : [];
  } catch (error) {
    console.error('Ham veri okunamadı:', error);
    return [];
  }
};

// Yeni okuma kaydetme
export const saveReading = async (reading: Omit<ReadingHistoryItem, 'id' | 'createdAt' | 'isFavorite' | 'userId'>): Promise<void> => {
  try {
    // 1. Mevcut kullanıcıyı belirle
    const currentUser = auth.currentUser;
    const currentUserId = currentUser ? currentUser.uid : 'guest';

    const existingReadings = await getAllReadingsRaw(); // Tüm veriyi çek
    
    const newReading: ReadingHistoryItem = {
      ...reading,
      id: Date.now().toString(),
      userId: currentUserId, // <-- ID'yi ekle
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

// Okumaları getir (SADECE GİRİŞ YAPAN KULLANICININ)
export const getReadingHistory = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const allReadings = await getAllReadingsRaw();
    
    // Mevcut kullanıcıyı bul
    const currentUser = auth.currentUser;
    const currentUserId = currentUser ? currentUser.uid : 'guest';

    // Sadece bu kullanıcıya ait olanları filtrele
    // (Eski kayıtlarda userId olmayabilir, onlara 'guest' muamelesi yapıyoruz)
    return allReadings.filter(item => {
      const itemOwner = item.userId || 'guest';
      return itemOwner === currentUserId;
    });
  } catch (error) {
    console.error('Okumalar alınamadı:', error);
    return [];
  }
};

// Favori okumaları getir
export const getFavoriteReadings = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const userReadings = await getReadingHistory(); // Zaten filtrelenmiş gelir
    return userReadings.filter(reading => reading.isFavorite);
  } catch (error) {
    console.error('Favori okumalar alınamadı:', error);
    return [];
  }
};

// Favori durumunu değiştir
export const toggleReadingFavorite = async (readingId: string): Promise<void> => {
  try {
    // Tüm veriyi çekiyoruz ki diğer kullanıcıların verisi silinmesin
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

// Okuma sil
export const deleteReading = async (readingId: string): Promise<void> => {
  try {
    // Tüm veriyi çekip sadece ilgili ID'yi siliyoruz
    const allReadings = await getAllReadingsRaw();
    const filteredReadings = allReadings.filter(reading => reading.id !== readingId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredReadings));
  } catch (error) {
    console.error('Okuma silinemedi:', error);
    throw error;
  }
};

// Kullanıcı istatistiklerini getir
export const getUserStats = async (): Promise<UserStats> => {
  try {
    // getReadingHistory zaten kullanıcıya özel veri döndürüyor
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
    // Eğer son okuma bugün veya dün yapıldıysa streak devam eder
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

// Misafir verilerini Giriş Yapan Kullanıcıya Aktar
// Bunu AuthScreen'de başarılı girişten sonra çağırabilirsin.
export const migrateGuestDataToUser = async (): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const allReadings = await getAllReadingsRaw();
    
    // Sahibi 'guest' olan veya hiç olmayan (eski) kayıtları bul ve yeni kullanıcıya ata
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

// Tüm geçmişi temizle (Sadece o anki kullanıcınınkileri)
export const clearAllHistory = async (): Promise<void> => {
  try {
    const allReadings = await getAllReadingsRaw();
    const currentUser = auth.currentUser;
    const currentUserId = currentUser ? currentUser.uid : 'guest';

    // Diğer kullanıcıların verilerini koru, sadece benimkileri sil
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