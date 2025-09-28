import AsyncStorage from '@react-native-async-storage/async-storage';

// Yansıtma kayıtları için tip
export interface ReflectionEntry {
  id: string;
  readingId: string;
  userId?: string;
  createdAt: string;
  mood: 'enlightened' | 'confused' | 'peaceful' | 'motivated' | 'concerned';
  personalNote: string;
  insights: string[];
  actionPlan: string;
  helpfulness: number; // 1-5 rating
  resonance: number; // 1-5 rating
}

// Kaliteli başarımlar için tip
export interface QualityAchievement {
  id: string;
  name: string;
  description: string;
  category: 'reflection' | 'growth' | 'mindfulness' | 'sharing' | 'diversity';
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progress: number;
  target: number;
}

// Kişisel gelişim metrikleri
export interface PersonalGrowthMetrics {
  totalReflections: number;
  deepThinkingStreak: number;
  lastReflectionDate: string;
  averageHelpfulness: number;
  averageResonance: number;
  topInsightCategories: string[];
  growthTrends: {
    month: string;
    reflectionCount: number;
    qualityScore: number;
  }[];
}

// Storage keys
const STORAGE_KEYS = {
  REFLECTIONS: '@tarot_nova_reflections',
  ACHIEVEMENTS: '@tarot_nova_achievements',
  GROWTH_METRICS: '@tarot_nova_growth_metrics'
};

/**
 * Yansıtma kaydı oluşturma
 */
export const saveReflection = async (reflection: Omit<ReflectionEntry, 'id' | 'createdAt'>): Promise<void> => {
  try {
    const existingReflections = await getReflections();
    
    const newReflection: ReflectionEntry = {
      ...reflection,
      id: generateReflectionId(),
      createdAt: new Date().toISOString()
    };
    
    const updatedReflections = [newReflection, ...existingReflections];
    
    // Son 200 yansıtmayı sakla
    const trimmedReflections = updatedReflections.slice(0, 200);
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.REFLECTIONS,
      JSON.stringify(trimmedReflections)
    );
    
    // Başarımları kontrol et
    await checkAndUnlockAchievements(newReflection);
    
    // Kişisel gelişim metriklerini güncelle
    await updateGrowthMetrics(newReflection);
    
    console.log('Yansıtma kaydedildi:', newReflection.id);
    
  } catch (error) {
    console.error('Yansıtma kaydedilemedi:', error);
    throw error;
  }
};

/**
 * Tüm yansıtmaları getir
 */
export const getReflections = async (): Promise<ReflectionEntry[]> => {
  try {
    const reflectionsJson = await AsyncStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    return reflectionsJson ? JSON.parse(reflectionsJson) : [];
  } catch (error) {
    console.error('Yansıtmalar alınamadı:', error);
    return [];
  }
};

/**
 * Belirli bir okuma için yansıtma getir
 */
export const getReflectionForReading = async (readingId: string): Promise<ReflectionEntry | null> => {
  try {
    const reflections = await getReflections();
    return reflections.find(r => r.readingId === readingId) || null;
  } catch (error) {
    console.error('Okuma yansıtması alınamadı:', error);
    return null;
  }
};

/**
 * Kaliteli başarımları başlat
 */
