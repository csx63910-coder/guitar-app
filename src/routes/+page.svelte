<script lang="ts">
  import toolsData from '$lib/tools.json';
  import type { Tool } from '$lib/types';
  import ToolCard from '$lib/components/ToolCard.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import { base } from '$app/paths';

  const tools: Tool[] = toolsData as Tool[];

  let searchQuery = $state('');
  let selectedStatus = $state('all');
  let selectedTier = $state('all');
  let selectedCategory = $state('all');

  // Extract unique categories
  const categories = Array.from(new Set(tools.map((t) => t.category))).sort();

  // Filtered tools
  const filteredTools = $derived(
    tools.filter((tool) => {
      // Status filter
      if (selectedStatus !== 'all' && tool.status !== selectedStatus) return false;

      // Tier filter
      if (selectedTier !== 'all' && tool.tier !== selectedTier) return false;

      // Category filter
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const numMatch = `#${tool.number}`.includes(q) || tool.number.toString() === q;
        const nameMatch = tool.name.toLowerCase().includes(q);
        const descMatch = tool.description.toLowerCase().includes(q);
        const catMatch = tool.category.toLowerCase().includes(q);
        const tagMatch = tool.tags.some((tag) => tag.toLowerCase().includes(q));

        return numMatch || nameMatch || descMatch || catMatch || tagMatch;
      }

      return true;
    })
  );

  const liveCount = tools.filter((t) => t.status === 'live').length;
  const plannedCount = tools.filter((t) => t.status === 'planned').length;
</script>

<svelte:head>
  <title>Guitar Toolkit — Personal Zero-Budget Guitar Suite</title>
</svelte:head>

