// app/context/ReadingContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getAIPoweredReading } from '../services/tarotAPIService';
import { SpreadType } from '../constants/spreadTypes';

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

export interface CurrentReading {
  question: string;
  mood: string;
  selectedCards: string[];
  spreadType?: SpreadType;
}

export interface ReadingContextType {
  currentReading: CurrentReading | null;
  holisticInterpretation: string | null;
  cardDetails: CardDetail[] | null;
  lifeAspects: LifeAspects | null;
  summary: string | null;
  confidence: number | null;
  isLoading: boolean;
  error: string | null;
  generateReading: (
    question: string, 
    mood: string, 
    selectedCards: string[],
    spreadType?: SpreadType
  ) => Promise<void>;
  clearReading: () => void;
}

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

export const useReadingContext = () => {
  const context = useContext(ReadingContext);
  if (!context) {
    throw new Error('useReadingContext must be used within a ReadingProvider');
  }
  return context;
};

interface ReadingProviderProps {
  children: ReactNode;
}

export const ReadingProvider: React.FC<ReadingProviderProps> = ({ children }) => {
  const [currentReading, setCurrentReading] = useState<CurrentReading | null>(null);
  const [holisticInterpretation, setHolisticInterpretation] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetail[] | null>(null);
  const [lifeAspects, setLifeAspects] = useState<LifeAspects | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReading = async (
    question: string, 
    mood: string, 
    selectedCards: string[],
    spreadType?: SpreadType
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mevcut okumayı kaydet
      setCurrentReading({
        question,
        mood,
        selectedCards,
        spreadType
      });

      // tarotAPIService'den veri al
      const result = await getAIPoweredReading(question, mood, selectedCards, spreadType);
      
      // TarotReading tipinden ReadingContext'e uygun formata dönüştür
      setHolisticInterpretation(result.holisticInterpretation);
      setCardDetails(result.cardDetails);
      setLifeAspects(result.lifeAspects);
      setSummary(result.summary);
      setConfidence(result.confidence);
    } catch (err) {
      console.error('Okuma oluşturma hatası:', err);
      setError('Okuma oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearReading = () => {
    setCurrentReading(null);
    setHolisticInterpretation(null);
    setCardDetails(null);
    setLifeAspects(null);
    setSummary(null);
    setConfidence(null);
    setError(null);
  };

  const contextValue: ReadingContextType = {
    currentReading,
    holisticInterpretation,
    cardDetails,
    lifeAspects,
    summary,
    confidence,
    isLoading,
    error,
    generateReading,
    clearReading
  };

  return (
    <ReadingContext.Provider value={contextValue}>
      {children}
    </ReadingContext.Provider>
  );
};