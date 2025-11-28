// app/screens/HomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useReadingContext } from '../context/ReadingContext';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { MAJOR_ARCANA, getCardImage } from '../constants/tarotDeck';

// DEĞİŞİKLİK: Navigasyon tipi hatayı giderecek şekilde güncellendi
type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Ana Sayfa'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isLoading } = useReadingContext();
  
  const [question, setQuestion] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [cardOfTheDay, setCardOfTheDay] = useState(MAJOR_ARCANA[0]);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setCardOfTheDay(MAJOR_ARCANA[dayOfYear % MAJOR_ARCANA.length]);
  }, []);

  const moods = [
    { id: 'Heyecanlı', label: 'Heyecanlı' },
    { id: 'Sakin', label: 'Sakin' },
    { id: 'Meraklı', label: 'Meraklı' },
    { id: 'Yorgun', label: 'Yorgun' },
    { id: 'Umutlu', label: 'Umutlu' },
  ];

  const handleSubmit = () => {
    if (question.trim() && selectedMood) {
      Keyboard.dismiss();
      navigation.navigate('SpreadSelection', { 
        question: question.trim(), 
        mood: selectedMood 
      });
    }
  };

  const isButtonDisabled = !question.trim() || !selectedMood || isLoading;
  const cardImage = getCardImage(cardOfTheDay.imageName);
  
  const getCardMessage = (cardName: string) => {
    const messages: { [key: string]: string } = {
      'The Fool': "Bugün yeni başlangıçlara korkusuzca adım at.",'The Magician': "İçindeki gücü ve yeteneklerini kullanma zamanı.",'The High Priestess': "Sezgilerine güven, cevaplar içinde saklı.",'The Empress': "Yaratıcılığını ve şefkatini besle.",'The Emperor': "Hayatına düzen ve istikrar getir.",'The Hierophant': "Geleneklerden ve bilgelerden öğren.",'The Lovers': "Kalbinin sesini dinle ve önemli seçimler yap.",'The Chariot': "İradeni kullanarak hedeflerine doğru ilerle.",'Strength': "Cesaretini ve içsel gücünü kucakla.",'The Hermit': "Kendi içine dönüp bilgeliği ara.",'Wheel of Fortune': "Değişimin kaçınılmaz döngüsünü kabul et.",'Justice': "Dengeyi bul ve adil kararlar ver.",'The Hanged Man': "Farklı bir bakış açısı kazanmak için dur ve düşün.",'Death': "Eskiyi bırak, büyük bir dönüşüme hazır ol.",'Temperance': "Uyum ve dengeyi hayatının merkezine al.",'The Devil': "Seni sınırlayan zincirleri fark et ve kır.",'The Tower': "Ani değişimler, yeni bir temel kurman için fırsattır.",'The Star': "Umutlarını ve ilhamını kaybetme.",'The Moon': "Bilinçaltının ve rüyalarının rehberliğine inan.",'The Sun': "Neşeyi, başarıyı ve aydınlığı kucakla.",'Judgement': "Geçmişi değerlendir ve yeniden doğuşu yaşa.",'The World': "Bir döngüyü başarıyla tamamlamanın keyfini çıkar."
    };
    return messages[cardName] || "Günün sana özel bir mesajı var.";
  };

  return (
    <LinearGradient
      colors={['#1d112b', '#2b173f', '#1d112b']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>TAROTNOVA</Text>
          </View>
          <View style={styles.mainContent}>
            <View style={styles.cardOfTheDayContainer}>
              <Text style={styles.sectionTitle}>Günün Kartı</Text>
              <View style={styles.cardImageContainer}>
                {cardImage && <Image source={cardImage} style={styles.cardImage} />}
              </View>
              <Text style={styles.cardName}>{cardOfTheDay.name}</Text>
              {/* DEĞİŞİKLİK: Hatalı 'cardName' değişkeni 'cardOfTheDay.name' ile düzeltildi */}
              <Text style={styles.cardMessage}>"{getCardMessage(cardOfTheDay.name)}"</Text>
            </View>
            <LinearGradient 
              colors={['rgba(74, 4, 78, 0.2)', 'rgba(74, 4, 78, 0.3)']}
              style={styles.queryContainer}
            >
              <View style={styles.section}><Text style={styles.stepTitle}>Nova'ya Sor</Text><View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Aklındaki soruya odaklan..." placeholderTextColor="rgba(243, 232, 255, 0.4)" value={question} onChangeText={setQuestion} multiline/></View></View>
              <View style={styles.section}><Text style={styles.stepTitle}>Ruh Halini Seç</Text><View style={styles.moodGrid}>{moods.map((mood) => (<TouchableOpacity key={mood.id} style={[styles.moodButton,selectedMood === mood.id && styles.moodButtonSelected]} onPress={() => setSelectedMood(mood.id)}><Text style={[styles.moodButtonText,selectedMood === mood.id && styles.moodButtonTextSelected]}>{mood.label}</Text></TouchableOpacity>))}</View></View>
              <TouchableOpacity style={[styles.ctaButton, isButtonDisabled && styles.ctaButtonDisabled]} onPress={handleSubmit} disabled={isButtonDisabled}><LinearGradient colors={['#d4af37', '#F59E0B']} style={styles.ctaGradient}><Text style={styles.ctaButtonText}>Nova ile Sorgula</Text></LinearGradient></TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingTop: 50 },
  logo: { fontSize: 32, fontWeight: '700', color: '#d4af37', letterSpacing: 4, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }), textShadowColor: 'rgba(212, 175, 55, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  mainContent: { flex: 1, paddingHorizontal: 20, paddingBottom: 120 },
  cardOfTheDayContainer: { alignItems: 'center', marginVertical: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#d4af37', marginBottom: 16, fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif', default: 'serif' }) },
  cardImageContainer: { width: 120, aspectRatio: 0.6, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(212, 175, 55, 0.5)', shadowColor: '#d4af37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  cardImage: { width: '100%', height: '100%' },
  cardName: { fontSize: 18, fontWeight: 'bold', color: '#d4af37', marginTop: 12, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) },
  cardMessage: { fontSize: 14, color: 'rgba(243, 232, 255, 0.8)', fontStyle: 'italic', marginTop: 4, textAlign: 'center' },
  queryContainer: { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#701a75' },
  section: { marginBottom: 24 },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#d4af37', marginBottom: 12, fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif', default: 'serif' }) },
  inputContainer: { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 16 : 8, minHeight: 60, justifyContent: 'center' },
  input: { fontSize: 16, color: '#f3e8ff', textAlignVertical: 'top', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodButton: { flexGrow: 1, flexBasis: '40%', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  moodButtonSelected: { backgroundColor: '#d4af37', borderColor: '#d4af37' },
  moodButtonText: { fontSize: 15, color: '#d4af37', fontWeight: '600', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) },
  moodButtonTextSelected: { color: '#1d112b', fontWeight: 'bold' },
  ctaButton: { borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8, marginTop: 10 },
  ctaButtonDisabled: { opacity: 0.5 },
  ctaGradient: { paddingVertical: 18, alignItems: 'center' },
  ctaButtonText: { fontSize: 18, fontWeight: 'bold', color: '#1d112b', letterSpacing: 1, fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif', default: 'serif' }) },
});

export default HomeScreen;