export const initializeAchievements = async (): Promise<void> => {
  try {
    const existingAchievements = await getAchievements();
    
    if (existingAchievements.length === 0) {
      const defaultAchievements: QualityAchievement[] = [
        {
          id: 'first_reflection',
          name: 'İlk Yansıtma',
          description: 'İlk derin düşünce notunu yazdın',
          category: 'reflection',
          icon: '🤔',
          isUnlocked: false,
          progress: 0,
          target: 1
        },
        {
          id: 'deep_thinker',
          name: 'Derin Düşünür',
          description: '10 okuma için detaylı yansıtma yaptın',
          category: 'reflection',
          icon: '🧠',
          isUnlocked: false,
          progress: 0,
          target: 10
        },
        {
          id: 'self_aware',
          name: 'Öz-Farkındalık',
          description: 'Kişisel gelişim kategorisinde 5 okuma yaptın',
          category: 'growth',
          icon: '🌱',
          isUnlocked: false,
          progress: 0,
          target: 5
        },
        {
          id: 'consistent_growth',
          name: 'Tutarlı Gelişim',
          description: '4 hafta boyunca her hafta en az 1 yansıtma',
          category: 'mindfulness',
          icon: '📈',
          isUnlocked: false,
          progress: 0,
          target: 4
        },
        {
          id: 'quality_seeker',
          name: 'Kalite Arayıcısı',
          description: 'Ortalama yardımcılık puanın 4.0 üstünde',
          category: 'growth',
          icon: '⭐',
          isUnlocked: false,
          progress: 0,
          target: 1
        },
        {
          id: 'insight_collector',
          name: 'İçgörü Koleksiyoncusu',
          description: '25 farklı içgörü keşfettin',
          category: 'mindfulness',
          icon: '💡',
          isUnlocked: false,
          progress: 0,
          target: 25
        },
        {
          id: 'spread_explorer',
          name: 'Çeşitlilik Uzmanı',
          description: 'Tüm spread türlerini deneyimledin',
          category: 'diversity',
          icon: '🗂️',
          isUnlocked: false,
          progress: 0,
          target: 4
        },
        {
          id: 'mindful_sharer',
          name: 'Bilinçli Paylaşımcı',
          description: 'Anlamlı anlarda 5 okuma paylaştın',
          category: 'sharing',
          icon: '🤝',
          isUnlocked: false,
          progress: 0,
          target: 5
        }
      ];
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(defaultAchievements)
      );
    }
  } catch (error) {
    console.error('Başarımlar başlatılamadı:', error);
  }
};

/**
 * Başarımları getir
 */
export const getAchievements = async (): Promise<QualityAchievement[]> => {
  try {
    const achievementsJson = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return achievementsJson ? JSON.parse(achievementsJson) : [];
  } catch (error) {
    console.error('Başarımlar alınamadı:', error);
    return [];
  }
};

/**
 * Yeni başarımları kontrol et ve aç
 */
const checkAndUnlockAchievements = async (newReflection: ReflectionEntry): Promise<string[]> => {
  try {
    const achievements = await getAchievements();
    const reflections = await getReflections();
    const unlockedAchievements: string[] = [];
    
    for (const achievement of achievements) {
      if (achievement.isUnlocked) continue;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_reflection':
          shouldUnlock = reflections.length >= 1;
          achievement.progress = reflections.length;
          break;
          
        case 'deep_thinker':
          const detailedReflections = reflections.filter(r => 
            r.personalNote.length > 50 && r.insights.length > 0
          );
          achievement.progress = detailedReflections.length;
          shouldUnlock = detailedReflections.length >= 10;
          break;
          
        case 'quality_seeker':
          const avgHelpfulness = reflections.reduce((sum, r) => sum + r.helpfulness, 0) / reflections.length;
          achievement.progress = Math.round(avgHelpfulness * 10) / 10;
          shouldUnlock = avgHelpfulness >= 4.0 && reflections.length >= 5;
          break;
          
        case 'insight_collector':
          const allInsights = reflections.flatMap(r => r.insights);
          const uniqueInsights = [...new Set(allInsights)];
          achievement.progress = uniqueInsights.length;
          shouldUnlock = uniqueInsights.length >= 25;
          break;
      }
      
      if (shouldUnlock) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        unlockedAchievements.push(achievement.name);
      }
    }
    
    if (unlockedAchievements.length > 0) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(achievements)
      );
    }
    
    return unlockedAchievements;
    
  } catch (error) {
    console.error('Başarımlar kontrol edilemedi:', error);
    return [];
  }
};

/**
 * Kişisel gelişim metriklerini güncelle
 */
