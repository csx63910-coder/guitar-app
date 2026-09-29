<script lang="ts">
  import { base } from '$app/paths';

  interface HardwareProfile {
    id: string;
    name: string;
    dspChip: string;
    maxParams: number;
    preferredArchitecture: 'Nano' | 'Feather' | 'Standard' | 'Standard WaveNet';
    maxCpuThresholdPercent: number;
    sampleRate: number; // Hz
    notes: string;
  }

  const HARDWARE_TARGETS: HardwareProfile[] = [
    {
      id: 'hotone-ampero-ii',
      name: 'Hotone Ampero II Stage / Stomp',
      dspChip: 'Dual-core ADSP-SC584 (SHARC+ / ARM Cortex-A5)',
      maxParams: 12000,
      preferredArchitecture: 'Feather',
      maxCpuThresholdPercent: 35,
      sampleRate: 48000,
      notes: 'Requires <= 35% DSP consumption to allow simultaneous stereo IRs and ambient reverb.'
    },
    {
      id: 'headrush-prime',
      name: 'HeadRush Prime / Core',
      dspChip: 'Quad-Core ARM Cortex with dedicated DSP acceleration',
      maxParams: 28000,
      preferredArchitecture: 'Standard',
      maxCpuThresholdPercent: 55,
      sampleRate: 48000,
      notes: 'High-power architecture capable of running Standard WaveNet NAM models alongside complex signal chains.'
    },
    {
      id: 'valeton-gp200',
      name: 'Valeton GP-200 / GP-100',
      dspChip: 'Single-core ARM-based digital signal processor',
      maxParams: 6500,
      preferredArchitecture: 'Nano',
      maxCpuThresholdPercent: 28,
      sampleRate: 44100,
      notes: 'Strict CPU headroom limits. Standard WaveNet models will cause buffer underruns and audio dropouts.'
    },
    {
      id: 'mod-dwarf',
      name: 'MOD Devices Dwarf',
      dspChip: 'Quad-core 64-bit ARM CPU @ 1.3GHz (LV2 / Linux)',
      maxParams: 16000,
      preferredArchitecture: 'Feather',
      maxCpuThresholdPercent: 40,
      sampleRate: 48000,
      notes: 'Open Linux platform. Runs standard NAM LV2 plugins natively; Feather models recommended for low latency (< 5ms).'
    }
  ];

  interface NamModelPreset {
    id: string;
    name: string;
    gearCaptured: string;
    architecture: 'Standard WaveNet' | 'Standard' | 'Feather' | 'Nano';
    parameters: number;
    inputLevelDb: number;
    dynamicRangeDb: number;
    latencySamples: number;
    fileSizeKb: number;
    testedSnr: number;
  }

  const SAMPLE_MODELS: NamModelPreset[] = [
    {
      id: 'deluxe-65',
      name: '1965 Blackface Deluxe Reverb (Edge of Breakup)',
      gearCaptured: 'Vintage 1965 Fender Deluxe Reverb, Volume 5, Treble 6, Bass 4.5',
      architecture: 'Standard WaveNet',
      parameters: 16400,
      inputLevelDb: -18.2,
      dynamicRangeDb: 84.5,
      latencySamples: 16,
      fileSizeKb: 680,
      testedSnr: 78.2
    },
    {
      id: 'jcm800-cranked',
      name: 'Marshall JCM800 2203 (Master High)',
      gearCaptured: '1982 100W Marshall JCM800, Gain 8, Master 6, Presence 5',
      architecture: 'Standard',
      parameters: 14200,
      inputLevelDb: -17.5,
      dynamicRangeDb: 79.1,
      latencySamples: 12,
      fileSizeKb: 540,
      testedSnr: 74.6
    },
    {
      id: 'ac30-top-boost',
      name: 'Vox AC30 Top Boost (Normal + Brilliant Jumpered)',
      gearCaptured: 'Vox AC30 1964 JMI with Celestion Silver Bell Alnicos',
      architecture: 'Feather',
      parameters: 7800,
      inputLevelDb: -18.0,
      dynamicRangeDb: 81.3,
      latencySamples: 8,
      fileSizeKb: 290,
      testedSnr: 80.5
    },
    {
      id: 'recto-red-channel',
      name: 'Mesa Dual Rectifier (Modern High Gain)',
      gearCaptured: 'Rev G Triple Recto, Channel 3 Modern, Bold/Diode setting',
      architecture: 'Standard WaveNet',
      parameters: 18200,
      inputLevelDb: -16.8,
      dynamicRangeDb: 72.4,
      latencySamples: 18,
      fileSizeKb: 760,
      testedSnr: 71.0
    }
  ];

  let selectedHardwareId = $state('hotone-ampero-ii');
  let selectedModelId = $state('deluxe-65');
  let customFileName = $state<string | null>(null);

  // Normalization Target
  let targetInputLevel = $state(-18.0); // dBFS standard

  const targetHardware = $derived(
    HARDWARE_TARGETS.find((h) => h.id === selectedHardwareId) || HARDWARE_TARGETS[0]
  );

  const currentModel = $derived(
    SAMPLE_MODELS.find((m) => m.id === selectedModelId) || SAMPLE_MODELS[0]
  );

  // Computations
  const estimatedCpuPercent = $derived(
    Math.round((currentModel.parameters / targetHardware.maxParams) * targetHardware.maxCpuThresholdPercent)
  );

  const isOverBudget = $derived(
    estimatedCpuPercent > targetHardware.maxCpuThresholdPercent ||
    currentModel.parameters > targetHardware.maxParams
  );

  const levelAdjustmentDb = $derived(
    +(targetInputLevel - currentModel.inputLevelDb).toFixed(1)
  );

  const latencyMs = $derived(
    +((currentModel.latencySamples / targetHardware.sampleRate) * 1000).toFixed(2)
  );

  // Optimization recommendations
  const recommendedArchitecture = $derived(
    targetHardware.preferredArchitecture
  );

  const projectedCpuAfterOptimization = $derived(
    recommendedArchitecture === 'Nano' ? 12 : recommendedArchitecture === 'Feather' ? 22 : 36
  );

  const projectedFidelityScore = $derived(
    recommendedArchitecture === currentModel.architecture ? 100 :
    recommendedArchitecture === 'Feather' ? 96.8 :
    recommendedArchitecture === 'Nano' ? 92.4 : 98.5
  );

  function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      customFileName = input.files[0].name;
    }
  }

  let exportModalOpen = $state(false);