<!-- Hero Section -->
<section class="hero-section">
  <div class="container hero-inner">
    <div class="hero-chips">
      <span class="chip">PC SOFTWARE &middot; WEB APP + DESKTOP</span>
      <span class="chip chip-accent">PERSONAL USE &middot; €0 BUDGET</span>
      <span class="chip chip-live">PHASE 1 DEPLOYED</span>
    </div>

    <h1 class="hero-title">
      Guitar Toolkit <span class="thin">/ the personal suite</span>
    </h1>

    <p class="hero-lead">
      A modular suite of lightweight guitar tools built for PC. Runs 100% locally in your browser, works completely offline, and costs exactly €0 to build, run, and host.
    </p>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-val">{liveCount}</span>
        <span class="stat-label">Live Tool (#131)</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{plannedCount}</span>
        <span class="stat-label">Planned in Ladder</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">100%</span>
        <span class="stat-label">Offline &amp; Local-First</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">€0</span>
        <span class="stat-label">Server &amp; API Cost</span>
      </div>
    </div>

    <!-- Featured Live Tool Banner -->
    <div class="featured-banner">
      <div class="featured-info">
        <span class="badge badge-live">● LIVE NOW &middot; #131</span>
        <h2>Repair Diagnostic Wizard</h2>
        <p>Interactive decision-tree troubleshooter for guitar buzz, high action, and tuning instability with credit-card feeler gauge instructions.</p>
      </div>
      <a href="{base}/tools/repair-wizard/" class="btn btn-primary">
        Open Repair Wizard
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
    </div>
  </div>
</section>

<!-- Main Catalog & Filter Section -->
<section class="catalog-section" id="tools-catalog">
  <div class="container catalog-inner">
    <div class="section-header">
      <div class="section-title-wrap">
        <h2>Tool Registry &amp; Application Ladder</h2>
        <p class="section-sub">
          Tools are implemented one-by-one following the ascending difficulty ladder: Tier 1 (Pure Logic) &rarr; Tier 2 (Light Audio) &rarr; Tier 3 (Real DSP).
        </p>
      </div>
      <span class="results-count">
        Showing <strong>{filteredTools.length}</strong> of {tools.length} tools
      </span>
    </div>

    <!-- Search & Filter Controls -->
    <div class="controls-stack">
      <SearchBar bind:searchQuery />
      <FilterBar
        bind:selectedStatus
        bind:selectedTier
        bind:selectedCategory
        {categories}
      />
    </div>

    <!-- Tools Grid -->
    {#if filteredTools.length > 0}
      <div class="tools-grid">
        {#each filteredTools as tool (tool.id)}
          <ToolCard {tool} />
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
        <h3>No tools match your criteria</h3>
        <p>Try searching with another keyword or reset your filter settings.</p>
        <button
          class="btn btn-secondary"
          onclick={() => {
            searchQuery = '';
            selectedStatus = 'all';
            selectedTier = 'all';
            selectedCategory = 'all';
          }}
        >
          Reset All Filters
        </button>
      </div>
    {/if}
  </div>
</section>

<!-- Ladder Explanation Section -->
<section class="ladder-section">
  <div class="container">
    <div class="ladder-card">
      <div class="ladder-header">
        <span class="badge badge-accent">THE BUILD METHODOLOGY</span>
        <h2>Why Website-First &amp; Easiest-First?</h2>
        <p>
          Audio projects usually fail when builders jump straight into heavy DSP or native app store bureaucracy. Guitar Toolkit flips that order:
        </p>
      </div>

      <div class="ladder-steps">
        <div class="ladder-step">
          <div class="step-num">01</div>
          <div class="step-content">
            <h4>Phase 1: Starter Hub (Current)</h4>
            <p>One static PWA host with Inter font bundled, registry in <code>tools.json</code>, zero server costs, and instant offline capability.</p>
          </div>
        </div>

        <div class="ladder-step">
          <div class="step-num">02</div>
          <div class="step-content">
            <h4>Phase 2: Tier 1 (Pure Logic &amp; Data)</h4>
            <p>#131 Repair Wizard, #83 Pedalboard Planner, #80 String-Life Tracker, #37 NNS/Capo, #132 Serial Decoder. Zero audio risks, immediate utility.</p>
          </div>
        </div>

        <div class="ladder-step">
          <div class="step-num">03</div>
          <div class="step-content">
            <h4>Phase 2: Tier 2 &amp; 3 (Light Audio &rarr; Real DSP)</h4>
            <p>Mic volume meters, bend intonation trainers (YIN), ear trainers, and sample-accurate AudioWorklet procedural backing bands.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .hero-section {
    padding: 3.5rem 0 2.5rem;
    border-bottom: 1px solid var(--border-subtle);
    background: radial-gradient(circle at 50% -20%, rgba(245, 158, 11, 0.08) 0%, transparent 70%);
  }

  .hero-inner {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .hero-chips {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .chip {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 0.25rem 0.65rem;
    border-radius: var(--radius-full);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    color: var(--text-secondary);
  }

  .chip-accent {
    background-color: var(--accent-subtle);
    border-color: var(--accent-border);
    color: var(--accent-light);
  }

  .chip-live {
    background-color: var(--status-live-bg);
    border-color: var(--status-live-border);
    color: var(--status-live);
  }

  .hero-title {
    font-size: 2.8rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .thin {
    font-weight: 300;
    color: var(--text-muted);
  }

  .hero-lead {
    font-size: 1.15rem;
    color: var(--text-secondary);
    max-width: 780px;
    line-height: 1.6;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .stat-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-val {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .featured-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    background: linear-gradient(135deg, rgba(24, 27, 34, 0.95) 0%, rgba(31, 36, 47, 0.85) 100%);
    border: 1px solid var(--status-live-border);
    border-radius: var(--radius-lg);
    padding: 1.75rem 2rem;
    margin-top: 0.5rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  }

  .featured-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 650px;
  }

  .featured-info h2 {
    font-size: 1.5rem;
  }

  .featured-info p {
    font-size: 0.92rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  /* Catalog Section */
  .catalog-section {
    padding: 3.5rem 0;
  }

  .catalog-inner {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .section-title-wrap h2 {
    font-size: 1.8rem;
    margin-bottom: 0.35rem;
  }

  .section-sub {
    font-size: 0.92rem;
    color: var(--text-secondary);
    max-width: 680px;
  }

  .results-count {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .results-count strong {
    color: var(--text-primary);
  }

  .controls-stack {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1.25rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 1rem;
    background-color: var(--bg-secondary);
    border: 1px dashed var(--border-default);
    border-radius: var(--radius-lg);
    text-align: center;
    gap: 0.75rem;
  }

  .empty-icon {
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }

  .empty-state h3 {
    font-size: 1.2rem;
  }

  .empty-state p {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }

  /* Ladder Section */
  .ladder-section {
    padding: 2.5rem 0 4rem;
  }

  .ladder-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .ladder-header {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .ladder-header h2 {
    font-size: 1.6rem;
  }

  .ladder-header p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    max-width: 700px;
  }

  .ladder-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }

  .ladder-step {
    display: flex;
    gap: 1rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.4rem;
  }

  .step-num {
    font-size: 1.6rem;
    font-weight: 800;
    font-family: var(--font-mono);
    color: var(--accent);
    line-height: 1;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .step-content h4 {
    font-size: 1rem;
    color: var(--text-primary);
  }

  .step-content p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.2rem;
    }
    .featured-banner {
      flex-direction: column;
      align-items: flex-start;
      padding: 1.5rem;
    }
    .ladder-card {
      padding: 1.5rem;
    }
  }
</style>
