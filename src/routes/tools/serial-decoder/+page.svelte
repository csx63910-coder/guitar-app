<script lang="ts">
  import { decodeSerial, type DecodedSerialResult } from '$lib/utils/serialDecoder';
  import { base } from '$app/paths';

  let inputSerial = $state('82502542');
  let selectedBrand = $state('Auto');

  let result = $derived<DecodedSerialResult>(
    decodeSerial(inputSerial, selectedBrand)
  );

  function setPreset(brand: string, serial: string) {
    selectedBrand = brand;
    inputSerial = serial;
  }
</script>

<svelte:head>
  <title>#132 Serial Number Decoder & Authentication Guide — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#132 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Serial Number Decoder &amp; Counterfeit Checker</h1>
      <p class="lead-text">
        Decodes production year, manufacturing plant, and batch sequence across Gibson, Fender, Martin, and Ibanez. Includes an embedded database of known counterfeit serials and factory anomaly flags.
      </p>

      <!-- Quick Test Presets -->
      <div class="presets-row">
        <span class="presets-label">Test Samples:</span>
        <button class="preset-btn" onclick={() => setPreset('Gibson', '82502542')}>
          1982 Gibson Nashville
        </button>
        <button class="preset-btn" onclick={() => setPreset('Fender', 'US20145821')}>
          2020 Fender USA
        </button>
        <button class="preset-btn" onclick={() => setPreset('Martin', '365000')}>
          1975 Martin D-28
        </button>
        <button class="preset-btn" onclick={() => setPreset('Ibanez', 'F0612345')}>
          2006 Ibanez Fujigen
        </button>
        <button class="preset-btn btn-fake-test" onclick={() => setPreset('Gibson', '017160628')}>
          ⚠️ Test Known Fake (Chibson)
        </button>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="decoder-layout">
      <!-- Left Column: Input & Controls -->
      <section class="card-panel input-panel">
        <h2>Enter Serial Number</h2>
        <div class="form-group">
          <label for="brand-hint">Brand Selection:</label>
          <select id="brand-hint" bind:value={selectedBrand} class="select-input">
            <option value="Auto">Auto-Detect Brand</option>
            <option value="Gibson">Gibson USA / Custom Shop</option>
            <option value="Fender">Fender USA / Mexico / Japan</option>
            <option value="Martin">C.F. Martin &amp; Co.</option>
            <option value="Ibanez">Ibanez (Japan / Korea)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="serial-input">Serial Number (from headstock or neck block):</label>
          <input
            id="serial-input"
            type="text"
            bind:value={inputSerial}
            placeholder="e.g. 82502542, US20145821..."
            class="serial-text-input"
          />
        </div>

        <div class="brand-hints-box">
          <h4>Where to find serial numbers:</h4>
          <ul>
            <li><strong>Gibson:</strong> Stamped into the back of the headstock under lacquer.</li>
            <li><strong>Fender:</strong> Back of headstock or neck plate on vintage models.</li>
            <li><strong>Martin:</strong> Stamped on the solid mahogany neck block inside soundhole.</li>
            <li><strong>Ibanez:</strong> Printed on back of headstock behind tuner keys.</li>
          </ul>
        </div>
      </section>

      <!-- Right Column: Decoded Result & Authenticity Checks -->
      <section class="card-panel result-panel">
        <div class="result-header">
          <div>
            <span class="badge {result.counterfeitRisk.includes('High') ? 'badge-danger' : 'badge-live'}">
              {result.counterfeitRisk === 'Low' ? '● FORMAT VERIFIED' : result.counterfeitRisk.toUpperCase()}
            </span>
            <h2>{result.brand}</h2>
          </div>
          <span class="serial-tag">{result.serial}</span>
        </div>

        <!-- Metric Grid -->
        <div class="result-metrics">
          <div class="metric-box">
            <span class="m-label">Estimated Year</span>
            <span class="m-val">{result.year || 'Unknown / Variable'}</span>
          </div>
          <div class="metric-box">
            <span class="m-label">Manufacturing Plant</span>
            <span class="m-val">{result.factory || 'Multiple Facilities'}</span>
          </div>
          {#if result.batchOrSequence}
            <div class="metric-box">
              <span class="m-label">Sequence / Unit</span>
              <span class="m-val">{result.batchOrSequence}</span>
            </div>
          {/if}
          <div class="metric-box">
            <span class="m-label">Counterfeit Risk</span>
            <span class="m-val risk-{result.counterfeitRisk.toLowerCase().replace(/[^a-z]/g, '')}">
              {result.counterfeitRisk}
            </span>
          </div>
        </div>

        {#if result.notes}
          <div class="notes-box">
            <strong>Decoder Analysis:</strong>
            <p>{result.notes}</p>
          </div>
        {/if}

        <!-- Authenticity Inspection Checklist -->
        <div class="tips-box">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            Key Physical Authenticity Checks
          </h3>
          <ul class="tips-list">
            {#each result.authenticityTips as tip}
              <li>{tip}</li>
            {/each}
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
    transition: color var(--transition-fast);
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
    max-width: 800px;
    line-height: 1.6;
  }

  .presets-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .presets-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .preset-btn {
    font-size: 0.78rem;
    font-weight: 500;
    padding: 0.3rem 0.65rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .preset-btn:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .btn-fake-test {
    border-color: rgba(239, 68, 68, 0.4);
    color: #f87171;
  }

  .decoder-layout {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 1.75rem;
  }

  .card-panel {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: var(--shadow-card);
  }

  .input-panel h2 {
    font-size: 1.4rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .form-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .serial-text-input {
    font-family: var(--font-mono);
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 0.85rem 1rem;
    background-color: var(--bg-canvas);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    color: var(--accent-light);
  }

  .brand-hints-box {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    margin-top: auto;
  }

  .brand-hints-box h4 {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
  }

  .brand-hints-box ul {
    list-style: none;
    font-size: 0.8rem;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .brand-hints-box strong {
    color: var(--text-primary);
  }

  /* Result Panel */
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 1rem;
  }

  .result-header h2 {
    font-size: 1.8rem;
    margin-top: 0.35rem;
  }

  .serial-tag {
    font-family: var(--font-mono);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--accent);
    background-color: var(--accent-subtle);
    padding: 0.25rem 0.65rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--accent-border);
  }

  .badge-danger {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.35);
  }

  .result-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .metric-box {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .m-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .m-val {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .risk-low { color: var(--status-live); }
  .risk-medium { color: var(--accent-light); }
  .risk-highknownfakeserial { color: #ef4444; font-weight: 800; }

  .notes-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .notes-box strong {
    color: var(--accent);
    display: block;
    margin-bottom: 0.25rem;
  }

  .tips-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
  }

  .tips-box h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: var(--text-primary);
  }

  .tips-list {
    margin-left: 1.25rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    line-height: 1.5;
  }

  @media (max-width: 860px) {
    .decoder-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
