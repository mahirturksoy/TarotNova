// app/screens/AuthScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'; // Çeviri Hook

import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  AuthError,
} from '../services/authService';
import { migrateGuestDataToUser } from '../services/readingHistoryService';

const AuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // Hook
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), "Lütfen tüm alanları doldurun.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      await migrateGuestDataToUser();
      navigation.goBack();
    } catch (error: any) {
      const authError = error as AuthError;
      Alert.alert(t('common.error'), authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      await migrateGuestDataToUser();
      navigation.goBack();
    } catch (error: any) {
      const authError = error as AuthError;
      if (authError.code !== 'auth/popup-closed-by-user' && authError.code !== 'auth/cancelled-popup-request') {
         Alert.alert(t('common.error'), authError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#2b173f', '#1d112b', '#000000']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.mysticIcon}>✦</Text>
            {/* Çeviri */}
            <Text style={styles.title}>{isLogin ? t('auth.login') : t('auth.createAccount')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📜</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                placeholderTextColor="rgba(243, 232, 255, 0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                placeholderTextColor="rgba(243, 232, 255, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#d4af37', '#F59E0B']}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#1d112b" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLogin ? t('auth.login') : t('auth.register')}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Butonu Tasarımı Güncellendi (Dark Theme) */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              {/* İkonu Text G olarak koyduk, renkli yaptık */}
              <Text style={styles.googleIconText}>G</Text>
              <Text style={styles.googleButtonText}>{t('auth.googleBtn')}</Text>
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchButton}>
                  {isLogin ? t('auth.register') : t('auth.login')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, padding: 24, justifyContent: 'center' },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  mysticIcon: { fontSize: 64, color: '#d4af37', marginBottom: 16, textShadowColor: 'rgba(212, 175, 55, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#f3e8ff', fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(43, 23, 63, 0.5)', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
  inputIcon: { fontSize: 20, marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, color: '#f3e8ff', fontSize: 16, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
  authButton: { borderRadius: 12, overflow: 'hidden', marginTop: 8, shadowColor: '#d4af37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#1d112b', fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(243, 232, 255, 0.2)' },
  dividerText: { color: 'rgba(243, 232, 255, 0.6)', paddingHorizontal: 16, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
  
  // YENİ GOOGLE BUTON STİLİ (KOYU TEMA)
  googleButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Şeffaf koyu
    borderRadius: 12, 
    paddingVertical: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.2)' 
  },
  googleIconText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d4af37', // Altın rengi G
    marginRight: 12,
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' })
  },
  googleButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#f3e8ff', // Açık renk yazı
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) 
  },

  switchContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { color: 'rgba(243, 232, 255, 0.8)', marginRight: 8, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
  switchButton: { color: '#d4af37', fontWeight: 'bold', fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
  closeButton: { position: 'absolute', top: 50, right: 24, zIndex: 10, padding: 8 },
  closeButtonText: { fontSize: 24, color: 'rgba(243, 232, 255, 0.6)' }
});

export default AuthScreen;