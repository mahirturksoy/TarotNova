// app/context/ReadingContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
// DEĞİŞİKLİK: Yeni API servisimizden hem fonksiyonu hem de yeni tip tanımını alıyoruz
import { generateTarotInterpretation, TarotAIResponse } from '../services/novaApiService'; 
import { SpreadType, SpreadPosition } from '../constants/spreadTypes';

export interface CardDetail {
  cardName: string;
  position: string;
  meaning: string;
  advice: string;
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
  summary: string | null;
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
  const [summary, setSummary] = useState<string | null>(null);
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
    setHolisticInterpretation(null);
    setCardDetails(null);
    setSummary(null);

    try {
      setCurrentReading({
        question,
        mood,
        selectedCards,
        spreadType
      });

      const payload = {
        question: question,
        mood: mood,
        spreadType: spreadType?.name || "Genel Açılım",
        cards: selectedCards.map((cardName, index) => ({
          cardName: cardName,
          position: spreadType?.positions[index]?.name || `Kart ${index + 1}`
        }))
      };

      // DEĞİŞİKLİK: Yeni servisimiz artık bize tüm yorumu içeren bir nesne veriyor.
      const aiResponse: TarotAIResponse = await generateTarotInterpretation(payload);
      
      // DEĞİŞİKLİK: Gelen yapılandırılmış veriyi state'lere kaydediyoruz.
      setHolisticInterpretation(aiResponse.holisticInterpretation);
      setCardDetails(aiResponse.cardDetails);
      setSummary(aiResponse.summary);
      
    } catch (err) {
      console.error('Okuma oluşturma hatası:', err);
      const errorMessage = err instanceof Error ? err.message : 'Okuma oluşturulurken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearReading = () => {
    setCurrentReading(null);
    setHolisticInterpretation(null);
    setCardDetails(null);
    setSummary(null);
    setError(null);
  };

  const contextValue: ReadingContextType = {
    currentReading,
    holisticInterpretation,
    cardDetails,
    summary,
    isLoading,
    error,
    generateReading,
    clearReading,
  };

  return (
    <ReadingContext.Provider value={contextValue}>
      {children}
    </ReadingContext.Provider>
  );
};