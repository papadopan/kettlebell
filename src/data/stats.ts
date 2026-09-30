import { findExercise, Pattern, PATTERNS } from '@/data/exercises';
import { kgFor } from '@/data/workouts';
import { Session } from '@/store/sessions';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Sessions are read back from storage, so a field can be missing or a string if it
 * was written by an older build. One bad value used to turn a whole week's total
 * into NaN — and NaN is falsy, so the chart silently drew nothing.
 */
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Monday 00:00 of the week a date falls in. */
export function weekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const shift = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - shift);
  return d;
}

export type Week = { start: Date; label: string; kg: number; sessions: number; minutes: number };

/** The last `count` weeks, oldest first, with this user's totals in each. */
export function weeks(sessions: Session[], count = 8): Week[] {
  const thisWeek = weekStart(new Date());
  const list: Week[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(thisWeek.getTime() - i * 7 * DAY);
    const end = new Date(start.getTime() + 7 * DAY);
    const inWeek = sessions.filter((s) => {
      const t = new Date(s.date).getTime();
      return Number.isFinite(t) && t >= start.getTime() && t < end.getTime();
    });
    list.push({
      start,
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      kg: inWeek.reduce((a, s) => a + num(s.kg), 0),
      sessions: inWeek.length,
      minutes: Math.round(inWeek.reduce((a, s) => a + num(s.seconds), 0) / 60),
    });
  }
  return list;
}

export function bests(sessions: Session[]) {
  if (!sessions.length) return undefined;
  const by = (pick: (s: Session) => number): Session => sessions.reduce((a, b) => (pick(b) > pick(a) ? b : a));
  return {
    heaviestBell: Math.max(...sessions.map((s) => num(s.bell))),
    biggestSession: by((s) => num(s.kg)),
    longestSession: by((s) => num(s.seconds)),
    mostRounds: by((s) => num(s.rounds)),
    totalKg: sessions.reduce((a, s) => a + num(s.kg), 0),
    totalMinutes: Math.round(sessions.reduce((a, s) => a + num(s.seconds), 0) / 60),
  };
}

/** How often each bell was used, heaviest first. */
export function bellUse(sessions: Session[]) {
  const counts = new Map<number, number>();
  for (const s of sessions) {
    const kg = num(s.bell);
    if (kg) counts.set(kg, (counts.get(kg) ?? 0) + 1);
  }
  return [...counts.entries()].map(([kg, count]) => ({ kg, count })).sort((a, b) => b.kg - a.kg);
}

/** Consecutive weeks with at least one session, counting back from this week. */
export function weekStreak(sessions: Session[]): number {
  const list = weeks(sessions, 26);
  let streak = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].sessions > 0) streak += 1;
    else if (i !== list.length - 1) break; // an empty current week doesn't end the streak yet
  }
  return streak;
}

export const daysAgo = (iso: string) => {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / DAY));
};

export type SessionDay = { key: string; date: Date; sessions: Session[]; kg: number; minutes: number };

/** Every session grouped by the day it was done, newest day first. */
export function sessionDays(sessions: Session[]): SessionDay[] {
  const map = new Map<string, Session[]>();
  for (const s of sessions) {
    const d = new Date(s.date);
    if (!Number.isFinite(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    map.set(key, [...(map.get(key) ?? []), s]);
  }
  return [...map.entries()]
    .map(([key, list]) => ({
      key,
      date: new Date(list[0].date),
      sessions: [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      kg: list.reduce((a, s) => a + num(s.kg), 0),
      minutes: Math.round(list.reduce((a, s) => a + num(s.seconds), 0) / 60),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** "Today", "Yesterday", or a written date. */
export function dayLabel(date: Date): string {
  const days = daysAgo(date.toISOString());
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export const sessionTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

// ---- Movement-pattern volume ----

export type PatternRow = {
  pattern: Pattern;
  label: string;
  /** Kilograms moved in each week, oldest first. */
  cells: number[];
  total: number;
};

export type PatternVolume = {
  rows: PatternRow[];
  /** The biggest single cell, which the colour scale is stretched against. */
  max: number;
  /** How many sessions had to be estimated rather than measured. */
  estimated: number;
};

/**
 * Kilograms per movement pattern per week — the "what am I neglecting" view.
 *
 * Sessions logged since we started recording per-exercise credits are exact. Older
 * ones only know their total, so their weight is split across the exercises the
 * workout contained, in proportion to what each would have contributed. That is an
 * estimate, and the count is reported so the screen can say so.
 */
export function patternVolume(sessions: Session[], count = 8): PatternVolume {
  const buckets = weeks(sessions, count).map((w) => w.start.getTime());
  const end = buckets[buckets.length - 1] + 7 * DAY;
  const totals = new Map<Pattern, number[]>();
  const blank = () => Array.from({ length: count }, () => 0);
  let estimated = 0;

  const weekIndex = (iso: string) => {
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t) || t < buckets[0] || t >= end) return -1;
    for (let i = buckets.length - 1; i >= 0; i--) if (t >= buckets[i]) return i;
    return -1;
  };

  const add = (pattern: Pattern | undefined, week: number, kg: number) => {
    if (!pattern || week < 0 || !Number.isFinite(kg) || kg <= 0) return;
    const row = totals.get(pattern) ?? blank();
    row[week] += kg;
    totals.set(pattern, row);
  };

  for (const s of sessions) {
    const week = weekIndex(s.date);
    if (week < 0) continue;

    if (s.byExercise) {
      for (const [exerciseId, v] of Object.entries(s.byExercise)) {
        add(findExercise(exerciseId)?.pattern, week, num(v?.kg));
      }
      continue;
    }

    // No breakdown recorded: split the session total across what the workout held.
    const items = s.workout?.items ?? [];
    const shares = items.map((i) => kgFor(i, num(s.bell) || 1));
    const sum = shares.reduce((a, b) => a + b, 0);
    if (!items.length || sum <= 0) continue;
    estimated += 1;
    items.forEach((item, i) => {
      add(findExercise(item.exerciseId)?.pattern, week, (num(s.kg) * shares[i]) / sum);
    });
  }

  const rows: PatternRow[] = PATTERNS.map((p) => {
    const cells = totals.get(p.id) ?? blank();
    return { pattern: p.id, label: p.label, cells, total: cells.reduce((a, b) => a + b, 0) };
  });

  return { rows, max: Math.max(...rows.flatMap((r) => r.cells), 0), estimated };
}
