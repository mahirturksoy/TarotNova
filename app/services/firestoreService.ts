// app/services/firestoreService.ts

import { auth, firestore } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestoreModule, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// React Native Firebase native SDK kullanıyoruz
// FieldValue ve Timestamp doğrudan modülden alınıyor

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
  createdAt: FirebaseFirestoreTypes.Timestamp;
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

      // Yeni reading ID oluştur (native SDK)
      const readingRef = firestore.collection(this.COLLECTIONS.READINGS).doc();
      const readingId = readingRef.id;

      const readingData: FirestoreReading = {
        id: readingId,
        userId,
        ...reading,
        createdAt: firestoreModule.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      };

      // Firestore'a kaydet (native SDK)
      await readingRef.set(readingData);

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

      // Native SDK query
      const querySnapshot = await firestore
        .collection(this.COLLECTIONS.READINGS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();

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

      // Native SDK query
      const querySnapshot = await firestore
        .collection(this.COLLECTIONS.READINGS)
        .where('userId', '==', userId)
        .where('isFavorite', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

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

      // Native SDK
      const readingRef = firestore.collection(this.COLLECTIONS.READINGS).doc(readingId);
      const docSnap = await readingRef.get();
      const readingData = docSnap.data();

      if (!readingData) {
        console.warn(`⚠️  Reading not found: ${readingId}`);
        return null;
      }

      const reading = readingData as FirestoreReading;

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

      // Sil (Native SDK)
      const readingRef = firestore.collection(this.COLLECTIONS.READINGS).doc(readingId);
      await readingRef.delete();

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

      // Favori durumunu güncelle (Native SDK)
      const readingRef = firestore.collection(this.COLLECTIONS.READINGS).doc(readingId);
      await readingRef.update({ isFavorite });

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

      // Batch delete (Firestore max 500 operations per batch) - Native SDK
      const batchSize = 500;

      for (let i = 0; i < readings.length; i += batchSize) {
        const batch = firestore.batch();
        const chunk = readings.slice(i, i + batchSize);

        chunk.forEach((reading) => {
          const readingRef = firestore.collection(this.COLLECTIONS.READINGS).doc(reading.id);
          batch.delete(readingRef);
        });

        await batch.commit();
        console.log(`✅ Deleted batch: ${Math.min(i + batchSize, readings.length)}/${readings.length}`);
      }

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

      // Native SDK
      const userRef = firestore.collection(this.COLLECTIONS.USERS).doc(userId);
      const docSnap = await userRef.get();
      const userData = docSnap.data();

      if (userData) {
        return {
          totalReadings: userData?.stats?.totalReadings || 0,
          favoriteReadings: userData?.stats?.favoriteReadings || 0,
          streakDays: userData?.stats?.streakDays || 0,
          lastReadingDate: userData?.stats?.lastReadingDate,
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
      // Native SDK kullanımı
      await firestore.collection(this.COLLECTIONS.USERS).doc(userId).set(
        {
          uid: userId,
          stats: {
            totalReadings: 0,
            favoriteReadings: 0,
            streakDays: 0,
            lastReadingDate: null,
          },
          createdAt: firestoreModule.FieldValue.serverTimestamp(),
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
      const userRef = firestore.collection(this.COLLECTIONS.USERS).doc(userId);
      const docSnap = await userRef.get();

      // User document yoksa oluştur
      if (!docSnap.data()) {
        await this.initializeUserDocument(userId);
      }

      // Atomic increment kullan (native SDK - race condition'ı önler)
      await userRef.set(
        {
          stats: {
            [statKey]: firestoreModule.FieldValue.increment(1),
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
      // Native SDK
      const userRef = firestore.collection(this.COLLECTIONS.USERS).doc(userId);
      const docSnap = await userRef.get();

      if (!docSnap.data()) {
        console.warn('⚠️ User document does not exist, cannot decrement stats');
        return;
      }

      // Atomic decrement kullan (race condition'ı önler)
      await userRef.set(
        {
          stats: {
            [statKey]: firestoreModule.FieldValue.increment(-1),
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
      // Native SDK
      const userRef = firestore.collection(this.COLLECTIONS.USERS).doc(userId);
      await userRef.set(
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

      // Migration flag kontrolü (Firestore'dan) - Native SDK
      const userRef = firestore.collection(this.COLLECTIONS.USERS).doc(userId);
      const userDoc = await userRef.get();
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
        await userRef.set({ migrationCompleted: true, migratedAt: new Date().toISOString() }, { merge: true });
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

      // Batch ile Firestore'a kaydet - Native SDK
      let batch = firestore.batch();
      let migratedCount = 0;

      for (const reading of asyncReadings) {
        try {
          const readingId = reading.id || firestore.collection(this.COLLECTIONS.READINGS).doc().id;

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
              ? firestoreModule.Timestamp.fromMillis(reading.timestamp)
              : firestoreModule.Timestamp.now(),
            isFavorite: reading.isFavorite || false,
          };

          const readingRef = firestore.collection(this.COLLECTIONS.READINGS).doc(readingId);
          batch.set(readingRef, firestoreReading);
          migratedCount++;

          // Firestore batch limit (500 operations)
          if (migratedCount % 500 === 0) {
            await batch.commit();
            batch = firestore.batch(); // Yeni batch oluştur
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
      await userRef.set({
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

      // Native SDK
      const userRef = firestore.collection(this.COLLECTIONS.USERS).doc(userId);
      await userRef.set(
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

      // Native SDK
      const userRef = firestore.collection(this.COLLECTIONS.USERS).doc(userId);
      const docSnap = await userRef.get();
      const userData = docSnap.data();

      if (userData) {
        return {
          notifications: userData?.preferences?.notifications ?? true,
          dailyReminder: userData?.preferences?.dailyReminder ?? true,
          autoSave: userData?.preferences?.autoSave ?? true,
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

      // Native SDK
      const userRef = firestore.collection(this.COLLECTIONS.USERS).doc(userId);
      await userRef.set(
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
