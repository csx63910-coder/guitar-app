<script lang="ts">
  import pedalsData from '$lib/data/pedals.json';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  interface PedalItem {
    id: string;
    instanceId: string;
    name: string;
    brand: string;
    category: string;
    circuit: 'analog' | 'digital';
    voltage: number;
    current_mA: number;
    price: number;
    width_mm: number;
    depth_mm: number;
  }

  interface PowerSupply {
    id: string;
    name: string;
    isolated: boolean;
    outputs_count: number;
    total_mA: number;
    price: number;
    notes: string;
  }

  interface BoardSize {
    id: string;
    name: string;
    width_mm: number;
    depth_mm: number;
    price: number;
  }

  const catalogPedals = pedalsData.pedals;
  const catalogSupplies: PowerSupply[] = pedalsData.power_supplies as PowerSupply[];
  const catalogBoards: BoardSize[] = pedalsData.pedalboards;

  let selectedBoard = $state<BoardSize>(catalogBoards[1]); // Pedaltrain Metro 16
  let selectedSupply = $state<PowerSupply>(catalogSupplies[0]); // Truetone CS7
  let userPedals = $state<PedalItem[]>([]);

  // Filter for adding pedals
  let catalogSearch = $state('');
  let catalogCategory = $state('All');

  // Custom pedal modal / inputs
  let showCustomModal = $state(false);
  let customName = $state('');
  let customBrand = $state('');
  let customCategory = $state('Overdrive');
  let customCircuit = $state<'analog' | 'digital'>('analog');
  let customVoltage = $state(9);
  let customCurrent = $state(20);
  let customPrice = $state(99);
  let customWidth = $state(70);

  // LocalStorage persistence
  const STORAGE_KEY = 'guitar_toolkit_pedalboard';

  onMount(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pedals) userPedals = parsed.pedals;
        if (parsed.supplyId) {
          const s = catalogSupplies.find((p) => p.id === parsed.supplyId);
          if (s) selectedSupply = s;
        }
        if (parsed.boardId) {
          const b = catalogBoards.find((board) => board.id === parsed.boardId);
          if (b) selectedBoard = b;
        }
      } else {
        // Seed initial default board
        addPedalById('polytune3');
        addPedalById('ts9');
        addPedalById('rat2');
        addPedalById('carboncopy');
      }
    } catch {
      // Ignore storage errors
    }
  });

  function saveToStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          pedals: userPedals,
          supplyId: selectedSupply.id,
          boardId: selectedBoard.id
        })
      );
    } catch {
      // Ignore
    }
  }

  function addPedalById(id: string) {
    const p = catalogPedals.find((item) => item.id === id);
    if (!p) return;
    userPedals.push({
      ...p,
      instanceId: `${p.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      circuit: p.circuit as 'analog' | 'digital'
    });
    saveToStorage();
  }

  function removePedal(instanceId: string) {
    userPedals = userPedals.filter((p) => p.instanceId !== instanceId);
    saveToStorage();
  }

  function addCustomPedal() {
    if (!customName.trim()) return;
    userPedals.push({
      id: `custom-${Date.now()}`,
      instanceId: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: customName.trim(),
      brand: customBrand.trim() || 'Custom',
      category: customCategory,
      circuit: customCircuit,
      voltage: customVoltage,
      current_mA: customCurrent,
      price: customPrice,
      width_mm: customWidth,
      depth_mm: 120
    });
    showCustomModal = false;
    customName = '';
    saveToStorage();
  }

  function clearBoard() {
    userPedals = [];
    saveToStorage();
  }

  // Calculations
  const totalDraw_mA = $derived(
    userPedals.reduce((sum, p) => sum + p.current_mA, 0)
  );

  const pedalsCost = $derived(
    userPedals.reduce((sum, p) => sum + p.price, 0)
  );

  const patchCablesNeeded = $derived(Math.max(0, userPedals.length - 1));
  const patchCablesCost = $derived(patchCablesNeeded * 8); // Approx €8 per quality flat cable

  const grandTotalCost = $derived(
    pedalsCost + selectedSupply.price + selectedBoard.price + patchCablesCost
  );

  // Width check: pedals + 20mm jack margin per pedal
  const totalPedalsWidth_mm = $derived(
    userPedals.reduce((sum, p) => sum + p.width_mm + 20, 0)
  );

  const hasDigitalPedal = $derived(
    userPedals.some((p) => p.circuit === 'digital')
  );

  const hasAnalogDrive = $derived(
    userPedals.some((p) => p.circuit === 'analog' && ['Overdrive', 'Distortion', 'Fuzz'].includes(p.category))
  );

  // Warnings Engine
  interface Warning {
    type: 'danger' | 'warning' | 'info';
    title: string;
    description: string;
  }

  const warnings = $derived<Warning[]>(() => {
    const list: Warning[] = [];

    // Overload check
    if (totalDraw_mA > selectedSupply.total_mA) {
      list.push({
        type: 'danger',
        title: 'Power Supply Current Overloaded',
        description: `Your pedals draw ${totalDraw_mA} mA, exceeding your power supply capacity of ${selectedSupply.total_mA} mA.`
      });
    }

    // Daisy chain digital noise warning
    if (!selectedSupply.isolated && hasDigitalPedal && hasAnalogDrive) {
      list.push({
        type: 'danger',
        title: 'High Risk of Digital Clock Whine (Daisy Chain)',
        description: 'You have digital pedals (DSP/Delay/Reverb) sharing a non-isolated daisy chain with analog gain stages. This causes audible high-frequency clock whine through your amp. An isolated power supply is strongly recommended.'
      });
    }

    // Voltage check
    const highVoltagePedals = userPedals.filter((p) => p.voltage > 9);
    if (highVoltagePedals.length > 0) {
      list.push({
        type: 'warning',
        title: `${highVoltagePedals.length} Pedal(s) Require 12V or 18V`,
        description: `${highVoltagePedals.map((p) => `${p.name} (${p.voltage}V)`).join(', ')} require dedicated high-voltage outlets. Running them on 9V will cause severe headroom loss or non-functioning circuits.`
      });
    }

    // Outlets count check
    if (userPedals.length > selectedSupply.outputs_count) {
      list.push({
        type: 'warning',
        title: 'Not Enough Power Taps',
        description: `You have ${userPedals.length} pedals, but this power supply only provides ${selectedSupply.outputs_count} individual outlets. You will need a splitter cable or larger supply.`
      });
    }

    // Board physical width check
    if (totalPedalsWidth_mm > selectedBoard.width_mm * 1.8) { // Accommodates 2 rows
      list.push({
        type: 'warning',
        title: 'Pedalboard Physical Space Warning',
        description: `Total pedal width with jacks is ~${totalPedalsWidth_mm} mm. This may exceed the physical surface of ${selectedBoard.name} (${selectedBoard.width_mm} mm width).`
      });
    }

    return list;
  });

  // Filter catalog
  const filteredCatalog = $derived(
    catalogPedals.filter((p) => {
      if (catalogCategory !== 'All' && p.category !== catalogCategory) return false;
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      }
      return true;
    })
  );

  let copySuccess = $state(false);
  function copyMarkdownSummary() {
    const lines = [
      `# 🎸 Pedalboard Build Sheet — ${selectedBoard.name}`,
      `**Total Current Draw:** ${totalDraw_mA} mA / ${selectedSupply.total_mA} mA`,
      `**Power Supply:** ${selectedSupply.name} (${selectedSupply.isolated ? 'Isolated' : 'Non-isolated'})`,
      `**Pedalboard:** ${selectedBoard.name} (${selectedBoard.width_mm} x ${selectedBoard.depth_mm} mm)`,
      `**Estimated Budget:** €${grandTotalCost}`,
      ``,
      `### Pedals (${userPedals.length}):`,
      ...userPedals.map((p, i) => `${i + 1}. **${p.name}** (${p.brand}) — ${p.current_mA} mA @ ${p.voltage}V [${p.circuit.toUpperCase()}] ~€${p.price}`),
      ``,
      `### Accessories:`,
      `- ${patchCablesNeeded}x Patch Cables (~€${patchCablesCost})`,
      `- Power Supply (~€${selectedSupply.price})`,
      `- Board & Case (~€${selectedBoard.price})`
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      copySuccess = true;
      setTimeout(() => (copySuccess = false), 2000);
    });
  }
