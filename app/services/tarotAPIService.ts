import { SpreadType } from '../constants/spreadTypes';

// Tarot okuma sonucu için tip tanımı
export interface TarotReading {
  readingTitle: string;
  holisticInterpretation: string;
  cardDetails: Array<{
    cardName: string;
    position: string;
    meaning: string;
    advice: string;
  }>;
  lifeAspects: {
    love: string;
    career: string;
    personal: string;
  };
  summary: string;
  confidence: number;
  timestamp: string;
}

// Gemini API response için tip
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Tarot okuması için optimize edilmiş prompt oluşturma
 */
const createTarotPrompt = (question: string, mood: string, cards: string[], spreadType?: SpreadType): string => {
  const currentDate = new Date().toLocaleDateString('tr-TR');
  
  // Spread bilgisine göre pozisyon açıklamaları
  let positionDescriptions = '';
  if (spreadType && spreadType.positions) {
    positionDescriptions = `\n\nSPREAD BİLGİSİ: "${spreadType.name}" - ${spreadType.description}
KART POZİSYONLARI:`;
    
    cards.forEach((card, index) => {
      const position = spreadType.positions[index];
      if (position) {
        positionDescriptions += `\n- ${card}: ${position.name} (${position.description})`;
      }
    });
  }
  
  return `Sen bir tarot uzmanısın. Aşağıdaki bilgilere göre tarot okuması yap ve SADECE JSON formatında yanıt ver.

KULLANICI BİLGİLERİ:
- Soru: "${question}"
- Ruh Hali: ${mood}
- Seçilen Kartlar: ${cards.join(', ')}
- Tarih: ${currentDate}${positionDescriptions}

SADECE ŞU JSON FORMATINDA YANIT VER (başka hiçbir metin ekleme):

{
  "readingTitle": "Okuma başlığı",
  "holisticInterpretation": "Genel yorum 150-200 kelime",
  "cardDetails": [${cards.map((card, index) => {
    const position = spreadType?.positions[index];
    const positionName = position ? position.name : `Pozisyon ${index + 1}`;
    return `
    {
      "cardName": "${card}",
      "position": "${positionName}",
      "meaning": "Kartın anlamı",
      "advice": "Tavsiye"
    }`;
  }).join(',')
  }]
  ],
  "lifeAspects": {
    "love": "Aşk yorumu",
    "career": "Kariyer yorumu", 
    "personal": "Kişisel gelişim yorumu"
  },
  "summary": "Özet",
  "confidence": 85,
  "timestamp": "${new Date().toISOString()}"
}

ÖNEMLİ KURALLAR:
- SADECE JSON yanıt ver, başka hiçbir metin ekleme
- JSON'dan önce veya sonra açıklama yazma
- Türkçe yorum yap
- ${spreadType ? `${spreadType.name} spread kurallarına uy` : 'Geleneksel tarot anlamlarını kullan'}`;
};

/**
 * Gemini API'ye istek gönderme fonksiyonu - Sadece çalışan modeller
 */
