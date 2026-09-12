# Android release validation

## Scope

The current release candidate was validated as an EAS `preview` APK. This is
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

The temporary expense created for the validation was deleted before the final
check. The emulator retained only the test budget and no expenses.

## Boundaries and remaining checks

This validation demonstrates the native, offline persistence path of the
current preview APK. It does not substitute for:

- a Google Play review or store-distribution validation;
- testing across physical Android devices and OS versions;
- a complete assistive-technology review, including TalkBack and large-text
  checks on the final release artifact.

Run `pnpm verify` before a new build. After dependency or Expo configuration
changes, also run `npx expo-doctor`. For a fresh native candidate, create a new
preview APK with `npx eas-cli@latest build --platform android --profile preview`
and repeat the scenarios above.
