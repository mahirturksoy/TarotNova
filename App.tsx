// App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';

// DİL AYARI
import './app/i18n';
import { useTranslation } from 'react-i18next'; // <-- Hook eklendi

// Services
import revenueCatService from './app/services/revenueCatService';
import notificationService from './app/services/notificationService';
import firestoreService from './app/services/firestoreService';
import { auth } from './app/config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

// Context
import { ReadingProvider } from './app/context/ReadingContext';

// Bileşenler
import AnimatedSplashScreen from './app/components/AnimatedSplashScreen';

// Ekranlar
import HomeScreen from './app/screens/HomeScreen';
import SpreadSelectionScreen from './app/screens/SpreadSelectionScreen';
import CardSelectionScreen from './app/screens/CardSelectionScreen';
import ReadingScreen from './app/screens/ReadingScreen';
import ReadingHistoryScreen from './app/screens/ReadingHistoryScreen';
import ReadingDetailScreen from './app/screens/ReadingDetailScreen';
import FavoritesScreen from './app/screens/FavoritesScreen';
import ProfileScreen from './app/screens/ProfileScreen';
import AuthScreen from './app/screens/AuthScreen';
import PremiumScreen from './app/screens/PremiumScreen';

import { RootStackParamList, TabParamList } from './app/types/navigation';

SplashScreen.preventAutoHideAsync();

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MyTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: '#1d112b', card: '#1d112b', text: '#f3e8ff', border: '#4a044e', primary: '#d4af37' },
};

const toastConfig = {
  mysticSuccess: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={styles.mysticToastContainer}>
      <Text style={styles.mysticToastIcon}>✦</Text>
      <View style={styles.mysticToastTextContainer}>
        <Text style={styles.mysticToastTitle}>{text1}</Text>
        <Text style={styles.mysticToastSubtitle}>{text2}</Text>
      </View>
    </View>
  ),
};

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = { 'Ana Sayfa': '✧', 'Geçmiş': '❋', 'Favoriler': '✦', 'Profil': '☾' };
  return ( <View style={styles.tabIconContainer}><Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icons[name] || '✧'}</Text></View> );
};

const MainTabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator screenOptions={({ route }: { route: { name: string } }) => ({
        tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: '#d4af37',
        tabBarInactiveTintColor: '#a8a29e',
        tabBarStyle: { backgroundColor: '#1d112b', borderTopWidth: 1, borderTopColor: '#4a044e', height: 85, paddingBottom: 25, paddingTop: 10, position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 0 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginBottom: 5, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} options={{ tabBarLabel: t('tab.home'), title: t('tab.home') }} />
      <Tab.Screen name="Geçmiş" component={ReadingHistoryScreen} options={{ tabBarLabel: t('tab.history'), title: t('tab.history') }} />
      <Tab.Screen name="Favoriler" component={FavoritesScreen} options={{ tabBarLabel: t('tab.favorites'), title: t('tab.favorites') }} />
      <Tab.Screen name="Profil" component={ProfileScreen} options={{ tabBarLabel: t('tab.profile'), title: t('tab.profile') }} />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const { t } = useTranslation(); // <-- App seviyesinde çeviri

  useEffect(() => {
    let authUnsubscribe: (() => void) | undefined;
    let notificationCleanup: (() => void) | undefined;

    async function prepare() {
      try {
        // RevenueCat'i başlat
        console.log('🚀 Initializing RevenueCat...');
        await revenueCatService.initialize();

        // Auth listener: Kullanıcı değiştiğinde RevenueCat'e bildir
        authUnsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log('👤 Auth state changed:', user?.uid || 'logged out');
          await revenueCatService.syncUser(user?.uid || null);
        });

        // Notification listener'ları kur
        console.log('🔔 Setting up notification listeners...');
        notificationCleanup = notificationService.setupNotificationListeners(
          (notification) => {
            console.log('📩 Notification received:', notification.request.content);
          },
          (response) => {
            console.log('👆 Notification tapped:', response.notification.request.content);
            // İleride: Bildirime tıklandığında navigation yapılabilir
          }
        );

        // AsyncStorage → Firestore migration (tek seferlik)
        console.log('🔄 Checking for Firestore migration...');
        await firestoreService.migrateAsyncStorageToFirestore();

        // Splash delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('❌ App initialization error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();

    // Cleanup function
    return () => {
      if (authUnsubscribe) {
        console.log('🧹 Cleaning up auth listener');
        authUnsubscribe();
      }
      if (notificationCleanup) {
        console.log('🧹 Cleaning up notification listeners');
        notificationCleanup();
      }
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  if (showCustomSplash) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AnimatedSplashScreen onAnimationFinish={() => setShowCustomSplash(false)} />
      </View>
    );
  }

  return (
    <ReadingProvider>
      <NavigationContainer theme={MyTheme}>
        <StatusBar style="light" />
        <RootStack.Navigator 
          screenOptions={{
            headerTintColor: '#d4af37',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
            headerTitleAlign: 'center',
            headerBackTitle: t('common.back'), // <-- "Geri" tuşu çevrildi
          }}
        >
          <RootStack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
          
          {/* Başlıklar Dinamik Hale Getirildi */}
          <RootStack.Screen name="SpreadSelection" component={SpreadSelectionScreen} options={{ title: t('spread.title') }} />
          <RootStack.Screen name="CardSelection" component={CardSelectionScreen} options={{ title: t('cardSelection.title') }} />
          <RootStack.Screen name="Reading" component={ReadingScreen} options={{ title: t('reading.title') }} />
          <RootStack.Screen name="ReadingDetail" component={ReadingDetailScreen} options={{ title: t('reading.title') }} />
          
          <RootStack.Screen name="Auth" component={AuthScreen} options={{ presentation: 'modal', headerShown: false }} />
          <RootStack.Screen name="Premium" component={PremiumScreen} options={{ presentation: 'modal', headerShown: false }} />
        </RootStack.Navigator>
        <Toast config={toastConfig} />
      </NavigationContainer>
    </ReadingProvider>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: { alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 28, color: '#a8a29e' },
  tabIconFocused: { color: '#d4af37', fontSize: 30 },
  mysticToastContainer: {
    width: '90%',
    backgroundColor: '#2b173f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d4af37',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
  mysticToastIcon: { fontSize: 24, color: '#d4af37', marginRight: 12, textShadowColor: 'rgba(212, 175, 55, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  mysticToastTextContainer: { flex: 1 },
  mysticToastTitle: { fontSize: 16, fontWeight: 'bold', color: '#f3e8ff', fontFamily: Platform.select({ios: 'Georgia-Bold', android: 'serif'}) },
  mysticToastSubtitle: { fontSize: 14, color: 'rgba(243, 232, 255, 0.8)', fontFamily: Platform.select({ios: 'Georgia', android: 'serif'}), marginTop: 2 },
});

export default App;