// app/services/novaApiService.ts

// DİKKAT: Anahtarı buraya gömdük. Test ettikten sonra güvenlik için tekrar .env'e alabiliriz.
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

export const generateTarotInterpretation = async (payload: ReadingPayload): Promise<TarotAIResponse> => {
  
  // ✅ ÇÖZÜM: Gemini 1.5 modelleri kullanımdan kalktı, 2.5 Flash kullanıyoruz
  const MODEL_NAME = "gemini-2.5-flash";
  
  // ✅ v1beta API kullanmalıyız
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

  console.log(`🔑 Anahtar Kontrol (İlk 5 hane): ${GEMINI_API_KEY?.substring(0, 5)}...`);
  console.log(`📡 İstek gönderiliyor: ${MODEL_NAME}`);

  const prompt = `
    Sen mistik ve bilge bir tarot yorumcususun. Aşağıdaki bilgilere göre bir yorum yap.
    
    KULLANICI BİLGİLERİ:
    - Soru: "${payload.question}"
    - Ruh Hali: "${payload.mood}"
    - Açılım Tipi: "${payload.spreadType}"
    - Kartlar: ${payload.cards.map(c => `${c.cardName} (${c.position})`).join(', ')}

    GÖREV:
    Bana SADECE aşağıdaki JSON formatında bir yanıt ver. Başka hiçbir metin, açıklama veya markdown işareti ekleme.
    
    {
      "holisticInterpretation": "Genel yorum paragrafı (Markdown kullan)...",
      "cardDetails": [
        {
          "cardName": "Kart Adı",
          "position": "Pozisyon",
          "meaning": "Anlamı",
          "advice": "Tavsiye"
        }
      ],
      "summary": "Özet cümle."
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
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: "application/json" // ✅ JSON modu
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
        
        // ✅ Gemini bazen ```json ile sarabilir, temizleyelim
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