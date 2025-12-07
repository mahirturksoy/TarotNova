import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// TarotCardComponent props interface tanımı
interface TarotCardComponentProps {
  name: string;
  id: number;
  isSelected: boolean;
  onPress: () => void;
  selectionIndex?: number;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}

// Premium Tarot kartı bileşeni
const TarotCardComponent: React.FC<TarotCardComponentProps> = ({ 
  name, 
  id,
  isSelected,
  onPress,
  selectionIndex,
  size = 'medium',
  style
}) => {
  // Animasyon referansları
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Kart boyutları
  const cardSizes = {
    small: { width: 80, height: 120 },
    medium: { width: 100, height: 150 },
    large: { width: 120, height: 180 },
  };

  const cardSize = cardSizes[size];

  // Seçilme animasyonu
  useEffect(() => {
    if (isSelected) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected]);

  // Press animasyonu
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      useNativeDriver: true,
    }).start();
  };

  // Animasyon interpolasyonları
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[styles.touchable, style]}
    >
      <Animated.View
        style={[
          styles.cardContainer,
          {
            width: cardSize.width,
            height: cardSize.height,
            transform: [
              { scale: scaleAnim },
              { rotate: rotateInterpolation },
            ],
          },
        ]}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: glowOpacity,
              width: cardSize.width + 8,
              height: cardSize.height + 8,
            },
          ]}
        >
          <LinearGradient
            colors={['#E8B923', '#6B46C1']}
            style={styles.glowGradient}
          />
        </Animated.View>

        {/* Ana kart */}
        <LinearGradient
          colors={isSelected 
            ? ['#E8B923', '#F59E0B', '#FBBF24']
            : ['#1F2937', '#374151', '#4B5563']}
          style={[styles.card, { width: cardSize.width, height: cardSize.height }]}
        >
          {/* Kart içeriği */}
          <View style={styles.cardContent}>
            {/* Üst ornament */}
            <View style={styles.topOrnament}>
              <View style={styles.ornamentLine} />
              <View style={styles.ornamentCenter} />
              <View style={styles.ornamentLine} />
            </View>

            {/* Kart numarası */}
            <View style={styles.numberContainer}>
              <Text style={[
                styles.cardNumber,
                isSelected && styles.selectedNumber
              ]}>
                {id}
              </Text>
            </View>

            {/* Merkez simge alanı */}
            <View style={styles.symbolContainer}>
              <View style={[
                styles.symbolBackground,
                isSelected && styles.selectedSymbolBackground
              ]}>
                <View style={styles.mysticalSymbol}>
                  <View style={[
                    styles.symbolStar,
                    isSelected && styles.selectedSymbol
                  ]} />
                  <View style={[
                    styles.symbolMoon,
                    isSelected && styles.selectedSymbol
                  ]} />
                </View>
              </View>
            </View>

            {/* Alt ornament */}
            <View style={styles.bottomOrnament}>
              <View style={styles.ornamentLine} />
              <View style={styles.ornamentCenter} />
              <View style={styles.ornamentLine} />
            </View>
          </View>

          {/* Seçim göstergesi */}
          {isSelected && selectionIndex && (
            <View style={styles.selectionBadge}>
              <Text style={styles.selectionText}>{selectionIndex}</Text>
            </View>
          )}

          {/* Kart kenarı efekti */}
          <View style={[
            styles.cardBorder,
            isSelected && styles.selectedBorder
          ]} />
        </LinearGradient>

        {/* Kart adı */}
        <View style={styles.nameContainer}>
          <Text style={[
            styles.cardName,
            isSelected && styles.selectedCardName
          ]} numberOfLines={2}>
            {name}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    alignItems: 'center',
    marginVertical: 8,
  },
  
  cardContainer: {
    alignItems: 'center',
    position: 'relative',
  },

  glowContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    borderRadius: 16,
  },

  glowGradient: {
    flex: 1,
    borderRadius: 16,
    opacity: 0.4,
  },

  card: {
    borderRadius: 16,
    padding: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  topOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },

  bottomOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },

  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  ornamentCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },

  numberContainer: {
    position: 'absolute',
    top: 4,
    left: 4,
  },

  cardNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  selectedNumber: {
    color: '#0A0A0F',
  },

  symbolContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  symbolBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  selectedSymbolBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: '#0A0A0F',
  },

  mysticalSymbol: {
    width: 24,
    height: 24,
    position: 'relative',
  },

  symbolStar: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    top: 8,
    left: 8,
  },

  symbolMoon: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
    top: 6,
    right: 2,
  },

  selectedSymbol: {
    backgroundColor: '#0A0A0F',
    borderColor: '#0A0A0F',
  },

  cardBorder: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  selectedBorder: {
    borderColor: '#0A0A0F',
    borderWidth: 2,
  },

  selectionBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8B923',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  selectionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A0A0F',
  },

  nameContainer: {
    marginTop: 8,
    width: 100,
  },

  cardName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 14,
  },

  selectedCardName: {
    color: '#E8B923',
    fontWeight: 'bold',
  },
});

export default TarotCardComponent;