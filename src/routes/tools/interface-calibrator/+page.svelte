<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  interface InterfaceModel {
    id: string;
    brand: string;
    model: string;
    maxInstDbu: number;
    knobRangeDb: number;
    instImpedanceMohm: number;
    idealZeroGainTargetDbfs: number;
    notes: string;
  }

  const INTERFACES: InterfaceModel[] = [
    {
      id: 'focusrite-scarlett-g4',
      brand: 'Focusrite',
      model: 'Scarlett 2i2 / Solo (Gen 4)',
      maxInstDbu: 12.5,
      knobRangeDb: 69,
      instImpedanceMohm: 1.0,
      idealZeroGainTargetDbfs: -18.0,
      notes: 'Turn Gain knob fully counter-clockwise (0 dB). Gen 4 has +12.5 dBu max headroom; passive humbuckers peak around -12 dBFS.'
    },
    {
      id: 'ua-apollo-twin',
      brand: 'Universal Audio',
      model: 'Apollo Twin X / Solo (Hi-Z Input)',
      maxInstDbu: 12.2,
      knobRangeDb: 65,
      instImpedanceMohm: 1.0,
      idealZeroGainTargetDbfs: -18.0,
      notes: 'Unison preamp Hi-Z automatically sets 1MΩ load. Keep preamp clean without digital preamp coloring plugins in Unison slot.'
    },
    {
      id: 'motu-m2',
      brand: 'MOTU',
      model: 'M2 / M4 USB Interface',
      maxInstDbu: 16.0,
      knobRangeDb: 60,
      instImpedanceMohm: 1.0,
      idealZeroGainTargetDbfs: -18.0,
      notes: 'High headroom (+16 dBu). Humbuckers will read quieter at 0dB gain; set physical gain knob to approximately 9:30 o\'clock.'
    },
    {
      id: 'audient-id14',
      brand: 'Audient',
      model: 'iD14 / iD4 (Discrete JFET D.I.)',
      maxInstDbu: 12.0,
      knobRangeDb: 58,
      instImpedanceMohm: 1.0,
      idealZeroGainTargetDbfs: -18.0,
      notes: 'Class-A JFET DI introduces warm harmonic saturation when pushed. Keep peaks under -6 dBFS to avoid unwanted transistor breakup.'
    },
    {
      id: 'ssl-2',
      brand: 'Solid State Logic',
      model: 'SSL 2 / SSL 2+',
      maxInstDbu: 15.0,
      knobRangeDb: 62,
      instImpedanceMohm: 1.0,
      idealZeroGainTargetDbfs: -18.0,
      notes: 'Ensure Legacy 4K button is DISENGAGED when tracking clean DIs for NAM or neural models.'
    }
  ];

  interface PickupSpec {
    id: string;
    name: string;
    typicalPeakDbu: number;
    description: string;
  }

  const PICKUPS: PickupSpec[] = [
    { id: 'single-coil', name: 'Vintage Single-Coils (Strat / Tele)', typicalPeakDbu: 2.0, description: 'Low output, high dynamic transients. Needs gentle gain padding.' },
    { id: 'paf-humbucker', name: 'Vintage / PAF Humbuckers (Gibson Les Paul)', typicalPeakDbu: 4.8, description: 'Medium output. Standard calibration benchmark for most NAM captures.' },
    { id: 'high-output', name: 'Modern High-Gain / Active (EMG / Fishman)', typicalPeakDbu: 8.5, description: 'High output. Never apply interface preamp gain; keep knob at zero.' }
  ];

  let selectedInterfaceId = $state('focusrite-scarlett-g4');
  let selectedPickupId = $state('paf-humbucker');

  const currentInterface = $derived(
    INTERFACES.find((i) => i.id === selectedInterfaceId) || INTERFACES[0]
  );

  const currentPickup = $derived(
    PICKUPS.find((p) => p.id === selectedPickupId) || PICKUPS[0]
  );

  // Calibration Math
  const recommendedOffsetDb = $derived.by(() => {
    // Difference between interface headroom and pickup output compared to -18 dBFS standard
    const peakDbfsAtMinGain = currentPickup.typicalPeakDbu - currentInterface.maxInstDbu;
    // We want peak around -10 dBFS to -12 dBFS (average RMS at -18 dBFS)
    const delta = -10.0 - peakDbfsAtMinGain;
    return +delta.toFixed(1);
  });

  const knobClockPosition = $derived.by(() => {
    if (recommendedOffsetDb <= 0) return '7:00 (Fully Off / 0dB Gain)';
    if (recommendedOffsetDb < 3) return '8:30 (Slight touch above minimum)';
    if (recommendedOffsetDb < 6) return '9:30 o\'clock (~ +4 dB)';
    if (recommendedOffsetDb < 10) return '11:00 o\'clock (~ +8 dB)';
    return '12:00 o\'clock (Halfway)';
  });

  // Live Audio Meter
  let isListening = $state(false);
  let liveRmsDbfs = $state(-60);
  let peakDbfs = $state(-60);
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let mediaStream: MediaStream | null = null;
  let animId: number | null = null;

  async function startMonitoring() {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      isListening = true;
      runMeter();
    } catch {
      alert('Could not access microphone / audio input.');
    }
  }

  function stopMonitoring() {
    if (animId) cancelAnimationFrame(animId);
    if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
    if (audioCtx) audioCtx.close();
    isListening = false;
  }

  function runMeter() {
    if (!analyser) return;
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);

    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);

    const dbfs = rms > 0 ? Math.round(20 * Math.log10(rms)) : -80;
    liveRmsDbfs = Math.max(-80, Math.min(0, dbfs));
    if (liveRmsDbfs > peakDbfs) peakDbfs = liveRmsDbfs;

    animId = requestAnimationFrame(runMeter);
  }

  onDestroy(() => {
    stopMonitoring();
  });
