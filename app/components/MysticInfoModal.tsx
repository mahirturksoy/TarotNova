// app/components/MysticInfoModal.tsx

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  Platform, 
  Easing, 
  ScrollView, 
  Dimensions 
} from 'react-native';

const { height } = Dimensions.get('window');

interface ModalButton {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface MysticInfoModalProps {
  visible: boolean;
  title: string;
  icon?: string;
  content: string;
  buttons?: ModalButton[];
  onClose: () => void;
}

const MysticInfoModal: React.FC<MysticInfoModalProps> = ({
  visible,
  title,
  icon = '✦',
  content,
  buttons,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Butonları render eden yardımcı fonksiyon
  const renderButtons = () => {
    if (!buttons || buttons.length === 0) {
      return (
        <TouchableOpacity style={[styles.button, styles.primaryButton, { width: '100%' }]} onPress={onClose}>
          <Text style={styles.primaryButtonText}>Tamam</Text>
        </TouchableOpacity>
      );
    }

    // Eğer 3 buton varsa (Instagram, TikTok, Kapat gibi), özel düzen:
    // İlk ikisi yan yana, sonuncusu (Kapat) en altta tam genişlik.
    if (buttons.length === 3) {
      return (
        <View style={styles.customButtonLayout}>
          <View style={styles.rowButtons}>
            {buttons.slice(0, 2).map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  btn.variant === 'secondary' ? styles.secondaryButton : styles.primaryButton,
                  { flex: 1 }
                ]}
                onPress={btn.onPress}
              >
                <Text style={[
                  styles.buttonText,
                  btn.variant === 'secondary' ? styles.secondaryButtonText : styles.primaryButtonText,
                  { fontSize: 14 } // Metni biraz küçültelim sığması için
                ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Son buton (Genelde Kapat) */}
          <TouchableOpacity
            style={[
              styles.button,
              buttons[2].variant === 'secondary' ? styles.secondaryButton : styles.primaryButton,
              { width: '100%', marginTop: 8 }
            ]}
            onPress={buttons[2].onPress}
          >
            <Text style={[
              styles.buttonText,
              buttons[2].variant === 'secondary' ? styles.secondaryButtonText : styles.primaryButtonText
            ]}>
              {buttons[2].text}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Standart durum (1 veya 2 buton)
    return (
      <View style={styles.buttonContainer}>
        {buttons.map((btn, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              btn.variant === 'secondary' ? styles.secondaryButton : styles.primaryButton,
              buttons.length > 1 && { flex: 1 }
            ]}
            onPress={btn.onPress}
          >
            <Text style={[
              styles.buttonText,
              btn.variant === 'secondary' ? styles.secondaryButtonText : styles.primaryButtonText
            ]}>
              {btn.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backgroundOverlay, { opacity: opacityAnim }]} />
        
        <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.scrollContainer}>
            <ScrollView 
              showsVerticalScrollIndicator={true}
              indicatorStyle="white"
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.textContent}>{content}</Text>
            </ScrollView>
          </View>

          {renderButtons()}
          
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '85%',
    maxHeight: height * 0.75,
    backgroundColor: 'rgba(43, 23, 63, 0.98)',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  icon: {
    fontSize: 48,
    color: '#d4af37',
    textShadowColor: 'rgba(212, 175, 55, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    color: '#f3e8ff',
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }),
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContainer: {
    width: '100%',
    marginBottom: 24,
    maxHeight: 300,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  textContent: {
    fontSize: 15,
    color: 'rgba(243, 232, 255, 0.9)',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textAlign: 'left',
    lineHeight: 22,
  },
  // Yeni Stil Grupları
  customButtonLayout: {
    width: '100%',
    alignItems: 'center',
  },
  rowButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16, // Padding biraz azaltıldı
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  primaryButton: {
    backgroundColor: '#d4af37',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }),
    textAlign: 'center', // Metni ortala
  },
  primaryButtonText: {
    color: '#1d112b',
  },
  secondaryButtonText: {
    color: '#d4af37',
  },
});

export default MysticInfoModal;