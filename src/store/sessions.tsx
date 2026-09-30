import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Format, registerLoggedWorkouts, Workout } from '@/data/workouts';

const STORAGE_KEY = 'kettlebelt/sessions/v1';

/** One finished workout, saved when the user taps "Save to log" on the summary. */
export type Session = {
  id: string;
  /** ISO date-time the session finished. */
  date: string;
  name: string;
  /** The workout this session came from, when it is still known. */
  workoutId?: string;
  /**
   * A copy of that workout, frozen at the moment it was logged. Kept so the session
   * stays openable after the plan is stopped or the workout is deleted.
   */
  workout?: Workout;
  /** Set once this session has been written to Apple Health, so it is never written twice. */
  healthId?: string;
  /**
   * What was actually completed, per exercise. Absent on sessions logged before this
   * was recorded — stats fall back to estimating those from the workout snapshot.
   */
  byExercise?: Record<string, { sets: number; reps: number; kg: number }>;
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

/** Keep every workout a session was logged against findable, whatever happened to it since. */
const keepWorkouts = (list: Session[]) =>
  registerLoggedWorkouts(list.map((s) => s.workout).filter((w): w is Workout => !!w));

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const list = raw ? (JSON.parse(raw) as Session[]) : [];
        setSessions(list);
        keepWorkouts(list);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((list: Session[]) => {
    setSessions(list);
    keepWorkouts(list);
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
