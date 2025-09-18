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
  
  // API isteği parametreleri için tip tanımı
  interface TarotReadingRequest {
    question: string;
    mood: string;
    cards: string[];
  }
  
  /**
   * AI destekli tarot okuma servisi (Mock Data)
   * Gerçek API yerine sahte veri döndürür - frontend geliştirmesi için
   */
  export const getAIPoweredReading = async (
    question: string, 
    mood: string, 
    cards: string[]
  ): Promise<TarotReading> => {
    
    console.log('API isteği başlatılıyor:', { question, mood, cards });
    
    // 2 saniye bekleme simülasyonu (gerçek API gecikme simülasyonu)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Sahte (mock) tarot okuma verisi
    const mockReading: TarotReading = {
      readingTitle: "Yeni Başlangıçlar ve İç Güçünüz",
      
      holisticInterpretation: `${question} sorunuz üzerine kartlar, ${mood.toLowerCase()} ruh halinizle uyumlu bir mesaj getiriyor. Önünüzde yeni fırsatlar ve içsel keşifler sizi bekliyor. Bu dönemde cesaretle adımlar atmanız, hem kişisel hem de manevi gelişiminize katkı sağlayacak.`,
      
      cardDetails: cards.map((cardName, index) => {
        const positions = ['Geçmiş/Durum', 'Şimdi/Meydan Okuma', 'Gelecek/Rehberlik'];
        const meanings = [
          'Bu kart, geçmişteki deneyimlerinizin bugünkü kararlarda size rehberlik ettiğini gösteriyor.',
          'Şu anda karşılaştığınız durumda sabırlı olmak ve içsel sesinizi dinlemek önemli.',
          'Gelecekte sizi bekleyen fırsatları yakalamak için hazır olduğunuzu işaret ediyor.'
        ];
        const advices = [
          'Geçmiş tecrübelerinizden ders çıkarın ama onların sizi sınırlamasına izin vermeyin.',
          'Şu anki durumunuzu kabul edin ve bir sonraki adım için içsel gücünüzü toplayın.',
          'Gelecekteki planlarınızı yaparken hem mantığınızı hem de sezgilerinizi kullanın.'
        ];
        
        return {
          cardName,
          position: positions[index] || 'Ek Rehberlik',
          meaning: meanings[index] || 'Bu kart size özel bir mesaj taşıyor ve yolculuğunuzda size eşlik ediyor.',
          advice: advices[index] || 'Bu kartın enerjisiyle uyum sağlayarak doğru yönde ilerleyebilirsiniz.'
        };
      }),
      
      lifeAspects: {
        love: mood === 'Mutlu' 
          ? 'Aşk hayatınızda pozitif gelişmeler sizi bekliyor. Mevcut ilişkinizi güçlendirecek fırsatlar doğabilir.'
          : mood === 'Kararsız' 
          ? 'Aşk konusunda aceleci kararlar almayın. Kalbinizin sesini dinleyin ve zamanın size rehberlik etmesine izin verin.'
          : 'Geçmişteki duygusal yaralarınız iyileşiyor. Kendinizi sevmeyi öğrenmek yeni ilişkiler için temel oluşturacak.',
        
        career: 'Kariyer yolculuğunuzda yeni bir dönem başlıyor. Yeteneklerinizi keşfetmek ve geliştirmek için ideal bir zaman. Mentor bulma konusunda açık olun.',
        
        personal: `${mood} ruh halinizle uyumlu olarak, kişisel gelişiminize odaklanmanın zamanı geldi. Meditasyon, okuma veya yeni hobiler edinmek size iyi gelecek.`
      },
      
      summary: `Kartlarınız, ${mood.toLowerCase()} hissettiğiniz bu dönemde yeni başlangıçlar yapmanız gerektiğini söylüyor. Sorunuz olan "${question}" ile ilgili olarak, cesaretle adımlar atmanız ve içsel sezgilerinize güvenmeniz öneriliyor. Bu okuma %85 güvenilirlik oranıyla hazırlanmıştır.`,
      
      confidence: 85,
      
      timestamp: new Date().toISOString()
    };
    
    console.log('Mock tarot okuması hazırlandı:', mockReading.readingTitle);
    
    return mockReading;
  };
  
  /**
   * Rastgele tarot kartı seçici (şimdilik kullanılmıyor ama gelecekte yararlı olabilir)
   */
  export const selectRandomCards = (cardCount: number = 3): string[] => {
    const availableCards = [
      'The Fool', 'The Magician', 'The High Priestess', 
      'The Empress', 'The Emperor'
    ];
    
    const shuffled = [...availableCards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(cardCount, availableCards.length));
  };
  
  /**
   * API hatası simülasyonu (test amaçlı)
   */
  export const simulateAPIError = async (): Promise<never> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('API bağlantı hatası (simüle edildi)');
  };