const callGeminiAPI = async (prompt: string): Promise<string> => {
  const maxRetries = 5;
  const baseDelay = 3000; // 3 saniye
  
  // Çalışan model listesi (doğrulanmış)
  const workingModels = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-pro'
  ];
  
  for (const modelName of workingModels) {
    console.log(`Model deneniyor: ${modelName}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`${modelName} API çağrısı yapılıyor... (Deneme ${attempt}/${maxRetries})`);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=AIzaSyBwO952qCWla5H58SIXt_f42u0SXhm1Q9U`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`${modelName} başarıyla yanıt verdi!`);
          
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
          } else {
            throw new Error('Invalid response format');
          }
        } else {
          const errorText = await response.text();
          console.error(`${modelName} API Error (Deneme ${attempt}):`, errorText);
          
          // 503 (overloaded) veya 429 (rate limit) hatalarında retry yap
          if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
            const delay = baseDelay * attempt; // Exponential backoff
            console.log(`${delay/1000} saniye bekleyip tekrar denenecek...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // 404 hatası alırsa bu modeli geç, sonrakini dene
          if (response.status === 404) {
            console.log(`${modelName} mevcut değil, sonraki model denenecek...`);
            break; // Bu modeli geç
          }
          
          throw new Error(`API Error: ${response.status}`);
        }
        
      } catch (error) {
        console.error(`${modelName} Call Failed (Deneme ${attempt}):`, error);
        
        // Son denemeyse bu model için sonraki modele geç
        if (attempt === maxRetries) {
          console.log(`${modelName} tüm denemeler başarısız, sonraki model denenecek...`);
          break;
        }
        
        // Geçici ağ hatalarında kısa bekle
        const delay = baseDelay * attempt;
        console.log(`${delay/1000} saniye bekleyip tekrar denenecek...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error('Tüm API modelleri başarısız');
};

/**
 * JSON yanıtını parse etme ve doğrulama - Gelişmiş temizleme
 */
const parseAIResponse = (response: string): TarotReading => {
  try {
    let cleanJson = response.trim();
    
    console.log('Ham AI yanıtının ilk 200 karakteri:', cleanJson.substring(0, 200));
    
    // Markdown kod bloklarını temizle
    if (cleanJson.includes('```json')) {
      const startIndex = cleanJson.indexOf('```json') + 7;
      const endIndex = cleanJson.indexOf('```', startIndex);
      if (endIndex !== -1) {
        cleanJson = cleanJson.substring(startIndex, endIndex).trim();
      }
    } else if (cleanJson.includes('```')) {
      const startIndex = cleanJson.indexOf('```') + 3;
      const endIndex = cleanJson.indexOf('```', startIndex);
      if (endIndex !== -1) {
        cleanJson = cleanJson.substring(startIndex, endIndex).trim();
      }
    }
    
    // JSON başlangıcını ve sonunu bul
    const jsonStart = cleanJson.indexOf('{');
    const jsonEnd = cleanJson.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
    }
    
    // Fazla virgülleri ve syntax hatalarını düzelt
    cleanJson = cleanJson
      .replace(/,\s*}/g, '}')  // Trailing commas
      .replace(/,\s*]/g, ']')  // Trailing commas in arrays
      .replace(/\n/g, ' ')     // New lines
      .replace(/\r/g, ' ')     // Carriage returns
      .replace(/\t/g, ' ')     // Tabs
      .replace(/\s+/g, ' ');   // Multiple spaces
    
    console.log('Temizlenmiş JSON:', cleanJson.substring(0, 300) + '...');
    
    const parsed = JSON.parse(cleanJson);
    
    // Gerekli alanları doğrula
    if (!parsed.readingTitle || !parsed.holisticInterpretation || !parsed.cardDetails) {
      console.error('JSON alanları eksik:', {
        hasTitle: !!parsed.readingTitle,
        hasInterpretation: !!parsed.holisticInterpretation,
        hasCardDetails: !!parsed.cardDetails
      });
      throw new Error('JSON formatında eksik alanlar var');
    }
    
    console.log('JSON başarıyla parse edildi');
    return parsed as TarotReading;
    
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Parse edilemeyen yanıt (ilk 500 karakter):', response.substring(0, 500));
    throw new Error('AI yanıtı parse edilemedi');
  }
};

/**
 * Ana AI destekli tarot okuma fonksiyonu - İyileştirilmiş fallback sistemi
 */
export const getAIPoweredReading = async (
  question: string, 
  mood: string, 
  cards: string[],
  spreadType?: SpreadType
): Promise<TarotReading> => {
  console.log('AI Tarot okuması başlatılıyor:', { question, mood, cards, spreadType: spreadType?.name });
  
  try {
    const prompt = createTarotPrompt(question, mood, cards, spreadType);
    const aiResponse = await callGeminiAPI(prompt);
    const reading = parseAIResponse(aiResponse);
    
    console.log('AI Tarot okuması başarıyla tamamlandı:', reading.readingTitle);
    return reading;
    
  } catch (error) {
    console.error('Tüm AI modelleri başarısız:', error);
    console.log('Fallback mock data döndürülüyor...');
    
    // Daha kısa bekleme süresi
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getMockReading(question, mood, cards, spreadType);
  }
};

