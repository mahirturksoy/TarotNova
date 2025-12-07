// app/services/firestoreService.ts

import { auth, firestore } from '../config/firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  updateDoc,
  increment,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========================================
// TYPES & INTERFACES
// ========================================

export interface FirestoreReading {
  id: string;
  userId: string;
  question: string;
  cards: string[];
  spreadType: {
    id: string;
    name: string;
    positions: number;
  };
  holisticInterpretation: string;
  cardDetails: Array<{
    cardName: string;
    position: string;
    interpretation: string;
  }>;
  summary: string;
  createdAt: Timestamp;
  isFavorite: boolean;
}

export interface UserStats {
  totalReadings: number;
  favoriteReadings: number;
  streakDays: number;
  lastReadingDate?: string;
}

export interface UserPreferences {
  notifications: boolean;
  dailyReminder: boolean;
  autoSave: boolean;
}

// ========================================
// FIRESTORE SERVICE CLASS
// ========================================

class FirestoreService {
  private COLLECTIONS = {
    USERS: 'users',
    READINGS: 'readings',
  };

  /**
   * Mevcut kullanıcının ID'sini al
   * @returns User ID veya null
   */
  private getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  // ========================================
  // READING CRUD OPERATIONS
  // ========================================

  /**
   * Yeni okuma kaydet
   * @param reading - Kaydedilecek okuma verisi
   * @returns Kaydedilen reading ID
   */
  async saveReading(reading: Omit<FirestoreReading, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Yeni reading ID oluştur
      const readingId = doc(collection(firestore, this.COLLECTIONS.READINGS)).id;

      const readingData: FirestoreReading = {
        id: readingId,
        userId,
        ...reading,
        createdAt: Timestamp.now(),
      };

      // Firestore'a kaydet
      const readingRef = doc(firestore, this.COLLECTIONS.READINGS, readingId);
      await setDoc(readingRef, readingData);

      // User stats güncelle
      await this.incrementUserStats(userId, 'totalReadings');

      console.log('✅ Reading saved to Firestore:', readingId);
      return readingId;
    } catch (error) {
      console.error('❌ Failed to save reading to Firestore:', error);
      throw error;
    }
  }

  /**
   * Kullanıcının tüm okumalarını getir
   * @param limitCount - Maksimum kaç okuma getirileceği (default: 50)
   * @returns Reading listesi
   */
  async getReadingHistory(limitCount: number = 50): Promise<FirestoreReading[]> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.warn('⚠️  User not authenticated, returning empty array');
        return [];
      }

      const readingsRef = collection(firestore, this.COLLECTIONS.READINGS);
      const q = query(
        readingsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const readings: FirestoreReading[] = [];

      querySnapshot.forEach((doc) => {
        readings.push(doc.data() as FirestoreReading);
      });

      console.log(`✅ Fetched ${readings.length} readings from Firestore`);
      return readings;
    } catch (error) {
      console.error('❌ Failed to fetch reading history:', error);
      throw error;
    }
  }

  /**
   * Favori okumaları getir
   * @returns Favori reading listesi
   */
  async getFavoriteReadings(): Promise<FirestoreReading[]> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.warn('⚠️  User not authenticated, returning empty array');
        return [];
      }

      const readingsRef = collection(firestore, this.COLLECTIONS.READINGS);
      const q = query(
        readingsRef,
        where('userId', '==', userId),
        where('isFavorite', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const favorites: FirestoreReading[] = [];

      querySnapshot.forEach((doc) => {
        favorites.push(doc.data() as FirestoreReading);
      });

      console.log(`✅ Fetched ${favorites.length} favorite readings from Firestore`);
      return favorites;
    } catch (error) {
      console.error('❌ Failed to fetch favorite readings:', error);
      throw error;
    }
  }

  /**
   * Belirli bir okumayı ID ile getir
   * @param readingId - Okuma ID'si
   * @returns Reading verisi veya null
   */
  async getReadingById(readingId: string): Promise<FirestoreReading | null> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.warn('⚠️  User not authenticated');
        return null;
      }

      const readingRef = doc(firestore, this.COLLECTIONS.READINGS, readingId);
      const docSnap = await getDoc(readingRef);

      if (!docSnap.exists()) {
        console.warn(`⚠️  Reading not found: ${readingId}`);
        return null;
      }

      const reading = docSnap.data() as FirestoreReading;

      // Authorization check: Verify reading belongs to current user
      if (reading.userId !== userId) {
        console.warn(`⚠️  Unauthorized access attempt: Reading ${readingId} belongs to different user`);
        return null;
      }

      return reading;
    } catch (error) {
      console.error('❌ Failed to fetch reading by ID:', error);
      throw error;
    }
  }

  /**
   * Okumayı sil
   * @param readingId - Silinecek okuma ID'si
   */
  async deleteReading(readingId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Önce reading'in user'a ait olduğunu kontrol et
      const reading = await this.getReadingById(readingId);
      if (!reading) {
        throw new Error('Reading not found');
      }

      if (reading.userId !== userId) {
        throw new Error('Unauthorized: This reading belongs to another user');
      }

      // Sil
      const readingRef = doc(firestore, this.COLLECTIONS.READINGS, readingId);
      await deleteDoc(readingRef);

      // User stats güncelle
      await this.decrementUserStats(userId, 'totalReadings');

      if (reading.isFavorite) {
        await this.decrementUserStats(userId, 'favoriteReadings');
      }

      console.log('✅ Reading deleted from Firestore:', readingId);
    } catch (error) {
      console.error('❌ Failed to delete reading:', error);
      throw error;
    }
  }

  /**
   * Favori durumunu toggle et
   * @param readingId - Okuma ID'si
   * @param isFavorite - Yeni favori durumu
   */
  async toggleReadingFavorite(readingId: string, isFavorite: boolean): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Önce reading'in user'a ait olduğunu kontrol et
      const reading = await this.getReadingById(readingId);
      if (!reading) {
        throw new Error('Reading not found');
      }

      if (reading.userId !== userId) {
        throw new Error('Unauthorized: This reading belongs to another user');
      }

      // Favori durumunu güncelle
      const readingRef = doc(firestore, this.COLLECTIONS.READINGS, readingId);
      await updateDoc(readingRef, { isFavorite });

      // User stats güncelle
      if (isFavorite) {
        await this.incrementUserStats(userId, 'favoriteReadings');
      } else {
        await this.decrementUserStats(userId, 'favoriteReadings');
      }

      console.log(`✅ Reading ${readingId} favorite status: ${isFavorite}`);
    } catch (error) {
      console.error('❌ Failed to toggle favorite:', error);
      throw error;
    }
  }

  /**
   * Tüm okuma geçmişini sil
   */
  async clearAllHistory(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Tüm okumaları getir
      const readings = await this.getReadingHistory(1000); // Max 1000 reading

      if (readings.length === 0) {
        console.log('ℹ️  No readings to delete');
        return;
      }

      // Batch delete (Firestore max 500 operations per batch)
      const batchSize = 500;
      const batches: Promise<void>[] = [];

      for (let i = 0; i < readings.length; i += batchSize) {
        const batch = writeBatch(firestore);
        const chunk = readings.slice(i, i + batchSize);

        chunk.forEach((reading) => {
          const readingRef = doc(firestore, this.COLLECTIONS.READINGS, reading.id);
          batch.delete(readingRef);
        });

        batches.push(batch.commit());
      }

      await Promise.all(batches);

      // User stats sıfırla
      await this.resetUserStats(userId);

      console.log(`✅ Deleted ${readings.length} readings from Firestore`);
    } catch (error) {
      console.error('❌ Failed to clear reading history:', error);
      throw error;
    }
  }

  // ========================================
  // USER STATS MANAGEMENT
  // ========================================

  /**
   * Kullanıcı istatistiklerini getir
   * @returns UserStats verisi
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          totalReadings: 0,
          favoriteReadings: 0,
          streakDays: 0,
        };
      }

      const userRef = doc(firestore, this.COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          totalReadings: data.stats?.totalReadings || 0,
          favoriteReadings: data.stats?.favoriteReadings || 0,
          streakDays: data.stats?.streakDays || 0,
          lastReadingDate: data.stats?.lastReadingDate,
        };
      }

      // User document yoksa oluştur
      await this.initializeUserDocument(userId);

      return {
        totalReadings: 0,
        favoriteReadings: 0,
        streakDays: 0,
      };
    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      return {
        totalReadings: 0,
        favoriteReadings: 0,
        streakDays: 0,
      };
    }
  }

  /**
   * User document başlat (ilk kez oluşturulduğunda)
   * @param userId - User ID
   */
  private async initializeUserDocument(userId: string): Promise<void> {
    try {
      const userRef = doc(firestore, this.COLLECTIONS.USERS, userId);
      await setDoc(
        userRef,
        {
          uid: userId,
          stats: {
            totalReadings: 0,
            favoriteReadings: 0,
            streakDays: 0,
            lastReadingDate: null,
          },
          createdAt: Timestamp.now(),
        },
        { merge: true }
      );

      console.log('✅ User document initialized:', userId);
    } catch (error) {
      console.error('❌ Failed to initialize user document:', error);
    }
  }

  /**
   * Stat değerini artır (Atomic operation - race condition safe)
   * @param userId - User ID
   * @param statKey - Artırılacak stat key'i
   */
  private async incrementUserStats(userId: string, statKey: keyof UserStats): Promise<void> {
    try {
      const userRef = doc(firestore, this.COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(userRef);

      // User document yoksa oluştur
      if (!docSnap.exists()) {
        await this.initializeUserDocument(userId);
      }

      // Atomic increment kullan (race condition'ı önler)
      await setDoc(
        userRef,
        {
          stats: {
            [statKey]: increment(1),
            lastReadingDate: new Date().toISOString(),
          },
        },
        { merge: true }
      );

      console.log(`✅ User stat incremented atomically: ${statKey}`);
    } catch (error) {
      console.error(`❌ Failed to increment stat ${statKey}:`, error);
    }
  }

  /**
   * Stat değerini azalt (Atomic operation - race condition safe)
   * @param userId - User ID
   * @param statKey - Azaltılacak stat key'i
   */
  private async decrementUserStats(userId: string, statKey: keyof UserStats): Promise<void> {
    try {
      const userRef = doc(firestore, this.COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        console.warn('⚠️ User document does not exist, cannot decrement stats');
        return;
      }

      // Atomic decrement kullan (race condition'ı önler)
      // Not: Firestore increment(-1) negatif değerlere izin verir, bu yüzden kontrol gerekebilir
      await setDoc(
        userRef,
        {
          stats: {
            [statKey]: increment(-1),
          },
        },
        { merge: true }
      );

      console.log(`✅ User stat decremented atomically: ${statKey}`);
    } catch (error) {
      console.error(`❌ Failed to decrement stat ${statKey}:`, error);
    }
  }

  /**
   * User stats sıfırla
   * @param userId - User ID
   */
  private async resetUserStats(userId: string): Promise<void> {
    try {
      const userRef = doc(firestore, this.COLLECTIONS.USERS, userId);
      await setDoc(
        userRef,
        {
          stats: {
            totalReadings: 0,
            favoriteReadings: 0,
            streakDays: 0,
            lastReadingDate: null,
          },
        },
        { merge: true }
      );

      console.log('✅ User stats reset');
    } catch (error) {
      console.error('❌ Failed to reset user stats:', error);
    }
  }

  // ========================================
  // ASYNCSTORAGE MIGRATION
  // ========================================

  /**
   * AsyncStorage'dan Firestore'a veri taşı (tek seferlik)
   * App.tsx başlangıcında çağrılır
   */
  async migrateAsyncStorageToFirestore(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.log('⚠️  Cannot migrate: User not authenticated');
        return;
      }

      // Migration flag kontrolü (Firestore'dan)
      const userRef = doc(firestore, this.COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      const migrationStatus = userDoc.data()?.migrationCompleted;

      if (migrationStatus === true) {
        console.log('ℹ️  Migration already completed for this user');
        return;
      }

      // Fallback: AsyncStorage kontrolü (eski cihazlar için)
      const migrationKey = `@firestore_migration_done_${userId}`;
      const asyncMigrationDone = await AsyncStorage.getItem(migrationKey);

      if (asyncMigrationDone === 'true') {
        console.log('ℹ️  Migration already done (AsyncStorage flag), updating Firestore...');
        await setDoc(userRef, { migrationCompleted: true, migratedAt: new Date().toISOString() }, { merge: true });
        return;
      }

      console.log('🔄 Starting AsyncStorage → Firestore migration...');

      // AsyncStorage'dan okumaları al
      const historyJson = await AsyncStorage.getItem('@reading_history');
      if (!historyJson) {
        console.log('ℹ️  No AsyncStorage data to migrate');
        await AsyncStorage.setItem(migrationKey, 'true');
        return;
      }

      const asyncReadings = JSON.parse(historyJson);
      if (!Array.isArray(asyncReadings) || asyncReadings.length === 0) {
        console.log('ℹ️  No readings to migrate');
        await AsyncStorage.setItem(migrationKey, 'true');
        return;
      }

      console.log(`📦 Found ${asyncReadings.length} readings in AsyncStorage`);

      // Batch ile Firestore'a kaydet
      let batch = writeBatch(firestore);
      let migratedCount = 0;

      for (const reading of asyncReadings) {
        try {
          const readingId = reading.id || doc(collection(firestore, this.COLLECTIONS.READINGS)).id;

          const firestoreReading: FirestoreReading = {
            id: readingId,
            userId,
            question: reading.question || '',
            cards: reading.cards || [],
            spreadType: reading.spreadType || { id: 'unknown', name: 'Unknown', positions: 0 },
            holisticInterpretation: reading.holisticInterpretation || '',
            cardDetails: reading.cardDetails || [],
            summary: reading.summary || '',
            createdAt: reading.timestamp
              ? Timestamp.fromMillis(reading.timestamp)
              : Timestamp.now(),
            isFavorite: reading.isFavorite || false,
          };

          const readingRef = doc(firestore, this.COLLECTIONS.READINGS, readingId);
          batch.set(readingRef, firestoreReading);
          migratedCount++;

          // Firestore batch limit (500 operations)
          if (migratedCount % 500 === 0) {
            await batch.commit();
            batch = writeBatch(firestore); // Yeni batch oluştur
            console.log(`✅ Migrated ${migratedCount} readings...`);
          }
        } catch (error) {
          console.error('⚠️  Failed to migrate reading:', reading.id, error);
        }
      }

      // Kalan readings'i commit et
      if (migratedCount % 500 !== 0) {
        await batch.commit();
      }

      console.log(`✅ Migration completed: ${migratedCount} readings migrated`);

      // Migration flag'i Firestore'a kaydet
      await setDoc(userRef, {
        migrationCompleted: true,
        migratedAt: new Date().toISOString()
      }, { merge: true });

      // Fallback: AsyncStorage'a da kaydet (eski cihazlar için)
      await AsyncStorage.setItem(migrationKey, 'true');

      // User stats güncelle
      await this.recalculateUserStats(userId);
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  }

  /**
   * User stats yeniden hesapla (migration sonrası)
   * @param userId - User ID
   */
  private async recalculateUserStats(userId: string): Promise<void> {
    try {
      const readings = await this.getReadingHistory(1000);
      const favoriteCount = readings.filter((r) => r.isFavorite).length;

      const userRef = doc(firestore, this.COLLECTIONS.USERS, userId);
      await setDoc(
        userRef,
        {
          stats: {
            totalReadings: readings.length,
            favoriteReadings: favoriteCount,
            streakDays: 0, // Streak hesaplaması ileride yapılabilir
            lastReadingDate:
              readings.length > 0
                ? readings[0].createdAt.toDate().toISOString()
                : null,
          },
        },
        { merge: true }
      );

      console.log('✅ User stats recalculated after migration');
    } catch (error) {
      console.error('❌ Failed to recalculate stats:', error);
    }
  }

  // ========================================
  // USER PREFERENCES MANAGEMENT
  // ========================================

  /**
   * Kullanıcı tercihlerini getir
   * @returns UserPreferences verisi
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          notifications: true,
          dailyReminder: true,
          autoSave: true,
        };
      }

      const userRef = doc(firestore, this.COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          notifications: data.preferences?.notifications ?? true,
          dailyReminder: data.preferences?.dailyReminder ?? true,
          autoSave: data.preferences?.autoSave ?? true,
        };
      }

      return {
        notifications: true,
        dailyReminder: true,
        autoSave: true,
      };
    } catch (error) {
      console.error('❌ Failed to get user preferences:', error);
      return {
        notifications: true,
        dailyReminder: true,
        autoSave: true,
      };
    }
  }

  /**
   * Kullanıcı tercihlerini kaydet
   * @param preferences - Kaydedilecek tercihler
   */
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const userRef = doc(firestore, this.COLLECTIONS.USERS, userId);
      await setDoc(
        userRef,
        {
          preferences: {
            ...preferences,
            updatedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );

      console.log('✅ User preferences saved to Firestore');
    } catch (error) {
      console.error('❌ Failed to save user preferences:', error);
      throw error;
    }
  }
}

// Singleton instance
const firestoreService = new FirestoreService();
export default firestoreService;
