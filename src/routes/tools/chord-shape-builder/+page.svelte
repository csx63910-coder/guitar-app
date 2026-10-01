<script lang="ts">
  import FretboardEngine from '$lib/components/engines/FretboardEngine.svelte';
  import { base } from '$app/paths';

  const tool = {
    number: 48,
    name: `Fingering advisor`,
    description: `Import MusicXML, get recommended positions and fingerings for your hand size and level. Classical guitarists do this by hand for hours.`,
    category: 'Tabs & Notation',
    tier: 'Tier 2: Light Audio',
    difficulty: 'Intermediate',
    route: '/tools/chord-shape-builder',
    timeToMvp: '2–3 weeks'
  };
</script>

<svelte:head>
  <title>#48 Fingering advisor — Guitar Toolkit</title>
  <meta name="description" content={tool.description} />
</svelte:head>

<div class="tool-page-container">
  <!-- Breadcrumb Navigation -->
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="{base}/">Guitar Toolkit</a>
    <span class="sep">/</span>
    <span class="crumb-cat">{tool.category}</span>
    <span class="sep">/</span>
    <span class="crumb-current">#{tool.number} {tool.name}</span>
  </nav>

  <!-- Tool Main Header -->
  <header class="tool-header">
    <div class="header-badges">
      <span class="num-badge">#{tool.number}</span>
      <span class="status-badge">● LIVE NOW</span>
      <span class="tier-pill">{tool.tier}</span>
      <span class="diff-badge">{tool.difficulty}</span>
    </div>
    <h1 class="tool-title">{tool.name}</h1>
    <p class="tool-lead">{tool.description}</p>
  </header>

  <!-- Zero-Budget Callout Banner -->
  <div class="zero-budget-card">
    <div class="zb-icon">€0</div>
    <div class="zb-text">
      <strong>Zero-Budget Architecture:</strong>
      Runs 100% locally on your machine with zero server costs, zero accounts, and no cloud processing. Fully offline-capable as an installed PWA.
    </div>
  </div>

  <!-- Interactive Engine Workspace -->
  <section class="workspace-section">
    <FretboardEngine
      toolTitle={tool.name}
      toolNumber={tool.number}
    />
  </section>

  <!-- Methodology Guide & Guitar Theory -->
  <section class="guide-section">
    <div class="guide-card">
      <h3>The #{tool.number} Methodology &amp; Context</h3>
      <div class="guide-grid">
        <div class="guide-item">
          <h4>The Problem Solved</h4>
          <p>Traditional tools in this domain either require paid software suites, proprietary hardware, or lock your progress into subscription paywalls. #{tool.number} provides instant, frictionless utility on your PC.</p>
        </div>
        <div class="guide-item">
          <h4>Zero-Cost Performance</h4>
          <p>All calculations, audio synthesis, and interactive feedback run directly on your browser runtime using standard Web Audio API and SVG rendering. Fast, responsive, and completely private.</p>
        </div>
        <div class="guide-item">
          <h4>Practice Integration</h4>
          <p>Incorporate this tool into your daily guitar routines. Save your custom presets, export your charts and spec sheets, and evaluate your progress over time.</p>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .tool-page-container {
    max-width: 1160px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .breadcrumb a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .breadcrumb a:hover {
    color: var(--accent);
  }

  .sep {
    color: var(--border-default);
  }

  .crumb-cat {
    color: var(--text-secondary);
  }

  .crumb-current {
    color: var(--accent-light);
    font-weight: 600;
  }

  .tool-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 1.75rem;
  }

  .header-badges {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .num-badge {
    font-size: 0.85rem;
    font-weight: 800;
    font-family: var(--font-mono);
    color: var(--accent);
    background-color: var(--accent-subtle);
    padding: 0.15rem 0.55rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--accent-border);
  }

  .status-badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--status-live);
    background-color: var(--status-live-bg);
    border: 1px solid var(--status-live-border);
    padding: 0.15rem 0.55rem;
    border-radius: var(--radius-sm);
  }

  .tier-pill {
    font-size: 0.75rem;
    color: var(--text-secondary);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    padding: 0.15rem 0.55rem;
    border-radius: var(--radius-sm);
  }

  .diff-badge {
    font-size: 0.75rem;
    color: var(--text-muted);
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    padding: 0.15rem 0.55rem;
    border-radius: var(--radius-sm);
  }

  .tool-title {
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .tool-lead {
    font-size: 1.05rem;
    color: var(--text-secondary);
    max-width: 800px;
    line-height: 1.6;
  }

  .zero-budget-card {
    display: flex;
    align-items: center;
    gap: 1.15rem;
    background-color: rgba(245, 158, 11, 0.05);
    border: 1px solid var(--accent-border);
    border-radius: var(--radius-md);
    padding: 1rem 1.35rem;
  }

  .zb-icon {
    font-size: 1.4rem;
    font-weight: 900;
    font-family: var(--font-mono);
    color: var(--accent);
    background-color: var(--accent-subtle);
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .zb-text {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .zb-text strong {
    color: var(--accent-light);
  }

  .guide-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .guide-card h3 {
    font-size: 1.3rem;
  }

  .guide-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .guide-item {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .guide-item h4 {
    font-size: 0.95rem;
    color: var(--accent-light);
  }

  .guide-item p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }
</style>
