import { Platform } from 'react-native';

export const FONT_FAMILY = {
  thin: Platform.select({ ios: 'Roboto-Thin', android: 'Roboto-Thin', default: 'Roboto-Thin' }),
  light: Platform.select({ ios: 'Roboto-Light', android: 'Roboto-Light', default: 'Roboto-Light' }),
  regular: Platform.select({ ios: 'Roboto-Regular', android: 'Roboto-Regular', default: 'Roboto-Regular' }),
  medium: Platform.select({ ios: 'Roboto-Medium', android: 'Roboto-Medium', default: 'Roboto-Medium' }),
  bold: Platform.select({ ios: 'Roboto-Bold', android: 'Roboto-Bold', default: 'Roboto-Bold' }),
  black: Platform.select({ ios: 'Roboto-Black', android: 'Roboto-Black', default: 'Roboto-Black' }),
  thinItalic: Platform.select({ ios: 'Roboto-ThinItalic', android: 'Roboto-ThinItalic', default: 'Roboto-ThinItalic' }),
  lightItalic: Platform.select({ ios: 'Roboto-LightItalic', android: 'Roboto-LightItalic', default: 'Roboto-LightItalic' }),
  italic: Platform.select({ ios: 'Roboto-Italic', android: 'Roboto-Italic', default: 'Roboto-Italic' }),
  mediumItalic: Platform.select({ ios: 'Roboto-MediumItalic', android: 'Roboto-MediumItalic', default: 'Roboto-MediumItalic' }),
  boldItalic: Platform.select({ ios: 'Roboto-BoldItalic', android: 'Roboto-BoldItalic', default: 'Roboto-BoldItalic' }),
  blackItalic: Platform.select({ ios: 'Roboto-BlackItalic', android: 'Roboto-BlackItalic', default: 'Roboto-BlackItalic' }),
} as const;

export const FONT_SIZE = {
  xxxs: 9,
  xxs: 10,
  xs: 11,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display1: 32,
  display2: 40,
  display3: 48,
} as const;

export const FONT_WEIGHT = {
  thin: '100',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

export const LINE_HEIGHT = {
  tight: 1.15,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const LETTER_SPACING = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1.0,
  allCaps: 1.25,
} as const;

// Typography presets for consistent usage across the app
export const TYPOGRAPHY = {
  displayLarge: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.display1,
    lineHeight: FONT_SIZE.display1 * LINE_HEIGHT.tight,
    letterSpacing: LETTER_SPACING.tight,
  },
  displayMedium: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.xxxl,
    lineHeight: FONT_SIZE.xxxl * LINE_HEIGHT.snug,
    letterSpacing: LETTER_SPACING.tight,
  },
  displaySmall: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.xxl,
    lineHeight: FONT_SIZE.xxl * LINE_HEIGHT.snug,
    letterSpacing: LETTER_SPACING.normal,
  },
  headlineLarge: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.xl,
    lineHeight: FONT_SIZE.xl * LINE_HEIGHT.snug,
    letterSpacing: LETTER_SPACING.normal,
  },
  headlineMedium: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    lineHeight: FONT_SIZE.lg * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  headlineSmall: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.base,
    lineHeight: FONT_SIZE.base * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.wide,
  },
  titleLarge: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.lg,
    lineHeight: FONT_SIZE.lg * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  titleMedium: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.base,
    lineHeight: FONT_SIZE.base * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.wide,
  },
  titleSmall: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.sm,
    lineHeight: FONT_SIZE.sm * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.wide,
  },
  bodyLarge: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.base,
    lineHeight: FONT_SIZE.base * LINE_HEIGHT.relaxed,
    letterSpacing: LETTER_SPACING.wide,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.md,
    lineHeight: FONT_SIZE.md * LINE_HEIGHT.relaxed,
    letterSpacing: LETTER_SPACING.wide,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.sm,
    lineHeight: FONT_SIZE.sm * LINE_HEIGHT.relaxed,
    letterSpacing: LETTER_SPACING.wide,
  },
  labelLarge: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.md,
    lineHeight: FONT_SIZE.md * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.wider,
  },
  labelMedium: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.sm,
    lineHeight: FONT_SIZE.sm * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.wider,
  },
  labelSmall: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.xxs,
    lineHeight: FONT_SIZE.xxs * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.allCaps,
  },
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.xs,
    lineHeight: FONT_SIZE.xs * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.wide,
  },
  overline: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.xxs,
    lineHeight: FONT_SIZE.xxs * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.allCaps,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.md,
    lineHeight: FONT_SIZE.md * LINE_HEIGHT.normal,
    letterSpacing: LETTER_SPACING.wider,
  },
  amount: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.xxl,
    lineHeight: FONT_SIZE.xxl * LINE_HEIGHT.tight,
    letterSpacing: LETTER_SPACING.tight,
  },
  amountLarge: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.display1,
    lineHeight: FONT_SIZE.display1 * LINE_HEIGHT.tight,
    letterSpacing: LETTER_SPACING.tight,
  },
} as const;

export type TypographyVariant = keyof typeof TYPOGRAPHY;
