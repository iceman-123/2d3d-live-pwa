# 2D3D Live PWA (web demo)

A mobile-first Burmese-language, web-only PWA scaffold inspired by the supplied HTML. All displayed numbers are static demo values. No API, remote results feed, betting, or server-backed chat is included.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, then serve `dist/` over HTTPS (or localhost during development). Service workers require HTTPS on deployed sites. After the first successful load, the app shell is cached for offline opening. The demo content is bundled in the app and is not live data.

## PWA notes

- Manifest: `public/manifest.webmanifest`
- Service worker: `public/sw.js`
- App icon: `public/icons/logo.svg`
- Cached demo state uses browser localStorage; it is not synchronized between devices.
- Use the browser's install option when available. iOS users can use Safari's Share → Add to Home Screen.

This repository does not include Android/Capacitor packaging or a signed AAB. It is a web app/PWA only.
