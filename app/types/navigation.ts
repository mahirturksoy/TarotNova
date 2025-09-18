// React Navigation için tip tanımlamaları

// Stack Navigator'ın parametre listesi
export type RootStackParamList = {
    Home: undefined;
    CardSelection: { question: string; mood: string };
    Reading: undefined;
  };
  
  // Navigation prop'ları için tip
  export type NavigationProps = {
    navigation: {
      navigate: (screen: keyof RootStackParamList, params?: any) => void;
      goBack: () => void;
    };
  };