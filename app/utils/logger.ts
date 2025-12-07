/**
 * Logger Utility
 * Production'da console.log'ları otomatik disable eder
 * Development'ta renkli ve kategorize log'lar sağlar
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = __DEV__;

  /**
   * Genel log
   */
  log(...args: any[]): void {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Bilgi mesajı (✅ ile)
   */
  info(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('✅', ...args);
    }
  }

  /**
   * Uyarı mesajı (⚠️ ile)
   */
  warn(...args: any[]): void {
    if (this.isDevelopment) {
      console.warn('⚠️', ...args);
    }
  }

  /**
   * Hata mesajı (❌ ile) - Production'da da gösterilir
   */
  error(...args: any[]): void {
    console.error('❌', ...args);
  }

  /**
   * Debug mesajı (🔍 ile)
   */
  debug(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('🔍', ...args);
    }
  }

  /**
   * Başarı mesajı (✨ ile)
   */
  success(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('✨', ...args);
    }
  }
}

// Singleton instance
const logger = new Logger();
export default logger;
