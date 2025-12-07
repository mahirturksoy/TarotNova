/**
 * Notification Configuration
 * Bildirim zamanlamaları ve ayarları için merkezi config
 */

export const NOTIFICATION_CONFIG = {
  // Bildirim zamanlamaları
  DAILY_REMINDER: {
    HOUR: 20, // Akşam 8:00
    MINUTE: 0,
    IDENTIFIER: 'daily-reminder-8pm',
  },

  MORNING_MESSAGE: {
    HOUR: 9, // Sabah 9:00
    MINUTE: 0,
    IDENTIFIER: 'morning-message-9am',
  },

  // Sabah mesajları (random seçilir)
  MORNING_MESSAGES: [
    'Bugün senin için harika bir gün olacak! ✨',
    'Evren bugün senin yanında 🌙',
    'Yeni bir gün, yeni fırsatlar ☀️',
    'Bugün kendine iyilik yap 💫',
    'Kartlar bugün sana özel mesajlar taşıyor 🔮',
  ],

  // Android channel ayarları
  ANDROID_CHANNEL: {
    ID: 'default',
    NAME: 'TarotNova Bildirimleri',
    VIBRATION_PATTERN: [0, 250, 250, 250],
    LIGHT_COLOR: '#d4af37', // Altın rengi
  },
} as const;
