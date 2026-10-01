# 🎸 Guitar Toolkit — Personal Zero-Budget Guitar Suite for PC

**Guitar Toolkit** is a personal, local-first web and desktop software suite for guitarists, producers, and luthiers. It runs 100% locally on your machine, functions completely offline as a Progressive Web App (PWA), and costs **€0** to build, run, and host.

The project follows a **Website-First** architecture: one unified web hub that houses modular guitar applications added one-by-one following an ascending difficulty ladder (pure logic/data first, then light audio, then real DSP).

---

## 🎸 Live Applications in the Toolkit

Guitar Toolkit features **26 applications live, tested, and fully functional offline** across utilities, maintenance, practice, audio DSP, and modeling:

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

### 5. #132 Serial Number Decoder & Counterfeit Checker (`/tools/serial-decoder/`)
- Brand-specific algorithmic decoders for **Gibson**, **Fender** (USA, Mexico, Japan JV, AVRI), **Martin**, and **Ibanez**.
- Checks against a curated registry of infamous counterfeit serials (e.g. Chibson 017160628).
- Highlights critical physical authenticity flags (bridge post diameter, truss rod nut cavity, wood vs plastic plugs).

### 6. #44 Chord Chart Cleaner & Lead Sheet Formatter (`/tools/chord-chart-cleaner/`)
- Parser converting messy forum tabs and ChordPro notation into clean, aligned lead sheets.
- Eliminates trailing whitespace, cleans chords over lyrics, and aligns chord tokens.
- Instant transposition (+1, -1, +N semitones) and one-click ChordPro / Clean Text export.

### 7. #75 Gear Flips & Trading Accounting Tracker (`/tools/gear-flips-tracker/`)
- Full trading ledger calculating gross sales, platform fees (Reverb 8.2%, eBay 13.25%, zero-fee local cash), shipping, and repairs.
- **Hourly Wage Sanity Check:** Compares time spent (driving, photographing, messaging, packing) against net profit to calculate true realized hourly wage.
- Summary portfolio metrics: Total Net Profit, Capital Invested, and ROI%.

### 8. #134 Guitar Collection Manager & Insurance Schedule (`/tools/collection-manager/`)
- Private digital vault for instruments, vintage amplifiers, and boutique pedals.
- Tracks purchase dates, cost basis, condition grade, serial numbers, and replacement appraisals.
- **Printable Insurance Schedule (`window.print()`):** Generates an official, clutter-free tabular schedule formatted specifically for homeowner / instrument floater insurance policy riders.

### 9. #95 Stage Lyric & Chord Sheet Designer (`/tools/lyric-sheet-designer/`)
- High-contrast stage charts designed for iPad, tablets, and stage monitors.
- **Hands-Free Auto-Scroll:** Adjustable speed slider (1–10) with play/pause controls.
- Color-coded section tags (Verse, Chorus, Bridge, Solo), font scaling (14px–32px), and real-time transposition.

### 10. #209 Device-Targeted NAM Hardware-Optimizer (`/tools/nam-optimizer/`)
- Analyzes and downscales Neural Amp Modeler (`.nam`) captures for specific hardware units (Hotone Ampero II, Valeton GP-200, HeadRush Prime, MOD Dwarf).
- Calculates DSP load percentages, memory footprint, and buffer latency.
- Calibrates input gain to industry standard -18.0 dBFS with exportable hardware flash manifests.

### 11. #219 AI-Tab Fidelity & Playability Checker (`/tools/tab-fidelity-checker/`)
- Quality validator and "spell-check" for AI transcription models (Klangio, Songscription, Basic Pitch).
- Evaluates hand stretches and flags physically impossible fret spans (> 5 frets) and high-velocity string jumps.
- Automated ergonomic repairs to collapse unplayable fret groupings into human-playable hand boxes.

### 12. #220 Cross-Vendor Preset Portability Hub (`/tools/preset-portability-hub/`)
- Cross-vendor parameter mapping dictionary between **Line 6 Helix**, **Neural DSP Quad Cortex**, **Fractal Axe-Fx III**, and **Kemper Profiler**.
- Equivalent amp model lookup (BE-100, JCM800, Twin Reverb, Rectifier, AC30).
- Non-linear gain and presence taper translations with explicit flags for untranslatable proprietary DSP features.

### 13. #58 Volume & Hearing Safety Meter (`/tools/hearing-meter/`)
- Real-time calibrated sound pressure level (dBA SPL) microphone monitor using Web Audio API.
- Live **NIOSH / OSHA daily noise dose accumulator** tracking permissible exposure limits before permanent hearing damage.
- Rehearsal benchmarks (acoustic guitar, drum kit, 50W cranked tube half-stack) with peak hold and custom microphone calibration.

### 14. #60 String Bend Accuracy Trainer (`/tools/bend-trainer/`)
- Pitch tracking with sub-cent accuracy via autocorrelation / YIN frequency estimation.
- Target bend intervals: Half-Step (+100¢), Full-Step (+200¢), 1.5-Step (+300¢), and microtonal blues curls (+50¢).
- **Hold-to-Pass Validation:** Requires maintaining the bend inside the &plusmn;10¢ target window for 750ms to build muscular fretboard memory, complete with audible harmonic chime and streak counter.

