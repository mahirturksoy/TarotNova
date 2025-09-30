// app/types/navigation.ts

import type { NavigatorScreenParams } from '@react-navigation/native';
import { SpreadType } from '../constants/spreadTypes';
import { ReadingHistoryItem } from '../services/readingHistoryService';

// Stack Navigator içindeki ekranlar ve parametreleri
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
  Favorites: undefined; // <-- 1. EKLENEN SATIR
};

// Tab Navigator içindeki ekranlar ve parametreleri
export type TabParamList = {
  'Ana Sayfa': NavigatorScreenParams<RootStackParamList>;
  'Geçmiş': NavigatorScreenParams<RootStackParamList>;
  'Favoriler': NavigatorScreenParams<RootStackParamList>; // <-- 2. DEĞİŞEN SATIR
  'Profil': undefined;
};

// Tüm navigasyon hedeflerini birleştiren genel tip
export type AppParamList = RootStackParamList & TabParamList;