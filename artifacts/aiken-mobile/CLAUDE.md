# AIken mobile (Expo + React Native)

- Stack: Expo Router, React Native, TypeScript. No web/HTML, no Tailwind.
- Design source: Figma file "Aiken - UI/UX" (page "AIken Mobile").
- Colors: `constants/colors.ts` (light + dark). Always read colors with `useColors()`.
- Font: Plus Jakarta Sans, use the `T` text component with `w={400..800}`.
- Shared UI lives in `components/aiken/kit.tsx` (Screen, Header, Card, Glass, Button, Field, Chip, Segmented, Row, Dialog, Sheet, OfflineBanner, Orb). Reuse it before making new components.
- Demo data: `data/aiken.ts`. App state: `context/AppState.tsx` (replace with API calls later).
- Set `EXPO_PUBLIC_SKIP_AUTH=1` to open straight on Home while developing.
- Old Handbook/Assistant tab screens were moved to `legacy/` for reference.