### 15. #59 Closed-Loop Intonation Diagnostic (`/tools/intonation-diagnostic/`)
- Sub-cent pitch comparison comparing open string fundamental vs. 12th-fret fretted pitch across all 6 strings.
- Physical bridge screwdriver directions: alerts when to lengthen the string (move saddle backward away from neck) or shorten the string (move saddle forward toward neck).
- Dedicated profiles for Strat/Tele 6-saddle bridges, Gibson Tune-o-matic bridges, and vintage 3-saddle bridges.

### 16. #3 Passive Practice Auto-Logger & Wrapped (`/tools/practice-logger/`)
- Passive acoustic practice monitor that distinguishes active instrument playing from ambient noise and conversation.
- Measures true active fretting/plucking time vs. idle rest time.
- 4-week GitHub-style practice calendar heatmap and an automated **Guitarist Wrapped** monthly summary.

### 17. #49 On-Instrument Ear Trainer (`/tools/on-instrument-ear-trainer/`)
- Interactive call-and-response ear training engine.
- Synthesizes plucked guitar tones via Web Audio API physical modeling (plucked string decay filter and harmonics).
- Tests interval recognition (Major 3rd, Perfect 4th, Perfect 5th, Octave), pentatonic phrases, and chord qualities.

### 18. #89 Procedural Generated Backing Tracks (`/tools/backing-track-generator/`)
- Zero-audio-sample procedural rhythm band generator built on Web Audio API oscillators and noise generators.
- Generates kick, snare, hi-hats, walking bass lines, and rhythm chords across styles: 12-Bar Blues Shuffle, Slow Rock, and Jazz II-V-I.
- Live 4-beat bar visualizer, chord progression display, and tempo adjustment (60–180 BPM).

### 19. #194 Guitar → Tab on Your Own Takes (`/tools/guitar-to-tab/`)
- Monophonic and polyphonic guitar take transcriber that turns live audio takes into editable 6-string ASCII guitar tablature.
- Fretboard box heuristics that constrain notes within a 4-fret span to avoid unplayable left-hand stretches.
- Single-click clipboard copy and `.txt` file export.

### 20. #27 Public-Domain Guitar Songbook & Player (`/tools/pd-songbook-generator/`)
- Curated library of 100% legal, out-of-copyright classical studies and traditional melodies (Fernando Sor Op. 60, Matteo Carcassi Etude, Greensleeves).
- Built-in acoustic playback synthesizer with note-by-note tempo tracking.
- Single-click printable sheet music formatting (`window.print()`).

### 21. #64 Browser Amp Sim & Modular FX Chain (`/tools/browser-rig/`)
- Pure Web Audio API guitar rig simulator with zero plugins or downloads required.
- Reorderable modular signal chain: Compressor, Overdrive (soft-clipping hyperbolic tangent), Preamp / 3-Band Tonestack EQ, Modulation (Chorus/Flanger), Delay with tape echo feedback, and Cabinet IR Convolver simulation.
- Shareable URL presets encoding the complete chain configuration.

### 22. #180 Interactive Signal-Path Explainer (`/tools/signal-path-explainer/`)
- Interactive drag-and-drop pedalboard topology simulator.
- Demonstrates real-world audio consequences of pedal ordering (e.g. Wah before Fuzz vs. Fuzz before Wah, Reverb before Overdrive vs. Overdrive before Reverb).
- Interactive A/B sound comparison audio synthesizer letting users hear exact tonal differences and buffer impedance loading effects.

### 23. #175 Audio Interface Input Gain & Impedance Calibrator (`/tools/interface-calibrator/`)
- Calibrated input level meter targeting the industry-standard -18 dBFS digital sweet spot for amp sims (Neural DSP, NAM, Helix Native).
- Hardware database of popular audio interfaces (Focusrite Scarlett, Motu M2, Universal Audio Volt, SSL 2) with known Hi-Z input impedance and max dBu headroom ratings.
- Real-time clipping warning and recommended gain knob settings.

### 24. #118 Self-Grading Guitar Homework Studio (`/tools/homework-studio/`)
- Exercise recording studio for students and teachers with metronome click-track sync.
- Web Audio onset detector comparing note transients against expected beat grids (quarter, eighth, sixteenth notes).
- Grades accuracy with timing jitter statistics, rushing/dragging metrics, and a printable PDF/print evaluation report card for teachers.

### 25. #148 Daily Riff Streak & Speed Ladder (`/tools/daily-riff-streak/`)
- Daily practice routine tracker featuring curated technical exercises and riffs (Alternate Picking, Legato Spider, Sweep Arpeggio).
- Progressive speed ladder incrementing tempo (+5 BPM every N clean repetitions) up to target goal.
- Real-time synthesized guitar audio preview and localStorage streak calendar counter.

### 26. #188 ABX Double-Blind Audio Testing Rack (`/tools/abx-blind-test/`)
- Scientific double-blind listening test station for guitar tone comparisons (e.g. 96 kHz vs 48 kHz, Tube vs Digital Sim, True Bypass vs Buffered Cable).
- Randomized 10-trial test rack where X is randomly assigned to sample A or B per trial.
- Real-time binomial distribution p-value calculator determining whether listener preferences are statistically significant or indistinguishable from random guessing.

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
