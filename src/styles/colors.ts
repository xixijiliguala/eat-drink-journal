export const Colors = {
  bg: '#2D2420',
  bgDark: '#1E1A17',
  bgDeep: '#15110F',
  surface: '#3A302B',
  surfaceRaised: '#4A3F3A',
  surfacePressed: '#5C4E47',

  cellBg: '#4A3F3A',
  cellBgPressed: '#5C4E47',
  cardBg: '#3A302B',

  paper: '#F5E6C8',
  paperWarm: '#EFE0C0',
  paperEdge: '#D8C6A3',
  paperDeep: '#C9B388',

  tape: 'rgba(245, 230, 200, 0.55)',
  tapeShadow: 'rgba(0, 0, 0, 0.18)',

  textPrimary: '#F5E6C8',
  textSecondary: '#C9B388',
  textMuted: '#8C7A66',
  textOnPaper: '#5C4A3A',
  textOnPaperMuted: '#8A7355',
  textToday: '#FFD700',

  stickyNote: '#F5E6C8',
  stickyNoteText: '#5C4A3A',

  white: '#FFFFFF',
  offWhite: '#F8F0E0',
  border: '#6B5E57',
  borderSoft: 'rgba(245, 230, 200, 0.18)',
  borderPaper: 'rgba(92, 74, 58, 0.18)',

  overlay: 'rgba(0, 0, 0, 0.7)',
  overlaySoft: 'rgba(0, 0, 0, 0.35)',
  scrim: 'rgba(45, 36, 32, 0.55)',

  tabActive: '#F5A623',
  tabInactive: '#888888',

  danger: '#E8422F',
  success: '#7BC47F',

  accentTeal: '#5BA9A0',
  accentTealDeep: '#3D7A75',
  accentCoral: '#E8806A',
  accentCoralDeep: '#B85A45',
  accentPlum: '#8B5FBC',
  accentAmber: '#F5A623',
  accentAmberDeep: '#B87A1A',

  brandStarbucks: '#00704A',
  brandLuckin: '#1E90FF',
  brandHeytea: '#F5A623',
  brandMixue: '#E8422F',
  brandGeneric: '#5C4A3A',

  tarotGold: '#D4A853',
  tarotGoldBright: '#F5D88A',
  tarotGoldDeep: '#9C7A3A',
  tarotPurple: '#6B3FA0',
  tarotPurpleLight: '#8B5FBC',
  tarotCardBack: '#1E1820',

  shadow: '#000000',
  glow: 'rgba(212, 168, 83, 0.35)',
  glowTeal: 'rgba(91, 169, 160, 0.35)',
  glowCoral: 'rgba(232, 128, 106, 0.35)',
} as const;

export type ColorKey = keyof typeof Colors;

export const Shadows = {
  sticker: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  polaroid: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 9,
    elevation: 7,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHigh: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 12,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 18,
  },
  inset: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1,
  },
} as const;