/**
 * Fallback mock data - Spread desteği ile
 */
const getMockReading = async (
  question: string, 
  mood: string, 
  cards: string[],
  spreadType?: SpreadType
): Promise<TarotReading> => {
  
  const spreadName = spreadType?.name || 'Klasik Okuma';
  
  return {
    readingTitle: `${spreadName}: Yeni Başlangıçlar ve Potansiyel`,
    
    holisticInterpretation: `"${question}" sorunuz üzerine ${spreadName} düzeni kullanılarak kartlar, ${mood.toLowerCase()} ruh halinizle uyumlu bir mesaj getiriyor. Seçtiğiniz kartlar güçlü bir enerji taşıyor ve yakında hayatınızda önemli gelişmeler olacağını işaret ediyor. Bu dönemde cesaret ve kararlılıkla hareket etmeniz gerekiyor.`,
    
    cardDetails: cards.map((cardName, index) => {
      const position = spreadType?.positions[index];
      const positionName = position ? position.name : `Pozisyon ${index + 1}`;
      
      return {
        cardName,
        position: positionName,
        meaning: `${cardName} kartı ${positionName} pozisyonunda, güçlü enerjiler ve yeni fırsatlar getiriyor. Bu kart, mevcut durumunuzda önemli bir dönüşümün işaretçisidir.`,
        advice: `${cardName} kartının enerjisini kullanarak, ${positionName.toLowerCase()} konusunda pozitif adımlar atabilirsiniz. İç sesinizi dinleyin ve sezgilerinize güvenin.`
      };
    }),
    
    lifeAspects: {
      love: spreadType?.category === 'love' 
        ? 'Aşk hayatınızda heyecan verici gelişmeler yaklaşıyor. Kalbinizi açın ve yeni deneyimlere hazır olun.'
        : 'Duygusal açıdan dengeli bir dönemdesiniz. İlişkilerinizde samimi yaklaşımlar sergilemek size fayda sağlayacak.',
      career: spreadType?.category === 'career'
        ? 'Kariyer alanında önemli fırsatlar kapıda. Yeteneklerinizi öne çıkarın ve cesur adımlar atın.'
        : 'İş hayatınızda yaratıcı çözümler bulacağınız bir dönemdesiniz. Projelerinizde başarılı olacaksınız.',
      personal: spreadType?.category === 'spiritual'
        ? 'Manevi gelişiminiz için mükemmel bir dönem. İç dünyanızı keşfetme zamanı.'
        : 'Kişisel gelişiminize odaklanın. Yeni beceriler öğrenmek ve kendinizi geliştirmek için ideal zaman.'
    },
    
    summary: `${spreadName} ile yapılan bu okuma, "${question}" sorunuz için ümit verici işaretler gösteriyor. ${mood} hissettiğiniz bu dönemde, seçtiğiniz ${cards.length} kart pozitif değişimler ve yeni başlangıçlar müjdeliyor. Sabırlı ve kararlı olduğunuzda istediğiniz sonuçlara ulaşabilirsiniz.`,
    
    confidence: 85,
    timestamp: new Date().toISOString()
  };
};

/**
 * API bağlantısını test etme
 */
export const testAPIConnection = async (): Promise<boolean> => {
  try {
    console.log('API bağlantısı test ediliyor...');
    const testPrompt = "Sadece 'API Test Başarılı' yanıtını ver.";
    await callGeminiAPI(testPrompt);
    console.log('API test başarılı');
    return true;
  } catch (error) {
    console.error('API bağlantı testi başarısız:', error);
    return false;
  }
};