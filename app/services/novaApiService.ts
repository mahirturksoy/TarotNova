// app/services/novaApiService.ts

const OPENROUTER_API_KEY = "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";

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
  // DEĞİŞİKLİK: Örnek JSON, genel yorumun nasıl olması gerektiğini daha net gösteriyor.
  const jsonStructureExample = `
  {
    "holisticInterpretation": "Bu okuma, ani ve sarsıcı bir uyanışla başlayan, içsel bir aydınlanma yolculuğuna işaret ediyor. Kule kartının getirdiği yıkım, aslında eski ve size hizmet etmeyen kalıplardan kurtulmanız için bir fırsattır. Bu süreçte yalnız kalma ve derin düşünme ihtiyacı hissedeceksiniz, bu da Münzevi kartının bilgeliğidir. Son olarak, Asılan Adam kartı, olaylara farklı bir perspektiften bakmanız gerektiğini ve bazen en büyük ilerlemenin, durup bekleme cesaretini göstermekle mümkün olduğunu fısıldar.",
    "cardDetails": [
      {
        "cardName": "The Tower",
        "position": "Sizin Duygularınız",
        "meaning": "### Sizin Duygularınız: The Tower (Kule)\\n**Kule kartı, sizde ani ve sarsıcı bir farkındalık taşıyor.** Heyecanlı ruh haliniz, aslında bir uyanışın tetikleyicisi. İlişkide beklenmedik bir gerçekle yüzleşiyorsunuz veya yapıların yıkılışına tanıklık ediyorsunuz.",
        "advice": "Bu süreç ilk başta korkutucu gelse de, aslında eski kalıpların temizlenmesi için gerekli bir süreç. Enerjinizdeki coşkuyu, bu değişimi kabullenme cesaretinizden geliyor."
      }
    ],
    "summary": "Özetle, bu açılım ani bir uyanışı, içsel bir arayışı ve olaylara farklı bir açıdan bakma gerekliliğini vurguluyor."
  }
  `;

  // DEĞİŞİKLİK: Prompt, genel yorum ve kart detayları arasındaki ayrımı netleştirmek için güncellendi.
  const prompt = `
    Bir tarot yorumcusu rolünü üstlen. Vereceğin cevabın tamamı, aşağıda belirttiğim JSON formatında olmalı. Metinleri Markdown kullanarak (### başlıklar, ** kalın metinler) zenginleştir.

    Yorum Adımları:
    1.  **holisticInterpretation:** İlk olarak, tüm kartları bir bütün olarak ele alan, hikayeyi anlatan, derin ve bütüncül bir genel yorum yaz.
    2.  **cardDetails:** Ardından, her bir kart için pozisyonunu, anlamını ve tavsiyesini içeren ayrı ayrı analizler yap.
    3.  **summary:** Son olarak, tüm yorumu bir veya iki cümleyle özetle.
    
    İstenen JSON Formatı:
    ${jsonStructureExample}

    Yorumu Yapacağın Bilgiler:
    - Sorum: "${payload.question}"
    - Ruh Halim: "${payload.mood}"
    - Açılım Tipi: "${payload.spreadType}"
    - Seçilen Kartlar:
      ${payload.cards.map(c => `- ${c.position}: ${c.cardName}`).join('\n      ')}
    
    Lütfen bu bilgilere ve adımlara dayanarak, yukarıdaki JSON formatına birebir uyan bir yorum oluştur.
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "TarotNova"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat-v3.1:free",
        "messages": [
          { "role": "system", "content": "Sen bilge ve empatik bir tarot yorumcususun. Cevapların her zaman Markdown ile zenginleştirilmiş, istenen JSON formatında ve mistik bir tonda olmalı." },
          { "role": "user", "content": prompt }
        ],
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Hata Metni:", errorText);
      throw new Error(`HTTP hatası! Durum: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Bazen API cevabının başında veya sonunda ```json gibi işaretler olabilir, bunları temizleyelim.
    content = content.replace(/^```json\n/, '').replace(/\n```$/, '');

    const parsedResponse: TarotAIResponse = JSON.parse(content);
    
    return parsedResponse;

  } catch (error) {
    console.error("API isteği veya JSON ayrıştırma sırasında bir hata oluştu:", error);
    throw new Error("Yorum oluşturulurken bir gizem perdesi aralandı ve bağlantı kurulamadı.");
  }
};