</script>

<svelte:head>
  <title>#83 Pedalboard Cost & Power Planner — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#83 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Pedalboard Cost &amp; Power Planner</h1>
      <p class="lead-text">
        Plan your dream pedalboard without unexpected hum or noise. Accurately calculates total mA power draw, checks power supply headroom, flags digital clock whine risks from non-isolated daisy chains, and tracks your total budget.
      </p>
    </header>

    <!-- Warnings Banner -->
    {#if warnings.length > 0}
      <div class="warnings-stack">
        {#each warnings as w}
          <div class="warning-banner banner-{w.type}">
            <div class="banner-icon">
              {#if w.type === 'danger'}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              {:else}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              {/if}
            </div>
            <div class="banner-content">
              <strong>{w.title}</strong>
              <p>{w.description}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Main Workspace Split -->
    <div class="planner-grid">
      <!-- Left Column: Board Canvas & Pedals List -->
      <section class="board-column">
        <!-- Power & Budget Quick Bar -->
        <div class="summary-card">
          <div class="summary-metric">
            <span class="metric-label">Power Consumption</span>
            <div class="power-bar-wrap">
              <div
                class="power-bar-fill {totalDraw_mA > selectedSupply.total_mA ? 'fill-overload' : ''}"
                style="width: {Math.min(100, (totalDraw_mA / selectedSupply.total_mA) * 100)}%"
              ></div>
            </div>
            <span class="metric-val">
              <strong>{totalDraw_mA} mA</strong> / {selectedSupply.total_mA} mA capacity
            </span>
          </div>

          <div class="summary-metric">
            <span class="metric-label">Total Estimated Budget</span>
            <span class="metric-val price-val">
              <strong>€{grandTotalCost}</strong>
            </span>
          </div>

          <div class="summary-metric">
            <span class="metric-label">Pedals on Board</span>
            <span class="metric-val">
              <strong>{userPedals.length}</strong> ({patchCablesNeeded} patch cables needed)
            </span>
          </div>
        </div>

        <!-- Pedals on Board -->
        <div class="board-inventory-card">
          <div class="inventory-header">
            <h3>Pedals on Board ({userPedals.length})</h3>
            <div class="inventory-actions">
              <button class="btn btn-secondary btn-sm" onclick={() => (showCustomModal = true)}>
                + Custom Pedal
              </button>
              {#if userPedals.length > 0}
                <button class="btn btn-secondary btn-sm" onclick={clearBoard}>
                  Clear Board
                </button>
              {/if}
            </div>
          </div>

          {#if userPedals.length > 0}
            <div class="pedals-list">
              {#each userPedals as pedal (pedal.instanceId)}
                <div class="pedal-row">
                  <div class="pedal-info">
                    <span class="pedal-circuit circuit-{pedal.circuit}">
                      {pedal.circuit.toUpperCase()}
                    </span>
                    <div class="pedal-text">
                      <span class="pedal-name">{pedal.name}</span>
                      <span class="pedal-sub">{pedal.brand} &middot; {pedal.category}</span>
                    </div>
                  </div>

                  <div class="pedal-specs">
                    <span class="spec-badge spec-power" title="Current draw">
                      ⚡ {pedal.current_mA} mA ({pedal.voltage}V)
                    </span>
                    <span class="spec-badge spec-price">
                      €{pedal.price}
                    </span>
                    <button class="remove-btn" onclick={() => removePedal(pedal.instanceId)} aria-label="Remove {pedal.name}">
                      &times;
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-board-msg">
              <p>Your pedalboard is currently empty.</p>
              <p class="empty-sub">Add pedals from the catalog on the right or create custom pedals to calculate power and costs.</p>
            </div>
          {/if}
        </div>

        <!-- Hardware & Cable Configuration Card -->
        <div class="config-card">
          <h3>Hardware &amp; Infrastructure Selection</h3>

          <div class="config-grid">
            <div class="config-group">
              <label for="supply-select">Power Supply Unit:</label>
              <select
                id="supply-select"
                bind:value={selectedSupply}
                class="select-input"
                onchange={saveToStorage}
              >
                {#each catalogSupplies as supply}
                  <option value={supply}>
                    {supply.name} ({supply.total_mA} mA, {supply.isolated ? 'Isolated' : 'Non-isolated'}) — €{supply.price}
                  </option>
                {/each}
              </select>
              <p class="config-hint">{selectedSupply.notes}</p>
            </div>

            <div class="config-group">
              <label for="board-select">Pedalboard Frame:</label>
              <select
                id="board-select"
                bind:value={selectedBoard}
                class="select-input"
                onchange={saveToStorage}
              >
                {#each catalogBoards as board}
                  <option value={board}>
                    {board.name} ({board.width_mm} &times; {board.depth_mm} mm) — €{board.price}
                  </option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Cost Breakdown List -->
          <div class="cost-breakdown">
            <h4>Cost Breakdown Summary</h4>
            <div class="cost-row">
              <span>Pedals ({userPedals.length} items):</span>
              <strong>€{pedalsCost}</strong>
            </div>
            <div class="cost-row">
              <span>Power Supply ({selectedSupply.name}):</span>
              <strong>€{selectedSupply.price}</strong>
            </div>
            <div class="cost-row">
              <span>Pedalboard Frame ({selectedBoard.name}):</span>
              <strong>€{selectedBoard.price}</strong>
            </div>
            <div class="cost-row">
              <span>Patch Cables ({patchCablesNeeded} &times; €8):</span>
              <strong>€{patchCablesCost}</strong>
            </div>
            <div class="cost-row total-row">
              <span>Estimated Total Investment:</span>
              <strong class="total-price">€{grandTotalCost}</strong>
            </div>
          </div>

          <div class="export-actions">
            <button class="btn btn-primary" onclick={copyMarkdownSummary}>
              {#if copySuccess}
                ✓ Copied Build Sheet to Clipboard!
              {:else}
                Copy Markdown Build Sheet
              {/if}
            </button>
          </div>
        </div>
      </section>

      <!-- Right Column: Catalog Browser -->
      <aside class="catalog-column">
        <div class="catalog-card">
          <div class="catalog-header">
            <h3>Add Pedals from Catalog</h3>
            <p>Click any pedal to add to your board.</p>
          </div>

          <div class="catalog-controls">
            <input
              type="search"
              bind:value={catalogSearch}
              placeholder="Search catalog (e.g. Boss, Delay, Fuzz)..."
              class="search-input"
            />
            <div class="cat-chips">
              {#each ['All', 'Tuner', 'Overdrive', 'Distortion', 'Fuzz', 'Delay', 'Reverb', 'Modulation'] as cat}
                <button
                  class="cat-chip {catalogCategory === cat ? 'active' : ''}"
                  onclick={() => (catalogCategory = cat)}
                >
                  {cat}
                </button>
              {/each}
            </div>
          </div>

          <div class="catalog-list">
            {#each filteredCatalog as p}
              <button class="catalog-item" onclick={() => addPedalById(p.id)}>
                <div class="item-main">
                  <span class="item-name">{p.name}</span>
                  <span class="item-brand">{p.brand} &middot; {p.category}</span>
                </div>
                <div class="item-meta">
                  <span class="item-power">⚡ {p.current_mA} mA</span>
                  <span class="item-price">€{p.price}</span>
                  <span class="add-plus">+</span>
                </div>
              </button>
            {/each}
          </div>
        </div>
      </aside>
    </div>
  </div>
</div>

<!-- Custom Pedal Modal -->
{#if showCustomModal}
  <div
    class="modal-backdrop"
    onclick={() => (showCustomModal = false)}
    onkeydown={(e) => { if (e.key === 'Escape') showCustomModal = false; }}
    role="presentation"
  >
    <div
      class="modal-card"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-title"
      tabindex="-1"
    >
      <div class="modal-header">
        <h3 id="custom-title">Add Custom Pedal</h3>
        <button class="modal-close" onclick={() => (showCustomModal = false)}>&times;</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="custom-name">Pedal Name:</label>
          <input id="custom-name" type="text" bind:value={customName} placeholder="e.g. Klon Centaur" />
        </div>
        <div class="form-group">
          <label for="custom-brand">Brand / Builder:</label>
          <input id="custom-brand" type="text" bind:value={customBrand} placeholder="e.g. Bill Finnegan" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="custom-category">Category:</label>
            <select id="custom-category" bind:value={customCategory} class="select-input">
              <option value="Overdrive">Overdrive</option>
              <option value="Distortion">Distortion</option>
              <option value="Fuzz">Fuzz</option>
              <option value="Delay">Delay</option>
              <option value="Reverb">Reverb</option>
              <option value="Modulation">Modulation</option>
              <option value="Tuner">Tuner</option>
              <option value="Utility">Utility</option>
            </select>
          </div>
          <div class="form-group">
            <label for="custom-circuit">Circuit Type:</label>
            <select id="custom-circuit" bind:value={customCircuit} class="select-input">
              <option value="analog">Analog</option>
              <option value="digital">Digital (DSP)</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="custom-current">Current Draw (mA):</label>
            <input id="custom-current" type="number" bind:value={customCurrent} min="1" max="2000" />
          </div>
          <div class="form-group">
            <label for="custom-voltage">Voltage (V):</label>
            <select id="custom-voltage" bind:value={customVoltage} class="select-input">
              <option value={9}>9V</option>
              <option value={12}>12V</option>
              <option value={18}>18V</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="custom-price">Estimated Price (€):</label>
            <input id="custom-price" type="number" bind:value={customPrice} min="0" />
          </div>
          <div class="form-group">
            <label for="custom-width">Width (mm):</label>
            <input id="custom-width" type="number" bind:value={customWidth} min="40" max="400" />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => (showCustomModal = false)}>Cancel</button>
        <button class="btn btn-primary" onclick={addCustomPedal}>Add to Board</button>
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

  /* Warnings Stack */
  .warnings-stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .warning-banner {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.4rem;
    border-radius: var(--radius-md);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .banner-danger {
    background-color: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #ef4444;
  }

  .banner-warning {
    background-color: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.35);
    color: var(--accent-light);
  }

  .banner-content strong {
    display: block;
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
  }

  .banner-content p {
    font-size: 0.88rem;
    line-height: 1.45;
  }

  /* Main Workspace Grid */
  .planner-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 1.75rem;
  }

  .board-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Summary Card */
  .summary-card {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr;
    gap: 1.25rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.25rem 1.5rem;
  }

  .summary-metric {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .metric-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .metric-val {
    font-size: 0.95rem;
    color: var(--text-secondary);
  }

  .metric-val strong {
    font-size: 1.3rem;
    color: var(--text-primary);
  }

  .price-val strong {
    color: var(--accent-light);
  }

  .power-bar-wrap {
    width: 100%;
    height: 8px;
    background-color: var(--bg-primary);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin-top: 0.15rem;
  }

  .power-bar-fill {
    height: 100%;
    background-color: var(--status-live);
    transition: width var(--transition-normal);
  }

  .fill-overload {
    background-color: #ef4444;
  }

  /* Board Inventory Card */
  .board-inventory-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .inventory-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 0.85rem;
  }

  .inventory-header h3 {
    font-size: 1.25rem;
  }

  .inventory-actions {
    display: flex;
    gap: 0.5rem;
  }

  .pedals-list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .pedal-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.1rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .pedal-row:hover {
    border-color: var(--border-default);
    background-color: var(--bg-elevated);
  }

  .pedal-info {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .pedal-circuit {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-sm);
  }

  .circuit-analog {
    background-color: rgba(56, 189, 248, 0.12);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.3);
  }

  .circuit-digital {
    background-color: rgba(236, 72, 153, 0.12);
    color: #ec4899;
    border: 1px solid rgba(236, 72, 153, 0.3);
  }

  .pedal-name {
    font-weight: 600;
    font-size: 0.95rem;
    display: block;
  }

  .pedal-sub {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .pedal-specs {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .spec-badge {
    font-size: 0.78rem;
    padding: 0.25rem 0.55rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
  }

  .spec-power {
    background-color: var(--bg-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
  }

  .spec-price {
    color: var(--accent);
  }

  .remove-btn {
    color: var(--text-muted);
    font-size: 1.4rem;
    padding: 0 0.4rem;
    line-height: 1;
    transition: color var(--transition-fast);
  }

  .remove-btn:hover {
    color: #ef4444;
  }

  .empty-board-msg {
    text-align: center;
    padding: 2.5rem 1rem;
    color: var(--text-muted);
  }

  .empty-sub {
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  /* Config Card */
  .config-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  .config-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .config-group label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .config-hint {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .cost-breakdown {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cost-breakdown h4 {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }

  .cost-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .total-row {
    padding-top: 0.65rem;
    margin-top: 0.35rem;
    border-top: 1px solid var(--border-subtle);
    font-size: 1rem;
    color: var(--text-primary);
  }

  .total-price {
    color: var(--accent-light);
    font-size: 1.25rem;
  }

  .export-actions {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  /* Catalog Column */
  .catalog-column {
    display: flex;
    flex-direction: column;
  }

  .catalog-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-height: 850px;
  }

  .catalog-header h3 {
    font-size: 1.25rem;
  }

  .catalog-header p {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .catalog-controls {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .cat-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .cat-chip {
    font-size: 0.75rem;
    padding: 0.2rem 0.55rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .cat-chip:hover {
    color: var(--text-primary);
    border-color: var(--border-default);
  }

  .cat-chip.active {
    background-color: var(--accent);
    color: var(--text-inverse);
    font-weight: 600;
  }

  .catalog-list {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding-right: 0.25rem;
  }

  .catalog-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0.9rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    text-align: left;
    transition: all var(--transition-fast);
  }

  .catalog-item:hover {
    border-color: var(--accent);
    background-color: var(--bg-elevated);
    transform: translateX(3px);
  }

  .item-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-primary);
    display: block;
  }

  .item-brand {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .item-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
  }

  .item-power {
    color: var(--text-secondary);
  }

  .item-price {
    color: var(--accent);
    font-weight: 600;
  }

  .add-plus {
    font-size: 1.1rem;
    color: var(--accent-light);
    font-weight: 700;
  }

  /* Modal Styles */
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
    max-width: 480px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
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
    margin-top: 0.5rem;
  }

  @media (max-width: 960px) {
    .planner-grid {
      grid-template-columns: 1fr;
    }
    .summary-card {
      grid-template-columns: 1fr;
    }
  }
</style>
