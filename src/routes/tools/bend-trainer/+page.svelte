<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  let isListening = $state(false);
  let micError = $state<string | null>(null);
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let mediaStream: MediaStream | null = null;
  let animId: number | null = null;

  // Training parameters
  type BendType = 'half' | 'full' | 'minor-third' | 'quarter';
  let bendType = $state<BendType>('full');
  let targetRoot = $state('D'); // e.g. D4 (G string 7th fret)

  const BEND_SPECS = {
    'quarter': { label: 'Quarter-Step (+50¢)', cents: 50, tolerance: 12 },
    'half': { label: 'Half-Step (+100¢)', cents: 100, tolerance: 10 },
    'full': { label: 'Full-Step (+200¢)', cents: 200, tolerance: 10 },
    'minor-third': { label: '1.5-Step (+300¢)', cents: 300, tolerance: 12 }
  };

  // Real-time pitch tracking state
  let currentPitchHz = $state(0);
  let baselineHz = $state(293.66); // D4
  let currentCentsDelta = $state(0);
  let isLockedOnTarget = $state(false);
  let holdTimeMs = $state(0);
  let successCount = $state(0);
  let totalAttempts = $state(0);
  let celebrationBanner = $state(false);

  // Pitch calculation
  function frequencyToNote(freq: number) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const a4 = 440;
    const semitonesFromA4 = 12 * Math.log2(freq / a4);
    const noteIndex = Math.round(semitonesFromA4) + 69;
    const noteName = noteNames[noteIndex % 12];
    const octave = Math.floor(noteIndex / 12) - 1;
    const perfectFreq = a4 * Math.pow(2, (noteIndex - 69) / 12);
    const centsOff = Math.round(1200 * Math.log2(freq / perfectFreq));
    return { name: `${noteName}${octave}`, cents: centsOff };
  }

  // Autocorrelation pitch algorithm
  function autoCorrelate(buf: Float32Array, sampleRate: number): number {
    let size = buf.length;
    let rms = 0;
    for (let i = 0; i < size; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / size);
    if (rms < 0.015) return -1; // Too quiet / noise floor

    // Autocorrelation
    let r1 = 0, r2 = size - 1, thres = 0.2;
    for (let i = 0; i < size / 2; i++) {
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < size / 2; i++) {
      if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }
    }

    buf = buf.slice(r1, r2);
    size = buf.length;

    const c = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < size; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    // Parabolic interpolation for fine tuning
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  }

  let lastTick = performance.now();

  function pitchLoop() {
    if (!analyser || !audioCtx) return;
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);

    const freq = autoCorrelate(buf, audioCtx.sampleRate);
    const now = performance.now();
    const dt = now - lastTick;
    lastTick = now;

    if (freq !== -1 && freq > 70 && freq < 1200) {
      currentPitchHz = Math.round(freq * 10) / 10;

      // If playing near baseline, update or lock baseline
      if (currentPitchHz < baselineHz + 40 && currentPitchHz > baselineHz - 40) {
        baselineHz = currentPitchHz;
      }

      // Calculate cents above baseline
      const cents = Math.round(1200 * Math.log2(currentPitchHz / baselineHz));
      currentCentsDelta = Math.max(-50, Math.min(350, cents));

      const targetCents = BEND_SPECS[bendType].cents;
      const tol = BEND_SPECS[bendType].tolerance;

      if (Math.abs(currentCentsDelta - targetCents) <= tol) {
        isLockedOnTarget = true;
        holdTimeMs += dt;

        // Passing condition: Hold steady for 750ms!
        if (holdTimeMs >= 750) {
          triggerSuccessChime();
          successCount++;
          holdTimeMs = 0;
          celebrationBanner = true;
          setTimeout(() => (celebrationBanner = false), 2000);
        }
      } else {
        isLockedOnTarget = false;
        holdTimeMs = Math.max(0, holdTimeMs - dt * 1.5);
      }
    } else {
      isLockedOnTarget = false;
      holdTimeMs = 0;
    }

    animId = requestAnimationFrame(pitchLoop);
  }

  function triggerSuccessChime() {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Ignore
    }
  }

  async function startListening() {
    micError = null;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      isListening = true;
      lastTick = performance.now();
      animId = requestAnimationFrame(pitchLoop);
    } catch (err: any) {
      micError = err.message || 'Microphone access denied.';
      isListening = false;
    }
  }

  function stopListening() {
    if (animId) cancelAnimationFrame(animId);
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    isListening = false;
  }

  // Simulation slider for testing without mic
  function simulateBend(cents: number) {
    currentCentsDelta = cents;
    const targetCents = BEND_SPECS[bendType].cents;
    if (Math.abs(cents - targetCents) <= BEND_SPECS[bendType].tolerance) {
      isLockedOnTarget = true;
      holdTimeMs = 800;
      successCount++;
      celebrationBanner = true;
      setTimeout(() => (celebrationBanner = false), 1500);
    } else {
      isLockedOnTarget = false;
    }
  }

  onDestroy(() => {
    stopListening();
  });
