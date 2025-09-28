// React Navigation için tip tanımlamaları

import { SpreadType } from '../constants/spreadTypes';
import { ReadingHistoryItem } from '../services/readingHistoryService';

// Stack Navigator'ın parametre listesi
export type RootStackParamList = {
  Home: undefined;
  SpreadSelection: { question: string; mood: string };
  CardSelection: { 
    question: string; 
    mood: string; 
    spreadType?: SpreadType;
  };
  Reading: undefined;
  ReadingHistory: undefined;
  ReadingDetail: { reading: ReadingHistoryItem };
  Reflection: { reading: ReadingHistoryItem }; // YENİ - Yansıtma ekranı
  Achievements: undefined; // YENİ - Başarımlar ekranı
};

// Navigation prop'ları için tip
export type NavigationProps = {
  navigation: {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
    goBack: () => void;
  };
};