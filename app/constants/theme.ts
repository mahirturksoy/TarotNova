import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Renk paleti - Mistik ve premium hissiyat
export const colors = {
  // Ana renkler
  primary: {
    dark: '#0A0A0F',          // Deep space black
    medium: '#1A1A2E',        // Dark navy
    light: '#16213E',         // Midnight blue
    accent: '#E8B923',        // Mystical gold
    purple: '#6B46C1',        // Royal purple
    indigo: '#4338CA',        // Deep indigo
  },
  
  // Nötr renkler
  neutral: {
    white: '#FFFFFF',
    ivory: '#FFFEF7',         // Warm white
    gray100: '#F3F4F6',
    gray200: '#E5E7EB', 
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },
  
  // Gradient'lar
  gradients: {
    primary: ['#0A0A0F', '#1A1A2E', '#16213E'],
    accent: ['#E8B923', '#F59E0B', '#FBBF24'],
    card: ['#1F2937', '#374151', '#4B5563'],
    mystical: ['#6B46C1', '#7C3AED', '#8B5CF6'],
    aurora: ['#1e3c72', '#2a5298', '#1e3c72'],
    sunset: ['#FF6B6B', '#FFE66D', '#FF6B6B'],
  },
  
  // Durum renkleri
  status: {
    success: '#10B981',
    warning: '#F59E0B', 
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Transparency versions
  opacity: {
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
    white30: 'rgba(255, 255, 255, 0.3)',
    white50: 'rgba(255, 255, 255, 0.5)',
    white80: 'rgba(255, 255, 255, 0.8)',
    black10: 'rgba(0, 0, 0, 0.1)',
    black20: 'rgba(0, 0, 0, 0.2)',
    black50: 'rgba(0, 0, 0, 0.5)',
    gold20: 'rgba(232, 185, 35, 0.2)',
    gold30: 'rgba(232, 185, 35, 0.3)',
  }
};

// Tipografi sistemi
export const typography = {
  // Font aileleri
  fonts: {
    regular: 'System', // iOS: SF Pro, Android: Roboto
    medium: 'System',  
    semiBold: 'System',
    bold: 'System',
    // Premium fontlar için (opsiyonel)
    serif: 'Playfair Display', // Mistik başlıklar için
    script: 'Dancing Script',  // Özel yazılar için
  },
  
  // Font boyutları
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Satır yükseklikleri
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font ağırlıkları
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// Spacing sistemi (8pt grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 56,
  '6xl': 64,
  '8xl': 96,
};

// Border radius değerleri
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Shadow sistemi
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: colors.neutral.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  base: {
    shadowColor: colors.neutral.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  lg: {
    shadowColor: colors.neutral.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  xl: {
    shadowColor: colors.neutral.gray900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  
  // Özel glow efektleri
  glow: {
    shadowColor: colors.primary.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  mystical: {
    shadowColor: colors.primary.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Layout boyutları
export const layout = {
  screen: {
    width,
    height,
  },
  
  card: {
    minHeight: 200,
    aspectRatio: 2/3, // Tarot kartı oranı
  },
  
  header: {
    height: 60,
  },
  
  footer: {
    height: 80,
  },
  
  // Responsive breakpoints
  breakpoints: {
    sm: 375,  // iPhone SE
    md: 414,  // iPhone 11 Pro Max
    lg: 768,  // iPad mini
    xl: 1024, // iPad
  },
};

// Animasyon ayarları
export const animations = {
  // Timing
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
  },
  
  // Easing curves
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  
  // Transform değerleri
  transforms: {
    scale: {
      pressed: 0.95,
      hover: 1.05,
    },
    rotate: {
      slight: '2deg',
      card: '5deg',
    },
  },
};

// Component-specific theme
export const components = {
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    shadow: shadows.base,
  },
  
  button: {
    primary: {
      backgroundColor: colors.primary.accent,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      shadow: shadows.lg,
    },
    secondary: {
      backgroundColor: colors.opacity.white20,
      borderColor: colors.opacity.white30,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      padding: spacing.base,
    },
  },
  
  input: {
    backgroundColor: colors.opacity.white10,
    borderColor: colors.opacity.white20,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.base,
  },
};

// Default theme export
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animations,
  components,
};

// Helper functions
export const getResponsiveSize = (size: number): number => {
  const baseWidth = 375; // iPhone SE width
  const scale = width / baseWidth;
  return Math.round(size * scale);
};

export const isSmallScreen = (): boolean => width < layout.breakpoints.md;
export const isTablet = (): boolean => width >= layout.breakpoints.lg;

export default theme;