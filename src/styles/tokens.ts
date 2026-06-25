export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 9999,
} as const;

export const FontSize = {
  micro: 10,
  xs: 11,
  sm: 12,
  md: 14,
  base: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  display: 36,
  hero: 44,
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const FontFamily = {
  display: 'CaveatSemiBold',
  displayRegular: 'Caveat',
  body: 'Inter',
  bodyMedium: 'InterMedium',
  bodySemiBold: 'InterSemiBold',
  bodyBold: 'InterBold',
} as const;

export const LineHeight = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.7,
} as const;

export const Motion = {
  springGentle: { damping: 18, stiffness: 180, mass: 0.9 },
  springBounce: { damping: 12, stiffness: 220, mass: 0.7 },
  springSnap: { damping: 22, stiffness: 320, mass: 0.6 },
  timingFast: 160,
  timingBase: 260,
  timingSlow: 420,
} as const;

export const ZIndex = {
  base: 0,
  raised: 10,
  sticker: 20,
  sheet: 50,
  modal: 100,
  toast: 200,
} as const;