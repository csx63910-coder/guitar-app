<script lang="ts">
  import { onMount } from 'svelte';

  let { searchQuery = $bindable('') } = $props<{ searchQuery: string }>();

  let inputEl: HTMLInputElement | null = null;

  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Focus search when pressing '/' key outside an input
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputEl?.focus();
      }
      // Clear and blur on Escape
      if (e.key === 'Escape' && document.activeElement === inputEl) {
        searchQuery = '';
        inputEl?.blur();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="search-container">
  <div class="search-input-wrapper">
    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>

    <input
      bind:this={inputEl}
      type="search"
      bind:value={searchQuery}
      placeholder="Search tools by name, #ID, category, or tag (e.g., #131, buzz, pedals, audio)..."
      aria-label="Search guitar tools"
      class="search-input"
    />

    {#if searchQuery}
      <button class="clear-btn" onclick={() => { searchQuery = ''; inputEl?.focus(); }} aria-label="Clear search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    {:else}
      <span class="kbd-hint" aria-hidden="true">/</span>
    {/if}
  </div>
</div>

<style>
  .search-container {
    width: 100%;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    color: var(--text-muted);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 0.85rem 3rem 0.85rem 2.85rem;
    font-size: 0.95rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .search-input:focus {
    border-color: var(--accent);
    background-color: var(--bg-tertiary);
  }

  .kbd-hint {
    position: absolute;
    right: 1.1rem;
    font-size: 0.75rem;
    font-family: var(--font-mono);
    color: var(--text-muted);
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    padding: 0.15rem 0.45rem;
    border-radius: var(--radius-sm);
    pointer-events: none;
  }

  .clear-btn {
    position: absolute;
    right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    color: var(--text-muted);
    border-radius: 50%;
    background-color: var(--bg-tertiary);
    transition: color var(--transition-fast), background-color var(--transition-fast);
  }

  .clear-btn:hover {
    color: var(--text-primary);
    background-color: var(--bg-elevated);
  }
</style>
