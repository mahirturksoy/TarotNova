import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// TarotCardComponent props interface tanımı
interface TarotCardComponentProps {
  name: string;
  imageUrl: string;
  isSelected: boolean;
}

// Tarot kartı bileşeni - Kartı görsel ve metin olarak gösterir
const TarotCardComponent: React.FC<TarotCardComponentProps> = ({ 
  name, 
  imageUrl, 
  isSelected 
}) => {
  return (
    <View style={[
      styles.cardContainer, 
      isSelected && styles.selectedCard // Seçili kart için ekstra stil
    ]}>
      {/* Kart resmi */}
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.cardImage}
        resizeMode="contain"
      />
      
      {/* Kart ismi */}
      <Text style={[
        styles.cardName,
        isSelected && styles.selectedCardName
      ]}>
        {name}
      </Text>
    </View>
  );
};

// Stil tanımlamaları
const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    padding: 16,
    margin: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#007AFF', // iOS mavi rengi
    backgroundColor: '#e8f4f8',
    shadowOpacity: 0.3,
  },
  cardImage: {
    width: 100,
    height: 150,
    marginBottom: 12,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  selectedCardName: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default TarotCardComponent;