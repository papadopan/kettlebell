# Kettlebelt

Kettlebell routine generator built around the bells you own and a skill tree ("Bell Path").

Expo SDK 57 · Expo Router · TypeScript. All data is mock data for now (no backend).

## Run

```bash
npm install
npx expo start
```

Open in Expo Go (scan the QR code), or press `i` / `a` for a simulator, or `w` for web.

## Testing onboarding again

The app remembers you after onboarding. In development, the Log tab has a “Reset onboarding (dev only)” button.

## Structure

```
src/
  app/                  routes (Expo Router)
    _layout.tsx         fonts, splash, root stack
    index.tsx           redirects to onboarding or tabs
    onboarding/         welcome → pick your bells → where do you start
    (tabs)/index.tsx    2 · Today
    (tabs)/path.tsx     3 · Bell Path
    skill/[id].tsx      4 · Skill detail
    generator.tsx       5 · New routine
    routine.tsx         6 · Generated routine
    workout.tsx         7 · Gym-floor mode (working EMOM timer)
    summary.tsx         8 · Session summary
    (tabs)/library.tsx  placeholder list
    (tabs)/log.tsx      placeholder history
  components/           Bell, Icon, shared UI (Button, Chip, Card, Screen…)
  data/mock.ts          Bell Path branches, skill details, EMOM routine, totals
  store/bells.tsx       owned bells, level, days/week, onboarding flag (saved with AsyncStorage)
  theme.ts              colours (competition-bell palette), fonts
```

## Next steps

- Persist sessions so the Log tab fills up
- Real routine generator using the owned bells and Bell Path state
- Exercise library from free-exercise-db (photos + instructions)
- Save sessions to the Log tab
# kettlebell
