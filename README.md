# 🎸 Guitar Toolkit — Personal Zero-Budget Guitar Suite for PC

**Guitar Toolkit** is a personal, local-first web and desktop software suite for guitarists, producers, and luthiers. It runs 100% locally on your machine, functions completely offline as a Progressive Web App (PWA), and costs **€0** to build, run, and host.

The project follows a **Website-First** architecture: one unified web hub that houses modular guitar applications added one-by-one following an ascending difficulty ladder (pure logic/data first, then light audio, then real DSP).

---

## 🎸 Live Applications in the Toolkit

Guitar Toolkit currently features **4 fully functional, offline-capable live applications** from Tier 1 of the build ladder:

### 1. #131 Repair Diagnostic Wizard (`/tools/repair-wizard/`)
- Interactive decision-tree troubleshooter for guitar hardware problems.
- 3 full symptom trees: **Fret Buzz & Rattle**, **High Action & Stiff Fretting**, and **Tuning Instability & Slipping**.
- Plain-language measurement guides (credit card, business card, and pick thickness).
- Print-ready diagnosis and fix instruction sheet.

### 2. #83 Pedalboard Cost & Power Planner (`/tools/pedalboard-planner/`)
- Accurately calculates total mA current draw across analog and digital stompboxes.
- Power supply capacity checks against isolated multi-output units (Strymon, Voodoo Lab, Truetone, Cioks).
- **Daisy Chain & Digital Noise Warnings:** Alerts if high-current digital DSP pedals share a daisy chain with analog drives (preventing digital clock whine).
- Patch cable calculator (N pedals = N-1 cables) and complete budget breakdown.
- Exportable Markdown build sheet + local persistence.

### 3. #80 String-Life & Maintenance Tracker (`/tools/string-life-tracker/`)
- Multi-guitar stable management (Electric, Acoustic, Bass, Classical).
- Tracks coated vs uncoated string sets with play hours logging (+30 min, +1 hr, +2 hrs).
- **Tone & Intonation Fatigue Engine:** Alerts when strings pass their sweet spot and enter harmonic loss or fret wire wear danger zones.
- Complete restringing history per instrument.

### 4. #37 + #39 Nashville Number & Capo Intelligence (`/tools/nns-capo-converter/`)
- Two-way chord chart converter: Chords &harr; Nashville Number System (NNS).
- Real-time semitone transposition engine.
- **Capo Intelligence Engine:** Computes optimal capo positions to match a singer's key using comfortable open chord shapes (C, G, D, A, E).
- Interactive SVG Guitar Fretboard visualizer displaying capo clamp and string notes.

---

1. **€0 Budget:** Built exclusively with open-source tools, free hosting tiers, and on-device processing. No paid APIs, cloud GPUs, domains, or app-store fees.
2. **Personal Use:** Your content, your music, your files. Any audio or tabs you own are fair game for personal builds.
3. **Local-First & Offline:** All computation runs on your PC. No accounts, logins, telemetry, or server bills.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (tested on Node.js 22)
- npm 10+

### Development
```bash
# Install dependencies
npm install

# Start local dev server with network binding (0.0.0.0:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

### Run Tests
```bash
# Run Vitest test suite for tool registry and decision tree validation
npm test
```

### Build for Production (Static Output)
```bash
# Generates a pure static site in /build
npm run build

# Preview production build locally (0.0.0.0:4173)
npm run preview
```

---

## 📱 Progressive Web App (PWA) & Offline Usage

- **Offline by Default:** All application code, stylesheets, and the **Inter** font family are bundled locally (`@fontsource/inter`).
- **Service Worker:** Built with SvelteKit's native service worker integration (`src/service-worker.ts`), caching the app shell and assets.
- **Desktop Install:** Click the **"Install App"** button in the header (or the browser address bar icon in Chrome/Edge/Brave) to install Guitar Toolkit as a standalone desktop PC app.

---

## 🛠️ How to Add a New Tool

Guitar Toolkit makes adding new tools modular and straightforward:

1. **Register the tool in `src/lib/tools.json`:**
   ```json
   {
     "id": "my-tool-name",
     "number": 83,
     "name": "Pedalboard Cost & Power Planner",
     "description": "Pick pedals and calculate mA current draw.",
     "status": "live",
     "tier": "Tier 1: Pure Logic",
     "difficulty": "Beginner",
     "category": "Tone & Gear",
     "tags": ["pedals", "power", "mA"],
     "route": "/tools/my-tool-name",
     "timeToMvp": "3–5 days"
   }
   ```
2. **Create the tool's route page:**
   Create `src/routes/tools/my-tool-name/+page.svelte` using the standard design tokens from `src/app.css`.
3. **Run tests & build:**
   `npm test` validates registry and tree integrity.
   `npm run build` outputs the static prerendered page into `build/tools/my-tool-name/index.html`.

---

## 🌐 Free €0 Deployment

### 1. GitHub Pages (Automated via GitHub Actions)
A preconfigured GitHub Actions workflow template is provided at `deploy/deploy.yml`:
1. Copy or move `deploy/deploy.yml` to `.github/workflows/deploy.yml` in your GitHub repository.
2. In your repo settings, go to **Settings &rarr; Pages**.
3. Under **Build and deployment &rarr; Source**, select **GitHub Actions**.
4. Future pushes to `main` will automatically test, build, and deploy to `https://<username>.github.io/<repo>/`.

### 2. Cloudflare Pages
A `wrangler.toml` file is included:
1. Log in to the Cloudflare dashboard and go to **Workers &amp; Pages &rarr; Create application &rarr; Pages**.
2. Connect your Git repository.
3. Set **Build command**: `npm run build`
4. Set **Build output directory**: `build`
5. Click **Save and Deploy**. (Free forever on Cloudflare's free tier).

---

## 📂 Project Structure

```
guitar-app/
├── .github/workflows/deploy.yml # Automated GitHub Pages CI/CD
├── build/                       # Static production output (PWA ready)
├── guitar-ideas/                # Research bank & handoff briefs (preserved)
├── src/
│   ├── app.html                 # HTML shell with PWA manifest & meta tags
│   ├── app.css                  # Dark design system & Inter font tokens
│   ├── service-worker.ts        # Offline asset caching & PWA service worker
│   ├── lib/
│   │   ├── tools.json           # Single source of truth tool registry
│   │   ├── types.ts             # TypeScript definitions
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Header.svelte
│   │   │   ├── ToolCard.svelte
│   │   │   ├── SearchBar.svelte
│   │   │   └── FilterBar.svelte
│   │   └── data/trees/          # Decision tree data files for #131
│   │       ├── fret-buzz.json
│   │       ├── high-action.json
│   │       └── tuning-instability.json
│   └── routes/
│       ├── +layout.svelte       # App layout with nav & footer
│       ├── +layout.ts           # Prerender static SPA config
│       ├── +page.svelte         # Guitar Toolkit Hub (Search & Registry)
│       └── tools/
│           └── repair-wizard/   # #131 Repair Diagnostic Wizard (Live)
│               └── +page.svelte
├── static/                      # Web manifest, favicon & app icons
├── tests/                       # Vitest registry & tree validation tests
├── wrangler.toml                # Cloudflare Pages deployment configuration
├── LICENSES.txt                 # Asset & dependency licensing ledger
└── ideas.html                   # Master 236 zero-budget ideas catalog
```

---

## 📜 Licenses
All components, libraries, and fonts are strictly open-source (MIT, Apache-2.0, OFL-1.1). See [`LICENSES.txt`](./LICENSES.txt) for the complete ledger.
