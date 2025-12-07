// app/services/authService.ts

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../config/firebaseConfig';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Hata Tipi Tanımı
export interface AuthError {
  code: string;
  message: string;
}

// Google Sign-In Yapılandırması
// Not: webClientId, Firebase konsolundan alınan ID'dir. 
// google-services.json kullanıyorsan otomatik algılayabilir ama bazen manuel vermek gerekir.
GoogleSignin.configure({
  scopes: ['email', 'profile'],
});

// E-posta ile Giriş
export const signInWithEmail = async (email: string, pass: string): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    return await auth.signInWithEmailAndPassword(email, pass);
  } catch (error: unknown) {
    throw formatAuthError(error);
  }
};

// E-posta ile Kayıt
export const signUpWithEmail = async (email: string, pass: string): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    return await auth.createUserWithEmailAndPassword(email, pass);
  } catch (error: unknown) {
    throw formatAuthError(error);
  }
};

// Google ile Giriş
export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.UserCredential | null> => {
  try {
    // Cihazda Google Play Services var mı kontrol et
    await GoogleSignin.hasPlayServices();

    // Google'dan giriş yap ve token al
    const userInfo = await GoogleSignin.signIn();

    // Eğer idToken yoksa (nadiren olur) hata fırlat
    if (!userInfo.data?.idToken) {
        throw new Error('Google Sign-In failed: No idToken received');
    }

    // Token ile Firebase Credential oluştur (native SDK)
    const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);

    // Firebase'e giriş yap (native SDK)
    return await auth.signInWithCredential(googleCredential);
  } catch (error: unknown) {
    // Kullanıcı iptal ettiyse sessizce dön
    if (error && typeof error === 'object' && 'code' in error &&
        (error.code === '12501' || error.code === 'SIGN_IN_CANCELLED')) {
        throw { code: 'auth/cancelled-popup-request', message: 'Giriş iptal edildi.' };
    }
    throw formatAuthError(error);
  }
};

// Hata Mesajlarını Türkçeleştirme/Formatlama Yardımcısı
const formatAuthError = (error: unknown): AuthError => {
  let message = 'Bir hata oluştu.';
  let code = 'unknown';

  if (error && typeof error === 'object' && 'code' in error) {
    code = typeof error.code === 'string' ? error.code : 'unknown';

    switch (code) {
      case 'auth/invalid-email':
        message = 'Geçersiz e-posta adresi.';
        break;
      case 'auth/user-disabled':
        message = 'Bu hesap devre dışı bırakılmış.';
        break;
      case 'auth/user-not-found':
        message = 'Böyle bir kullanıcı bulunamadı.';
        break;
      case 'auth/wrong-password':
        message = 'Hatalı şifre.';
        break;
      case 'auth/email-already-in-use':
        message = 'Bu e-posta adresi zaten kullanımda.';
        break;
      case 'auth/weak-password':
        message = 'Şifre çok zayıf (en az 6 karakter olmalı).';
        break;
      case 'auth/network-request-failed':
        message = 'İnternet bağlantınızı kontrol edin.';
        break;
      default:
        if ('message' in error && typeof error.message === 'string') {
          message = error.message;
        } else {
          message = 'Giriş işlemi başarısız.';
        }
    }
  }

  return { code, message };
};