<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  interface StringHistoryEntry {
    brand: string;
    gauge: string;
    dateInstalled: string;
    dateReplaced: string;
    totalHours: number;
  }

  interface GuitarProfile {
    id: string;
    name: string;
    model: string;
    type: 'Electric' | 'Acoustic' | 'Bass' | 'Classical';
    tuning: string;
    currentStrings: {
      brand: string;
      model: string;
      gauge: string;
      coated: boolean;
      dateInstalled: string;
      playHours: number;
    };
    history: StringHistoryEntry[];
  }

  const STORAGE_KEY = 'guitar_toolkit_string_tracker';

  const defaultGuitars: GuitarProfile[] = [
    {
      id: 'g-strat',
      name: 'Fender Player Stratocaster',
      model: 'Stratocaster (SSS)',
      type: 'Electric',
      tuning: 'Standard E (E-A-D-G-B-E)',
      currentStrings: {
        brand: "Ernie Ball",
        model: 'Regular Slinky',
        gauge: '10-46',
        coated: false,
        dateInstalled: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
        playHours: 18.5
      },
      history: [
        {
          brand: "D'Addario NYXL",
          gauge: '10-46',
          dateInstalled: '2026-07-01',
          dateReplaced: '2026-08-15',
          totalHours: 32
        }
      ]
    },
    {
      id: 'g-acoustic',
      name: 'Martin D-28 Standard',
      model: 'Dreadnought',
      type: 'Acoustic',
      tuning: 'Standard E (E-A-D-G-B-E)',
      currentStrings: {
        brand: 'Elixir',
        model: 'Nanoweb Phosphor Bronze',
        gauge: '12-53',
        coated: true,
        dateInstalled: new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0],
        playHours: 24.0
      },
      history: []
    }
  ];

  let guitars = $state<GuitarProfile[]>(defaultGuitars);
  let activeGuitarId = $state<string>('g-strat');
  let activeGuitar = $derived<GuitarProfile>(
    guitars.find((g) => g.id === activeGuitarId) || guitars[0]
  );

  // New guitar modal
  let showNewGuitarModal = $state(false);
  let newGuitarName = $state('');
  let newGuitarModel = $state('');
  let newGuitarType = $state<'Electric' | 'Acoustic' | 'Bass' | 'Classical'>('Electric');
  let newGuitarTuning = $state('Standard E (E-A-D-G-B-E)');

  // New string change modal
  let showRestringModal = $state(false);
  let restringBrand = $state("D'Addario");
  let restringModel = $state('NYXL Nickel Wound');
  let restringGauge = $state('10-46');
  let restringCoated = $state(false);

  onMount(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          guitars = parsed;
          activeGuitarId = guitars[0].id;
        }
      }
    } catch {
      // Ignore
    }
  });

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guitars));
    } catch {
      // Ignore
    }
  }

  function logPlayHours(hoursDelta: number) {
    if (!activeGuitar) return;
    activeGuitar.currentStrings.playHours = Math.max(
      0,
      parseFloat((activeGuitar.currentStrings.playHours + hoursDelta).toFixed(1))
    );
    saveToStorage();
  }

  function handleRestring() {
    if (!activeGuitar) return;

    // Archive current strings to history
    activeGuitar.history.unshift({
      brand: `${activeGuitar.currentStrings.brand} ${activeGuitar.currentStrings.model}`,
      gauge: activeGuitar.currentStrings.gauge,
      dateInstalled: activeGuitar.currentStrings.dateInstalled,
      dateReplaced: new Date().toISOString().split('T')[0],
      totalHours: activeGuitar.currentStrings.playHours
    });

    // Reset current strings
    activeGuitar.currentStrings = {
      brand: restringBrand,
      model: restringModel,
      gauge: restringGauge,
      coated: restringCoated,
      dateInstalled: new Date().toISOString().split('T')[0],
      playHours: 0
    };

    showRestringModal = false;
    saveToStorage();
  }

  function addNewGuitar() {
    if (!newGuitarName.trim()) return;

    const newId = `g-${Date.now()}`;
    const guitar: GuitarProfile = {
      id: newId,
      name: newGuitarName.trim(),
      model: newGuitarModel.trim() || 'Custom',
      type: newGuitarType,
      tuning: newGuitarTuning,
      currentStrings: {
        brand: "D'Addario",
        model: 'Standard',
        gauge: '10-46',
        coated: false,
        dateInstalled: new Date().toISOString().split('T')[0],
        playHours: 0
      },
      history: []
    };

    guitars.push(guitar);
    activeGuitarId = newId;
    showNewGuitarModal = false;
    newGuitarName = '';
    newGuitarModel = '';
    saveToStorage();
  }

  function deleteCurrentGuitar() {
    if (guitars.length <= 1) return;
    if (confirm(`Are you sure you want to remove "${activeGuitar.name}"?`)) {
      guitars = guitars.filter((g) => g.id !== activeGuitar.id);
      activeGuitarId = guitars[0].id;
      saveToStorage();
    }
  }

  // String Lifespan Calculation
  // Uncoated: ~25-30 play hours or 45 calendar days
  // Coated: ~70-80 play hours or 120 calendar days
  const stringHealth = $derived(() => {
    if (!activeGuitar) return { percentage: 100, status: 'Fresh', days: 0 };

    const cs = activeGuitar.currentStrings;
    const maxHours = cs.coated ? 75 : 28;
    const maxDays = cs.coated ? 120 : 45;

    const installedTime = new Date(cs.dateInstalled).getTime();
    const daysSince = Math.max(0, Math.floor((Date.now() - installedTime) / (1000 * 60 * 60 * 24)));

    // Combined wear formula (70% hours, 30% oxidation/calendar time)
    const hoursRatio = cs.playHours / maxHours;
    const daysRatio = daysSince / maxDays;
    const totalWear = hoursRatio * 0.7 + daysRatio * 0.3;

    const remaining = Math.max(0, Math.min(100, Math.round((1 - totalWear) * 100)));

    let status = 'Fresh & Crisp';
    let severity = 'fresh';

    if (remaining < 30) {
      status = 'Overdue for Replacement';
      severity = 'overdue';
    } else if (remaining < 60) {
      status = 'Aging / Highs Dulled';
      severity = 'aging';
    } else if (remaining < 85) {
      status = 'Broken-In & Stable';
      severity = 'broken-in';
    }

    return {
      percentage: remaining,
      status,
      severity,
      days: daysSince
    };
  });
