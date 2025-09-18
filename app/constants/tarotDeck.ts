// Tarot kartı veri yapısı tanımlaması
export interface TarotCardData {
    id: number;
    name: string;
    imageName: string;
  }
  
  // Major Arcana kartları - Tarot destesinin ana kartları (22 kart)
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
  
  // Gelecekte tüm 78 kartı içeren ana deste (şimdilik sadece Major Arcana)
  export const FULL_TAROT_DECK: TarotCardData[] = [
    ...MAJOR_ARCANA
    // Minor Arcana kartları da buraya eklenecek
  ];