# FARES POMODORO

A full-screen, glassmorphic Pomodoro timer built with **React (Vite + JavaScript)** and **CSS Modules only**.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## What's inside (by phase)

| Phase | Feature | Files |
| --- | --- | --- |
| 1 | Full-viewport layout, vignette over wallpaper, header with EN / FR / AR switcher (RTL for Arabic), left floating sidebar (stats, streak, aesthetics, settings) | `Header`, `Sidebar`, `App.module.css` |
| 2 | Aesthetics drawer: Ring / Numbers-only, 4 wallpapers + your own photo upload, 6 live accent colors, ambient effects (None, Cyber Rain, Floating Embers, Soft Glow) | `AestheticsDrawer`, `AmbientEffect` |
| 3 | Mode tabs with session counter, ring or numbers timer, active-task pill, quote, floating dock, Picture-in-Picture mini-timer | `Timer`, `BottomDock`, `PipTimer` |
| 4 | Task drawer (progress, search, add, select, complete, closed list, delete all), Spotify URL player, full EN / FR / AR translations | `TaskDrawer`, `MusicModal`, `data/translations.js` |

Extras: `SettingsModal` (custom Focus / Short / Long durations + auto-start toggles), Web Audio bell chime (`utils/chime.js`), daily streak and focus stats.

## Everything persisted in `localStorage`

Tasks and the selected task, timer settings, Spotify URL, timer style, wallpaper, uploaded photo (downscaled to max 1920px), accent color, ambient effect, streak, focus stats, and language. Keys are prefixed with `fares-pomodoro:`.

## Notes

- **Styling rules:** all styles are `*.module.css` plus `src/styles/variables.css`. The only inline style is the root container's `--accent-color` and `--bg-image`. A few dynamic values are applied as CSS custom properties or SVG attributes: the PiP fallback drag offset (`--drag-x/--drag-y`), the ring's `stroke-dashoffset`, and the task progress bar (a native `<progress>` element).
- **Wallpapers** are CSS gradients defined in `variables.css` (`--wallpaper-*`), so the app works offline with no image assets. To use real photos, change a variable to `url('/wallpapers/name.jpg')` and put the file in `public/`.
- **Picture-in-Picture** uses the Document PiP API (Chrome / Edge 116+), which floats above other apps. Other browsers automatically get a draggable in-app mini-player.
- **Spotify:** paste any track, playlist, album, artist, show or episode link. The player stays mounted when the panel is closed, so music keeps playing. A Spotify "Lofi Beats" playlist is pre-loaded (change `DEFAULT_SPOTIFY_URL` in `src/data/config.js`).
- **Streak** counts consecutive days with at least one completed focus session.
- **Audio:** browsers block sound until a user gesture, so the audio context is unlocked when you press Start.
