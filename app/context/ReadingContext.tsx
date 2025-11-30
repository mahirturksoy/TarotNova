// app/context/ReadingContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TarotAIResponse } from '../services/novaApiService';

export interface CardDetail {
  cardName: string;
  position: string;
  meaning: string;
  advice: string;
}

interface ReadingData {
  question: string;
  mood: string;
  // Basitleştirilmiş Spread Type (Service ile uyumlu)
  spreadType?: { id: string; name: string; cardCount: number }; 
  selectedCards: string[];
}

interface ReadingContextType {
  currentReading: ReadingData | null;
  holisticInterpretation: string | null;
  cardDetails: CardDetail[] | null;
  summary: string | null;
  isLoading: boolean;
  startNewReading: (data: ReadingData, response: TarotAIResponse) => void;
  generateReading: (question: string, mood: string, cards: string[], spreadType?: any) => Promise<void>; 
  setIsLoading: (loading: boolean) => void; 
}

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

export const ReadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentReading, setCurrentReading] = useState<ReadingData | null>(null);
  const [holisticInterpretation, setHolisticInterpretation] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetail[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startNewReading = (data: ReadingData, response: TarotAIResponse) => {
    setCurrentReading(data);
    setHolisticInterpretation(response.holisticInterpretation);
    setCardDetails(response.cardDetails);
    setSummary(response.summary);
    setIsLoading(false);
  };

  const generateReading = async (question: string, mood: string, cards: string[], spreadType?: any) => {
     console.warn("generateReading deprecated.");
  };

  return (
    <ReadingContext.Provider
      value={{
        currentReading,
        holisticInterpretation,
        cardDetails,
        summary,
        isLoading,
        startNewReading,
        generateReading,
        setIsLoading,
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
};

export const useReadingContext = () => {
  const context = useContext(ReadingContext);
  if (context === undefined) {
    throw new Error('useReadingContext must be used within a ReadingProvider');
  }
  return context;
};