# 🎸 HANDOFF — Build Brief for a New AI Session

**v2 — website-first plan.** This document is written for an **AI build session** (any model, any chat): read it, then `ideas.html`, then start building. Everything you need is in this folder; the human attaching it will paste a kickoff prompt from `kickoff-prompt.md`.

---

## The mission

Build a **personal guitar software toolkit for PC** for the owner: **one website** that starts as a hub and grows into a suite of small, useful guitar apps — then desktop versions only where genuinely needed.

- **€0 budget.** Free tools, free tiers, open source. No paid APIs, no cloud GPU, no domains, no app-store fees.
- **Personal use.** Built for the owner. Tools may be freeware marked "free for personal use". Any music files the owner has are fair game — no content restriction for personal builds (the only line: if a project ever goes to other people, bundled content must be own/PD/CC/crowd-sourced/user-supplied).
- **Local-first.** Heavy processing on the owner's machine. No accounts, no trackers, no ads. This is what keeps running costs at €0 forever.

## The build order — memorize this

1. **PHASE 1 — The starter website.** One static, installable website (the "hub") that lists every planned tool and will host each app as it gets built. **Nothing else is built until this is live and usable.**
2. **PHASE 2 — Applications, easiest first.** Add apps to the hub in ascending difficulty (ladder below). One app per work session.
3. **PHASE 3 — Optional, later.** Desktop wrappers for audio-heavy tools; extras only if the owner asks.

**Why website first:** one deploy target, one design language, one place to grow. A web app runs on Windows/macOS/Linux with no install, updates instantly, and as a PWA is installable and fully offline. It also means every later app inherits navigation, styling and the tool registry for free. Near-zero technical risk at the start.

---

## PHASE 1 — The starter website (definition of done)

Deliver a deployable personal hub. Checklist:

- [ ] **Repo scaffold** — default recommendation: **SvelteKit with the static adapter** (+ PWA plugin). Plain Vite + TypeScript is acceptable if justified in one line. **No server runtime, no database.**
- [ ] **Design system** — dark theme, one accent colour, responsive, keyboard-accessible, readable at 200% zoom. Font: **Inter bundled locally** (OFL) so the site works offline. One stylesheet/tokens file all future apps inherit.
- [ ] **Tool registry** — a single data file (e.g. `src/lib/tools.json`) listing every tool: catalog number (`#131`), name, one-line description, status (`live` / `planned`), tags, difficulty. Every future app = one registry entry + one route folder.
- [ ] **Hub page** — site title (suggest: **"Guitar Toolkit"**), search/filter across tools, cards rendered from the registry, clear live/planned status.
- [ ] **PWA shell** — web manifest + service worker: installable, works offline after first load.
- [ ] **Deploy config** — free hosting, zero cost: GitHub Actions workflow deploying to **GitHub Pages**, or `wrangler` config for **Cloudflare Pages**. Include instructions in the README for whichever is chosen.
- [ ] **Housekeeping** — `README.md` (what it is, how to run, how to add a tool), `LICENSES.txt` (one line per asset: name, source, licence, date).
- [ ] **Proof it works offline** — build the static output, open it with the network disabled, everything still renders.

**Done = the owner can open the deployed URL (or local build), see the hub, search it, and install it as an app on their PC.**

## PHASE 2 — The easiest-applications ladder

Add **one app per session**, easiest first. Each app is a route on the hub, registered in `tools.json`, following the Phase-1 design system. Never start the next tier until the current one is deployed.

### Tier 1 — Pure logic & data (no audio). Each: 1–5 days of session work.

| Order | # | App | What to build | Why it's easiest |
|---|---|---|---|---|
| 1 | **#131** | Repair Diagnostic Wizard | Symptom → ranked causes → fix order, from editable JSON decision trees. Start with the "fret buzz" tree, then 5 more. | Content + logic only. Static. Nothing to host. |
| 2 | **#83** | Pedalboard cost planner | Pick pedals/power/cables from a local list → running total + "you forgot isolated power" warning. | Simple list + arithmetic + local storage. |
| 3 | **#80** | String-life tracker | Log string changes (brand/gauge/date/hours) per guitar; alerts when a change is due. | Forms + localStorage/IndexedDB. |
| 4 | **#37 + #39** | Nashville Number converter + Capo intelligence | Chart ↔ NNS ↔ transposition; "capo 3, play G shapes, actual key Bb" visualised on a fretboard. | Pure music-theory math (Tonal.js) + SVG. |
| 5 | **#132** | Serial number decoder | Enter serial → year/factory/model line, with "doesn't match its claim" flags. | Static data tables + lookup logic. |
| 6 | **#44** | Chord chart cleaner | Paste a messy chord sheet → reflow into a clean, printable lead sheet (transpose + print CSS). | Parsing + print styles. User's own files. |
| 7 | **#75** | Gear flips tracker | Bought/sold log with fees, shipping, profit, and an hourly-rate sanity check. | CRUD + math. |
| 8 | **#134** | Collection manager | Photos, serials, receipts, value history, printable insurance schedule per guitar. | Local database (IndexedDB). |
| 9 | **#95** | Lyric + chord sheet designer | Stage-glanceable charts: large chord fonts, section colours, no page turns. | Layout/design work, no DSP. |

