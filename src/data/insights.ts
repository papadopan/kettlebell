import { Session } from '@/store/sessions';

const DAY = 24 * 60 * 60 * 1000;
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * One thing the app knows that the user does not.
 *
 * The bar is deliberately high: an insight appears only when it is specific, true,
 * and worth acting on right now. When there is nothing to say, nothing is shown —
 * there is no filler state, because a card that is always there stops being read.
 */
export type Insight = {
  id: string;
  title: string;
  /** Why we are saying it, in the user's own numbers. */
  body: string;
  /** The bell to start the next workout with, when the insight is about weight. */
  bell?: number;
};

/** How many sessions at the same bell must feel easy before we suggest going up. */
const RUN = 3;
/** Ignore anything older than this, so an old easy streak cannot resurface. */
const WINDOW = 30 * DAY;

/**
 * Ready for a heavier bell.
 *
 * The app's whole premise is progressing through the bells you already own, and the
 * summary has been collecting the evidence — weight used, and how it felt — since
 * the first session. This is what turns that into a prompt.
 */
export function bellReadyInsight(sessions: Session[], ownedWeights: number[]): Insight | undefined {
  const cutoff = Date.now() - WINDOW;
  const recent = sessions.filter((s) => {
    const t = new Date(s.date).getTime();
    return num(s.bell) > 0 && Number.isFinite(t) && t >= cutoff;
  });
  if (!recent.length) return undefined;

  // The bell they are working with now.
  const bell = num(recent[0].bell);
  const atThisBell = recent.filter((s) => num(s.bell) === bell).slice(0, RUN);
  if (atThisBell.length < RUN) return undefined;
  if (!atThisBell.every((s) => s.feel === 'Easy')) return undefined;

  const heavier = ownedWeights.filter((kg) => kg > bell).sort((a, b) => a - b)[0];
  if (!heavier) return undefined;

  return {
    id: `bell-${bell}-${heavier}`,
    title: `Ready for ${heavier} kg`,
    body: `Your last ${RUN} sessions with the ${bell} kg bell all felt easy.`,
    bell: heavier,
  };
}

/** The single most useful thing we can say right now, or nothing. */
export function nextInsight(sessions: Session[], ownedWeights: number[]): Insight | undefined {
  return bellReadyInsight(sessions, ownedWeights);
}
