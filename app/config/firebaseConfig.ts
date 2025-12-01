// app/config/firebaseConfig.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore: Firebase RN tipleri bazen yanlış çözümlenir
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

// Config değerlerini ortam değişkenlerinden (.env) alıyoruz
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Config kontrolü (Opsiyonel güvenlik önlemi)
if (!firebaseConfig.apiKey) {
  console.error("⚠️ Firebase Config eksik! Lütfen .env dosyanızı kontrol edin.");
}

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  // @ts-ignore: Tip hatasını yoksay
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const firestore = getFirestore(app);

export { auth, firestore };
export default firebaseConfig;