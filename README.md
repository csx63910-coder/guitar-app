# 🎸 Guitar Toolkit — Personal Zero-Budget Guitar Suite for PC

**Guitar Toolkit** is a personal, local-first web and desktop software suite for guitarists, producers, and luthiers. It runs 100% locally on your machine, functions completely offline as a Progressive Web App (PWA), and costs **€0** to build, run, and host.

The project follows a **Website-First** architecture: one unified web hub that houses modular guitar applications added one-by-one following an ascending difficulty ladder (pure logic/data first, then light audio, then real DSP).

---

## 🎸 Live Applications in the Toolkit

Guitar Toolkit features **44 applications live, tested, and fully functional offline** across utilities, maintenance, practice, audio DSP, and modeling:

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

### 27. #76 Interactive Guitar Wiring Diagram Generator (`/tools/wiring-diagrams/`)
- Interactive schematics for Stratocaster (5-Way), Telecaster 4-Way Series Mod, Les Paul 50s Vintage Wiring, Humbucker Coil-Split, and Treble Bleed Networks.
- Interactive switch position simulator highlighting active pickups and signal routes on color-coded SVG diagrams.
- 4-conductor pickup wire color code matrix (Seymour Duncan, DiMarzio, Gibson, Fender, Bare Knuckle) and printable bill of materials.

### 28. #54 The "Listening" Metronome (`/tools/listening-metronome/`)
- Web Audio onset detector monitoring live guitar timing against tempo grids.
- Automatically mutes its click once you lock into the pocket (&plusmn;35ms to &plusmn;50ms tolerance) to build internal pulse.
- Clicks back on the moment you drift early or late, alerting you to rushing vs. dragging.

### 29. #85 Hum-to-Chords Idea Vault (`/tools/hum-to-chords/`)
- Transcribes hummed, whistled, or sung vocal melodies in real-time via autocorrelation pitch tracking.
- Generates 4 matching guitar chord progressions (Pop/Folk, Neo-Soul 9ths, Cinematic Minor, Modal Loops).
- Web Audio pluck synthesizer preview playing the melody layered on top of the chord progressions.

### 30. #31 YouTube Smart Practice Looper (`/tools/youtube-looper/`)
- Official YouTube iframe player integration with seamless one-click A/B micro-looping.
- Pitch-preserved speed controls (50%, 65%, 75%, 85%, 100%, 115%) and fine-grained &plusmn;0.1s / &plusmn;0.5s loop nudging.
- Save measure bookmarks with practice notes and use hands-on keyboard shortcuts (Space, [, ], L, R).

### 31. #63 "How Do I Get This Tone?" Recipe Finder (`/tools/tone-recipe-finder/`)
- Exact blueprints for iconic recorded guitar tones (David Gilmour, Stevie Ray Vaughan, Eddie Van Halen, The Edge, John Mayer).
- Provides exact guitar pickup positions, amp tone-stack knobs (Gain, Bass, Mid, Treble, Presence), and pedal chain sequences with luthier secret sauce.
- Built-in Web Audio distortion/delay tone audition synthesizer.

### 32. #79 Complete Guitar Setup Wizard (`/tools/setup-wizard/`)
- Step-by-step diagnostic guide executing the mandatory luthier order of operations: Neck Relief &rarr; Action &rarr; Intonation &rarr; Pickups.
- Household measurement guides (business card, credit card, guitar picks) with exact truss rod wrench specs and saddle turn directions.
- Printable bench work order sheet.

### 33. #53 Pocket & Groove Scoring Engine (`/tools/groove-scoring/`)
- Analyzes micro-timing variance in milliseconds across straight, laid-back (+25ms), and pushed (-18ms) rhythm styles.
- Quantitative Pocket Index (0–100) scoring timing consistency and feel classification (Deep Pocket vs. Jitter vs. Dragging).
- Real-time deviation scatterplot timeline.

