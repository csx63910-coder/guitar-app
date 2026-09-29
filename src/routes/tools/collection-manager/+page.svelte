<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  interface CollectionItem {
    id: string;
    brand: string;
    model: string;
    year: string;
    serial: string;
    finish: string;
    category: 'Electric Guitar' | 'Acoustic Guitar' | 'Bass' | 'Amplifier' | 'Vintage Effect';
    purchasePrice: number;
    purchaseDate: string;
    estimatedValue: number;
    condition: 'Mint' | 'Excellent' | 'Very Good' | 'Player Grade' | 'Fair / Relic';
    modifications: string;
    isInsured: boolean;
    policyNotes: string;
  }

  const STORAGE_KEY = 'guitar_toolkit_collection_manager';

  const defaultCollection: CollectionItem[] = [
    {
      id: 'col-1',
      brand: 'Fender',
      model: 'American Vintage II 1961 Stratocaster',
      year: '2023',
      serial: 'V2314589',
      finish: '3-Color Sunburst (Nitrocellulose)',
      category: 'Electric Guitar',
      purchasePrice: 2150,
      purchaseDate: '2024-03-15',
      estimatedValue: 2250,
      condition: 'Excellent',
      modifications: 'Raw Vintage tremolo springs installed; original parts in case.',
      isInsured: true,
      policyNotes: 'Scheduled under homeowner musical instrument floater #INS-891'
    },
    {
      id: 'col-2',
      brand: 'Gibson',
      model: 'Les Paul Standard 50s',
      year: '2021',
      serial: '214510342',
      finish: 'Heritage Cherry Sunburst',
      category: 'Electric Guitar',
      purchasePrice: 2499,
      purchaseDate: '2022-01-10',
      estimatedValue: 2600,
      condition: 'Excellent',
      modifications: 'Faber lightweight aluminum tailpiece.',
      isInsured: true,
      policyNotes: 'Scheduled under floater #INS-891'
    },
    {
      id: 'col-3',
      brand: 'C.F. Martin & Co.',
      model: '000-18 Standard',
      year: '2019',
      serial: '2314050',
      finish: 'Natural Aging Toner',
      category: 'Acoustic Guitar',
      purchasePrice: 2500,
      purchaseDate: '2020-05-20',
      estimatedValue: 2750,
      condition: 'Very Good',
      modifications: 'K&K Pure Mini soundboard transducer pickup professionally installed.',
      isInsured: false,
      policyNotes: 'Pending appraisal upload'
    }
  ];

  let items = $state<CollectionItem[]>(defaultCollection);

  // New item modal
  let showModal = $state(false);
  let formBrand = $state('Fender');
  let formModel = $state('');
  let formYear = $state('2024');
  let formSerial = $state('');
  let formFinish = $state('');
  let formCategory = $state<'Electric Guitar' | 'Acoustic Guitar' | 'Bass' | 'Amplifier' | 'Vintage Effect'>('Electric Guitar');
  let formPurchasePrice = $state(1200);
  let formPurchaseDate = $state(new Date().toISOString().split('T')[0]);
  let formEstValue = $state(1350);
  let formCondition = $state<'Mint' | 'Excellent' | 'Very Good' | 'Player Grade' | 'Fair / Relic'>('Excellent');
  let formMods = $state('All original');
  let formInsured = $state(true);
  let formPolicyNotes = $state('');

  onMount(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) items = parsed;
      }
    } catch {
      // Ignore
    }
  });

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }

  // Dashboard Metrics
  const totalValue = $derived(
    items.reduce((sum, i) => sum + i.estimatedValue, 0)
  );

  const totalCost = $derived(
    items.reduce((sum, i) => sum + i.purchasePrice, 0)
  );

  const unrealizedGain = $derived(totalValue - totalCost);

  const insuredCount = $derived(
    items.filter((i) => i.isInsured).length
  );

  const insuredPercentage = $derived(
    items.length > 0 ? Math.round((insuredCount / items.length) * 100) : 0
  );

  function addItem() {
    if (!formModel.trim()) return;

    items.push({
      id: `col-${Date.now()}`,
      brand: formBrand.trim(),
      model: formModel.trim(),
      year: formYear.trim(),
      serial: formSerial.trim(),
      finish: formFinish.trim(),
      category: formCategory,
      purchasePrice: formPurchasePrice,
      purchaseDate: formPurchaseDate,
      estimatedValue: formEstValue,
      condition: formCondition,
      modifications: formMods.trim(),
      isInsured: formInsured,
      policyNotes: formPolicyNotes.trim()
    });

    showModal = false;
    formModel = '';
    formSerial = '';
    saveToStorage();
  }

  function deleteItem(id: string) {
    if (confirm('Are you sure you want to delete this gear entry?')) {
      items = items.filter((i) => i.id !== id);
      saveToStorage();
    }
  }

  function printInsuranceSchedule() {
    window.print();
  }
</script>

<svelte:head>
  <title>#134 Guitar Collection Manager & Insurance Schedule — Guitar Toolkit</title>
</svelte:head>

