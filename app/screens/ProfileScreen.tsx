// app/screens/ProfileScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getUserStats, clearAllHistory } from '../services/readingHistoryService';
import MysticConfirmationModal from '../components/MysticConfirmationModal';

// ... (CustomToggle bileşeni burada aynı şekilde kalıyor)
interface UserPreferences {
  notifications: boolean;
  dailyReminder: boolean;
  autoSave: boolean;
}

const CustomToggle = ({ value, onValueChange }: { value: boolean, onValueChange: () => void }) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const trackBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0.2)', '#d4af37'],
  });

  const iconColor = value ? '#1d112b' : '#d4af37';

  return (
    <TouchableOpacity onPress={onValueChange} activeOpacity={0.9}>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: trackBackgroundColor }]}>
        <Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]} />
        <View style={styles.toggleIconContainer}>
          <Text style={[styles.toggleIcon, { color: iconColor }]}>☾</Text>
          <Text style={[styles.toggleIcon, { color: iconColor }]}>☀️</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};


const ProfileScreen: React.FC = () => {
  const [userStats, setUserStats] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: true,
    dailyReminder: true,
    autoSave: true,
  });
  const [isModalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadPreferences();
    }, [])
  );

  const loadUserData = async () => {
    const stats = await getUserStats();
    setUserStats(stats);
  };

  const loadPreferences = async () => {
    const savedPrefs = await AsyncStorage.getItem('@user_preferences');
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
  };

  const savePreferences = async (newPrefs: UserPreferences) => {
    await AsyncStorage.setItem('@user_preferences', JSON.stringify(newPrefs));
    setPreferences(newPrefs);
  };

  const handlePreferenceChange = (key: keyof UserPreferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    savePreferences(newPrefs);
  };

  const confirmClearHistory = async () => {
    try {
      await clearAllHistory();
      await loadUserData();
      setModalVisible(false);
    } catch (error) {
      setModalVisible(false);
      Alert.alert('Hata', 'Geçmiş silinemedi.');
    }
  };
  
  const userLevel = Math.floor((userStats?.totalReadings || 0) / 10) + 1;

  return (
    <>
      {/* DEĞİŞİKLİK: ImageBackground yerine daha derin bir LinearGradient kullanıldı */}
      <LinearGradient colors={['#2b173f', '#1d112b', '#2b173f']} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
          
          <View style={styles.journeyPeakContainer}>
            <View style={styles.avatarFrame}>
              <LinearGradient colors={['#d4af37', '#F59E0B']} style={styles.avatarGradient}>
                <Text style={styles.avatarSymbol}>✧</Text>
              </LinearGradient>
            </View>
            <Text style={styles.userName}>Mistik Gezgin</Text>
            <Text style={styles.userLevel}>Seviye {userLevel}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İstatistiklerim</Text>
            <View style={styles.journeyStonesContainer}>
              <View style={styles.journeyStone}><Text style={styles.stoneSymbol}>✦</Text><Text style={styles.stoneValue}>{userStats?.totalReadings || 0}</Text><Text style={styles.stoneLabel}>Okuma</Text></View>
              <View style={styles.journeyStone}><Text style={styles.stoneSymbol}>★</Text><Text style={styles.stoneValue}>{userStats?.favoriteReadings || 0}</Text><Text style={styles.stoneLabel}>Favori</Text></View>
              <View style={styles.journeyStone}><Text style={styles.stoneSymbol}>☍</Text><Text style={styles.stoneValue}>{userStats?.streakDays || 0} gün</Text><Text style={styles.stoneLabel}>Seri</Text></View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tercihler</Text>
            <View style={styles.ritualContainer}>
              <View style={styles.ritualRow}>
                <View style={styles.ritualInfo}>
                  <Text style={styles.ritualSymbol}>◎</Text>
                  <View style={styles.ritualTextContainer}>
                    <Text style={styles.ritualLabel}>Bildirimler</Text>
                    <Text style={styles.ritualDescription}>Nova'dan gelen fısıltıları ve yenilikleri al</Text>
                  </View>
                </View>
                <View style={styles.toggleContainer}>
                  <CustomToggle value={preferences.notifications} onValueChange={() => handlePreferenceChange('notifications')} />
                </View>
              </View>
              <View style={styles.ritualRow}>
                <View style={styles.ritualInfo}>
                  <Text style={styles.ritualSymbol}>☾</Text>
                   <View style={styles.ritualTextContainer}>
                    <Text style={styles.ritualLabel}>Günlük Hatırlatıcı</Text>
                    <Text style={styles.ritualDescription}>Günün rehberliğini almak için nazik bir anımsatıcı</Text>
                  </View>
                </View>
                 <View style={styles.toggleContainer}>
                  <CustomToggle value={preferences.dailyReminder} onValueChange={() => handlePreferenceChange('dailyReminder')} />
                </View>
              </View>
              <View style={[styles.ritualRow, { borderBottomWidth: 0 }]}>
                <View style={styles.ritualInfo}>
                  <Text style={styles.ritualSymbol}>⊕</Text>
                   <View style={styles.ritualTextContainer}>
                    <Text style={styles.ritualLabel}>Otomatik Kayıt</Text>
                    <Text style={styles.ritualDescription}>Yolculuğunun hiçbir anının kaybolmamasını sağla</Text>
                  </View>
                </View>
                 <View style={styles.toggleContainer}>
                  <CustomToggle value={preferences.autoSave} onValueChange={() => handlePreferenceChange('autoSave')} />
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hesap</Text>
            <View style={styles.ritualContainer}>
              <TouchableOpacity style={styles.accountRow} activeOpacity={0.7}><View style={styles.ritualInfo}><Text style={styles.ritualSymbol}>i</Text><Text style={styles.ritualLabel}>Hakkında</Text></View><Text style={styles.ritualArrow}>›</Text></TouchableOpacity>
              <TouchableOpacity style={styles.accountRow} activeOpacity={0.7}><View style={styles.ritualInfo}><Text style={styles.ritualSymbol}>☗</Text><Text style={styles.ritualLabel}>Gizlilik Politikası</Text></View><Text style={styles.ritualArrow}>›</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.accountRow, { borderBottomWidth: 0 }]} activeOpacity={0.7} onPress={() => setModalVisible(true)}><View style={styles.ritualInfo}><Text style={[styles.ritualSymbol, {color: '#EF4444'}]}>✕</Text><Text style={[styles.ritualLabel, {color: '#EF4444'}]}>Tüm Verileri Sil</Text></View><Text style={styles.ritualArrow}>›</Text></TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.premiumCard} activeOpacity={0.8}><LinearGradient colors={['#d4af37', '#F59E0B']} style={styles.premiumGradient}><View><Text style={styles.premiumTitle}>Premium'a Geç</Text><Text style={styles.premiumDescription}>Sınırsız okuma ve özel açılımlar</Text></View><Text style={styles.premiumLabel}>Yakında</Text></LinearGradient></TouchableOpacity>
        </ScrollView>
      </LinearGradient>
      <MysticConfirmationModal visible={isModalVisible} onClose={() => setModalVisible(false)} title="Verileri Sil" subtitle="Tüm okuma geçmişiniz ve favorileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz." buttons={[{ text: 'İptal', onPress: () => setModalVisible(false), style: 'default' },{ text: 'Sil', onPress: confirmClearHistory, style: 'destructive' }]}/>
    </>
  );
};

