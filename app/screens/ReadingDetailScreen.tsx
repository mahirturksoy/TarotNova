// app/screens/ReadingDetailScreen.tsx

import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { toggleReadingFavorite, deleteReading } from '../services/readingHistoryService';
import type { RootStackParamList } from '../types/navigation';
import type { ReadingHistoryItem } from '../services/readingHistoryService';
import ReadingDisplay from '../components/ReadingDisplay';
import MysticConfirmationModal from '../components/MysticConfirmationModal';

type ReadingDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReadingDetail'>;

interface RouteParams {
  reading: ReadingHistoryItem;
}

const ReadingDetailScreen: React.FC = () => {
  const navigation = useNavigation<ReadingDetailScreenNavigationProp>();
  const route = useRoute();
  const { reading: initialReading } = route.params as RouteParams;

  const [reading, setReading] = useState<ReadingHistoryItem>(initialReading);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleFavoriteToggle = async () => {
    if (isUpdating) return;
    try {
      setIsUpdating(true);
      await toggleReadingFavorite(reading.id);
      setReading(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    } catch (error) {
      console.error('Favori durumu değiştirilemedi:', error);
      Alert.alert('Hata', 'Favori durumu değiştirilemedi');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteReading = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteReading(reading.id);
      setDeleteModalVisible(false);
      navigation.goBack();
    } catch (error) {
      console.error('Okuma silinemedi:', error);
      setDeleteModalVisible(false);
      Alert.alert('Hata', 'Okuma silinemedi');
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleFavoriteToggle} disabled={isUpdating} style={styles.navButton}>
            <Text style={[styles.iconStar, reading.isFavorite && styles.favoriteIconActive]}>
              {reading.isFavorite ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteReading} style={styles.navButton}>
            <Text style={styles.iconX}>✕</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, reading.isFavorite, isUpdating]);
  
  const readingForDisplay = {
    question: reading.question,
    spreadType: reading.spreadType,
    selectedCards: reading.cards,
    holisticInterpretation: reading.holisticInterpretation,
    cardDetails: reading.cardDetails,
    summary: reading.summary,
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <LinearGradient
          colors={['#1d112b', '#2b173f', '#1d112b']}
          style={styles.backgroundGradient}
        >
          <ReadingDisplay readingData={readingForDisplay} />
        </LinearGradient>
      </ScrollView>

      {/* DEĞİŞİKLİK: Seçtiğiniz mistik başlık ve mesaj modal'a eklendi */}
      <MysticConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Sonsuzluğa Uğurla"
        subtitle="Bu okumayı anılar arasından sonsuzluğa uğurlamak bir daha geri getiremez. Devam edilsin mi?"
        buttons={[
          { text: 'İptal', onPress: () => setDeleteModalVisible(false), style: 'default' },
          { text: 'Sil', onPress: confirmDelete, style: 'destructive' },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d112b',
  },
  backgroundGradient: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  navButton: {
    padding: 4,
  },
  iconStar: {
    fontSize: 24,
    color: '#d4af37',
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  iconX: {
    fontSize: 22,
    color: '#d4af37',
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    transform: [{ translateY: 1.5 }], 
  },
  favoriteIconActive: {
    color: '#FFD700',
  },
});

export default ReadingDetailScreen;