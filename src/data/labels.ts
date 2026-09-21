import { ExerciseLevel, Pattern, PATTERNS } from './exercises';

export const patternLabel = (p: Pattern) => PATTERNS.find((x) => x.id === p)?.label ?? p;
export const levelLabel = (l: ExerciseLevel) => l[0].toUpperCase() + l.slice(1);
