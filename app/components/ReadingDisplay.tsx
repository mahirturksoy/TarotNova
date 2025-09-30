// app/components/ReadingDisplay.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CardDetail } from '../context/ReadingContext';
import { MAJOR_ARCANA, getCardImage } from '../constants/tarotDeck';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const cardDataMap = new Map(MAJOR_ARCANA.map(card => [card.name, card]));

interface ReadingDisplayProps {
  readingData: {
    question: string;
    spreadType?: { name: string };
    selectedCards: string[];
    holisticInterpretation?: string | null;
    cardDetails?: CardDetail[] | null;
    summary?: string | null;
  };
}

const ReadingDisplay: React.FC<ReadingDisplayProps> = ({ readingData }) => {
  const [showFullInterpretation, setShowFullInterpretation] = useState(false);
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);

  const {
    question,
    selectedCards,
    holisticInterpretation,
    cardDetails,
    summary
  } = readingData;

  const toggleCardExpansion = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCardIndex(expandedCardIndex === index ? null : index);
  };

  return (
    <>
      <LinearGradient
        colors={['#701a75', '#4a044e']}
        style={styles.headerSection}
      >
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>Sorunuz:</Text>
          <Text style={styles.questionText}>"{question}"</Text>
        </View>

        <View style={styles.cardsContainer}>
          <Text style={styles.cardsLabel}>Seçtiğiniz Kartlar:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardImageGallery}
          >
            {selectedCards.map((cardName, index) => {
              const card = cardDataMap.get(cardName);
              if (!card) return null;
              const cardImage = getCardImage(card.imageName);
              return (
                <View key={index} style={styles.miniCardContainer}>
                  <Image source={cardImage} style={styles.miniCardImage} />
                </View>
              );
            })}
          </ScrollView>
        </View>
      </LinearGradient>
      
      {holisticInterpretation && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✦</Text>
            <Text style={styles.sectionTitle}>Genel Yorum</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => setShowFullInterpretation(!showFullInterpretation)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(74, 4, 78, 0.2)', 'rgba(74, 4, 78, 0.3)']}
              style={styles.contentCard}
            >
              <Text
                style={styles.contentText}
                numberOfLines={showFullInterpretation ? undefined : 6}
              >
                {holisticInterpretation}
              </Text>
              {!showFullInterpretation && holisticInterpretation.length > 300 && (
                <View style={styles.readMoreContainer}>
                  <Text style={styles.readMoreText}>Devamını Oku ⌄</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {cardDetails && cardDetails.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>◈</Text>
            <Text style={styles.sectionTitle}>Kart Analizleri</Text>
          </View>
          <View style={styles.divider} />
          {cardDetails.map((detail, index) => {
            const isExpanded = expandedCardIndex === index;
            return (
              <TouchableOpacity
                key={index}
                style={styles.accordionItem}
                activeOpacity={0.9}
                onPress={() => toggleCardExpansion(index)}
              >
                <View style={styles.accordionHeader}>
                  <View style={styles.accordionHeaderTextContainer}>
                    <Text style={styles.accordionTitle}>{detail.position}</Text>
                    <Text style={styles.accordionSubtitle}>{detail.cardName}</Text>
                  </View>
                  <Text style={styles.accordionChevron}>{isExpanded ? '−' : '+'}</Text>
                </View>
                {isExpanded && (
                  <View style={styles.accordionContent}>
                    <Text style={styles.accordionContentText}>
                      <Text style={styles.accordionLabel}>Anlam: </Text>
                      {detail.meaning}
                    </Text>
                    <Text style={styles.accordionContentText}>
                      <Text style={styles.accordionLabel}>Tavsiye: </Text>
                      {detail.advice}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {summary && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>◉</Text>
            <Text style={styles.sectionTitle}>Özet</Text>
          </View>
          <View style={styles.divider} />
          <LinearGradient
            colors={['rgba(74, 4, 78, 0.2)', 'rgba(74, 4, 78, 0.3)']}
            style={styles.contentCard}
          >
            <Text style={styles.contentText}>{summary}</Text>
          </LinearGradient>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
    headerSection: {
        marginHorizontal: 12,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        marginTop: 10,
      },
      questionContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
      },
      questionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#d4af37',
        marginBottom: 6,
        fontFamily: Platform.select({ios: 'Georgia-Bold', android: 'serif', default: 'serif'}),
      },
      questionText: {
        fontSize: 16,
        color: '#f3e8ff',
        fontStyle: 'italic',
        lineHeight: 22,
        fontFamily: Platform.select({ios: 'Georgia-Italic', android: 'serif', default: 'serif'}),
      },
      cardsContainer: {
        marginTop: 8,
      },
      cardsLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#d4af37',
        marginBottom: 12,
        fontFamily: Platform.select({ios: 'Georgia-Bold', android: 'serif', default: 'serif'}),
      },
      cardImageGallery: {
        paddingHorizontal: 5,
        gap: 10,
      },
      miniCardContainer: {
        width: 70,
        aspectRatio: 0.6,
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.5)',
      },
      miniCardImage: {
        width: '100%',
        height: '100%',
      },
      section: {
        marginHorizontal: 20,
        marginBottom: 24,
      },
      sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      },
      sectionIcon: {
        fontSize: 20,
        marginRight: 8,
        color: '#d4af37',
      },
      sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f3e8ff',
        fontFamily: Platform.select({ios: 'Georgia-Bold', android: 'serif', default: 'serif'}),
      },
      divider: {
        height: 1,
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        marginBottom: 12,
      },
      contentCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#701a75',
      },
      contentText: {
        fontSize: 15,
        color: 'rgba(243, 232, 255, 0.9)',
        lineHeight: 24,
        fontFamily: Platform.select({ios: 'Georgia', android: 'serif', default: 'serif'}),
      },
      readMoreContainer: {
        alignSelf: 'flex-start',
        marginTop: 10,
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        borderRadius: 12,
        paddingVertical: 6,
        paddingHorizontal: 12,
      },
      readMoreText: {
        fontSize: 14,
        color: '#d4af37',
        fontWeight: '600',
        fontFamily: Platform.select({ios: 'Georgia-Bold', android: 'serif', default: 'serif'}),
      },
      accordionItem: {
        backgroundColor: 'rgba(74, 4, 78, 0.3)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#701a75',
        marginBottom: 12,
        overflow: 'hidden',
      },
      accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
      },
      accordionHeaderTextContainer: {
        flex: 1,
        marginRight: 10,
      },
      accordionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d4af37',
        marginBottom: 2,
        fontFamily: Platform.select({ios: 'Georgia-Bold', android: 'serif', default: 'serif'}),
      },
      accordionSubtitle: {
        fontSize: 14,
        color: '#f3e8ff',
        fontFamily: Platform.select({ios: 'Georgia', android: 'serif', default: 'serif'}),
      },
      accordionChevron: {
        fontSize: 24,
        color: '#d4af37',
        fontWeight: '300',
      },
      accordionContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(212, 175, 55, 0.2)',
        marginHorizontal: 16,
        paddingTop: 16,
      },
      accordionContentText: {
        fontSize: 14,
        color: 'rgba(243, 232, 255, 0.9)',
        lineHeight: 22,
        marginBottom: 10,
        fontFamily: Platform.select({ios: 'Georgia', android: 'serif', default: 'serif'}),
      },
      accordionLabel: {
        fontWeight: 'bold',
        color: '#d4af37',
        fontFamily: Platform.select({ios: 'Georgia-Bold', android: 'serif', default: 'serif'}),
      },
});
    
export default ReadingDisplay;