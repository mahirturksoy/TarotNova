import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getAIPoweredReading, TarotReading } from '../services/tarotAPIService';
import { SpreadType } from '../constants/spreadTypes';
import { saveReadingToHistory } from '../services/readingHistoryService';

// Context için state türleri tanımı
interface ReadingContextState {
  isLoading: boolean;
  readingResult: TarotReading | null;
  error: string | null;
  currentSpread: SpreadType | null;
  lastQuestion: string;
  lastMood: string;
  lastCards: string[];
}

// Context için actions (eylemler) türleri tanımı
interface ReadingContextActions {
  generateReading: (question: string, mood: string, cards: string[], spreadType?: SpreadType) => Promise<void>;
  clearReading: () => void;
  clearError: () => void;
  setCurrentSpread: (spread: SpreadType | null) => void;
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
 * ReadingProvider bileşeni - Okuma geçmişi kaydetme ile güncellenmiş versiyon
 */
export const ReadingProvider: React.FC<ReadingProviderProps> = ({ children }) => {
  // Ana state değişkenleri
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [readingResult, setReadingResult] = useState<TarotReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSpread, setCurrentSpread] = useState<SpreadType | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string>('');
  const [lastMood, setLastMood] = useState<string>('');
  const [lastCards, setLastCards] = useState<string[]>([]);

  /**
   * Tarot okuması oluşturma fonksiyonu - Spread desteği ve geçmiş kayıt sistemi ile
   */
  const generateReading = async (
    question: string, 
    mood: string, 
    cards: string[],
    spreadType?: SpreadType
  ): Promise<void> => {
    try {
      console.log('Tarot okuması başlatılıyor...', { 
        question, 
        mood, 
        cards, 
        spreadType: spreadType?.name 
      });
      
      // Loading durumunu aktif et ve önceki hataları temizle
      setIsLoading(true);
      setError(null);
      setReadingResult(null);
      
      // Son okuma bilgilerini kaydet (geçmiş sistemi için)
      setLastQuestion(question);
      setLastMood(mood);
      setLastCards(cards);
      
      // Aktif spread'i kaydet
      if (spreadType) {
        setCurrentSpread(spreadType);
      }

      // API servisini çağır (spread bilgisi ile)
      const result = await getAIPoweredReading(question, mood, cards, spreadType);
      
      console.log('Tarot okuması başarıyla tamamlandı:', result.readingTitle);
      
      // Başarılı sonucu state'e kaydet
      setReadingResult(result);
      
      // Okuma geçmişine otomatik kaydet
      try {
        await saveReadingToHistory(result, question, mood, cards, spreadType || null);
        console.log('Okuma geçmişe başarıyla kaydedildi');
      } catch (historyError) {
        console.error('Geçmiş kaydetme hatası (ana işlemi etkilemez):', historyError);
        // Geçmiş kaydetme hatası ana okuma işlemini durdurmaz
      }
      
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
   * Okuma sonuçlarını ve tüm ilgili verileri temizleme fonksiyonu
   */
  const clearReading = (): void => {
    setReadingResult(null);
    setError(null);
    setIsLoading(false);
    setCurrentSpread(null);
    setLastQuestion('');
    setLastMood('');
    setLastCards([]);
    console.log('Tarot okuması ve tüm veriler temizlendi');
  };

  /**
   * Sadece hata durumunu temizleme fonksiyonu
   */
  const clearError = (): void => {
    setError(null);
    console.log('Hata mesajı temizlendi');
  };

  /**
   * Aktif spread ayarlama fonksiyonu
   */
  const handleSetCurrentSpread = (spread: SpreadType | null): void => {
    setCurrentSpread(spread);
    console.log('Aktif spread ayarlandı:', spread?.name || 'temizlendi');
  };

  // Context value objesi - tüm state ve actions'ları içerir
  const contextValue: ReadingContextType = {
    // State değerleri
    isLoading,
    readingResult,
    error,
    currentSpread,
    lastQuestion,
    lastMood,
    lastCards,
    
    // Action fonksiyonları
    generateReading,
    clearReading,
    clearError,
    setCurrentSpread: handleSetCurrentSpread,
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
 */
export default ReadingContext;