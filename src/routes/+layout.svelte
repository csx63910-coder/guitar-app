<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  let { children } = $props();

  onMount(() => {
    // Register Service Worker for PWA offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(`${base}/service-worker.js`, { scope: `${base}/` })
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }
  });
</script>

<a href="#main-content" class="skip-link">Skip to main content</a>

<div class="app-shell">
  <Header />

  <main id="main-content" class="main-content">
    {@render children()}
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-col brand-col">
        <div class="footer-logo">
          <span class="footer-title">GUITAR TOOLKIT</span>
          <span class="footer-badge">€0 PC SUITE</span>
        </div>
        <p class="footer-desc">
          A personal, local-first guitar software toolkit for PC. Designed to run 100% offline with zero server costs, zero paid APIs, and no telemetry.
        </p>
      </div>

      <div class="footer-col links-col">
        <h4>Navigation</h4>
        <ul>
          <li><a href="{base}/">Toolkit Hub</a></li>
          <li><a href="{base}/tools/repair-wizard/">#131 Repair Wizard (Live)</a></li>
          <li><a href="{base}/ideas.html" target="_blank">Full 236 Ideas Catalog</a></li>
        </ul>
      </div>

      <div class="footer-col constraints-col">
        <h4>The 3 Rules</h4>
        <ul>
          <li><strong>€0 to Build:</strong> Open source, free tiers, local CPU only.</li>
          <li><strong>Personal Use:</strong> Your content, your music, your files.</li>
          <li><strong>Local-First:</strong> Runs in-browser or desktop with no server bills.</li>
        </ul>
      </div>
    </div>

    <div class="container footer-bottom">
      <p>&copy; 2026 Guitar Toolkit. Built with Svelte 5 + Vite. Fully offline capable.</p>
      <p class="license-note">Core open source stack: Svelte (MIT), Inter (OFL), Web Standards.</p>
    </div>
  </footer>
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .site-footer {
    background-color: var(--bg-primary);
    border-top: 1px solid var(--border-subtle);
    padding: 3.5rem 0 2rem;
    margin-top: 4rem;
  }

  .footer-inner {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr;
    gap: 3rem;
    margin-bottom: 2.5rem;
  }

  .brand-col {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .footer-logo {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .footer-title {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: var(--text-primary);
  }

  .footer-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.15rem 0.45rem;
    background-color: var(--accent-subtle);
    color: var(--accent);
    border: 1px solid var(--accent-border);
    border-radius: var(--radius-sm);
  }

  .footer-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 420px;
  }

  .footer-col h4 {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 1rem;
  }

  .footer-col ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .footer-col a {
    color: var(--text-secondary);
    transition: color var(--transition-fast);
  }

  .footer-col a:hover {
    color: var(--accent);
  }

  .constraints-col strong {
    color: var(--text-primary);
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-subtle);
    font-size: 0.78rem;
    color: var(--text-muted);
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  @media (max-width: 860px) {
    .footer-inner {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }
</style>
