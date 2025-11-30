// app/screens/FavoritesScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next'; 

import { ReadingHistoryItem, getFavoriteReadings, toggleReadingFavorite } from '../services/readingHistoryService';
import type { RootStackParamList, TabParamList } from '../types/navigation';
import { MAJOR_ARCANA, getCardImage } from '../constants/tarotDeck';
import MysticConfirmationModal from '../components/MysticConfirmationModal';

const cardDataMap = new Map(MAJOR_ARCANA.map(card => [card.name, card]));

type FavoritesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Favoriler'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(); 
  
  const [favoriteReadings, setFavoriteReadings] = useState<ReadingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [readingToUnfavorite, setReadingToUnfavorite] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { loadFavoriteReadings(); }, []));

  const loadFavoriteReadings = async () => {
    try {
      setIsLoading(true);
      const favorites = await getFavoriteReadings();
      setFavoriteReadings(favorites);
    } catch (error) {
      console.error('Favori okumalar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = (readingId: string) => {
    setReadingToUnfavorite(readingId);
    setModalVisible(true);
  };

  const confirmUnfavorite = async () => {
    if (!readingToUnfavorite) return;
    try {
      await toggleReadingFavorite(readingToUnfavorite);
      setModalVisible(false);
      await loadFavoriteReadings();
    } catch (error) {
      console.error('Favorilerden çıkarılamadı:', error);
      setModalVisible(false);
    } finally {
      setReadingToUnfavorite(null);
    }
  };

  const handleReadingPress = (reading: ReadingHistoryItem) => {
    navigation.navigate('ReadingDetail', { reading });
  };
  
  const renderFavoriteCard = ({ item }: { item: ReadingHistoryItem }) => {
    return (
      <TouchableOpacity style={styles.favoriteCard} onPress={() => handleReadingPress(item)} activeOpacity={0.8}>
        <LinearGradient colors={['rgba(74, 4, 78, 0.3)', 'rgba(74, 4, 78, 0.5)']} style={styles.cardGradient}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardQuestion} numberOfLines={2}>"{item.question}"</Text>
            <TouchableOpacity style={styles.favoriteButton} onPress={() => handleRemoveFavorite(item.id)}>
              <Text style={styles.favoriteIcon}>★</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardImageGallery}>
            {item.cards.map((cardName, index) => {
              const card = cardDataMap.get(cardName);
              if (!card) return null;
              const cardImage = getCardImage(card.imageName);
              return ( <View key={index} style={styles.miniCardContainer}><Image source={cardImage} style={styles.miniCardImage} /></View> );
            })}
          </ScrollView>
          <View style={styles.wisdomContainer}><Text style={styles.wisdomText} numberOfLines={3}>{item.summary}</Text></View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // DÜZELTME 1: Emoji yerine Mistik Nova Yıldızı (✦) kullanıldı ve stillendirildi.
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.mysticEmptyIcon}>✦</Text> 
      <Text style={styles.emptyStateTitle}>{t('favorites.empty.title')}</Text>
      <Text style={styles.emptyStateText}>{t('favorites.empty.subtitle')}</Text>
    </View>
  );

  return (
    <>
      <LinearGradient colors={['#1d112b', '#2b173f', '#1d112b']} style={styles.container}>
        <FlatList
          data={favoriteReadings}
          renderItem={renderFavoriteCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingTop: insets.top + 20 }]} 
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </LinearGradient>

      <MysticConfirmationModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title={t('favorites.removeModal.title')}
        subtitle={t('favorites.removeModal.message')}
        buttons={[
          { text: t('common.cancel'), onPress: () => setModalVisible(false), style: 'default' },
          { text: t('favorites.removeModal.btn'), onPress: confirmUnfavorite, style: 'destructive' },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  favoriteCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#701a75' },
  cardGradient: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardQuestion: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#d4af37', fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }), lineHeight: 24, marginRight: 10 },
  favoriteButton: { padding: 4 },
  favoriteIcon: { fontSize: 22, color: '#d4af37' },
  cardImageGallery: { paddingBottom: 16, gap: 8 },
  miniCardContainer: { width: 60, aspectRatio: 0.6, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)' },
  miniCardImage: { width: '100%', height: '100%' },
  wisdomContainer: { borderTopWidth: 1, borderTopColor: 'rgba(212, 175, 55, 0.2)', paddingTop: 12 },
  wisdomText: { fontSize: 14, color: 'rgba(243, 232, 255, 0.8)', fontFamily: Platform.select({ ios: 'Georgia-Italic', android: 'serif' }), fontStyle: 'italic', lineHeight: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40, marginTop: '20%' },
  
  // YENİ STİL: Mistik Yıldız için
  mysticEmptyIcon: { 
    fontSize: 80, 
    color: '#d4af37', 
    marginBottom: 20,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20
  },
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#f3e8ff', marginBottom: 8, textAlign: 'center', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
  emptyStateText: { fontSize: 16, color: 'rgba(243, 232, 255, 0.8)', textAlign: 'center', lineHeight: 24 },
});

export default FavoritesScreen;