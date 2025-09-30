// app/constants/spreadTypes.ts

export type SpreadCategory = 'general' | 'love' | 'career' | 'spiritual' | 'decision' | 'timing';

export interface SpreadPosition {
  name: string;
  description: string;
}

export interface SpreadType {
  id: string;
  name: string;
  category: SpreadCategory;
  cardCount: number;
  description: string;
  positions: SpreadPosition[];
  difficulty: 'Kolay' | 'Orta' | 'Zor';
}

export interface CategoryInfo {
  id: SpreadCategory;
  name: string;
  description: string;
}

export const SPREAD_CATEGORIES: CategoryInfo[] = [
  {
    id: 'general',
    name: 'Genel',
    description: 'Hayatın genel akışı ve günlük sorular için ideal açılımlar'
  },
  {
    id: 'love',
    name: 'Aşk',
    description: 'İlişkiler, duygusal bağlar ve romantik sorular için'
  },
  {
    id: 'career',
    name: 'Kariyer',
    description: 'İş hayatı, kariyer gelişimi ve maddi konular için'
  },
  {
    id: 'spiritual',
    name: 'Ruhsal',
    description: 'Manevi gelişim, içsel yolculuk ve ruhsal sorular için'
  },
  {
    id: 'decision',
    name: 'Karar',
    description: 'Önemli kararlar ve seçimler için yol gösterici açılımlar'
  },
  {
    id: 'timing',
    name: 'Zamanlama',
    description: 'Belirli zaman dilimleri için öngörü ve planlama'
  }
];

export const CATEGORY_COLORS: Record<SpreadCategory | 'default', {
  primary: string;
  light: string;
  background: string;
}> = {
  general: {
    primary: '#8B5CF6',
    light: '#A78BFA',
    background: 'rgba(139, 92, 246, 0.1)'
  },
  love: {
    primary: '#EC4899',
    light: '#F472B6',
    background: 'rgba(236, 72, 153, 0.1)'
  },
  career: {
    primary: '#10B981',
    light: '#34D399',
    background: 'rgba(16, 185, 129, 0.1)'
  },
  spiritual: {
    primary: '#F59E0B',
    light: '#FBBF24',
    background: 'rgba(245, 158, 11, 0.1)'
  },
  decision: {
    primary: '#6366F1',
    light: '#818CF8',
    background: 'rgba(99, 102, 241, 0.1)'
  },
  timing: {
    primary: '#14B8A6',
    light: '#2DD4BF',
    background: 'rgba(20, 184, 166, 0.1)'
  },
  default: {
    primary: '#8B5CF6',
    light: '#A78BFA',
    background: 'rgba(139, 92, 246, 0.1)'
  }
};

