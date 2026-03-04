// app/components/MysticPremiumModal.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Platform, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface MysticPremiumModalProps {
  visible: boolean;
  featureName: string;
  onClose: () => void;
  onUpgrade: () => void;
}

const MysticPremiumModal: React.FC<MysticPremiumModalProps> = ({
  visible,
  featureName,
  onClose,
  onUpgrade,
}) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backgroundOverlay, { opacity: opacityAnim }]} />
        
        <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          {/* Parlayan Çerçeve Efekti */}
          <LinearGradient
            colors={['#d4af37', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.borderGradient}
          >
            <View style={styles.innerContent}>
              
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>✦</Text>
              </View>
              
              <Text style={styles.title}>{t('spread.premiumAlert.title')}</Text>
              
              <Text style={styles.description}>
                <Text style={styles.highlight}>"{featureName}"</Text> {t('spread.premiumAlert.modalDescription')}
              </Text>
              
              <Text style={styles.subDescription}>
                {t('spread.premiumAlert.modalSubDescription')}
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
                  <LinearGradient colors={['#d4af37', '#F59E0B']} style={styles.upgradeGradient}>
                    <Text style={styles.upgradeButtonText}>{t('spread.premiumAlert.examine')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  backgroundOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.8)' },
  modalContent: { width: width * 0.85, borderRadius: 24, overflow: 'hidden', elevation: 20, shadowColor: '#d4af37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20 },
  borderGradient: { padding: 2 },
  innerContent: { backgroundColor: '#2b173f', borderRadius: 22, padding: 24, alignItems: 'center' },
  
  iconContainer: {
    marginBottom: 16,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  icon: { 
    fontSize: 56, 
    color: '#d4af37', 
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },

  title: { fontSize: 24, fontWeight: 'bold', color: '#f3e8ff', marginBottom: 12, fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) },
  description: { fontSize: 16, color: '#f3e8ff', textAlign: 'center', marginBottom: 8, lineHeight: 22, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
  highlight: { fontWeight: 'bold', color: '#d4af37' },
  subDescription: { fontSize: 14, color: 'rgba(243, 232, 255, 0.6)', textAlign: 'center', marginBottom: 24, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }) },
  
  buttonContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12 },
  
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)', alignItems: 'center', justifyContent: 'center' },
  
  // DEĞİŞİKLİK: Font ailesi ve boyutu güncellendi
  cancelButtonText: { 
    color: 'rgba(243, 232, 255, 0.9)', 
    fontSize: 18, 
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) 
  },
  
  upgradeButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  upgradeGradient: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center', width: '100%' },
  
  // DEĞİŞİKLİK: Font ailesi ve boyutu güncellendi
  upgradeButtonText: { 
    color: '#1d112b', 
    fontSize: 18, 
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) 
  },
});

export default MysticPremiumModal;