</script>

<svelte:head>
  <title>#80 String-Life Tracker — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#80 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>String-Life &amp; Maintenance Tracker</h1>
      <p class="lead-text">
        Keep every guitar in your stable sounding like record day. Automatically calculates string fatigue, oxidation wear, and tone degradation based on play hours and coating technology.
      </p>

      <!-- Guitars Tabs -->
      <div class="guitar-tabs-row">
        <div class="guitar-tabs" role="tablist">
          {#each guitars as g}
            <button
              class="guitar-tab {activeGuitarId === g.id ? 'active' : ''}"
              onclick={() => (activeGuitarId = g.id)}
              role="tab"
              aria-selected={activeGuitarId === g.id}
            >
              <span class="tab-type">{g.type}</span>
              <span class="tab-name">{g.name}</span>
            </button>
          {/each}
        </div>
        <button class="btn btn-secondary btn-sm" onclick={() => (showNewGuitarModal = true)}>
          + Add Guitar
        </button>
      </div>
    </header>

    {#if activeGuitar}
      <div class="dashboard-grid">
        <!-- Main Status Card -->
        <section class="card-panel status-panel">
          <div class="panel-header">
            <div>
              <h2>{activeGuitar.name}</h2>
              <p class="guitar-sub">{activeGuitar.model} &middot; {activeGuitar.tuning}</p>
            </div>
            <div class="panel-actions">
              <button class="btn btn-primary btn-sm" onclick={() => (showRestringModal = true)}>
                ⚡ Log New String Change
              </button>
              {#if guitars.length > 1}
                <button class="btn-text-danger" onclick={deleteCurrentGuitar}>
                  Delete Guitar
                </button>
              {/if}
            </div>
          </div>

          <!-- Health Meter Display -->
          <div class="health-display">
            <div class="health-bar-container">
              <div class="health-bar-header">
                <span class="health-title">Current String Health</span>
                <span class="health-percent health-{stringHealth().severity}">
                  {stringHealth().percentage}% &mdash; {stringHealth().status}
                </span>
              </div>
              <div class="health-bar-track">
                <div
                  class="health-bar-fill fill-{stringHealth().severity}"
                  style="width: {stringHealth().percentage}%"
                ></div>
              </div>
            </div>

            <!-- Health Indicators Grid -->
            <div class="stats-row">
              <div class="mini-stat">
                <span class="stat-lbl">Play Time Logged</span>
                <span class="stat-num">{activeGuitar.currentStrings.playHours} hrs</span>
              </div>
              <div class="mini-stat">
                <span class="stat-lbl">Days on Instrument</span>
                <span class="stat-num">{stringHealth().days} days</span>
              </div>
              <div class="mini-stat">
                <span class="stat-lbl">Current String Set</span>
                <span class="stat-num">{activeGuitar.currentStrings.brand} ({activeGuitar.currentStrings.gauge})</span>
              </div>
              <div class="mini-stat">
                <span class="stat-lbl">Coating Tech</span>
                <span class="stat-num">{activeGuitar.currentStrings.coated ? 'Coated (Extended Life)' : 'Standard (Uncoated)'}</span>
              </div>
            </div>
          </div>

          <!-- Quick Hour Logging Controls -->
          <div class="hour-logging-box">
            <div class="log-info">
              <h4>Log Practice Session</h4>
              <p>Add played hours to update fatigue calculation:</p>
            </div>
            <div class="log-buttons">
              <button class="btn btn-secondary btn-sm" onclick={() => logPlayHours(0.5)}>+30 Min</button>
              <button class="btn btn-secondary btn-sm" onclick={() => logPlayHours(1.0)}>+1 Hour</button>
              <button class="btn btn-secondary btn-sm" onclick={() => logPlayHours(2.0)}>+2 Hours</button>
              <button class="btn btn-secondary btn-sm" onclick={() => logPlayHours(3.0)}>+3 Hours</button>
            </div>
          </div>

          <!-- Tone & Intonation Advisory -->
          {#if stringHealth().percentage < 40}
            <div class="alert-box alert-warning">
              <div class="alert-icon">⚠️</div>
              <div class="alert-text">
                <strong>Tone Degradation &amp; Fret Wear Warning:</strong>
                <p>
                  These strings have accumulated oxidation, hand oil, and fret flattening. Playing on dead strings alters your intonation (chords sound out of tune even when open strings are tuned) and accelerates fretwire crown wear. Restringing is recommended.
                </p>
              </div>
            </div>
          {:else if stringHealth().percentage >= 65 && stringHealth().percentage <= 88}
            <div class="alert-box alert-sweetspot">
              <div class="alert-icon">✨</div>
              <div class="alert-text">
                <strong>Optimal Playability Sweet Spot:</strong>
                <p>
                  Core wire elasticity has stabilized and metallic tension spikes have settled. Tuning stability and intonation are currently at peak performance.
                </p>
              </div>
            </div>
          {/if}
        </section>

        <!-- String Set History -->
        <section class="card-panel history-panel">
          <div class="panel-header">
            <h3>Maintenance History</h3>
            <span class="history-count">{activeGuitar.history.length} Previous Sets</span>
          </div>

          {#if activeGuitar.history.length > 0}
            <div class="history-list">
              {#each activeGuitar.history as h, idx}
                <div class="history-item">
                  <div class="h-main">
                    <strong>{h.brand}</strong>
                    <span class="h-gauge">{h.gauge}</span>
                  </div>
                  <div class="h-meta">
                    <span>{h.dateInstalled} &rarr; {h.dateReplaced}</span>
                    <span class="h-hours">⏱️ {h.totalHours} hours</span>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-history">
              <p>No previous string sets recorded yet.</p>
              <p class="empty-sub">When you log your next string change, your previous set and hours played will be archived here.</p>
            </div>
          {/if}
        </section>
      </div>
    {/if}
  </div>
</div>

<!-- Modal: New Guitar -->
{#if showNewGuitarModal}
  <div
    class="modal-backdrop"
    onclick={() => (showNewGuitarModal = false)}
    onkeydown={(e) => { if (e.key === 'Escape') showNewGuitarModal = false; }}
    role="presentation"
  >
    <div
      class="modal-card"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-new-guitar"
      tabindex="-1"
    >
      <div class="modal-header">
        <h3 id="modal-new-guitar">Add Instrument to Stable</h3>
        <button class="modal-close" onclick={() => (showNewGuitarModal = false)}>&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="g-name">Guitar Name / Nickname:</label>
          <input id="g-name" type="text" bind:value={newGuitarName} placeholder="e.g. 50s Telecaster" />
        </div>
        <div class="form-group">
          <label for="g-model">Model / Specifications:</label>
          <input id="g-model" type="text" bind:value={newGuitarModel} placeholder="e.g. Vintera II Telecaster" />
        </div>
        <div class="form-group">
          <label for="g-type">Instrument Category:</label>
          <select id="g-type" bind:value={newGuitarType} class="select-input">
            <option value="Electric">Electric Guitar</option>
            <option value="Acoustic">Acoustic Steel-String</option>
            <option value="Bass">Electric Bass</option>
            <option value="Classical">Nylon Classical</option>
          </select>
        </div>
        <div class="form-group">
          <label for="g-tuning">Primary Tuning:</label>
          <input id="g-tuning" type="text" bind:value={newGuitarTuning} />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => (showNewGuitarModal = false)}>Cancel</button>
        <button class="btn btn-primary" onclick={addNewGuitar}>Save Guitar</button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal: Restring -->
{#if showRestringModal}
  <div
    class="modal-backdrop"
    onclick={() => (showRestringModal = false)}
    onkeydown={(e) => { if (e.key === 'Escape') showRestringModal = false; }}
    role="presentation"
  >
    <div
      class="modal-card"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-restring"
      tabindex="-1"
    >
      <div class="modal-header">
        <h3 id="modal-restring">Log Fresh String Set</h3>
        <button class="modal-close" onclick={() => (showRestringModal = false)}>&times;</button>
      </div>
      <div class="modal-body">
        <p class="modal-desc">
          Archiving current string set ({activeGuitar.currentStrings.playHours} hours) to maintenance history.
        </p>
        <div class="form-group">
          <label for="s-brand">String Brand:</label>
          <select id="s-brand" bind:value={restringBrand} class="select-input">
            <option value="D'Addario">D'Addario</option>
            <option value="Ernie Ball">Ernie Ball</option>
            <option value="Elixir">Elixir</option>
            <option value="Martin">Martin</option>
            <option value="DR Strings">DR Strings</option>
            <option value="Rotosound">Rotosound</option>
            <option value="Dunlop">Dunlop</option>
            <option value="Custom">Other / Custom</option>
          </select>
        </div>
        <div class="form-group">
          <label for="s-model">Product Line / Alloy:</label>
          <input id="s-model" type="text" bind:value={restringModel} placeholder="e.g. Slinky, NYXL, Phosphor Bronze" />
        </div>
        <div class="form-group">
          <label for="s-gauge">String Gauge:</label>
          <input id="s-gauge" type="text" bind:value={restringGauge} placeholder="e.g. 10-46, 09-42, 12-53" />
        </div>
        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" bind:checked={restringCoated} />
            Coated Strings (e.g. Elixir Optiweb, D'Addario XS — 2.5x lifespan)
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => (showRestringModal = false)}>Cancel</button>
        <button class="btn btn-primary" onclick={handleRestring}>Confirm Restring</button>
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

  .guitar-tabs-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .guitar-tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .guitar-tab {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 1rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    text-align: left;
  }

  .guitar-tab:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--border-subtle);
  }

  .guitar-tab.active {
    background-color: var(--accent-subtle);
    border-color: var(--accent);
  }

  .tab-type {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .guitar-tab.active .tab-type {
    color: var(--accent);
  }

  .tab-name {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  /* Dashboard Grid */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1.7fr 1fr;
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

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 1rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .panel-header h2 {
    font-size: 1.6rem;
  }

  .guitar-sub {
    font-size: 0.88rem;
    color: var(--text-secondary);
  }

  .panel-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .btn-text-danger {
    font-size: 0.8rem;
    color: #ef4444;
    text-decoration: underline;
    cursor: pointer;
  }

  /* Health Meter */
  .health-display {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.5rem;
  }

  .health-bar-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .health-bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.88rem;
    font-weight: 600;
  }

  .health-percent {
    font-weight: 700;
    font-size: 0.95rem;
  }

  .health-fresh { color: var(--status-live); }
  .health-broken-in { color: #38bdf8; }
  .health-aging { color: var(--accent-light); }
  .health-overdue { color: #ef4444; }

  .health-bar-track {
    width: 100%;
    height: 14px;
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .health-bar-fill {
    height: 100%;
    transition: width var(--transition-normal);
  }

  .fill-fresh { background-color: var(--status-live); }
  .fill-broken-in { background-color: #38bdf8; }
  .fill-aging { background-color: var(--accent); }
  .fill-overdue { background-color: #ef4444; }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-subtle);
  }

  .mini-stat {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .stat-lbl {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .stat-num {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  /* Log practice */
  .hour-logging-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.4rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    gap: 1rem;
    flex-wrap: wrap;
  }

  .log-info h4 {
    font-size: 0.95rem;
  }

  .log-info p {
    font-size: 0.82rem;
    color: var(--text-secondary);
  }

  .log-buttons {
    display: flex;
    gap: 0.5rem;
  }

  /* Alert boxes */
  .alert-box {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    font-size: 0.88rem;
    line-height: 1.5;
  }

  .alert-warning {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .alert-sweetspot {
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #6ee7b7;
  }

  .alert-icon {
    font-size: 1.2rem;
    line-height: 1;
  }

  /* History Panel */
  .history-panel {
    max-height: 700px;
  }

  .history-count {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .history-list {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .history-item {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .h-main {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
  }

  .h-gauge {
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 0.85rem;
  }

  .h-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .empty-history {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-muted);
    font-size: 0.9rem;
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
    max-width: 480px;
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

  .modal-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .form-group label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 600;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  @media (max-width: 900px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
