<script lang="ts">
  export interface CalcParam {
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    idealMin: number;
    idealMax: number;
    description: string;
  }

  export interface CalcPreset {
    name: string;
    values: Record<string, number>;
    description?: string;
  }

  interface Props {
    toolTitle: string;
    toolNumber: number;
    engineConfig?: {
      parameters?: CalcParam[];
      presets?: CalcPreset[];
      formulaType?: string;
      customFormulaNote?: string;
    };
  }

  let { toolTitle, toolNumber, engineConfig }: Props = $props();

  const defaultParams: CalcParam[] = [
    {
      id: 'action12th',
      label: '12th Fret Low E Action',
      value: 1.8,
      min: 0.8,
      max: 4.0,
      step: 0.1,
      unit: 'mm',
      idealMin: 1.5,
      idealMax: 2.2,
      description: 'Height from crown of 12th fret to bottom of 6th string.'
    },
    {
      id: 'relief',
      label: 'Neck Relief (7th Fret)',
      value: 0.25,
      min: 0.05,
      max: 0.8,
      step: 0.05,
      unit: 'mm',
      idealMin: 0.2,
      idealMax: 0.35,
      description: 'Gap with string capoed at fret 1 and fretted at fret 17.'
    },
    {
      id: 'pickupHeight',
      label: 'Bridge Pickup Distance',
      value: 2.5,
      min: 1.0,
      max: 6.0,
      step: 0.2,
      unit: 'mm',
      idealMin: 2.0,
      idealMax: 3.5,
      description: 'Distance from magnetic polepiece to string depressed at last fret.'
    },
    {
      id: 'stringTension',
      label: 'Overall String Tension',
      value: 105,
      min: 70,
      max: 160,
      step: 1,
      unit: 'lbs',
      idealMin: 95,
      idealMax: 125,
      description: 'Total combined tensile pull on neck and bridge under concert pitch.'
    }
  ];

  const defaultPresets: CalcPreset[] = [
    {
      name: 'Standard Modern Electric',
      values: { action12th: 1.7, relief: 0.25, pickupHeight: 2.4, stringTension: 104 },
      description: 'Balanced low action suitable for chords and bending without excessive buzz.'
    },
    {
      name: 'Vintage Fender Spec',
      values: { action12th: 2.1, relief: 0.3, pickupHeight: 3.0, stringTension: 112 },
      description: 'Slightly higher action accommodating 7.25-inch vintage radius bends.'
    },
    {
      name: 'Ultra-Low Shredder',
      values: { action12th: 1.2, relief: 0.15, pickupHeight: 2.0, stringTension: 98 },
      description: 'Fast swept arpeggios on flat 14–16 inch radii; requires level frets.'
    },
    {
      name: 'Heavy Downtuned & Dropped',
      values: { action12th: 2.2, relief: 0.35, pickupHeight: 3.2, stringTension: 120 },
      description: 'Prevents string flub and fret clack on Drop D and C-standard tunings.'
    }
  ];

  let params = $state<CalcParam[]>(
    (engineConfig?.parameters || defaultParams).map((p) => ({ ...p }))
  );

  const presets = $derived(engineConfig?.presets || defaultPresets);
  let selectedPresetName = $state(presets[0]?.name || 'Standard Modern Electric');
  let copyMsg = $state('');

  function getStatus(p: CalcParam): { status: 'ideal' | 'caution' | 'warning'; label: string } {
    if (p.value >= p.idealMin && p.value <= p.idealMax) {
      return { status: 'ideal', label: 'OPTIMAL SPEC' };
    }
    const cautionLow = p.idealMin * 0.8;
    const cautionHigh = p.idealMax * 1.25;
    if (p.value >= cautionLow && p.value <= cautionHigh) {
      return { status: 'caution', label: 'ACCEPTABLE MARGIN' };
    }
    return { status: 'warning', label: 'OUT OF TOLERANCE' };
  }

  function applyPreset(name: string) {
    const preset = presets.find((pr) => pr.name === name);
    if (!preset) return;
    selectedPresetName = name;

    params = params.map((p) => {
      if (preset.values[p.id] !== undefined) {
        return { ...p, value: preset.values[p.id] };
      }
      return p;
    });
  }

  function exportSpecSheet() {
    const lines = [
      `# ${toolTitle} (#${toolNumber}) — Technical Specification Sheet`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Profile: ${selectedPresetName}`,
      '',
      '## Measured Metrics & Tolerance Status'
    ];

    params.forEach((p) => {
      const s = getStatus(p);
      lines.push(
        `- **${p.label}**: ${p.value} ${p.unit} [${s.label}] (Target: ${p.idealMin}–${p.idealMax} ${p.unit})`
      );
      lines.push(`  *Notes*: ${p.description}`);
    });

    const text = lines.join('\n');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      copyMsg = 'Specification report copied to clipboard!';
      setTimeout(() => (copyMsg = ''), 3000);
    }
  }

  function resetDefaults() {
    params = (engineConfig?.parameters || defaultParams).map((p) => ({ ...p }));
    selectedPresetName = presets[0]?.name || '';
  }
</script>

<div class="calc-engine-card">
  <div class="calc-header">
    <div class="calc-info">
      <span class="engine-badge">ENGINEERING &middot; SPEC CALCULATOR</span>
      <h3>{toolTitle} Calculation &amp; Tolerance Engine</h3>
      <p class="calc-sub">
        Accurate guitar geometry, electronic impedance, and physics tolerance analysis with live safety thresholds and workshop specs.
      </p>
    </div>

    <div class="calc-actions">
      <button class="btn btn-secondary btn-sm" onclick={resetDefaults}>
        Reset Defaults
      </button>
      <button class="btn btn-primary btn-sm" onclick={exportSpecSheet}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Copy Spec Report
      </button>
    </div>
  </div>

  <!-- Presets Bar -->
  <div class="preset-selector-bar">
    <span class="preset-label">Standard Reference Profiles:</span>
    <div class="preset-pills">
      {#each presets as pr}
        <button
          type="button"
          class="pill-btn {selectedPresetName === pr.name ? 'active' : ''}"
          onclick={() => applyPreset(pr.name)}
        >
          {pr.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Parameter Sliders Grid -->
  <div class="params-grid">
    {#each params as p (p.id)}
      {@const statusInfo = getStatus(p)}
      {@const minRatio = ((p.idealMin - p.min) / (p.max - p.min)) * 100}
      {@const maxRatio = ((p.idealMax - p.min) / (p.max - p.min)) * 100}
      {@const curRatio = Math.max(0, Math.min(100, ((p.value - p.min) / (p.max - p.min)) * 100))}
      <div class="param-card">
        <div class="param-top">
          <div class="param-meta">
            <h4>{p.label}</h4>
            <span class="param-desc">{p.description}</span>
          </div>
          <span class="status-pill status-{statusInfo.status}">
            {statusInfo.label}
          </span>
        </div>

        <div class="value-display-row">
          <span class="current-value">{p.value} <span class="unit">{p.unit}</span></span>
          <span class="target-range">Target: {p.idealMin}–{p.idealMax} {p.unit}</span>
        </div>

        <!-- Range Slider -->
        <input
          type="range"
          min={p.min}
          max={p.max}
          step={p.step}
          bind:value={p.value}
          class="param-slider slider-{statusInfo.status}"
        />

        <!-- Gauge Visualizer -->
        <div class="gauge-track">
          <div
            class="gauge-ideal-zone"
            style="left: {minRatio}%; width: {maxRatio - minRatio}%;"
            title="Optimal Window"
          ></div>
          <div
            class="gauge-pointer pointer-{statusInfo.status}"
            style="left: {curRatio}%;"
          ></div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Diagnostics & Workshop Tips -->
  <div class="diagnostics-box">
    <h4>Workshop Diagnostic Principles &amp; Tolerance Rules</h4>
    <div class="tips-grid">
      <div class="tip-card">
        <strong>Fret Buzz vs Action Tradeoff</strong>
        <p>If lowering action causes buzz between frets 1–5, the neck needs more relief (truss rod loosen). If buzzing occurs at frets 12–21, raise bridge saddle height.</p>
      </div>
      <div class="tip-card">
        <strong>Magnetic String Pull (Stratitis)</strong>
        <p>Pickups set closer than 2.0mm to the string generate wolf tones and unstable pitch due to magnetic polepiece damping. Keep neck pickups slightly lower than bridge.</p>
      </div>
      <div class="tip-card">
        <strong>Zero-Budget Workshop Rule</strong>
        <p>A standard plastic bank card measures roughly 0.76mm (0.030"). Two cards stacked equal 1.52mm — perfect as a quick action check at the 12th fret without digital calipers.</p>
      </div>
    </div>
  </div>

  {#if copyMsg}
    <div class="feedback-banner">{copyMsg}</div>
  {/if}
</div>

<style>
  .calc-engine-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: var(--shadow-card);
  }

  .calc-header {
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

  .calc-header h3 {
    font-size: 1.35rem;
    margin-bottom: 0.25rem;
  }

  .calc-sub {
    font-size: 0.88rem;
    color: var(--text-secondary);
    max-width: 650px;
  }

  .calc-actions {
    display: flex;
    gap: 0.65rem;
    align-items: center;
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

  .params-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.25rem;
  }

  .param-card {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .param-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .param-meta h4 {
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
    color: var(--text-primary);
  }

  .param-desc {
    font-size: 0.76rem;
    color: var(--text-muted);
    line-height: 1.35;
    display: block;
  }

  .status-pill {
    font-size: 0.7rem;
    font-weight: 800;
    font-family: var(--font-mono);
    padding: 0.15rem 0.55rem;
    border-radius: var(--radius-sm);
    white-space: nowrap;
  }

  .status-ideal {
    background-color: rgba(16, 185, 129, 0.12);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.4);
  }

  .status-caution {
    background-color: rgba(245, 158, 11, 0.12);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.4);
  }

  .status-warning {
    background-color: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.4);
  }

  .value-display-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .current-value {
    font-size: 1.45rem;
    font-weight: 800;
    font-family: var(--font-mono);
    color: var(--accent-light);
  }

  .unit {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .target-range {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .param-slider {
    width: 100%;
    cursor: pointer;
  }

  .gauge-track {
    width: 100%;
    height: 6px;
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-full);
    position: relative;
    overflow: visible;
    margin-top: 0.25rem;
  }

  .gauge-ideal-zone {
    position: absolute;
    top: 0;
    bottom: 0;
    background-color: rgba(16, 185, 129, 0.45);
    border-radius: var(--radius-full);
  }

  .gauge-pointer {
    position: absolute;
    top: -3px;
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
    transform: translateX(-50%);
    box-shadow: 0 1px 4px rgba(0,0,0,0.6);
  }

  .pointer-ideal {
    background-color: #10b981;
    border: 2px solid #fff;
  }

  .pointer-caution {
    background-color: #f59e0b;
    border: 2px solid #fff;
  }

  .pointer-warning {
    background-color: #ef4444;
    border: 2px solid #fff;
  }

  .diagnostics-box {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .diagnostics-box h4 {
    font-size: 0.95rem;
    color: var(--accent-light);
  }

  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
  }

  .tip-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .tip-card strong {
    font-size: 0.82rem;
    color: var(--text-primary);
  }

  .tip-card p {
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  .feedback-banner {
    background-color: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.35);
    padding: 0.65rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.82rem;
    font-weight: 600;
    text-align: center;
  }
</style>
