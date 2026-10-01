<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface PatternStep {
    subdivision: string; // e.g. "1", "1 &", "2", "2 &"
    finger: 'P (Thumb)' | 'I (Index)' | 'M (Middle)' | 'A (Ring)' | 'Pinch (P+M)';
    stringNum: number; // 1 to 6
    fret: number;
    isBass: boolean;
  }

  interface FingerstylePattern {
    id: string;
    name: string;
    style: string;
    chord: string;
    description: string;
    famousSongs: string;
    steps: PatternStep[];
  }

  const PATTERNS: FingerstylePattern[] = [
    {
      id: 'travis-classic',
      name: 'Classic Folk Pinch (Dust in the Wind style)',
      style: 'Folk / Singer-Songwriter',
      chord: 'C Major',
      description: 'The foundation of all Travis picking. Beat 1 begins with a pinch (thumb bass + middle melody plucked simultaneously), followed by alternating thumb on the offbeats.',
      famousSongs: 'Dust in the Wind (Kansas), Landslide (Fleetwood Mac)',
      steps: [
        { subdivision: '1', finger: 'Pinch (P+M)', stringNum: 5, fret: 3, isBass: true },
        { subdivision: '1 &', finger: 'I (Index)', stringNum: 3, fret: 0, isBass: false },
        { subdivision: '2', finger: 'P (Thumb)', stringNum: 4, fret: 2, isBass: true },
        { subdivision: '2 &', finger: 'M (Middle)', stringNum: 2, fret: 1, isBass: false },
        { subdivision: '3', finger: 'P (Thumb)', stringNum: 5, fret: 3, isBass: true },
        { subdivision: '3 &', finger: 'I (Index)', stringNum: 3, fret: 0, isBass: false },
        { subdivision: '4', finger: 'P (Thumb)', stringNum: 4, fret: 2, isBass: true },
        { subdivision: '4 &', finger: 'M (Middle)', stringNum: 2, fret: 1, isBass: false }
      ]
    },
    {
      id: 'outside-in',
      name: 'Chet Atkins Outside-In Roll',
      style: 'Country / Fingerstyle Jazz',
      chord: 'G Major (320003)',
      description: 'Thumb strikes the low 6th string while the middle finger plucks the high 1st string (outside strings), followed by an inward roll toward strings 4 and 3.',
      famousSongs: 'Freight Train (Elizabeth Cotten), Windy and Warm (Chet Atkins)',
      steps: [
        { subdivision: '1', finger: 'P (Thumb)', stringNum: 6, fret: 3, isBass: true },
        { subdivision: '1 &', finger: 'M (Middle)', stringNum: 1, fret: 3, isBass: false },
        { subdivision: '2', finger: 'P (Thumb)', stringNum: 4, fret: 0, isBass: true },
        { subdivision: '2 &', finger: 'I (Index)', stringNum: 3, fret: 0, isBass: false },
        { subdivision: '3', finger: 'P (Thumb)', stringNum: 6, fret: 3, isBass: true },
        { subdivision: '3 &', finger: 'M (Middle)', stringNum: 2, fret: 0, isBass: false },
        { subdivision: '4', finger: 'P (Thumb)', stringNum: 4, fret: 0, isBass: true },
        { subdivision: '4 &', finger: 'I (Index)', stringNum: 3, fret: 0, isBass: false }
      ]
    },
    {
      id: 'celtic-arpeggio',
      name: 'Celtic 6/8 Flowing Harp Arpeggio',
      style: 'Celtic / British Folk (Bert Jansch)',
      chord: 'Am (Acoustic)',
      description: 'Flowing continuous cascade mimicking an Irish harp. Rolling pattern: Thumb &rarr; Index &rarr; Middle &rarr; Ring &rarr; Middle &rarr; Index.',
      famousSongs: 'Blackwaterside, Angie, Scarborough Fair (Paul Simon)',
      steps: [
        { subdivision: '1', finger: 'P (Thumb)', stringNum: 5, fret: 0, isBass: true },
        { subdivision: '2', finger: 'I (Index)', stringNum: 4, fret: 2, isBass: false },
        { subdivision: '3', finger: 'M (Middle)', stringNum: 3, fret: 2, isBass: false },
        { subdivision: '4', finger: 'A (Ring)', stringNum: 2, fret: 1, isBass: false },
        { subdivision: '5', finger: 'M (Middle)', stringNum: 3, fret: 2, isBass: false },
        { subdivision: '6', finger: 'I (Index)', stringNum: 4, fret: 2, isBass: false }
      ]
    }
  ];

  let selectedPatternId = $state('travis-classic');
  let bpm = $state(84);
  let isPlaying = $state(false);
  let currentStepIdx = $state(0);

  let activePattern = $derived(
    PATTERNS.find((p) => p.id === selectedPatternId) || PATTERNS[0]
  );

  // Web Audio Context & Sequencer
  let audioCtx: AudioContext | null = null;
  let timerId: number | null = null;

  function togglePlay() {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    isPlaying = true;
    currentStepIdx = 0;
    runStep();
  }

  function stopPlayback() {
    isPlaying = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    currentStepIdx = 0;
  }

  function runStep() {
    if (!isPlaying || !audioCtx) return;

    const step = activePattern.steps[currentStepIdx];
    playStepSound(step);

    const stepDurationMs = (60 / bpm / 2) * 1000; // Eighth note duration
    timerId = window.setTimeout(() => {
      currentStepIdx = (currentStepIdx + 1) % activePattern.steps.length;
      runStep();
    }, stepDurationMs);
  }

  function playStepSound(step: PatternStep) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // Pitch mapping
    const basePitches = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63]; // Low E to High E
    const strIdx = 6 - step.stringNum;
    const freq = basePitches[strIdx] * Math.pow(2, step.fret / 12);

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = step.isBass ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(step.isBass ? 0.35 : 0.2, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (step.isBass ? 0.8 : 0.5));

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.85);

    // If pinch, play secondary melody string concurrently
    if (step.finger.includes('Pinch')) {
      const melOsc = audioCtx.createOscillator();
      const melGain = audioCtx.createGain();
      melOsc.type = 'triangle';
      melOsc.frequency.setValueAtTime(261.63, now); // C4
      melGain.gain.setValueAtTime(0.001, now);
      melGain.gain.linearRampToValueAtTime(0.2, now + 0.015);
      melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      melOsc.connect(melGain);
      melGain.connect(audioCtx.destination);
      melOsc.start(now);
      melOsc.stop(now + 0.55);
    }
  }

  onDestroy(() => {
    stopPlayback();
  });
