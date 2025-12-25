// app/screens/ProfileScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated, Easing, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getUserStats, clearAllHistory, UserStats } from '../services/readingHistoryService';
import MysticConfirmationModal from '../components/MysticConfirmationModal';
import MysticInfoModal from '../components/MysticInfoModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { useTranslation } from 'react-i18next';
import notificationService from '../services/notificationService';

interface UserPreferences { notifications: boolean; dailyReminder: boolean; autoSave: boolean; }

const CustomToggle = ({ value, onValueChange, disabled = false }: { value: boolean, onValueChange: () => void, disabled?: boolean }) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => { Animated.timing(animatedValue, { toValue: value ? 1 : 0, duration: 300, easing: Easing.bezier(0.34, 1.56, 0.64, 1), useNativeDriver: false, }).start(); }, [value]);
  const translateX = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const trackBackgroundColor = animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0.2)', '#d4af37'] });
  const iconColor = value ? '#1d112b' : '#d4af37';
  return (
    <TouchableOpacity onPress={onValueChange} activeOpacity={disabled ? 1 : 0.9} disabled={disabled} style={{ opacity: disabled ? 0.3 : 1 }}>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: trackBackgroundColor }]}><Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]} /><View style={styles.toggleIconContainer}><Text style={[styles.toggleIcon, { color: iconColor }]}>☾</Text><Text style={[styles.toggleIcon, { color: iconColor }]}>☀️</Text></View></Animated.View>
    </TouchableOpacity>
  );
};

