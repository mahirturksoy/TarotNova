// app/screens/AuthScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { auth } from "../config/firebaseConfig";

const AuthScreen: React.FC = () => {
  const navigation = useNavigation();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      // BURAYA Firebase Console -> Authentication -> Sign-in method -> Google -> Web Client ID'yi yapıştır
      webClientId: "896638057555-e1mhgaq3qubearmknlm3j7be5qumtvoe.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  const onGoogleButtonPress = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResult = await GoogleSignin.signIn();
      // v16'da idToken her zaman data'nın içindedir.
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error("Google ID Token alınamadı");
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);

      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      if (err.code === "12501") {
        // Kullanıcı iptal etti, hata göstermeye gerek yok
      } else {
        setError("Google girişi başarısız oldu.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      setError("E-posta ve şifre alanları boş bırakılamaz.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigation.goBack();
    } catch (err: any) {
      if (err.code === "auth/invalid-email") {
        setError("Lütfen geçerli bir e-posta adresi girin.");
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("E-posta veya şifre hatalı.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Bu e-posta adresi zaten kullanılıyor.");
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#1d112b", "#2b173f", "#1d112b"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <View />
            <View style={styles.content}>
              <Text style={styles.logo}>TAROTNOVA</Text>
              <Text style={styles.title}>
                {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="E-posta Adresi"
                placeholderTextColor="rgba(243, 232, 255, 0.4)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                placeholderTextColor="rgba(243, 232, 255, 0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleAuth}
                disabled={loading || googleLoading}
              >
                <LinearGradient
                  colors={["#d4af37", "#F59E0B"]}
                  style={styles.ctaGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#1d112b" />
                  ) : (
                    <Text style={styles.ctaButtonText}>
                      {isLogin ? "Giriş Yap" : "Kayıt Ol"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={onGoogleButtonPress}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#d4af37" />
                ) : (
                  <>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.googleButtonText}>
                      Google ile Devam Et
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              <Text style={styles.toggleText}>
                {isLogin ? "Hesabın yok mu? " : "Zaten bir hesabın var mı? "}
                <Text style={styles.toggleTextHighlight}>
                  {isLogin ? "Kayıt Ol" : "Giriş Yap"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  content: { width: "100%", alignItems: "center" },
  logo: {
    fontSize: 32,
    fontWeight: "700",
    color: "#d4af37",
    letterSpacing: 4,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    textShadowColor: "rgba(212, 175, 55, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    color: "#f3e8ff",
    fontFamily: Platform.select({ ios: "Georgia-Bold", android: "serif" }),
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#f3e8ff",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.5)",
    marginBottom: 16,
  },
  errorText: { color: "#EF4444", marginBottom: 12, textAlign: "center" },
  ctaButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  ctaGradient: { paddingVertical: 15, alignItems: "center" },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1d112b",
    fontFamily: Platform.select({ ios: "Georgia-Bold", android: "serif" }),
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(243, 232, 255, 0.2)",
  },
  dividerText: {
    color: "rgba(243, 232, 255, 0.5)",
    paddingHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#d4af37",
    marginRight: 10,
  },
  googleButtonText: { fontSize: 16, color: "#f3e8ff", fontWeight: "600" },
  toggleText: {
    color: "rgba(243, 232, 255, 0.7)",
    textAlign: "center",
    fontSize: 15,
  },
  toggleTextHighlight: { color: "#d4af37", fontWeight: "bold" },
});

export default AuthScreen;