<div class="tool-page">
  <div class="container tool-inner">
    <!-- Breadcrumb -->
    <nav class="back-nav no-print" aria-label="Breadcrumb">
      <a href="{base}/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Guitar Toolkit Hub
      </a>
    </nav>

    <!-- Header -->
    <header class="tool-header no-print">
      <div class="tool-header-badges">
        <span class="badge badge-accent">#134 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Guitar Collection &amp; Insurance Inventory</h1>
      <p class="lead-text">
        Private local-first catalog for your instruments, amps, and effects. Tracks serial numbers, purchase history, condition, and generates an official <strong>Printable Insurance Schedule</strong> formatted for underwriting policy riders.
      </p>

      <div class="header-action-row">
        <button class="btn btn-primary" onclick={() => (showModal = true)}>
          + Add Instrument to Vault
        </button>
        <button class="btn btn-secondary" onclick={printInsuranceSchedule}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print Insurance Schedule
        </button>
      </div>
    </header>

    <!-- Insurance Print Heading -->
    <div class="insurance-print-header print-only">
      <h1>SCHEDULE OF MUSICAL INSTRUMENTS &amp; EQUIPMENT</h1>
      <p>Prepared for Homeowners / Musical Instrument Insurance Policy Rider &middot; Certified Personal Inventory</p>
      <div class="print-meta-row">
        <span>Date Generated: {new Date().toLocaleDateString()}</span>
        <span>Total Items: {items.length}</span>
        <span>Total Declared Replacement Value: €{totalValue.toLocaleString()}</span>
      </div>
    </div>

    <!-- Portfolio KPI Summary -->
    <div class="kpi-grid no-print">
      <div class="kpi-card">
        <span class="kpi-label">Total Replacement Value</span>
        <span class="kpi-val price-val">€{totalValue.toLocaleString()}</span>
        <span class="kpi-sub">Across {items.length} collection items</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Cost Basis (Invested)</span>
        <span class="kpi-val">€{totalCost.toLocaleString()}</span>
        <span class="kpi-sub">Original acquisition cost</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Unrealized Appreciation</span>
        <span class="kpi-val {unrealizedGain >= 0 ? 'gain-pos' : 'gain-neg'}">
          {unrealizedGain >= 0 ? '+' : ''}€{unrealizedGain.toLocaleString()}
        </span>
        <span class="kpi-sub">Portfolio equity growth</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Insurance Coverage</span>
        <span class="kpi-val {insuredPercentage === 100 ? 'gain-pos' : 'gain-warn'}">
          {insuredPercentage}% Insured
        </span>
        <span class="kpi-sub">{insuredCount} of {items.length} items covered</span>
      </div>
    </div>

    <!-- Collection Inventory Table -->
    <section class="card-panel table-panel">
      <div class="panel-header no-print">
        <h2>Instruments &amp; Equipment Ledger</h2>
      </div>

      <div class="table-wrap">
        <table class="collection-table">
          <thead>
            <tr>
              <th>Make &amp; Model</th>
              <th>Year</th>
              <th>Serial Number</th>
              <th>Finish / Color</th>
              <th>Condition</th>
              <th>Acquired Price</th>
              <th>Replacement Value</th>
              <th>Insured</th>
              <th class="no-print"></th>
            </tr>
          </thead>
          <tbody>
            {#each items as item (item.id)}
              <tr>
                <td>
                  <strong class="item-brand">{item.brand}</strong>
                  <span class="item-model">{item.model}</span>
                  {#if item.modifications}
                    <span class="item-notes">Mods: {item.modifications}</span>
                  {/if}
                </td>
                <td>{item.year}</td>
                <td class="font-mono serial-cell">{item.serial || 'N/A'}</td>
                <td>{item.finish}</td>
                <td>
                  <span class="condition-badge">{item.condition}</span>
                </td>
                <td class="font-mono">€{item.purchasePrice.toLocaleString()}</td>
                <td class="font-mono">
                  <strong class="price-val">€{item.estimatedValue.toLocaleString()}</strong>
                </td>
                <td>
                  <span class="badge {item.isInsured ? 'badge-live' : 'badge-danger'}">
                    {item.isInsured ? 'YES' : 'UNINSURED'}
                  </span>
                </td>
                <td class="no-print">
                  <button class="del-btn" onclick={() => deleteItem(item.id)} aria-label="Delete entry">&times;</button>
                </td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr class="tfoot-row">
              <td colspan="5"><strong>TOTALS ({items.length} ITEMS):</strong></td>
              <td class="font-mono"><strong>€{totalCost.toLocaleString()}</strong></td>
              <td class="font-mono"><strong class="price-val">€{totalValue.toLocaleString()}</strong></td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</div>

<!-- Modal: New Gear Item -->
{#if showModal}
  <div
    class="modal-backdrop"
    onclick={() => (showModal = false)}
    onkeydown={(e) => { if (e.key === 'Escape') showModal = false; }}
    role="presentation"
  >
    <div
      class="modal-card"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-col-title"
      tabindex="-1"
    >
      <div class="modal-header">
        <h3 id="modal-col-title">Add Gear to Vault</h3>
        <button class="modal-close" onclick={() => (showModal = false)}>&times;</button>
      </div>

      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label for="c-brand">Brand / Builder:</label>
            <input id="c-brand" type="text" bind:value={formBrand} placeholder="e.g. Fender" />
          </div>
          <div class="form-group">
            <label for="c-model">Model Name:</label>
            <input id="c-model" type="text" bind:value={formModel} placeholder="e.g. Stratocaster" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="c-year">Year:</label>
            <input id="c-year" type="text" bind:value={formYear} placeholder="e.g. 1965 or 2023" />
          </div>
          <div class="form-group">
            <label for="c-serial">Serial Number:</label>
            <input id="c-serial" type="text" bind:value={formSerial} placeholder="e.g. US20145821" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="c-cat">Category:</label>
            <select id="c-cat" bind:value={formCategory} class="select-input">
              <option value="Electric Guitar">Electric Guitar</option>
              <option value="Acoustic Guitar">Acoustic Guitar</option>
              <option value="Bass">Electric Bass</option>
              <option value="Amplifier">Amplifier</option>
              <option value="Vintage Effect">Vintage Effect</option>
            </select>
          </div>
          <div class="form-group">
            <label for="c-cond">Condition:</label>
            <select id="c-cond" bind:value={formCondition} class="select-input">
              <option value="Mint">Mint (Like New)</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Player Grade">Player Grade</option>
              <option value="Fair / Relic">Fair / Relic</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="c-finish">Finish / Color:</label>
          <input id="c-finish" type="text" bind:value={formFinish} placeholder="e.g. Olympic White Nitro" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="c-buyprice">Purchase Price (€):</label>
            <input id="c-buyprice" type="number" bind:value={formPurchasePrice} />
          </div>
          <div class="form-group">
            <label for="c-estval">Replacement Value (€):</label>
            <input id="c-estval" type="number" bind:value={formEstValue} />
          </div>
        </div>

        <div class="form-group">
          <label for="c-mods">Modifications &amp; Upgrades:</label>
          <input id="c-mods" type="text" bind:value={formMods} placeholder="e.g. Seymour Duncan Antiquities installed" />
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" bind:checked={formInsured} />
            Included in Insurance Policy / Rider
          </label>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => (showModal = false)}>Cancel</button>
        <button class="btn btn-primary" onclick={addItem}>Save Instrument</button>
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

  .header-action-row {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }

  /* KPI Grid */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
  }

  .kpi-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
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
    font-family: var(--font-mono);
  }

  .kpi-sub {
    font-size: 0.78rem;
    color: var(--text-secondary);
  }

  .price-val { color: var(--accent-light); }
  .gain-pos { color: var(--status-live); }
  .gain-neg { color: #ef4444; }
  .gain-warn { color: var(--accent); }

  /* Table */
  .card-panel {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    box-shadow: var(--shadow-card);
  }

  .table-wrap {
    overflow-x: auto;
  }

  .collection-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    text-align: left;
  }

  .collection-table th {
    padding: 0.85rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border-subtle);
  }

  .collection-table td {
    padding: 1rem;
    border-bottom: 1px solid var(--border-subtle);
    vertical-align: middle;
  }

  .item-brand {
    font-size: 1rem;
    color: var(--text-primary);
    display: block;
  }

  .item-model {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .item-notes {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
  }

  .font-mono {
    font-family: var(--font-mono);
  }

  .serial-cell {
    color: var(--accent);
  }

  .condition-badge {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
  }

  .badge-danger {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.35);
  }

  .tfoot-row td {
    border-top: 2px solid var(--border-default);
    padding-top: 1.25rem;
    font-size: 1rem;
  }

  .del-btn {
    color: var(--text-muted);
    font-size: 1.4rem;
    padding: 0 0.5rem;
    transition: color var(--transition-fast);
  }

  .del-btn:hover {
    color: #ef4444;
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
    max-width: 520px;
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

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
  }

  .form-group label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 600;
  }

  .form-row {
    display: flex;
    gap: 1rem;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .print-only {
    display: none;
  }

  @media print {
    .no-print {
      display: none !important;
    }
    .print-only {
      display: block !important;
    }
    .insurance-print-header {
      margin-bottom: 2rem;
      border-bottom: 2px solid #000;
      padding-bottom: 1rem;
    }
    .insurance-print-header h1 {
      font-size: 1.6rem;
      color: #000;
    }
    .print-meta-row {
      display: flex;
      justify-content: space-between;
      margin-top: 0.75rem;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .tool-page {
      padding: 0 !important;
    }
    .card-panel {
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      background: #fff !important;
      color: #000 !important;
    }
    .collection-table {
      border-collapse: collapse;
      color: #000;
    }
    .collection-table th, .collection-table td {
      border-bottom: 1px solid #ccc;
      color: #000;
      padding: 0.6rem 0.4rem;
    }
    .item-brand, .item-model, .price-val {
      color: #000 !important;
    }
  }
</style>
