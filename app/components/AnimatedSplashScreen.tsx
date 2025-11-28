// app/components/AnimatedSplashScreen.tsx

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Props {
  onAnimationFinish: () => void;
}

const AnimatedSplashScreen: React.FC<Props> = ({ onAnimationFinish }) => {
  // Animasyon Değerleri
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animasyon Sıralaması
    Animated.sequence([
      // 1. Logo yavaşça belirsin ve hafifçe büyüsün
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. Çok kısa bekle
      Animated.delay(200),
      // 3. "TAROT NOVA" yazısı alttan yukarı süzülerek gelsin
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // 4. Kullanıcı logoyu görsün diye bekleme süresi
      Animated.delay(1000),
    ]).start(() => {
      // Animasyon bittiğinde ana sayfaya geçişi tetikle
      onAnimationFinish();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Uygulamanın koyu mor temasına uygun arka plan */}
      <LinearGradient
        colors={['#1d112b', '#0A0A0F']} 
        style={styles.background}
      />
      
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Assets klasöründeki görseli kullanıyoruz */}
          <Image 
            source={require('../../assets/transparent-logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          T A R O T N O V A
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1d112b', 
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
    width: width * 0.5, 
    height: width * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d4af37', // Altın rengi
    letterSpacing: 4,
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }),
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default AnimatedSplashScreen;