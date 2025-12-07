// app/components/MysticAuthModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Modal, Platform, TouchableOpacity } from 'react-native';

interface MysticAuthModalProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onLogin: () => void;
  cancelText?: string;
  loginText?: string;
}

const MysticAuthModal: React.FC<MysticAuthModalProps> = ({
  visible,
  title,
  message,
  onCancel,
  onLogin,
  cancelText = 'İptal',
  loginText = 'Giriş Yap',
}) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.icon}>☾</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={onLogin}>
              <Text style={styles.loginButtonText}>{loginText}</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'rgba(43, 23, 63, 0.98)',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 24,
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
    fontSize: 42,
    color: '#d4af37',
    textShadowColor: 'rgba(212, 175, 55, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    color: '#f3e8ff',
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }),
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: 'rgba(243, 232, 255, 0.85)',
    marginBottom: 24,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  loginButton: {
    backgroundColor: '#d4af37',
    borderWidth: 1,
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(212, 175, 55, 0.9)',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1d112b',
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }),
  },
});

export default MysticAuthModal;
