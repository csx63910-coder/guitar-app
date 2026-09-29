# 🎛️ Part 3 — Guitar Plugins: Landscape + Ideas 171–207

*The plugin world (amp sims, captures, FX, virtual guitars, live hosts, licensing) surveyed as of Sept 2026, with new numbered ideas continuing the catalog.*

---

## 0. The plugin landscape in one page

| Sub-space | Who owns it | What's commoditized | What's still open |
|---|---|---|---|
| **Amp sims (algorithmic)** | Neural DSP (Archetype series = artist-licensed rigs, the premium benchmark), IK AmpliTube 5, Line 6 Helix Native, Positive Grid BIAS, Softube, Brainworx, Nembrini, Mercuriall, Kuassa, Overloud TH-U, STL AmpHub (sub, $14.99/mo, 59 amps) | "Good enough" amp tone. Amp modeling itself is a solved commodity — free options sound 95% as good. | Feel under the fingers, UI/UX, workflow, teaching, integration with *your* songs/setlist, standardization |
| **Capture / profiling (ML)** | **NAM** (open source, MIT-licensed A2 arch, WaveNet-based, free, Gateway player), **TONE3000** (formerly ToneHunt/TONEZONE3000 — world's largest capture community, cloud training, API, now the de-facto hub), IK **ToneX**, Kemper, Neural DSP Quad Cortex, AIDA-X, ToneHub (STL Cloud Capture) | Capturing is free and easy now — sweep file in, cloud GPU trains, NAM file out, works everywhere NAM is supported. Captures are the new WAV files. | **Quality vetting** (piles of bad profiles is the #1 complaint), format interoperability, input-gain calibration, commercial marketplace polish, hardware/software bridging |
| **One-knob / mix-ready** | Bogren **Ampknob** (one knob = finished tone, by a real producer), Fuse, Aurora DSP, MixWave | "Just give me a finished sound" is a proven, popular format | The *song-specific* version (see #199) |
| **Pedal / FX emulations** | MixWave (component-level models, licensed EHX bundle — Big Muff, Memory Man, Electric Mistress, Small Clone), Cytomic, Audiority, UAD, Brainworx, Free **BYOD** (modular distortion designer) | Circuit modeling of famous pedals | Design-your-own-pedal workflows, mods/schematic-level education, guitar-specific mixing (not pedal) tools |
| **Cab / IR** | OwnHammer, York Audio, ML Sound Lab MIKKO, Two Notes, every plugin ships a cab section | IRs are commodity; every loader does the job; IRDX-style dynamics exist | Measurement rigor, honest comparisons, IR creation made trivially easy, room/physics modeling beyond static IRs |
| **Virtual guitars (VIs)** | Ample Sound, Impact Soundworks Shreddage, MusicLab RealStrat, Orange Tree, Prominy, NI Session Guitarist, UJAM Virtual Guitarist, AAS Strum GS-2, Vir2 Electri6ity, free tiers (Shreddage 3 Stratus FREE, Ample M Lite II) | Sampled guitars + strum engines — mature, high quality | Turning **charts into performances** (#191), notation→audio (#192), guitar logic for non-guitarists (#196), adaptive accompaniment (#193) |
| **Guitar → MIDI / notation** | Jam Origin MIDI Guitar 2 (standalone + plugin; MIDI Guitar 3 in open beta at jam.live), free Dodo MIDI 2, Fishman TriplePlay (hw), Roland GK (hw) | Polyphonic conversion from a normal jack is solved *well enough* | Notation/tab *out*, teaching integration, performance logging, latency-aware workflow tools |
| **Live plugin hosts** | Gig Performer (~$170-ish, deepest for guitar rigs), MainStage (Mac), Cantabile, Ableton for the brave | Running plugins live with MIDI/footswitch control | Simplicity/price, setlist+tones in one place (#198), failover safety, web-based config |
| **Distribution & market** | Plugin Boutique, Plugin Alliance, MuseHub (new, pushes guitar plugins incl. AmpKit/Tonebridge), KVR buy/sell, Gearspace | Storefronts and sales | **License resale** (#203 — devs forbid it, iLok charges $25–50 transfers, buyers hate it), license hygiene (#204), blind-test purchasing (#206), audition-without-install presets (#207) |
| **DRM reality** | iLok (universal resentment, dongle/software/cloud flavors), Native Access, Arturia ASC, Codemeter, challenge/response | Nothing | A consumer-side organizer that makes multi-DRM life bearable (#204) is the only honest play — you can't fix third-party DRM by force |

**Business model reality check:** the plugin market is split between premium one-time purchases (Neural DSP ~$100–180/plugin, prosumer), **subscription suites** (STL AmpHub, Plugin Alliance Mega, Slate — steady revenue, fatigue is real), and **free/open** (NAM + TONE3000 + free IRs + free VIs) which has crushed the floor price of *tone*. Never compete on "tone"; compete on **workflow, trust, data, or community**.

**Legal note specific to plugins:** you cannot copyright an amp's *sound*, so capturing/profiling any amp you have access to is legally clean (ToneX/Kemper/NAM all live on this). But **brand names, logos, and trade dress** need licensing (that's why Softube has "Marshall Kerry King Signature" and MixWave has an official EHX deal), and **artist name/tone partnerships** are endorsement deals (the whole Neural DSP Archetype model). Two viable strategies: (a) license brands/artists like the big players, or (b) stay unbranded and lean on capture ecosystems + community trust.

---

## L1. Amp sims, captures & tone matching (171–180)

171. **Capture trainer for humans** — a GUI wizard that turns "record a sweep through your amp and upload it" into a guided 10-minute process with mic placement guidance, level-check (with clipping/silence detection), auto accuracy scoring, and one-click publish to TONE3000/your library. NAM's trainer is powerful but geeky; the friendlier half of the market still pays someone else to make captures.
172. **Capture quality score & vetting service** — measurement-based ratings for capture files: accuracy vs. the source audio, aliasing, noise floor, drift over the dynamic range, "does it clean up" — plus a badge system and a curated "proven" tier. The #1 ecosystem complaint is digging through piles of bad profiles. Charge creators for certification, users for search filters.
173. **Embeddable NAM player for the web** — a WASM player in a `<iframe>`/SDK so any forum post, preset pack page, or gear article can let you *hear* a capture without installing anything. TONE3000 auditions in-app; the open gap is a **portable, embeddable** player (think SoundCloud embeds for tones) wired into every community that argues about tone.
174. **Capture-format bridge** — best-effort conversion + matching between NAM, ToneX, Kemper, Quad Cortex, and AIDA-X profiles (train against the *other* format's output as ground truth). Not pixel-perfect, but "90% there in one click" beats re-capturing your rig for each ecosystem. Watch for manufacturer API access.
175. **Input-gain & impedance calibration tool** — the #1 cause of "my captures sound wrong": your interface's input level and impedance don't match the capturer's. A calibration routine that measures your rig against a reference DI level and hands you the trim + a per-pack correction note. Small tool, disproportionately valued; could become the industry's reference standard.
176. **Tone-lock matcher** — load any reference recording (or a YouTube link — your own copy), and the plugin continuously matches your DI's tonal curve to the target in real time (adaptive EQ + light dynamics + optional capture blend). For cover bands and "make my guitar sound like the record" practice sessions. Chordify-class utility, but for tone.
177. **Bedroom-volume re-profiler** — capture your amp screaming at 100 dB, then play a version corrected for how human hearing changes at low volume (Fletcher-Munson + speaker-cone behavior), so headphones/65 dB monitoring keeps the *perceived* attack, brightness and grind. Every apartment player's white whale.
178. **Amp-in-the-room headphone simulator** — beyond reverb: modeled early reflections, cab coupling to the floor/wall, and slight monitor bleed to kill the "dry, in-my-head" feeling of headphone practice. Pairs with #177; sells to everyone who plays after 22:00.
179. **Live-failover rig host** — a wrapper plugin/host that makes software rigs gig-safe: hot standby instance, crash auto-restart with crossfade, instant patch switching without clicks, and a panic "bypass to amp" button. Fear of laptops dying is *the* reason pros still tour with pedals.
180. **Interactive signal-path explainer** — an educational plugin: drag the delay before/after distortion, move the reverb to the FX loop, hear and *see* why tone changes; with built-in A/B and explanations. Sells to teachers and to every self-taught player who's never understood signal flow.

---

## L2. Guitar FX & mixing plugins (181–190)

181. **Guitar repair plugin** — de-noise made for guitar tracks specifically: finger squeaks, pick noise, fret buzz clicks, chair creaks, string rattle, breath-adjacent noises in acoustic takes. iZotope RX does this expensively and generically; nobody sells a $49 guitar-specific repair strip for bedroom producers.
182. **Single-coil hum & ground-loop killer** — adaptive 50/60 Hz fundamental + harmonics suppression that tracks changes and doesn't gut your highs; learns the hum's fingerprint from the silent gaps. P90/Strat players have been waiting forever; every general noise-reduction tool damages tone in the attempt.
183. **Mix-ready DI channel strip** — one plugin: gate → HPF → "seat in the mix" EQ (genre-aware, reference-informed) → compressor voiced for guitar → saturation → space. Competitor check: Sonible's smart range and GuitarStrip-style tools exist; the open lane is **reference-driven** ("match the guitar tone of this track's mix balance") at an indie price.
184. **Humanized double/quad tracker** — generates virtual doubles of your DI with realistic variation (timing jitter, micro pitch/tone drift, pick-attack variance, tiny arrangement differences). Producers do this by hand; the "one performance, four believable passes" plugin doesn't exist as a first-class tool.
185. **Preset loudness normalizer** — the live-set killer: measures the perceived loudness of every patch in your setlist and equalizes them (per clean/crunch/high-gain class), so switching from a Fender clean to a Recto doesn't blow the room's head off. Every gigging modeler user has this exact complaint.
186. **Parallel-chain phase & latency aligner** — auto-aligns the dry path, a re-amped path, a pedal-sim path and a reverb send so parallel guitar rigs don't comb-filter. Automatic delay compensation across *plugins and outboard* is still a manual stem-measuring chore.
187. **Feedback & sustain simulator** — controlled, musical feedback and infinite sustain for headphone practice and DAW recording. It's the one thing amp-in-room has that plugins can't fake, and nobody's shipped a convincing "hold a note at the amp and let it bloom" simulator.
188. **ABX blind-test rack** — a plugin that runs proper blind comparisons: your chain vs. reference, pickup A vs. pickup B, plugin X vs. plugin Y, with statistics over repeated trials and a public results database. Settles forum arguments with data, builds a trusted review brand, and monetizes as a purchase decision tool (ties #70).
189. **Re-amp session recall** — store DI track + full chain + every setting + gain staging as a recallable package so any session (yours or a client's) can be re-created byte-perfect years later, plus batch re-amping with per-song notes. Post-production guitar players juggle this manually across projects.
190. **AI "sit in the mix" assistant** — analyzes the whole mix and adjusts the guitar bus to fit (carving, level, dynamic control) with before/after and a plain-language explanation of what it did and why. The explainability is the product; "AI mixing" buttons that do magic silently are already distrusted.

---

## L3. Virtual guitarists & songwriting instruments (191–197)

191. **Chart-to-guitar performance** — give it a ChordPro/iReal Pro/lead-sheet chart plus a style ("90s alt-rock, jangly, capo 4"), get a realistic, humanized guitar part with correct voicings, sensible positions, and phrasing — no MIDI programming. Session Guitarist makes you choose patterns; this reads your *song* and performs it. This is the biggest structural gap in the VI category.
192. **Notation/tab-to-performance renderer** — import MusicXML or a tab file, get a rendered performance (humanized timing, position-based timbre, slide/legato noise, string thwack where appropriate). Game-changer for composers who write in notation, and for YouTube tab channels that want audio without recording.
193. **Adaptive comping instrument** — a virtual guitarist that **follows you**: listens to your tempo, dynamics and chord changes, and comps/improvises underneath in real time (jazz trio, singer-songwriter practice, worship). Existing "AI accompanists" are mostly groove-locked; this one is a true player. Hard, but the demo would break the internet.
194. **Guitar → notation/tab in real time** — the missing half of MIDI Guitar: play, and see a clean tab/notation page *of what you just played* (with position inference and technique detection), exportable. Teachers and composers would adopt it instantly; Jam Origin stops at MIDI output.
195. **Producer guitar-in-a-box** — for producers/composers who don't play guitar: genre + era + role (rhythm bed / lead hook / texture) + reference track → convincing part with tone, and a "guitarist would actually play it this way" constraint engine. Massive market (bedroom pop, hip-hop, sync/commercial work).
196. **Impossible-part preventer** — a guitar-logic layer for any VI or sequencer: flags fret spans your chosen player/position can't reach, suggests capo/tuning alternatives, picks idiomatic voicings. Sells as a plugin or as an API for VI makers; nobody wants to ship parts that guitarists laugh at.
197. **Performance-to-practice loop** — record yourself into the DAW, and the plugin prints a tab of your take, highlights where you were late/sloppy vs. the click, and creates tomorrow's practice loops from your actual mistakes (ties #30, #200).

---

## L4. Live, hosting & workflow (198–202)

198. **Setlist-driven rig host, simplified** — a cheap/simple Gig Performer alternative: web-configurable (build your rig in a browser, sync to the stage laptop), per-song patches, tempo, notes, and lyrics, footswitch navigation, with sane defaults. Deep-power hosts exist; the "I play 40 covers in a bar band" user is still running paper and preset fear.
199. **Setlist → tone auto-builder** — import your setlist (or a Spotify playlist), and the tool builds a plugin preset for each song matching the *recorded tone* via captures + EQ matching (#176), with notes on pickup/volume-knob settings. Cover bands would pay monthly for "sound like the record" in one click per song.
200. **Practice-coach plugin (inside the DAW)** — a monitoring plugin that scores each take against the click (timing distribution, pitch/bend accuracy, dynamics consistency, note-onset cleanliness), stores history, and builds a prioritized loop itinerary for the next session. Rehearsal becomes measurable without leaving the DAW; teachers can require it (ties #118).
201. **Studio guitar QC plugin** — runs over a tracking session and reports the boring-but-expensive mistakes: tuning drift per take, hum/EMI changes, clipping, string noise trends, pickup-switch clicks, inconsistent attack. Sends a written report to the producer. Studios pay per project, not per seat.
202. **Portable "tone patch" standard + converter** — an open JSON-ish format that describes an intended guitar sound (amp, cab, mic, settings, FX order, gain staging) *independent of vendor*, plus converters to load into any host/plugin. Every modeler pet; nobody's tried since Guitar Rig/Amplitube's dark ages. Standards plays are slow — but whoever lands it owns the interchange layer (ties #68, #174).

---

## L5. Plugin market, licensing & meta-tools (203–207)

203. **Plugin license resale marketplace with instant transfer** — the friction is absurd: iLok charges $25–50 per transfer, many devs forbid resale outright, buyers get burned on KVR deals with no escrow. A standardized, escrow-backed resale flow (with a dev-friendly policy page, transfer automation where APIs exist, and reputation for both parties) is a *trust* business, not a tech business. This is the single most requested unbuilt thing on audio forums.
204. **License locker + migration assistant** — scans your machine, catalogs every plugin license (iLok/cloud/challenge-response), tracks which machine each lives on, warns before OS upgrades / disk wipes, generates the deactivation checklist, and tells you which plugs you'd lose if you did the upgrade today. Pure painkiller; subscriptions and one-time purchases both feed it.
205. **Plugin subscription optimizer** — tracks what you rent (STL, PA Mega, Slate, own-brand subs), estimates cost per actual use from your DAW sessions, and says "you used AmpHub twice — cancel, you own Neural DSP already." Cost-optimization utilities convert well because they pay for themselves.
206. **Blind-test plugin finder** — a purchase-decision engine: run standardized DI/loop material through candidate plugins (offline renders, identical settings), present results **blind** with statistics (ties #188), plus "what you'd actually gain" analysis vs. your current setup. Affiliate revenue; earns trust precisely because it's not a review channel.
207. **Preset marketplace with audition-without-install** — preset packs (tones for NAM/ToneX/plugins) that you can *hear in the browser* on a standard DI (#173), filtered by guitar/pickup/genre, with one-click buy and automatic delivery into your player. Preset packs are sold today as blind Zip files + a YouTube demo; the audition layer is the entire product.

---

## Red oceans in plugins — don't

- **Another amp sim.** Neural DSP owns "premium feel," NAM owns "free and real," AmpHub/AmpliTube own "everything at once." The floor price of excellent tone is zero.
- **A cab IR loader.** Commodity; every suite includes one.
- **A tuner/metronome/drum-loop plugin.** Solved, free, everywhere.
- **General-purpose suites** competing with AmpliTube/Helix Native on breadth — you'll lose on catalog size, not quality.
- **Anything that fights DRM.** Build the *consumer-side* organizer (#204) instead; you can't win against iLok and you shouldn't try.
- **Paid "AI tone"** that isn't explainable — this niche is already distrusted; make the process visible (#176, #190).

---

## Plugin builder's toolbox

- **Frameworks:** JUCE (the default), iPlug2 (lighter, MIT), CLAP (open plugin format gaining adoption), VST3/AU/AAX via SDKs; use `pluginval` for validation and `clap-juce-extensions` for CLAP from JUCE.
- **Neural amp modeling:** NAM repo (MIT, A2 architecture, WaveNet; train with PyTorch on a GPU or via TONE3000's cloud/trainer), **RTNeural** for real-time inference in C++, **AIDA-X** for an open profiling alternative, ONNX Runtime / onnxruntime-web for cross-platform + browser inference.
- **Browser audio:** Web Audio API + AudioWorklet, WASM builds of your DSP, `AudioContext` lookahead scheduling for anything timing-critical.
- **DSP helpers:** ChowDSP (open-source guitar FX primitives: wave digital filters, TS-style clipping, plate reverb), Faust for rapid DSP prototyping → C++/WASM, kmol to transpile Faust into NAM-style pipelines.
- **Measurement/QA:** reamp box + DI reference loop, LUFS metering (libebur128), loopback latency measurement (the classic RTL utility), and your own ABX harness (#188) before you trust your ears.
- **Capture pipeline (server):** sweep file → user upload → cloud GPU train → accuracy score vs. source → publish NAM file. TONE3000 exposes an API for exactly this; build on it rather than rebuilding infra.
- **Distribution:** your own store (Gumroad/Paddle handle VAT), Plugin Boutique/MuseHub for reach, and a license backend that isn't iLok unless a partner demands it (offline challenge/response + reasonable activation limits keeps you on users' good side — see every KVR thread ever).
- **Data moats that matter in this space:** capture quality scores (#172), standardized blind-test results (#188/#206), and setlist→tone mappings (#199). None of these are the plugin; all of them make the plugin irreplaceable.

---

*Part 3 of 3. Parts 1–2 (ideas 1–170) cover apps, websites, tools and hardware. These three parts feed the master bank (next step, after your review).*
