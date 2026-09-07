# Prisma

Prisma is an Android-first personal-budget application designed around a single idea: make each expense visible through a deliberate manual entry, then clearly show how much remains available in the current budget period.

The project is offline-first. It has no login, banking integration, or cloud dependency in its core flow.

## Architecture

Prisma is built with:

- Expo SDK 57, React Native, Expo Router, and strict TypeScript.
- NativeWind design tokens and a minimal application shell.
- SQLite with forward-only migrations, WAL mode, and foreign keys.
- Integer-cent money model; floating-point values are never persisted.
- `app_settings`, `budget_periods`, and `transactions` tables.
- Explicit domain and repository contracts for the feature implementation phases.
- Zustand for transient application state only; SQLite remains the durable source of truth.

## Current functionality

- Initial budget setup with a period limit and a renewal day.
- Budget periods that handle short months and renewal-day changes correctly.
- Manual expense creation, editing, and confirmed deletion.
- Dashboard remaining-budget indicator, recent expenses, and accessible status feedback.
- Budget settings: limit changes apply immediately; renewal-day changes apply in the next period.
- Expense history grouped by budget period.
- Confirmed local-data deletion that removes the budget, expenses, and history, then returns to initial setup.
- Android-first accessibility support: readable text, 48dp-or-larger controls, screen-reader headings and announcements, keyboard-aware forms, and large-text-friendly layouts.

## Local development

Install dependencies with pnpm:

```bash
pnpm install
```

Start the Android development flow:

```bash
pnpm android
```

Other useful commands:

```bash
pnpm start
pnpm typecheck
pnpm lint
pnpm test
```

## Verification

Run the automated baseline after dependency or schema changes:

```bash
pnpm typecheck
pnpm lint
pnpm test
npx expo-doctor
```

Before an Android release candidate, verify these interactions on an emulator or device:

- Create, edit, and delete an expense; confirm dashboard totals and history update.
- Change the budget limit and renewal day; confirm their different effective dates are explained correctly.
- Cancel the local-data reset once, then confirm it; verify setup opens and Android Back cannot return to the deleted budget.
- Open every route using Android Back and from the dashboard controls.
- Use the numeric keyboard in setup, settings, and expense forms.
- With the app already open, temporarily disable the emulator's network; navigate between Dashboard and Settings and confirm the existing budget and expenses remain available. Re-enable networking afterwards.
- With networking available, force-stop and reopen the app; confirm the same budget, totals, and recent expenses are still present.
- Test Android font scaling at 100% and 200%, portrait and landscape, and TalkBack reading order, labels, selected states, progress, errors, and success announcements.

The included migration tests validate that pending SQLite schema migrations apply once and roll back on failure. Native SQLite behavior must still be checked on Android because Jest does not run Expo's native SQLite module.

## Project structure

```text
src/app/             Expo Router route shells
src/data/database/   SQLite client and schema migrations
src/domain/          Business entities, money, periods, repository contracts
src/providers/       Application bootstrap
src/shared/          Design tokens and shared UI primitives
src/state/           Transient Zustand stores
```

## Period behavior

- The first period begins on initial setup and ends at the next renewal boundary. `ends_on` is exclusive in SQLite; the interface displays the preceding day as the final included date.
- Renewal days 29-31 use the final day of shorter months.
- Limit changes update the active period immediately.
- Renewal-day changes are stored as pending and apply only when the next period begins; the current period never changes.
- The first period after a renewal-day change bridges from the old boundary to the new schedule, then later periods follow the new day.
- History is organized by budget periods rather than calendar months.

## Platform scope and data handling

- Prisma is Android-first. Web is not a supported release target in this phase because Expo SQLite on web requires additional WebAssembly Metro and hosting-header configuration.
- All financial amounts are persisted as integer centavos. No floating-point monetary values are stored.
- Native Android builds disable Android automatic backup and restore (`allowBackup=false`). Prisma data therefore is not included in Android's automatic cloud-backup path.
- This choice improves privacy, but the user cannot recover Prisma data through Android backup after losing or replacing a device, or after uninstalling the app. A manual export/import capability is not yet available.
- The app has no login, synchronization, banking integration, analytics, crash-reporting SDK, or network-based transfer of financial data.
- The settings screen provides a destructive, explicitly confirmed reset that atomically clears all user-created records from the local database.
- Data is local, but it is not encrypted at rest. SQLCipher is intentionally deferred to a future native-build hardening phase because it is incompatible with Expo Go.
- Expo Go has its own application sandbox; this Android manifest setting takes effect in Prisma's generated native builds, not in Expo Go itself.
- After its JavaScript bundle has loaded, Prisma's budgeting and SQLite flows do not require a network connection. Expo Go remains a development client: a cold launch can require Metro to serve the development bundle. Validate a true cold-offline launch from a native preview build before release; do not treat an Expo Go cold launch as that release check.
