// app/services/novaApiService.ts

import i18n from '../i18n'; 

// Anahtarı buraya tırnak içine yapıştır.
const GEMINI_API_KEY = "AIzaSyA-Z1nDHGbF3nDeT4lav_UEO38h_Q1DzOw";

interface ReadingPayload {
  question: string;
  mood: string;
  spreadType: string;
  cards: { cardName: string, position: string }[];
}

export interface TarotAIResponse {
  holisticInterpretation: string;
  cardDetails: {
    cardName: string;
    position: string;
    meaning: string;
    advice: string;
  }[];
  summary: string;
}

// Sadece Türkçe ve İngilizce desteği (Kararlaştırdığımız gibi)
const LANGUAGE_NAMES: Record<string, string> = {
  tr: 'Turkish',
  en: 'English'
};

export const generateTarotInterpretation = async (payload: ReadingPayload): Promise<TarotAIResponse> => {
  
  // 1. Dil Ayarı: i18n'den dili al, listemizde yoksa İngilizce yap.
  const currentLangCode = i18n.language || 'tr';
  const targetLanguage = LANGUAGE_NAMES[currentLangCode] || 'English';

  // ✅ SENİN ÇALIŞAN MODELİN VE AYARLARIN
  const MODEL_NAME = "gemini-2.5-flash";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

  console.log(`🌍 Nova Dili: ${targetLanguage}`);
  console.log(`📡 İstek gönderiliyor: ${MODEL_NAME}`);

  // 2. Prompt: Sadece dil kuralı eklendi, geri kalanı aynı.
  const prompt = `
    You are a mystical tarot reader named Nova.
    
    CRITICAL RULE: You MUST write your ENTIRE response in ${targetLanguage}.
    
    USER INFO:
    - Question: "${payload.question}"
    - Mood: "${payload.mood}"
    - Spread Type: "${payload.spreadType}"
    - Cards: ${payload.cards.map(c => `${c.cardName} (${c.position})`).join(', ')}

    RESPONSE FORMAT (JSON ONLY, NO MARKDOWN BLOCK):
    {
      "holisticInterpretation": "Detailed interpretation in ${targetLanguage} (Use Markdown formatting like bold/italic)",
      "cardDetails": [
        {
          "cardName": "Card Name translated to ${targetLanguage}", 
          "position": "Position Name translated to ${targetLanguage}",
          "meaning": "Meaning in ${targetLanguage}",
          "advice": "Advice in ${targetLanguage}"
        }
      ],
      "summary": "Short summary in ${targetLanguage}"
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        // ✅ SENİN ÇALIŞAN CONFIG AYARLARIN
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: "application/json" 
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔥 API HATA DETAYI:", errorText);
      throw new Error(`API Hatası (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        let textResponse = data.candidates[0].content.parts[0].text;
        
        // ✅ SENİN ÇALIŞAN TEMİZLİK KODUN
        textResponse = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        return JSON.parse(textResponse);
    } else {
        throw new Error("API boş yanıt döndü.");
    }

  } catch (error) {
    console.error("Gemini Yorum Hatası:", error);
    throw error;
  }
};