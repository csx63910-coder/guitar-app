<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  let isListening = $state(false);
  let micError = $state<string | null>(null);
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let mediaStream: MediaStream | null = null;
  let animFrameId: number | null = null;

  // Measurement State
  let currentDb = $state(45);
  let peakDb = $state(45);
  let avgDb = $state(45);
  let dosePercentage = $state(0);
  let doseInterval: any = null;

  // Calibration offset (default calibrated for typical laptop / phone mic SPL approximation)
  let calibrationOffset = $state(90); // Added to dBFS to approximate dBA SPL

  // Rehearsal Environments
  const ENV_PRESETS = [
    { name: 'Acoustic Guitar in Bedroom', typicalDb: 72, risk: 'Low', maxSafeTime: 'Safe indefinitely' },
    { name: 'Drummer + 15W Tube Amp', typicalDb: 94, risk: 'Moderate', maxSafeTime: '1 Hour (NIOSH)' },
    { name: 'Full Rock Band Rehearsal', typicalDb: 102, risk: 'High Danger', maxSafeTime: '10 Minutes without plugs' },
    { name: 'Club Stage Monitor Wedge', typicalDb: 108, risk: 'Critical', maxSafeTime: '< 2 Minutes' }
  ];

  function calculateSafeDurationMinutes(db: number): number {
    if (db < 85) return 480; // 8+ hours
    // NIOSH formula: T = 480 / (2 ^ ((L - 85) / 3))
    const minutes = 480 / Math.pow(2, (db - 85) / 3);
    return Math.max(0.1, +minutes.toFixed(1));
  }

  const safeDurationText = $derived.by(() => {
    if (currentDb < 85) return '8+ Hours (Safe for extended session)';
    const mins = calculateSafeDurationMinutes(currentDb);
    if (mins >= 60) return `${(mins / 60).toFixed(1)} Hours max daily exposure`;
    if (mins >= 1) return `${Math.round(mins)} Minutes max exposure without earplugs!`;
    return `${Math.round(mins * 60)} Seconds! High Risk of Tinnitus!`;
  });

  const meterColorClass = $derived.by(() => {
    if (currentDb < 80) return 'meter-safe';
    if (currentDb < 90) return 'meter-caution';
    if (currentDb < 100) return 'meter-danger';
    return 'meter-critical';
  });

  async function startMonitoring() {
    micError = null;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      isListening = true;
      runAnalysisLoop();

      // Dose accumulator tick every second
      doseInterval = setInterval(() => {
        if (currentDb >= 85) {
          const safeMins = calculateSafeDurationMinutes(currentDb);
          const safeSecs = safeMins * 60;
          // 1 second contributes (1 / safeSecs) * 100 percent
          const delta = (1 / safeSecs) * 100;
          dosePercentage = Math.min(100, +(dosePercentage + delta).toFixed(2));
        }
      }, 1000);
    } catch (err: any) {
      micError = err.message || 'Could not access microphone. Please grant mic permissions.';
      isListening = false;
    }
  }

  function stopMonitoring() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (doseInterval) clearInterval(doseInterval);
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

  function runAnalysisLoop() {
    if (!analyser) return;
    const dataArray = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(dataArray);

    // Calculate RMS
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);

    // Convert to dBFS
    const dbfs = rms > 0 ? 20 * Math.log10(rms) : -100;
    // Approximate dBA SPL with calibration
    const estimatedDba = Math.max(30, Math.min(130, Math.round(dbfs + calibrationOffset)));

    currentDb = estimatedDba;
    if (estimatedDba > peakDb) peakDb = estimatedDba;
    avgDb = Math.round(avgDb * 0.95 + estimatedDba * 0.05);

    animFrameId = requestAnimationFrame(runAnalysisLoop);
  }

  function resetPeak() {
    peakDb = currentDb;
    dosePercentage = 0;
  }

  onDestroy(() => {
    stopMonitoring();
  });
</script>

