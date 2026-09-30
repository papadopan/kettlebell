import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { blockWorkouts, buildBlock, ProgramBlock, ProgramDay } from '@/data/programs';
import { ExerciseLevel } from '@/data/exercises';
import { registerProgramWorkouts, Workout } from '@/data/workouts';

const STORAGE_KEY = 'kettlebelt/program/v1';

type ProgramState = {
  /** The block the user is working through, if any. */
  block?: ProgramBlock;
  ready: boolean;
  start: (opts: { level: ExerciseLevel; daysPerWeek: number; pair?: boolean }) => ProgramBlock;
  /** Marks the day holding this workout as done. Called when a session is saved. */
  completeByWorkout: (workoutId: string) => void;
  complete: (index: number) => void;
  skip: (index: number) => void;
  /** Puts a skipped or finished day back on the list. */
  reopen: (index: number) => void;
  /** Replaces a day's workout with another one, keeping its place in the block. */
  swap: (index: number, workout: Workout) => void;
  abandon: () => void;
};

const ProgramContext = createContext<ProgramState | null>(null);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [block, setBlock] = useState<ProgramBlock | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as ProgramBlock;
        setBlock(saved);
        registerProgramWorkouts(blockWorkouts(saved));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((next?: ProgramBlock) => {
    setBlock(next);
    registerProgramWorkouts(next ? blockWorkouts(next) : []);
    if (next) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    else AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const patchDay = useCallback(
    (index: number, patch: Partial<ProgramDay>) => {
      setBlock((current) => {
        if (!current) return current;
        const next = { ...current, days: current.days.map((d) => (d.index === index ? { ...d, ...patch } : d)) };
        registerProgramWorkouts(blockWorkouts(next));
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const value = useMemo<ProgramState>(
    () => ({
      block,
      ready,
      start: (opts) => {
        const next = buildBlock(opts);
        persist(next);
        return next;
      },
      completeByWorkout: (workoutId) => {
        const day = block?.days.find((d) => d.workout.id === workoutId && d.status !== 'done');
        if (day) patchDay(day.index, { status: 'done', doneAt: new Date().toISOString() });
      },
      complete: (index) => patchDay(index, { status: 'done', doneAt: new Date().toISOString() }),
      skip: (index) => patchDay(index, { status: 'skipped' }),
      reopen: (index) => patchDay(index, { status: 'todo', doneAt: undefined }),
      swap: (index, workout) => {
        const day = block?.days.find((d) => d.index === index);
        patchDay(index, {
          workout,
          swapped: true,
          plannedTitle: day?.plannedTitle ?? day?.title,
          title: workout.name,
        });
      },
      abandon: () => persist(undefined),
    }),
    [block, ready, persist, patchDay],
  );

  return <ProgramContext.Provider value={value}>{children}</ProgramContext.Provider>;
}

export function useProgram() {
  const ctx = useContext(ProgramContext);
  if (!ctx) throw new Error('useProgram must be used inside ProgramProvider');
  return ctx;
}
