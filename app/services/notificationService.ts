import * as Notifications from 'expo-notifications';
import type { DailyTriggerInput } from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { auth, firestore } from '../config/firebaseConfig';
// Web SDK import kaldırıldı - Native SDK kullanılıyor
import Constants from 'expo-constants';
import { NOTIFICATION_CONFIG } from '../config/notificationConfig';

// Bildirim davranışı (uygulama açıkken ne olsun)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Bildirim göster
    shouldPlaySound: true, // Ses çal
    shouldSetBadge: false, // Badge güncelleme (iOS)
  }),
});

class NotificationService {
  // Notification identifier'ları (config'den)
  private readonly NOTIFICATION_IDS = {
    DAILY_REMINDER: NOTIFICATION_CONFIG.DAILY_REMINDER.IDENTIFIER,
    MORNING_MESSAGE: NOTIFICATION_CONFIG.MORNING_MESSAGE.IDENTIFIER,
  };

  // Token cache (gereksiz Firestore yazmasını önler)
  private lastSavedToken: string | null = null;

  /**
   * Push notification izinlerini iste ve Expo push token al
   * ProfileScreen'de çağrılır
   */
  async registerForPushNotifications(): Promise<string | null> {
    // Sadece gerçek cihazlarda çalışır
    if (!Device.isDevice) {
      console.warn('⚠️  Push notifications only work on physical devices');
      return null;
    }

    try {
      // Mevcut izin durumunu kontrol et
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // İzin yoksa kullanıcıdan iste
      if (existingStatus !== 'granted') {
        console.log('📱 Requesting notification permission...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️  Notification permission denied');
        return null;
      }

      console.log('✅ Notification permission granted');

      // Expo push token al (gelecekte push notification göndermek için)
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.warn('⚠️  EAS project ID not found, skipping token registration');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      const token = tokenData.data;
      console.log('✅ Expo push token:', token);

      // Android için notification channel oluştur (zorunlu Android 8.0+)
      if (Platform.OS === 'android') {
        await this.setupAndroidChannel();
      }

      // Token'ı Firestore'a kaydet (ileride kampanya bildirimleri için)
      await this.saveTokenToFirestore(token);

      return token;
    } catch (error) {
      console.error('❌ Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * Android notification channel oluştur
   * Android 8.0+ (API 26+) zorunludur
   */
  private async setupAndroidChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      const config = NOTIFICATION_CONFIG.ANDROID_CHANNEL;
      await Notifications.setNotificationChannelAsync(config.ID, {
        name: config.NAME,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [...config.VIBRATION_PATTERN], // Spread to convert readonly to mutable
        lightColor: config.LIGHT_COLOR,
        sound: 'default',
      });

      console.log('✅ Android notification channel created');
    } catch (error) {
      console.error('❌ Failed to create Android channel:', error);
    }
  }

  /**
   * Expo push token'ı Firestore'a kaydet
   * İleride kampanya bildirimleri için kullanılabilir
   * Cache mekanizması: Aynı token tekrar yazılmaz (Firestore cost optimization)
   */
  private async saveTokenToFirestore(token: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('⚠️  Cannot save token: No user logged in');
        return;
      }

      // Token değişmediyse Firestore'a yazmayı skip et
      if (this.lastSavedToken === token) {
        console.log('ℹ️  Token already saved, skipping Firestore write');
        return;
      }

      // Native SDK kullanımı
      const userRef = firestore.collection('users').doc(currentUser.uid);

      await userRef.set(
        {
          notificationTokens: {
            [Platform.OS]: token,
            updatedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );

      // Cache'i güncelle
      this.lastSavedToken = token;

      console.log('✅ Notification token saved to Firestore');
    } catch (error) {
      console.error('❌ Failed to save notification token:', error);
    }
  }

  /**
   * Günlük hatırlatıcı zamanla (her gün saat 20:00)
   * ProfileScreen'de kullanıcı toggle'ı açtığında çağrılır
   */
  async scheduleDailyReminder(enabled: boolean): Promise<void> {
    try {
      // Sadece daily reminder'ı iptal et (selective cancellation)
      await Notifications.cancelScheduledNotificationAsync(this.NOTIFICATION_IDS.DAILY_REMINDER);

      if (!enabled) {
        console.log('ℹ️  Daily reminders disabled');
        // Morning message'ı da iptal et (birlikte kullanılıyorlar)
        await Notifications.cancelScheduledNotificationAsync(this.NOTIFICATION_IDS.MORNING_MESSAGE);
        return;
      }

      // Günlük bildirim (saat config'den)
      const reminderConfig = NOTIFICATION_CONFIG.DAILY_REMINDER;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✨ Günlük Tarot Zamanı',
          body: 'Bugün için kartlarınız sizi bekliyor. Hadi bir okuma yapalım!',
          data: { type: 'daily_reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminderConfig.HOUR,
          minute: reminderConfig.MINUTE,
          repeats: true, // Her gün tekrarla
        } as DailyTriggerInput,
        identifier: this.NOTIFICATION_IDS.DAILY_REMINDER,
      });

      console.log(`✅ Daily reminder scheduled for ${reminderConfig.HOUR}:${String(reminderConfig.MINUTE).padStart(2, '0')}`);

      // Sabah mesajı da ekle (09:00)
      await this.scheduleMorningMessage(true);
    } catch (error) {
      console.error('❌ Failed to schedule daily reminder:', error);
    }
  }

  /**
   * Sabah motivasyon bildirimi (her gün saat 09:00)
   * Günlük hatırlatıcı ile birlikte kullanılır
   */
  async scheduleMorningMessage(enabled: boolean): Promise<void> {
    try {
      // Önce mevcut morning message'ı iptal et
      await Notifications.cancelScheduledNotificationAsync(this.NOTIFICATION_IDS.MORNING_MESSAGE);

      if (!enabled) {
        console.log('ℹ️  Morning message disabled');
        return;
      }

      // Random mesaj seç (config'den)
      const messages = NOTIFICATION_CONFIG.MORNING_MESSAGES;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const morningConfig = NOTIFICATION_CONFIG.MORNING_MESSAGE;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Günaydın',
          body: randomMessage,
          data: { type: 'morning_message' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: morningConfig.HOUR,
          minute: morningConfig.MINUTE,
          repeats: true, // Her gün tekrarla
        } as DailyTriggerInput,
        identifier: this.NOTIFICATION_IDS.MORNING_MESSAGE,
      });

      console.log(`✅ Morning message scheduled for ${String(morningConfig.HOUR).padStart(2, '0')}:${String(morningConfig.MINUTE).padStart(2, '0')}`);
    } catch (error) {
      console.error('❌ Failed to schedule morning message:', error);
    }
  }

  /**
   * Anlık bildirim gönder (test için)
   * Development'ta kullanılır
   */
  async sendImmediateNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'immediate' },
          sound: true,
        },
        trigger: null, // null = hemen gönder
      });

      console.log('✅ Immediate notification sent');
    } catch (error) {
      console.error('❌ Failed to send immediate notification:', error);
    }
  }

  /**
   * Tüm zamanlanmış bildirimleri iptal et
   * Kullanıcı bildirimleri kapatırsa çağrılır
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ All scheduled notifications cancelled');
    } catch (error) {
      console.error('❌ Failed to cancel notifications:', error);
    }
  }

  /**
   * Zamanlanmış bildirimleri listele (debug için)
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📋 Scheduled notifications:', scheduled.length);
      return scheduled;
    } catch (error) {
      console.error('❌ Failed to get scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Notification listener'ları kur
   * App.tsx'de kullanılır
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ): () => void {
    const receivedSubscription = onNotificationReceived
      ? Notifications.addNotificationReceivedListener(onNotificationReceived)
      : null;

    const responseSubscription = onNotificationResponse
      ? Notifications.addNotificationResponseReceivedListener(onNotificationResponse)
      : null;

    // Cleanup function
    return () => {
      receivedSubscription?.remove();
      responseSubscription?.remove();
    };
  }

  /**
   * Permission durumunu kontrol et
   * Settings'te göstermek için kullanılabilir
   */
  async checkPermissionStatus(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Failed to check permission status:', error);
      return false;
    }
  }
}

// Singleton instance
const notificationService = new NotificationService();
export default notificationService;
