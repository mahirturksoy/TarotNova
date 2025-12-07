// app/services/readingHistoryService.ts

/**
 * FIRESTORE WRAPPER SERVICE
 *
 * Bu dosya eski AsyncStorage API'sini koruyor ama artık Firestore kullanıyor.
 * Böylece mevcut kodlarda değişiklik yapmaya gerek yok.
 *
 * AsyncStorage → Firestore migration otomatik olarak yapılıyor.
 */

import firestoreService, { FirestoreReading } from './firestoreService';

// ========================================
// TYPES & INTERFACES (Eski API ile uyumlu)
// ========================================

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
  spreadType?: SavedSpreadType;
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
  mostUsedSpread?: string;
  lastReadingDate?: string | null;
}

// ========================================
// MAPPING FUNCTIONS
// ========================================

/**
 * ReadingHistoryItem → FirestoreReading mapping
 */
function mapToFirestoreReading(
  reading: Omit<ReadingHistoryItem, 'id' | 'createdAt' | 'isFavorite' | 'userId'>
): Omit<FirestoreReading, 'id' | 'userId' | 'createdAt'> {
  return {
    question: reading.question,
    cards: reading.cards,
    spreadType: {
      id: reading.spreadType?.id || 'classic',
      name: reading.spreadType?.name || 'Classic',
      positions: reading.spreadType?.cardCount || reading.cards.length,
    },
    holisticInterpretation: reading.holisticInterpretation,
    cardDetails: reading.cardDetails.map((card) => ({
      cardName: card.cardName,
      position: card.position,
      interpretation: `${card.meaning}\n\nTavsiye: ${card.advice}`,
    })),
    summary: reading.summary,
    isFavorite: false,
  };
}

/**
 * FirestoreReading → ReadingHistoryItem mapping (backwards compatibility)
 */
function mapFromFirestoreReading(firestoreReading: FirestoreReading): ReadingHistoryItem {
  return {
    id: firestoreReading.id,
    userId: firestoreReading.userId,
    question: firestoreReading.question,
    mood: '', // Firestore'da mood yok, boş string döndür
    cards: firestoreReading.cards,
    spreadType: {
      id: firestoreReading.spreadType.id,
      name: firestoreReading.spreadType.name,
      cardCount: firestoreReading.spreadType.positions,
    },
    holisticInterpretation: firestoreReading.holisticInterpretation,
    cardDetails: firestoreReading.cardDetails.map((card) => {
      // Interpretation'ı parse et (meaning + advice)
      const parts = card.interpretation.split('\n\nTavsiye: ');
      return {
        cardName: card.cardName,
        position: card.position,
        meaning: parts[0] || card.interpretation,
        advice: parts[1] || '',
      };
    }),
    lifeAspects: {
      love: '',
      career: '',
      personal: '',
    }, // Firestore'da life aspects yok
    summary: firestoreReading.summary,
    confidence: 0, // Firestore'da confidence yok
    readingTitle: '', // Firestore'da reading title yok
    createdAt: firestoreReading.createdAt.toDate().toISOString(),
    isFavorite: firestoreReading.isFavorite,
  };
}

// ========================================
// PUBLIC API (Eski API ile uyumlu)
// ========================================

/**
 * Yeni okuma kaydet
 */
export const saveReading = async (
  reading: Omit<ReadingHistoryItem, 'id' | 'createdAt' | 'isFavorite' | 'userId'>
): Promise<void> => {
  try {
    const firestoreReading = mapToFirestoreReading(reading);
    await firestoreService.saveReading(firestoreReading);
    console.log('✅ Reading saved via readingHistoryService');
  } catch (error) {
    console.error('❌ Failed to save reading:', error);
    throw error;
  }
};

/**
 * Kullanıcının tüm okumalarını getir
 */
export const getReadingHistory = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const firestoreReadings = await firestoreService.getReadingHistory();
    return firestoreReadings.map(mapFromFirestoreReading);
  } catch (error) {
    console.error('❌ Failed to get reading history:', error);
    return [];
  }
};

/**
 * Favori okumaları getir
 */
export const getFavoriteReadings = async (): Promise<ReadingHistoryItem[]> => {
  try {
    const firestoreReadings = await firestoreService.getFavoriteReadings();
    return firestoreReadings.map(mapFromFirestoreReading);
  } catch (error) {
    console.error('❌ Failed to get favorite readings:', error);
    return [];
  }
};

/**
 * Favori durumunu toggle et
 */
export const toggleReadingFavorite = async (readingId: string): Promise<void> => {
  try {
    // Mevcut reading'i al
    const reading = await firestoreService.getReadingById(readingId);
    if (!reading) {
      throw new Error('Reading not found');
    }

    // Toggle
    await firestoreService.toggleReadingFavorite(readingId, !reading.isFavorite);
    console.log('✅ Reading favorite toggled');
  } catch (error) {
    console.error('❌ Failed to toggle favorite:', error);
    throw error;
  }
};

/**
 * Okuma sil
 */
export const deleteReading = async (readingId: string): Promise<void> => {
  try {
    await firestoreService.deleteReading(readingId);
    console.log('✅ Reading deleted');
  } catch (error) {
    console.error('❌ Failed to delete reading:', error);
    throw error;
  }
};

/**
 * Kullanıcı istatistiklerini getir
 */
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const stats = await firestoreService.getUserStats();

    // mostUsedSpread hesaplamak için readings'i al
    const readings = await firestoreService.getReadingHistory(100);

    let mostUsedSpread = 'Henüz okuma yok';
    if (readings.length > 0) {
      const spreadCounts: Record<string, number> = {};
      readings.forEach((reading) => {
        const spreadName = reading.spreadType?.name || 'Classic';
        spreadCounts[spreadName] = (spreadCounts[spreadName] || 0) + 1;
      });

      const sortedSpreads = Object.entries(spreadCounts).sort(([, a], [, b]) => b - a);
      if (sortedSpreads.length > 0) {
        mostUsedSpread = sortedSpreads[0][0];
      }
    }

    return {
      totalReadings: stats.totalReadings,
      favoriteReadings: stats.favoriteReadings,
      streakDays: stats.streakDays,
      mostUsedSpread,
      lastReadingDate: stats.lastReadingDate || null,
    };
  } catch (error) {
    console.error('❌ Failed to get user stats:', error);
    return {
      totalReadings: 0,
      favoriteReadings: 0,
      streakDays: 0,
      mostUsedSpread: 'Henüz okuma yok',
      lastReadingDate: null,
    };
  }
};

/**
 * Tüm geçmişi temizle
 */
export const clearAllHistory = async (): Promise<void> => {
  try {
    await firestoreService.clearAllHistory();
    console.log('✅ All history cleared');
  } catch (error) {
    console.error('❌ Failed to clear history:', error);
    throw error;
  }
};

/**
 * Guest data migration (artık kullanılmıyor, Firestore auth-based)
 * Geriye uyumluluk için boş fonksiyon bırakıldı
 */
export const migrateGuestDataToUser = async (): Promise<void> => {
  console.log('ℹ️  migrateGuestDataToUser deprecated - Firestore handles auth automatically');
};
