export const colors = {
  bg: '#141719',
  surface: '#1E2225',
  surface2: '#282D31',
  line: '#353B40',
  text: '#EEF1F2',
  muted: '#A1AAAF',
  dim: '#7C868B',
  go: '#4CBF7F',
  onGo: '#0B1A11',
  warn: '#F5A524',
  onWarn: '#1F1400',
} as const;

/** Competition kettlebell colours, keyed by weight in kg. */
export const bellColors: Record<number, string> = {
  6: '#8C959A',
  8: '#E88BB5',
  12: '#5B9BE0',
  16: '#E8C23A',
  20: '#A884D6',
  24: '#4CBF7F',
  28: '#EE8B45',
  32: '#E6645A',
};

export const bellColor = (kg: number) => bellColors[kg] ?? colors.muted;

export const fonts = {
  display: 'BarlowCondensed_800ExtraBold',
  displayBold: 'BarlowCondensed_700Bold',
  body: 'IBMPlexSans_400Regular',
  bodyMedium: 'IBMPlexSans_500Medium',
  bodySemi: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
} as const;

export const space = { gutter: 22 } as const;
