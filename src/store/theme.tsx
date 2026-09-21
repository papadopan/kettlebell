import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, Fragment, ReactNode, useContext, useEffect, useState } from 'react';

import { applyTheme, ThemeMode } from '@/theme';

const STORAGE_KEY = 'kettlebelt/theme/v1';

type ThemeState = { mode: ThemeMode; toggle: () => void };
const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        const m: ThemeMode = saved === 'light' ? 'light' : 'dark';
        applyTheme(m);
        setMode(m);
      })
      .catch(() => {
        applyTheme('dark');
        setMode('dark');
      });
  }, []);

  if (!mode) return null;

  const toggle = () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  // Keying on the mode re-renders every screen with the new colours.
  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <Fragment key={mode}>{children}</Fragment>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
