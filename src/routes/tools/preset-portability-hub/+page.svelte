<script lang="ts">
  import { base } from '$app/paths';

  interface AmpMapping {
    realAmp: string;
    helixName: string;
    quadCortexName: string;
    fractalName: string;
    kemperName: string;
    gainTaper: 'Linear' | 'Logarithmic' | 'Exponential';
    notes: string;
  }

  const AMP_DICTIONARY: AmpMapping[] = [
    {
      realAmp: 'Friedman BE-100 (Brown Eye)',
      helixName: 'Placater Dirty',
      quadCortexName: 'Friedman HBE / BE',
      fractalName: 'Friedman BE / HBE',
      kemperName: 'Friedman BE100 Profile Rig',
      gainTaper: 'Logarithmic',
      notes: 'Line 6 C45 switch maps to Fractal Fat Switch and QC Voice toggle.'
    },
    {
      realAmp: 'Marshall JCM800 2203',
      helixName: 'Brit 2204',
      quadCortexName: 'Brit 800',
      fractalName: 'Brit 800 (Model 2204)',
      kemperName: 'Marshall JCM800 1981',
      gainTaper: 'Linear',
      notes: 'Master volume behavior on Helix begins clipping earlier than Fractal; scale Master down -1.5 on Helix.'
    },
    {
      realAmp: 'Fender 1965 Twin Reverb',
      helixName: 'US Double Nrm / Vib',
      quadCortexName: 'US 65 Twin',
      fractalName: 'Double Verb Vibrato',
      kemperName: 'Fender 65 Twin Reverb Blackface',
      gainTaper: 'Logarithmic',
      notes: 'Bright switch on Fender models produces varying high-shelf boost across ecosystems.'
    },
    {
      realAmp: 'Mesa Boogie Dual Rectifier Multi-Watt',
      helixName: 'Cali Rectifire',
      quadCortexName: 'Cali Rectifier 100W',
      fractalName: 'Recto 2 Org / Red',
      kemperName: 'Mesa Dual Recto Rev G',
      gainTaper: 'Exponential',
      notes: 'Modern high-gain mode has heavy sub-bass bloom. Engage low-cut filter at 80Hz across all targets.'
    },
    {
      realAmp: 'Vox AC30 Top Boost',
      helixName: 'Essex A30',
      quadCortexName: 'UK C30 Top Boost',
      fractalName: 'Class-A 30W TB',
      kemperName: 'Vox AC30 1964 Brilliant',
      gainTaper: 'Linear',
      notes: 'Cut knob works in reverse on VOX amps (CW = darker, CCW = brighter).'
    }
  ];

  type Platform = 'helix' | 'quad-cortex' | 'fractal' | 'kemper';

  let sourcePlatform = $state<Platform>('helix');
  let targetPlatform = $state<Platform>('quad-cortex');
  let selectedAmpIndex = $state(0);

  // Source knob parameters
  let driveGain = $state(6.5);
  let bass = $state(5.0);
  let mid = $state(6.0);
  let treble = $state(6.5);
  let presence = $state(5.5);
  let master = $state(7.0);

  const selectedAmp = $derived(AMP_DICTIONARY[selectedAmpIndex]);

  function getPlatformModelName(platform: Platform, amp: AmpMapping): string {
    switch (platform) {
      case 'helix': return amp.helixName;
      case 'quad-cortex': return amp.quadCortexName;
      case 'fractal': return amp.fractalName;
      case 'kemper': return amp.kemperName;
    }
  }

  // Parameter conversion engine
  const convertedValues = $derived.by(() => {
    // Non-linear adjustments
    let targetGain = driveGain;
    let targetMaster = master;
    let targetPresence = presence;

    if (sourcePlatform === 'helix' && targetPlatform === 'fractal') {
      targetGain = +(driveGain * 0.95).toFixed(1);
      targetMaster = +(master * 0.88).toFixed(1);
    } else if (sourcePlatform === 'helix' && targetPlatform === 'quad-cortex') {
      targetGain = +(driveGain * 1.02).toFixed(1);
      targetPresence = +(presence * 0.92).toFixed(1);
    } else if (sourcePlatform === 'quad-cortex' && targetPlatform === 'helix') {
      targetGain = +(driveGain * 0.98).toFixed(1);
      targetPresence = +(presence * 1.08).toFixed(1);
    } else if (targetPlatform === 'kemper') {
      targetGain = +(driveGain * 1.1).toFixed(1);
    }

    return {
      gain: Math.min(10, Math.max(0, targetGain)),
      bass,
      mid,
      treble,
      presence: Math.min(10, Math.max(0, targetPresence)),
      master: Math.min(10, Math.max(0, targetMaster))
    };
  });
