import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { registerMyWorkouts, Workout } from '@/data/workouts';

const STORAGE_KEY = 'kettlebelt/my-workouts/v1';

type MyWorkoutsState = {
  /** The user's own workouts, newest first. */
  mine: Workout[];
  ready: boolean;
  /** Adds a new workout or replaces one with the same id. */
  save: (workout: Workout) => void;
  remove: (id: string) => void;
};

const MyWorkoutsContext = createContext<MyWorkoutsState | null>(null);

export function MyWorkoutsProvider({ children }: { children: ReactNode }) {
  const [mine, setMine] = useState<Workout[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const list = raw ? (JSON.parse(raw) as Workout[]) : [];
        setMine(list);
        registerMyWorkouts(list);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((list: Workout[]) => {
    setMine(list);
    registerMyWorkouts(list);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const value = useMemo<MyWorkoutsState>(
    () => ({
      mine,
      ready,
      save: (workout) => persist([workout, ...mine.filter((w) => w.id !== workout.id)]),
      remove: (id) => persist(mine.filter((w) => w.id !== id)),
    }),
    [mine, ready, persist],
  );

  return <MyWorkoutsContext.Provider value={value}>{children}</MyWorkoutsContext.Provider>;
}

export function useMyWorkouts() {
  const ctx = useContext(MyWorkoutsContext);
  if (!ctx) throw new Error('useMyWorkouts must be used inside MyWorkoutsProvider');
  return ctx;
}

export const newWorkoutId = () => `my-${Date.now()}`;
