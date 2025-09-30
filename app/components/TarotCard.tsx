// app/components/TarotCard.tsx

import React, { useRef, useEffect } from 'react';
// DEĞİŞİKLİK: View ve TouchableOpacity eklendi
import { StyleSheet, TouchableOpacity, Animated, Text, Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TarotCardData } from '../constants/tarotDeck';
import { getCardImage } from '../constants/tarotDeck';

interface TarotCardProps {
  cardData: TarotCardData;
  isSelected: boolean;
  onPress: () => void;
}

const TarotCard: React.FC<TarotCardProps> = ({ cardData, isSelected, onPress }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isSelected ? 1 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const cardImage = getCardImage(cardData.imageName);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <LinearGradient
          colors={['#1d112b', '#4a044e']}
          style={styles.cardBack}
        >
          <View style={styles.cardBackBorder}>
            <Text style={styles.cardBackSymbol}>✧</Text>
          </View>
        </LinearGradient>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardFront, backAnimatedStyle]}>
        {cardImage && <Image source={cardImage} style={styles.cardImage} resizeMode="cover" />}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    aspectRatio: 0.6,
    borderRadius: 8,
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  cardFront: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  cardBack: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackBorder: {
    width: '85%',
    height: '92%',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackSymbol: {
    fontSize: 40,
    color: 'rgba(212, 175, 55, 0.7)',
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default TarotCard;