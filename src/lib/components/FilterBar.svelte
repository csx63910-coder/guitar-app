<script lang="ts">
  let {
    selectedStatus = $bindable('all'),
    selectedTier = $bindable('all'),
    selectedCategory = $bindable('all'),
    categories = []
  } = $props<{
    selectedStatus: string;
    selectedTier: string;
    selectedCategory: string;
    categories: string[];
  }>();

  const tiers = [
    { id: 'all', label: 'All Tiers' },
    { id: 'Tier 1: Pure Logic', label: 'Tier 1: Pure Logic' },
    { id: 'Tier 2: Light Audio', label: 'Tier 2: Light Audio' },
    { id: 'Tier 3: Real DSP', label: 'Tier 3: Real DSP' }
  ];

  const statuses = [
    { id: 'all', label: 'All Status' },
    { id: 'live', label: 'Live Only' },
    { id: 'planned', label: 'Planned' }
  ];
</script>

<div class="filter-bar" aria-label="Filter tools">
  <div class="filter-group">
    <span class="filter-label">Status:</span>
    <div class="pills-row" role="radiogroup" aria-label="Filter by tool status">
      {#each statuses as s}
        <button
          class="filter-pill {selectedStatus === s.id ? 'active' : ''}"
          onclick={() => selectedStatus = s.id}
          role="radio"
          aria-checked={selectedStatus === s.id}
        >
          {s.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="filter-group">
    <span class="filter-label">Ladder Tier:</span>
    <div class="pills-row" role="radiogroup" aria-label="Filter by build tier">
      {#each tiers as t}
        <button
          class="filter-pill {selectedTier === t.id ? 'active' : ''}"
          onclick={() => selectedTier = t.id}
          role="radio"
          aria-checked={selectedTier === t.id}
        >
          {t.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="filter-group category-group">
    <label for="category-select" class="filter-label">Category:</label>
    <select id="category-select" bind:value={selectedCategory} class="category-select">
      <option value="all">All Categories</option>
      {#each categories as cat}
        <option value={cat}>{cat}</option>
      {/each}
    </select>
  </div>
</div>

<style>
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.25rem;
    padding: 0.85rem 1.2rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filter-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pills-row {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .filter-pill {
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.3rem 0.65rem;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    transition: all var(--transition-fast);
  }

  .filter-pill:hover {
    color: var(--text-primary);
    background-color: var(--bg-elevated);
  }

  .filter-pill.active {
    color: var(--text-inverse);
    background-color: var(--accent);
    border-color: var(--accent);
    font-weight: 600;
  }

  .category-group {
    margin-left: auto;
  }

  .category-select {
    padding: 0.35rem 0.75rem;
    font-size: 0.82rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    .category-group {
      margin-left: 0;
      width: 100%;
    }
    .category-select {
      flex: 1;
    }
  }
</style>
