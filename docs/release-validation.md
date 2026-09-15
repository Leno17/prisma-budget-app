# Android release validation

## Scope

The Phase 5 release candidate was validated as an EAS `preview` APK. This is
an internal-distribution artifact for installation on an Android emulator or
device; it is not a Google Play release and it was not submitted to a store.

| Item | Validated value |
| --- | --- |
| Validation date | 2026-09-10 |
| EAS build ID | `fca42bf8-2a06-46c5-aee0-9c257a94cb59` |
| Android application ID | `com.gabrielweissheimer.prisma` |
| App version | `0.1.0` (version code `1`) |
| Android SDK range | min `24`, target `36` |
| APK SHA-256 | `429F03BCC16D7B8ED1A534BD17AC886B960FE2A349B56B87E241432952630272` |

The APK was signed with the EAS-managed Android signing credential. Private
credentials and the APK itself are intentionally not stored in this repository.

## Native validation completed

| Scenario | Result |
| --- | --- |
| Clean installation and native cold launch | Passed |
| Budget setup with a R$ 3.000,00 limit and renewal day 10 | Passed |
| Expense creation, edit, and confirmed deletion | Passed |
| Dashboard and period-history totals after each change | Passed |
| Force-stop and cold relaunch persistence | Passed |
| Cold relaunch with airplane mode enabled | Passed |
| Android Back navigation and Settings access | Passed |
| Release logs for fatal exceptions, ANRs, SQLite, and React Native errors | No application errors observed |
| Android automatic backup policy | Passed: generated manifest has `allowBackup=false` |

## Accessibility follow-up

On 2026-09-13, the same preview APK received a targeted Android accessibility
check. This supplements the functional validation above; it is not a formal
WCAG conformance audit.

| Scenario | Result |
| --- | --- |
| 200% system font in portrait on setup, dashboard, history, expense, and settings screens | Passed: content remained readable, controls remained available, and longer screens could scroll |
| 200% system font in landscape on dashboard and settings screens | Passed: no horizontal clipping or overlapping controls observed |
| TalkBack names, roles, hints, and selected states | Passed for primary navigation, budget controls, expense fields, amounts, and budget status |
| Heading focus after navigation | Passed on setup, dashboard, history, expense, and settings routes |
| Non-color budget status communication | Passed: status text and symbols remain available alongside color |

TalkBack may restore its previously focused element when the app process is
reopened. Forcing the dashboard heading to take focus on every cold launch was
therefore not treated as a requirement; explicit navigation between Prisma
screens was used to validate route-heading focus.

The temporary expense created for the validation was deleted before the final
check. The emulator retained only the test budget and no expenses.

## Final source alignment

On 2026-09-14, the portfolio source was aligned with Expo's expected SDK 57
patch releases. The aligned source passed `pnpm verify` (22 suites and 65 tests)
and all 21 `expo-doctor` checks. No replacement APK was generated because the
portfolio release does not distribute the APK.

The native evidence above therefore applies specifically to the identified
Phase 5 APK and its recorded SHA-256. Build and validate a fresh APK before
attaching an Android binary to any future GitHub Release.

## Boundaries and remaining checks

This validation demonstrates the native, offline persistence path of the
identified Phase 5 preview APK. It does not substitute for:

- a Google Play review or store-distribution validation;
- testing across physical Android devices and OS versions;
- human confirmation of TalkBack spoken output and gesture traversal on a
  physical Android device.

Run `pnpm verify` before a new build. After dependency or Expo configuration
changes, also run `npx expo-doctor`. For a fresh native candidate, create a new
preview APK with `npx eas-cli@latest build --platform android --profile preview`
and repeat the scenarios above.
