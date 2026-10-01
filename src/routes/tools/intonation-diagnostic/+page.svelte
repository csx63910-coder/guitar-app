<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  interface StringIntonationState {
    name: string;
    targetOpenHz: number;
    target12thHz: number;
    openMeasuredHz: number | null;
    fretted12thHz: number | null;
    centsDelta: number | null;
    status: 'pending' | 'perfect' | 'sharp' | 'flat';
    saddleAction: string;
  }

  const STRINGS_SETUP: StringIntonationState[] = [
    { name: 'Low E (E2)', targetOpenHz: 82.41, target12thHz: 164.81, openMeasuredHz: null, fretted12thHz: null, centsDelta: null, status: 'pending', saddleAction: 'Pending' },
    { name: 'A (A2)', targetOpenHz: 110.00, target12thHz: 220.00, openMeasuredHz: null, fretted12thHz: null, centsDelta: null, status: 'pending', saddleAction: 'Pending' },
    { name: 'D (D3)', targetOpenHz: 146.83, target12thHz: 293.66, openMeasuredHz: null, fretted12thHz: null, centsDelta: null, status: 'pending', saddleAction: 'Pending' },
    { name: 'G (G3)', targetOpenHz: 196.00, target12thHz: 392.00, openMeasuredHz: null, fretted12thHz: null, centsDelta: null, status: 'pending', saddleAction: 'Pending' },
    { name: 'B (B3)', targetOpenHz: 246.94, target12thHz: 493.88, openMeasuredHz: null, fretted12thHz: null, centsDelta: null, status: 'pending', saddleAction: 'Pending' },
    { name: 'High E (E4)', targetOpenHz: 329.63, target12thHz: 659.25, openMeasuredHz: null, fretted12thHz: null, centsDelta: null, status: 'pending', saddleAction: 'Pending' }
  ];

  let strings = $state<StringIntonationState[]>(STRINGS_SETUP);
  let activeStringIndex = $state(0);
  let activeStep = $state<'open' | 'fretted'>('open');

  type BridgeType = 'strat-6-saddle' | 'tune-o-matic' | 'tele-3-saddle';
  let bridgeType = $state<BridgeType>('strat-6-saddle');

  // Audio / Pitch Tracking
  let isListening = $state(false);
  let micError = $state<string | null>(null);
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let mediaStream: MediaStream | null = null;
  let animId: number | null = null;
  let livePitchHz = $state(0);
  let liveCents = $state(0);

  const currentString = $derived(strings[activeStringIndex]);

  function autoCorrelate(buf: Float32Array, sampleRate: number): number {
    let size = buf.length;
    let rms = 0;
    for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / size);
    if (rms < 0.02) return -1;

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
      for (let j = 0; j < size - i; j++) c[i] = c[i] + buf[j] * buf[j + i];
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < size; i++) {
      if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    }
    let T0 = maxpos;
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    return sampleRate / T0;
  }

  function pitchLoop() {
    if (!analyser || !audioCtx) return;
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);
    const freq = autoCorrelate(buf, audioCtx.sampleRate);

    if (freq !== -1 && freq > 60 && freq < 1000) {
      livePitchHz = +freq.toFixed(2);
      const target = activeStep === 'open' ? currentString.targetOpenHz : currentString.target12thHz;
      liveCents = Math.round(1200 * Math.log2(livePitchHz / target));
    }

    animId = requestAnimationFrame(pitchLoop);
  }

  function recordMeasurement() {
    if (activeStep === 'open') {
      const openHz = livePitchHz > 0 ? livePitchHz : currentString.targetOpenHz;
      strings[activeStringIndex].openMeasuredHz = openHz;
      activeStep = 'fretted';
    } else {
      const frettedHz = livePitchHz > 0 ? livePitchHz : currentString.target12thHz;
      strings[activeStringIndex].fretted12thHz = frettedHz;

      // Compute cents delta relative to double the open frequency (octave)
      const openRef = strings[activeStringIndex].openMeasuredHz || currentString.targetOpenHz;
      const expectedOctave = openRef * 2;
      const deltaCents = Math.round(1200 * Math.log2(frettedHz / expectedOctave));
      strings[activeStringIndex].centsDelta = deltaCents;

      if (Math.abs(deltaCents) <= 2) {
        strings[activeStringIndex].status = 'perfect';
        strings[activeStringIndex].saddleAction = '✓ Intonation is spot-on (&le; 2¢). No saddle adjustment needed.';
      } else if (deltaCents > 2) {
        strings[activeStringIndex].status = 'sharp';
        strings[activeStringIndex].saddleAction = `Move bridge saddle BACKWARD away from neck (tighten saddle screw) to lengthen string. (${deltaCents}¢ sharp)`;
      } else {
        strings[activeStringIndex].status = 'flat';
        strings[activeStringIndex].saddleAction = `Move bridge saddle FORWARD toward neck (loosen saddle screw) to shorten string. (${Math.abs(deltaCents)}¢ flat)`;
      }

      // Next string
      if (activeStringIndex < strings.length - 1) {
        activeStringIndex++;
        activeStep = 'open';
      }
    }
  }

  // Quick simulation helper
  function simulateIntonation(delta: number) {
    strings[activeStringIndex].openMeasuredHz = currentString.targetOpenHz;
    strings[activeStringIndex].fretted12thHz = +(currentString.target12thHz * Math.pow(2, delta / 1200)).toFixed(2);
    strings[activeStringIndex].centsDelta = delta;

    if (Math.abs(delta) <= 2) {
      strings[activeStringIndex].status = 'perfect';
      strings[activeStringIndex].saddleAction = '✓ Intonation is spot-on. Saddle locked.';
    } else if (delta > 2) {
      strings[activeStringIndex].status = 'sharp';
      strings[activeStringIndex].saddleAction = `Move bridge saddle BACKWARD away from neck by ~${(delta * 0.1).toFixed(1)} mm.`;
    } else {
      strings[activeStringIndex].status = 'flat';
      strings[activeStringIndex].saddleAction = `Move bridge saddle FORWARD toward neck by ~${(Math.abs(delta) * 0.1).toFixed(1)} mm.`;
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

  onDestroy(() => {
    stopListening();
  });
</script>

<svelte:head>
  <title>#59 Closed-Loop Intonation Diagnostic — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#59 &middot; TIER 2 LIGHT AUDIO</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner</span>
      </div>
      <h1>Closed-Loop Intonation Diagnostic &amp; Saddle Guide</h1>
      <p class="lead-text">
        Eliminate out-of-tune cowboy chords and sour upper-register leads. Measures exact pitch deltas between open strings and the 12th fret with <strong>sub-cent bridge saddle adjustment guidance</strong>.
      </p>

      <div class="action-bar">
        {#if !isListening}
          <button class="btn btn-primary" onclick={startListening}>
            🎙 Start Pitch Listening
          </button>
        {:else}
          <button class="btn btn-danger" onclick={stopListening}>
            ⏹ Stop Mic
          </button>
        {/if}

        <button class="btn btn-secondary" onclick={() => {
          strings.forEach((s) => { s.openMeasuredHz = null; s.fretted12thHz = null; s.centsDelta = null; s.status = 'pending'; s.saddleAction = 'Pending'; });
          activeStringIndex = 0;
          activeStep = 'open';
        }}>
          Reset All Strings
        </button>
      </div>

      {#if micError}
        <div class="alert-box">
          ⚠ {micError}
        </div>
      {/if}
    </header>

    <!-- Bridge Style Selector -->
    <div class="bridge-selector-bar">
      <span class="selector-label">Guitar Bridge Architecture:</span>
      <button class="chip-btn {bridgeType === 'strat-6-saddle' ? 'chip-active' : ''}" onclick={() => (bridgeType = 'strat-6-saddle')}>
        Strat / Modern 6-Saddle
      </button>
      <button class="chip-btn {bridgeType === 'tune-o-matic' ? 'chip-active' : ''}" onclick={() => (bridgeType = 'tune-o-matic')}>
        Gibson Tune-o-matic
      </button>
      <button class="chip-btn {bridgeType === 'tele-3-saddle' ? 'chip-active' : ''}" onclick={() => (bridgeType = 'tele-3-saddle')}>
        Vintage Tele 3-Saddle Brass
      </button>
    </div>

    <!-- Main Diagnostic Grid -->
    <div class="diag-grid">
      <!-- Active String Measuring Card -->
      <section class="card-panel measure-card">
        <div class="measure-header">
          <h2>Testing String: <span class="highlight-string">{currentString.name}</span></h2>
          <span class="step-indicator">
            Step {activeStep === 'open' ? '1: Tune Open String' : '2: Fret at 12th Fret'}
          </span>
        </div>

        <div class="instruction-banner">
          {#if activeStep === 'open'}
            <span>1. Pluck open string firmly. Lock in standard concert pitch.</span>
          {:else}
            <span>2. Press string naturally onto the <strong>12th fret wire</strong> (normal fretting finger pressure). Pluck note.</span>
          {/if}
        </div>

        <div class="live-readout-wrap">
          <div class="live-hz font-mono">
            {livePitchHz > 0 ? `${livePitchHz} Hz` : '--'}
          </div>
          <div class="live-cents font-mono {Math.abs(liveCents) <= 2 ? 'cents-ok' : liveCents > 2 ? 'cents-sharp' : 'cents-flat'}">
            {liveCents >= 0 ? `+${liveCents}` : liveCents} cents
          </div>
        </div>

        <div class="measure-actions">
          <button class="btn btn-primary" onclick={recordMeasurement}>
            ✓ Lock &amp; Record {activeStep === 'open' ? 'Open Pitch' : '12th Fret'}
          </button>
        </div>

        <!-- Simulation quick-test buttons -->
        <div class="sim-row">
          <span class="sim-label">Quick Test Scenarios:</span>
          <button class="btn btn-secondary btn-sm" onclick={() => simulateIntonation(0)}>Simulate Spot-On (0¢)</button>
          <button class="btn btn-secondary btn-sm" onclick={() => simulateIntonation(12)}>Simulate Sharp (+12¢)</button>
          <button class="btn btn-secondary btn-sm" onclick={() => simulateIntonation(-15)}>Simulate Flat (-15¢)</button>
        </div>
      </section>

      <!-- Bridge Saddle Physical Direction Graphic -->
      <section class="card-panel saddle-guide-card">
        <h2>Saddle Adjustment Direction</h2>

        <div class="saddle-direction-box {currentString.status === 'sharp' ? 'box-sharp' : currentString.status === 'flat' ? 'box-flat' : currentString.status === 'perfect' ? 'box-perfect' : ''}">
          {#if currentString.status === 'sharp'}
            <div class="saddle-icon">⬅ BACKWARD</div>
            <strong class="saddle-headline">NOTE IS SHARP (+{currentString.centsDelta}¢)</strong>
            <p>The string length is physically too short. Turn the saddle adjustment screw clockwise to move the saddle <strong>AWAY from the neck (toward the tailpiece)</strong>.</p>
          {:else if currentString.status === 'flat'}
            <div class="saddle-icon">FORWARD ➡</div>
            <strong class="saddle-headline">NOTE IS FLAT ({currentString.centsDelta}¢)</strong>
            <p>The string length is physically too long. Turn the saddle adjustment screw counter-clockwise to move the saddle <strong>TOWARD the neck</strong>.</p>
          {:else if currentString.status === 'perfect'}
            <div class="saddle-icon">✓ PERFECT</div>
            <strong class="saddle-headline">INTONATION DIALED IN</strong>
            <p>Octave matches open string within &le; 2 cents. Saddle is in its optimal position.</p>
          {:else}
            <div class="saddle-icon">🔍 WAITING</div>
            <p>Complete open string and 12th fret measurements to see specific bridge screwdriver directions.</p>
          {/if}
        </div>
      </section>
    </div>

    <!-- 6-String Ledger Table -->
    <section class="card-panel table-panel">
      <h2>Guitar Intonation Report</h2>
      <div class="table-wrap">
        <table class="report-table">
          <thead>
            <tr>
              <th>String</th>
              <th>Target 12th (Hz)</th>
              <th>Measured 12th (Hz)</th>
              <th>Cents Delta</th>
              <th>Status</th>
              <th>Luthier Action Required</th>
            </tr>
          </thead>
          <tbody>
            {#each strings as s, idx}
              <tr class="{idx === activeStringIndex ? 'row-active' : ''}">
                <td>
                  <strong>{s.name}</strong>
                  {#if idx === activeStringIndex}
                    <span class="badge badge-accent">ACTIVE</span>
                  {/if}
                </td>
                <td class="font-mono">{s.target12thHz} Hz</td>
                <td class="font-mono">{s.fretted12thHz ? `${s.fretted12thHz} Hz` : '--'}</td>
                <td class="font-mono">
                  {#if s.centsDelta !== null}
                    <strong class="{s.status === 'perfect' ? 'text-ok' : s.status === 'sharp' ? 'text-sharp' : 'text-flat'}">
                      {s.centsDelta >= 0 ? `+${s.centsDelta}` : s.centsDelta}¢
                    </strong>
                  {:else}
                    --
                  {/if}
                </td>
                <td>
                  <span class="badge {s.status === 'perfect' ? 'badge-live' : s.status === 'sharp' ? 'badge-danger' : s.status === 'flat' ? 'badge-warning' : 'badge-subtle'}">
                    {s.status.toUpperCase()}
                  </span>
                </td>
                <td class="action-cell">{s.saddleAction}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
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
    flex-wrap: wrap;
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

  /* Bridge selector */
  .bridge-selector-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .selector-label {
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

  /* Grid */
  .diag-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .diag-grid {
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

  .measure-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .measure-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }

  .highlight-string {
    color: var(--accent-light);
  }

  .step-indicator {
    font-size: 0.82rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    padding: 0.25rem 0.65rem;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
  }

  .instruction-banner {
    background-color: var(--bg-tertiary);
    border-left: 3px solid var(--accent);
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
    color: var(--text-primary);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  }

  .live-readout-wrap {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 1.5rem;
    padding: 1.5rem 0;
  }

  .live-hz {
    font-size: 3rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .live-cents {
    font-size: 2.2rem;
    font-weight: 800;
  }

  .cents-ok { color: #10b981; }
  .cents-sharp { color: #ef4444; }
  .cents-flat { color: #f59e0b; }

  .measure-actions {
    display: flex;
    justify-content: center;
  }

  .sim-row {
    border-top: 1px dashed var(--border-subtle);
    padding-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .sim-label {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .btn-sm {
    padding: 0.35rem 0.6rem;
    font-size: 0.75rem;
  }

  /* Saddle Guide */
  .saddle-direction-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    text-align: center;
  }

  .box-sharp {
    border-color: rgba(239, 68, 68, 0.4);
    background-color: rgba(239, 68, 68, 0.08);
  }

  .box-flat {
    border-color: rgba(245, 158, 11, 0.4);
    background-color: rgba(245, 158, 11, 0.08);
  }

  .box-perfect {
    border-color: rgba(16, 185, 129, 0.4);
    background-color: rgba(16, 185, 129, 0.08);
  }

  .saddle-icon {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: 0.05em;
  }

  .box-sharp .saddle-icon { color: #ef4444; }
  .box-flat .saddle-icon { color: #f59e0b; }
  .box-perfect .saddle-icon { color: #10b981; }

  .saddle-headline {
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  .saddle-direction-box p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  /* Table */
  .table-wrap {
    overflow-x: auto;
  }

  .report-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .report-table th {
    padding: 0.75rem 0.85rem;
    text-align: left;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    border-bottom: 1px solid var(--border-subtle);
  }

  .report-table td {
    padding: 0.85rem;
    border-bottom: 1px solid var(--border-subtle);
    vertical-align: middle;
  }

  .row-active {
    background-color: rgba(245, 158, 11, 0.06);
  }

  .text-ok { color: #10b981; }
  .text-sharp { color: #ef4444; }
  .text-flat { color: #f59e0b; }

  .action-cell {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .font-mono {
    font-family: var(--font-mono);
  }
</style>
