// app/components/UserInputFormComponent.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next'; // <-- ÇEVİRİ EKLENDİ

type MoodType = 'Mutlu' | 'Kararsız' | 'Endişeli' | null; // Tip tanımları aynı

interface UserInputFormComponentProps {
  onSubmit: (question: string, mood: string) => void;
  isLoading?: boolean;
}

const UserInputFormComponent: React.FC<UserInputFormComponentProps> = ({ 
  onSubmit, 
  isLoading = false 
}) => {
  const { t } = useTranslation(); // <-- HOOK
  const [question, setQuestion] = useState<string>('');
  const [mood, setMood] = useState<MoodType>(null);

  const moodOptions = [
    { value: 'Mutlu', label: t('home.moods.happy'), emoji: '😊' },
    { value: 'Kararsız', label: t('home.moods.neutral'), emoji: '🤔' },
    { value: 'Endişeli', label: t('home.moods.sad'), emoji: '😟' },
  ];

  // ... (Geri kalan mantık aynı)

  const handleSubmit = () => {
    if (question.trim() && mood && !isLoading) {
      Keyboard.dismiss();
      onSubmit(question.trim(), mood);
    }
  };

  const isFormValid = question.trim().length > 0 && mood !== null && !isLoading;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('home.askNova')}</Text>
        <TextInput
          style={[styles.questionInput, isLoading && styles.disabledInput]}
          value={question}
          onChangeText={setQuestion}
          placeholder={t('home.askPlaceholder')}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isLoading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('home.moodLabel')}</Text>
        <View style={styles.moodGrid}>
          {moodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.moodButton, mood === option.value && styles.selectedMoodButton, isLoading && styles.disabledButton]}
              onPress={() => !isLoading && setMood(option.value as MoodType)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.moodEmoji}>{option.emoji}</Text>
              <Text style={[styles.moodButtonText, mood === option.value && styles.selectedMoodButtonText, isLoading && styles.disabledText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isFormValid}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.loadingText}>{t('home.analyzing')}</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>{t('home.interpretBtn')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ... Styles aynı
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 14,
    textAlign: 'center',
  },
  questionInput: {
    backgroundColor: '#f7fafc',
    borderRadius: 15,
    padding: 18,
    fontSize: 16,
    color: '#2d3748',
    minHeight: 100,
    borderWidth: 2,
    borderColor: 'transparent',
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#e2e8f0',
    color: '#a0aec0',
  },
  moodGrid: {
    flexDirection: 'column',
    gap: 14,
  },
  moodButton: {
    backgroundColor: '#f7fafc',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  selectedMoodButton: {
    backgroundColor: '#e6f3ff',
    borderColor: '#3182ce',
  },
  disabledButton: {
    opacity: 0.5,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4a5568',
  },
  selectedMoodButtonText: {
    color: '#3182ce',
    fontWeight: '700',
  },
  disabledText: {
    color: '#a0aec0',
  },
  submitButton: {
    backgroundColor: '#3182ce',
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3182ce',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#a0aec0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UserInputFormComponent;