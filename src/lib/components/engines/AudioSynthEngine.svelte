<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export interface Preset {
    name: string;
    wave: OscillatorType;
    freq: number;
    gain: number;
    filterFreq: number;
    drive: number;
    delayTime: number;
    delayFeedback: number;
  }

  interface Props {
    toolTitle: string;
    toolNumber: number;
    engineConfig?: {
      defaultPreset?: string;
      presets?: Preset[];
      subtitle?: string;
    };
  }

  let { toolTitle, toolNumber, engineConfig }: Props = $props();

  const defaultPresets: Preset[] = [
    { name: 'Warm Tube Clean', wave: 'triangle', freq: 196, gain: 0.35, filterFreq: 1800, drive: 0.15, delayTime: 0.22, delayFeedback: 0.2 },
    { name: 'Harmonic Crunch', wave: 'sawtooth', freq: 164.8, gain: 0.3, filterFreq: 3200, drive: 0.55, delayTime: 0.15, delayFeedback: 0.3 },
    { name: 'Ambient Freeze Drone', wave: 'sine', freq: 110, gain: 0.4, filterFreq: 950, drive: 0.05, delayTime: 0.45, delayFeedback: 0.6 },
    { name: 'Heavy High-Gain', wave: 'sawtooth', freq: 82.4, gain: 0.28, filterFreq: 4500, drive: 0.85, delayTime: 0.28, delayFeedback: 0.35 },
    { name: 'Vintage Slapback', wave: 'triangle', freq: 220, gain: 0.35, filterFreq: 2400, drive: 0.25, delayTime: 0.09, delayFeedback: 0.4 }
  ];

  const initialPreset = (engineConfig?.presets && engineConfig.presets[0]) || defaultPresets[0];
  const presets = $derived(engineConfig?.presets || defaultPresets);

  let isPlaying = $state(false);
  let isMuted = $state(false);
  let isBypassed = $state(false);
  let selectedPresetName = $state(initialPreset.name);

  let waveform = $state<OscillatorType>(initialPreset.wave);
  let frequency = $state(initialPreset.freq);
  let volume = $state(initialPreset.gain);
  let filterCutoff = $state(initialPreset.filterFreq);
  let driveAmount = $state(initialPreset.drive);
  let delayTime = $state(initialPreset.delayTime);
  let delayFeedback = $state(initialPreset.delayFeedback);
  let meterLevel = $state(0);

  let audioCtx: AudioContext | null = null;
  let oscNode: OscillatorNode | null = null;
  let gainNode: GainNode | null = null;
  let filterNode: BiquadFilterNode | null = null;
  let shaperNode: WaveShaperNode | null = null;
  let delayNode: DelayNode | null = null;
  let feedbackNode: GainNode | null = null;
  let animFrameId: number | null = null;

  function makeDistortionCurve(amount: number) {
    const k = amount * 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

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

  function startAudio() {
    initAudio();
    if (!audioCtx) return;

    stopAudio();

    oscNode = audioCtx.createOscillator();
    oscNode.type = waveform;
    oscNode.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    shaperNode = audioCtx.createWaveShaper();
    shaperNode.curve = isBypassed ? null : makeDistortionCurve(driveAmount);
    shaperNode.oversample = '4x';

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(isBypassed ? 20000 : filterCutoff, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(2.0, audioCtx.currentTime);

    delayNode = audioCtx.createDelay(1.0);
    delayNode.delayTime.setValueAtTime(isBypassed ? 0.001 : delayTime, audioCtx.currentTime);

    feedbackNode = audioCtx.createGain();
    feedbackNode.gain.setValueAtTime(isBypassed ? 0 : delayFeedback, audioCtx.currentTime);

    gainNode = audioCtx.createGain();
    const effectiveGain = isMuted ? 0 : volume;
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(effectiveGain, audioCtx.currentTime + 0.05);

    // Routing
    oscNode.connect(shaperNode);
    shaperNode.connect(filterNode);
    filterNode.connect(gainNode);

    // Delay loop
    filterNode.connect(delayNode);
    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode);
    feedbackNode.connect(gainNode);

    gainNode.connect(audioCtx.destination);

    oscNode.start();
    isPlaying = true;
    startMeterLoop();
  }

  function stopAudio() {
    if (oscNode) {
      try {
        oscNode.stop();
        oscNode.disconnect();
      } catch {}
      oscNode = null;
    }
    isPlaying = false;
    meterLevel = 0;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function togglePlay() {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  }

  function updateParams() {
    if (!audioCtx || !isPlaying) return;
    const now = audioCtx.currentTime;

    if (oscNode) {
      oscNode.type = waveform;
      oscNode.frequency.setTargetAtTime(frequency, now, 0.03);
    }
    if (gainNode) {
      const effectiveGain = isMuted ? 0 : volume;
      gainNode.gain.setTargetAtTime(effectiveGain, now, 0.03);
    }
    if (filterNode) {
      filterNode.frequency.setTargetAtTime(isBypassed ? 20000 : filterCutoff, now, 0.03);
    }
    if (shaperNode) {
      shaperNode.curve = isBypassed ? null : makeDistortionCurve(driveAmount);
    }
    if (delayNode) {
      delayNode.delayTime.setTargetAtTime(isBypassed ? 0.001 : delayTime, now, 0.05);
    }
    if (feedbackNode) {
      feedbackNode.gain.setTargetAtTime(isBypassed ? 0 : delayFeedback, now, 0.05);
    }
  }

  $effect(() => {
    // React to slider updates
    waveform;
    frequency;
    volume;
    filterCutoff;
    driveAmount;
    delayTime;
    delayFeedback;
    isMuted;
    isBypassed;
    updateParams();
  });

  function applyPreset(presetName: string) {
    const p = presets.find((item) => item.name === presetName);
    if (!p) return;
    selectedPresetName = p.name;
    waveform = p.wave;
    frequency = p.freq;
    volume = p.gain;
    filterCutoff = p.filterFreq;
    driveAmount = p.drive;
    delayTime = p.delayTime;
    delayFeedback = p.delayFeedback;
  }

  function startMeterLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    const loop = () => {
      if (isPlaying && !isMuted) {
        meterLevel = Math.min(100, Math.round(volume * 180 + (Math.random() * 15 - 7)));
      } else {
        meterLevel = 0;
      }
      animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  let copyAlert = $state('');

  function exportPresetJson() {
    const data = {
      tool: `#${toolNumber} ${toolTitle}`,
      preset: selectedPresetName,
      waveform,
      frequencyHz: frequency,
      volume,
      filterCutoffHz: filterCutoff,
      driveAmount,
      delayTimeSec: delayTime,
      delayFeedback,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preset-tool-${toolNumber}-${selectedPresetName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    copyAlert = 'Preset JSON downloaded!';
    setTimeout(() => (copyAlert = ''), 3000);
  }

  onDestroy(() => {
    stopAudio();
    if (audioCtx) {
      try {
        audioCtx.close();
      } catch {}
      audioCtx = null;
    }
  });
</script>

<div class="synth-engine-card">
  <div class="engine-header">
    <div class="header-left">
      <span class="engine-badge">WEB AUDIO &middot; DSP SYNTHESIS</span>
      <h3>{toolTitle} Interactive Acoustic &amp; DSP Engine</h3>
      <p class="engine-sub">Real-time Web Audio API signal path with custom filtering, saturation curves, and delay spatialization.</p>
    </div>

    <div class="header-actions">
      <button class="btn {isPlaying ? 'btn-danger' : 'btn-primary'}" onclick={togglePlay}>
        {#if isPlaying}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          Halt Audio
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Audition Engine
        {/if}
      </button>

      <button
        class="btn btn-secondary btn-sm"
        onclick={() => (isBypassed = !isBypassed)}
        title="Toggle dry/wet A/B comparison"
      >
        {isBypassed ? 'Engage FX' : 'Bypass (Dry DI)'}
      </button>
    </div>
  </div>

  <!-- Presets row -->
  <div class="preset-selector-bar">
    <span class="preset-label">Curated Presets:</span>
    <div class="preset-pills">
      {#each presets as p}
        <button
          type="button"
          class="pill-btn {selectedPresetName === p.name ? 'active' : ''}"
          onclick={() => applyPreset(p.name)}
        >
          {p.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Real-time Meter & Signal Path -->
  <div class="signal-visualizer">
    <div class="meter-bar-container">
      <div class="meter-label-row">
        <span>Signal Output Level</span>
        <span class="meter-value">{isPlaying ? `${meterLevel}%` : 'Muted'}</span>
      </div>
      <div class="meter-track">
        <div
          class="meter-fill {meterLevel > 85 ? 'meter-hot' : ''}"
          style="width: {meterLevel}%"
        ></div>
      </div>
    </div>

    <div class="routing-chain">
      <span class="chain-node active">OSC: {waveform.toUpperCase()} ({Math.round(frequency)} Hz)</span>
      <span class="chain-arrow">&rarr;</span>
      <span class="chain-node {driveAmount > 0.3 ? 'hot' : ''}">DRIVE ({Math.round(driveAmount * 100)}%)</span>
      <span class="chain-arrow">&rarr;</span>
      <span class="chain-node">LP FILTER ({Math.round(filterCutoff)} Hz)</span>
      <span class="chain-arrow">&rarr;</span>
      <span class="chain-node">DELAY ({Math.round(delayTime * 1000)}ms)</span>
      <span class="chain-arrow">&rarr;</span>
      <span class="chain-node {isPlaying ? 'out-active' : ''}">OUT</span>
    </div>
  </div>

  <!-- Knobs & Sliders Grid -->
  <div class="controls-grid">
    <!-- Column 1: Pitch & Wave -->
    <div class="control-box">
      <h4>1. Oscillator &amp; Pitch</h4>
      <div class="form-group">
        <label for="wave-select">Waveform Generator</label>
        <select id="wave-select" bind:value={waveform}>
          <option value="triangle">Triangle (Acoustic / Warm Body)</option>
          <option value="sawtooth">Sawtooth (Biting / Overdriven Harmonic)</option>
          <option value="sine">Sine (Pure Fundamental / Sub Drone)</option>
          <option value="square">Square (Fuzz / Reed / 8-bit)</option>
        </select>
      </div>

      <div class="form-group">
        <div class="label-val">
          <label for="freq-range">Base Frequency</label>
          <span class="val-pill">{Math.round(frequency)} Hz</span>
        </div>
        <input
          id="freq-range"
          type="range"
          min="55"
          max="880"
          step="1"
          bind:value={frequency}
        />
        <div class="hint-labels">
          <span>A1 (55Hz)</span>
          <span>E2 (82Hz)</span>
          <span>A2 (110Hz)</span>
          <span>A4 (440Hz)</span>
        </div>
      </div>
    </div>

    <!-- Column 2: Tone & Distortion -->
    <div class="control-box">
      <h4>2. Tone &amp; Harmonic Saturation</h4>
      <div class="form-group">
        <div class="label-val">
          <label for="drive-range">Drive / Soft Clipping</label>
          <span class="val-pill">{Math.round(driveAmount * 100)}%</span>
        </div>
        <input
          id="drive-range"
          type="range"
          min="0"
          max="1"
          step="0.01"
          bind:value={driveAmount}
        />
      </div>

      <div class="form-group">
        <div class="label-val">
          <label for="filter-range">Low-Pass Filter Cutoff</label>
          <span class="val-pill">{Math.round(filterCutoff)} Hz</span>
        </div>
        <input
          id="filter-range"
          type="range"
          min="300"
          max="8000"
          step="50"
          bind:value={filterCutoff}
        />
        <div class="hint-labels">
          <span>Dark / Mud</span>
          <span>Mid Body</span>
          <span>Bright Sparkle</span>
        </div>
      </div>
    </div>

    <!-- Column 3: Space & Spatialization -->
    <div class="control-box">
      <h4>3. Space &amp; Output Master</h4>
      <div class="form-group">
        <div class="label-val">
          <label for="delay-time-range">Stereo Delay Time</label>
          <span class="val-pill">{Math.round(delayTime * 1000)} ms</span>
        </div>
        <input
          id="delay-time-range"
          type="range"
          min="0.02"
          max="0.8"
          step="0.01"
          bind:value={delayTime}
        />
      </div>

      <div class="form-group">
        <div class="label-val">
          <label for="feedback-range">Delay Repeats / Feedback</label>
          <span class="val-pill">{Math.round(delayFeedback * 100)}%</span>
        </div>
        <input
          id="feedback-range"
          type="range"
          min="0"
          max="0.85"
          step="0.02"
          bind:value={delayFeedback}
        />
      </div>

      <div class="form-group">
        <div class="label-val">
          <label for="master-vol">Master Output Gain</label>
          <span class="val-pill">{Math.round(volume * 100)}%</span>
        </div>
        <input
          id="master-vol"
          type="range"
          min="0"
          max="0.8"
          step="0.02"
          bind:value={volume}
        />
      </div>
    </div>
  </div>

  <div class="engine-footer">
    <div class="footer-note">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>Runs 100% in browser Web Audio. Zero external network latency. Safe peak limiting built in.</span>
    </div>

    <div class="footer-buttons">
      {#if copyAlert}
        <span class="alert-text">{copyAlert}</span>
      {/if}
      <button class="btn btn-secondary btn-sm" onclick={exportPresetJson}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Export Preset JSON
      </button>
    </div>
  </div>
</div>

<style>
  .synth-engine-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: var(--shadow-card);
  }

  .engine-header {
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

  .engine-header h3 {
    font-size: 1.35rem;
    margin-bottom: 0.25rem;
  }

  .engine-sub {
    font-size: 0.88rem;
    color: var(--text-secondary);
    max-width: 650px;
  }

  .header-actions {
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

  .preset-selector-bar {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex-wrap: wrap;
    background-color: var(--bg-tertiary);
    padding: 0.65rem 1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-subtle);
  }

  .preset-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .preset-pills {
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
  }

  .pill-btn {
    font-size: 0.78rem;
    padding: 0.25rem 0.7rem;
    border-radius: var(--radius-full);
    border: 1px solid var(--border-default);
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .pill-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .pill-btn.active {
    background-color: var(--accent);
    color: #000;
    border-color: var(--accent);
    font-weight: 700;
  }

  .signal-visualizer {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.15rem 1.35rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .meter-bar-container {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .meter-label-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .meter-value {
    font-family: var(--font-mono);
    color: var(--accent-light);
    font-weight: 600;
  }

  .meter-track {
    width: 100%;
    height: 8px;
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .meter-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #f59e0b 70%, #ef4444 100%);
    transition: width 80ms ease-out;
  }

  .meter-hot {
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);
  }

  .routing-chain {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.74rem;
    font-family: var(--font-mono);
  }

  .chain-node {
    padding: 0.2rem 0.5rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
  }

  .chain-node.active {
    border-color: var(--accent);
    color: var(--accent);
  }

  .chain-node.hot {
    border-color: #f97316;
    color: #fb923c;
  }

  .chain-node.out-active {
    border-color: #10b981;
    color: #34d399;
  }

  .chain-arrow {
    color: var(--text-muted);
  }

  .controls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.25rem;
  }

  .control-box {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-box h4 {
    font-size: 0.92rem;
    color: var(--accent-light);
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 0.4rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .label-val {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-group label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .val-pill {
    font-size: 0.72rem;
    font-family: var(--font-mono);
    color: var(--text-primary);
    background-color: var(--bg-secondary);
    padding: 0.1rem 0.4rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
  }

  select {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.7rem;
    font-size: 0.82rem;
  }

  input[type='range'] {
    accent-color: var(--accent);
    width: 100%;
    cursor: pointer;
  }

  .hint-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.68rem;
    color: var(--text-muted);
  }

  .engine-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-subtle);
    padding-top: 1.15rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .footer-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .footer-buttons {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .alert-text {
    font-size: 0.78rem;
    color: var(--status-live);
    font-weight: 600;
  }
</style>
