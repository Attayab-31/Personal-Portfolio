# Attayab Ashraf — 3D Engineering Portfolio

A responsive, story-led portfolio for Muhammad Attayab Ashraf, built with **Three.js, GSAP ScrollTrigger, Lenis, and Vite**.

## Experience features

- Procedural Three.js WebGL 2 scene (no stock 3D model or video background).
- Interactive pointer response and scroll-linked scene color/scale stages.
- GSAP reveal choreography and a pinned horizontal work gallery on desktop.
- Lenis smooth wheel scrolling with native anchors and reduced-motion support.
- Responsive mobile navigation and vertical project cards on smaller screens.
- Reduced device pixel ratio, tab-visibility pause, no external 3D assets, and a CSS visual fallback if WebGL is unavailable.

## Requirements

- Node.js **20.19+** (or a compatible newer LTS release)
- npm
- A modern browser with WebGL 2 for the full 3D scene

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The deployable static site is generated in `dist/`.

## Deploy

### Vercel

1. Push this folder to a new GitHub repository (for example `attayab-portfolio`).
2. Import that repository into Vercel.
3. Use build command `npm run build` and output directory `dist`.
4. Deploy and add your custom domain if you have one.

### Netlify

1. Connect the GitHub repository.
2. Build command: `npm run build`.
3. Publish directory: `dist`.

### GitHub Pages

Use a static hosting workflow that publishes `dist/` after `npm ci && npm run build`. Configure Vite's `base` setting for the repository path if deploying to `username.github.io/repository/`; for a custom domain or `username.github.io` root, `/` is appropriate.

## Personalization checklist

Before publishing, verify:

- Your current role and employer wording.
- Project names and each repository URL.
- The CV-reported impact figures and whether client permission allows public disclosure.
- LinkedIn and email links.
- Whether the current public project implementations support every technology named in each card.

The reported `~80%` and `~90%` outcomes and `1,000+` retrieval chunks are attributed to the supplied CV, not independently audited benchmarks. Keep the disclosure unless you can publish verified methodology and client-approved context.

## Performance and accessibility notes

The scene uses procedural geometry, one particle draw call, capped device pixel ratio, and pauses while the document is hidden. It honors `prefers-reduced-motion`; Lenis also documents reduced-motion handling. Test on a mid-range Android device and a low-power laptop before launch. If you see frame drops, lower the particle count and pixel-ratio cap in `src/world.js`.

## Stack references

- [Three.js](https://threejs.org/docs/)
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Lenis](https://github.com/darkroomengineering/lenis)
- [Vite](https://vite.dev/)
