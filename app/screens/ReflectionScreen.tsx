import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { saveReflection, ReflectionEntry } from '../services/reflectionService';
import type { RootStackParamList } from '../types/navigation';
import type { ReadingHistoryItem } from '../services/readingHistoryService';

type ReflectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reflection'>;

interface RouteParams {
  reading: ReadingHistoryItem;
}

type MoodType = 'enlightened' | 'confused' | 'peaceful' | 'motivated' | 'concerned';

const ReflectionScreen: React.FC = () => {
  const navigation = useNavigation<ReflectionScreenNavigationProp>();
  const route = useRoute();
  const { reading } = route.params as RouteParams;

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [personalNote, setPersonalNote] = useState('');
  const [insights, setInsights] = useState<string[]>(['']);
  const [actionPlan, setActionPlan] = useState('');
  const [helpfulness, setHelpfulness] = useState(0);
  const [resonance, setResonance] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const moodOptions: { value: MoodType; label: string; emoji: string; description: string }[] = [
    { 
      value: 'enlightened', 
      label: 'Aydınlanmış', 
      emoji: '💡', 
      description: 'Yeni perspektifler keşfettim' 
    },
    { 
      value: 'peaceful', 
      label: 'Huzurlu', 
      emoji: '🕊️', 
      description: 'İç huzur ve denge hissediyorum' 
    },
    { 
      value: 'motivated', 
      label: 'Motive', 
      emoji: '🚀', 
      description: 'Harekete geçmek istiyorum' 
    },
    { 
      value: 'confused', 
      label: 'Kafam Karışık', 
      emoji: '🤔', 
      description: 'Daha fazla düşünmem gerekiyor' 
    },
    { 
      value: 'concerned', 
      label: 'Endişeli', 
      emoji: '😟', 
      description: 'Bazı konular beni düşündürüyor' 
    }
  ];

  const addInsight = () => {
    if (insights.length < 5) {
      setInsights([...insights, '']);
    }
  };

  const updateInsight = (index: number, value: string) => {
    const newInsights = [...insights];
    newInsights[index] = value;
    setInsights(newInsights);
  };

  const removeInsight = (index: number) => {
    if (insights.length > 1) {
      const newInsights = insights.filter((_, i) => i !== index);
      setInsights(newInsights);
    }
  };

  const renderStarRating = (value: number, onSelect: (rating: number) => void, label: string) => (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onSelect(star)}
            style={styles.starButton}
          >
            <Text style={[
              styles.star,
              star <= value ? styles.starActive : styles.starInactive
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleSave = async () => {
    if (!selectedMood || personalNote.trim().length < 10) {
      Alert.alert(
        'Eksik Bilgi',
        'Lütfen ruh halinizi seçin ve en az 10 karakter kişisel not yazın.'
      );
      return;
    }

    if (helpfulness === 0 || resonance === 0) {
      Alert.alert(
        'Değerlendirme Gerekli',
        'Lütfen okumayı yardımcılık ve rezonans açısından değerlendirin.'
      );
      return;
    }

    try {
      setIsSaving(true);

      const filteredInsights = insights.filter(insight => insight.trim().length > 0);

      const reflectionData: Omit<ReflectionEntry, 'id' | 'createdAt'> = {
        readingId: reading.id,
        mood: selectedMood,
        personalNote: personalNote.trim(),
        insights: filteredInsights,
        actionPlan: actionPlan.trim(),
        helpfulness,
        resonance
      };

      await saveReflection(reflectionData);

      Alert.alert(
        'Yansıtma Kaydedildi',
        'Derin düşünceleriniz başarıyla kaydedildi. Bu değerli öz-değerlendirme kişisel gelişiminize katkı sağlayacak.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Yansıtma kaydedilemedi:', error);
      Alert.alert('Hata', 'Yansıtma kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#1e3c72']}
        style={styles.backgroundGradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Derin Düşünce Zamanı</Text>
            <Text style={styles.subtitle}>
              Bu okuma size nasıl hissettirdi? Düşüncelerinizi kaydedin.
            </Text>
          </View>

          {/* Reading Reference */}
          <View style={styles.readingReference}>
            <Text style={styles.readingTitle}>{reading.readingTitle}</Text>
            <Text style={styles.readingQuestion}>"{reading.question}"</Text>
          </View>

          {/* Mood Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Şu anda nasıl hissediyorsunuz?</Text>
            <View style={styles.moodGrid}>
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodOption,
                    selectedMood === mood.value && styles.selectedMoodOption
                  ]}
                  onPress={() => setSelectedMood(mood.value)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    selectedMood === mood.value && styles.selectedMoodLabel
                  ]}>
                    {mood.label}
                  </Text>
                  <Text style={styles.moodDescription}>{mood.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Personal Note */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kişisel Notlarınız</Text>
            <Text style={styles.sectionSubtitle}>
              Bu okuma size ne düşündürdü? Hangi duygular uyandırdı?
            </Text>
            <TextInput
              style={styles.textArea}
              value={personalNote}
              onChangeText={setPersonalNote}
              placeholder="Bu okuma beni şöyle hissettirdi... Özellikle ... kartının mesajı..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keşfettiğiniz İçgörüler</Text>
            <Text style={styles.sectionSubtitle}>
              Hangi yeni perspektifleri fark ettiniz?
            </Text>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightRow}>
                <TextInput
                  style={styles.insightInput}
                  value={insight}
                  onChangeText={(value) => updateInsight(index, value)}
                  placeholder={`İçgörü ${index + 1}: Örneğin "İlişkilerimde daha sabırlı olmam gerekiyor"`}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
                {insights.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeInsight(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {insights.length < 5 && (
              <TouchableOpacity style={styles.addButton} onPress={addInsight}>
                <Text style={styles.addButtonText}>+ İçgörü Ekle</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Action Plan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eylem Planı</Text>
            <Text style={styles.sectionSubtitle}>
              Bu öğrendiklerinizi hayatınızda nasıl uygulayacaksınız?
            </Text>
            <TextInput
              style={styles.textArea}
              value={actionPlan}
              onChangeText={setActionPlan}
              placeholder="Bu hafta şunu yapmayı planlıyorum... Öncelikle..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Ratings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Okuma Değerlendirmesi</Text>
            {renderStarRating(helpfulness, setHelpfulness, 'Bu okuma ne kadar yardımcı oldu?')}
            {renderStarRating(resonance, setResonance, 'Mesajlar sizinle ne kadar rezonans kurdu?')}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={isSaving ? ['#6B7280', '#4B5563'] : ['#E8B923', '#F59E0B']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Kaydediliyor...' : 'Yansıtmayı Kaydet'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  backgroundGradient: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  contentContainer: {
    paddingBottom: 30,
  },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  readingReference: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  readingTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  readingQuestion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#2d3748',
    marginBottom: 8,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 16,
    lineHeight: 20,
  },
  
  moodGrid: {
    gap: 12,
  },
  
  moodOption: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  selectedMoodOption: {
    backgroundColor: '#e6f3ff',
    borderColor: '#3182ce',
  },
  
  moodEmoji: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  moodLabel: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  selectedMoodLabel: {
    color: '#3182ce',
  },
  
  moodDescription: {
    fontSize: 12,
    color: '#4a5568',
    textAlign: 'center',
  },
  
  textArea: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2d3748',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    textAlignVertical: 'top',
  },
  
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  
  insightInput: {
    flex: 1,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#2d3748',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  removeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold' as const,
  },
  
  addButton: {
    backgroundColor: '#e6f3ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3182ce',
    borderStyle: 'dashed',
  },
  
  addButtonText: {
    fontSize: 14,
    color: '#3182ce',
    fontWeight: 'bold' as const,
  },
  
  ratingContainer: {
    marginBottom: 20,
  },
  
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2d3748',
    marginBottom: 12,
  },
  
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  
  starButton: {
    padding: 4,
  },
  
  star: {
    fontSize: 32,
  },
  
  starActive: {
    color: '#f59e0b',
  },
  
  starInactive: {
    color: '#d1d5db',
  },
  
  saveButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  saveButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#ffffff',
  },
});

export default ReflectionScreen;