# 🎸 170 Guitar App, Website & Tool Ideas — A Catalog

*Researched against the current landscape (Sept 2026). Every idea is numbered so you can just say "build #47."*

---

## 0. First, the landscape in one page

So you know what you'd be competing with — and where the bodies are buried.

| Space | Who owns it | The gap you can attack |
|---|---|---|
| **Beginner lessons** | Yousician, Fender Play, JustinGuitar (free), Simply Guitar, Guitar Tricks, Truefire, Gibson App, Synner | Everything is a walled-garden subscription. Nothing adapts to *your actual repertoire*. |
| **Tabs** | Ultimate Guitar (huge, ad-heavy, hated subscriptions), Songsterr (clean, pro tabs), Chordify, Guitar Pro, Soundslice, Chordie, 911Tabs, freetar.de | Every one of them lives under a copyright cloud. Nobody owns "legally safe tab content" — big opening. |
| **AI audio** | Moises, LALAL.AI, Demucs-based tools, Fadr, RipX, Chord AI, Guitariz | Stem-splitting is a solved commodity (even free). The unsolved part is *what you do with the stems*. |
| **Tuners/metronome** | Fender Tune (free), GuitarTuna | Dead-saturated. Don't. |
| **Ear training** | Functional Ear Trainer, EarMaster, ToneGym, Fretonomy, Tonedear | Almost none of it is *guitar-shaped* (in-position, on-instrument, through your own mic). |
| **Practice logging** | Instrumentive, Practice Time, Andante, paper journals | Fragmented, manual, boring. Nobody does *automatic* practice tracking. |
| **Gear market** | Reverb (price guide + Collections), eBay, GearBook, Reverb scrapers on Apify | Valuation exists; *decision support* ("should I buy/sell/mod this?") doesn't. |
| **Online jamming** | Jamulus (free, open source, low latency), JamKazam, Sonobus, Koord | Works but ugly, technical, and unfriendly. Nobody owns the *social layer*. |
| **Band/setlist tools** | BandHelper, Set List Maker, SetBook, OnSong, forScore, iReal Pro | Great for pros, intimidating for amateurs. Web-first + simple is open. |
| **Backing tracks** | Karaoke-Version, worship multitrack shops, YouTube loops | Legally licensed, *generated-for-you* practice tracks barely exist. |

The single biggest structural insight: **the guitar world runs on content it doesn't have the rights to** (tabs, backing tracks, lessons from songs). Products that sidestep that — generated content, public-domain content, tools that process *the user's own* files, or B2B tools — can be built by one person without a legal team. That's your lane.

---

## A. Learn & practice (ideas 1–26)

1. **Adaptive practice coach that listens to you play** — mic/webcam analysis of timing, chord cleanliness, and hand position; then it *rewrites tomorrow's practice plan*. The gap: every app gives feedback in the moment, none adjust the plan.
2. **Spaced-repetition for guitar** — Anki for repertoire: licks, chord shapes, songs resurface on a schedule based on how well you just played them (verified via mic). "Anki for guitarists" genuinely doesn't exist.
3. **Practice session auto-logger** — a passive desktop/mobile app that detects when you're playing (audio activity on your interface/mic), logs duration, tempo, and automatically saves your best take of each session. No more manual timers.
4. **"Guitar Wrapped"** — year-in-review of your playing: hours, fastest progression, most-played key, streak, before/after audio clips. Spotify Wrapped mechanics applied to practice; massively shareable.
5. **Weakness radar** — diagnostic test battery (chord changes, bends, barre stamina, string skipping, rhythm accuracy) → spider chart → targeted drill recommendations.
6. **Song-first curriculum** — you say "I want to play *Sultans of Swing*"; it reverse-engineers the technique tree you need and builds the lesson path. The anti-Yousician: your goal, not their syllabus.
7. **Exam prep companion** — Rockschool / ABRSM / Trinity graded guitar exams: syllabus tracker, sight-reading drills, aural tests, backing tracks per grade. Parents pay for anything with a grade attached.
8. **Comping trainer for jazz** — listens to your chord voicings, scores voice leading and time, generates a piano/bass comp partner in the standard's changes. (iReal Pro plays *at* you; nothing plays *with* you adaptively.)
9. **Triad / CAGED / inversion visual trainer** — map every triad inversion across string sets; game-ified; quizzes you on the fretboard with audio confirmation.
10. **Speed trainer with adaptive BPM ceiling** — detects your clean max tempo for a lick via mic accuracy, ramps you up in safe increments, backs off when it hears slop. "Guitar Gym" that's actually closed-loop.
11. **Alternate-picking & economy-picking coach** — uses audio + phone camera (MediaPipe-style hand tracking) to spot inefficient pick motion, tension, and anchoring problems.
12. **Posture & ergonomics webcam coach** — TV-angles on fretting wrist, shoulder hike, neck angle; nags you about the exact habits that cause tendonitis. Cheap to build now, nobody's done it.
13. **Sight-reading trainer for guitar specifically** — position-aware: it knows where a note *can* be played and scores you on sensible position choices, not just correct pitch.
14. **Rhythm-first beginner path** — guitar apps teach chords first; real pedagogy teaches time first. Clap/tap/play-along rhythm course with mic scoring. Whole niche unserved.
15. **Fingerstyle bootcamp** — thumb independence drills, Travis picking patterns, tab + animated hand overlays, scored through mic.
16. **Barre chord survival program** — graded 6-week course with strength/hand-fatigue tracking, arch checks, and micro-drills. The #1 beginner pain point, treated like physical therapy.
17. **Slide / lap steel intonation visualizer** — shows cents deviation live while you glide; teaches by ear + eye. Tiny market, zero competition, cheap to build.
18. **Kids' guitar adventure game** — mic-scored quests with a cartoon fretboard, 10 minutes/day, parent progress emails. (Simply Guitar is closest; nobody owns "for 6–9 year olds.")
19. **Senior-friendly beginner app** — giant type, slow tempos, chair-friendly posture, arthritis-adapted chord choices. Underserved and growing market.
20. **Classroom mode for music schools** — 20 students, one teacher dashboard: who practiced, who's stuck, auto-generated homework. Schools pay annually; students pay nothing.
21. **Practice accountability pods** — 4-person cohorts, weekly streak targets, shared progress feed, small stakes. Duolingo leagues for guitar, but sticky because of the people, not the points.
22. **"Play this in public in 30 days"** — an outcome-driven program: 5 songs, stage-ready, with a performance simulator (fake audience noise, pressure mode) at the end.
23. **Performance-pressure simulator** — rehearse with crowd noise, distraction sounds, red-light camera mode, cold-hands timer. Niche as hell; every gigging amateur needs it.
24. **Teacher-in-a-browser white-label** — any YouTube guitar teacher spins up their own branded lesson app (their videos, their students, their subscription) in an afternoon. You take a cut. B2B, no content rights needed from you.
25. **Duolingo-style daily riff** — 3-minute daily micro-lesson with streak, delivered by notification, scored by mic. "Wordle of guitar."
26. **Personal A&R** — declares you "ready to gig" / "ready for jazz band" after passing a real-world skill battery; a credential people put on their profiles. Credential = monetization.

