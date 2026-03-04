// app/components/MysticLimitModal.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface MysticLimitModalProps {
  visible: boolean;
  userType: 'GUEST' | 'REGISTERED' | 'PREMIUM';
  limit: number;
  canWatchAd: boolean;
  isAdLoading?: boolean;
  onClose: () => void;
  onWatchAd: () => void;
  onGoPremium: () => void;
  onGoRegister?: () => void;
}

/**
 * MysticLimitModal — Günlük sorgu limiti dolduğunda gösterilen modal
 *
 * Butonlar:
 *  1. "Reklam İzle → +1 Hak" (canWatchAd=true ise)
 *  2. "Kayıt Ol" (GUEST ise)
 *  3. "Premium'a Geç"
 *  4. "Kapat"
 *
 * TarotNova'nın mistik temasına uygun tasarım.
 */
const MysticLimitModal: React.FC<MysticLimitModalProps> = ({
  visible,
  userType,
  limit,
  canWatchAd,
  isAdLoading = false,
  onClose,
  onWatchAd,
  onGoPremium,
  onGoRegister,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Koyu arka plan */}
        <View style={styles.overlay} />

        {/* Modal İçerik */}
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#d4af37', '#F59E0B']}
            style={styles.borderGradient}
          >
            <View style={styles.innerContent}>
              {/* İkon */}
              <Text style={styles.icon}>⏳</Text>

              {/* Başlık */}
              <Text style={styles.title}>
                {t('queryLimit.title')}
              </Text>

              {/* Açıklama */}
              <Text style={styles.description}>
                {t('queryLimit.description', { limit })}
              </Text>

              {/* Butonlar */}
              <View style={styles.buttonContainer}>
                {/* 1. Reklam İzle → +1 Hak */}
                {canWatchAd && (
                  <TouchableOpacity
                    style={styles.adButton}
                    onPress={onWatchAd}
                    disabled={isAdLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.adGradient}
                    >
                      {isAdLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.adButtonText}>
                          {t('queryLimit.watchAd')}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* 2. Misafir ise: Kayıt Ol */}
                {userType === 'GUEST' && onGoRegister && (
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={onGoRegister}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.registerButtonText}>
                      {t('queryLimit.register')}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* 3. Premium'a Geç */}
                <TouchableOpacity
                  style={styles.premiumButton}
                  onPress={onGoPremium}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#d4af37', '#F59E0B']}
                    style={styles.premiumGradient}
                  >
                    <Text style={styles.premiumButtonText}>
                      {t('queryLimit.goPremium')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* 4. Kapat */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>
                    {t('common.close')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: width * 0.88,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  borderGradient: {
    padding: 2,
    borderRadius: 24,
  },
  innerContent: {
    backgroundColor: '#2b173f',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f3e8ff',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Georgia-Bold',
      android: 'serif',
      default: 'serif',
    }),
  },
  description: {
    fontSize: 15,
    color: 'rgba(243, 232, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  // Reklam İzle butonu (yeşil)
  adButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  adGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  adButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.select({
      ios: 'Georgia-Bold',
      android: 'serif',
      default: 'serif',
    }),
  },
  // Kayıt Ol butonu (outline)
  registerButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.select({
      ios: 'Georgia-Bold',
      android: 'serif',
      default: 'serif',
    }),
  },
  // Premium butonu (gold gradient)
  premiumButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#1d112b',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.select({
      ios: 'Georgia-Bold',
      android: 'serif',
      default: 'serif',
    }),
  },
  // Kapat butonu (text-only)
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'rgba(243, 232, 255, 0.6)',
    fontSize: 14,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
});

export default MysticLimitModal;