### Tier 2 — Light audio in the browser (microphone in). Each: 1–2 weeks.

| Order | # | App | Core technical risk to prove first |
|---|---|---|---|
| 10 | **#58** | Volume / hearing meter | Mic → calibrated dB estimate (real-time RMS). |
| 11 | **#60** | Bend trainer | Pitch tracking (YIN) with cents readout, held-note passing logic. |
| 12 | **#59** | Intonation tester | Pitch at open/12th/other frets → diagnosis rules. |
| 13 | **#3** | Auto practice logger | Distinguishing playing from background media; session logging. |

### Tier 3 — Real DSP / heavier builds (still €0). Each: 3–8 weeks.

| Order | # | App | Notes |
|---|---|---|---|
| 14 | **#49** | On-instrument ear trainer | Playback + mic scoring; difficulty ladder. |
| 15 | **#89** | Generated backing tracks | AudioWorklet scheduling, pattern engine, CC0 soundfonts. The flagship. |
| 16 | **#194** | Guitar → tab on own takes | Basic Pitch + playability inference + alphaTab rendering. |

**Rule for the ladder:** if an app takes more than one session, it may be split — but each session must end with something deployed and usable.

---

## Hard constraints (non-negotiable)

| Constraint | Meaning |
|---|---|
| **€0** | Free tools, free tiers, open source. Everything must build AND run at zero cost. |
| **Personal use** | Built for the owner. "Free for personal use" tools are approved. |
| **Any music** | No content restriction for personal builds; the owner's own files are fair game. |
| **No piracy** | Never cracked software / keygens / expired trials as a build base (malware risk; everything needed is free legitimately). |
| **Local-first** | Processing on the owner's machine; no accounts, trackers, ads. |
| **No backend** at the start | Static hosting + browser storage. A free-tier backend only if a specific app truly cannot work without it — ask first. |

## The €0 stack (condensed)

- **Code:** VS Code · Git + GitHub (free CI on public repos) · Node/TypeScript · SvelteKit (static) or Vite.
- **App shape:** static site / PWA first. Desktop wrapper (Tauri — free) only for apps that need file access or audio latency.
- **Audio (when the ladder reaches Tier 2–3):** Web Audio API + AudioWorklet (schedule ahead; **never `setInterval`** for musical timing) · Tone.js · alphaTab (MPL-2.0, tabs) · Tonal.js (theory) · VexFlow (notation) · FluidSynth + CC0 soundfonts · Basic Pitch (Apache-2.0) · YIN/CREPE (pitch).
- **Storage:** localStorage / IndexedDB in the browser (no server). Export/import as JSON files.
- **Deploy:** GitHub Pages or Cloudflare Pages — free forever at this scale.
- **Fonts/design:** Inter (OFL, bundled), Inkscape/Figma free for assets.

## Conventions & quality bar

- **One registry entry per tool** — `tools.json` stays the single source of truth for the hub.
- **LICENSES.txt** in every project: one line per asset (name, source, licence, date).
- **Reproducible:** one command to run locally, documented in the README.
- **Keyboard accessible**, readable at 200% zoom, works offline after first load.
- **Tests where cheap:** unit-test logic (theory math, parsers, decision trees) with Vitest.
- **Ship small:** a working narrow tool beats a half-built wide one. Every session ends with a deployed improvement.

## App spec template (fill before writing any app)

1. **One sentence:** *[who]* *(the owner)* can now *[do what]* in *[how long]* instead of *[current painful way]*.
2. **MVP scope:** the narrowest slice that delivers that sentence; hardcoded or pasted input is fine.
3. **Stack mapping:** which €0 tools cover each piece.
4. **Registry entry + route name.**
5. **Milestones:** 3–5 checkpoints, each independently demoable.
6. **Acceptance criteria:** measurable, user-visible.
7. **Pitfalls:** known traps (check `ideas.html` for the app's deep dive).

Ready-made specs for later apps (use when the ladder reaches them): **#131, #27, #89, #219, #194** — see the previous version of this brief's §4 or the deep dives in `ideas.html`; each has MVP scope, stack, milestones, acceptance criteria and pitfalls.

## Do-nots

- Don't propose paid tools, cloud GPU, licensed sample libraries, or app-store distribution.
- Don't build a backend, login system, or analytics — none of these apps need them.
- Don't build: another amp sim, tuner, metronome, generic IR loader, generic AI transcriber, or a capture library (saturated — see `part4-plugins-deep.md`).
- Don't resurrect the 20 parked ideas (hardware, escrow, printing, licensed-content hosting) — they need money.
- Don't wait for permission on styling details; make good default choices and keep moving.

## How the new session should work

1. Read this file. Skim `ideas.html` (deep dives give context for later apps).
2. Start **Phase 1** immediately: scaffold, registry, hub, PWA, deploy config, housekeeping. **Working code in the first response** — not a plan.
3. End the response with: what's deployed, what the owner should try, and the next ladder step.
4. In later sessions (paste prompt P2 from `kickoff-prompt.md`): add exactly one app from the ladder, deploy it, update the hub.

---

*Compiled 29 Sep 2026. The bank behind this brief: 236 ideas invented → 20 parked for budget → 216 live. All free to build, free to run, for personal use.*