</script>

<svelte:head>
  <title>Fingerstyle & Travis Picking Bootcamp | Guitar Toolkit</title>
  <meta
    name="description"
    content="Master alternating bass thumb independence with interactive animated tabs, syncopated pinch patterns, and real-time audio playback."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Practice & Technique</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#15 Technique Bootcamp</span>
      <span class="badge">Thumb Independence</span>
      <span class="badge">Animated Tab Sequencer</span>
    </div>
    <h1>🪕 Fingerstyle & Travis Picking Bootcamp</h1>
    <p class="tool-sub">
      Train your right-hand thumb to act like an independent bass player while your fingers weave syncopated melodies. Interactive tab sequencer, right-hand finger codes (P-I-M-A), and tempo trainer.
    </p>
  </div>

  <!-- Pattern Selector -->
  <div class="pattern-selector-card">
    <span class="sel-label">SELECT PICKING PATTERN:</span>
    <div class="patterns-grid">
      {#each PATTERNS as p}
        <button
          type="button"
          class="pattern-chip"
          class:active={p.id === selectedPatternId}
          onclick={() => {
            if (isPlaying) stopPlayback();
            selectedPatternId = p.id;
          }}
        >
          <span class="chip-name">{p.name}</span>
          <span class="chip-style">{p.style} &bull; Chord: {p.chord}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Playback & Tempo Controls -->
  <div class="controls-card">
    <div class="controls-left">
      <button
        type="button"
        class="play-btn"
        class:playing={isPlaying}
        onclick={togglePlay}
      >
        {isPlaying ? '⏹ STOP SEQUENCER' : '▶ PLAY ANIMATED PATTERN'}
      </button>

      <div class="tempo-control">
        <label for="pattern-bpm" class="tempo-label">TEMPO: <strong>{bpm} BPM</strong></label>
        <input
          id="pattern-bpm"
          type="range"
          min="50"
          max="140"
          step="2"
          bind:value={bpm}
        />
      </div>
    </div>

    <div class="pattern-info-meta">
      <div><strong>Style:</strong> {activePattern.style}</div>
      <div><strong>Song Reference:</strong> {activePattern.famousSongs}</div>
    </div>
  </div>

  <!-- Animated Interactive Tab Sequence View -->
  <div class="tab-player-card">
    <div class="tab-header">
      <h3>🎼 Interactive Picking Grid ({activePattern.steps.length} Steps)</h3>
      <span class="tab-hint">Follow the glowing amber cursor for finger timing</span>
    </div>

    <div class="steps-strip">
      {#each activePattern.steps as step, idx}
        <div
          class="step-tile"
          class:active-step={isPlaying && currentStepIdx === idx}
          class:bass-step={step.isBass}
        >
          <span class="subdiv-tag">{step.subdivision}</span>
          <span class="finger-code">{step.finger}</span>
          <span class="string-note">String {step.stringNum} (Fret {step.fret})</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Right Hand Anatomy & Pedagogy Card -->
  <div class="anatomy-card">
    <h3>🖐️ Right-Hand Classical / Fingerstyle Finger Notation</h3>
    <div class="fingers-grid">
      <div class="finger-pill">
        <span class="f-code">P (Pulgar)</span>
        <strong>Thumb</strong>
        <p>Anchors the alternating bass notes on strings 6, 5, and 4. Must move with steady, robotic quarter-note independence.</p>
      </div>

      <div class="finger-pill">
        <span class="f-code">I (Índice)</span>
        <strong>Index Finger</strong>
        <p>Responsible for middle harmonic fills, primarily picking string 3 (G string).</p>
      </div>

      <div class="finger-pill">
        <span class="f-code">M (Medio)</span>
        <strong>Middle Finger</strong>
        <p>Carries syncopated vocal melody hooks on string 2 (B string) and pinch downbeats.</p>
      </div>

      <div class="finger-pill">
        <span class="f-code">A (Anular)</span>
        <strong>Ring Finger</strong>
        <p>Reaches for high ringing melody accents and top chimes on string 1 (High E string).</p>
      </div>
    </div>
  </div>
</div>

<style>
  .tool-container {
    max-width: 1050px;
    margin: 0 auto;
    padding: 24px 16px 64px;
    color: var(--text-main, #e5e7eb);
  }

  .breadcrumbs {
    font-size: 0.85rem;
    color: var(--text-sub, #9ca3af);
    margin-bottom: 8px;
  }
  .breadcrumbs a {
    color: var(--accent-cyan, #38bdf8);
    text-decoration: none;
  }

  .badge-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .badge {
    font-size: 0.75rem;
    padding: 3px 8px;
    border-radius: 4px;
    background: #1f2937;
    color: #9ca3af;
    border: 1px solid #374151;
  }
  .badge-accent {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border-color: rgba(16, 185, 129, 0.4);
  }

  h1 {
    font-size: 1.85rem;
    font-weight: 800;
    margin: 0 0 8px;
    color: #f9fafb;
  }
  .tool-sub {
    font-size: 1rem;
    color: #9ca3af;
    line-height: 1.5;
    margin: 0 0 24px;
  }

  .pattern-selector-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 18px;
    margin-bottom: 20px;
  }
  .sel-label {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .patterns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 10px;
  }
  .pattern-chip {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 12px 14px;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .pattern-chip:hover {
    border-color: #10b981;
  }
  .pattern-chip.active {
    background: rgba(16, 185, 129, 0.12);
    border-color: #10b981;
  }
  .chip-name {
    display: block;
    font-weight: 700;
    font-size: 0.9rem;
    color: #f3f4f6;
  }
  .chip-style {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 2px;
  }

  .controls-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .controls-left {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .play-btn {
    background: #10b981;
    color: #064e3b;
    border: none;
    font-weight: 800;
    font-size: 0.95rem;
    padding: 12px 22px;
    border-radius: 6px;
    cursor: pointer;
  }
  .play-btn.playing {
    background: #ef4444;
    color: #ffffff;
  }
  .tempo-control {
    min-width: 180px;
  }
  .tempo-label {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-bottom: 4px;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #10b981;
  }
  .pattern-info-meta {
    font-size: 0.85rem;
    color: #9ca3af;
  }
  .pattern-info-meta strong {
    color: #f3f4f6;
  }

  .tab-player-card {
    background: #0d1117;
    border: 2px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .tab-header h3 {
    margin: 0;
    font-size: 1.15rem;
    color: #f9fafb;
  }
  .tab-hint {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .steps-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 8px;
  }
  .step-tile {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 12px 8px;
    text-align: center;
    transition: all 0.1s ease;
  }
  .step-tile.bass-step {
    border-left: 3px solid #38bdf8;
  }
  .step-tile.active-step {
    background: rgba(245, 158, 11, 0.25);
    border-color: #f59e0b;
    transform: scale(1.05);
    box-shadow: 0 0 14px rgba(245, 158, 11, 0.4);
  }
  .subdiv-tag {
    display: block;
    font-size: 0.65rem;
    font-weight: 800;
    color: #9ca3af;
  }
  .finger-code {
    display: block;
    font-size: 1rem;
    font-weight: 800;
    color: #f59e0b;
    margin: 4px 0;
  }
  .string-note {
    font-size: 0.75rem;
    color: #cbd5e1;
    font-family: monospace;
  }

  .anatomy-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
  }
  .anatomy-card h3 {
    margin: 0 0 16px;
    font-size: 1.15rem;
  }
  .fingers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }
  .finger-pill {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 14px;
  }
  .f-code {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    color: #10b981;
    margin-bottom: 2px;
  }
  .finger-pill strong {
    font-size: 0.95rem;
    color: #f3f4f6;
  }
  .finger-pill p {
    font-size: 0.8rem;
    color: #9ca3af;
    line-height: 1.4;
    margin: 6px 0 0;
  }
</style>
