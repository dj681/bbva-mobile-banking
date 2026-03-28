import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base spacing unit (8dp grid)
const BASE = 8;

export const SPACING = {
  xxs: BASE * 0.25,   // 2
  xs: BASE * 0.5,     // 4
  sm: BASE,           // 8
  md: BASE * 2,       // 16
  lg: BASE * 3,       // 24
  xl: BASE * 4,       // 32
  xxl: BASE * 5,      // 40
  xxxl: BASE * 6,     // 48
  section: BASE * 8,  // 64
} as const;

export const BORDER_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
  full: 9999,
} as const;

export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  hero: 64,
} as const;

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 375,
  isMedium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
} as const;

export const CARD = {
  width: SCREEN_WIDTH - SPACING.md * 2,
  creditCardWidth: SCREEN_WIDTH - SPACING.md * 2,
  creditCardHeight: (SCREEN_WIDTH - SPACING.md * 2) * 0.5625, // 16:9 ratio
  borderRadius: BORDER_RADIUS.xl,
  elevation: 4,
  shadowOpacity: 0.15,
  shadowRadius: 8,
  shadowOffsetY: 4,
} as const;

export const HEADER = {
  height: 56,
  largeHeight: 80,
  iconSize: ICON_SIZES.lg,
  paddingHorizontal: SPACING.md,
} as const;

export const BOTTOM_TAB = {
  height: 60,
  iconSize: ICON_SIZES.lg,
  labelFontSize: 10,
} as const;

export const INPUT = {
  height: 56,
  borderWidth: 1,
  borderRadius: BORDER_RADIUS.md,
  paddingHorizontal: SPACING.md,
  fontSize: 16,
} as const;

export const BUTTON = {
  height: 48,
  smallHeight: 36,
  largeHeight: 56,
  borderRadius: BORDER_RADIUS.md,
  paddingHorizontal: SPACING.xl,
  iconSize: ICON_SIZES.md,
} as const;

export const AVATAR = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
  xxl: 96,
} as const;

export const HIT_SLOP = {
  xs: { top: 4, bottom: 4, left: 4, right: 4 },
  sm: { top: 8, bottom: 8, left: 8, right: 8 },
  md: { top: 12, bottom: 12, left: 12, right: 12 },
  lg: { top: 16, bottom: 16, left: 16, right: 16 },
} as const;
