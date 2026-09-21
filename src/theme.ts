export type ThemeMode = 'dark' | 'light';

const palettes = {
  dark: {
    bg: '#141719',
    surface: '#1E2225',
    surface2: '#282D31',
    line: '#353B40',
    text: '#EEF1F2',
    muted: '#A1AAAF',
    dim: '#7C868B',
    go: '#4CBF7F',
    /** Green for small text and links; darker on light backgrounds for contrast. */
    goText: '#4CBF7F',
    onGo: '#0B1A11',
    warn: '#F5A524',
    onWarn: '#1F1400',
  },
  light: {
    bg: '#F3F4F2',
    surface: '#FFFFFF',
    surface2: '#E6E9E8',
    line: '#D3D8D9',
    text: '#16191B',
    muted: '#56606A',
    dim: '#8A9398',
    go: '#3DAA6D',
    goText: '#1F7A48',
    onGo: '#08140D',
    warn: '#F0A01E',
    onWarn: '#1F1400',
  },
};

/** Competition kettlebell colours, keyed by weight in kg. Slightly deeper on light backgrounds. */
const bellPalettes: Record<ThemeMode, Record<number, string>> = {
  dark: { 6: '#8C959A', 8: '#E88BB5', 12: '#5B9BE0', 16: '#E8C23A', 20: '#A884D6', 24: '#4CBF7F', 28: '#EE8B45', 32: '#E6645A' },
  light: { 6: '#7E878C', 8: '#D46A9A', 12: '#2D6FB7', 16: '#C99A00', 20: '#7B4FA8', 24: '#2F8F5B', 28: '#D96A1E', 32: '#C9372C' },
};

/**
 * The active colours. This object is updated in place when the theme changes,
 * so read it during render (never copy values into module-level constants).
 */
export const colors = { ...palettes.dark };
export const bellColors: Record<number, string> = { ...bellPalettes.dark };
export const bellColor = (kg: number) => bellColors[kg] ?? colors.muted;

let version = 0;
export let themeMode: ThemeMode = 'dark';

export function applyTheme(mode: ThemeMode) {
  themeMode = mode;
  Object.assign(colors, palettes[mode]);
  Object.assign(bellColors, bellPalettes[mode]);
  version += 1;
}

/**
 * Like StyleSheet.create, but rebuilt after a theme change.
 * Usage: const styles = themedStyles(() => StyleSheet.create({ ... }));
 */
export function themedStyles<T extends object>(factory: () => T): T {
  let builtFor = -1;
  let cache = {} as T;
  return new Proxy({} as T, {
    get(_target, key) {
      if (builtFor !== version) {
        cache = factory();
        builtFor = version;
      }
      return cache[key as keyof T];
    },
  });
}

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