### 34. #13 Fretboard Memory Palace (`/tools/fretboard-memory/`)
- Spaced-repetition fretboard memorization trainer on an interactive 22-fret rosewood fretboard with bone nut and fret wire styling.
- 60-second rapid-fire sprint challenge and untimed free exploration modes.
- Physical pluck audio synthesis playing the exact pitch of any clicked fret or correct answer.

### 35. #35 Fretboard Chart Simplifier (`/tools/chart-simplifier/`)
- Converts complex jazz and altered chords (maj9, 13, m7b5) into effortless 3-note Freddie Green shell voicings (Root, 3rd, 7th).
- SVG chord box diagrams with muted string indicators and finger numbers.
- Built-in strum audio synthesis.

### 36. #137 Luthier Workbench Toolkit (`/tools/luthier-workbench/`)
- 12-TET scale length fret placement calculator generating exact nut-to-fret and step measurements to 0.001" and 0.01mm.
- Printable 1:1 scale under-string radius gauges (7.25", 9.5", 12", 14", 16").
- Precision nut slot depth specs and 3rd fret depress tap tests.

### 37. #119 Student Repertoire & Progress Roadmap (`/tools/student-roadmap/`)
- Private guitar teacher roster manager with skill proficiency radar (open chords, barre chords, picking, pentatonics).
- Repertoire progress tracker (Learning &rarr; Polishing &rarr; Mastered) and weekly practice homework assignment logger with printable assignment sheets.

### 38. #23 Performance-Pressure Simulator (`/tools/pressure-simulator/`)
- Realistic crowd chatter & murmur ambience (Dive Bar, Coffeehouse, Arena, Audition Room).
- Random surprise distractions (dropped beer glasses, ringing smartphones, feedback squeals, premature applause).
- Flashing red-light studio panic mode with strict "no restarts / play through errors" stage rule.

### 39. #40 Alternative Tuning Chord & Drone Library (`/tools/alt-tunings/`)
- Comprehensive chord charts and string maps for DADGAD, Open G (Keith Richards / Stones), Open D (Slide), and Drop D.
- Continuous ambient acoustic tanpura/Celtic drone synthesizer sustaining root and 5th harmonics during practice.
- Built-in audio strum previews.

### 40. #16 Barre Chord Survival & Strength Gym (`/tools/barre-chord-gym/`)
- Biomechanical leverage training (shoulder pull vs. thumb pinch) and bony index finger radial roll ergonomics.
- Interactive 6-string knuckle clarity diagnostic pinpointing exact finger joint pressure weak spots.
- 30-second isometric hold endurance timer.

### 41. #15 Fingerstyle & Travis Picking Bootcamp (`/tools/fingerstyle-bootcamp/`)
- Alternating bass thumb independence trainer (P-I-M-A classical notation).
- Curated patterns: Folk Pinch (Dust in the Wind), Chet Atkins Outside-In Roll, and Celtic 6/8 Harp Cascade.
- Interactive animated tab grid with synchronized audio plucks and tempo slider.

### 42. #9 Triad Inversion Visual Trainer (`/tools/triad-inversions/`)
- Root Position, 1st Inversion, and 2nd Inversion voicings across Strings 1-2-3 (melody) and Strings 2-3-4 (funk/rhythm).
- Interactive SVG fretboard diagrams with color-coded Root, 3rd, and 5th intervals.
- Audio arpeggiator and flashcard quiz mode with score tracking.

### 43. #5 Guitarist Weakness Radar & Skill Assessment (`/tools/weakness-radar/`)
- 5-axis self-grading test battery evaluating Rhythm & Pocket, Barre Stamina, Fretboard Recall, Bend Accuracy, and Picking Speed.
- Pure SVG vector spider/radar chart visualizer plotting your skill polygon.
- Algorithmic bottleneck identifier with personalized 20-minute daily practice prescription.

### 44. #109 Rehearsal Audio Splitter & Song Marker (`/tools/rehearsal-splitter/`)
- Ingests full-length band rehearsals (MP3, WAV, OGG) and scans RMS energy waveforms.
- Automatically divides continuous audio into discrete song takes using configurable silence threshold detection.
- Per-take BPM, musical key, and notes tagging with direct playback audition.

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
