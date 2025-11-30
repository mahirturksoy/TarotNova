// app/screens/ReadingScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next"; // <-- ÇEVİRİ

import { useReadingContext } from "../context/ReadingContext";
import { saveReading } from "../services/readingHistoryService";
import type { RootStackParamList, TabParamList } from "../types/navigation";
import ReadingDisplay from "../components/ReadingDisplay";
import MysticSuccessModal from "../components/MysticSuccessModal";

type ReadingScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "Reading">,
  BottomTabNavigationProp<TabParamList>
>;

const ReadingScreen: React.FC = () => {
  const navigation = useNavigation<ReadingScreenNavigationProp>();
  const { t } = useTranslation(); // <-- Hook
  const {
    currentReading,
    holisticInterpretation,
    cardDetails,
    summary,
    isLoading,
  } = useReadingContext();
  const [isSaving, setIsSaving] = useState(false);
  const [readingSaved, setReadingSaved] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    checkAutoSave();
    // Başlığı dinamik olarak güncelle
    navigation.setOptions({
        title: t('reading.title'),
        headerBackTitle: t('common.back')
    });
  }, [currentReading, holisticInterpretation, t]);

  const checkAutoSave = async () => {
    try {
      const preferences = await AsyncStorage.getItem("@user_preferences");
      if (preferences) {
        const prefs = JSON.parse(preferences);
        if (prefs.autoSave && currentReading && holisticInterpretation) {
          await handleSaveReading();
        }
      }
    } catch (error) {
      console.error("Otomatik kayıt kontrolü hatası:", error);
    }
  };

  const handleSaveReading = async () => {
    if (!currentReading || !holisticInterpretation || readingSaved) return;

    setIsSaving(true);
    try {
      await saveReading({
        question: currentReading.question,
        mood: currentReading.mood,
        cards: currentReading.selectedCards,
        spreadType: currentReading.spreadType,
        holisticInterpretation,
        cardDetails: cardDetails || [],
        lifeAspects: { love: "", career: "", personal: "" },
        summary: summary || "",
        confidence: 85,
        readingTitle: generateReadingTitle(),
      });

      setReadingSaved(true);
      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
      }, 2000);
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      Alert.alert(t('common.error'), "Okuma kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  };

  const generateReadingTitle = () => {
    const date = new Date();
    const timeStr = date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (currentReading?.spreadType) {
      return `${currentReading.spreadType.name} - ${timeStr}`;
    }
    return `Tarot Okuması - ${timeStr}`;
  };

  const handleNewReading = () => {
    navigation.navigate("Main", { screen: "Ana Sayfa" } as any);
  };

  const handleViewHistory = () => {
    navigation.navigate("Main", { screen: "Geçmiş" } as any);
  };

  if (isLoading || !currentReading) {
    return (
      <LinearGradient
        colors={["#1d112b", "#2b173f", "#1d112b"]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d4af37" />
          <Text style={styles.loadingText}>{t('home.analyzing')}</Text>
          <Text style={styles.loadingSubText}>Nova AI</Text>
        </View>
      </LinearGradient>
    );
  }

  const readingForDisplay = {
    question: currentReading.question,
    spreadType: currentReading.spreadType,
    selectedCards: currentReading.selectedCards,
    holisticInterpretation,
    cardDetails,
    summary,
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <LinearGradient
          colors={["#1d112b", "#2b173f", "#1d112b"]}
          style={styles.backgroundGradient}
        >
          <ReadingDisplay readingData={readingForDisplay} />
          <View style={styles.actionButtons}>
            {!readingSaved && (
              <TouchableOpacity
                style={[styles.actionButtonBase, styles.actionButton]}
                onPress={handleSaveReading}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#d4af37" />
                ) : (
                  <>
                    <Text style={styles.actionButtonIcon}>✦</Text>
                    <Text style={styles.actionButtonText}>{t('common.save')}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButtonBase, styles.actionButton]}
              onPress={handleNewReading}
            >
              <Text style={styles.actionButtonIcon}>+</Text>
              <Text style={styles.actionButtonText}>{t('reading.newReading')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButtonBase, styles.actionButton]}
              onPress={handleViewHistory}
            >
              <Text style={styles.actionButtonIcon}>❋</Text>
              <Text style={styles.actionButtonText}>{t('tab.history')}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>

      <MysticSuccessModal
        visible={isSuccessModalVisible}
        title={t('reading.modalSaved.title')}
        subtitle={t('reading.modalSaved.subtitle')}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1d112b",
  },
  backgroundGradient: { flex: 1 },
  contentContainer: { paddingBottom: 100 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f3e8ff",
    marginTop: 16,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
  },
  loadingSubText: {
    fontSize: 14,
    color: "rgba(243, 232, 255, 0.7)",
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButtonBase: {
    flex: 1,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "48%",
  },
  actionButton: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "#d4af37",
    flexDirection: "row",
    gap: 8,
  },
  actionButtonIcon: { fontSize: 18, color: "#d4af37" },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#d4af37",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
  },
});

export default ReadingScreen;