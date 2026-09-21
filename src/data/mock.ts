export type SkillState = 'done' | 'now' | 'locked';

export type Skill = {
  id: string;
  name: string;
  state: SkillState;
  meta: string;
};

export type Branch = {
  id: 'ballistics' | 'getup' | 'grind';
  name: string;
  /** One line explaining what this branch trains, shown above the steps. */
  about: string;
  goal: string;
  skills: Skill[];
};

export const branches: Branch[] = [
  {
    id: 'ballistics',
    name: 'Ballistics',
    about: 'Fast, hip-powered lifts where the bell floats.',
    goal: 'Snatch',
    skills: [
      { id: 'hinge', name: 'Hinge', state: 'done', meta: 'Unlocked' },
      { id: 'deadlift', name: 'Deadlift', state: 'done', meta: 'Unlocked' },
      { id: 'two-hand-swing', name: 'Two-hand swing', state: 'done', meta: 'Unlocked' },
      { id: 'one-hand-swing', name: 'One-hand swing', state: 'done', meta: 'Unlocked 14 Sep' },
      { id: 'clean', name: 'Clean', state: 'now', meta: 'Best 5 × 3 · goal 5 × 5 each side' },
      { id: 'high-pull', name: 'High pull', state: 'locked', meta: 'Needs Clean' },
      { id: 'snatch', name: 'Snatch', state: 'locked', meta: 'Needs High pull' },
    ],
  },
  {
    id: 'getup',
    name: 'Get-up',
    about: 'From lying down to standing with the bell overhead, one step at a time.',
    goal: 'Full Turkish get-up',
    skills: [
      { id: 'roll-to-elbow', name: 'Roll to elbow', state: 'done', meta: 'Unlocked' },
      { id: 'to-hand', name: 'To hand', state: 'done', meta: 'Unlocked' },
      { id: 'high-bridge', name: 'High bridge', state: 'now', meta: 'Best 3 s hold · goal 5 s, 3 times' },
      { id: 'leg-sweep', name: 'Leg sweep', state: 'locked', meta: 'Needs High bridge' },
      { id: 'half-kneel', name: 'Half-kneel', state: 'locked', meta: 'Needs Leg sweep' },
      { id: 'full-get-up', name: 'Full get-up', state: 'locked', meta: 'Needs Half-kneel' },
    ],
  },
  {
    id: 'grind',
    name: 'Grind',
    about: 'Slow, controlled strength: squats and presses.',
    goal: 'Double press',
    skills: [
      { id: 'goblet-squat', name: 'Goblet squat', state: 'done', meta: 'Unlocked' },
      { id: 'rack-hold', name: 'Rack hold', state: 'now', meta: 'Best 20 s · goal 30 s each side' },
      { id: 'press', name: 'Press', state: 'locked', meta: 'Needs Rack hold' },
      { id: 'bottoms-up-press', name: 'Bottoms-up press', state: 'locked', meta: 'Needs Press' },
      { id: 'double-press', name: 'Double press', state: 'locked', meta: 'Needs Bottoms-up press' },
    ],
  },
];

export const allSkills = branches.flatMap((b) => b.skills);
export const unlockedCount = allSkills.filter((s) => s.state === 'done').length;

export function findSkill(id: string) {
  for (const branch of branches) {
    const index = branch.skills.findIndex((s) => s.id === id);
    if (index >= 0) return { branch, skill: branch.skills[index], index };
  }
  return undefined;
}

export type SkillDetail = {
  standard: string;
  best: string;
  progress: number;
  needs: string;
  kg: number;
  cues: string[];
};

export const skillDetails: Record<string, SkillDetail> = {
  clean: {
    standard: '5 × 5 each side',
    best: '5 × 3 each side',
    progress: 0.6,
    needs: 'One-hand swing',
    kg: 16,
    cues: [
      'Hike the bell back, then drive with the hips — don’t curl it.',
      'Keep the bell close, like zipping up a jacket.',
      'Open the hand into the handle so it lands softly in the rack.',
    ],
  },
  'high-bridge': {
    standard: 'Hold 3 × 5 s each side',
    best: '3 × 3 s each side',
    progress: 0.6,
    needs: 'To hand',
    kg: 12,
    cues: [
      'Eyes on the bell the whole time.',
      'Drive through the heel of the bent leg.',
      'Squeeze the glutes to lift the hips high.',
    ],
  },
  'rack-hold': {
    standard: '30 s each side',
    best: '20 s each side',
    progress: 0.66,
    needs: 'Goblet squat',
    kg: 16,
    cues: [
      'Wrist straight, bell resting on the forearm.',
      'Elbow tucked to the ribs.',
      'Breathe behind a braced midsection.',
    ],
  },
};

export type ExerciseLine = { name: string; reps: string; kg: number; note?: string };

export const warmup: ExerciseLine[] = [
  { name: 'Halo', reps: '2 × 5 each way', kg: 12 },
  { name: 'Goblet squat', reps: '2 × 5', kg: 16 },
];

/** EMOM: odd minutes swings, even minutes cleans. repsPerMinute counts both sides. */
export const emom = {
  odd: { name: 'One-hand swing', reps: '5 / side', kg: 20, repsPerMinute: 10 },
  even: { name: 'Clean', reps: '3 / side', kg: 16, repsPerMinute: 6 },
};

export function emomTotals(minutes: number, oddKg = emom.odd.kg, evenKg = emom.even.kg) {
  const odd = Math.ceil(minutes / 2);
  const even = Math.floor(minutes / 2);
  const reps = odd * emom.odd.repsPerMinute + even * emom.even.repsPerMinute;
  const kg = odd * emom.odd.repsPerMinute * oddKg + even * emom.even.repsPerMinute * evenKg;
  return { reps, kg };
}

export const recentSessions = [
  { date: 'Sun 20 Sep', title: 'Ladder · Press', minutes: 18, kg: 1180 },
  { date: 'Fri 18 Sep', title: 'EMOM 20 · Strength', minutes: 24, kg: 2960 },
  { date: 'Wed 16 Sep', title: 'Complex · Conditioning', minutes: 22, kg: 2070 },
];
