// app/constants/tarotDeck.ts - Güncellenmiş versiyon

export interface TarotCardData {
  id: number;
  name: string;
  imageName: string;
}

// Major Arcana kartları
export const MAJOR_ARCANA: TarotCardData[] = [
  { 
    id: 0, 
    name: 'The Fool', 
    imageName: 'the_fool.png'
  },
  { 
    id: 1, 
    name: 'The Magician', 
    imageName: 'the_magician.png'
  },
  { 
    id: 2, 
    name: 'The High Priestess', 
    imageName: 'the_high_priestess.png'
  },
  { 
    id: 3, 
    name: 'The Empress', 
    imageName: 'the_empress.png'
  },
  { 
    id: 4, 
    name: 'The Emperor', 
    imageName: 'the_emperor.png'
  },
  { 
    id: 5, 
    name: 'The Hierophant', 
    imageName: 'the_hierophant.png'
  },
  { 
    id: 6, 
    name: 'The Lovers', 
    imageName: 'the_lovers.png'
  },
  { 
    id: 7, 
    name: 'The Chariot', 
    imageName: 'the_chariot.png'
  },
  { 
    id: 8, 
    name: 'Strength', 
    imageName: 'strength.png'
  },
  { 
    id: 9, 
    name: 'The Hermit', 
    imageName: 'the_hermit.png'
  },
  { 
    id: 10, 
    name: 'Wheel of Fortune', 
    imageName: 'wheel_of_fortune.png'
  },
  { 
    id: 11, 
    name: 'Justice', 
    imageName: 'justice.png'
  },
  { 
    id: 12, 
    name: 'The Hanged Man', 
    imageName: 'the_hanged_man.png'
  },
  { 
    id: 13, 
    name: 'Death', 
    imageName: 'death.png'
  },
  { 
    id: 14, 
    name: 'Temperance', 
    imageName: 'temperance.png'
  },
  { 
    id: 15, 
    name: 'The Devil', 
    imageName: 'the_devil.png'
  },
  { 
    id: 16, 
    name: 'The Tower', 
    imageName: 'the_tower.png'
  },
  { 
    id: 17, 
    name: 'The Star', 
    imageName: 'the_star.png'
  },
  { 
    id: 18, 
    name: 'The Moon', 
    imageName: 'the_moon.png'
  },
  { 
    id: 19, 
    name: 'The Sun', 
    imageName: 'the_sun.png'
  },
  { 
    id: 20, 
    name: 'Judgement', 
    imageName: 'judgement.png'
  },
  { 
    id: 21, 
    name: 'The World', 
    imageName: 'the_world.png'
  }
];

// Kart resimlerini require eden helper fonksiyon
export const getCardImage = (imageName: string) => {
  const images: Record<string, any> = {
    'the_fool.png': require('../../assets/tarot-cards/the_fool.png'),
    'the_magician.png': require('../../assets/tarot-cards/the_magician.png'),
    'the_high_priestess.png': require('../../assets/tarot-cards/the_high_priestess.png'),
    'the_empress.png': require('../../assets/tarot-cards/the_empress.png'),
    'the_emperor.png': require('../../assets/tarot-cards/the_emperor.png'),
    'the_hierophant.png': require('../../assets/tarot-cards/the_hierophant.png'),
    'the_lovers.png': require('../../assets/tarot-cards/the_lovers.png'),
    'the_chariot.png': require('../../assets/tarot-cards/the_chariot.png'),
    'strength.png': require('../../assets/tarot-cards/strength.png'),
    'the_hermit.png': require('../../assets/tarot-cards/the_hermit.png'),
    'wheel_of_fortune.png': require('../../assets/tarot-cards/wheel_of_fortune.png'),
    'justice.png': require('../../assets/tarot-cards/justice.png'),
    'the_hanged_man.png': require('../../assets/tarot-cards/the_hanged_man.png'),
    'death.png': require('../../assets/tarot-cards/death.png'),
    'temperance.png': require('../../assets/tarot-cards/temperance.png'),
    'the_devil.png': require('../../assets/tarot-cards/the_devil.png'),
    'the_tower.png': require('../../assets/tarot-cards/the_tower.png'),
    'the_star.png': require('../../assets/tarot-cards/the_star.png'),
    'the_moon.png': require('../../assets/tarot-cards/the_moon.png'),
    'the_sun.png': require('../../assets/tarot-cards/the_sun.png'),
    'judgement.png': require('../../assets/tarot-cards/judgement.png'),
    'the_world.png': require('../../assets/tarot-cards/the_world.png'),
  };
  
  return images[imageName] || null;
};

export const FULL_TAROT_DECK: TarotCardData[] = [...MAJOR_ARCANA];