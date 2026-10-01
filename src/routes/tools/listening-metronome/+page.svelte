<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  // Audio Context & Nodes
  let audioCtx: AudioContext | null = null;
  let micStream: MediaStream | null = null;
  let micSource: MediaStreamAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let isListening = $state(false);
  let isPlaying = $state(false);

  // Metronome Parameters
  let bpm = $state(90);
  let beatsPerBar = $state(4);
  let currentBeat = $state(0);
  let clickSound = $state<'woodblock' | 'beep' | 'rimshot'>('woodblock');
  let toleranceMs = $state(45); // pocket tolerance window (+- 45ms)

  // Pocket State Engine
  let isMutedByPocket = $state(false);
  let consecutivePocketHits = $state(0);
  let silentStreakBeats = $state(0);
  let maxSilentStreak = $state(0);
  let totalBeatsPlayed = $state(0);
  let pocketBeatsCount = $state(0);
  let driftStatus = $state<'none' | 'perfect' | 'rushing' | 'dragging'>('none');
  let lastDriftMs = $state(0);

  // Timing tracking
  let nextBeatTime = 0;
  let timerWorker: number | null = null;
  let animFrame: number | null = null;
  let lastTransientTime = 0;
  let prevEnergy = 0;

  // Visual beat indicators
  let beatFlash = $state(false);

  function startAudio() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  async function toggleSession() {
    if (isPlaying) {
      stopSession();
    } else {
      await startSession();
    }
  }

  async function startSession() {
    startAudio();
    if (!audioCtx) return;

    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      micSource = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      micSource.connect(analyser);

      isPlaying = true;
      isListening = true;
      currentBeat = 0;
      isMutedByPocket = false;
      consecutivePocketHits = 0;
      silentStreakBeats = 0;
      totalBeatsPlayed = 0;
      pocketBeatsCount = 0;
      driftStatus = 'none';

      nextBeatTime = audioCtx.currentTime + 0.1;
      scheduler();
      listenLoop();
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required for the Listening Metronome to detect your guitar timing.');
    }
  }

  function stopSession() {
    isPlaying = false;
    isListening = false;
    isMutedByPocket = false;
    if (timerWorker) {
      clearTimeout(timerWorker);
      timerWorker = null;
    }
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
  }

  function playClick(isAccent: boolean, time: number) {
    if (!audioCtx || isMutedByPocket) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (clickSound === 'woodblock') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1200 : 800, time);
      osc.frequency.exponentialRampToValueAtTime(isAccent ? 600 : 400, time + 0.04);
      gain.gain.setValueAtTime(0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    } else if (clickSound === 'beep') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isAccent ? 1760 : 880, time);
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    } else {
      // Rimshot
      osc.type = 'square';
      osc.frequency.setValueAtTime(isAccent ? 900 : 450, time);
      gain.gain.setValueAtTime(0.6, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    }

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.06);
  }

  function scheduler() {
    if (!isPlaying || !audioCtx) return;

    const secondsPerBeat = 60.0 / bpm;
    const scheduleAheadTime = 0.1;

    while (nextBeatTime < audioCtx.currentTime + scheduleAheadTime) {
      const isAccent = currentBeat === 0;
      playClick(isAccent, nextBeatTime);

      // Evaluate pocket status for this beat cycle
      totalBeatsPlayed++;
      if (isMutedByPocket) {
        silentStreakBeats++;
        if (silentStreakBeats > maxSilentStreak) {
          maxSilentStreak = silentStreakBeats;
        }
      }

      currentBeat = (currentBeat + 1) % beatsPerBar;
      nextBeatTime += secondsPerBeat;
    }

    timerWorker = window.setTimeout(scheduler, 25);
  }

  // Audio transient peak detector for guitar notes
  function listenLoop() {
    if (!isListening || !analyser || !audioCtx) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSquares / buffer.length);
    const now = audioCtx.currentTime;

    // Transient threshold
    const onsetThreshold = 0.04;
    if (rms > onsetThreshold && rms > prevEnergy * 1.8 && now - lastTransientTime > 0.12) {
      lastTransientTime = now;
      handleGuitarTransient(now);
    }
    prevEnergy = rms;

    animFrame = requestAnimationFrame(listenLoop);
  }

  function handleGuitarTransient(hitTime: number) {
    if (!audioCtx) return;

    const secondsPerBeat = 60.0 / bpm;
    // Find closest expected beat time
    const timeSinceLastBeat = (hitTime - (nextBeatTime - secondsPerBeat));
    const offsetSec = timeSinceLastBeat > secondsPerBeat / 2 ? timeSinceLastBeat - secondsPerBeat : timeSinceLastBeat;
    const offsetMs = Math.round(offsetSec * 1000);

    lastDriftMs = offsetMs;

    if (Math.abs(offsetMs) <= toleranceMs) {
      // Hit in the pocket!
      consecutivePocketHits++;
      pocketBeatsCount++;
      driftStatus = 'perfect';

      // Lock in pocket after 4 solid consecutive hits
      if (consecutivePocketHits >= 4 && !isMutedByPocket) {
        isMutedByPocket = true;
      }
    } else {
      // Drift detected!
      consecutivePocketHits = 0;
      if (isMutedByPocket) {
        // Break pocket silence and bring click back immediately
        isMutedByPocket = false;
        silentStreakBeats = 0;
      }

      if (offsetMs > 0) {
        driftStatus = 'dragging';
      } else {
        driftStatus = 'rushing';
      }
    }
  }

  let pocketAccuracy = $derived(
    totalBeatsPlayed > 0 ? Math.round((pocketBeatsCount / totalBeatsPlayed) * 100) : 0
  );

  onDestroy(() => {
    stopSession();
  });
