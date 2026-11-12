# 2D3D Live PWA + Android wrapper

Mobile-first Burmese-language demo app based on the provided HTML. All displayed result numbers are sample values bundled in the app. No API, remote results feed, betting, or server-backed chat is included.

## Run the web app

```sh
npm install
npm run dev
```

Production web build: `npm run build`. Serve `dist/` over HTTPS (or localhost during development) to use the PWA service worker. After the first successful load, the app shell is cached for offline opening. Demo content is bundled in the app and is not live data.

## Android build

Requirements: Node.js 20, Android Studio with Android SDK, and JDK 17.

```sh
npm install
npm run android:add       # one time: creates the native android/ project
npm run android:sync      # builds web files and syncs them into Android
npm run android:open      # opens Android Studio
```

In Android Studio, choose **Build → Build Bundle(s) / APK(s) → Build APK(s)** for a test APK, or **Build → Generate Signed Bundle / APK → Android App Bundle** to create a Play Store-ready signed AAB. Configure your own release signing key securely. Never commit keystores or passwords.

The GitHub Actions workflow `.github/workflows/android.yml` builds a debug APK and an **unsigned release AAB**. Download them from the workflow run's Artifacts. The unsigned AAB is not ready for Play Store upload; sign it with your private upload key using Android Studio or securely configured CI secrets.

## PWA notes

- Manifest: `public/manifest.webmanifest`
- Service worker: `public/sw.js`
- App icon: `public/icons/logo.svg`
- Cached demo state uses browser localStorage and is not synchronized between devices.
- The Android wrapper packages the web app locally; it does not add a results API or make sample data live.

This repository is a web PWA plus Capacitor Android build configuration. It does not contain real/official results data.
