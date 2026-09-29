<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  interface FlipItem {
    id: string;
    name: string;
    category: 'Guitar' | 'Amp' | 'Pedal' | 'Accessory' | 'Other';
    buyPrice: number;
    buyShipping: number;
    buyDate: string;
    soldPrice: number;
    soldShipping: number;
    soldDate: string;
    platform: 'reverb' | 'ebay' | 'local' | 'custom';
    customFeePercent: number;
    hoursSpent: number;
    status: 'sold' | 'in_stock';
  }

  const STORAGE_KEY = 'guitar_toolkit_gear_flips';

  const initialFlips: FlipItem[] = [
    {
      id: 'flip-1',
      name: 'Fender Standard Stratocaster MIM',
      category: 'Guitar',
      buyPrice: 380,
      buyShipping: 0,
      buyDate: '2026-06-10',
      soldPrice: 550,
      soldShipping: 25,
      soldDate: '2026-07-02',
      platform: 'reverb',
      customFeePercent: 8.19, // Reverb 5% + 3.19% payment processing
      hoursSpent: 5.5, // Setup, cleaning, taking photos, packing
      status: 'sold'
    },
    {
      id: 'flip-2',
      name: 'Strymon BlueSky V1 Reverb',
      category: 'Pedal',
      buyPrice: 180,
      buyShipping: 10,
      buyDate: '2026-08-14',
      soldPrice: 245,
      soldShipping: 12,
      soldDate: '2026-08-25',
      platform: 'local',
      customFeePercent: 0,
      hoursSpent: 2.0,
      status: 'sold'
    },
    {
      id: 'flip-3',
      name: 'Boss CE-2 Vintage MIJ Chorus',
      category: 'Pedal',
      buyPrice: 140,
      buyShipping: 0,
      buyDate: '2026-09-01',
      soldPrice: 0,
      soldShipping: 0,
      soldDate: '',
      platform: 'reverb',
      customFeePercent: 8.19,
      hoursSpent: 1.5,
      status: 'in_stock'
    }
  ];

  let items = $state<FlipItem[]>(initialFlips);

  // New item modal
  let showModal = $state(false);
  let formName = $state('');
  let formCategory = $state<'Guitar' | 'Amp' | 'Pedal' | 'Accessory' | 'Other'>('Pedal');
  let formBuyPrice = $state(100);
  let formBuyShipping = $state(0);
  let formBuyDate = $state(new Date().toISOString().split('T')[0]);
  let formStatus = $state<'sold' | 'in_stock'>('sold');
  let formSoldPrice = $state(160);
  let formSoldShipping = $state(10);
  let formSoldDate = $state(new Date().toISOString().split('T')[0]);
  let formPlatform = $state<'reverb' | 'ebay' | 'local' | 'custom'>('reverb');
  let formHours = $state(2.5);

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

  function getFeePercent(platform: string, customVal: number): number {
    if (platform === 'reverb') return 8.19; // 5% + 3.19% payment
    if (platform === 'ebay') return 13.25;
    if (platform === 'local') return 0;
    return customVal || 0;
  }

  function calculateFlipMath(item: FlipItem) {
    const totalCost = item.buyPrice + item.buyShipping;
    if (item.status === 'in_stock') {
      return {
        totalCost,
        feeAmount: 0,
        netProceeds: 0,
        netProfit: 0,
        roiPercent: 0,
        hourlyWage: 0
      };
    }

    const feePct = getFeePercent(item.platform, item.customFeePercent);
    const feeAmount = (item.soldPrice * feePct) / 100;
    const netProceeds = item.soldPrice - feeAmount - item.soldShipping;
    const netProfit = netProceeds - totalCost;
    const roiPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const hourlyWage = item.hoursSpent > 0 ? netProfit / item.hoursSpent : 0;

    return {
      totalCost,
      feeAmount,
      netProceeds,
      netProfit,
      roiPercent,
      hourlyWage
    };
  }

  const soldItems = $derived(items.filter((i) => i.status === 'sold'));
  const inStockItems = $derived(items.filter((i) => i.status === 'in_stock'));

  const totalCapitalInvested = $derived(
    items.reduce((sum, i) => sum + i.buyPrice + i.buyShipping, 0)
  );

  const totalNetProfit = $derived(
    soldItems.reduce((sum, i) => sum + calculateFlipMath(i).netProfit, 0)
  );

  const totalHoursSpent = $derived(
    soldItems.reduce((sum, i) => sum + i.hoursSpent, 0)
  );

  const realizedHourlyRate = $derived(
    totalHoursSpent > 0 ? totalNetProfit / totalHoursSpent : 0
  );

  function addItem() {
    if (!formName.trim()) return;

    items.unshift({
      id: `flip-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      buyPrice: formBuyPrice,
      buyShipping: formBuyShipping,
      buyDate: formBuyDate,
      status: formStatus,
      soldPrice: formStatus === 'sold' ? formSoldPrice : 0,
      soldShipping: formStatus === 'sold' ? formSoldShipping : 0,
      soldDate: formStatus === 'sold' ? formSoldDate : '',
      platform: formPlatform,
      customFeePercent: getFeePercent(formPlatform, 0),
      hoursSpent: formHours
    });

    showModal = false;
    formName = '';
    saveToStorage();
  }

  function deleteItem(id: string) {
    items = items.filter((i) => i.id !== id);
    saveToStorage();
  }
</script>

<svelte:head>
  <title>#75 Gear Flips & Trading Tracker — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#75 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Gear Flips &amp; Trading Accounting Tracker</h1>
      <p class="lead-text">
        Track buy and sell prices, shipping costs, and platform fees (Reverb 8.19%, eBay 13.25%, local cash 0%). Calculates true net profit and features the <strong>Hourly Wage Sanity Check</strong> to reveal whether gear flipping is making you money or acting as an expensive hobby.
      </p>

      <div class="header-action-row">
        <button class="btn btn-primary" onclick={() => (showModal = true)}>
          + Record New Gear Flip
        </button>
      </div>
    </header>

    <!-- KPI Summary Dashboard -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">Total Realized Net Profit</span>
        <span class="kpi-val {totalNetProfit >= 0 ? 'profit-pos' : 'profit-neg'}">
          {totalNetProfit >= 0 ? '+' : ''}€{totalNetProfit.toFixed(2)}
        </span>
        <span class="kpi-sub">{soldItems.length} items sold</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Hourly Wage Sanity Check</span>
        <span class="kpi-val hourly-val">
          €{realizedHourlyRate.toFixed(2)} / hr
        </span>
        <span class="kpi-sub">Across {totalHoursSpent.toFixed(1)} hours of effort</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Active Capital Deployed</span>
        <span class="kpi-val">
          €{inStockItems.reduce((s, i) => s + i.buyPrice + i.buyShipping, 0).toFixed(2)}
        </span>
        <span class="kpi-sub">{inStockItems.length} items currently in stock</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Cumulative Capital Deployed</span>
        <span class="kpi-val">€{totalCapitalInvested.toFixed(2)}</span>
        <span class="kpi-sub">Total gear purchased</span>
      </div>
    </div>

    <!-- Flips Ledger Table -->
    <section class="card-panel table-panel">
      <div class="panel-header">
        <h2>Flip Ledger ({items.length} items)</h2>
      </div>

      <div class="table-wrap">
        <table class="flips-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Gear Description</th>
              <th>Cost Basis</th>
              <th>Sold / Platform</th>
              <th>Net Profit</th>
              <th>ROI</th>
              <th>Effective Wage</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each items as item (item.id)}
              {@const math = calculateFlipMath(item)}
              <tr>
                <td>
                  <span class="badge {item.status === 'sold' ? 'badge-live' : 'badge-planned'}">
                    {item.status === 'sold' ? 'SOLD' : 'IN STOCK'}
                  </span>
                </td>
                <td>
                  <strong class="item-name">{item.name}</strong>
                  <span class="item-cat">{item.category} &middot; Acquired {item.buyDate}</span>
                </td>
                <td class="font-mono">
                  €{math.totalCost.toFixed(2)}
                  <span class="sub-cost">({item.buyPrice} + {item.buyShipping} ship)</span>
                </td>
                <td>
                  {#if item.status === 'sold'}
                    <span class="font-mono">€{item.soldPrice}</span>
                    <span class="sub-cost">{item.platform.toUpperCase()} &middot; {item.soldDate}</span>
                  {:else}
                    <span class="text-muted">Unsold</span>
                  {/if}
                </td>
                <td class="font-mono">
                  {#if item.status === 'sold'}
                    <strong class="{math.netProfit >= 0 ? 'profit-pos' : 'profit-neg'}">
                      {math.netProfit >= 0 ? '+' : ''}€{math.netProfit.toFixed(2)}
                    </strong>
                  {:else}
                    &mdash;
                  {/if}
                </td>
                <td class="font-mono">
                  {#if item.status === 'sold'}
                    <span class="{math.roiPercent >= 0 ? 'profit-pos' : 'profit-neg'}">
                      {math.roiPercent.toFixed(1)}%
                    </span>
                  {:else}
                    &mdash;
                  {/if}
                </td>
                <td class="font-mono">
                  {#if item.status === 'sold'}
                    <span class="wage-tag">
                      €{math.hourlyWage.toFixed(2)}/h
                    </span>
                    <span class="sub-cost">{item.hoursSpent}h spent</span>
                  {:else}
                    &mdash;
                  {/if}
                </td>
                <td>
                  <button class="del-btn" onclick={() => deleteItem(item.id)} aria-label="Delete {item.name}">&times;</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>

<!-- Modal: New Flip Entry -->
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
      aria-labelledby="modal-flip-title"
      tabindex="-1"
    >
      <div class="modal-header">
        <h3 id="modal-flip-title">Record Gear Flip</h3>
        <button class="modal-close" onclick={() => (showModal = false)}>&times;</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="f-name">Gear Description / Brand:</label>
          <input id="f-name" type="text" bind:value={formName} placeholder="e.g. 1994 USA Stratocaster" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="f-cat">Category:</label>
            <select id="f-cat" bind:value={formCategory} class="select-input">
              <option value="Guitar">Guitar</option>
              <option value="Amp">Amp</option>
              <option value="Pedal">Pedal</option>
              <option value="Accessory">Accessory</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="f-status">Status:</label>
            <select id="f-status" bind:value={formStatus} class="select-input">
              <option value="sold">Sold (Complete)</option>
              <option value="in_stock">In Stock (Unsold)</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="f-buy">Purchase Price (€):</label>
            <input id="f-buy" type="number" bind:value={formBuyPrice} />
          </div>
          <div class="form-group">
            <label for="f-buyship">Shipping In (€):</label>
            <input id="f-buyship" type="number" bind:value={formBuyShipping} />
          </div>
        </div>

        {#if formStatus === 'sold'}
          <div class="form-row">
            <div class="form-group">
              <label for="f-sold">Sold Price (€):</label>
              <input id="f-sold" type="number" bind:value={formSoldPrice} />
            </div>
            <div class="form-group">
              <label for="f-soldship">Shipping Out (€):</label>
              <input id="f-soldship" type="number" bind:value={formSoldShipping} />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="f-platform">Selling Platform:</label>
              <select id="f-platform" bind:value={formPlatform} class="select-input">
                <option value="reverb">Reverb (8.19% total fees)</option>
                <option value="ebay">eBay (13.25% fees)</option>
                <option value="local">Local Cash / Direct (0% fees)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="f-hours">Hours Spent (Total Effort):</label>
              <input id="f-hours" type="number" step="0.5" bind:value={formHours} />
            </div>
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => (showModal = false)}>Cancel</button>
        <button class="btn btn-primary" onclick={addItem}>Save Entry</button>
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
    margin-top: 0.5rem;
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

  .profit-pos { color: var(--status-live); }
  .profit-neg { color: #ef4444; }
  .hourly-val { color: var(--accent-light); }

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

  .flips-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    text-align: left;
  }

  .flips-table th {
    padding: 0.85rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border-subtle);
  }

  .flips-table td {
    padding: 1rem;
    border-bottom: 1px solid var(--border-subtle);
    vertical-align: middle;
  }

  .item-name {
    display: block;
    font-size: 0.95rem;
    color: var(--text-primary);
  }

  .item-cat {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.15rem;
  }

  .font-mono {
    font-family: var(--font-mono);
  }

  .sub-cost {
    display: block;
    font-size: 0.72rem;
    color: var(--text-muted);
    margin-top: 0.15rem;
  }

  .wage-tag {
    color: var(--accent-light);
    font-weight: 700;
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
    max-width: 500px;
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

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    .kpi-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