</script>

<svelte:head>
  <title>The "Listening" Metronome | Guitar Toolkit</title>
  <meta
    name="description"
    content="Smart practice metronome that mutes itself when you play in the pocket, and clicks back on the moment you drift off tempo."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Practice & Timing</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#54 Smart Metronome</span>
      <span class="badge">Microphone Sensing</span>
      <span class="badge">Pocket Training</span>
    </div>
    <h1>🎯 The "Listening" Metronome</h1>
    <p class="tool-sub">
      Stops clicking when you are locked in time, leaving you in complete musical silence to carry your own groove. The click only intervenes when your tempo drifts.
    </p>
  </div>

  <!-- Main Status Dashboard -->
  <div class="status-box" class:in-pocket={isMutedByPocket}>
    <div class="status-badge-top">
      {#if !isPlaying}
        <span class="status-idle">IDLE &bull; PRESS START</span>
      {:else if isMutedByPocket}
        <span class="status-pocket">🔥 IN THE POCKET (CLICK MUTED)</span>
      {:else}
        <span class="status-clicking">🔊 CLICK ACTIVE (SEARCHING FOR POCKET)</span>
      {/if}
    </div>

    <div class="big-indicator">
      {#if !isPlaying}
        <div class="indicator-text">Ready to Play</div>
      {:else if isMutedByPocket}
        <div class="indicator-text pocket-glow">YOU OWN THE TIME</div>
        <div class="indicator-sub">Metronome is silent &bull; {silentStreakBeats} beats in the groove</div>
      {:else}
        <div class="indicator-text drift-alert">
          {#if driftStatus === 'rushing'}
            ⚡ RUSHING ({Math.abs(lastDriftMs)}ms early)
          {:else if driftStatus === 'dragging'}
            🐢 DRAGGING ({Math.abs(lastDriftMs)}ms late)
          {:else}
            LOCKED LOCKING IN... ({consecutivePocketHits}/4)
          {/if}
        </div>
        <div class="indicator-sub">Keep playing steady quarter notes to mute the click</div>
      {/if}
    </div>

    <!-- Live Beat Light Strip -->
    <div class="beat-strip">
      {#each Array(beatsPerBar) as _, b}
        <div
          class="beat-dot"
          class:current={currentBeat === (b + 1) % beatsPerBar}
          class:accent={b === 0}
          class:pocket-dot={isMutedByPocket}
        >
          {b + 1}
        </div>
      {/each}
    </div>
  </div>

  <!-- Controls Panel -->
  <div class="controls-panel">
    <div class="main-btn-row">
      <button
        type="button"
        class="start-btn"
        class:stop={isPlaying}
        onclick={toggleSession}
      >
        {isPlaying ? '⏹ STOP PRACTICE' : '▶ START LISTENING METRONOME'}
      </button>
    </div>

    <div class="settings-grid">
      <!-- BPM Slider -->
      <div class="setting-card">
        <label for="bpm-input" class="setting-label">TEMPO: <strong>{bpm} BPM</strong></label>
        <div class="slider-row">
          <input
            id="bpm-input"
            type="range"
            min="50"
            max="200"
            step="1"
            bind:value={bpm}
            disabled={isPlaying}
          />
          <div class="quick-bpm-btns">
            <button type="button" onclick={() => (bpm = Math.max(50, bpm - 5))}>-5</button>
            <button type="button" onclick={() => (bpm = Math.min(200, bpm + 5))}>+5</button>
          </div>
        </div>
      </div>

      <!-- Pocket Tolerance Window -->
      <div class="setting-card">
        <label for="tolerance-input" class="setting-label">POCKET WINDOW: <strong>&plusmn;{toleranceMs} ms</strong></label>
        <input
          id="tolerance-input"
          type="range"
          min="25"
          max="80"
          step="5"
          bind:value={toleranceMs}
        />
        <div class="tolerance-hint">
          {toleranceMs <= 35 ? 'Tight (Master level)' : toleranceMs <= 50 ? 'Standard (Groove level)' : 'Relaxed (Beginner friendly)'}
        </div>
      </div>

      <!-- Time Signature & Sound -->
      <div class="setting-card">
        <label for="beats-input" class="setting-label">BEATS PER BAR</label>
        <select id="beats-input" bind:value={beatsPerBar} disabled={isPlaying}>
          <option value={4}>4/4 Time</option>
          <option value={3}>3/4 Waltz Time</option>
          <option value={6}>6/8 Compound Time</option>
        </select>

        <label for="click-sound" class="setting-label" style="margin-top: 10px;">CLICK TONE</label>
        <select id="click-sound" bind:value={clickSound}>
          <option value="woodblock">Acoustic Woodblock</option>
          <option value="beep">Studio Digital Beep</option>
          <option value="rimshot">Snare Rimshot</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Performance Stats Card -->
  <div class="stats-card">
    <h3>📊 Session Pocket Analytics</h3>
    <div class="stats-grid">
      <div class="stat-pill">
        <span class="stat-num">{pocketAccuracy}%</span>
        <span class="stat-name">In-Pocket Accuracy</span>
      </div>
      <div class="stat-pill">
        <span class="stat-num">{maxSilentStreak}</span>
        <span class="stat-name">Longest Silent Streak (Beats)</span>
      </div>
      <div class="stat-pill">
        <span class="stat-num">{Math.round(silentStreakBeats / (beatsPerBar || 4))}</span>
        <span class="stat-name">Current Silent Bars</span>
      </div>
      <div class="stat-pill">
        <span class="stat-num">{totalBeatsPlayed}</span>
        <span class="stat-name">Total Beats Evaluated</span>
      </div>
    </div>
  </div>

  <!-- Pedagogical Explainer -->
  <div class="concept-card">
    <h3>💡 Why the Listening Metronome Works</h3>
    <p>
      Traditional metronomes create a subconscious dependency: players play along to the click rather than creating the pulse themselves.
    </p>
    <ul>
      <li><strong>Muting Forces Internal Pulse:</strong> When the click goes silent, your brain is forced to sustain the subdivision without assistance.</li>
      <li><strong>Immediate Rescue Feedback:</strong> The second you drift early or late, the click returns to recalibrate your internal clock before you derail.</li>
      <li><strong>Goal:</strong> Aim for 32 consecutive silent bars (128 beats) at 90 BPM with a &plusmn;35ms tolerance window.</li>
    </ul>
  </div>
</div>

<style>
  .tool-container {
    max-width: 900px;
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

  .status-box {
    background: #111827;
    border: 2px solid #1f2937;
    border-radius: 12px;
    padding: 32px 24px;
    text-align: center;
    margin-bottom: 24px;
    transition: all 0.3s ease;
  }
  .status-box.in-pocket {
    border-color: #10b981;
    background: radial-gradient(circle at center, rgba(16, 185, 129, 0.12) 0%, #111827 80%);
  }

  .status-badge-top {
    margin-bottom: 16px;
    font-size: 0.85rem;
    font-weight: 700;
  }
  .status-idle {
    color: #6b7280;
  }
  .status-clicking {
    color: #f59e0b;
  }
  .status-pocket {
    color: #10b981;
  }

  .big-indicator {
    min-height: 90px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .indicator-text {
    font-size: 1.8rem;
    font-weight: 800;
    color: #f3f4f6;
  }
  .pocket-glow {
    color: #10b981;
    text-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
  }
  .drift-alert {
    color: #f59e0b;
  }
  .indicator-sub {
    font-size: 0.95rem;
    color: #9ca3af;
    margin-top: 6px;
  }

  .beat-strip {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
  }
  .beat-dot {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #1f2937;
    border: 2px solid #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    color: #9ca3af;
    transition: all 0.08s ease;
  }
  .beat-dot.current {
    background: #38bdf8;
    color: #0f172a;
    border-color: #38bdf8;
    transform: scale(1.15);
  }
  .beat-dot.accent.current {
    background: #f59e0b;
    border-color: #f59e0b;
  }
  .beat-dot.pocket-dot {
    opacity: 0.4;
  }

  .controls-panel {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .main-btn-row {
    margin-bottom: 20px;
  }
  .start-btn {
    width: 100%;
    padding: 14px 20px;
    font-size: 1.1rem;
    font-weight: 800;
    background: #10b981;
    color: #064e3b;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .start-btn:hover {
    background: #34d399;
  }
  .start-btn.stop {
    background: #ef4444;
    color: #ffffff;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  .setting-card {
    background: #1f2937;
    border: 1px solid #374151;
    padding: 14px;
    border-radius: 6px;
  }
  .setting-label {
    display: block;
    font-size: 0.8rem;
    color: #9ca3af;
    margin-bottom: 8px;
  }
  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #10b981;
  }
  .quick-bpm-btns {
    display: flex;
    gap: 6px;
  }
  .quick-bpm-btns button {
    flex: 1;
    background: #374151;
    border: none;
    color: #e5e7eb;
    padding: 4px;
    border-radius: 3px;
    cursor: pointer;
    font-weight: 600;
  }
  select {
    width: 100%;
    background: #111827;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 8px;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  .tolerance-hint {
    font-size: 0.75rem;
    color: #10b981;
    margin-top: 6px;
  }

  .stats-card, .concept-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  h3 {
    margin: 0 0 16px;
    font-size: 1.15rem;
    color: #f3f4f6;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }
  .stat-pill {
    background: #1f2937;
    border: 1px solid #374151;
    padding: 14px;
    border-radius: 6px;
    text-align: center;
  }
  .stat-num {
    display: block;
    font-size: 1.6rem;
    font-weight: 800;
    color: #38bdf8;
  }
  .stat-name {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 4px;
    display: block;
  }

  .concept-card p {
    font-size: 0.9rem;
    color: #9ca3af;
    line-height: 1.5;
    margin: 0 0 12px;
  }
  .concept-card ul {
    margin: 0;
    padding-left: 18px;
    font-size: 0.85rem;
    color: #d1d5db;
    line-height: 1.6;
  }
</style>
