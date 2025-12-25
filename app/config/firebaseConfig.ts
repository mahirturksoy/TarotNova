// app/config/firebaseConfig.ts

import auth from '@react-native-firebase/auth';
import firestoreModule from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// React Native Firebase native SDK kullanıyoruz
// GoogleService-Info.plist (iOS) ve google-services.json (Android) otomatik olarak okunur

// Auth instance
const authInstance = auth();

// Firestore instance - doğru tipleme ile
const firestoreInstance: FirebaseFirestoreTypes.Module = firestoreModule();

export { authInstance as auth, firestoreInstance as firestore };

// Config bilgileri native SDK tarafından otomatik olarak yüklenir
export default {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};