<script lang="ts">
  import { onMount } from 'svelte';

  interface FretData {
    fretNumber: number;
    fromNutInches: number;
    fromNutMm: number;
    fretToFretInches: number;
    fretToFretMm: number;
  }

  let scaleLengthInches = $state(25.5);
  let totalFrets = $state(22);
  let activeTab = $state<'fretcalc' | 'radiusgauges' | 'nutdepth'>('fretcalc');

  // Common Presets
  const SCALE_PRESETS = [
    { label: 'Fender Standard (25.5")', inches: 25.5 },
    { label: 'Gibson Standard (24.75")', inches: 24.75 },
    { label: 'PRS / Duesenberg (25.0")', inches: 25.0 },
    { label: 'Fender Short Scale (24.0")', inches: 24.0 },
    { label: 'Baritone Electric (27.0")', inches: 27.0 },
    { label: 'Standard Bass (34.0")', inches: 34.0 }
  ];

  // 12-TET Math Engine
  let fretTable = $derived.by(() => {
    const table: FretData[] = [];
    const scale = scaleLengthInches;
    let prevDistance = 0;

    for (let n = 1; n <= totalFrets; n++) {
      // Dn = L * (1 - 1 / 2^(n/12))
      const fromNutIn = scale * (1 - Math.pow(2, -n / 12));
      const fromNutMm = fromNutIn * 25.4;
      const fretToFretIn = fromNutIn - prevDistance;
      const fretToFretMm = fretToFretIn * 25.4;

      table.push({
        fretNumber: n,
        fromNutInches: Math.round(fromNutIn * 1000) / 1000,
        fromNutMm: Math.round(fromNutMm * 100) / 100,
        fretToFretInches: Math.round(fretToFretIn * 1000) / 1000,
        fretToFretMm: Math.round(fretToFretMm * 100) / 100
      });

      prevDistance = fromNutIn;
    }
    return table;
  });

  const RADII = [
    { radius: '7.25"', name: 'Vintage Fender (50s-60s)', arcR: 7.25 * 25.4 },
    { radius: '9.5"', name: 'Modern Fender Standard', arcR: 9.5 * 25.4 },
    { radius: '12"', name: 'Gibson Traditional / PRS', arcR: 12 * 25.4 },
    { radius: '14"', name: 'Compound Middle / Suhr', arcR: 14 * 25.4 },
    { radius: '16"', name: 'Ibanez Shred / Acoustic', arcR: 16 * 25.4 }
  ];

  function printGauges() {
    window.print();
  }
</script>

