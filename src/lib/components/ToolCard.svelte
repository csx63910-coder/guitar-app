<script lang="ts">
  import type { Tool } from '$lib/types';
  import { base } from '$app/paths';

  let { tool } = $props<{ tool: Tool }>();
</script>

<article class="tool-card {tool.status === 'live' ? 'card-live' : 'card-planned'}">
  <div class="card-header">
    <div class="header-badges">
      <span class="tool-number">#{tool.number}</span>
      <span class="badge {tool.status === 'live' ? 'badge-live' : 'badge-planned'}">
        {tool.status === 'live' ? '● LIVE' : 'PLANNED'}
      </span>
      <span class="badge badge-difficulty">{tool.difficulty}</span>
    </div>
    <span class="tier-pill">{tool.tier}</span>
  </div>

  <div class="card-body">
    <h3 class="tool-title">
      {#if tool.status === 'live'}
        <a href="{base}{tool.route}" class="title-link">{tool.name}</a>
      {:else}
        <span>{tool.name}</span>
      {/if}
    </h3>
    <p class="tool-desc">{tool.description}</p>
    <p class="tool-category"><span class="cat-label">Category:</span> {tool.category}</p>

    <div class="tags-container" aria-label="Tags">
      {#each tool.tags as tag}
        <span class="tag">#{tag}</span>
      {/each}
    </div>
  </div>

  <div class="card-footer">
    <span class="mvp-time" title="Estimated time to build MVP">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      {tool.timeToMvp}
    </span>

    {#if tool.status === 'live'}
      <a href="{base}{tool.route}" class="btn btn-primary btn-sm">
        Launch App
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
    {:else}
      <span class="status-note">
        In Build Ladder
      </span>
    {/if}
  </div>
</article>

<style>
  .tool-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.4rem;
    transition: all var(--transition-normal);
    position: relative;
    box-shadow: var(--shadow-card);
  }

  .tool-card:hover {
    border-color: var(--border-default);
    transform: translateY(-2px);
  }

  .card-live {
    border-color: var(--status-live-border);
    background: linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, var(--bg-secondary) 100%);
  }

  .card-live:hover {
    border-color: var(--status-live);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.15);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .header-badges {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
  }

  .tool-number {
    font-size: 0.85rem;
    font-weight: 800;
    font-family: var(--font-mono);
    color: var(--accent);
    background-color: var(--accent-subtle);
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--accent-border);
  }

  .badge-difficulty {
    background-color: var(--bg-tertiary);
    color: var(--text-muted);
    border: 1px solid var(--border-subtle);
  }

  .tier-pill {
    font-size: 0.72rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .tool-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
  }

  .title-link {
    color: inherit;
    transition: color var(--transition-fast);
  }

  .title-link:hover {
    color: var(--accent);
  }

  .tool-desc {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .tool-category {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .cat-label {
    font-weight: 600;
    color: var(--text-secondary);
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.5rem;
  }

  .tag {
    font-size: 0.72rem;
    color: var(--text-muted);
    background-color: var(--bg-primary);
    padding: 0.15rem 0.45rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1.4rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-subtle);
    gap: 0.5rem;
  }

  .mvp-time {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .btn-sm {
    padding: 0.4rem 0.85rem;
    font-size: 0.82rem;
  }

  .status-note {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--text-muted);
  }
</style>