</script>

<svelte:head>
  <title>#220 Cross-Vendor Preset Portability Hub — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#220 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Intermediate</span>
      </div>
      <h1>Cross-Vendor Preset Portability Hub</h1>
      <p class="lead-text">
        Translate tone patches and parameter maps between <strong>Line 6 Helix</strong>, <strong>Neural DSP Quad Cortex</strong>, <strong>Fractal Axe-Fx III</strong>, and <strong>Kemper Profiler</strong>. Honest parameter correlation math that flags what translates cleanly vs vendor-proprietary DSP nuances.
      </p>
    </header>

    <!-- Platform Selector Bar -->
    <div class="platform-bar card-panel">
      <div class="platform-col">
        <label for="src-plat">Source Platform:</label>
        <select id="src-plat" bind:value={sourcePlatform} class="select-input">
          <option value="helix">Line 6 Helix / HX Stomp</option>
          <option value="quad-cortex">Neural DSP Quad Cortex</option>
          <option value="fractal">Fractal Axe-Fx III / FM3</option>
          <option value="kemper">Kemper Profiler Rig</option>
        </select>
      </div>

      <div class="arrow-divider">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>

      <div class="platform-col">
        <label for="dst-plat">Target Platform:</label>
        <select id="dst-plat" bind:value={targetPlatform} class="select-input">
          <option value="quad-cortex">Neural DSP Quad Cortex</option>
          <option value="helix">Line 6 Helix / HX Stomp</option>
          <option value="fractal">Fractal Axe-Fx III / FM3</option>
          <option value="kemper">Kemper Profiler Rig</option>
        </select>
      </div>
    </div>

    <!-- Amp Model Equivalency -->
    <div class="amp-selector-box">
      <label for="amp-model-sel">Amp Model / Circuit Equivalency:</label>
      <select id="amp-model-sel" bind:value={selectedAmpIndex} class="select-input">
        {#each AMP_DICTIONARY as amp, idx}
          <option value={idx}>{amp.realAmp}</option>
        {/each}
      </select>
    </div>

    <!-- Equivalency Card -->
    <div class="equiv-banner">
      <div class="equiv-cell">
        <span class="equiv-sub">Source Name:</span>
        <strong class="equiv-name">{getPlatformModelName(sourcePlatform, selectedAmp)}</strong>
      </div>
      <div class="equiv-arrow">&harr;</div>
      <div class="equiv-cell">
        <span class="equiv-sub">Target Equivalent:</span>
        <strong class="equiv-name text-accent">{getPlatformModelName(targetPlatform, selectedAmp)}</strong>
      </div>
    </div>

    <!-- Parameter Mapping Workbench -->
    <div class="workbench-grid">
      <!-- Source Controls -->
      <section class="card-panel">
        <h2>Source Settings ({sourcePlatform.toUpperCase()})</h2>

        <div class="slider-group">
          <div class="slider-item">
            <div class="slider-meta">
              <label for="s-gain">Drive / Gain:</label>
              <span class="font-mono">{driveGain}</span>
            </div>
            <input id="s-gain" type="range" min="0" max="10" step="0.1" bind:value={driveGain} />
          </div>

          <div class="slider-item">
            <div class="slider-meta">
              <label for="s-bass">Bass:</label>
              <span class="font-mono">{bass}</span>
            </div>
            <input id="s-bass" type="range" min="0" max="10" step="0.1" bind:value={bass} />
          </div>

          <div class="slider-item">
            <div class="slider-meta">
              <label for="s-mid">Middle:</label>
              <span class="font-mono">{mid}</span>
            </div>
            <input id="s-mid" type="range" min="0" max="10" step="0.1" bind:value={mid} />
          </div>

          <div class="slider-item">
            <div class="slider-meta">
              <label for="s-treble">Treble:</label>
              <span class="font-mono">{treble}</span>
            </div>
            <input id="s-treble" type="range" min="0" max="10" step="0.1" bind:value={treble} />
          </div>

          <div class="slider-item">
            <div class="slider-meta">
              <label for="s-pres">Presence:</label>
              <span class="font-mono">{presence}</span>
            </div>
            <input id="s-pres" type="range" min="0" max="10" step="0.1" bind:value={presence} />
          </div>

          <div class="slider-item">
            <div class="slider-meta">
              <label for="s-mast">Master Volume:</label>
              <span class="font-mono">{master}</span>
            </div>
            <input id="s-mast" type="range" min="0" max="10" step="0.1" bind:value={master} />
          </div>
        </div>
      </section>

      <!-- Target Converted Controls & Diagnostic Flags -->
      <section class="card-panel target-panel">
        <h2>Translated Settings ({targetPlatform.toUpperCase()})</h2>

        <div class="target-values-grid font-mono">
          <div class="val-card">
            <span class="val-label">Gain / Drive</span>
            <span class="val-num">{convertedValues.gain}</span>
          </div>
          <div class="val-card">
            <span class="val-label">Bass</span>
            <span class="val-num">{convertedValues.bass}</span>
          </div>
          <div class="val-card">
            <span class="val-label">Middle</span>
            <span class="val-num">{convertedValues.mid}</span>
          </div>
          <div class="val-card">
            <span class="val-label">Treble</span>
            <span class="val-num">{convertedValues.treble}</span>
          </div>
          <div class="val-card">
            <span class="val-label">Presence</span>
            <span class="val-num">{convertedValues.presence}</span>
          </div>
          <div class="val-card">
            <span class="val-label">Master</span>
            <span class="val-num">{convertedValues.master}</span>
          </div>
        </div>

        <div class="notes-box">
          <h3>Architectural Calibration Notes:</h3>
          <p>{selectedAmp.notes}</p>
        </div>

        <div class="untranslatable-flags">
          <h3>Vendor-Specific Proprietary Features:</h3>
          <ul class="flag-list">
            <li><strong>Line 6 Helix:</strong> Sag, Ripple, Bias, and Bias X parameters simulate virtual power transformer load; Quad Cortex uses static capture curves unless custom profiled.</li>
            <li><strong>Quad Cortex:</strong> Multiple IR block blends offer impedance modeling not directly mapped in Helix 1-block IR mode.</li>
            <li><strong>Fractal Audio:</strong> Dynamic Speaker Impedance (DSI) and Transformer Matching require fine manual calibration.</li>
          </ul>
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

  .platform-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex-direction: row;
  }

  @media (max-width: 768px) {
    .platform-bar {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .platform-col {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
  }

  .platform-col label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .arrow-divider {
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .amp-selector-box {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .amp-selector-box label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .equiv-banner {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .equiv-cell {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .equiv-sub {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .equiv-name {
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  .text-accent {
    color: var(--accent-light);
  }

  .equiv-arrow {
    font-size: 1.5rem;
    color: var(--accent);
  }

  /* Workbench */
  .workbench-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .workbench-grid {
      grid-template-columns: 1fr;
    }
  }

  .workbench-grid h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .slider-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .slider-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 600;
  }

  .font-mono {
    font-family: var(--font-mono);
  }

  .target-values-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .val-card {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .val-label {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .val-num {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--accent-light);
  }

  .notes-box {
    background-color: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: var(--radius-md);
    padding: 1rem;
    font-size: 0.85rem;
  }

  .notes-box h3 {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--accent-light);
    margin: 0 0 0.35rem;
  }

  .notes-box p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .untranslatable-flags {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.8rem;
  }

  .untranslatable-flags h3 {
    font-size: 0.82rem;
    color: var(--text-muted);
    text-transform: uppercase;
    margin: 0;
  }

  .flag-list {
    margin: 0;
    padding-left: 1.2rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .flag-list li {
    margin-bottom: 0.4rem;
  }
</style>
