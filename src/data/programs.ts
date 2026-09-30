import { ExerciseLevel } from './exercises';
import { Format, generateWorkout, Goal, Group, Workout } from './workouts';

/**
 * A 4-week training block.
 *
 * The block is a SEQUENCE, not a calendar: day 5 is day 5 whether you did it on
 * Tuesday or three weeks later. "Days per week" only sets the pace you are aiming
 * for, so a missed day is never a failure — you are simply not as far down the list.
 *
 * Each day is described as an INTENT (body part, format, length, goal) and the
 * generator fills it from the exercise pool when the block is created. The result is
 * then frozen into the block, so a day never changes under the user's feet.
 */

export type DayPlan = {
  title: string;
  group: Group;
  format: Format;
  goal: Goal;
  minutes?: number;
  rounds?: number;
  workSec?: number;
  restSec?: number;
  count?: number;
};

/** The rotation of day types for each level. Days are taken from here in order and wrap around. */
const PLANS: Record<ExerciseLevel, DayPlan[]> = {
  beginner: [
    { title: 'Full body basics', group: 'full', format: 'emom', minutes: 16, goal: 'Strength' },
    { title: 'Legs & hinge', group: 'legs', format: 'sets', rounds: 3, restSec: 90, goal: 'Strength' },
    { title: 'Press & pull', group: 'back', format: 'emom', minutes: 16, goal: 'Strength' },
    { title: 'Core & breath', group: 'core', format: 'fortime', rounds: 3, goal: 'Conditioning' },
    { title: 'Easy engine', group: 'full', format: 'amrap', minutes: 10, goal: 'Conditioning' },
  ],
  intermediate: [
    { title: 'Full body strength', group: 'full', format: 'emom', minutes: 20, goal: 'Strength' },
    { title: 'Legs & hinge', group: 'legs', format: 'sets', rounds: 4, restSec: 90, goal: 'Strength' },
    { title: 'Shoulders & back', group: 'back', format: 'intervals', rounds: 8, workSec: 30, restSec: 15, goal: 'Conditioning' },
    { title: 'Push day', group: 'chest', format: 'sets', rounds: 4, restSec: 90, goal: 'Strength' },
    { title: 'Core under time', group: 'core', format: 'fortime', rounds: 5, goal: 'Conditioning' },
    { title: 'The engine', group: 'full', format: 'amrap', minutes: 12, goal: 'Conditioning' },
  ],
  advanced: [
    { title: 'Full body strength', group: 'full', format: 'emom', minutes: 24, goal: 'Strength' },
    { title: 'Heavy legs', group: 'legs', format: 'sets', rounds: 5, restSec: 120, goal: 'Strength' },
    { title: 'The ladder', group: 'full', format: 'ladder', minutes: 15, goal: 'Strength' },
    { title: 'Shoulders & back', group: 'back', format: 'intervals', rounds: 10, workSec: 40, restSec: 20, goal: 'Conditioning' },
    { title: 'Push day', group: 'chest', format: 'sets', rounds: 4, restSec: 90, goal: 'Strength' },
    { title: 'Core under time', group: 'core', format: 'fortime', rounds: 7, goal: 'Conditioning' },
  ],
};

export const BLOCK_WEEKS = 4;

/** Weeks 1–3 build, week 4 backs off on purpose. */
const VOLUME = [1, 1.1, 1.25, 0.8];

export const WEEK_NOTES = [
  'Find your weight. It should feel like there is a rep or two left in you.',
  'Same work, a little more of it. Keep the form you had last week.',
  'The hard week. This is the one that makes the block worth doing.',
  'Lighter on purpose. Backing off now is what lets you go up next block.',
];

export const weekNote = (week: number) => WEEK_NOTES[Math.min(WEEK_NOTES.length, Math.max(1, week)) - 1];

/** The onboarding level maps onto the exercise levels the workouts use. */
export const levelFor = (l: 'new' | 'some' | 'experienced'): ExerciseLevel =>
  l === 'new' ? 'beginner' : l === 'experienced' ? 'advanced' : 'intermediate';

export const levelName = (l: ExerciseLevel) => (l === 'beginner' ? 'Foundations' : l === 'advanced' ? 'Advanced' : 'Build');

export type DayStatus = 'todo' | 'done' | 'skipped';

export type ProgramDay = {
  /** Position in the whole block, from 0. */
  index: number;
  week: number;
  dayOfWeek: number;
  title: string;
  /** Frozen at creation so the day never changes. */
  workout: Workout;
  status: DayStatus;
  doneAt?: string;
  /** True once the user has replaced the planned workout with another one. */
  swapped?: boolean;
  /** The title this day was planned as, kept when it has been swapped. */
  plannedTitle?: string;
};

export type ProgramBlock = {
  id: string;
  name: string;
  level: ExerciseLevel;
  daysPerWeek: number;
  weeks: number;
  startedAt: string;
  days: ProgramDay[];
};

/** Builds a whole block up front: every day generated, then frozen. */
export function buildBlock(opts: { level: ExerciseLevel; daysPerWeek: number; pair?: boolean }): ProgramBlock {
  const plans = PLANS[opts.level];
  const days: ProgramDay[] = [];

  for (let week = 1; week <= BLOCK_WEEKS; week++) {
    for (let d = 0; d < opts.daysPerWeek; d++) {
      const index = (week - 1) * opts.daysPerWeek + d;
      const plan = plans[index % plans.length];
      const workout = generateWorkout({
        group: plan.group,
        goal: plan.goal,
        format: plan.format,
        minutes: plan.minutes,
        rounds: plan.rounds,
        workSec: plan.workSec,
        restSec: plan.restSec,
        count: plan.count,
        pair: opts.pair,
        volume: VOLUME[week - 1] ?? 1,
        level: opts.level,
        name: plan.title,
        about: `Week ${week} of your block. ${weekNote(week)}`,
        ephemeral: true,
      });
      // Not "generated" any more — a block day is fixed, so it must not offer a shuffle.
      delete workout.generated;
      days.push({ index, week, dayOfWeek: d + 1, title: plan.title, workout, status: 'todo' });
    }
  }

  return {
    id: `block-${Date.now()}`,
    name: `${levelName(opts.level)} · 4 weeks`,
    level: opts.level,
    daysPerWeek: opts.daysPerWeek,
    weeks: BLOCK_WEEKS,
    startedAt: new Date().toISOString(),
    days,
  };
}

export const blockWorkouts = (block: ProgramBlock) => block.days.map((d) => d.workout);

/** The next day waiting to be done, or undefined when the block is finished. */
export const nextDay = (block: ProgramBlock) => block.days.find((d) => d.status === 'todo');

export function blockProgress(block: ProgramBlock) {
  const done = block.days.filter((d) => d.status === 'done').length;
  const settled = block.days.filter((d) => d.status !== 'todo').length;
  return { done, settled, total: block.days.length, percent: block.days.length ? settled / block.days.length : 0 };
}

export const daysOfWeek = (block: ProgramBlock, week: number) => block.days.filter((d) => d.week === week);

/** How many of this week's days are already behind you — the pace target, never a deadline. */
export function weekProgress(block: ProgramBlock, week: number) {
  const list = daysOfWeek(block, week);
  return { done: list.filter((d) => d.status === 'done').length, total: list.length };
}
