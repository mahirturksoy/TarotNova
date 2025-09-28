// app/App.tsx

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from "react-native";

// Context Provider
import { ReadingProvider } from "./app/context/ReadingContext";

// Ekran bileşenleri
import HomeScreen from "./app/screens/HomeScreen";
import SpreadSelectionScreen from "./app/screens/SpreadSelectionScreen";
import CardSelectionScreen from "./app/screens/CardSelectionScreen";
import ReadingScreen from "./app/screens/ReadingScreen";
import ReadingHistoryScreen from "./app/screens/ReadingHistoryScreen";
import ReadingDetailScreen from "./app/screens/ReadingDetailScreen";
import ReflectionScreen from "./app/screens/ReflectionScreen";
import AchievementsScreen from "./app/screens/AchievementsScreen";
import FavoritesScreen from "./app/screens/FavoritesScreen";
import ProfileScreen from './app/screens/ProfileScreen';


// Navigasyon tipleri
import { RootStackParamList } from "./app/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Ana sayfa stack navigator
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2c3e50",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "TarotNova",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="SpreadSelection"
        component={SpreadSelectionScreen}
        options={{
          title: "Okuma Türü",
          headerShown: true,
          headerBackTitle: "Geri",
        }}
      />
      <Stack.Screen
        name="CardSelection"
        component={CardSelectionScreen}
        options={{
          title: "Kart Seçimi",
          headerShown: true,
          headerBackTitle: "Geri",
        }}
      />
      <Stack.Screen
        name="Reading"
        component={ReadingScreen}
        options={{
          title: "Nova Yorumu",
          headerShown: true,
          headerBackTitle: "Geri",
        }}
      />
    </Stack.Navigator>
  );
};

// Geçmiş stack navigator
const HistoryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2c3e50",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="ReadingHistory"
        component={ReadingHistoryScreen}
        options={{
          title: "Okuma Geçmişi",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ReadingDetail"
        component={ReadingDetailScreen}
        options={{
          title: "Okuma Detayı",
          headerShown: false,
          headerBackTitle: "Geri",
        }}
      />
      <Stack.Screen
        name="Reflection"
        component={ReflectionScreen}
        options={{
          title: "Derin Düşünce",
          headerShown: true,
          headerBackTitle: "Geri",
        }}
      />
    </Stack.Navigator>
  );
};

// Favoriler ekranı (basit placeholder)
<Tab.Screen
  name="Favoriler"
  component={FavoritesScreen} // Artık gerçek component
  options={{
    tabBarLabel: "Favoriler",
    headerShown: false, // Header'ı kaldırdık çünkü component içinde var
  }}
/>;

// Profil ekranı (basit placeholder)
<Tab.Screen 
  name="Profil" 
  component={ProfileScreen}  // Gerçek component
  options={{
    tabBarLabel: 'Profil',
    headerShown: false,  // Component içinde kendi header'ı var
  }}
/>

// Tab icon component
const TabIcon = ({
  name,
  color,
  focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) => {
  const icons: Record<string, string> = {
    "Ana Sayfa": "🏠",
    Geçmiş: "📚",
    Favoriler: "⭐",
    Başarımlar: "🏆",
    Profil: "👤",
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icons[name]}
      </Text>
    </View>
  );
};

// Ana Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, focused }) => (
          <TabIcon name={route.name} color={color} focused={focused} />
        ),
        tabBarActiveTintColor: "#E8B923",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#1A1A2E",
          borderTopWidth: 0,
          height: 85, // 60'dan 85'e çıkardık
          paddingBottom: 25, // 8'den 25'e çıkardık - iPhone alt çizgisi için
          paddingTop: 10, // 8'den 10'a çıkardık
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          // Gölge efekti (opsiyonel)
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 5, // Label'ı biraz yukarı aldık
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Ana Sayfa"
        component={HomeStack}
        options={{
          tabBarLabel: "Ana Sayfa",
        }}
      />
      <Tab.Screen
        name="Geçmiş"
        component={HistoryStack}
        options={{
          tabBarLabel: "Geçmiş",
        }}
      />
      <Tab.Screen
        name="Favoriler"
        component={FavoritesScreen}
        options={{
          tabBarLabel: "Favoriler",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
        }}
      />
      <Tab.Screen
        name="Başarımlar"
        component={AchievementsScreen}
        options={{
          tabBarLabel: "Başarımlar",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profil",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
        }}
      />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <ReadingProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <TabNavigator />
      </NavigationContainer>
    </ReadingProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    fontSize: 24,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e3c72",
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});

export default App;
