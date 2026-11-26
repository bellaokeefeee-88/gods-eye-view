# GOD EYE VIEW — Panorama Tools Integration

## Unified launcher

Open `/panorama-tools/` from the GOD EYE VIEW application. The Cesium globe action bar now opens this page through the single 360° shortcut.

## Available destinations

| Tool | Source repository | Integration state |
|---|---|---|
| GOD EYE VIEW Virtual Tour | `public/virtual-tour/` | Existing internal MVP; uses browser IndexedDB and Cesium building marker |
| In360TourBuilder | https://github.com/inqiu/in360TourBuilder | External source shortcut only; source structure, license, dependencies and security need review |
| Panorama Site Builder | https://github.com/Berengow/panorama-site-builder | External source shortcut only; README describes Pannellum-based HTML/CSS/JS builder, hotspot editor, theme options and ZIP export |
| PanoLoop | https://github.com/arminmstfv/PanoLoop | External source shortcut only; README describes panorama walkthroughs, floor-plan navigation, hotspots and synchronized before/after comparison |

## What this change does

- Adds a single Panorama Studio launcher page at `public/panorama-tools/index.html`.
- Changes the existing globe toolbar shortcut to open the launcher.
- Provides direct repository and ZIP links for the three requested upstream projects.
- Keeps the existing internal Virtual Tour module as the first destination.

## Important boundary

The three upstream projects have **not** been copied into this repository or bundled as runnable applications. This is a safe first-stage integration through one access point. A true code merge requires inspection of each source tree, license, dependencies, security posture, data handling and compatibility with the GOD EYE VIEW Vite/Vue/Cesium architecture. In particular, the In360TourBuilder repository did not expose a README through the connected GitHub file reader during this pass, so its implementation and license remain unverified.

The upstream projects' local browser storage/export behavior is independent of GOD EYE VIEW's IndexedDB. No cross-app data synchronization is implemented by this launcher.

## Verification

GitHub confirms the launcher and toolbar changes are committed on `feature/virtual-tour-360`. A production build and browser test have not been run in this environment.
