import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export const BELL_WEIGHTS = [6, 8, 12, 16, 20, 24, 28, 32] as const;

/** kg → how many of that bell the user owns (0, 1 or 2). */
export type OwnedBells = Record<number, number>;
export type Level = 'new' | 'some' | 'experienced';

type Saved = { owned: OwnedBells; onboarded: boolean; level: Level; daysPerWeek: number };

const STORAGE_KEY = 'kettlebelt/profile/v1';
const DEFAULTS: Saved = { owned: { 12: 1, 16: 2, 20: 1 }, onboarded: false, level: 'some', daysPerWeek: 3 };

type BellsState = Saved & {
  /** False until the saved profile has been read from the phone. */
  ready: boolean;
  cycle: (kg: number) => void;
  setLevel: (level: Level) => void;
  setDaysPerWeek: (days: number) => void;
  finishOnboarding: () => void;
  /** Development helper: forget everything and show onboarding again. */
  reset: () => void;
  /** Sorted list of owned weights, one entry per bell (a pair appears twice). */
  rack: number[];
  /** Distinct owned weights, ascending. */
  weights: number[];
};

const BellsContext = createContext<BellsState | null>(null);

export function BellsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Saved>(DEFAULTS);
  const [ready, setReady] = useState(false);

  // Load once on start.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSaved({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Saved>) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Save on every change after loading.
  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved)).catch(() => {});
  }, [saved, ready]);

  const value = useMemo<BellsState>(() => {
    const { owned } = saved;
    const weights = Object.keys(owned)
      .map(Number)
      .filter((kg) => (owned[kg] ?? 0) > 0)
      .sort((a, b) => a - b);
    const rack = weights.flatMap((kg) => Array.from({ length: owned[kg] }, () => kg));
    return {
      ...saved,
      ready,
      weights,
      rack,
      cycle: (kg) => setSaved((s) => ({ ...s, owned: { ...s.owned, [kg]: ((s.owned[kg] ?? 0) + 1) % 3 } })),
      setLevel: (level) => setSaved((s) => ({ ...s, level })),
      setDaysPerWeek: (daysPerWeek) => setSaved((s) => ({ ...s, daysPerWeek })),
      finishOnboarding: () => setSaved((s) => ({ ...s, onboarded: true })),
      reset: () => setSaved(DEFAULTS),
    };
  }, [saved, ready]);

  return <BellsContext.Provider value={value}>{children}</BellsContext.Provider>;
}

export function useBells() {
  const ctx = useContext(BellsContext);
  if (!ctx) throw new Error('useBells must be used inside BellsProvider');
  return ctx;
}
