# ASWEB — scroll-to-fly portfolio

A 3D "scroll to fly" portfolio experience: one camera, one Catmull-Rom flight
path, nine wireframe worlds. Design study inspired by the interaction patterns
of dungyov.com, rebuilt from scratch with original code and placeholder content.

## Stack

- React 19 + Vite 7
- three.js + @react-three/fiber (procedural geometry only — no model files)
- troika-three-text for in-scene typography
- Fonts: Unbounded (display) + Space Grotesk (body), self-hosted via Fontsource

## How it works

- A hidden full-screen scroller (22 viewport-heights) is driven by wheel /
  touch / keyboard; its progress is damped every frame and moves the camera
  along a `CatmullRomCurve3` through 9 stations.
- Each station parks a wireframe world (torus knot, rings, stat grid, clickable
  frames…) rotated to face the camera's approach tangent.
- HUD: progress hairline, section menu with jump-to-section, scroll hint,
  film-grain + vignette overlays, loader with percentage.
- Talks / case studies open HTML modals from 3D clicks (Escape / arrows work).

## Run

```bash
npm install
npm run dev
```

## Docker

```bash
docker build -t asweb .
docker run -p 8080:80 asweb
```
