import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

// Context Provider
import { ReadingProvider } from './app/context/ReadingContext';

// Ekran bileşenleri
import HomeScreen from './app/screens/HomeScreen';
import CardSelectionScreen from './app/screens/CardSelectionScreen';
import ReadingScreen from './app/screens/ReadingScreen';

// Navigasyon tipleri
import { RootStackParamList } from './app/types/navigation';

// Stack Navigator oluşturma
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Ana uygulama bileşeni - Expo projesinin giriş noktası
 * Navigasyon ve global state yönetimini kurar
 */
export default function App(): JSX.Element {
  return (
    <ReadingProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2c3e50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerTitleAlign: 'center',
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: '✨ TarotNova',
              headerShown: true,
            }}
          />
          
          <Stack.Screen
            name="CardSelection"
            component={CardSelectionScreen}
            options={{
              title: '🎴 Kart Seçimi',
              headerShown: true,
              headerBackTitle: 'Geri',
            }}
          />
          
          <Stack.Screen
            name="Reading"
            component={ReadingScreen}
            options={{
              title: '🌟 Nova Yorumu',
              headerShown: true,
              headerBackTitle: 'Geri',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ReadingProvider>
  );
}

// Ana stil tanımlamaları (şu an kullanılmıyor ama gelecek için hazır)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});