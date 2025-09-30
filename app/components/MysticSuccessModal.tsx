// app/components/MysticSuccessModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Modal, Platform } from 'react-native';
interface MysticSuccessModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
}

const MysticSuccessModal: React.FC<MysticSuccessModalProps> = ({ visible, title, subtitle }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.icon}>✦</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: 240, // Daha dar
    // height kaldırıldı, içerik belirleyecek
    backgroundColor: 'rgba(43, 23, 63, 0.98)',
    borderRadius: 16,
    paddingVertical: 24, // Dikey boşluk
    paddingHorizontal: 20, // Yatay boşluk
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
  },
  icon: {
    fontSize: 48,
    color: '#d4af37',
    textShadowColor: 'rgba(212, 175, 55, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  title: {
    fontSize: 20,
    color: '#f3e8ff',
    fontWeight: 'bold',
    marginTop: 16,
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(243, 232, 255, 0.8)',
    marginTop: 8,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MysticSuccessModal;