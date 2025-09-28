// app/screens/ProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getUserStats, clearAllHistory } from '../services/readingHistoryService';
import { getGrowthMetrics } from '../services/reflectionService';

const { width } = Dimensions.get('window');

interface UserPreferences {
  notifications: boolean;
  dailyReminder: boolean;
  darkMode: boolean;
  language: 'tr' | 'en';
  autoSave: boolean;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [userStats, setUserStats] = useState<any>(null);
  const [growthMetrics, setGrowthMetrics] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: true,
    dailyReminder: false,
    darkMode: true,
    language: 'tr',
    autoSave: true,
  });

  useEffect(() => {
    loadUserData();
    loadPreferences();
  }, []);

  const loadUserData = async () => {
    try {
      const [stats, metrics] = await Promise.all([
        getUserStats(),
        getGrowthMetrics()
      ]);
      setUserStats(stats);
      setGrowthMetrics(metrics);
    } catch (error) {
      console.error('Kullanıcı verileri yüklenemedi:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const savedPrefs = await AsyncStorage.getItem('@user_preferences');
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error('Tercihler yüklenemedi:', error);
    }
  };

  const savePreferences = async (newPrefs: UserPreferences) => {
    try {
      await AsyncStorage.setItem('@user_preferences', JSON.stringify(newPrefs));
      setPreferences(newPrefs);
    } catch (error) {
      console.error('Tercihler kaydedilemedi:', error);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const newPrefs = { ...preferences, [key]: value };
    savePreferences(newPrefs);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Tüm Geçmişi Sil',
      'Tüm okuma geçmişiniz, favorileriniz ve yansıtmalarınız silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllHistory();
              await loadUserData();
              Alert.alert('Başarılı', 'Tüm geçmiş silindi.');
            } catch (error) {
              Alert.alert('Hata', 'Geçmiş silinemedi.');
            }
          }
        }
      ]
    );
  };

  const renderStatCard = (label: string, value: string | number, icon: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderSettingRow = (
    label: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingIcon}>{icon}</Text>
          <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#E8B923' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  const renderMenuButton = (title: string, icon: string, onPress: () => void, danger?: boolean) => (
    <TouchableOpacity 
      style={[styles.menuButton, danger && styles.dangerButton]}
      onPress={onPress}
    >
      <View style={styles.menuButtonContent}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={[styles.menuTitle, danger && styles.dangerText]}>{title}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profil Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#E8B923', '#F59E0B']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>👤</Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>Mistik Gezgin</Text>
          <Text style={styles.userLevel}>Seviye {Math.floor((userStats?.totalReadings || 0) / 5) + 1}</Text>
        </View>

        {/* İstatistikler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İstatistiklerim</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Okuma', userStats?.totalReadings || 0, '🔮')}
            {renderStatCard('Favori', userStats?.favoriteReadings || 0, '⭐')}
            {renderStatCard('Yansıtma', growthMetrics?.totalReflections || 0, '💭')}
            {renderStatCard('Streak', `${userStats?.streakDays || 0} gün`, '🔥')}
          </View>
        </View>

        {/* Tercihler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tercihler</Text>
          <View style={styles.settingsContainer}>
            {renderSettingRow(
              'Bildirimler',
              'Önemli güncellemeler için bildirim al',
              preferences.notifications,
              (value) => handlePreferenceChange('notifications', value),
              '🔔'
            )}
            {renderSettingRow(
              'Günlük Hatırlatıcı',
              'Her gün tarot çekmeyi hatırlat',
              preferences.dailyReminder,
              (value) => handlePreferenceChange('dailyReminder', value),
              '⏰'
            )}
            {renderSettingRow(
              'Otomatik Kayıt',
              'Okumaları otomatik kaydet',
              preferences.autoSave,
              (value) => handlePreferenceChange('autoSave', value),
              '💾'
            )}
          </View>
        </View>

        {/* Menü Butonları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <View style={styles.menuContainer}>
            {renderMenuButton('Hakkında', 'ℹ️', () => {
              Alert.alert(
                'TarotNova',
                'Versiyon 1.0.0\n\nYapay zeka destekli tarot okuma uygulaması.\n\n© 2024 TarotNova'
              );
            })}
            {renderMenuButton('Gizlilik Politikası', '🔒', () => {
              Alert.alert('Gizlilik', 'Verileriniz güvende ve yerel olarak saklanıyor.');
            })}
            {renderMenuButton('Destek', '💬', () => {
              Alert.alert('Destek', 'support@tarotnova.com');
            })}
            {renderMenuButton('Tüm Verileri Sil', '🗑️', handleClearHistory, true)}
          </View>
        </View>

        {/* Premium Banner (Gelecek özellik) */}
        <TouchableOpacity style={styles.premiumBanner} activeOpacity={0.8}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.premiumGradient}
          >
            <View style={styles.premiumContent}>
              <Text style={styles.premiumIcon}>👑</Text>
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumTitle}>Premium'a Geç</Text>
                <Text style={styles.premiumDescription}>
                  Sınırsız okuma, özel spreadler ve daha fazlası
                </Text>
              </View>
            </View>
            <Text style={styles.premiumPrice}>Yakında</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingBottom: 100,
  },
  
  profileHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  
  avatarContainer: {
    marginBottom: 16,
  },
  
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarText: {
    fontSize: 48,
  },
  
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  userLevel: {
    fontSize: 16,
    color: '#E8B923',
    fontWeight: '600',
  },
  
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  settingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
  },
  
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  settingIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  settingDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 26,
  },
  
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  
  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  
  menuTitle: {
    fontSize: 16,
    color: '#ffffff',
  },
  
  dangerText: {
    color: '#EF4444',
  },
  
  menuArrow: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  
  premiumBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  premiumIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  
  premiumInfo: {
    flex: 1,
  },
  
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  
  premiumDescription: {
    fontSize: 12,
    color: 'rgba(26, 26, 46, 0.8)',
  },
  
  premiumPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
});

export default ProfileScreen;