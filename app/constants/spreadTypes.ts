// Spread tiplerinin tanımları

export interface SpreadPosition {
  id: string;
  name: string;
  description: string;
  x: number; // Layout pozisyonu (yüzde olarak)
  y: number;
}

export interface SpreadType {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  category: 'general' | 'love' | 'career' | 'spiritual';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

// Spread pozisyonları tanımları
export const SPREAD_POSITIONS = {
  // 3 Kart - Geçmiş, Şimdi, Gelecek
  pastPresentFuture: [
    { id: 'past', name: 'Geçmiş', description: 'Geçmişten gelen etkiler', x: 20, y: 50 },
    { id: 'present', name: 'Şimdi', description: 'Mevcut durum', x: 50, y: 50 },
    { id: 'future', name: 'Gelecek', description: 'Potansiyel sonuçlar', x: 80, y: 50 }
  ],

  // 5 Kart - Aşk Spread'i
  loveSpread: [
    { id: 'you', name: 'Sen', description: 'Senin durumun', x: 30, y: 20 },
    { id: 'partner', name: 'Karşı Taraf', description: 'Onun durumu', x: 70, y: 20 },
    { id: 'relationship', name: 'İlişki', description: 'İlişkinizin durumu', x: 50, y: 50 },
    { id: 'challenge', name: 'Zorluk', description: 'Karşılaştığınız zorluk', x: 20, y: 80 },
    { id: 'outcome', name: 'Sonuç', description: 'Potansiyel gelecek', x: 80, y: 80 }
  ],

  // 4 Kart - Kariyer Spread'i
  careerSpread: [
    { id: 'currentJob', name: 'Mevcut İş', description: 'Şu anki durumunuz', x: 25, y: 30 },
    { id: 'skills', name: 'Yetenekler', description: 'Güçlü yanlarınız', x: 75, y: 30 },
    { id: 'opportunity', name: 'Fırsat', description: 'Gelecek fırsatlar', x: 25, y: 70 },
    { id: 'advice', name: 'Tavsiye', description: 'Yapmanız gerekenler', x: 75, y: 70 }
  ],

  // 6 Kart - Kelta Haçı (Basitleştirilmiş)
  celticCross: [
    { id: 'present', name: 'Şimdi', description: 'Mevcut durum', x: 50, y: 50 },
    { id: 'challenge', name: 'Zorluk', description: 'Karşılaştığınız zorluk', x: 50, y: 30 },
    { id: 'past', name: 'Geçmiş', description: 'Geçmiş etkiler', x: 30, y: 50 },
    { id: 'future', name: 'Gelecek', description: 'Olası gelecek', x: 70, y: 50 },
    { id: 'above', name: 'Hedef', description: 'Ulaşmak istediğiniz', x: 50, y: 20 },
    { id: 'outcome', name: 'Sonuç', description: 'Final sonuç', x: 50, y: 80 }
  ]
};

// Mevcut spread tipleri
export const SPREAD_TYPES: SpreadType[] = [
  {
    id: 'past-present-future',
    name: 'Geçmiş - Şimdi - Gelecek',
    description: 'En popüler 3 kartlık okuma. Zaman çizgisi boyunca durumunuzu inceler.',
    cardCount: 3,
    positions: SPREAD_POSITIONS.pastPresentFuture,
    category: 'general',
    difficulty: 'beginner',
    estimatedTime: '5-8 dk'
  },
  {
    id: 'love-relationship',
    name: 'Aşk ve İlişki',
    description: 'Romantik ilişkinizi derinlemesine analiz eden 5 kartlık özel okuma.',
    cardCount: 5,
    positions: SPREAD_POSITIONS.loveSpread,
    category: 'love',
    difficulty: 'intermediate',
    estimatedTime: '8-12 dk'
  },
  {
    id: 'career-path',
    name: 'Kariyer Yolu',
    description: 'İş hayatınız ve kariyerinizle ilgili rehberlik sunan 4 kartlık okuma.',
    cardCount: 4,
    positions: SPREAD_POSITIONS.careerSpread,
    category: 'career',
    difficulty: 'intermediate',
    estimatedTime: '6-10 dk'
  },
  {
    id: 'celtic-cross-simple',
    name: 'Kelt Haçı (Basit)',
    description: 'Kapsamlı durum analizi için gelişmiş 6 kartlık okuma.',
    cardCount: 6,
    positions: SPREAD_POSITIONS.celticCross,
    category: 'spiritual',
    difficulty: 'advanced',
    estimatedTime: '12-15 dk'
  }
];

// Kategori renkleri
export const CATEGORY_COLORS = {
  general: {
    primary: '#6B46C1',
    light: '#A78BFA',
    background: 'rgba(107, 70, 193, 0.1)'
  },
  love: {
    primary: '#DC2626',
    light: '#F87171',
    background: 'rgba(220, 38, 38, 0.1)'
  },
  career: {
    primary: '#059669',
    light: '#34D399',
    background: 'rgba(5, 150, 105, 0.1)'
  },
  spiritual: {
    primary: '#7C2D12',
    light: '#FB923C',
    background: 'rgba(124, 45, 18, 0.1)'
  }
};

// Zorluk seviyeleri
export const DIFFICULTY_LABELS = {
  beginner: { label: 'Başlangıç', color: '#10B981' },
  intermediate: { label: 'Orta', color: '#F59E0B' },
  advanced: { label: 'İleri', color: '#EF4444' }
};