import { ExerciseLevel, findExercise } from './exercises';

/**
 * Ready-made workouts and the "build your own" generator.
 *
 * Every workout is an EMOM (every minute on the minute): minute 1 does the first
 * exercise, minute 2 the second, and so on, looping through the list. You do the
 * reps, then rest for what is left of the minute.
 */

export type Group = 'full' | 'arms' | 'chest' | 'back' | 'core' | 'legs';
export type Load = 'light' | 'medium' | 'heavy';
export type Goal = 'Strength' | 'Conditioning' | 'Mobility';

export const GROUPS: { id: Group; label: string }[] = [
  { id: 'full', label: 'Full body' },
  { id: 'arms', label: 'Arms' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back & shoulders' },
  { id: 'core', label: 'Core' },
  { id: 'legs', label: 'Legs' },
];

export const groupLabel = (g: Group) => GROUPS.find((x) => x.id === g)?.label ?? g;

export type WorkoutItem = {
  exerciseId: string;
  reps: number;
  /** Reps are per side (left and right). */
  perSide?: boolean;
  /** Uses two bells at once. */
  twoBells?: boolean;
  load: Load;
};

export type Workout = {
  id: string;
  name: string;
  group: Group;
  level: ExerciseLevel;
  minutes: number;
  about: string;
  items: WorkoutItem[];
  generated?: boolean;
  goal?: Goal;
};

const I = (exerciseId: string, reps: number, load: Load, opts: { perSide?: boolean; twoBells?: boolean } = {}): WorkoutItem => ({
  exerciseId,
  reps,
  load,
  ...opts,
});
const side = { perSide: true };

export const workouts: Workout[] = [
  // Full body
  {
    id: 'full-foundation', name: 'Foundation', group: 'full', level: 'beginner', minutes: 20,
    about: 'The four basics in one session: swing, squat, row and press.',
    items: [I('kb-two-hand-swing', 10, 'medium'), I('Goblet_Squat', 8, 'medium'), I('One-Arm_Kettlebell_Row', 6, 'medium', side), I('Alternating_Kettlebell_Press', 5, 'light', side)],
  },
  {
    id: 'full-iron', name: 'Iron 24', group: 'full', level: 'intermediate', minutes: 24,
    about: 'Clean, squat, press and swing. A solid strength session.',
    items: [I('One-Arm_Kettlebell_Clean', 3, 'medium', side), I('Goblet_Squat', 8, 'heavy'), I('One-Arm_Kettlebell_Push_Press', 4, 'medium', side), I('One-Arm_Kettlebell_Swings', 6, 'heavy', side)],
  },
  {
    id: 'full-snatch', name: 'Snatch & get-up', group: 'full', level: 'advanced', minutes: 20,
    about: 'Two classic kettlebell lifts, alternating every minute.',
    items: [I('One-Arm_Kettlebell_Snatch', 5, 'medium', side), I('Kettlebell_Turkish_Get-Up_Lunge_style', 1, 'light', side)],
  },
  // Arms
  {
    id: 'arms-basics', name: 'Arm day', group: 'arms', level: 'beginner', minutes: 16,
    about: 'Biceps and triceps with light bells.',
    items: [I('kb-biceps-curl', 8, 'light', side), I('Kettlebell_Overhead_Triceps_Extension', 8, 'light'), I('kb-hammer-curl', 8, 'light', side), I('One-Arm_Kettlebell_Floor_Press', 6, 'medium', side)],
  },
  {
    id: 'arms-grip', name: 'Guns & grip', group: 'arms', level: 'intermediate', minutes: 20,
    about: 'Heavier curls, triceps and a bottoms-up clean for grip.',
    items: [I('kb-biceps-curl', 6, 'medium', side), I('Kettlebell_Overhead_Triceps_Extension', 10, 'medium'), I('Bottoms-Up_Clean_From_The_Hang_Position', 3, 'light', side), I('kb-hammer-curl', 8, 'medium', side)],
  },
  // Chest
  {
    id: 'chest-floor', name: 'Floor press builder', group: 'chest', level: 'beginner', minutes: 16,
    about: 'Floor press variations: easy on the shoulders, good for the chest.',
    items: [I('One-Arm_Kettlebell_Floor_Press', 6, 'medium', side), I('Plyo_Kettlebell_Pushups', 6, 'light'), I('Extended_Range_One-Arm_Kettlebell_Floor_Press', 5, 'light', side), I('Alternating_Floor_Press', 5, 'light', { perSide: true, twoBells: true })],
  },
  {
    id: 'chest-power', name: 'Push power', group: 'chest', level: 'intermediate', minutes: 20,
    about: 'Explosive push-ups and presses.',
    items: [I('Plyo_Kettlebell_Pushups', 8, 'light'), I('Leg-Over_Floor_Press', 6, 'medium', side), I('One-Arm_Kettlebell_Push_Press', 5, 'medium', side), I('Extended_Range_One-Arm_Kettlebell_Floor_Press', 6, 'light', side)],
  },
  // Back & shoulders
  {
    id: 'back-row-press', name: 'Row & press', group: 'back', level: 'beginner', minutes: 20,
    about: 'Pull, press and open up the shoulders.',
    items: [I('One-Arm_Kettlebell_Row', 8, 'heavy', side), I('Alternating_Kettlebell_Press', 5, 'light', side), I('Kettlebell_Sumo_High_Pull', 8, 'medium'), I('Kettlebell_Halo', 5, 'light', side)],
  },
  {
    id: 'back-strong', name: 'Strong back', group: 'back', level: 'intermediate', minutes: 24,
    about: 'Rows and high pulls for a thicker back, presses for the shoulders.',
    items: [I('Alternating_Renegade_Row', 5, 'medium', { perSide: true, twoBells: true }), I('Two-Arm_Kettlebell_Row', 8, 'heavy'), I('Kettlebell_Arnold_Press', 5, 'light', side), I('Kettlebell_Sumo_High_Pull', 10, 'medium')],
  },
  // Core
  {
    id: 'core-control', name: 'Core control', group: 'core', level: 'beginner', minutes: 16,
    about: 'Slow, controlled moves around the midsection.',
    items: [I('Kettlebell_Halo', 5, 'light', side), I('Kettlebell_Figure_8', 10, 'light'), I('Kettlebell_Windmill', 3, 'light', side), I('Kettlebell_Pirate_Ships', 8, 'light')],
  },
  {
    id: 'core-getup', name: 'Get-up flow', group: 'core', level: 'intermediate', minutes: 20,
    about: 'Turkish get-ups and windmills, with swings to keep you warm.',
    items: [I('Kettlebell_Turkish_Get-Up_Squat_style', 1, 'medium', side), I('Alternating_Renegade_Row', 4, 'light', { perSide: true, twoBells: true }), I('Kettlebell_Windmill', 4, 'light', side), I('kb-two-hand-swing', 12, 'medium')],
  },
  // Legs
  {
    id: 'legs-base', name: 'Leg day', group: 'legs', level: 'beginner', minutes: 20,
    about: 'Squat, deadlift, lunge and swing.',
    items: [I('Goblet_Squat', 10, 'medium'), I('kb-deadlift', 10, 'heavy'), I('Lunge_Pass_Through', 5, 'light', side), I('kb-two-hand-swing', 12, 'medium')],
  },
  {
    id: 'legs-power', name: 'Hips & legs', group: 'legs', level: 'intermediate', minutes: 24,
    about: 'Single-leg work, thrusters and heavy swings.',
    items: [I('Front_Squats_With_Two_Kettlebells', 6, 'medium', { twoBells: true }), I('Kettlebell_One-Legged_Deadlift', 5, 'medium', side), I('Kettlebell_Thruster', 6, 'medium'), I('One-Arm_Kettlebell_Swings', 8, 'medium', side)],
  },
];

// ---- Weights ----

/** Picks a bell from the ones the user owns: lightest, middle or heaviest. */
export function loadFor(load: Load, weights: number[]): number {
  if (!weights.length) return 0;
  if (load === 'light') return weights[0];
  if (load === 'heavy') return weights[weights.length - 1];
  return weights[Math.floor((weights.length - 1) / 2)];
}

export const repsFor = (item: WorkoutItem) => item.reps * (item.perSide ? 2 : 1);
export const kgFor = (item: WorkoutItem, weights: number[]) => repsFor(item) * loadFor(item.load, weights) * (item.twoBells ? 2 : 1);
export const itemForMinute = (w: Workout, minute: number) => w.items[(minute - 1) % w.items.length];
export const repsLabel = (item: WorkoutItem) => `${item.reps}${item.perSide ? ' / side' : ''}`;

export function totals(w: Workout, weights: number[]) {
  let reps = 0;
  let kg = 0;
  for (let m = 1; m <= w.minutes; m++) {
    const item = itemForMinute(w, m);
    reps += repsFor(item);
    kg += kgFor(item, weights);
  }
  return { reps, kg };
}

export const exerciseName = (id: string) => findExercise(id)?.name ?? id;

// ---- Build your own ----

type PoolEntry = { id: string; reps: number; perSide?: boolean; twoBells?: boolean; heavy?: boolean };

const POOL: Record<Group, PoolEntry[]> = {
  full: [
    { id: 'kb-two-hand-swing', reps: 10, heavy: true },
    { id: 'Goblet_Squat', reps: 8, heavy: true },
    { id: 'One-Arm_Kettlebell_Row', reps: 6, perSide: true, heavy: true },
    { id: 'Alternating_Kettlebell_Press', reps: 5, perSide: true },
    { id: 'One-Arm_Kettlebell_Clean', reps: 4, perSide: true },
    { id: 'Kettlebell_Thruster', reps: 6 },
    { id: 'kb-deadlift', reps: 8, heavy: true },
  ],
  arms: [
    { id: 'kb-biceps-curl', reps: 8, perSide: true },
    { id: 'kb-hammer-curl', reps: 8, perSide: true },
    { id: 'Kettlebell_Overhead_Triceps_Extension', reps: 10 },
    { id: 'One-Arm_Kettlebell_Floor_Press', reps: 6, perSide: true },
    { id: 'Bottoms-Up_Clean_From_The_Hang_Position', reps: 3, perSide: true },
  ],
  chest: [
    { id: 'One-Arm_Kettlebell_Floor_Press', reps: 6, perSide: true, heavy: true },
    { id: 'Plyo_Kettlebell_Pushups', reps: 8 },
    { id: 'Extended_Range_One-Arm_Kettlebell_Floor_Press', reps: 5, perSide: true },
    { id: 'Leg-Over_Floor_Press', reps: 6, perSide: true },
    { id: 'Alternating_Floor_Press', reps: 5, perSide: true, twoBells: true },
  ],
  back: [
    { id: 'One-Arm_Kettlebell_Row', reps: 8, perSide: true, heavy: true },
    { id: 'Two-Arm_Kettlebell_Row', reps: 8, heavy: true },
    { id: 'Kettlebell_Sumo_High_Pull', reps: 8 },
    { id: 'Alternating_Kettlebell_Press', reps: 5, perSide: true },
    { id: 'Kettlebell_Arnold_Press', reps: 5, perSide: true },
    { id: 'Kettlebell_Halo', reps: 5, perSide: true },
  ],
  core: [
    { id: 'Kettlebell_Halo', reps: 5, perSide: true },
    { id: 'Kettlebell_Figure_8', reps: 10 },
    { id: 'Kettlebell_Windmill', reps: 3, perSide: true },
    { id: 'Kettlebell_Pirate_Ships', reps: 8 },
    { id: 'Kettlebell_Turkish_Get-Up_Squat_style', reps: 1, perSide: true },
    { id: 'Alternating_Renegade_Row', reps: 4, perSide: true, twoBells: true },
  ],
  legs: [
    { id: 'Goblet_Squat', reps: 10, heavy: true },
    { id: 'kb-deadlift', reps: 10, heavy: true },
    { id: 'Lunge_Pass_Through', reps: 5, perSide: true },
    { id: 'kb-two-hand-swing', reps: 12, heavy: true },
    { id: 'Kettlebell_One-Legged_Deadlift', reps: 5, perSide: true },
    { id: 'Kettlebell_Thruster', reps: 6 },
  ],
};

const generated = new Map<string, Workout>();

export function getWorkout(id: string): Workout | undefined {
  return workouts.find((w) => w.id === id) ?? generated.get(id);
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Builds a new EMOM from the chosen body part, time and goal, and remembers it for this session. */
export function generateWorkout(opts: { group: Group; minutes: number; goal: Goal }): Workout {
  const count = opts.minutes <= 10 ? 2 : opts.minutes <= 20 ? 3 : 4;
  const picks = shuffle(POOL[opts.group]).slice(0, count);
  const items = picks.map<WorkoutItem>((p) => {
    if (opts.goal === 'Strength') {
      return { exerciseId: p.id, reps: Math.max(1, Math.round(p.reps * 0.7)), perSide: p.perSide, twoBells: p.twoBells, load: p.heavy ? 'heavy' : 'medium' };
    }
    if (opts.goal === 'Conditioning') {
      return { exerciseId: p.id, reps: Math.max(1, Math.round(p.reps * 1.3)), perSide: p.perSide, twoBells: p.twoBells, load: p.heavy ? 'medium' : 'light' };
    }
    return { exerciseId: p.id, reps: p.reps, perSide: p.perSide, twoBells: p.twoBells, load: 'light' };
  });
  const w: Workout = {
    id: `gen-${Date.now()}`,
    name: `Your ${groupLabel(opts.group).toLowerCase()} EMOM`,
    group: opts.group,
    level: 'intermediate',
    minutes: opts.minutes,
    about: `${opts.goal} focus, built from your bells. Shuffle for a different mix.`,
    items,
    generated: true,
    goal: opts.goal,
  };
  generated.set(w.id, w);
  return w;
}
