# E-BPCO User App

The mobile application for the **Electronic Business Permit and Clearance
Office (E-BPCO)** — a Flutter app for business owners and permit applicants
to apply for, submit requirements for, and track business permits and
clearances from their phone.

> **Frontend-only prototype.** This build has no backend, API, database, or
> real authentication. All data is mock data held in local frontend state
> and `SharedPreferences`. Do not use the credential-storage approach in
> this repo for a production app — see [Known Prototype Limitations](#known-prototype-limitations).

## Day 1 Scope — Features Completed

- **App foundation** — feature-based `lib/` structure, centralized theme,
  colors, and strings.
- **Splash screen** — restores mock session state and routes accordingly.
- **Onboarding** — 3-page walkthrough with skip/next/get started, persisted
  via `SharedPreferences`.
- **Authentication (mock)**
  - Login with validation, show/hide password, remember me, loading and
    error states.
  - Registration — 3-step form (Personal Information, Contact Information,
    Account Security) with progress header and data preserved across steps.
  - Forgot password — simulated reset flow with success dialog.
  - Registration success screen.
- **Main app shell** — bottom navigation (Home, Applications, Payments,
  Notifications, Profile) with preserved tab state via
  `StatefulShellRoute.indexedStack`.
- **Dashboard** — greeting header, "Apply for Permit" action, active
  application card with progress and detail sheet, summary counters, quick
  actions, and recent notifications.
- **Applications & Payments placeholders** — polished, clearly-labeled
  placeholders for the Day 2 workflow.
- **Notifications** — full list with read/unread state and mark-all-as-read.
- **Profile** — user info display and logout with confirmation.
- **Reusable widgets** — buttons, text fields, status chips, loading/empty
  states, confirmation dialogs.
- **Routing** — `go_router` with redirect logic for session/onboarding
  state and a graceful "page not found" screen.

## Mock Login Credentials

```
Email:    user@ebpco.com
Password: password123
```

You can also register a new account from the app — it is saved locally and
can be used to log in immediately.

## Requirements

- Flutter 3.44.6 (stable channel) or compatible
- Dart 3.12.2 (bundled with the above Flutter SDK)

## Installation

```bash
flutter pub get
```

## Running the App

```bash
flutter run
```

Select your target device/emulator when prompted, or pass `-d <device_id>`.

## Android Testing

1. Start an Android emulator (Android Studio > Device Manager) or connect a
   physical device with USB debugging enabled.
2. Run:
   ```bash
   flutter run -d android
   ```
3. To build a debug/release APK:
   ```bash
   flutter build apk --debug
   flutter build apk --release
   ```

## iOS Testing

1. On macOS, open `ios/Runner.xcworkspace` in Xcode at least once to let it
   resolve signing, or run directly via Flutter.
2. Start an iOS Simulator or connect a physical device.
3. Run:
   ```bash
   flutter run -d ios
   ```

## Project Structure

```
lib/
  main.dart                  Entry point
  app/                       App shell, theme, router
  core/
    constants/                Colors, strings, layout constants
    models/                   Shared data models
    providers/                Auth, dashboard, navigation, notifications
    services/                 LocalStorageService (SharedPreferences)
    utils/                    Form validators
    widgets/                  Reusable UI components
  features/
    splash/                   Splash screen
    onboarding/                3-page onboarding flow
    authentication/            Login, register, forgot password, success
    shell/                     Bottom-nav main shell
    dashboard/                 Home dashboard
    applications/              Applications placeholder
    payments/                  Payments placeholder
    notifications/             Notifications list
    profile/                   Profile & logout
test/                        Unit and widget tests
```

## Known Prototype Limitations

- No real backend, API, or database — all data is mock/local.
- Credentials are stored in plain text via `SharedPreferences` purely to
  simulate login for this prototype; this must **never** be used in a
  production app.
- No real push notifications, payment processing, or document uploads.
- Only one mock active application and one registered account are tracked
  at a time (the most recently registered user overwrites the previous one
  in local storage).
- Applications and Payments modules are placeholders pending Day 2.

## Day 2 Recommended Scope

- Full permit application workflow: new/renewal/amendment forms, document
  upload, and submission.
- Real application list with filtering/search and multiple mock (or real)
  applications.
- Payment assessment breakdown and (mock or real) payment method selection.
- Push notification wiring.
- Backend/API integration replacing local mock data and mock auth.
- Persisted, richer user profile editing.