</script>

<svelte:head>
  <title>#175 Audio Interface Input Gain &amp; Impedance Calibrator — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#175 &middot; TONE &amp; HARDWARE</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Audio Interface Input Gain &amp; Impedance Calibrator</h1>
      <p class="lead-text">
        The #1 reason amp modelers and NAM captures sound brittle or dull is <strong>interface input gain and impedance mismatch</strong>. Calibrate your interface preamp knob to hit industry-standard -18.0 dBFS target levels.
      </p>

      <div class="action-bar">
        {#if !isListening}
          <button class="btn btn-primary" onclick={startMonitoring}>
            🎙 Start Live Input Meter
          </button>
        {:else}
          <button class="btn btn-danger" onclick={stopMonitoring}>
            ⏹ Stop Input Meter
          </button>
          <button class="btn btn-secondary" onclick={() => (peakDbfs = -60)}>
            Reset Peak Hold
          </button>
        {/if}
      </div>
    </header>

    <!-- Configuration Grids -->
    <div class="cal-grid">
      <!-- Left Config -->
      <section class="card-panel">
        <h2>1. Select Hardware Setup</h2>

        <div class="form-group">
          <label for="iface-sel">Audio Interface Model:</label>
          <select id="iface-sel" bind:value={selectedInterfaceId} class="select-input">
            {#each INTERFACES as iface}
              <option value={iface.id}>{iface.brand} &mdash; {iface.model}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="pu-sel">Guitar Pickup Output Class:</label>
          <select id="pu-sel" bind:value={selectedPickupId} class="select-input">
            {#each PICKUPS as pu}
              <option value={pu.id}>{pu.name}</option>
            {/each}
          </select>
          <small class="pu-desc">{currentPickup.description}</small>
        </div>

        <div class="specs-box">
          <div class="spec-row">
            <span>Interface Max Inst Headroom:</span>
            <strong class="font-mono">+{currentInterface.maxInstDbu} dBu</strong>
          </div>
          <div class="spec-row">
            <span>Input Impedance:</span>
            <strong class="font-mono">{currentInterface.instImpedanceMohm} M&Omega; (Standard Hi-Z)</strong>
          </div>
          <div class="spec-row">
            <span>Preamp Gain Range:</span>
            <strong class="font-mono">{currentInterface.knobRangeDb} dB</strong>
          </div>
          <p class="iface-note">{currentInterface.notes}</p>
        </div>
      </section>

      <!-- Right Recommendation -->
      <section class="card-panel result-panel">
        <h2>2. Target Knob Calibration</h2>

        <div class="target-card">
          <span class="target-sub">Recommended Physical Preamp Knob Position:</span>
          <strong class="knob-clock">{knobClockPosition}</strong>
          <span class="gain-delta font-mono">
            Target Gain Adjustment: {recommendedOffsetDb > 0 ? `+${recommendedOffsetDb}` : recommendedOffsetDb} dB
          </span>
        </div>

        <!-- Live Level Meter -->
        <div class="meter-box">
          <div class="meter-header">
            <span>Live Input Level (dBFS):</span>
            <span class="font-mono">{liveRmsDbfs} dBFS (Peak: {peakDbfs} dBFS)</span>
          </div>

          <div class="meter-track">
            <div
              class="meter-fill"
              style="width: {Math.max(0, Math.min(100, ((liveRmsDbfs + 60) / 60) * 100))}%"
            ></div>
            <div class="target-line" style="left: 70%" title="Target -18 dBFS Sweet Spot"></div>
          </div>

          <div class="meter-scale font-mono">
            <span>-60 dBFS</span>
            <span>-30 dBFS</span>
            <span class="text-accent">-18 dBFS (Sweet Spot)</span>
            <span class="text-danger">0 dBFS (Clip)</span>
          </div>
        </div>

        <div class="daw-plugin-tip">
          <h3>DAW Plugin Compensation Setting:</h3>
          <p>If your interface gain knob is already locked at 0 dB, insert a Utility / Trim plugin as the <strong>first plugin on your guitar track</strong> and apply <strong>{recommendedOffsetDb > 0 ? `+${recommendedOffsetDb}` : recommendedOffsetDb} dB</strong>.</p>
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

  /* Grid */
  .cal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .cal-grid {
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

  .card-panel h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .form-group label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .pu-desc {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .specs-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .spec-row {
    display: flex;
    justify-content: space-between;
    color: var(--text-secondary);
  }

  .iface-note {
    margin: 0.5rem 0 0;
    padding-top: 0.5rem;
    border-top: 1px dashed var(--border-subtle);
    font-size: 0.78rem;
    color: var(--accent-light);
    line-height: 1.4;
  }

  /* Target Card */
  .target-card {
    background-color: var(--bg-tertiary);
    border: 2px solid var(--accent);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.4rem;
  }

  .target-sub {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 700;
  }

  .knob-clock {
    font-size: 1.8rem;
    color: var(--text-primary);
  }

  .gain-delta {
    font-size: 0.95rem;
    color: var(--accent-light);
    font-weight: 700;
  }

  /* Meter */
  .meter-box {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .meter-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    color: var(--text-secondary);
  }

  .meter-track {
    width: 100%;
    height: 14px;
    background-color: var(--bg-primary);
    border-radius: 999px;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border-default);
  }

  .meter-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981 70%, #f59e0b 85%, #ef4444);
    transition: width 0.05s ease;
  }

  .target-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #ffffff;
    box-shadow: 0 0 4px #000;
  }

  .meter-scale {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  .text-accent { color: var(--accent-light); font-weight: 700; }
  .text-danger { color: #ef4444; font-weight: 700; }

  .daw-plugin-tip {
    background-color: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.25);
    border-radius: var(--radius-md);
    padding: 1rem;
    font-size: 0.82rem;
  }

  .daw-plugin-tip h3 {
    margin: 0 0 0.35rem;
    color: #6ee7b7;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .daw-plugin-tip p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .font-mono {
    font-family: var(--font-mono);
  }
</style>
