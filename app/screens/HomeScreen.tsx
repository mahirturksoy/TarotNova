// HomeScreen.tsx - Klavye yönetimi eklenmiş versiyon

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import UserInputFormComponent from '../components/UserInputFormComponent';
import { useReadingContext } from '../context/ReadingContext';
import { RootStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isLoading } = useReadingContext();
  
  const handleFormSubmit = async (question: string, mood: string) => {
    try {
      console.log('Form gönderildi:', { question, mood });
      Keyboard.dismiss(); // Klavyeyi kapat
      navigation.navigate('SpreadSelection', { question, mood });
    } catch (error) {
      console.error('Form submit hatası:', error);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo ve Başlık Bölümü */}
            <View style={styles.heroSection}>
              <View style={styles.logoContainer}>
                <View style={styles.catSilhouette}>
                  <View style={styles.catBody}>
                    <View style={[styles.star, styles.star1]} />
                    <View style={[styles.star, styles.star2]} />
                    <View style={[styles.star, styles.star3]} />
                    <View style={[styles.star, styles.star4]} />
                    <View style={[styles.star, styles.star5]} />
                    <View style={[styles.crescent, styles.crescent1]} />
                    <View style={[styles.crescent, styles.crescent2]} />
                  </View>
                </View>
              </View>
              
              <Text style={styles.appTitle}>TarotNova</Text>
              <Text style={styles.appSubtitle}>
                Mistik Yolculuğunuz ✨
              </Text>
            </View>

            {/* Form Bölümü */}
            <View style={styles.formContainer}>
              <UserInputFormComponent 
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
              />
            </View>

            {/* Boş alan - tab bar için */}
            <View style={styles.spacer} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
  },
  
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  
  logoContainer: {
    marginBottom: 24,
  },
  
  catSilhouette: {
    width: 180,
    height: 110,
    backgroundColor: '#1a365d',
    borderRadius: 55,
    position: 'relative',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  
  catBody: {
    flex: 1,
    borderRadius: 55,
    position: 'relative',
    overflow: 'hidden',
  },
  
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  
  star1: { top: 20, left: 28 },
  star2: { top: 40, left: 75 },
  star3: { top: 60, left: 45 },
  star4: { top: 30, left: 110 },
  star5: { top: 70, left: 140 },
  
  crescent: {
    position: 'absolute',
    width: 11,
    height: 11,
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 5.5,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  
  crescent1: { top: 25, left: 55 },
  crescent2: { top: 50, left: 100 },
  
  appTitle: {
    fontSize: 34,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  
  appSubtitle: {
    fontSize: 16,
    color: '#b3d9ff',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  
  formContainer: {
    paddingHorizontal: 20,
  },
  
  spacer: {
    height: 100,
  },
});

export default HomeScreen;