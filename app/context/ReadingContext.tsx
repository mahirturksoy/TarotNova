import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getAIPoweredReading, TarotReading } from '../services/tarotAPIService';

// Context için state türleri tanımı
interface ReadingContextState {
  isLoading: boolean;
  readingResult: TarotReading | null;
  error: string | null;
}

// Context için actions (eylemler) türleri tanımı
interface ReadingContextActions {
  generateReading: (question: string, mood: string, cards: string[]) => Promise<void>;
  clearReading: () => void;
  clearError: () => void;
}

// Birleşik context türü
interface ReadingContextType extends ReadingContextState, ReadingContextActions {}

// Context oluşturma (başlangıç değeri undefined)
const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

// Provider bileşeni için props türü
interface ReadingProviderProps {
  children: ReactNode;
}

/**
 * ReadingProvider bileşeni - Tüm uygulamayı saracak state provider
 * Tarot okuma durumunu ve işlemlerini yönetir
 */
export const ReadingProvider: React.FC<ReadingProviderProps> = ({ children }) => {
  // Ana state değişkenleri
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [readingResult, setReadingResult] = useState<TarotReading | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Tarot okuması oluşturma fonksiyonu
   * API servisini çağırır ve sonuçları state'e kaydeder
   */
  const generateReading = async (
    question: string, 
    mood: string, 
    cards: string[]
  ): Promise<void> => {
    try {
      console.log('Tarot okuması başlatılıyor...', { question, mood, cards });
      
      // Loading durumunu aktif et ve önceki hataları temizle
      setIsLoading(true);
      setError(null);
      setReadingResult(null);

      // API servisini çağır (mock data döndürür)
      const result = await getAIPoweredReading(question, mood, cards);
      
      console.log('Tarot okuması başarıyla tamamlandı:', result.readingTitle);
      
      // Başarılı sonucu state'e kaydet
      setReadingResult(result);
      
    } catch (err) {
      // Hata durumunu yakalama ve loglama
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Tarot okuması sırasında bilinmeyen bir hata oluştu';
        
      console.error('Tarot okuması hatası:', errorMessage);
      setError(errorMessage);
      setReadingResult(null);
      
    } finally {
      // Her durumda loading durumunu sonlandır
      setIsLoading(false);
    }
  };

  /**
   * Okuma sonuçlarını temizleme fonksiyonu
   * Yeni okuma öncesi state'i sıfırlar
   */
  const clearReading = (): void => {
    setReadingResult(null);
    setError(null);
    setIsLoading(false);
    console.log('Tarot okuması temizlendi');
  };

  /**
   * Sadece hata durumunu temizleme fonksiyonu
   * Kullanıcı hata mesajını kapatmak istediğinde kullanılır
   */
  const clearError = (): void => {
    setError(null);
    console.log('Hata mesajı temizlendi');
  };

  // Context value objesi - tüm state ve actions'ları içerir
  const contextValue: ReadingContextType = {
    // State değerleri
    isLoading,
    readingResult,
    error,
    
    // Action fonksiyonları
    generateReading,
    clearReading,
    clearError,
  };

  return (
    <ReadingContext.Provider value={contextValue}>
      {children}
    </ReadingContext.Provider>
  );
};

/**
 * Custom hook - ReadingContext'i kullanmak için
 * Otomatik hata kontrolü ile birlikte gelir
 */
export const useReadingContext = (): ReadingContextType => {
  const context = useContext(ReadingContext);
  
  // Context provider dışında kullanılırsa hata fırlat
  if (context === undefined) {
    throw new Error(
      'useReadingContext hook\'u ReadingProvider içinde kullanılmalıdır. ' +
      'Bileşeninizin ReadingProvider ile sarıldığından emin olun.'
    );
  }
  
  return context;
};

/**
 * Context'in varsayılan export'u
 * Genellikle useReadingContext hook'u tercih edilir
 */
export default ReadingContext;