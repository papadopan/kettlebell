import { Session } from '@/store/sessions';

const DAY = 24 * 60 * 60 * 1000;

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
      return t >= start.getTime() && t < end.getTime();
    });
    list.push({
      start,
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      kg: inWeek.reduce((a, s) => a + s.kg, 0),
      sessions: inWeek.length,
      minutes: Math.round(inWeek.reduce((a, s) => a + s.seconds, 0) / 60),
    });
  }
  return list;
}

export function bests(sessions: Session[]) {
  if (!sessions.length) return undefined;
  const by = <T,>(pick: (s: Session) => number): Session => sessions.reduce((a, b) => (pick(b) > pick(a) ? b : a));
  return {
    heaviestBell: Math.max(...sessions.map((s) => s.bell)),
    biggestSession: by((s) => s.kg),
    longestSession: by((s) => s.seconds),
    mostRounds: by((s) => s.rounds),
    totalKg: sessions.reduce((a, s) => a + s.kg, 0),
    totalMinutes: Math.round(sessions.reduce((a, s) => a + s.seconds, 0) / 60),
  };
}

/** How often each bell was used, heaviest first. */
export function bellUse(sessions: Session[]) {
  const counts = new Map<number, number>();
  for (const s of sessions) if (s.bell) counts.set(s.bell, (counts.get(s.bell) ?? 0) + 1);
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

export const daysAgo = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