---

## B. Tabs, notation & transcription (ideas 27–48)

27. **Public-domain songbook generator** — 12,000+ traditional/folk/hymn/Christmas/classical pieces are out of copyright. Generate clean, guitar-arranged tab + notation + audio for any of them. *Legally bulletproof tab content* is a genuine gap; every incumbent is exposed.
28. **CC-licensed tab commons** — Wikipedia for tabs: contributors license under CC, reputation and proofreading economy built in. Takes years, but it's a category nobody can sue you out of.
29. **"Genius for guitar tabs"** — annotated tabs: hover a lick and get theory, technique, tone notes, historical context, player commentary, community video links. Tab sites are still 2004-quality documents.
30. **Audio → tab transcriber for your own recordings** — record yourself, get a rough tab of what you actually played (not what you meant to play). Basic Pitch/melodic transcription tech is mature enough for monophonic and clean-ish leads.
31. **YouTube-to-practice-loop** — paste a link, auto-detect beats, snap loops to bars, stem-ish EQ, slow down, and *optionally* overlay auto-generated tab. looptube.io does part of this; the polish isn't there.
32. **Tab error detection** — crowdsourced + algorithm cross-check of Ultimate Guitar's user tabs: flag wrong chords against audio analysis, show a "confidence score" per section. Sells trust, not content.
33. **Know-your-rights tab grader** — a tool for tab authors: upload your transcription and the audio; it checks whether you've copied a *published* arrangement (illegal) vs an original transcription of the composition (allowed-ish), and generates a licensing checklist. Unsexy, useful, blue ocean.
34. **Official-license aggregator** — one search, shows you *where* to legally buy each song's tab (Musicnotes, Sheet Music Direct, Hal Leonard) with prices compared. Referral revenue, zero rights risk.
35. **Simplifier** — paste any chord chart (from anywhere, your own copy), get an auto-rewrite to 4 open chords that preserves the melody. Killer adult-beginner feature. (Personal-use processing avoids the hosting problem.)
36. **Single-string / 2-note tab for kids and accessibility** — simplifies any melody to playable note-by-note lines. Teachers order these in bulk.
37. **Nashville Number System converter** — instant NNS ↔ chord chart ↔ transposed key, plus capo calculator, plus "what key is the singer going to ruin this in" slider. Small but beloved by gigging musicians and worship teams.
38. **Worship transposer + multitrack player** — song's original key, your singer's key, click vs no click, pads, chart in Nashville numbers; multi-track style stems per instrument. Worship market pays well and churns fast.
39. **Capo intelligence** — "capo 3, play in G shapes, actual key Bb" explained visually on a fretboard. The music-theory education nobody gives beginners, packaged as one widget.
40. **Alternative tuning chord library** — DADGAD, open G, open D, drop C, plus chord shape finder and drone-backing per tuning. Slide/folk/Celtic players have almost nothing.
41. **Tab + video sync editor** — creators upload a performance video and a tab; the tool makes them scroll in perfect sync (this is Soundslice's turf, but the *creator-tool* version for Instagram/TikTok clips is open).
42. **Vertical-video tab player** — TikTok/Reels-format tab playback: 15-second riff, tab animating over the clip. Distribution channel + content format in one. Rides an existing wave.
43. **Handwritten tab digitizer** — photo of your paper tab → clean digital tab. Luthiers and old-school players have boxes of this stuff.
44. **Screenshot/PDF chord chart cleaner** — takes the janky 2007-era chord page you found and reflows it into a proper, printable, transposable lead sheet. "This, but not ugly."
45. **Smart songbook binder app** — every chart you own (PDF, ChordPro, text, screenshot) in one library, auto-transposed, auto-scrolled, foot-pedal controlled, searchable by feel ("that One Direction-ish song for the wedding"). ForScore/BandHelper do this for pros; nobody does it for the casual player.
46. **Pro tab marketplace with escrow + quality guarantee** — vetted transcribers set prices, buyers get a refund if a pro reviewer confirms errors. Fixes the #1 complaint about *all* tab sites. (Rights risk: needs careful framing as commissioned original transcriptions, and you must actually do the legal homework.)
47. **Transcription-request marketplace** — "tab this 12-bar solo from a 1974 live bootleg" posted with a bounty; transcribers compete. Niche songs, big waitlists, no existing home.
48. **Notation-to-fretboard-position advisor** — import MusicXML of a piece and get recommended fingerings/positions for your hand size and skill level. (Classical guitarists do this by hand for hours.)

---

## C. Ear, rhythm & timing (ideas 49–62)

49. **On-instrument ear trainer (through your mic)** — hear a note, *play it back* on your guitar, get scored. Ear training apps use buttons; the skill you actually need is ear→hand. Almost nobody closes that loop.
50. **Functional ear trainer for guitarists** — scale-degree training but the answer is *fretboard position*, in your key of the day, with guitar timbre. (Functional Ear Trainer is the goat; it's piano-shaped.)
51. **Call-and-response phrase game** — app plays a 2-bar phrase, you echo it; phrases grow in length and harmonic complexity. Jazzers use this with teachers only.
52. **"Name that riff" multiplayer quiz** — guess the song from a riff; play along to prove it. Trivially viral, genuinely fun at parties and on Twitch.
53. **Groove scoring** — play a groove against a drum loop, get a millisecond-level timing report: are you ahead, behind, uneven, rushing bar 4? Quantify "pocket." Drummers have this; guitarists don't.
54. **Listening metronome** — it hears you and speeds up when you're solid, slows down when you're struggling, and occasionally *goes silent* to test your internal time. The metronome's first real innovation in 200 years.
55. **Polyrhythm playground** — 3:2, 4:3, clave, son, rumba patterns over a backing groove, scored. Rhythm players would pay.
56. **Subdivision trainer** — 8ths → 16ths → triplets → swing, with visual pulse and error highlighting. "Why do I rush every solo" solved.
57. **Rushing/dragging detector for recordings** — analyze a take you recorded in your DAW; get a bar-by-bar timing heatmap and the exact spots to loop.
58. **Hearing-protection meter** — live dB meter for band practice with a "you're at 98 dB, that's a 90-minute budget" warning and earplug recommendations. Public-health angle, physical product tie-in.
59. **Closed-loop intonation tuner** — not just tuning: checks pitch at open/12th/other frets and diagnoses saddle, nut, and neck issues, then gives the adjustment recipe. (See also #131.)
60. **Bend trainer** — target note shown, your bend measured in cents in real time, held for 2 seconds = pass. Absolute killer for lead players and it's a mic + autocorrelation problem.
61. **Vibrato quality coach** — measures rate, width, consistency of your vibrato vs. your favorite players' profiles. Unbelievably niche. Unbelievably loved by blues players.
62. **Transcription bootcamp** — progressively unmutes stems of a song as you correctly identify chord changes you play on your instrument. "Learn songs by ear" as an actual workout routine.

---

## D. Tone, gear & effects (ideas 63–84)

63. **"How do I get this tone" search engine** — describe or play a recording; get pedal order, amp settings, pickup position, EQ curve, and a shopping list at three budgets (cheap copy, mid, the real thing). Google-able via SEO, monetizes via affiliate.
64. **Browser amp sim + FX chain** — full guitar rig in the browser (neural amp models via WebAssembly + Web Audio), drag-and-drop pedalboard, shareable preset links. Latency is the enemy but interface + desktop app wrapper solves it. Nobody's nailed the *shareable rig* layer.
65. **Pedalboard planner that also listens** — plan the board, then A/B compare a recording of your rig before/after the imagined change (EQ-matched simulation). Reverb's "my board" tools are static.
66. **Tone capture compare tool** — record a dry DI, run it through your Kemper/ToneX/plugin, and A/B against the original for residual error. Pro-grade nerd tool, small but passionate market.
67. **IR (impulse response) manager & marketplace** — organize, audition, and buy cab sims; preview before buying via a free demo DI. Existing IR marketplaces have terrible UX.
68. **Preset exchange + auto-converter** — share presets across Helix / Quad Cortex / Kemper / ToneX / plugins; semi-automatic matching (gain structure, EQ, delay/reverb params). Users beg for this on every modeler forum.
69. **Settings database by song** — community-verified amp/pedal settings for famous songs, with audio proof and version votes. ("Sultans of Swing = set delay to 420ms, mix 30%...") 
70. **Gear A/B blind test site** — post two clips, everyone guesses which is the $3,000 rig; results feed a public database of "does gear X actually sound different." Viral, evergreen, ad-friendly.
71. **Pickup comparison library** — properly recorded DI samples of 500+ pickups in the *same* guitar through the same chain, with blind-test player. Nobody's done this rigorously; every forum thread demands it.
72. **"Is this amp/pedal worth it for me?" advisor** — inputs: your genre, room, volume constraints, budget, existing rig; output: scored recommendations with reasons and used-market prices. Decision support, not listings.
73. **Apartment-volume tone solutions** — curated catalog + simulator: what your tone sounds like at 65 dB, with attenuation/load-box/headphone solutions ranked. Urban players' #1 constraint, nobody addresses it head-on.
74. **Pedal price watch + deal scorer** — alerts with "this is 18% below the 90-day median for this pedal in this condition" + condition-adjusted fair value. Reverb's new-listings firehose exists; *judgment* doesn't.
75. **Gear flips tracker** — bought/sold log with profit, fees, shipping, taxes, and a "was it worth my time" hourly-rate calculation. GAS meets accounting.
76. **Wiring diagram generator** — pick pickups (HH, HSS, P90), switches, and the mods you want (coil split, out-of-phase, blower, treble bleed) → clean diagram + parts list + pickup selector truth table. Every mod forum question ever asked, productized.
77. **Guitar mod simulator (visual)** — 3D-ish preview of your guitar with hardware/finish/pickup swaps and a "resale impact" note. Warmoth-style Kisekae builder, but modern and shareable.
78. **Parts compatibility checker** — "will this neck fit this body?" — the bane of every partscaster builder. A structured database + fit rules. Unglamorous, high SEO value, affiliate revenue.
79. **Setup wizard** — guided truss rod / action / intonation workflow with phone-camera measurements (string height, relief via a card reference), humidity logging, and a printable setup sheet. Millions of searches, zero good tools.
80. **String-life tracker** — log string changes, brand/gauge/coating notes, hours played (from #3!), tone-degradation notes; tells you when to change based on your own data. Cheap to build, feels magic.
81. **Humidity & climate watch** — link a $20 BLE hygrometer; log temp/humidity next to your guitars; warn before cracking season; track which of your guitars likes which setup. Luthiers sell this advice for $80/hour.
82. **Tone diary** — every practice session: record 60 seconds, tag the rig/room/settings, and later search "that clean sound from March." Replaces the folder of unlabeled phone memos every player has.
83. **Cable/power/board financial planner** — total cost of the pedalboard you're building, including the $90 you always forget for a proper isolated power supply. Playful GAS management. ("Pedalboard Cost Calculator" gets searched a lot.)
84. **Modeler preset "translation loss" explainer** — visual tool showing how a real amp's signal chain maps to your modeler's blocks, so you can recreate presets by understanding rather than copying numbers.

---

*(continues in part 2 →)*
# 🎸 170 Guitar Ideas — Part 2

---

## E. Songs, songwriting & creativity (ideas 85–100)

85. **Idea vault with hum-to-chords** — record a hummed melody or half-formed riff on your phone; the app detects key, tempo, and suggests chord progressions that fit, then tags it by mood/jam-ability. Every songwriter has 400 voice memos and no system.
86. **Voice memo → lead sheet** — hum it, get a lead sheet with chords, lyric placeholder, and a simple arrangement. (Automating transcription + chord detection + notation in one flow is fresh even though the parts exist.)
87. **Progression generator by feeling, not theory** — input "melancholic but hopeful, DADGAD, for a wedding" → 5 progressions with fingerings, audio, and why they work. Theoretically literate, emotionally searchable.
88. **Song structure sandbox** — drag intro/verse/chorus/bridge/solo blocks and hear generated backing in your key; write by arrangement first, chords second. Songwriting tools are stuck on chord grids.
89. **Backing track generator (legally safe)** — enter your chords (or a ChordPro file) → get studio-ish drums/bass/keys in any genre and tempo, with count-in, fills, and sections. **You own the output, so it's 100% license-safe.** This is the strongest "generated content" play on this list (see Top 10).
90. **Adaptive backing band** — AI bassist/drummer that follows *your* tempo and dynamics rather than forcing a grid. Extremely hard, extremely valuable. Start monophonic (it just follows your chord changes).
91. **Backing tracks marketplace, stems per part** — guitar-muted vs bass-muted vs keys-muted versions of the same track, licensed properly. Worship multitrack shops prove people pay; nobody's serving the pub-rock covers crowd.
92. **"What key is this song" from a playlist** — scan a Spotify playlist, get keys/tempos/capo suggestions for each, and a setlist ordered by flow (energy arc for a wedding, chill arc for a dinner set).
93. **Set-energy planner** — models the emotional curve of a live set, warns about three slow songs in a row, suggests key transitions that don't wreck your singer. Wedding/function bands would pay monthly.
94. **Arrangement adapter** — "I have a solo acoustic act, adapt this 6-piece song" → arrangement for voice + guitar with part reduction suggestions. Cover bands and buskers live on this.
95. **Lyric + chord sheet designer** — beautiful, printable, stage-glanceable charts (large chord fonts, section colors, no page turns). Musicians still print ugly Word docs.
96. **Copyright-safe cover-song planner** — helps you build a covers set with proper licensing (venue vs CCLI vs streaming), tracked per song. Boring, real, and nobody wants to build it — which is why it'd be respected.
97. **Moodboard → tone recipe** — upload 3 reference tracks, get a shooting brief for your bandmates: tempo range, tone targets, arrangement references. For bands that can't explain what they want.
98. **Collaboration whiteboard** — shared song workspace: chord charts + lyric edits + phone recordings + version history, built for bands (Google Docs for songs). Google Docs is *sort of* used for this, which means it's validated and unloved.
99. **Riff variation engine** — take a 4-bar phrase you recorded; generate 10 variations (rhythmic displacement, octave, inversion, modal shift) as tab + audio. Writing partner that never judges.
100. **Lyric-syllable stress checker** — paste lyrics + melody, see where stresses fight the rhythm before you record. Songwriting's least-taught, most-audible mistake.

---

## F. Playing with others: jamming, bands, gigs (ideas 101–116)

101. **Jamulus with a face** — the low-latency engine is free and open source; the UX is from 2011. A polished social front-end (rooms, genres, skill tags, scheduled jams) is a real product. (Latency reality: wired connections only — design around it, don't fight it.)
102. **Find a jam session tonight** — map of open mics, blues jams, and porch pickers near you with level labels ("beginner-safe"), plus a check-in so you don't walk into an empty bar. Local + social = defensible.
103. **Find bandmates with real filters** — not "guitarist, 34." Filter by influences, gear, availability, ambition level (hobby vs gig), and *reliability history* from past bands. Bandmix-era sites are dating apps without the trust layer.
104. **One-click virtual open mic** — scheduled 10-minute video slots, low-latency audio path, audience tipping, replay clips. COVID-era platforms died; the habit of watching strangers play survived on TikTok Live. Pick the format up properly.
105. **Rehearsal room finder & booker** — inventory of local studios with hourly booking, noise-limit info, and gear lists. It's still done by phone calls in 2026.
106. **Gig marketplace for amateurs** — wedding/corporate/bar gigs posted, local bands bid, contracts and deposits handled. Vast, fragmented, done on WhatsApp.
107. **Dep musician network** — "our guitarist is sick tonight" → verified local deps who know the 40-song covers set, ranked by how fast they learn. Cover bands would pay per successful booking.
108. **Setlist co-editing for the band** — everyone edits in real time, votes on songs, and the drummer always has the final version. Small, sharp, underserved by BandHelper's phone-only model.
109. **Rehearsal recorder + auto timecodes** — records 3-hour practice, auto-splits by song (via silence + setlist match), tags each take, exports notes per song. Bands leave rehearsal with 12 notes and no recordings, every time.
110. **Band admin in a chat app** — gigs, payouts, mileage, gear checklists, availability — as a bot inside WhatsApp/Discord/Messenger instead of yet another app nobody opens.
111. **Multi-track rehearsal recorder** — record rehearsal through an interface with per-member stems, auto-mixed, private per-member share links ("here's your bass line, it was flat in the chorus"). 
112. **Live stream kit for local gigs** — one-box solution: phone + interface + this app → multi-cam, proper audio mix, tip link, and a venue page. Bars want streams; nobody sells them a package.
113. **Busker toolkit** — repertoire manager, tip QR with live totals, set timer, spot rotation map, weather + foot-traffic forecast, "best pitch in this city" data. There's a real community of full-time buskers with zero purpose-built software.
114. **Tribute-band toolkit** — reference recordings, note-perfect tab, tone notes, costume/backdrop checklists, and a gig-ready stage plot. Tiny niche, extremely high willingness to pay.
115. **Find-a-teacher with trial automation** — search by genre, area, online/in-person, price; first lesson booking + payment + reminder automated. MusicTeacher's Helper is dated; marketplace giants are generic.
116. **Music school open house tool** — trial-class registration, instrument matching quiz for parents, follow-up sequences. B2B, boring, profitable.

---

## G. Teachers, schools & studios (B2B — quieter money) (ideas 117–130)

117. **Studio OS for independent guitar teachers** — students, scheduling, payments, lesson notes, recordings, repertoire tracking, and an auto-generated "what to practice this week" per student. The incumbent tools are Excel + email.
118. **Homework that grades itself** — the teacher assigns "play this chord chart at 80 BPM"; the app records and scores the student's attempt; the teacher sees the waveform-level detail before the next lesson. Cuts the boring half out of every lesson.
119. **Student progress video timeline** — every lesson, a 30-second clip; the student's own before/after video is the retention mechanism no course platform has.
120. **Practice accountability for kids (parent view)** — parent dashboard with honest practice time (from #3's detection, not self-reporting), plus printable star charts for the fridge. Parents pay more than students.
121. **Method-book companion app** — every best-selling guitar method book (Hal Leonard, Mel Bay) gets an app companion with audio, video, and feedback. Publishers need digital; you license the books instead of the songs. B2B2C.
122. **Classroom quiz show** — teacher projects a chord/note/rhythm question, students answer on their phones *and* on their instruments. Kahoot for guitar class; schools buy site licenses.
123. **Recital & ensemble manager** — recital programs, group rehearsal schedules, sheet distribution, and audience ticketing for music schools.
124. **Sub/cover-lesson marketplace for teachers** — teachers trade substitute cover when sick; schools find emergency instructors. Real pain, tiny obvious product.
125. **Teacher's tab tool** — a teacher types in a piece and instantly prints 4 differentiated versions (tab, notation, simplified, one-string) for the students in the room. 
126. **Skill assessment service** — a structured 20-minute video assessment by a human pro, with a written 3-month plan. Sells at $39–79; scales with a bench of teachers; marketplace of assessors.
127. **Course platform for YouTube guitar teachers** — white-label membership site with lesson embedding, progress tracking, tab viewers, drip schedules, and payments. (Teachable is generic; this is vertical.)
128. **Exam/audition mock service** — a human examiner over video scores your mock graded exam like the real thing. Niche, high-margin, zero inventory.
129. **Music-school lead-gen site engine** — SEO-optimized local pages ("guitar lessons in [city], [instrument]-specific, with pricing and reviews") built for schools. Agency-style recurring revenue.
130. **Teacher's arrangement service** — teachers commission custom arrangements of school-appropriate songs (public domain / licensed) from a bench of arrangers. Fixes a weekly headache.

---

## H. Collectors, luthiers & gear commerce (ideas 131–146)

131. **Repair diagnostic wizard** — "it buzzes on the 7th fret of the G string only when I bend" → guided flow → likely causes (relief, high fret, nut slot, saddle) with confidence levels and a fix order. WebMD for guitar problems. Massive SEO surface, near-zero build cost, trusted-authority brand play.
132. **Serial number decoder** — Fender/Gibson/Ibanez/Gretsch → year, factory, model line, and "this doesn't match what it claims to be" flags. Reference tool that earns links forever.
133. **Fake-detection assistant** — photo-guided checklist + ML comparison against known authentics; for the Chibson era. Buyers pay per check; sellers use it as a badge.
134. **Collection manager with insurance reports** — photos, serials, receipts, valuation history, and a printable insurance schedule. Reverb's Collections is close but it's shop-linked; independents want neutral.
135. **Valuation cross-check** — median of Reverb sold + eBay sold + dealer listings + auction, condition-adjusted, with trend line. GearBook-style but with a real "fair value today" number and a confidence interval.
136. **Estate liquidation helper** — "dad left 14 guitars and a workshop" → identify, value, photograph, and list step-by-step with a fee-vs-speed tradeoff, plus a bench of buyers who'll take the whole lot. Real grief-adjacent problem, entirely unserved.
137. **Luthier business toolkit** — job intake, quotes, work orders, photo timeline of a repair, customer approvals, and pickup scheduling. Repair shops run on paper tickets.
138. **Repair lead market** — "needs a refret, Athens GA" → matched to luthiers with wait time and price ranges. Reverb owns selling; nobody owns *fixing*.
139. **Parts scavenger** — saved searches across Reverb, eBay, forums, and shop inventories for the one 1963 tremolo arm you need, with instant alerts. Hobbyist-with-a-project has no good tool.
140. **Vintage gear provenance tracker** — attach photos, receipts, service history, and prior owners to a serial number; the "Carfax for old guitars." Ownership chain raises resale value — players would pay to register.
141. **Rental marketplace P2P** — rent a Rick from a neighbor for the recording session; deposit + insurance + calendar built in. Companies do this; individuals can't.
142. **Studio & backline marketplace** — local studios rent amps/cabs/mics by the day with delivery; booking, calendar, and damage waiver handled.
143. **Gear insurance quote comparison** — musical-instrument-specific policies quoted side by side, with collection-value inputs from #134. Affiliate revenue, pain is real (standard home insurance excludes gigging gear).
144. **Shop inventory syndication** — small brick-and-mortar shops get their (usually ancient) inventory onto Reverb/eBay + their own Google-indexed storefront, auto-synced. Shops pay monthly; you fix a dying-channel problem for them.
145. **Local shop events engine** — clinics, jam nights, repair days promoted to the local guitar population; shops pay to fill rooms. Also a nice wedge into 144.
146. **Guitar show & event calendar** — the guitar-show circuit (Dallas, Arlington, etc.), local swap meets, and the "what's worth driving to" filter. Community glue, sponsorship revenue.

---

## I. Fun, social & gamified (ideas 147–158)

147. **Riff battles** — 15-second video riff, head-to-head bracket voting, weekly themes. TikTok mechanics, guitar-specific container, leaderboards by genre.
148. **Daily riff streak + duet** — a riff drops every day; you post your take and duet anyone else's. Streaks + duets = the retention engine every lesson app wishes it had.
149. **Tab karaoke** — social play-along rooms where everyone plays the same song together on mute, scored, and the leaderboard updates live. Rocksmith's multiplayer, browser-based, no copy protection problems if the songs are yours.
150. **Multiplayer fretboard quiz** — real-time "name this note / find this interval" battles with a global ladder. Fretonomy-style content, but as a live sport.
151. **Guitar idol / feedback game** — record a 60-second performance, get scored by an audio model *and* community votes; weekly winners get gear-prize sponsorship. Brands will sponsor to reach buyers.
152. **Progress NFT-free trophy room** — badges for real, verifiable achievements ("you can now play barre chords in every key," "5 songs stage-ready") with SVG trophies you can share. Cheaper than it sounds, addictive for the 12–24 segment.
153. **Practice-with-me live streams** — scheduled synchronized practice sessions; everyone mutes but plays together on a shared timer, with a host. Body-doubling for guitarists. Costs nothing to build.
154. **"Guess the guitarist"** — audio quiz using *your own* recordings you submit ("name the player from their vibrato"). Fun, cheap, community-fed.
155. **Local guitar club OS** — run a meetup: RSVPs, theme nights, chord charts, member levels, and a photo feed. Meetup.com is generic; clubs are the actual unit of community.
156. **Riff swap** — send a 4-bar riff to a stranger; they send back a second layer (bass, harmony, drums). Collaborative music-making without needing a band or a bandmate.
157. **Practice pot** — small stakes money/points: hit your weekly practice target or pay into the group pot that funds the winner's gear. Commitment devices work; nobody applies them to guitar.
158. **Kids' band league** — teams of 4 (guitar/bass/drums/keys), weekly missions, inter-school competitions. Turns the app into a social program parents organize around.

---

## J. Hardware, IoT & unusual interfaces (ideas 159–166)

159. **Practice detection sensor** — a tiny clip-on IMU or a mic-based desktop app that turns "did you practice?" from self-report into fact. Powers #3, #120 and every parent/teacher sale.
160. **Smart pick tracker** — BPM, accuracy, and picking-hand motion logged from a sensor-equipped pick. Kickstarter bait, but the data could actually teach.
161. **Foot controller / page turner** — universal Bluetooth page-turn + preset-change pedal with a web-based configurator. Hardware margins, small but needy market.
162. **Wearable tension coach** — EMG/IMU band that buzzes when your fretting hand over-grips. Physio angle; enormous for injury prevention in serious players.
163. **Adaptive instrument interface** — software for one-handed players, or players with hand differences: alternate tunings + tapping layouts + chord simplification. Accessibility is a small market with real funding and press.
164. **Smart capo** — detects position, tells the app so charts transpose themselves, plus a glow for the next change. Silly? Yes. Kickstarterable? Absolutely.
165. **Loop pedal companion app** — manage loops, export them to your DAW, and visualize the layers; syncs with existing pedals via MIDI.
166. **Robotic amp attenuator** — nah, but the *software* version: profile your amp at bedroom volume and re-EQ it to match the sound it makes at 100 dB. The "apartment cab" app problem, solved by DSP.

---

## K. Wildcards & moonshots (ideas 167–170)

167. **The anti-app: a printed practice journal that syncs** — beautiful paper log with QR codes that OCR into your dashboard. Paper is what serious players actually use; hybrid is unclaimed.
168. **Guitar teacher in a box for parents** — subscription box: printed songbook (public domain), picks, sticker chart, and a 10-minute daily video curriculum. Physical + digital; grandparents buy these.
169. **Open tab format & viewer SDK** — an open, commentable, playable tab format (alphaTab-adjacent) that every small site embeds for free; you monetize hosting and analytics. Infrastructure play; slow, strategic, respected.
170. **"Guitar genome"** — crowdsourced database of every guitar model's specs (neck profile, weight, scale), linked to the pickup library (#71) and tone references. Built over years, becomes the industry reference everyone cites.

---

## 🏆 If I were you: the Top 10 shortlist

Ranked by *(gap in market) × (feasible solo) × (people would pay)*.

| # | Idea | Why now | Build effort | Money |
|---|---|---|---|---|
| **89** | **Generated backing tracks** | AI music gen makes legal, owned, custom jam tracks possible; every existing option is either unlicensed (YouTube) or expensive per-track | Medium | Subscriptions + teacher/school bulk |
| **3** | **Auto practice logger + Wrapped (#4)** | Zero direct competitors; passive tracking is a novel wedge into the biggest user base (hobbyists who don't finish courses) | Medium | Freemium → insights/coaching |
| **62/49** | **On-instrument ear & transcription trainer** | Ear training is a proven paid category, and nobody closes the ear→hand loop through the mic | Medium | Subscription, strong retention |
| **131** | **Repair diagnostic wizard** | Millions of search queries/year, zero good tools, near-zero build cost, builds a trusted brand you can expand from | **Easy** | SEO → affiliate + lead-gen for luthiers |
| **27** | **Public-domain songbook generator** | 100% legal content in a category where everyone else is legally exposed; timeless evergreen SEO | Easy–Med | Subs + print-on-demand books |
| **36/35** | **Simplifier for beginners** | "Play this song with 4 chords" is what adult beginners endlessly want and nobody ships | Easy–Med | Freemium |
| **31** | **Polished YouTube practice-loop tool** | looptube exists but rough; bar-accurate looping + slowed audio + optional tab overlay is a killer free tool with a paid tier | Easy–Med | Freemium → Pro |
| **103** | **Bandmate finder with trust layer** | Existing sites are ancient; reliability/ambition filters solve the actual failure mode of every band | Medium | Freemium + boosting |
| **105/106** | **Local rehearsal/gig marketplace** | Still organized by phone calls and WhatsApp; local liquidity is a moat once you win one city | Medium–Hard | Take rate |
| **147/148** | **Riff battles / daily riff streak** | Distribution-first product; rides short-video behavior; content is user-generated so no rights problem | Medium | Brand sponsorship |

**My single strongest recommendation: #89 (generated backing tracks).** It's the rare idea that is *legally clean* (you generate the audio, user owns it), *painfully needed* (everyone practices with sketchy YouTube loops), *feasible now* (melody/chord conditioning + stem generation models are commodity), and *monetizable from day one* (musicians already pay per backing track). Add #31 (YouTube looping) as the free acquisition funnel, and #3 (practice logging) as the retention layer — that's a coherent company, not just an app.

**Second strongest, if you want the easy win: #131 (repair diagnostic wizard).** A weekend of content structure, a decision tree, brilliant SEO. It won't be a unicorn but it will earn money, teach you the audience, and it can grow into #134–145 (the whole collector/luthier economy) where the real money is.

---

## ⛔ Red oceans — don't bother

- **Tuners** (Fender Tune is free and fine), **metronomes** (solved), **chord diagram lookups** (solved)
- **Another Ultimate Guitar clone** — you'd fight a legally-exposed incumbent with more content than you'll ever have
- **Stem separation** — Demucs-based tools are free/cheap everywhere, including in-browser (Guitariz Studio)
- **Generic beginner lesson apps** — Fender Play, Yousician, JustinGuitar (free), Simply Guitar own this; you need a wedge (kids, accessibility, exams, song-first)
- **Anything requiring a licensed catalog** as your core value (tabs of copyrighted songs, official backing tracks) unless you're ready for publisher negotiations
- **A "social network for musicians"** with no single-player utility — they always die; the successful ones are tools that happen to be social (see #147)

---

## 🧰 The builder's toolbox (what to actually build with)

**Audio in the browser**
- **Web Audio API** — the whole rig: metronome, tuner (via autocorrelation/YIN pitch detection), amp sims, effects chains, playback with time-stretch (via `AudioWorklet` + a phase-vocoder or Rubber Band WASM)
- **WebAssembly ports** — Rubber Band (time-stretch), Faust/SoundTouch (FX), neural amp models (NAM / RTNeural) for real amp sims in-browser
- **Pitch/onset detection** — YIN/pYIN, CREPE, Spotify **Basic Pitch** (monophonic + polyphonic transcription, runs in browser)
- **Stem separation** — **Demucs** (htdemucs) self-hosted or Replicate/Modal; Meta's models are the commodity layer
- **Timing accuracy** — your metronome *must* run in an `AudioWorklet`/scheduled-ahead `AudioContext` time, not `setInterval`. This is the #1 thing hobby projects get wrong.

**Tabs & notation**
- **alphaTab** — mature open-source library: render + play Guitar Pro files in the browser, looping, tempo, transposition, techniques (bends, slides, palm mute)
- **MusicXML / compressed `.mxl`** — the interchange format; **Guitar Pro `.gp/.gpx`** for serious users
- **ChordPro** and **iReal Pro** formats for lead sheets/chord charts
- **VexFlow / OpenSheetMusicDisplay** for standard notation on the web

**Audio analysis for features**
- **Chord recognition**: template matching on chroma (librosa-style, or JS) for simple stuff; HMM smoothing for real songs
- **Key/tempo detection**: essentia.js, or server-side with librosa
- **Video pose**: **MediaPipe** (hands/pose) in-browser for technique coaching (#11, #12)

**Backend (keep it boring)**
- Postgres for anything relational (gear inventories, collections), object storage for audio, a job queue for anything that takes >2s (transcription, stem splitting), and a CDN for audio delivery (range requests matter for scrubbing)
- Stripe for subs; Cloudflare R2/Bunny for cheap audio egress; Supabase/Neon if you want velocity

**Hardware/data moats**
- For gear databases (#71, #134, #170): your moat is *structured, verified data*, not code. Budget for data entry, and consider paying a small bench of knowledgeable contributors (credits + cash) rather than scraping badly.

---

## ⚖️ Legal reality check (read this before building anything tab/backing-track-adjacent)

- **Hosting someone's transcription of a copyrighted song is legally shaky.** User-submitted tab sites live in a grey zone built on DMCA safe harbors, ratings, and tolerance. Reproducing a *published arrangement* is worse than transcribing a composition yourself. Two dominant free-tab platforms have been navigating this for 20 years — that tells you it's survivable, not that it's clean.
- **Safe lanes:** (a) public-domain and CC content (#27, #28), (b) processing the *user's own* files on your service (#31, #35, #36), (c) generating new audio from chord input (#89), (d) tools and data about gear/technique (#63–84, #131–146), (e) B2B tools for teachers/luthiers/shops.
- **Backing tracks generated from a user's chord chart are yours-and-theirs** — no publisher in the loop. That's the whole reason #89 is the top pick.
- **If you want the licensed route:** Mechanical licenses for *you performing covers* can be obtained relatively cheaply (e.g., via HFA/MLC-adjacent services, Easy Song, DistroKid's cover licensing). Rights to use *the original master recording* are a different, much more expensive negotiation (Harry Fox-adjacent vs. master use). Don't confuse the two.
- **Naming:** don't put a brand (Fender/Gibson/Spotify/YouTube) in your product name. "Works with" is fine; "for" is a lawsuit magnet.

---

## 🗺️ How to pick (a 20-minute decision process)

1. **Distribution test:** can you reach 1,000 of these users in a week without paying for ads? (Reddit r/guitarlessons, r/Guitar, r/guitarpedals, r/luthier; YouTube guitar teachers; local shops/schools; TikTok.) If no → park it.
2. **Wednesday-night test:** would someone use it mid-practice week, not just on day one? Tools yes; quizzes no.
3. **Wedge test:** can you ship something *useful* in 2 weeks and expandable in 6 months? (#131 ships in a weekend; #170 takes years)
4. **Money test:** is there an existing budget line you're displacing (backing tracks, lessons, gear insurance, a setup cost, a $40 book)? Displacing a known spend beats creating a new one.
5. **Boring test:** the least sexy idea you can stand to work on for 3 years is usually the winner. #131–146 are the boring goldmine.

---

## 🚀 Starter plan: two weeks to a real MVP (works for most picks)

- **Days 1–2:** pick one idea, write the single sentence: "*[who]* can now *[do what]* in *[how long]* instead of *[current painful way]*."
- **Days 3–5:** build the narrowest slice that delivers that sentence with a hardcoded/uploaded input. No accounts, no landing page.
- **Days 6–7:** put it in front of 5 real guitarists (Discord, local shop, your group chat). Watch, don't explain.
- **Days 8–12:** fix the two things all 5 stumbled on. Add the one thing all 5 asked for. Now add auth + payments.
- **Days 13–14:** post where the users are with a video of a real person using it. Measure: did strangers *finish a session*? That's your only day-one metric.

---

*Catalog compiled from a survey of the 2026 guitar app/web landscape (learning platforms, tab sites, AI audio tools, tuners, ear trainers, practice loggers, gear marketplaces, jam platforms, band-management software, luthier/e-commerce tooling) plus the gaps those products leave visible in their reviews, forums, and subreddits.*
