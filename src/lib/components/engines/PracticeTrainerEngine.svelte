<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  export interface PracticeExercise {
    title: string;
    bpm: number;
    description: string;
    subdivision?: string;
  }

  interface Props {
    toolTitle: string;
    toolNumber: number;
    engineConfig?: {
      defaultBpm?: number;
      defaultSubdivision?: string;
      exercises?: PracticeExercise[];
    };
  }

  let { toolTitle, toolNumber, engineConfig }: Props = $props();

  const defaultExercises: PracticeExercise[] = [
    { title: 'Even 16th-Note Alternate Picking', bpm: 90, description: 'Single-string 1-2-3-4 chromatic sync with strict down-up strokes.', subdivision: 'sixteenth' },
    { title: 'String-Skipping Arpeggios', bpm: 80, description: 'Skip string 5 and 3 while maintaining equal note duration and relaxed thumb.', subdivision: 'triplet' },
    { title: 'Polyrhythmic 3:2 Hemiola Shift', bpm: 100, description: '3 taps against 2 metronome beats. Lock into the counter-rhythm.', subdivision: 'poly32' },
    { title: 'Speed Ceiling Ramp Challenge', bpm: 110, description: 'Ramp +2 BPM every 4 bars until reaching edge of clean synchronization.', subdivision: 'quarter' }
  ];

  const initialBpm = engineConfig?.defaultBpm ?? 100;
  const initialSubdivision = engineConfig?.defaultSubdivision ?? 'quarter';
  const exercises = $derived(engineConfig?.exercises || defaultExercises);

  let bpm = $state(initialBpm);
  let isRunning = $state(false);
  let subdivision = $state(initialSubdivision);
  let speedRampActive = $state(false);
  let rampIncrement = $state(2);
  let rampBarsCount = $state(4);
  let currentBarCount = $state(0);
  let currentBeat = $state(0);

  // Rhythm tapping accuracy test
  let tapOffsets = $state<number[]>([]);
  let lastTapStatus = $state<string>('Ready to test timing');
  let tapScore = $state<number>(100);
  let tapTimestamps: number[] = [];

  // Practice timer
  let sessionMinutes = $state(10);
  let timerSecondsLeft = $state(600);
  let timerActive = $state(false);
  let timerInterval: number | null = null;
  let loggedMinutesTotal = $state(0);

  let audioCtx: AudioContext | null = null;
  let nextNoteTime = 0;
  let scheduleAheadTime = 0.1;
  let lookahead = 25;
  let timerId: number | null = null;

  function initAudio() {
    if (typeof window === 'undefined') return;
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playClick(time: number, isAccent: boolean) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = isAccent ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isAccent ? 880 : 440, time);

    gain.gain.setValueAtTime(isAccent ? 0.4 : 0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  function nextNote() {
    let secondsPerBeat = 60.0 / bpm;
    if (subdivision === 'eighth') secondsPerBeat /= 2;
    if (subdivision === 'sixteenth') secondsPerBeat /= 4;
    if (subdivision === 'triplet') secondsPerBeat /= 3;
    if (subdivision === 'poly32') secondsPerBeat = (60.0 / bpm) * (2 / 3);
    if (subdivision === 'poly43') secondsPerBeat = (60.0 / bpm) * (3 / 4);

    nextNoteTime += secondsPerBeat;
    currentBeat = (currentBeat + 1) % 4;

    if (currentBeat === 0) {
      currentBarCount++;
      if (speedRampActive && currentBarCount % rampBarsCount === 0) {
        bpm = Math.min(260, bpm + rampIncrement);
      }
    }
  }

  function scheduler() {
    if (!audioCtx) return;
    while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
      playClick(nextNoteTime, currentBeat === 0);
      nextNote();
    }
    if (isRunning) {
      timerId = window.setTimeout(scheduler, lookahead);
    }
  }

  function toggleMetronome() {
    initAudio();
    if (!audioCtx) return;

    if (isRunning) {
      isRunning = false;
      if (timerId) clearTimeout(timerId);
    } else {
      isRunning = true;
      currentBeat = 0;
      currentBarCount = 0;
      nextNoteTime = audioCtx.currentTime + 0.05;
      scheduler();
    }
  }

  function handleTapTempo() {
    const now = performance.now();
    tapTimestamps.push(now);
    if (tapTimestamps.length > 5) tapTimestamps.shift();

    if (tapTimestamps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimestamps.length; i++) {
        intervals.push(tapTimestamps[i] - tapTimestamps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 280) {
        bpm = calculatedBpm;
      }
    }
  }

  function handleRhythmTestTap() {
    if (!isRunning || !audioCtx) {
      lastTapStatus = 'Start the metronome first to test timing accuracy';
      return;
    }
    const now = audioCtx.currentTime;
    const beatDuration = 60.0 / bpm;
    // Difference between tap time and closest beat
    const timeSinceLast = (now - nextNoteTime + beatDuration) % beatDuration;
    const offsetMs = Math.round((timeSinceLast > beatDuration / 2 ? timeSinceLast - beatDuration : timeSinceLast) * 1000);

    tapOffsets = [...tapOffsets.slice(-9), Math.abs(offsetMs)];
    const avgError = tapOffsets.reduce((a, b) => a + b, 0) / tapOffsets.length;

    if (Math.abs(offsetMs) <= 22) {
      lastTapStatus = `POCKET! (${offsetMs > 0 ? '+' : ''}${offsetMs}ms) — Super tight`;
      tapScore = Math.max(85, 100 - Math.round(avgError * 0.8));
    } else if (Math.abs(offsetMs) <= 50) {
      lastTapStatus = offsetMs < 0 ? `RUSHING (${offsetMs}ms)` : `DRAGGING (+${offsetMs}ms)`;
      tapScore = Math.max(60, 100 - Math.round(avgError * 0.9));
    } else {
      lastTapStatus = `OUT OF SYNC (${offsetMs > 0 ? '+' : ''}${offsetMs}ms)`;
      tapScore = Math.max(30, 100 - Math.round(avgError));
    }
  }

  function selectExercise(ex: PracticeExercise) {
    bpm = ex.bpm;
    if (ex.subdivision) subdivision = ex.subdivision;
    if (!isRunning) toggleMetronome();
  }

  // Timer controls
  function startTimer() {
    timerActive = true;
    timerSecondsLeft = sessionMinutes * 60;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = window.setInterval(() => {
      if (timerSecondsLeft > 0) {
        timerSecondsLeft--;
      } else {
        stopTimer();
        loggedMinutesTotal += sessionMinutes;
        playClick(audioCtx?.currentTime || 0, true);
      }
    }, 1000);
  }

  function stopTimer() {
    timerActive = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  onDestroy(() => {
    isRunning = false;
    if (timerId) clearTimeout(timerId);
    if (timerInterval) clearInterval(timerInterval);
    if (audioCtx) {
      try {
        audioCtx.close();
      } catch {}
      audioCtx = null;
    }
  });
</script>

<div class="trainer-engine-card">
  <div class="trainer-header">
    <div class="trainer-info">
      <span class="engine-badge">TIMING &middot; PRECISION GYM</span>
      <h3>{toolTitle} Interactive Practice Trainer</h3>
      <p class="trainer-sub">
        Sample-accurate Web Audio click metronome, polyrhythmic subdivision engine, speed ramp ceiling trainer, and millisecond groove-accuracy tap scoring.
      </p>
    </div>

    <div class="trainer-actions">
      <button class="btn {isRunning ? 'btn-danger' : 'btn-primary'}" onclick={toggleMetronome}>
        {#if isRunning}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          Stop Click
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Start Metronome
        {/if}
      </button>

      <button class="btn btn-secondary btn-sm" onclick={handleTapTempo}>
        Tap Tempo
      </button>
    </div>
  </div>

  <!-- Tempo & Subdivision Controls -->
  <div class="metro-dashboard">
    <div class="bpm-display-block">
      <div class="bpm-number-wrap">
        <span class="bpm-num">{bpm}</span>
        <span class="bpm-unit">BPM</span>
      </div>

      <div class="bpm-adjust-buttons">
        <button class="btn-step" onclick={() => (bpm = Math.max(40, bpm - 5))}>-5</button>
        <button class="btn-step" onclick={() => (bpm = Math.max(40, bpm - 1))}>-1</button>
        <button class="btn-step" onclick={() => (bpm = Math.min(260, bpm + 1))}>+1</button>
        <button class="btn-step" onclick={() => (bpm = Math.min(260, bpm + 5))}>+5</button>
      </div>

      <input
        type="range"
        min="40"
        max="260"
        step="1"
        bind:value={bpm}
        class="bpm-slider"
      />
    </div>

    <!-- Subdivision & Polyrhythms -->
    <div class="subdivision-block">
      <h4>Subdivision &amp; Cross-Rhythms</h4>
      <div class="subdiv-pills">
        <button
          type="button"
          class="subdiv-pill {subdivision === 'quarter' ? 'active' : ''}"
          onclick={() => (subdivision = 'quarter')}
        >
          1/4 Quarter (Basic)
        </button>
        <button
          type="button"
          class="subdiv-pill {subdivision === 'eighth' ? 'active' : ''}"
          onclick={() => (subdivision = 'eighth')}
        >
          1/8 Eighth Notes
        </button>
        <button
          type="button"
          class="subdiv-pill {subdivision === 'triplet' ? 'active' : ''}"
          onclick={() => (subdivision = 'triplet')}
        >
          Triplets (Shuffle)
        </button>
        <button
          type="button"
          class="subdiv-pill {subdivision === 'sixteenth' ? 'active' : ''}"
          onclick={() => (subdivision = 'sixteenth')}
        >
          1/16 Fast Sync
        </button>
        <button
          type="button"
          class="subdiv-pill {subdivision === 'poly32' ? 'active' : ''}"
          onclick={() => (subdivision = 'poly32')}
        >
          3:2 Polyrhythm
        </button>
        <button
          type="button"
          class="subdiv-pill {subdivision === 'poly43' ? 'active' : ''}"
          onclick={() => (subdivision = 'poly43')}
        >
          4:3 Polyrhythm
        </button>
      </div>

      <!-- Speed Ramp Toggle -->
      <div class="ramp-toggle-row">
        <label class="toggle-label">
          <input type="checkbox" bind:checked={speedRampActive} />
          <span>Enable Speed Ramp (+{rampIncrement} BPM every {rampBarsCount} bars)</span>
        </label>
        {#if speedRampActive}
          <span class="bar-counter">Bar {currentBarCount}</span>
        {/if}
      </div>
    </div>
  </div>

  <!-- Interactive Timing Accuracy Tap Pad -->
  <div class="groove-test-card">
    <div class="groove-header">
      <div>
        <h4>Rhythm Accuracy &amp; Pocket Scoring</h4>
        <p class="groove-sub">Click the pad in sync with the click to evaluate timing offset in milliseconds.</p>
      </div>

      <div class="score-badge">
        <span class="score-val">{tapScore}%</span>
        <span class="score-label">Pocket Rating</span>
      </div>
    </div>

    <div class="tap-pad-area">
      <button class="tap-target-btn" onclick={handleRhythmTestTap}>
        <span>TAP ON THE BEAT</span>
        <span class="tap-hint">{lastTapStatus}</span>
      </button>
    </div>
  </div>

  <!-- Targeted Practice Exercises -->
  <div class="drills-section">
    <h4>Structured Practice Exercises</h4>
    <div class="exercises-grid">
      {#each exercises as ex}
        <div class="exercise-card">
          <div class="ex-top">
            <strong>{ex.title}</strong>
            <span class="ex-bpm">{ex.bpm} BPM</span>
          </div>
          <p class="ex-desc">{ex.description}</p>
          <button class="btn btn-secondary btn-sm" onclick={() => selectExercise(ex)}>
            Load Drill
          </button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Session Timer -->
  <div class="session-timer-bar">
    <div class="timer-left">
      <span class="timer-clock">
        {Math.floor(timerSecondsLeft / 60)}:{(timerSecondsLeft % 60).toString().padStart(2, '0')}
      </span>
      <span class="timer-desc">Target Session Duration</span>
    </div>

    <div class="timer-controls">
      {#if !timerActive}
        <div class="preset-times">
          <button class="btn-time {sessionMinutes === 5 ? 'active' : ''}" onclick={() => { sessionMinutes = 5; timerSecondsLeft = 300; }}>5m</button>
          <button class="btn-time {sessionMinutes === 10 ? 'active' : ''}" onclick={() => { sessionMinutes = 10; timerSecondsLeft = 600; }}>10m</button>
          <button class="btn-time {sessionMinutes === 20 ? 'active' : ''}" onclick={() => { sessionMinutes = 20; timerSecondsLeft = 1200; }}>20m</button>
        </div>
        <button class="btn btn-primary btn-sm" onclick={startTimer}>Start Session</button>
      {:else}
        <button class="btn btn-danger btn-sm" onclick={stopTimer}>Pause Timer</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .trainer-engine-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: var(--shadow-card);
  }

  .trainer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.25rem;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 1.25rem;
  }

  .engine-badge {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--accent);
    background-color: var(--accent-subtle);
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
    display: inline-block;
    margin-bottom: 0.4rem;
  }

  .trainer-header h3 {
    font-size: 1.35rem;
    margin-bottom: 0.25rem;
  }

  .trainer-sub {
    font-size: 0.88rem;
    color: var(--text-secondary);
    max-width: 650px;
  }

  .trainer-actions {
    display: flex;
    gap: 0.65rem;
    align-items: center;
  }

  .btn-danger {
    background-color: #ef4444;
    color: #fff;
    border: none;
  }
  .btn-danger:hover {
    background-color: #dc2626;
  }

  .metro-dashboard {
    display: grid;
    grid-template-columns: minmax(240px, 320px) 1fr;
    gap: 1.5rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    .metro-dashboard {
      grid-template-columns: 1fr;
    }
  }

  .bpm-display-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
    border-right: 1px solid var(--border-subtle);
    padding-right: 1.5rem;
  }

  @media (max-width: 768px) {
    .bpm-display-block {
      border-right: none;
      padding-right: 0;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 1.5rem;
    }
  }

  .bpm-number-wrap {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
  }

  .bpm-num {
    font-size: 3.5rem;
    font-weight: 800;
    font-family: var(--font-mono);
    color: var(--accent-light);
    line-height: 1;
  }

  .bpm-unit {
    font-size: 1rem;
    color: var(--text-muted);
    font-weight: 700;
  }

  .bpm-adjust-buttons {
    display: flex;
    gap: 0.4rem;
  }

  .btn-step {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    color: var(--text-secondary);
    padding: 0.3rem 0.65rem;
    border-radius: var(--radius-sm);
    font-size: 0.82rem;
    cursor: pointer;
  }
  .btn-step:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .bpm-slider {
    width: 100%;
    accent-color: var(--accent);
    cursor: pointer;
  }

  .subdivision-block {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .subdivision-block h4 {
    font-size: 0.92rem;
    color: var(--text-primary);
  }

  .subdiv-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .subdiv-pill {
    font-size: 0.78rem;
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-sm);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .subdiv-pill:hover {
    border-color: var(--accent-border);
    color: var(--text-primary);
  }

  .subdiv-pill.active {
    background-color: var(--accent-subtle);
    border-color: var(--accent-border);
    color: var(--accent-light);
    font-weight: 600;
  }

  .ramp-toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-secondary);
    padding: 0.65rem 0.85rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
    font-size: 0.82rem;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: var(--text-secondary);
  }

  .bar-counter {
    font-family: var(--font-mono);
    color: var(--accent);
    font-weight: 700;
  }

  .groove-test-card {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .groove-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .groove-header h4 {
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
  }

  .groove-sub {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .score-badge {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .score-val {
    font-size: 1.45rem;
    font-weight: 800;
    font-family: var(--font-mono);
    color: #10b981;
  }

  .score-label {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .tap-pad-area {
    display: flex;
    justify-content: center;
  }

  .tap-target-btn {
    width: 100%;
    max-width: 420px;
    height: 80px;
    background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
    border: 2px dashed var(--accent-border);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .tap-target-btn:hover {
    border-color: var(--accent);
    background: var(--bg-tertiary);
  }

  .tap-target-btn:active {
    transform: scale(0.98);
    background-color: var(--accent-subtle);
  }

  .tap-target-btn span:first-child {
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .tap-hint {
    font-size: 0.75rem;
    font-family: var(--font-mono);
    color: var(--accent-light);
  }

  .drills-section h4 {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
  }

  .exercises-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
  }

  .exercise-card {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    justify-content: space-between;
  }

  .ex-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .ex-top strong {
    font-size: 0.88rem;
    color: var(--text-primary);
  }

  .ex-bpm {
    font-size: 0.75rem;
    font-family: var(--font-mono);
    color: var(--accent);
    font-weight: 700;
  }

  .ex-desc {
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  .session-timer-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem 1.35rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .timer-left {
    display: flex;
    align-items: baseline;
    gap: 0.8rem;
  }

  .timer-clock {
    font-size: 1.6rem;
    font-weight: 800;
    font-family: var(--font-mono);
    color: var(--text-primary);
  }

  .timer-desc {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .timer-controls {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .preset-times {
    display: flex;
    gap: 0.35rem;
  }

  .btn-time {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 0.25rem 0.55rem;
    border-radius: var(--radius-sm);
    font-size: 0.78rem;
    cursor: pointer;
  }

  .btn-time.active {
    border-color: var(--accent);
    color: var(--accent-light);
  }
</style>