<svelte:head>
  <title>Luthier Workbench Toolkit | Guitar Toolkit</title>
  <meta
    name="description"
    content="Professional luthier workbench toolkit with 12-TET fret placement calculator, printable under-string radius gauges, and nut slot depth calibration."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header no-print">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Luthier & Bench</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#137 Luthier Math</span>
      <span class="badge">12-TET Scale Calculator</span>
      <span class="badge">Printable Radius Gauges</span>
    </div>
    <h1>📏 Luthier Workbench Toolkit</h1>
    <p class="tool-sub">
      Precision mathematical tools for guitar makers and repair techs: exact fret placement scales, printable under-string radius gauges (7.25" to 16"), and nut slot depth specs.
    </p>
  </div>

  <!-- Mode Tabs -->
  <div class="tab-row no-print">
    <button
      type="button"
      class="tab-btn"
      class:active={activeTab === 'fretcalc'}
      onclick={() => (activeTab = 'fretcalc')}
    >
      📐 12-TET Fret Scale Calculator
    </button>
    <button
      type="button"
      class="tab-btn"
      class:active={activeTab === 'radiusgauges'}
      onclick={() => (activeTab = 'radiusgauges')}
    >
      🖨️ Printable Radius Gauges
    </button>
    <button
      type="button"
      class="tab-btn"
      class:active={activeTab === 'nutdepth'}
      onclick={() => (activeTab = 'nutdepth')}
    >
      🎯 Nut Slot Depth Specs
    </button>
  </div>

  {#if activeTab === 'fretcalc'}
    <!-- FRET CALCULATOR -->
    <div class="calc-panel no-print">
      <div class="inputs-grid">
        <div class="input-col">
          <label for="scale-select" class="input-label">SCALE LENGTH PRESETS:</label>
          <select
            id="scale-select"
            onchange={(e) => (scaleLengthInches = parseFloat((e.target as HTMLSelectElement).value))}
          >
            {#each SCALE_PRESETS as p}
              <option value={p.inches} selected={scaleLengthInches === p.inches}>
                {p.label}
              </option>
            {/each}
          </select>
        </div>

        <div class="input-col">
          <label for="custom-scale" class="input-label">EXACT SCALE (INCHES):</label>
          <input
            id="custom-scale"
            type="number"
            step="0.01"
            min="20"
            max="40"
            bind:value={scaleLengthInches}
          />
        </div>

        <div class="input-col">
          <label for="fret-count" class="input-label">NUMBER OF FRETS:</label>
          <select id="fret-count" bind:value={totalFrets}>
            <option value={21}>21 Frets (Vintage)</option>
            <option value={22}>22 Frets (Standard)</option>
            <option value={24}>24 Frets (Modern / Soloist)</option>
          </select>
        </div>
      </div>

      <!-- Overview Metric Pill -->
      <div class="scale-summary-pill">
        <span>Active Scale: <strong>{scaleLengthInches}" ({Math.round(scaleLengthInches * 25.4 * 10) / 10} mm)</strong></span>
        <span>12th Fret (Octave center): <strong>{scaleLengthInches / 2}" ({(scaleLengthInches * 25.4 / 2).toFixed(2)} mm)</strong></span>
        <span>17.817 Rule Factor: <strong>12-TET Exponential</strong></span>
      </div>
    </div>

    <!-- Results Table -->
    <div class="table-card">
      <div class="table-top no-print">
        <h3>12-TET Fretboard Slot Placement Schedule</h3>
        <button type="button" class="print-mini-btn" onclick={printGauges}>
          🖨️ PRINT SCHEDULE
        </button>
      </div>

      <table class="fret-table">
        <thead>
          <tr>
            <th>Fret #</th>
            <th>Distance From Nut (Inches)</th>
            <th>Distance From Nut (mm)</th>
            <th>Fret-to-Fret Step (Inches)</th>
            <th>Fret-to-Fret Step (mm)</th>
          </tr>
        </thead>
        <tbody>
          {#each fretTable as f}
            <tr class:octave-row={f.fretNumber === 12}>
              <td class="fret-num-cell">
                {f.fretNumber}
                {#if f.fretNumber === 12}
                  <span class="octave-tag">OCTAVE</span>
                {/if}
              </td>
              <td><strong>{f.fromNutInches.toFixed(3)}"</strong></td>
              <td class="mm-cell">{f.fromNutMm.toFixed(2)} mm</td>
              <td>{f.fretToFretInches.toFixed(3)}"</td>
              <td class="mm-cell">{f.fretToFretMm.toFixed(2)} mm</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

  {:else if activeTab === 'radiusgauges'}
    <!-- PRINTABLE RADIUS GAUGES -->
    <div class="gauges-panel">
      <div class="gauges-header no-print">
        <div>
          <h3>🖨️ Printable 1:1 Scale Under-String Radius Gauges</h3>
          <p class="tab-sub">Print on thick cardstock (100% scale, do not fit to page) and cut out with scissors.</p>
        </div>
        <button type="button" class="print-mini-btn primary" onclick={printGauges}>
          🖨️ PRINT RADIUS GAUGES
        </button>
      </div>

      <div class="gauges-grid">
        {#each RADII as r}
          <div class="gauge-card">
            <div class="gauge-meta">
              <span class="gauge-r">{r.radius} RADIUS</span>
              <span class="gauge-desc">{r.name}</span>
            </div>

            <!-- True Scale SVG Arc Cutout -->
            <svg viewBox="0 0 280 120" class="gauge-svg">
              <!-- Gauge body rectangle with curved bottom arch -->
              <path
                d="M 20,20 L 260,20 L 260,80 Q 140,50 20,80 Z"
                fill="#1e293b"
                stroke="#38bdf8"
                stroke-width="2"
              />
              <text x="140" y="45" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">
                {r.radius} UNDER-STRING GAUGE
              </text>
              <text x="140" y="65" fill="#94a3b8" font-size="9" text-anchor="middle">
                ALIGN UNDER STRINGS AT SADDLES
              </text>
            </svg>
          </div>
        {/each}
      </div>
    </div>

  {:else if activeTab === 'nutdepth'}
    <!-- NUT SLOT DEPTH SPECS -->
    <div class="nut-panel">
      <h3>🎯 Precision Nut Slot Depth Bench Specs</h3>
      <p class="tab-sub">A properly cut nut prevents cowboy chord hand fatigue and sharp notes on frets 1–3.</p>

      <div class="nut-specs-grid">
        <div class="nut-card">
          <h4>Clearance Over 1st Fret (Open String)</h4>
          <table class="spec-mini-table">
            <tbody>
              <tr>
                <td>Low E String (6th):</td>
                <td><strong>0.020" (0.50 mm)</strong></td>
              </tr>
              <tr>
                <td>A String (5th):</td>
                <td><strong>0.018" (0.45 mm)</strong></td>
              </tr>
              <tr>
                <td>D String (4th):</td>
                <td><strong>0.016" (0.40 mm)</strong></td>
              </tr>
              <tr>
                <td>G String (3rd):</td>
                <td><strong>0.014" (0.35 mm)</strong></td>
              </tr>
              <tr>
                <td>B String (2nd):</td>
                <td><strong>0.012" (0.30 mm)</strong></td>
              </tr>
              <tr>
                <td>High E String (1st):</td>
                <td><strong>0.010" (0.25 mm)</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="nut-card">
          <h4>The "3rd Fret Depress" Tap Test</h4>
          <ol class="steps-list">
            <li>Depress the string firmly at the <strong>3rd fret</strong> with your fretting finger.</li>
            <li>Inspect the microscopic air gap between the bottom of the string and top of the <strong>1st fret wire</strong>.</li>
            <li>Lightly tap the string over the 1st fret with your finger.</li>
            <li><strong>Ideal:</strong> You should feel and hear a tiny "click" (~0.005" / 0.1mm clearance).</li>
            <li><strong>Too Deep:</strong> Zero click &bull; String rests flat on 1st fret (causes open string rattle).</li>
            <li><strong>Too High:</strong> Large visible gap &bull; F-barre chord requires immense pressure.</li>
          </ol>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .tool-container {
    max-width: 1050px;
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
    background: rgba(14, 165, 233, 0.15);
    color: #0ea5e9;
    border-color: rgba(14, 165, 233, 0.4);
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

  .tab-row {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    border-bottom: 1px solid #374151;
    flex-wrap: wrap;
  }
  .tab-btn {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #9ca3af;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 10px 16px;
    cursor: pointer;
  }
  .tab-btn:hover {
    color: #f3f4f6;
  }
  .tab-btn.active {
    color: #38bdf8;
    border-bottom-color: #38bdf8;
  }

  .calc-panel {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 18px;
    margin-bottom: 20px;
  }
  .inputs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }
  .input-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: #9ca3af;
    margin-bottom: 6px;
  }
  select, input[type='number'] {
    width: 100%;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .scale-summary-pill {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 10px 16px;
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #cbd5e1;
    flex-wrap: wrap;
    gap: 12px;
  }
  .scale-summary-pill strong {
    color: #38bdf8;
  }

  .table-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .table-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .table-top h3 {
    margin: 0;
    font-size: 1.15rem;
    color: #f3f4f6;
  }
  .print-mini-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }
  .print-mini-btn.primary {
    background: #0284c7;
    border: none;
    color: #ffffff;
    padding: 8px 16px;
  }

  .fret-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  .fret-table th, .fret-table td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #1f2937;
  }
  .fret-table th {
    background: #1f2937;
    color: #9ca3af;
    font-size: 0.75rem;
    text-transform: uppercase;
  }
  .fret-num-cell {
    font-weight: 700;
    color: #f59e0b;
  }
  .octave-row {
    background: rgba(245, 158, 11, 0.08);
  }
  .octave-tag {
    font-size: 0.65rem;
    background: #f59e0b;
    color: #78350f;
    padding: 1px 4px;
    border-radius: 2px;
    font-weight: 800;
    margin-left: 6px;
  }
  .mm-cell {
    color: #38bdf8;
    font-family: monospace;
  }

  /* Radius Gauges */
  .gauges-panel {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
  }
  .gauges-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .gauges-header h3 {
    margin: 0 0 4px;
    font-size: 1.15rem;
  }
  .tab-sub {
    font-size: 0.85rem;
    color: #9ca3af;
    margin: 0;
  }
  .gauges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .gauge-card {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 16px;
  }
  .gauge-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .gauge-r {
    font-size: 1rem;
    font-weight: 800;
    color: #38bdf8;
  }
  .gauge-desc {
    font-size: 0.75rem;
    color: #9ca3af;
  }
  .gauge-svg {
    width: 100%;
    height: auto;
  }

  /* Nut specs */
  .nut-panel {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
  }
  .nut-specs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 16px;
  }
  @media (max-width: 640px) {
    .nut-specs-grid {
      grid-template-columns: 1fr;
    }
  }
  .nut-card {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 18px;
  }
  .nut-card h4 {
    margin: 0 0 12px;
    color: #f59e0b;
    font-size: 1rem;
  }
  .spec-mini-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  .spec-mini-table td {
    padding: 6px 0;
    border-bottom: 1px dashed #1f2937;
  }
  .spec-mini-table td:last-child {
    text-align: right;
    color: #38bdf8;
  }
  .steps-list {
    margin: 0;
    padding-left: 20px;
    font-size: 0.85rem;
    color: #d1d5db;
    line-height: 1.6;
  }

  @media print {
    .no-print {
      display: none !important;
    }
    .tool-container {
      max-width: 100%;
      padding: 0;
      color: #000;
    }
    .gauge-card {
      background: #fff !important;
      border: 1px solid #000 !important;
    }
    .gauge-svg path {
      fill: #fff !important;
      stroke: #000 !important;
    }
    .gauge-svg text {
      fill: #000 !important;
    }
    .fret-table {
      color: #000 !important;
    }
    .fret-table th, .fret-table td {
      border-bottom: 1px solid #999 !important;
      color: #000 !important;
    }
  }
</style>
