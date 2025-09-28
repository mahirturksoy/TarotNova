// app/screens/AchievementsScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  getAchievements,
  getGrowthMetrics,
  initializeAchievements,
  QualityAchievement,
  PersonalGrowthMetrics
} from '../services/reflectionService';
import type { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

type AchievementsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Achievements'>;

const AchievementsScreen: React.FC = () => {
  const navigation = useNavigation<AchievementsScreenNavigationProp>();
  
  const [achievements, setAchievements] = useState<QualityAchievement[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<PersonalGrowthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Sayfa odaklandığında verileri yükle
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Başarımları başlat (ilk kez ise)
      await initializeAchievements();
      
      // Verileri yükle
      const [achievementsData, metricsData] = await Promise.all([
        getAchievements(),
        getGrowthMetrics()
      ]);
      
      setAchievements(achievementsData);
      setGrowthMetrics(metricsData);
      
    } catch (error) {
      console.error('Veriler yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Kategori filtresi
  const getFilteredAchievements = () => {
    if (activeCategory === 'all') return achievements;
    return achievements.filter(a => a.category === activeCategory);
  };

  // Başarım kartı render
  const renderAchievement = (achievement: QualityAchievement) => {
    const progressPercentage = (achievement.progress / achievement.target) * 100;
    const isCompleted = achievement.isUnlocked;

    return (
      <TouchableOpacity
        key={achievement.id}
        style={styles.achievementCard}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={isCompleted 
            ? ['#10B981', '#059669'] 
            : ['#4B5563', '#374151']}
          style={styles.achievementGradient}
        >
          <View style={styles.achievementHeader}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
            </View>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(progressPercentage, 100)}%`,
                    backgroundColor: isCompleted ? '#FFD700' : '#E8B923'
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress}/{achievement.target}
            </Text>
          </View>

          {isCompleted && achievement.unlockedAt && (
            <Text style={styles.unlockedDate}>
              {new Date(achievement.unlockedAt).toLocaleDateString('tr-TR')}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Kategori butonları
  const renderCategoryButtons = () => {
    const categories = [
      { id: 'all', label: 'Tümü', icon: '🎯' },
      { id: 'reflection', label: 'Yansıtma', icon: '💭' },
      { id: 'growth', label: 'Gelişim', icon: '🌱' },
      { id: 'mindfulness', label: 'Farkındalık', icon: '🧘' },
      { id: 'sharing', label: 'Paylaşım', icon: '🤝' }
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id && styles.activeCategoryButton
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryLabel,
              activeCategory === category.id && styles.activeCategoryLabel
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Metrik kartı
  const renderMetricCard = (title: string, value: string | number, icon: string, color: string) => (
    <LinearGradient
      colors={[color, color + 'DD']}
      style={styles.metricCard}
    >
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </LinearGradient>
  );

  // Gelişim trendi grafiği
  const renderGrowthTrend = () => {
    if (!growthMetrics?.growthTrends || growthMetrics.growthTrends.length === 0) {
      return null;
    }

    const maxCount = Math.max(...growthMetrics.growthTrends.map(t => t.reflectionCount));

    return (
      <View style={styles.trendContainer}>
        <Text style={styles.trendTitle}>Son 6 Aylık Gelişim</Text>
        <View style={styles.trendChart}>
          {growthMetrics.growthTrends.map((trend, index) => {
            const barHeight = (trend.reflectionCount / maxCount) * 100;
            const monthName = new Date(trend.month + '-01').toLocaleDateString('tr-TR', { month: 'short' });
            
            return (
              <View key={index} style={styles.trendBar}>
                <View style={styles.trendBarContainer}>
                  <View 
                    style={[
                      styles.trendBarFill,
                      { 
                        height: `${barHeight}%`,
                        backgroundColor: trend.qualityScore >= 4 ? '#10B981' : '#E8B923'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.trendBarLabel}>{monthName}</Text>
                <Text style={styles.trendBarValue}>{trend.reflectionCount}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#1e3c72']}
        style={styles.container}
      >
        <ActivityIndicator size="large" color="#E8B923" style={styles.loader} />
      </LinearGradient>
    );
  }

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kişisel Gelişim</Text>
          <Text style={styles.subtitle}>
            Yolculuğunuzdaki ilerlemeleriniz
          </Text>
        </View>

        {/* Genel İstatistikler */}
        {growthMetrics && (
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              {renderMetricCard(
                'Yansıtma',
                growthMetrics.totalReflections,
                '💭',
                '#8B5CF6'
              )}
              {renderMetricCard(
                'Streak',
                `${growthMetrics.deepThinkingStreak} hafta`,
                '🔥',
                '#EF4444'
              )}
            </View>
            <View style={styles.statsRow}>
              {renderMetricCard(
                'Yardımcılık',
                growthMetrics.averageHelpfulness.toFixed(1),
                '⭐',
                '#F59E0B'
              )}
              {renderMetricCard(
                'Rezonans',
                growthMetrics.averageResonance.toFixed(1),
                '💫',
                '#3B82F6'
              )}
            </View>
          </View>
        )}

        {/* Tamamlanma Özeti */}
        <View style={styles.completionCard}>
          <LinearGradient
            colors={['#6B46C1', '#7C3AED']}
            style={styles.completionGradient}
          >
            <Text style={styles.completionTitle}>Genel İlerleme</Text>
            <View style={styles.completionStats}>
              <Text style={styles.completionText}>
                {unlockedCount}/{totalCount} Başarım
              </Text>
              <Text style={styles.completionPercentage}>
                %{completionPercentage}
              </Text>
            </View>
            <View style={styles.completionBar}>
              <View 
                style={[
                  styles.completionFill,
                  { width: `${completionPercentage}%` }
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Gelişim Trendi */}
        {renderGrowthTrend()}

        {/* Kategori Filtreleri */}
        {renderCategoryButtons()}

        {/* Başarımlar Listesi */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Başarımlar</Text>
          {getFilteredAchievements().map(renderAchievement)}
          
          {getFilteredAchievements().length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🎯</Text>
              <Text style={styles.emptyStateText}>
                Bu kategoride henüz başarım yok
              </Text>
            </View>
          )}
        </View>

        {/* En Çok Geliştiğiniz Alanlar */}
        {growthMetrics?.topInsightCategories && growthMetrics.topInsightCategories.length > 0 && (
          <View style={styles.insightSection}>
            <Text style={styles.sectionTitle}>En Çok Geliştiğiniz Alanlar</Text>
            <View style={styles.insightCategories}>
              {growthMetrics.topInsightCategories.map((category, index) => (
                <View key={index} style={styles.insightCategory}>
                  <Text style={styles.insightCategoryIcon}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </Text>
                  <Text style={styles.insightCategoryName}>{category}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  contentContainer: {
    paddingBottom: 30,
  },
  
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  metricTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  completionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  completionGradient: {
    padding: 20,
  },
  
  completionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  
  completionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  completionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  completionPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  
  completionBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  completionFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  
  trendContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
  },
  
  trendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    alignItems: 'flex-end',
  },
  
  trendBar: {
    flex: 1,
    alignItems: 'center',
  },
  
  trendBarContainer: {
    width: '70%',
    height: 80,
    justifyContent: 'flex-end',
  },
  
  trendBarFill: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  
  trendBarLabel: {
    fontSize: 10,
    color: '#4a5568',
    marginTop: 4,
  },
  
  trendBarValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    maxHeight: 60,
  },
  
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  activeCategoryButton: {
    backgroundColor: '#E8B923',
  },
  
  categoryIcon: {
    fontSize: 16,
  },
  
  categoryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  
  activeCategoryLabel: {
    color: '#0A0A0F',
    fontWeight: 'bold',
  },
  
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  
  achievementCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  achievementGradient: {
    padding: 16,
  },
  
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  
  achievementInfo: {
    flex: 1,
  },
  
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  achievementDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  completedBadgeText: {
    color: '#0A0A0F',
    fontWeight: 'bold',
  },
  
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  
  unlockedDate: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  
  insightSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  insightCategories: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  
  insightCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  
  insightCategoryIcon: {
    fontSize: 20,
  },
  
  insightCategoryName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default AchievementsScreen;