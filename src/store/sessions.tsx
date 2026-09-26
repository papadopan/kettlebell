import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Format } from '@/data/workouts';

const STORAGE_KEY = 'kettlebelt/sessions/v1';

/** One finished workout, saved when the user taps "Save to log" on the summary. */
export type Session = {
  id: string;
  /** ISO date-time the session finished. */
  date: string;
  name: string;
  format: Format;
  /** Bell weight used, in kg. */
  bell: number;
  /** Seconds actually trained. */
  seconds: number;
  rounds: number;
  reps: number;
  kg: number;
  feel?: string;
};

type SessionsState = {
  sessions: Session[];
  ready: boolean;
  add: (session: Session) => void;
  clear: () => void;
};

const SessionsContext = createContext<SessionsState | null>(null);

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setSessions(raw ? (JSON.parse(raw) as Session[]) : []))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((list: Session[]) => {
    setSessions(list);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const value = useMemo<SessionsState>(
    () => ({
      sessions,
      ready,
      // Newest first.
      add: (session) => persist([session, ...sessions]),
      clear: () => persist([]),
    }),
    [sessions, ready, persist],
  );

  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>;
}

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error('useSessions must be used inside SessionsProvider');
  return ctx;
}