export const SPREAD_TYPES: SpreadType[] = [
  // Genel
  {
    id: 'past-present-future',
    name: 'Geçmiş - Şimdi - Gelecek',
    category: 'general',
    cardCount: 3,
    description: 'Durumunuzun zaman içindeki gelişimini gösterir',
    positions: [
      { name: 'Geçmiş', description: 'Sizi bu noktaya getiren olaylar' },
      { name: 'Şimdi', description: 'Mevcut durumunuz' },
      { name: 'Gelecek', description: 'Muhtemel sonuç' }
    ],
    difficulty: 'Kolay'
  },
  {
    id: 'single-card',
    name: 'Tek Kart',
    category: 'general',
    cardCount: 1,
    description: 'Günlük rehberlik veya hızlı cevap için',
    positions: [
      { name: 'Mesaj', description: 'Günün mesajı' }
    ],
    difficulty: 'Kolay'
  },
  {
    id: 'celtic-cross',
    name: 'Kelt Haçı',
    category: 'general',
    cardCount: 10,
    description: 'En kapsamlı ve detaylı tarot açılımı',
    positions: [
      { name: 'Mevcut Durum', description: 'Şu anki durumunuz' },
      { name: 'Zorluk/Çapraz', description: 'Karşılaştığınız engel' },
      { name: 'Uzak Geçmiş', description: 'Köklerdeki sebepler' },
      { name: 'Yakın Geçmiş', description: 'Yakın zamandaki olaylar' },
      { name: 'Olası Sonuç', description: 'Muhtemel gelişme' },
      { name: 'Yakın Gelecek', description: 'Yakında olacaklar' },
      { name: 'Yaklaşımınız', description: 'Sizin tutumunuz' },
      { name: 'Dış Etkenler', description: 'Çevresel faktörler' },
      { name: 'Umutlar ve Korkular', description: 'İç dünyanız' },
      { name: 'Final Sonucu', description: 'Nihai sonuç' }
    ],
    difficulty: 'Zor'
  },
  {
    id: 'yes-no',
    name: 'Evet/Hayır',
    category: 'general',
    cardCount: 3,
    description: 'Net evet veya hayır cevabı için',
    positions: [
      { name: 'Evet Faktörleri', description: 'Olumlu yönler' },
      { name: 'Hayır Faktörleri', description: 'Olumsuz yönler' },
      { name: 'Sonuç', description: 'Nihai cevap' }
    ],
    difficulty: 'Kolay'
  },

  // Aşk
  {
    id: 'love-cross',
    name: 'Aşk Haçı',
    category: 'love',
    cardCount: 6,
    description: 'İlişkinizin derinlemesine analizi',
    positions: [
      { name: 'Siz', description: 'Sizin duygularınız ve durumunuz' },
      { name: 'Partner', description: 'Partnerinizin duyguları ve durumu' },
      { name: 'İlişkinin Temeli', description: 'İlişkinizin dayandığı temel' },
      { name: 'Zorluklar', description: 'Karşılaştığınız engeller' },
      { name: 'Güçlü Yönler', description: 'İlişkinizin güçlü yanları' },
      { name: 'Potansiyel', description: 'İlişkinin geleceği' }
    ],
    difficulty: 'Orta'
  },
  {
    id: 'relationship-check',
    name: 'İlişki Kontrolü',
    category: 'love',
    cardCount: 5,
    description: 'Mevcut ilişkinizin sağlık durumu',
    positions: [
      { name: 'Sizin Duygularınız', description: 'Kalbinizdekiler' },
      { name: 'Partner Duyguları', description: 'Partnerinizin hissettikleri' },
      { name: 'Bağlantı', description: 'Aranızdaki bağ' },
      { name: 'Engeller', description: 'Aşılması gereken sorunlar' },
      { name: 'Tavsiye', description: 'İlişki için öneriler' }
    ],
    difficulty: 'Orta'
  },
  {
    id: 'soulmate',
    name: 'Ruh Eşi',
    category: 'love',
    cardCount: 7,
    description: 'Ruh eşinizi bulma yolculuğu',
    positions: [
      { name: 'Hazır mısınız?', description: 'Ruhsal hazırlık durumunuz' },
      { name: 'Ne engel oluyor?', description: 'Aşılması gereken blokajlar' },
      { name: 'Nerede buluşacaksınız?', description: 'Karşılaşma mekanı/durumu' },
      { name: 'Nasıl tanıyacaksınız?', description: 'Tanıma işaretleri' },
      { name: 'İlk izlenim', description: 'İlk karşılaşma enerjisi' },
      { name: 'İlişkinin doğası', description: 'Bağınızın karakteri' },
      { name: 'Zaman', description: 'Zamanlama ipuçları' }
    ],
    difficulty: 'Orta'
  },

  // Kariyer
  {
    id: 'career-path',
    name: 'Kariyer Yolu',
    category: 'career',
    cardCount: 5,
    description: 'Kariyer gelişiminiz için rehberlik',
    positions: [
      { name: 'Mevcut Pozisyon', description: 'Şu anki konumunuz' },
      { name: 'Potansiyeliniz', description: 'Gizli yetenekleriniz' },
      { name: 'Engeller', description: 'Aşmanız gereken zorluklar' },
      { name: 'Fırsatlar', description: 'Yaklaşan olanaklar' },
      { name: 'Sonraki Adım', description: 'Atmanız gereken adım' }
    ],
    difficulty: 'Orta'
  },
  {
    id: 'work-situation',
    name: 'İş Durumu',
    category: 'career',
    cardCount: 4,
    description: 'Mevcut iş durumunuzun analizi',
    positions: [
      { name: 'Şu Anki Durum', description: 'İş yerindeki konumunuz' },
      { name: 'Zorluklar', description: 'Karşılaştığınız problemler' },
      { name: 'Destekler', description: 'Size yardımcı olan faktörler' },
      { name: 'Sonuç', description: 'Muhtemel gelişme' }
    ],
    difficulty: 'Kolay'
  },
  {
    id: 'financial',
    name: 'Finansal Durum',
    category: 'career',
    cardCount: 5,
    description: 'Maddi durumunuz ve finansal akış',
    positions: [
      { name: 'Mevcut Durum', description: 'Finansal konumunuz' },
      { name: 'Gelir Kaynakları', description: 'Para girişleri' },
      { name: 'Harcamalar', description: 'Para çıkışları' },
      { name: 'Fırsatlar', description: 'Finansal olanaklar' },
      { name: 'Finansal Tavsiye', description: 'Para yönetimi önerileri' }
    ],
    difficulty: 'Orta'
  },

  // Ruhsal
  {
    id: 'spiritual-growth',
    name: 'Ruhsal Gelişim',
    category: 'spiritual',
    cardCount: 4,
    description: 'Ruhsal yolculuğunuzda rehberlik',
    positions: [
      { name: 'Neredesiniz?', description: 'Ruhsal seviyeniz' },
      { name: 'Öğrenilecek Ders', description: 'Hayat dersiniz' },
      { name: 'Ruhsal Rehber Mesajı', description: 'Yüksek benliğinizden mesaj' },
      { name: 'Sonraki Seviye', description: 'Ulaşacağınız bilinç hali' }
    ],
    difficulty: 'Orta'
  },
  {
    id: 'chakra',
    name: 'Çakra Açılımı',
    category: 'spiritual',
    cardCount: 7,
    description: '7 çakranızın durumu',
    positions: [
      { name: 'Kök Çakra', description: 'Temel güvenlik ve hayatta kalma' },
      { name: 'Sakral Çakra', description: 'Yaratıcılık ve duygular' },
      { name: 'Solar Pleksus', description: 'Güç ve irade' },
      { name: 'Kalp Çakra', description: 'Sevgi ve şefkat' },
      { name: 'Boğaz Çakra', description: 'İletişim ve ifade' },
      { name: 'Üçüncü Göz', description: 'Sezgi ve vizyon' },
      { name: 'Taç Çakra', description: 'Manevi bağlantı' }
    ],
    difficulty: 'Zor'
  },
  {
    id: 'moon-phases',
    name: 'Ay Evreleri',
    category: 'spiritual',
    cardCount: 4,
    description: 'Ay döngüsü ile uyumlu rehberlik',
    positions: [
      { name: 'Yeni Ay - Niyet', description: 'Yeni başlangıçlar' },
      { name: 'İlk Dördün - Eylem', description: 'Harekete geçme zamanı' },
      { name: 'Dolunay - Bereket', description: 'Hasat ve tamamlanma' },
      { name: 'Son Dördün - Bırakma', description: 'Arınma ve temizlenme' }
    ],
    difficulty: 'Orta'
  },

  // Karar
  {
    id: 'decision-making',
    name: 'Karar Verme',
    category: 'decision',
    cardCount: 5,
    description: 'Önemli kararlar için derinlemesine analiz',
    positions: [
      { name: 'Durum', description: 'Mevcut durum analizi' },
      { name: 'Seçenek 1', description: 'İlk seçeneğin enerjisi' },
      { name: 'Seçenek 1 Sonucu', description: 'İlk seçeneğin sonuçları' },
      { name: 'Seçenek 2', description: 'İkinci seçeneğin enerjisi' },
      { name: 'Seçenek 2 Sonucu', description: 'İkinci seçeneğin sonuçları' }
    ],
    difficulty: 'Orta'
  },
  {
    id: 'two-paths',
    name: 'İki Yol',
    category: 'decision',
    cardCount: 6,
    description: 'İki seçenek arasında karar verme',
    positions: [
      { name: 'Siz', description: 'Sizin enerjiniz' },
      { name: 'Yol 1', description: 'Birinci yolun özellikleri' },
      { name: 'Yol 1 Sonucu', description: 'Birinci yolun getireceği' },
      { name: 'Yol 2', description: 'İkinci yolun özellikleri' },
      { name: 'Yol 2 Sonucu', description: 'İkinci yolun getireceği' },
      { name: 'Tavsiye', description: 'Evrensel rehberlik' }
    ],
    difficulty: 'Orta'
  },
  {
    id: 'pros-cons',
    name: 'Artı ve Eksiler',
    category: 'decision',
    cardCount: 4,
    description: 'Bir kararın avantaj ve dezavantajları',
    positions: [
      { name: 'Artı Yönler', description: 'Olumlu faktörler' },
      { name: 'Eksi Yönler', description: 'Olumsuz faktörler' },
      { name: 'Görünmeyen Faktör', description: 'Gizli etkenler' },
      { name: 'Nihai Tavsiye', description: 'Son öneri' }
    ],
    difficulty: 'Kolay'
  },

  // Zamanlama
  {
    id: 'weekly',
    name: 'Haftalık',
    category: 'timing',
    cardCount: 7,
    description: 'Önümüzdeki hafta için günlük rehberlik',
    positions: [
      { name: 'Pazartesi', description: 'Haftanın ilk günü' },
      { name: 'Salı', description: 'İkinci gün enerjisi' },
      { name: 'Çarşamba', description: 'Haftanın ortası' },
      { name: 'Perşembe', description: 'Dördüncü gün' },
      { name: 'Cuma', description: 'İş haftasının sonu' },
      { name: 'Cumartesi', description: 'Hafta sonu başlangıcı' },
      { name: 'Pazar', description: 'Dinlenme günü' }
    ],
    difficulty: 'Orta'
  },
  {
    id: 'monthly',
    name: 'Aylık',
    category: 'timing',
    cardCount: 4,
    description: 'Ay boyunca sizi bekleyenler',
    positions: [
      { name: '1. Hafta', description: 'Ayın başlangıcı' },
      { name: '2. Hafta', description: 'İkinci hafta enerjisi' },
      { name: '3. Hafta', description: 'Üçüncü hafta gelişmeleri' },
      { name: '4. Hafta', description: 'Ay sonu' }
    ],
    difficulty: 'Kolay'
  },
  {
    id: 'yearly',
    name: 'Yıllık',
    category: 'timing',
    cardCount: 12,
    description: 'Tüm yıl için aylık rehberlik',
    positions: [
      { name: 'Ocak', description: 'Yılın başlangıcı' },
      { name: 'Şubat', description: 'Kış ortası' },
      { name: 'Mart', description: 'Bahar başlangıcı' },
      { name: 'Nisan', description: 'Yenilenme zamanı' },
      { name: 'Mayıs', description: 'Büyüme dönemi' },
      { name: 'Haziran', description: 'Yılın ortası' },
      { name: 'Temmuz', description: 'Yaz enerjisi' },
      { name: 'Ağustos', description: 'Hasat zamanı' },
      { name: 'Eylül', description: 'Sonbahar başlangıcı' },
      { name: 'Ekim', description: 'Dönüşüm ayı' },
      { name: 'Kasım', description: 'Derinleşme' },
      { name: 'Aralık', description: 'Yıl sonu kapanışı' }
    ],
    difficulty: 'Zor'
  }
];