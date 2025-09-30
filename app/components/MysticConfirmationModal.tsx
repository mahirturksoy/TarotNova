// app/components/MysticConfirmationModal.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Platform, Easing } from 'react-native';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive';
}

interface MysticConfirmationModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  buttons: ButtonProps[];
  onClose: () => void;
}

const MysticConfirmationModal: React.FC<MysticConfirmationModalProps> = ({
  visible,
  title,
  subtitle,
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.icon}>✦</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              const isDestructive = button.style === 'destructive';
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    isDestructive ? styles.destructiveButton : styles.defaultButton
                  ]}
                  onPress={button.onPress}
                >
                  <Text style={[
                    styles.buttonText,
                    isDestructive ? styles.destructiveButtonText : styles.defaultButtonText
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
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
    width: 240,
    backgroundColor: 'rgba(43, 23, 63, 0.98)',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
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
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  // DEĞİŞİKLİK: "Sil" butonu artık kırmızı değil, markamızın asil altın rengi
  destructiveButton: {
    backgroundColor: '#d4af37',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }),
  },
  defaultButtonText: {
    color: '#d4af37',
  },
  // DEĞİŞİKLİK: Altın rengi butonun metni, kontrast için koyu renk oldu
  destructiveButtonText: {
    color: '#1d112b',
  },
});

export default MysticConfirmationModal;