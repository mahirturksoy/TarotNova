// app/types/navigation.ts

import { SpreadType } from '../constants/spreadTypes';
import { ReadingHistoryItem } from '../services/readingHistoryService';

// Ana Stack Navigator'ımızın doğrudan yönettiği ekranlar.
export type RootStackParamList = {
  Main: { screen?: keyof TabParamList }; // Tab'lar arası geçişi kolaylaştırmak için opsiyonel parametre
  SpreadSelection: { question: string; mood: string };
  CardSelection: { 
    question: string; 
    mood: string; 
    spreadType: SpreadType; 
  };
  Reading: undefined;
  ReadingDetail: { reading: ReadingHistoryItem };
  Auth: undefined;
};

// Alt Tab Navigator'ımızın yönettiği ekranlar.
export type TabParamList = {
  "Ana Sayfa": undefined;
  "Geçmiş": undefined;
  "Favoriler": undefined;
  "Profil": undefined;
};