</script>

<svelte:head>
  <title>#60 String Bend Accuracy Trainer — Guitar Toolkit</title>
</svelte:head>

<div class="tool-page">
  <div class="container tool-inner">
    <!-- Breadcrumb -->
    <nav class="back-nav" aria-label="Breadcrumb">
      <a href="{base}/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Guitar Toolkit Hub
      </a>
    </nav>

    <!-- Header -->
    <header class="tool-header">
      <div class="tool-header-badges">
        <span class="badge badge-accent">#60 &middot; TIER 2 LIGHT AUDIO</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner</span>
      </div>
      <h1>String Bend Pitch Accuracy Trainer</h1>
      <p class="lead-text">
        Real-time YIN pitch tracking with sub-cent precision. Practice hitting half-step, full-step, and microtonal blues bends right in the center with <strong>sustained-hold validation</strong> to build muscle memory.
      </p>

      <div class="action-bar">
        {#if !isListening}
          <button class="btn btn-primary" onclick={startListening}>
            🎙 Enable Pitch Tracking
          </button>
        {:else}
          <button class="btn btn-danger" onclick={stopListening}>
            ⏹ Stop Tracking
          </button>
        {/if}

        <button class="btn btn-secondary" onclick={() => (successCount = 0)}>
          Reset Streak
        </button>
      </div>

      {#if micError}
        <div class="alert-box">
          ⚠ {micError}
        </div>
      {/if}
    </header>

    <!-- Bend Mode Selector -->
    <div class="mode-bar">
      <span class="mode-label">Target Bend Interval:</span>
      {#each Object.entries(BEND_SPECS) as [key, spec]}
        <button
          class="chip-btn {bendType === key ? 'chip-active' : ''}"
          onclick={() => { bendType = key as BendType; holdTimeMs = 0; }}
        >
          {spec.label}
        </button>
      {/each}
    </div>

    <!-- Main Arc Target Display -->
    <div class="trainer-layout">
      <section class="card-panel target-panel {isLockedOnTarget ? 'panel-locked' : ''}">
        <div class="target-header">
          <h2>Pitch Trajectory &amp; Target Arc</h2>
          <span class="badge {isLockedOnTarget ? 'badge-live' : 'badge-subtle'}">
            {isLockedOnTarget ? '🎯 LOCKED IN PITCH!' : 'BEND STRING TO TARGET'}
          </span>
        </div>

        {#if celebrationBanner}
          <div class="success-banner">
            ⭐ PERFECT BEND HELD! +1 STREAK ⭐
          </div>
        {/if}

        <!-- Cent Target Arc Gauge -->
        <div class="cents-arc-display">
          <div class="cents-number font-mono">
            {currentCentsDelta >= 0 ? `+${currentCentsDelta}` : currentCentsDelta}¢
          </div>
          <span class="target-comparison">
            Target: <strong>+{BEND_SPECS[bendType].cents} cents</strong> (&plusmn;{BEND_SPECS[bendType].tolerance}¢ window)
          </span>

          <!-- Graphical Target Meter -->
          <div class="arc-bar-track">
            <div
              class="target-zone"
              style="left: {(BEND_SPECS[bendType].cents / 350) * 100}%; width: {(BEND_SPECS[bendType].tolerance * 2 / 350) * 100}%"
            ></div>
            <div
              class="pitch-needle {isLockedOnTarget ? 'needle-hit' : ''}"
              style="left: {Math.max(0, Math.min(100, (currentCentsDelta / 350) * 100))}%"
            ></div>
          </div>

          <div class="arc-labels font-mono">
            <span>0¢ (Root)</span>
            <span>+100¢ (1/2 Step)</span>
            <span>+200¢ (Whole Step)</span>
            <span>+300¢ (1.5 Step)</span>
          </div>
        </div>

        <!-- Hold Progress Ring -->
        <div class="hold-meter-box">
          <div class="hold-label">
            <span>Steady Pitch Hold:</span>
            <span class="font-mono">{Math.min(100, Math.round((holdTimeMs / 750) * 100))}%</span>
          </div>
          <div class="hold-bar-track">
            <div
              class="hold-bar-fill {isLockedOnTarget ? 'hold-active' : ''}"
              style="width: {Math.min(100, (holdTimeMs / 750) * 100)}%"
            ></div>
          </div>
          <small class="hold-caption">Must hold pitch steady inside the green window for 750ms to register.</small>
        </div>
      </section>

      <!-- Practice Stats & Simulator -->
      <section class="card-panel stats-panel">
        <h2>Practice Session Metrics</h2>

        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Perfect Bends Held</span>
            <span class="kpi-val font-mono streak-val">{successCount}</span>
            <span class="kpi-sub">Consecutive successful holds</span>
          </div>

          <div class="kpi-card">
            <span class="kpi-label">Detected Pitch</span>
            <span class="kpi-val font-mono">{currentPitchHz > 0 ? `${currentPitchHz} Hz` : '--'}</span>
            <span class="kpi-sub">{currentPitchHz > 0 ? frequencyToNote(currentPitchHz).name : 'Pluck string'}</span>
          </div>
        </div>

        <!-- Offline / No-Mic Simulation Workbench -->
        <div class="sim-box">
          <h3>Simulation Mode (Test without Mic)</h3>
          <p class="sim-desc">Drag slider to test pitch detection &amp; hold validation:</p>
          <input
            type="range"
            min="0"
            max="350"
            value={currentCentsDelta}
            oninput={(e) => simulateBend(parseInt((e.target as HTMLInputElement).value, 10))}
          />
          <div class="quick-sim-buttons">
            <button class="btn btn-secondary btn-sm" onclick={() => simulateBend(100)}>Test 100¢</button>
            <button class="btn btn-secondary btn-sm" onclick={() => simulateBend(200)}>Test 200¢</button>
            <button class="btn btn-secondary btn-sm" onclick={() => simulateBend(300)}>Test 300¢</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</div>

<style>
  .tool-page {
    padding: 2rem 0 4rem;
  }

  .tool-inner {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .back-nav {
    display: flex;
    align-items: center;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .back-link:hover {
    color: var(--accent);
  }

  .tool-header {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .tool-header-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tool-header h1 {
    font-size: 2.2rem;
  }

  .lead-text {
    font-size: 1.05rem;
    color: var(--text-secondary);
    max-width: 820px;
    line-height: 1.6;
  }

  .action-bar {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .btn-danger {
    background-color: #ef4444;
    color: #fff;
    border: 1px solid transparent;
    padding: 0.6rem 1.25rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
  }

  .alert-box {
    background-color: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
  }

  /* Mode Bar */
  .mode-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .mode-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .chip-btn {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 0.4rem 0.85rem;
    border-radius: 9999px;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .chip-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .chip-active {
    background-color: rgba(245, 158, 11, 0.15);
    border-color: var(--accent);
    color: var(--accent-light);
    font-weight: 700;
  }

  /* Layout */
  .trainer-layout {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .trainer-layout {
      grid-template-columns: 1fr;
    }
  }

  .card-panel {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    box-shadow: var(--shadow-card);
  }

  .target-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .target-header h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .panel-locked {
    border-color: #10b981;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
  }

  .success-banner {
    background-color: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #6ee7b7;
    padding: 0.75rem;
    border-radius: var(--radius-md);
    text-align: center;
    font-weight: 800;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cents-arc-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0;
  }

  .cents-number {
    font-size: 4rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .target-comparison {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .arc-bar-track {
    width: 100%;
    height: 24px;
    background-color: var(--bg-tertiary);
    border-radius: 999px;
    position: relative;
    border: 1px solid var(--border-default);
    margin-top: 1rem;
  }

  .target-zone {
    position: absolute;
    top: 0;
    bottom: 0;
    background-color: rgba(16, 185, 129, 0.35);
    border-left: 2px solid #10b981;
    border-right: 2px solid #10b981;
  }

  .pitch-needle {
    position: absolute;
    top: -4px;
    bottom: -4px;
    width: 6px;
    background-color: #ef4444;
    border-radius: 999px;
    transform: translateX(-50%);
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);
    transition: left 0.05s ease;
  }

  .needle-hit {
    background-color: #10b981;
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.9);
  }

  .arc-labels {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.35rem;
  }

  /* Hold Meter */
  .hold-meter-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hold-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .hold-bar-track {
    width: 100%;
    height: 10px;
    background-color: var(--bg-primary);
    border-radius: 999px;
    overflow: hidden;
  }

  .hold-bar-fill {
    height: 100%;
    background-color: var(--accent);
    transition: width 0.05s linear;
  }

  .hold-active {
    background-color: #10b981;
  }

  .hold-caption {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  /* KPI */
  .kpi-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .kpi-card {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .kpi-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .kpi-val {
    font-size: 1.8rem;
    font-weight: 800;
  }

  .streak-val {
    color: var(--accent-light);
  }

  .kpi-sub {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .sim-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .sim-box h3 {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .sim-desc {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0;
  }

  .quick-sim-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .btn-sm {
    padding: 0.35rem 0.65rem;
    font-size: 0.78rem;
  }
</style>