// Stillerin geri kalanı aynı, sadece en üstteki container stili değişti
const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { paddingBottom: 120, paddingTop: 60 },
    section: { paddingHorizontal: 20, marginBottom: 32 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#f3e8ff', marginBottom: 16, fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' })},
    journeyPeakContainer: { alignItems: 'center', marginBottom: 32 },
    avatarFrame: { width: 110, height: 110, justifyContent: 'center', alignItems: 'center' },
    avatarGradient: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1d112b' },
    avatarSymbol: { fontSize: 48, color: '#1d112b', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    userName: { fontSize: 26, fontWeight: 'bold', color: '#f3e8ff', marginTop: 16, fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
    userLevel: { fontSize: 16, color: '#d4af37', fontWeight: '600', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    journeyStonesContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    journeyStone: { flex: 1, backgroundColor: 'rgba(74, 4, 78, 0.3)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#701a75' },
    stoneSymbol: { fontSize: 28, color: '#d4af37', marginBottom: 8 },
    stoneValue: { fontSize: 22, fontWeight: 'bold', color: '#f3e8ff', fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
    stoneLabel: { fontSize: 12, color: 'rgba(243, 232, 255, 0.7)', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    ritualContainer: { backgroundColor: 'rgba(74, 4, 78, 0.2)', borderRadius: 16, borderWidth: 1, borderColor: '#701a75' },
    ritualRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(112, 26, 117, 0.3)', position: 'relative', minHeight: 70, alignItems: 'center' },
    accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(112, 26, 117, 0.3)'},
    ritualInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, paddingVertical: 18, marginRight: 60 },
    ritualTextContainer: { flex: 1 },
    ritualSymbol: { fontSize: 22, color: '#d4af37', width: 24, textAlign: 'center', marginRight: 16, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    ritualLabel: { fontSize: 16, fontWeight: '600', color: '#f3e8ff', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    ritualDescription: { fontSize: 11, color: 'rgba(243, 232, 255, 0.6)', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    ritualArrow: { fontSize: 20, color: 'rgba(243, 232, 255, 0.4)' },
    toggleContainer: { position: 'absolute', top: 0, bottom: 0, right: 16, justifyContent: 'center' },
    toggleTrack: { width: 50, height: 28, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)', justifyContent: 'center' },
    toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f3e8ff', position: 'absolute', zIndex: 1 },
    toggleIconContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, zIndex: 2 },
    toggleIcon: { fontSize: 12, fontWeight: 'bold' },
    premiumCard: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', shadowColor: '#d4af37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, marginTop: 16 },
    premiumGradient: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    premiumTitle: { fontSize: 18, fontWeight: 'bold', color: '#1d112b', fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
    premiumDescription: { fontSize: 12, color: 'rgba(29, 17, 43, 0.8)', marginTop: 2, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    premiumLabel: { fontSize: 14, fontWeight: 'bold', color: '#1d112b', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, overflow: 'hidden', fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
});

export default ProfileScreen;