type ProfileScreenNavigationProp = CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Profil'>, NativeStackNavigationProp<RootStackParamList>>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({ notifications: true, dailyReminder: true, autoSave: true });
  
  // Modal State Yönetimi
  const [modalType, setModalType] = useState<'none' | 'delete' | 'about' | 'privacy' | 'language'>('none');

  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); }); return () => unsubscribe(); }, []);
  useFocusEffect(useCallback(() => { loadUserData(); loadPreferences(); }, []));

  // Bildirim izinlerini kayıt et (Component mount olduğunda)
  useEffect(() => {
    registerNotifications();
  }, []);

  const registerNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        console.log('✅ ProfileScreen: Push notifications registered');
      }
    } catch (error) {
      console.error('❌ ProfileScreen: Failed to register notifications:', error);
    }
  };

  const loadUserData = async () => { const stats = await getUserStats(); setUserStats(stats); };
  const loadPreferences = async () => { const savedPrefs = await AsyncStorage.getItem('@user_preferences'); if (savedPrefs) setPreferences(JSON.parse(savedPrefs)); };
  const savePreferences = async (newPrefs: UserPreferences) => { await AsyncStorage.setItem('@user_preferences', JSON.stringify(newPrefs)); setPreferences(newPrefs); };

  const handlePreferenceChange = async (key: keyof UserPreferences) => {
    // Bildirimler kapalıysa dailyReminder toggle'ı yapılamaz
    if (key === 'dailyReminder' && !preferences.notifications) {
      console.warn('⚠️ Cannot toggle daily reminder when notifications are disabled');
      return;
    }

    const newPrefs = { ...preferences, [key]: !preferences[key] };

    // Bildirimler kapatıldıysa dailyReminder'ı da kapat
    if (key === 'notifications' && !newPrefs.notifications) {
      newPrefs.dailyReminder = false;
    }

    await savePreferences(newPrefs);

    // Bildirim tercihlerine göre aksiyon al
    if (key === 'dailyReminder') {
      await notificationService.scheduleDailyReminder(newPrefs.dailyReminder);
    }

    if (key === 'notifications') {
      if (!newPrefs.notifications) {
        // Bildirimler kapatıldıysa tüm zamanlanmış bildirimleri iptal et
        await notificationService.cancelAllNotifications();
      } else {
        // Bildirimler tekrar açıldıysa ve dailyReminder true ise, tekrar zamanla
        if (newPrefs.dailyReminder) {
          await notificationService.scheduleDailyReminder(true);
        }
      }
    }
  };
  
  const confirmClearHistory = async () => { try { await clearAllHistory(); await loadUserData(); setModalType('none'); } catch (error) { setModalType('none'); } };
  const handleSignOut = async () => { try { await signOut(auth); } catch (error) { console.error("Çıkış hatası:", error); } };
  const openSocialMedia = async (url: string) => { const supported = await Linking.canOpenURL(url); if (supported) await Linking.openURL(url); };

  const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem('user-language', lang);
    i18n.changeLanguage(lang);
    setModalType('none');
  };
  
  const userLevel = Math.floor((userStats?.totalReadings || 0) / 10) + 1;

  return (
    <>
      <LinearGradient colors={['#2b173f', '#1d112b', '#2b173f']} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
          <View style={styles.journeyPeakContainer}>
            <View style={styles.avatarFrame}><LinearGradient colors={['#d4af37', '#F59E0B']} style={styles.avatarGradient}><Text style={styles.avatarSymbol}>✧</Text></LinearGradient></View>
            <Text style={styles.userName}>{user ? t('profile.traveler') : t('profile.guest')}</Text>
            {user ? <Text style={styles.userEmail}>{user.email}</Text> : <Text style={styles.userLevel}>{t('profile.level')} {userLevel}</Text>}
          </View>

          {!user && (
            <TouchableOpacity style={styles.authCard} activeOpacity={0.8} onPress={() => navigation.navigate('Auth')}>
                <LinearGradient colors={['rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.2)']} style={styles.authGradient}>
                    <Text style={styles.authCardIcon}>✧</Text>
                    <View style={styles.authCardTextContainer}><Text style={styles.authCardTitle}>{t('profile.loginCard.title')}</Text><Text style={styles.authCardSubtitle}>{t('profile.loginCard.subtitle')}</Text></View>
                    <Text style={styles.ritualArrow}>›</Text>
                </LinearGradient>
            </TouchableOpacity>
          )}
          
          <View style={styles.section}><Text style={styles.sectionTitle}>{t('profile.stats.title')}</Text><View style={styles.journeyStonesContainer}><View style={styles.journeyStone}><Text style={styles.stoneSymbol}>✦</Text><Text style={styles.stoneValue}>{userStats?.totalReadings || 0}</Text><Text style={styles.stoneLabel}>{t('profile.stats.readings')}</Text></View><View style={styles.journeyStone}><Text style={styles.stoneSymbol}>★</Text><Text style={styles.stoneValue}>{userStats?.favoriteReadings || 0}</Text><Text style={styles.stoneLabel}>{t('profile.stats.favorites')}</Text></View><View style={styles.journeyStone}><Text style={styles.stoneSymbol}>☍</Text><Text style={styles.stoneValue}>{userStats?.streakDays || 0} {t('profile.stats.days')}</Text><Text style={styles.stoneLabel}>{t('profile.stats.streak')}</Text></View></View></View>
          
          <View style={styles.section}><Text style={styles.sectionTitle}>{t('profile.preferences.title')}</Text><View style={styles.ritualContainer}>
            <View style={styles.ritualRow}><View style={styles.ritualInfo}><Text style={styles.ritualSymbol}>◎</Text><View style={styles.ritualTextContainer}><Text style={styles.ritualLabel}>{t('profile.preferences.notifications')}</Text><Text style={styles.ritualDescription}>{t('profile.preferences.notificationsDesc')}</Text></View></View><View style={styles.toggleContainer}><CustomToggle value={preferences.notifications} onValueChange={() => handlePreferenceChange('notifications')} /></View></View>
            <View style={styles.ritualRow}><View style={styles.ritualInfo}><Text style={styles.ritualSymbol}>☾</Text><View style={styles.ritualTextContainer}><Text style={styles.ritualLabel}>{t('profile.preferences.reminder')}</Text><Text style={styles.ritualDescription}>{t('profile.preferences.reminderDesc')}</Text></View></View><View style={styles.toggleContainer}><CustomToggle value={preferences.dailyReminder} onValueChange={() => handlePreferenceChange('dailyReminder')} disabled={!preferences.notifications} /></View></View>
            <View style={styles.ritualRow}><View style={styles.ritualInfo}><Text style={styles.ritualSymbol}>⊕</Text><View style={styles.ritualTextContainer}><Text style={styles.ritualLabel}>{t('profile.preferences.autoSave')}</Text><Text style={styles.ritualDescription}>{t('profile.preferences.autoSaveDesc')}</Text></View></View><View style={styles.toggleContainer}><CustomToggle value={preferences.autoSave} onValueChange={() => handlePreferenceChange('autoSave')} /></View></View>
            
            {/* DİL DEĞİŞTİRME BUTONU - Omega İkonu ile */}
            <TouchableOpacity style={[styles.accountRow, { borderBottomWidth: 0 }]} activeOpacity={0.7} onPress={() => setModalType('language')}>
                <View style={styles.ritualInfo}>
                    <Text style={styles.ritualSymbol}>Ω</Text> 
                    <View style={styles.ritualTextContainer}><Text style={styles.ritualLabel}>{t('profile.preferences.language')}</Text><Text style={styles.ritualDescription}>{t('profile.preferences.languageDesc')}</Text></View>
                </View>
                <Text style={{color: '#d4af37', marginRight: 10, fontWeight: 'bold'}}>{i18n.language.toUpperCase()}</Text>
                <Text style={styles.ritualArrow}>›</Text>
            </TouchableOpacity>
          </View></View>
          
          <View style={styles.section}><Text style={styles.sectionTitle}>{t('profile.account.title')}</Text><View style={styles.ritualContainer}>
                <TouchableOpacity style={styles.accountRow} activeOpacity={0.7} onPress={() => setModalType('about')}><View style={styles.ritualInfo}><Text style={styles.ritualSymbol}>i</Text><Text style={styles.ritualLabel}>{t('profile.account.about')}</Text></View><Text style={styles.ritualArrow}>›</Text></TouchableOpacity>
                <TouchableOpacity style={styles.accountRow} activeOpacity={0.7} onPress={() => Linking.openURL('https://mahirturksoy.github.io/tarotnova-legal/terms.html')}><View style={styles.ritualInfo}><Text style={styles.ritualSymbol}>📜</Text><Text style={styles.ritualLabel}>{t('profile.account.terms')}</Text></View><Text style={styles.ritualArrow}>›</Text></TouchableOpacity>
                <TouchableOpacity style={styles.accountRow} activeOpacity={0.7} onPress={() => setModalType('privacy')}><View style={styles.ritualInfo}><Text style={styles.ritualSymbol}>☗</Text><Text style={styles.ritualLabel}>{t('profile.account.privacy')}</Text></View><Text style={styles.ritualArrow}>›</Text></TouchableOpacity>
                {user && (<TouchableOpacity style={styles.accountRow} activeOpacity={0.7} onPress={handleSignOut}><View style={styles.ritualInfo}><Text style={styles.ritualSymbol}>➜</Text><Text style={styles.ritualLabel}>{t('profile.account.logout')}</Text></View></TouchableOpacity>)}
                <TouchableOpacity style={[styles.accountRow, { borderBottomWidth: 0 }]} activeOpacity={0.7} onPress={() => setModalType('delete')}><View style={styles.ritualInfo}><Text style={[styles.ritualSymbol, {color: '#EF4444'}]}>✕</Text><Text style={[styles.ritualLabel, {color: '#EF4444'}]}>{t('profile.account.deleteData')}</Text></View><Text style={styles.ritualArrow}>›</Text></TouchableOpacity>
          </View></View>
          
          <TouchableOpacity style={styles.premiumCard} activeOpacity={0.8} onPress={() => navigation.navigate('Premium')}>
            <LinearGradient colors={['#d4af37', '#F59E0B']} style={styles.premiumGradient}>
                <View><Text style={styles.premiumTitle}>{t('profile.premiumCard.title')}</Text><Text style={styles.premiumDescription}>{t('profile.premiumCard.desc')}</Text></View><Text style={styles.premiumLabel}>{t('profile.premiumCard.badge')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      {/* --- MODALLAR --- */}
      <MysticConfirmationModal 
        visible={modalType === 'delete'} 
        onClose={() => setModalType('none')} 
        title={t('profile.account.deleteData')} 
        subtitle={t('history.deleteModal.message')} 
        buttons={[{ text: t('common.cancel'), onPress: () => setModalType('none'), style: 'default' }, { text: t('common.delete'), onPress: confirmClearHistory, style: 'destructive' }]}
      />

      {/* DİL SEÇİM MODALI - MysticInfoModal Kullanılarak */}
      <MysticInfoModal
        visible={modalType === 'language'}
        onClose={() => setModalType('none')}
        title={t('profile.preferences.language')}
        icon="Ω"
        content="" // İçerik boş, sadece butonlar var
        buttons={[
            { text: 'Türkçe 🇹🇷', onPress: () => changeLanguage('tr'), variant: 'primary' },
            { text: 'English 🇬🇧', onPress: () => changeLanguage('en'), variant: 'primary' },
            { text: t('common.cancel'), onPress: () => setModalType('none'), variant: 'secondary' }
        ]}
      />

      <MysticInfoModal visible={modalType === 'about'} onClose={() => setModalType('none')} title={t('legal.aboutTitle')} icon="✧" content={t('legal.aboutContent')} buttons={[{ text: 'Instagram', onPress: () => openSocialMedia('https://www.instagram.com/tarotnova777'), variant: 'primary' }, { text: 'TikTok', onPress: () => openSocialMedia('https://www.tiktok.com/@tarotnova777'), variant: 'secondary' }, { text: t('common.close'), onPress: () => setModalType('none'), variant: 'secondary' }]} />
      <MysticInfoModal visible={modalType === 'privacy'} onClose={() => setModalType('none')} title={t('legal.privacyTitle')} icon="🔒" content={t('legal.privacyContent')} buttons={[{ text: t('common.ok'), onPress: () => setModalType('none'), variant: 'primary' }]} />
    </>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { paddingBottom: 120, paddingTop: 60 },
    section: { paddingHorizontal: 20, marginBottom: 32 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#f3e8ff', marginBottom: 16, fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' })},
    journeyPeakContainer: { alignItems: 'center', marginBottom: 24 },
    avatarFrame: { width: 110, height: 110, justifyContent: 'center', alignItems: 'center' },
    avatarGradient: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1d112b' },
    avatarSymbol: { fontSize: 48, color: '#1d112b', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    userName: { fontSize: 26, fontWeight: 'bold', color: '#f3e8ff', marginTop: 16, fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
    userLevel: { fontSize: 16, color: '#d4af37', fontWeight: '600', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    userEmail: { fontSize: 14, color: 'rgba(243, 232, 255, 0.7)', marginTop: 4, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' })},
    authCard: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', marginBottom: 32, borderWidth: 1, borderColor: '#d4af37' },
    authGradient: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    authCardIcon: { fontSize: 32, color: '#d4af37', marginRight: 16 },
    authCardTextContainer: { flex: 1 },
    authCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#f3e8ff', fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
    authCardSubtitle: { fontSize: 13, color: 'rgba(243, 232, 255, 0.8)', marginTop: 2, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    journeyStonesContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    journeyStone: { flex: 1, backgroundColor: 'rgba(74, 4, 78, 0.3)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#701a75' },
    stoneSymbol: { fontSize: 28, color: '#d4af37', marginBottom: 8 },
    stoneValue: { fontSize: 22, fontWeight: 'bold', color: '#f3e8ff', fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
    stoneLabel: { fontSize: 12, color: 'rgba(243, 232, 255, 0.7)', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
    ritualContainer: { backgroundColor: 'rgba(74, 4, 78, 0.2)', borderRadius: 16, borderWidth: 1, borderColor: '#701a75' },
    ritualRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(112, 26, 117, 0.3)', position: 'relative', minHeight: 70, alignItems: 'center' },
    accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(112, 26, 117, 0.3)'},
    ritualInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, paddingVertical: 18, marginRight: 20 },
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