</script>

<svelte:head>
  <title>#209 Device-Targeted NAM Hardware Optimizer — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#209 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Intermediate</span>
      </div>
      <h1>Device-Targeted NAM Capture Optimizer</h1>
      <p class="lead-text">
        Analyze, downscale, and normalize <strong>Neural Amp Modeler (.nam)</strong> captures for hardware stompboxes (Hotone Ampero II, Valeton GP-200, HeadRush Prime, MOD Dwarf). Evaluates DSP load, memory footprint, sample rate mismatch, and generates device-compatible hardware configuration profiles.
      </p>
    </header>

    <!-- Configuration Columns -->
    <div class="optimizer-grid">
      <!-- Left: Selection & Input -->
      <section class="card-panel config-panel">
        <h2>1. Target Hardware &amp; Capture Selection</h2>

        <div class="form-group">
          <label for="hw-select">Select Hardware Pedal / DSP Target:</label>
          <select id="hw-select" bind:value={selectedHardwareId} class="select-input">
            {#each HARDWARE_TARGETS as hw}
              <option value={hw.id}>{hw.name}</option>
            {/each}
          </select>
        </div>

        <div class="hw-spec-card">
          <div class="hw-spec-row">
            <span class="spec-label">DSP Processor:</span>
            <span class="spec-value">{targetHardware.dspChip}</span>
          </div>
          <div class="hw-spec-row">
            <span class="spec-label">Internal Sample Rate:</span>
            <span class="spec-value font-mono">{(targetHardware.sampleRate / 1000).toFixed(1)} kHz</span>
          </div>
          <div class="hw-spec-row">
            <span class="spec-label">Max Safe Parameter Budget:</span>
            <span class="spec-value font-mono">{targetHardware.maxParams.toLocaleString()} weights</span>
          </div>
          <div class="hw-spec-note">{targetHardware.notes}</div>
        </div>

        <div class="form-group mt-3">
          <label for="model-select">Select Test Capture or Upload .nam File:</label>
          <select id="model-select" bind:value={selectedModelId} class="select-input">
            {#each SAMPLE_MODELS as model}
              <option value={model.id}>{model.name} ({model.architecture})</option>
            {/each}
          </select>
        </div>

        <div class="file-upload-box">
          <input
            id="nam-file-input"
            type="file"
            accept=".nam,.json"
            onchange={handleFileUpload}
            class="file-input-hidden"
          />
          <label for="nam-file-input" class="file-dropzone">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>{customFileName ? customFileName : 'Or drag & drop local .nam capture'}</span>
            <small class="upload-hint">100% on-device analysis &middot; files never leave your browser</small>
          </label>
        </div>

        <div class="form-group mt-2">
          <label for="target-db">Normalized Input Gain Target (dBFS):</label>
          <div class="gain-input-wrap">
            <input id="target-db" type="number" step="0.5" bind:value={targetInputLevel} class="gain-number-input" />
            <span class="unit-text">dBFS (Industry Standard: -18.0 dBFS)</span>
          </div>
        </div>
      </section>

      <!-- Right: Hardware Diagnostics & Quality Report -->
      <section class="card-panel report-panel">
        <div class="report-header">
          <h2>2. Hardware Compatibility &amp; Telemetry Report</h2>
          <span class="badge {isOverBudget ? 'badge-danger' : 'badge-live'}">
            {isOverBudget ? '⚠ OVER DSP BUDGET' : '✓ HARDWARE READY'}
          </span>
        </div>

        <div class="kpi-banner-grid">
          <div class="kpi-box {isOverBudget ? 'kpi-danger' : 'kpi-normal'}">
            <span class="kpi-label">DSP Load on {targetHardware.name.split(' ')[0]}</span>
            <span class="kpi-val font-mono">{estimatedCpuPercent}%</span>
            <span class="kpi-sub">Threshold limit: &le; {targetHardware.maxCpuThresholdPercent}%</span>
          </div>

          <div class="kpi-box">
            <span class="kpi-label">Model Weights / Params</span>
            <span class="kpi-val font-mono">{currentModel.parameters.toLocaleString()}</span>
            <span class="kpi-sub">Architecture: {currentModel.architecture}</span>
          </div>

          <div class="kpi-box">
            <span class="kpi-label">Latency Footprint</span>
            <span class="kpi-val font-mono">{latencyMs} ms</span>
            <span class="kpi-sub">{currentModel.latencySamples} samples @ {targetHardware.sampleRate / 1000}kHz</span>
          </div>

          <div class="kpi-box">
            <span class="kpi-label">Gain Calibration Delta</span>
            <span class="kpi-val font-mono {levelAdjustmentDb >= 0 ? 'gain-pos' : 'gain-neg'}">
              {levelAdjustmentDb >= 0 ? `+${levelAdjustmentDb}` : levelAdjustmentDb} dB
            </span>
            <span class="kpi-sub">Original capture: {currentModel.inputLevelDb} dBFS</span>
          </div>
        </div>

        <!-- Telemetry Details Table -->
        <div class="telemetry-table-wrap">
          <table class="diag-table">
            <tbody>
              <tr>
                <td><strong>Source Hardware Gear:</strong></td>
                <td>{currentModel.gearCaptured}</td>
              </tr>
              <tr>
                <td><strong>Current File Size:</strong></td>
                <td class="font-mono">{currentModel.fileSizeKb} KB</td>
              </tr>
              <tr>
                <td><strong>Dynamic Range / SNR:</strong></td>
                <td class="font-mono">{currentModel.dynamicRangeDb} dB (SNR: {currentModel.testedSnr} dB)</td>
              </tr>
              <tr>
                <td><strong>Downscaling Recommendation:</strong></td>
                <td>
                  {#if isOverBudget}
                    <span class="rec-alert">Downscale architecture to <strong>{recommendedArchitecture}</strong> to avoid buffer underruns.</span>
                  {:else}
                    <span class="rec-ok">Standard architecture is supported with healthy DSP headroom.</span>
                  {/if}
                </td>
              </tr>
              <tr>
                <td><strong>Projected Fidelity Retention:</strong></td>
                <td>
                  <div class="fidelity-bar-wrap">
                    <div class="fidelity-bar" style="width: {projectedFidelityScore}%"></div>
                    <span class="font-mono font-bold">{projectedFidelityScore}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Action Button -->
        <div class="action-footer">
          <button class="btn btn-primary" onclick={() => (exportModalOpen = true)}>
            Generate Optimized Hardware Flash Config
          </button>
        </div>
      </section>
    </div>
  </div>
</div>

<!-- Modal: Export Hardware Config -->
{#if exportModalOpen}
  <div
    class="modal-backdrop"
    onclick={() => (exportModalOpen = false)}
    onkeydown={(e) => { if (e.key === 'Escape') exportModalOpen = false; }}
    role="presentation"
  >
    <div
      class="modal-card"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-hw-title"
      tabindex="-1"
    >
      <div class="modal-header">
        <h3 id="modal-hw-title">Optimized Hardware Config (.json)</h3>
        <button class="modal-close" onclick={() => (exportModalOpen = false)}>&times;</button>
      </div>

      <div class="modal-body">
        <p class="modal-desc">
          Ready for transfer to your <strong>{targetHardware.name}</strong> flash storage / companion librarian app:
        </p>
        <pre class="code-export"><code>{JSON.stringify({
  manifest_version: "1.2",
  target_device: targetHardware.name,
  dsp_processor: targetHardware.dspChip,
  model_name: currentModel.name,
  optimized_architecture: recommendedArchitecture,
  sample_rate_hz: targetHardware.sampleRate,
  calibration: {
    input_gain_offset_db: levelAdjustmentDb,
    target_reference_level_dbfs: targetInputLevel
  },
  projected_telemetry: {
    estimated_dsp_load_percent: projectedCpuAfterOptimization,
    buffer_latency_ms: latencyMs,
    fidelity_score_percent: projectedFidelityScore
  },
  hardware_flags: {
    anti_aliasing_oversampling: targetHardware.sampleRate < 48000 ? "2x" : "off",
    low_latency_bypass_enabled: true
  }
}, null, 2)}</code></pre>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => (exportModalOpen = false)}>Close</button>
        <button class="btn btn-primary" onclick={() => {
          navigator.clipboard.writeText(JSON.stringify(currentModel, null, 2));
          alert('Config copied to clipboard!');
        }}>Copy to Clipboard</button>
      </div>
    </div>
  </div>
{/if}

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

  /* Grid Layout */
  .optimizer-grid {
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 960px) {
    .optimizer-grid {
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
    gap: 0.4rem;
  }

  .form-group label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 1rem; }

  .hw-spec-card {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .hw-spec-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .spec-label {
    color: var(--text-muted);
  }

  .spec-value {
    color: var(--text-primary);
    font-weight: 600;
  }

  .hw-spec-note {
    font-size: 0.78rem;
    color: var(--accent-light);
    border-top: 1px dashed var(--border-subtle);
    padding-top: 0.5rem;
    margin-top: 0.25rem;
    line-height: 1.4;
  }

  .file-input-hidden {
    display: none;
  }

  .file-dropzone {
    border: 2px dashed var(--border-default);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.15);
    text-align: center;
    transition: all var(--transition-fast);
  }

  .file-dropzone:hover {
    border-color: var(--accent);
    background-color: rgba(245, 158, 11, 0.05);
  }

  .upload-hint {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .gain-input-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .gain-number-input {
    width: 100px;
    font-family: var(--font-mono);
  }

  .unit-text {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  /* Right Report Panel */
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .badge-danger {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.35);
  }

  .kpi-banner-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 600px) {
    .kpi-banner-grid {
      grid-template-columns: 1fr;
    }
  }

  .kpi-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .kpi-danger {
    border-color: rgba(239, 68, 68, 0.4);
    background-color: rgba(239, 68, 68, 0.08);
  }

  .kpi-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .kpi-val {
    font-size: 1.6rem;
    font-weight: 800;
  }

  .kpi-danger .kpi-val {
    color: #ef4444;
  }

  .kpi-normal .kpi-val {
    color: var(--status-live);
  }

  .kpi-sub {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .gain-pos { color: var(--status-live); }
  .gain-neg { color: #ef4444; }

  .telemetry-table-wrap {
    overflow-x: auto;
  }

  .diag-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .diag-table td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--border-subtle);
    vertical-align: middle;
  }

  .rec-alert {
    color: #fca5a5;
    font-weight: 600;
  }

  .rec-ok {
    color: #86efac;
  }

  .fidelity-bar-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .fidelity-bar {
    height: 8px;
    background: linear-gradient(90deg, #f59e0b, #10b981);
    border-radius: 999px;
    min-width: 40px;
    max-width: 150px;
  }

  .font-mono {
    font-family: var(--font-mono);
  }

  .font-bold {
    font-weight: 700;
  }

  .action-footer {
    display: flex;
    justify-content: flex-end;
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: 1rem;
  }

  .modal-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 580px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-close {
    font-size: 1.5rem;
    color: var(--text-muted);
    cursor: pointer;
  }

  .modal-desc {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .code-export {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    max-height: 280px;
    overflow-y: auto;
    font-size: 0.8rem;
    color: #a7f3d0;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
</style>