<svelte:head>
  <title>#58 Volume &amp; Hearing Safety Meter — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#58 &middot; TIER 2 LIGHT AUDIO</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner</span>
      </div>
      <h1>Volume &amp; Hearing Safety Meter</h1>
      <p class="lead-text">
        Real-time calibrated sound level meter (dBA SPL) with <strong>NIOSH / OSHA daily noise dose tracking</strong>. Protect your hearing during tube amp testing, band rehearsals, and live gigs before irreversible tinnitus or threshold shift occurs.
      </p>

      <div class="action-bar">
        {#if !isListening}
          <button class="btn btn-primary" onclick={startMonitoring}>
            🎙 Start Live Sound Meter
          </button>
        {:else}
          <button class="btn btn-danger" onclick={stopMonitoring}>
            ⏹ Stop Monitoring
          </button>
          <button class="btn btn-secondary" onclick={resetPeak}>
            Reset Peak &amp; Dose
          </button>
        {/if}
      </div>

      {#if micError}
        <div class="alert-box">
          ⚠ {micError}
        </div>
      {/if}
    </header>

    <!-- Main Meter Section -->
    <div class="meter-dashboard">
      <!-- Big Digital Readout -->
      <section class="card-panel readout-panel {meterColorClass}">
        <span class="readout-label">Estimated Sound Pressure Level</span>
        <div class="readout-hero">
          <span class="db-number font-mono">{currentDb}</span>
          <span class="db-unit">dBA SPL</span>
        </div>

        <!-- Horizontal LED VU Bar -->
        <div class="vu-track">
          <div
            class="vu-fill"
            style="width: {Math.max(5, Math.min(100, ((currentDb - 40) / 80) * 100))}%"
          ></div>
          <div class="vu-threshold" style="left: 56.25%" title="85 dBA Safe Limit"></div>
        </div>
        <div class="vu-scale font-mono">
          <span>40 dB</span>
          <span>60 dB</span>
          <span class="scale-danger">85 dB (NIOSH Limit)</span>
          <span>100 dB</span>
          <span class="scale-crit">120 dB</span>
        </div>

        <div class="exposure-status">
          <span class="status-title">Daily Permissible Exposure Time:</span>
          <strong class="status-value">{safeDurationText}</strong>
        </div>
      </section>

      <!-- Rehearsal Dose & Stats -->
      <section class="card-panel stats-panel">
        <h2>Rehearsal Session Exposure</h2>

        <div class="kpi-grid">
          <div class="kpi-item">
            <span class="kpi-label">Peak Volume</span>
            <span class="kpi-val font-mono">{peakDb} dBA</span>
          </div>

          <div class="kpi-item">
            <span class="kpi-label">Average Volume</span>
            <span class="kpi-val font-mono">{avgDb} dBA</span>
          </div>

          <div class="kpi-item">
            <span class="kpi-label">Accumulated Daily Dose</span>
            <span class="kpi-val font-mono {dosePercentage >= 100 ? 'text-danger' : dosePercentage >= 50 ? 'text-warn' : 'text-ok'}">
              {dosePercentage}%
            </span>
          </div>
        </div>

        <div class="dose-progress-box">
          <div class="dose-bar-wrap">
            <div
              class="dose-bar-fill {dosePercentage >= 100 ? 'dose-fill-danger' : ''}"
              style="width: {Math.min(100, dosePercentage)}%"
            ></div>
          </div>
          <span class="dose-caption">
            {dosePercentage >= 100 ? '🚨 DAILY SAFE DOSE EXCEEDED! Put in high-fidelity musician earplugs immediately!' : 'Accumulating exposure against 85 dBA standard.'}
          </span>
        </div>

        <!-- Calibration Slider -->
        <div class="calibration-box">
          <div class="cal-header">
            <label for="cal-slider">Microphone Calibration Offset:</label>
            <span class="font-mono">+{calibrationOffset} dB</span>
          </div>
          <input
            id="cal-slider"
            type="range"
            min="60"
            max="120"
            bind:value={calibrationOffset}
          />
          <small class="cal-hint">Adjust if using an external calibrated reference or SPL hardware meter.</small>
        </div>
      </section>
    </div>

    <!-- Reference Guide Table -->
    <section class="card-panel guide-panel">
      <h2>Guitarist Exposure Reference Benchmarks</h2>
      <div class="table-wrap">
        <table class="guide-table">
          <thead>
            <tr>
              <th>Musical Context</th>
              <th>Typical Volume</th>
              <th>NIOSH Safe Time</th>
              <th>Recommended Protection</th>
            </tr>
          </thead>
          <tbody>
            {#each ENV_PRESETS as env}
              <tr>
                <td><strong>{env.name}</strong></td>
                <td class="font-mono">{env.typicalDb} dBA</td>
                <td>{env.maxSafeTime}</td>
                <td>
                  <span class="badge {env.typicalDb < 85 ? 'badge-live' : env.typicalDb < 100 ? 'badge-warning' : 'badge-danger'}">
                    {env.typicalDb < 85 ? 'None Needed' : env.typicalDb < 100 ? '-15dB Earplugs' : '-25dB Custom Molds'}
                  </span>
                </td>
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

  /* Meter Layout */
  .meter-dashboard {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .meter-dashboard {
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

  .readout-panel {
    align-items: center;
    text-align: center;
    border-width: 2px;
    transition: all 0.2s ease;
  }

  .meter-safe { border-color: #10b981; }
  .meter-caution { border-color: #f59e0b; }
  .meter-danger { border-color: #ef4444; }
  .meter-critical { border-color: #dc2626; animation: pulse 1s infinite alternate; }

  @keyframes pulse {
    from { box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
    to { box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); }
  }

  .readout-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .readout-hero {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .db-number {
    font-size: 5rem;
    font-weight: 800;
    line-height: 1;
    color: var(--text-primary);
  }

  .meter-safe .db-number { color: #10b981; }
  .meter-caution .db-number { color: #f59e0b; }
  .meter-danger .db-number { color: #ef4444; }
  .meter-critical .db-number { color: #dc2626; }

  .db-unit {
    font-size: 1.25rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .vu-track {
    width: 100%;
    height: 18px;
    background-color: var(--bg-primary);
    border-radius: 999px;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border-default);
  }

  .vu-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #f59e0b 60%, #ef4444 85%);
    transition: width 0.1s ease;
  }

  .vu-threshold {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #ffffff;
    box-shadow: 0 0 4px #000;
  }

  .vu-scale {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .scale-danger { color: #f59e0b; font-weight: 700; }
  .scale-crit { color: #ef4444; font-weight: 700; }

  .exposure-status {
    margin-top: 1rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .status-title {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .status-value {
    font-size: 1.15rem;
    color: var(--accent-light);
  }

  /* Stats Panel */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .kpi-item {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 0.85rem;
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
    font-size: 1.25rem;
    font-weight: 800;
  }

  .text-danger { color: #ef4444; }
  .text-warn { color: #f59e0b; }
  .text-ok { color: #10b981; }

  .dose-progress-box {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .dose-bar-wrap {
    width: 100%;
    height: 12px;
    background-color: var(--bg-tertiary);
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid var(--border-subtle);
  }

  .dose-bar-fill {
    height: 100%;
    background-color: var(--accent);
    transition: width 0.3s ease;
  }

  .dose-fill-danger {
    background-color: #ef4444;
  }

  .dose-caption {
    font-size: 0.78rem;
    color: var(--text-secondary);
  }

  .calibration-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .cal-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    color: var(--text-secondary);
    font-weight: 600;
  }

  .cal-hint {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  /* Guide Table */
  .guide-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;
  }

  .guide-table th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    border-bottom: 1px solid var(--border-subtle);
  }

  .guide-table td {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .badge-danger {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.35);
  }

  .badge-warning {
    background-color: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.35);
  }
</style>
