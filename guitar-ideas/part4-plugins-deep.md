# 🎛️ Part 4 — The Deep Plugin Map: 27 categories, what's taken, and ideas 208–231

*You were right — Part 3 covered four buckets (amps/FX/VIs/hosts). This is the full sweep: every plugin category that touches guitar, who leads it, where the gap is, plus corrections to earlier ideas where reality already caught up.*

**How I searched:** industry sources (MusicRadar/GuitarWorld release roundups, Sound on Sound, KVR, Gearspace, VI-Control, Reddit, TONE3000, plugin dev docs), current-2026 release tracking, and the AI-authored roundups that dominate search results. **Honest limitation:** I have no tool to log into ChatGPT/Gemini/Claude. For that, I've written you `ai-crosscheck-prompts.md` — paste-ready prompts so you can put the same question to other models and merge their answers with mine. Do that; it's cheap and it'll catch what any single pass misses (including this one).

---

## The 27-category plugin map

| # | Category | Who leads | Status | The gap |
|---|---|---|---|---|
| 1 | **Amp sims (algorithmic)** | Neural DSP Archetypes (artist-licensed), AmpliTube 5, Helix Native, BIAS X, Bogren Ampknob | Saturated | Nothing left on tone — only workflow/UX |
| 2 | **Captures/profiles** | NAM A2 (MIT, free), TONE3000 (700K+ captures, free plugin Sept 2026), ToneX 2.0, Kemper, Quad Cortex Neural Capture V2 | Exploding | Quality vetting, editability, calibration, cross-device targeting |
| 3 | **Capture builders/trainers** | TONE3000 cloud training, Two Notes Capture Studio (free), ToneX capture | Commoditized | Guidance for humans (mic placement, levels, accuracy scoring) |
| 4 | **Cab/IR loaders & mic sims** | Two Notes, ML Sound Lab MIKKO, NadIR/Libra, every suite's cab block | Commodity | Room realism, binaural, headphone "amp-in-room" |
| 5 | **IR creation** | Two Notes Capture Studio, free online IR makers | Mostly solved | Easy + accurate mic'd acoustic/piezo IRs (see #15) |
| 6 | **Full suites/pedalboard rigs** | AmpliTube, Helix Native, Guitar Rig 7, TH-U, AmpKit (UG), BIAS X | Saturated | Foot control, setlist integration, teaching |
| 7 | **Stomp/one-knob models** | Bogren Ampknob (1-knob), MixWave (licensed EHX pedals, comp.-level), Cytomic, Audiority, UAD, Brainworx, Fuse | Healthy, crowded | Song-specific settings, blind-test trust, pedal-design sandbox |
| 8 | **Drive/fuzz/distortion (standalone)** | Free BYOD (modular), countless models | Saturated | Education/schematic-level, social circuit sharing |
| 9 | **Modulation/ambient/creative** | Output Portal, Arturia Fragments, Silo, Guitar Rig's FX, Valhalla | Rich | **Guitar-first, foot-controllable** ambient/freeze suite |
| 10 | **Delay/reverb (guitar-voiced)** | Valhalla, Strymon-alikes, Eventide, UAD | Saturated | Perceived room at low volume; sustain interaction |
| 11 | **Pitch: transposers/octave/harmony** | Pitchproof (free), Neural transposer, Digitech Whammy DT & EHX Pitch Fork (hw), Helix poly-capo, EK Whammo | Solved-ish | **Polyphonic drop-tuning that still feels right** — universally called the weak spot |
| 12 | **Sustain/feedback/freeze** | Blue Cat AcouFiend (2018, still the reference), EBow/hardware, free Sostenahto, Fractal patch tricks | Thin | Per-string/polyphonic controlled feedback, eBow-style articulation, freeze+latch live tools |
| 13 | **Gates/noise/repair** | Fortin Zuul (hw, topvst list), sonible smart:gate, FabFilter Pro-G, iZotope RX | Solved generically | **Guitar-specific**: string-aware gating, hum fingerprinting, squeak/pick-noise repair |
| 14 | **Utility (tuner/metronome/calibration)** | Every suite includes one; Fender Tune/GuitarTuna (mobile) | Saturated | **Input-gain & impedance calibration** between creator and player |
| 15 | **Acoustic/piezo/DI tone** | ToneDexter (hw), LR Baggs VoicePrint (hw app), free open-source IR makers, Baggs Session DI | Hardware-led | **Software equivalent in the DAW** — pickup→mic'd-body matching as a plugin |
| 16 | **Mix-ready channel strips** | Sonible smart:EQ 4/comp 2, Neutron 5, GuitarStrip-likes | Crowded, AI-heavy | Reference-driven ("match this record's guitar"), explainable AI |
| 17 | **Doubling/wide/tracking** | Manual production workarounds | **Gap** | Humanized virtual double/quad-tracking (#184 stands) |
| 18 | **Practice plugins/tools** | Transcribe!, Amazing Slow Downer, Anytune, PracticeSession ($39), Capo, Moises | Crowded but desktop-only/old | In-DAW practice, notation-synced practice, practice analytics |
| 19 | **Loopers** | Ableton Looper, Mobius 3 (free), Enso, MSuperLooper, Loopy Pro (iOS) | Solved | Foot-controlled philosophical loopers; loop→DAW pipelines |
| 20 | **Transcription/notation** | Melodyne, AnthemScore, ScoreCloud, Klangio (Guitar2Tabs), Songscription, MuseHub's free tools | AI wave arriving fast | **Fidelity/playability correction** of AI output |
| 21 | **Pitch→MIDI / guitar synth** | Jam Origin MIDI Guitar 2/3 Hex, Fishman TriplePlay, Boss SY-1000 (hw), free Dodo MIDI | Good enough | Hex workflows in the DAW; notation/teaching layers |
| 22 | **Virtual guitars (VIs)** | Ample Sound, Shreddage 3, MusicLab, Prominy, NI Session Guitarist, UJAM, Vir2 | Mature | **Chart→performance**, notation→audio, adaptive comping |
| 23 | **Songwriting/theory** | Scaler 3 (hosts plugins, timeline), Captain Chords, InstaChord | Strong | Guitar-voiced chord logic (positions/tunings), lyric tools |
| 24 | **Live hosts** | Gig Performer, MainStage, Cantabile, Ableton | Good but pricey/complex | Cheap, web-configured, setlist-first host (#198) |
| 25 | **Modeler companion/librarian** | HX Edit, Boss Tone Studio, Cortex Control/Cloud, Kemper Rig Manager, Fender Tone, Fractal FM9-Edit | Vendor-locked, one per device | **Cross-vendor** preset portability & mapping (#220) |
| 26 | **Hardware NAM support wave** | HeadRush (TONE3000 integration), Hotone Ampero, Valeton GP-5 ("snaptone" converter), Blackstar Beam (+Moises), ToneX pedal, Nano Cortex, ToneRig (iOS) | Exploding right now | Device-targeted capture packs, tone pack exports, level normalization |
| 27 | **AI/GPU wave** | BIAS X (text-to-tone & music-to-tone), sonible, Neutron 5, MixingGPT, Ozone, GPU Audio | Early, noisy | Explainable, blind-tested, guitar-specific AI — not black-box magic |

**What changed since Part 3 (all Aug–Sept 2026):** TONE3000 shipped its own free open-source NAM A2 plugin with 700K+ captures browsable in-DAW (Sept 1); Line 6 launched Helix Stadium Native with a free tier; Fractal released its first-ever plugin (ICONS series); IK revamped ToneX 2.0 Player; Neural DSP shipped Quad Cortex Mini + Neural Capture V2; HeadRush added TONE3000/NAM A2; Valeton/Hotone ship NAM downscalers for pedals. **The capture ecosystem is consolidating fast — anything that assumed "there's no good NAM player" is now wrong.**

---

## Corrections: earlier ideas reality has already eaten (partial or full)

| Idea | Status now | What survives |
|---|---|---|
| #171 Capture trainer for humans | Two Notes Capture Studio (free) + TONE3000 cloud training cover the basics | The **guidance/accuracy-scoring layer** (mic placement coaching, pass/fail on capture quality) is still unbuilt |
| #173 Embeddable NAM player | TONE3000 plugin + in-app audition covers most of it | A true third-party **web embed** (tone embeds in forum posts/articles) is still open, but shrinking |
| #174 Capture format bridge | Still open — vendors are blackboxed; community "captures of captures" is the hack | Survives, but needs to be positioned as **capture-by-listening** (train NAM on ToneX/Kemper output), not file conversion |
| #187 Feedback simulator | Blue Cat AcouFiend exists and is good (mono-ish, chord-capable); Sostenahto free | Survives only as **per-string/polyphonic** feedback + live performance tools |
| #194 Guitar→notation real time | Klangio Guitar2Tabs, Songscription, ScoreCloud, AnthemScore all do audio→tab/notation | Survives as **in-DAW, on-your-own-take, playability-aware** output — nobody closes that loop |
| #200 Practice-coach plugin | PracticeSession/Transcribe! are players, not coaches | Survives fully — no plugin does take-by-take scoring + tomorrow's plan |
| #207 Preset market with audition | TONE3000 auditions captures; preset packs still blind | Survives for **plugin presets** (not captures) |

---

## New ideas 208–231 (deep-category pass)

**208. Per-string (hex) processing plugin** — a DAW plugin that takes a hex-pickup feed (or MG3 Hex) and gives each string its own capture/EQ/dynamics/pan/tuning chain, with a per-string UI. Hardware does this (SY-1000); software treats guitar as one mono blob. Enables: instant alt-tunings per string, per-string compression, hex re-amping, impossible chords made playable.

**209. Device-targeted capture optimizer** — feed it a NAM A2 capture and tell it your pedal (Hotone/Valeton/HeadRush/ToneX); it outputs the correct architecture/quantized version, with an A/B fidelity report and a latency/CPU profile. Vendors ship one-off converters; nobody offers a **cross-device optimizer with quality reporting** — and the NAM-on-everything wave is happening right now.

**210. "Unfreeze my capture" — parameter extraction for captures** *(moonshot)* — captures are single snapshots; the #1 complaint is you can't turn the knobs. A meta-model that estimates a captured amp's gain/tone-stack mapping so you get a control surface on top of a profile. Research-grade, but whoever cracks it changes the category.

**211. Binaural amp-in-room for headphones** — HRTF-based rendering of a cab in a real room, with head-turn compensation, so headphones stop sounding "in your skull." Pairs with #177/#178; nobody's shipped it properly for guitar.

**212. Round-trip latency coach** — measures your true RTL, auto-aligns recorded DI vs. monitored signal, tracks latency per buffer/plugin-load, and warns when a chain crosses the playability threshold. Turns the community's most repeated frustration (latency, gain staging) into a utility.

**213. Virtual pickup load & cable capacitance sim** — models input impedance, cable capacitance, volume/tone pot loading and treble bleed, so captures and amp sims respond like they're actually plugged into a guitar. The missing "why does my plugin sound different from the demo" fix.

**214. Pickup-swap plugin (response emulation)** — humbucker bridge DI re-voiced toward single-coil neck / P90 / filtertron response, with honest mono limitations and per-position profiles. There are hardware pickup sims and scattered IR hacks; no proper plugin.

**215. String-aware noise gate** — gates only the offending harmonic/band (hum, buzz) using a learned fingerprint, leaving the low E and pick attack intact. Generic gates and even smart:gate are instrument-aware but not *string-aware*.

**216. Guitar-first ambient/freeze/foot suite** — granular + shimmer + swell + freeze + glitch, designed around an expression pedal and a footswitch instead of a mouse, with instant "soundscape in a box" presets. Guitar Rig leans creative but is mouse-first; Portal is producer-first. Ambient/post-rock players have no home.

**217. Hex-aware harmony & sustain engine** — per-string sustain, per-string octave/harmony (violin-style voicings, true polyphonic feedback that behaves like six strings, not one blob). Extends #187 properly and needs #208 first.

**218. DAW-side acoustic WaveMap studio** — the ToneDexter/VoicePrint trick as software: play pickup + mic, get a matched IR/wavemap, blend/anti-feedback in the box. Hardware owns this today; nothing in-DAW does it. (Strong: acoustic players are underserved and this is a proven, beloved approach.)

**219. AI transcription fidelity checker** — Klangio/Songscription/AnthemScore output is fast but unverified. A checker that scores a tab against the audio (note agreement) *and* against playability (fret spans, position sanity, tuning), with auto-repair suggestions. Timely, cheap to build, and every AI transcription wave needs a validator.

**220. Cross-vendor preset portability hub** — community-maintained translation maps between Helix / Quad Cortex / Kemper / AmpliTube / Boss / NAM chains, plus a converter assistant that does best-effort mapping and flags what it can't translate. Vendor librarian software is one-device-only by design. (Ties #68, #202, #174.)

**221. Foot-controller mapping OS** — auto-map any plugin's parameters to any MIDI foot controller, with shareable community mapping files per plugin. Mapping hell is universal and currently solved by forum threads.

**222. Setlist → device-ready pack exporter** — one click: setlist in, out comes per-song tone chains as device-ready packs (NAM pedal / ToneX / QC / plugin) with level-normalized loudness per #185, tempo, notes and, optionally, a click/backing stem. The 2026 hardware NAM wave makes this newly possible and newly valuable. (Ties #198/#199.)

**223. Practice overlay for any recording** — play a song, get stem isolation + slow-down + **optional AI tab overlay with confidence marks** + loop trainer + notation export, all in one window. PracticeSession gets closest; nobody merges "practice" with "AI transcription confidence" (ties #219).

**224. Teacher's tone-as-assignment flow** — a teacher ships a tone chain (capture + settings) plus tasks; the student loads it, records takes in-app, and the teacher sees scored attempts before the lesson. Makes #118 and #200 a *distributable asset* (a tone chain becomes homework).

**225. Plugin CI/QA dashboard for indie devs** *(B2B)* — automated `pluginval` runs across formats/DAWs/OS, crash telemetry, plugin-format compatibility matrix, and store-page validation. Every indie dev rebuilds this badly; JUCE/iPlug2 shops would pay monthly (ties #228 in the meta space).

**226. Capture spec-sheet standard + reader** — an open metadata schema (gain staging, impedance, mic, cab, room, chain, level reference) written into capture files and read by any player, so a profile sounds right on *your* interface by default. Fixes #175/#171 at the standard level; the ecosystem is young enough that a well-positioned spec can actually land (ties #202).

**227. Plugin/preset ROI tracker** — watches your DAW sessions, tells you which subscriptions and preset packs actually got used, and what each cost per use. Subscription fatigue is the dominant 2026 mood (AmpHub $14.99/mo, PA Mega, Slate, own-brand subs everywhere); this turns it into a decision (ties #205).

**228. GPU-accelerated capture chains (and browser hosting)** — run many A2 captures + IRs + heavy FX chains on the GPU, in-plugin and in-browser (GPU Audio is betting on it). The unlock: pedalboard-scale rigs (5–10 cap-ture slots) on a laptop without CPU meltdown, plus web apps that can finally host a real rig.

**229. Pedal-circuit sandbox with social sharing** — BYOD-style modular distortion, but with component-level mods, a plain-language explainer of what each change does, and a community marketplace of user-designed dirt boxes (free/paid). Education + community + sharing; the free BYOD exists but has no ecosystem.

**230. Certified blind-test service for brands and reviewers** — the ABX rack (#188/#206) as a business: brands pay for rigorous blind tests of their product vs. competitors (with public methodology), reviewers get a credibility tool, and results feed the purchase-decision database. Nobody in guitar audio has an "RTINGS-grade" blind-test authority.

**231. Modeler onboarding courseware (B2B)** — structured, interactive courses for Quad Cortex / Helix / Kemper / ToneX ecosystems, sold to the hardware makers as official onboarding ("learn your modeler in 3 hours") and to users as certification. Brands currently rely on YouTube tutorials that they don't control.

---

## Red oceans (confirmed by this deeper pass)

- **Amp sims, IR loaders, cab blocks, generic tuners/metronomes, generic gates, generic pitch shifters, generic loopers, generic drive pedals** — all solved, mostly free at the low end.
- **Another AI transcription app** — the category flooded in 2025–26 (Klangio, Songscription, MuseHub free tools, ScoreCloud, AnthemScore). Build the **validator/repair layer** (#219) or the **practice integration** (#223) instead.
- **A capture library or player** — TONE3000 just made the library free, open, and in-DAW. Do not compete with free infrastructure that good.
- **Anything that just wraps NAM** — the wrapper needs a defensible extra: device targeting (#209), spec metadata (#226), setlist packs (#222), or teaching (#224).

## Where the real openings are now (plugin-side, ranked)

1. **#209 device-targeted capture optimizer** — timing is perfect (hardware NAM wave), narrow scope, provable value.
2. **#222 setlist → device pack exporter** — the gigging player's dream, built on free infrastructure, zero rights issues.
3. **#188/#206/#230 blind-test + certification** — trust infrastructure for a market drowning in AI claims and marketing. Brand-safe, affiliate- and B2B-monetizable.
4. **#184 humanized double-tracker** — universal need, no real product, technically tractable.
5. **#218 acoustic WaveMap studio** — proven concept (ToneDexter/VoicePrint), zero software equivalent, passionate market.
6. **#210 capture parameter extraction** — moonshot, but it's *the* complaint of the entire capture community.

---

*Parts 1–2: apps/websites/hardware (1–170). Part 3: plugin landscape (171–207). Part 4: this deep map (208–231). Total so far: 231 ideas. Next: your cut list, then the master bank.*
