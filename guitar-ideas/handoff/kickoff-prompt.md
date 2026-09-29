# 🚀 Kickoff Prompts — paste into the new AI session

**How to use:** in the new session, attach or paste `HANDOFF.md` + `ideas.html`. Then paste **P1** below to start the project (website first). Use **P2** in later sessions, once per app.

---

## P1 — START THE PROJECT (website first, then the easiest apps)

> You are the build session for a personal guitar software project. Attached: `HANDOFF.md` (the full build brief — read it first, especially "The build order") and `ideas.html` (the idea bank with 216 live ideas).
>
> **The owner:** one person, PC (Windows/macOS/Linux), — €0 budget, personal use. No money may be spent: free tools, free hosting, no paid APIs, no hardware, no app stores. Local-first: no accounts, no trackers, no backend unless something is genuinely impossible without it (ask first if so).
>
> **Build order — follow it exactly:**
>
> **PHASE 1 — the starter website (do this now).** Build the hub: a static, installable website that lists every planned tool and will host each app as it gets built. Deliverables (all from §"Phase 1" of the brief):
> 1. SvelteKit with the static adapter + PWA support (or plain Vite+TS with one line of justification — no server runtime).
> 2. A dark design system with one accent colour and the Inter font bundled locally for offline use; responsive and keyboard-accessible.
> 3. A tool registry (`src/lib/tools.json`) listing the planned tools — number, name, one-line description, status (`live`/`planned`), tags, difficulty — seeded from the ladder in the brief (start with the Tier 1 list, it's fine to include more as `planned`).
> 4. A hub page ("Guitar Toolkit") that renders the registry with search/filter and clean live/planned cards.
> 5. PWA manifest + service worker (installable, works offline).
> 6. Free deploy config: GitHub Actions → GitHub Pages (or Cloudflare Pages) + instructions in the README.
> 7. `README.md` (what it is, how to run, how to add a tool) and `LICENSES.txt`.
> 8. Proof: the built site renders correctly with the network disabled.
>
> **PHASE 2 — the first app in the same response if possible: #131 Repair Diagnostic Wizard.** Add it as the first route: symptom in → ranked likely causes → fix order → simple measurement instructions, driven by an editable JSON decision tree (`data/trees/*.json`). Implement the "fret buzz" tree completely first; structure everything so more trees are data-only additions. Register it in `tools.json` as `live`.
>
> **Rules:** working code in your first response — scaffold, hub and (ideally) the buzz tree, not a plan. Everything must run with `npm run dev` and build statically. No accounts, no backend, no analytics. Unit-test the decision-tree logic if it's cheap to do. If you must choose between polish and shipping, ship.
>
> **End your first response with:** what exists, the exact commands to run it, what to try first, and the next ladder step (Tier 1, item 2: #83 Pedalboard cost planner).

---

## P2 — ADD THE NEXT APP (repeatable, one per session)

> Continuing the Guitar Toolkit project (attached: `HANDOFF.md`; previous state is in this repo). Per the brief's ladder, add the next app: **[#__ NAME]**.
>
> Requirements: one new route following the existing design system; one new `tools.json` entry marked `live`; data/logic kept in editable files where possible; unit tests for any logic; README + LICENSES.txt updated; everything still builds statically and works offline; no backend, no paid anything.
>
> Deliver working code in your first response, end with what to try and the next ladder item. If this app turns out to need more than one session, deliver the narrowest deployable slice now and note what's next.

---

## P3 — IF THE SESSION WANTS TO RE-ORDER THE LADDER

> Continuing the Guitar Toolkit project (attached: `HANDOFF.md`). Before adding the next app, sanity-check the build order: the plan is "website first, then applications easiest-first" per the brief's ladder. Confirm or improve the order for **[#__ NAME]** and the two items after it — the criterion is fastest path to something the owner uses daily, at €0. Then build the first item.

---

## P4 — NO ATTACHMENTS? Paste this mini-brief first

> **Context:** I want a personal guitar software toolkit for my PC, built with **€0**. Rules: free/open-source tools only, free-tier hosting or fully local (static site, no server runtime), personal use, no piracy, any music files I own are fine. Deliverable shape: **one website first** (a hub that lists planned tools — installable PWA, works offline), and then apps get added to it one at a time, **easiest first**. The full plan, constraints and an "easiest-first ladder" are in my `HANDOFF.md` and the idea bank is `ideas.html` — read them if you can access my workspace; otherwise ask me to paste the brief.
>
> Start with **Phase 1: the starter website** exactly as described in the brief (SvelteKit static + PWA, dark design system, tool registry, hub page, deploy config, README, LICENSES.txt). Then, if you can, immediately add **#131 Repair Diagnostic Wizard** (fret-buzz tree first). Show working code in your first response.

---

## Quick app-specific additions (append to P2 if useful)

| # | App | Extra instruction |
|---|---|---|
| **#83** | Pedalboard cost planner | "Local catalogue in JSON; running total; warn about isolated power, cables and board size; export a shareable summary." |
| **#80** | String-life tracker | "Per-guitar logs in IndexedDB; change-due estimate from hours played; JSON export/import." |
| **#37/#39** | NNS converter + capo intelligence | "Use Tonal.js; show capo results visually on an SVG fretboard; test the transposition math." |
| **#132** | Serial decoder | "Data tables per brand in JSON; flag mismatches; add clearly-marked sources." |
| **#44** | Chord chart cleaner | "Parse ChordPro/text charts; clean print stylesheet; transpose buttons; user's own files only." |
| **#58** | Hearing meter | "Mic → real-time dB estimate; set a session budget; calibration offset the user can set." |
| **#60** | Bend trainer | "YIN pitch detection; target note shown; cents deviation live; pass = held in tune for 2 s." |
| **#49** | Ear trainer | "Generated tones only; play → user plays back → scored; ladder from single notes to 2-bar phrases." |
| **#89** | Backing tracks | "AudioWorklet scheduling (never setInterval); one style first; CC0 soundfonts; WAV/MIDI export." |
| **#194** | Guitar → tab | "Basic Pitch locally; single-string melodies first; position inference; alphaTab render + MIDI export." |

---

*The whole plan in one line for the session: **website first, then the easiest apps, one per session, all €0, all local-first, deployed after every step.***