const updateGrowthMetrics = async (newReflection: ReflectionEntry): Promise<void> => {
  try {
    const currentMetrics = await getGrowthMetrics();
    const reflections = await getReflections();
    
    const avgHelpfulness = reflections.reduce((sum, r) => sum + r.helpfulness, 0) / reflections.length;
    const avgResonance = reflections.reduce((sum, r) => sum + r.resonance, 0) / reflections.length;
    
    // İçgörü kategorilerini analiz et
    const insightCategories = reflections.flatMap(r => r.insights);
    const categoryFreq: Record<string, number> = {};
    
    insightCategories.forEach(insight => {
      const category = categorizeInsight(insight);
      categoryFreq[category] = (categoryFreq[category] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
    
    const updatedMetrics: PersonalGrowthMetrics = {
      totalReflections: reflections.length,
      deepThinkingStreak: calculateReflectionStreak(reflections),
      lastReflectionDate: newReflection.createdAt,
      averageHelpfulness: Math.round(avgHelpfulness * 10) / 10,
      averageResonance: Math.round(avgResonance * 10) / 10,
      topInsightCategories: topCategories,
      growthTrends: calculateGrowthTrends(reflections)
    };
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.GROWTH_METRICS,
      JSON.stringify(updatedMetrics)
    );
    
  } catch (error) {
    console.error('Gelişim metrikleri güncellenemedi:', error);
  }
};

/**
 * Kişisel gelişim metriklerini getir
 */
export const getGrowthMetrics = async (): Promise<PersonalGrowthMetrics> => {
  try {
    const metricsJson = await AsyncStorage.getItem(STORAGE_KEYS.GROWTH_METRICS);
    
    if (metricsJson) {
      return JSON.parse(metricsJson);
    }
    
    return {
      totalReflections: 0,
      deepThinkingStreak: 0,
      lastReflectionDate: '',
      averageHelpfulness: 0,
      averageResonance: 0,
      topInsightCategories: [],
      growthTrends: []
    };
  } catch (error) {
    console.error('Gelişim metrikleri alınamadı:', error);
    return {
      totalReflections: 0,
      deepThinkingStreak: 0,
      lastReflectionDate: '',
      averageHelpfulness: 0,
      averageResonance: 0,
      topInsightCategories: [],
      growthTrends: []
    };
  }
};

/**
 * Helper functions
 */
const generateReflectionId = (): string => {
  return `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const categorizeInsight = (insight: string): string => {
  const lowerInsight = insight.toLowerCase();
  
  if (lowerInsight.includes('aşk') || lowerInsight.includes('ilişki') || lowerInsight.includes('sevgi')) {
    return 'İlişkiler';
  } else if (lowerInsight.includes('kariyer') || lowerInsight.includes('iş') || lowerInsight.includes('meslek')) {
    return 'Kariyer';
  } else if (lowerInsight.includes('aile') || lowerInsight.includes('dostluk') || lowerInsight.includes('sosyal')) {
    return 'Sosyal';
  } else if (lowerInsight.includes('kendini') || lowerInsight.includes('kişisel') || lowerInsight.includes('gelişim')) {
    return 'Kişisel Gelişim';
  } else if (lowerInsight.includes('sağlık') || lowerInsight.includes('fiziksel') || lowerInsight.includes('mental')) {
    return 'Sağlık';
  } else {
    return 'Genel';
  }
};

const calculateReflectionStreak = (reflections: ReflectionEntry[]): number => {
  if (reflections.length === 0) return 0;
  
  // Son 30 gün içindeki haftaları kontrol et
  const now = new Date();
  let streak = 0;
  
  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(now.getTime() - (week * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    const weekReflections = reflections.filter(r => {
      const reflectionDate = new Date(r.createdAt);
      return reflectionDate >= weekStart && reflectionDate < weekEnd;
    });
    
    if (weekReflections.length > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const calculateGrowthTrends = (reflections: ReflectionEntry[]): PersonalGrowthMetrics['growthTrends'] => {
  const trends: PersonalGrowthMetrics['growthTrends'] = [];
  const now = new Date();
  
  for (let month = 0; month < 6; month++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 1);
    const monthStr = monthDate.toISOString().slice(0, 7);
    
    const monthReflections = reflections.filter(r => 
      r.createdAt.startsWith(monthStr)
    );
    
    const qualityScore = monthReflections.length > 0 
      ? monthReflections.reduce((sum, r) => sum + (r.helpfulness + r.resonance) / 2, 0) / monthReflections.length
      : 0;
    
    trends.unshift({
      month: monthStr,
      reflectionCount: monthReflections.length,
      qualityScore: Math.round(qualityScore * 10) / 10
    });
  }
  
  return trends;
};