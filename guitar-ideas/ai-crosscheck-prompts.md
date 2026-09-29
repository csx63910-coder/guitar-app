# 🤖 Cross-check prompt kit — put the same question to other AIs

I can't log into ChatGPT / Claude / Gemini / Grok / Perplexity from this workspace (no tool for it). You can — so here's a paste-ready kit. Run these, paste the answers back to me, and I'll merge everything into the master bank (de-duped, numbered, with disagreements flagged).

**Why bother:** different models have different blind spots and different training slices. Cross-checking catches categories any single pass misses — including mine.

---

## Prompt 1 — Full taxonomy challenge (paste into any strong model)

> You are a veteran guitar-plugin developer and market analyst. List EVERY category of software plugin or VST that a guitarist, guitar producer, or guitar teacher could plausibly use — not just amp sims. Aim for 30+ distinct categories (e.g., capture players, IR loaders, pitch/drop-tune, sustain/feedback sims, hex/per-string processing, acoustic/piezo matching, transcription, practice tools, preset librarians, live hosts, licensing utilities, dev tools). For each category give: (1) what it does, (2) 2–3 leading products in 2026, (3) whether the category is saturated or has real gaps, (4) one product idea that does NOT exist yet and would sell. Be specific and avoid repeating the same idea in different clothes.

## Prompt 2 — Gap hunt with constraints (for ideas that can actually ship)

> Assume a solo developer with strong audio DSP skills but no licensing budget (can't license brands, artists, or copyrighted music), 3 months of runway, and access to open-source tools (NAM, JUCE, Demucs, Basic Pitch, Web Audio). Where can they build something guitarists would pay for in 2026 that isn't a competitor to Neural DSP, TONE3000, or Ultimate Guitar? Give 10 ideas ranked by (feasibility × willingness to pay), each with: target user, why now, who pays, price point, and the single hardest technical risk.

## Prompt 3 — Adversarial red team (attack my list)

> Here is a list of 231 guitar app/website/plugin ideas: [paste the summary table from the master bank]. Attack it: (1) Which ideas are already built by an existing product in 2026 — name the product; (2) which are legally or practically unshippable; (3) which are features, not products; (4) which sound good but no one would pay for — and why; (5) which 5 would you actually build, in what order. Be blunt.

## Prompt 4 — The "what's missing" question (short, surprisingly effective)

> What is the single most annoying unsolved problem in your experience as a guitarist / guitar producer, that no plugin or app currently solves properly? Then: what would the product that solves it look like, and who would pay for it first?

## Prompt 5 — Cross-check the winners only (cheap, focused)

> Evaluate these six product ideas for 2026 and tell me which is strongest and why, plus the fastest way to validate each in 2 weeks and under $500: (1) capture optimizer that converts NAM captures for specific hardware pedals; (2) setlist-to-device tone pack exporter for gigging cover bands; (3) humanized virtual double/quad-tracker plugin; (4) blind-test certification service for guitar gear brands; (5) acoustic pickup→mic'd-body matching plugin (software ToneDexter); (6) plugin license resale marketplace with instant transfers.

---

## How to merge results back

Paste any outputs into this chat. I'll:
1. Extract only ideas not already in our 231 (with a dedupe check against parts 1–4).
2. Number them continuing from 231 (232, 233, …) so nothing renumbers.
3. Flag **conflicts** (where another model says an idea exists and mine said it doesn't — I'll verify and update).
4. Mark which ideas multiple models independently landed on — those are your strongest signals.
5. Roll everything into the master bank after your cut list lands.

## Which model to ask what

| Model | Best used for |
|---|---|
| ChatGPT | Structured category lists; commercial feasibility takes |
| Claude | Long-form critique, legal/shipping risk, red-teaming the list |
| Gemini | Recent-release awareness (it indexes news well), search-grounded checks |
| Grok | Forum/Reddit sentiment — what players actually complain about |
| Perplexity / any search-grounded AI | Verifying "does product X exist right now" claims, with links |

*Tip: run Prompt 1 and Prompt 4 on three models each — taxonomy completeness and pain-point quality improve fast with repetition, and the overlaps become your confidence ranking.*
