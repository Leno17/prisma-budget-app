# Prisma

Prisma is an Android-first personal-budget application designed around a single idea: make each expense visible through a deliberate manual entry, then clearly show how much remains available in the current budget period.

The project is offline-first. It has no login, banking integration, or cloud dependency in its core flow.

## Foundation

Phase 1 establishes the technical base for the product:

- Expo SDK 57, React Native, Expo Router, and strict TypeScript.
- NativeWind design tokens and a minimal application shell.
- SQLite with forward-only migrations, WAL mode, and foreign keys.
- Integer-cent money model; floating-point values are never persisted.
- `app_settings`, `budget_periods`, and `transactions` tables.
- Explicit domain and repository contracts for the feature implementation phases.
- Zustand for transient application state only; SQLite remains the durable source of truth.

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

- The first period begins on initial setup and ends on the next renewal day.
- Renewal days 29-31 use the final day of shorter months.
- Limit changes update the active period immediately.
- Renewal-day changes apply from the next period onward.
- History is organized by budget periods rather than calendar months.
