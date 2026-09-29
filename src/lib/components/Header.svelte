<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  let isOffline = $state(false);
  let installPrompt: any = $state(null);
  let isInstalled = $state(false);

  onMount(() => {
    isOffline = !navigator.onLine;

    const handleOnline = () => { isOffline = false; };
    const handleOffline = () => { isOffline = true; };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      installPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      isInstalled = true;
      installPrompt = null;
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      isInstalled = true;
    }
    installPrompt = null;
  }
</script>

<header class="site-header">
  <div class="container header-inner">
    <a href="{base}/" class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 512 512" width="28" height="28" fill="none" aria-hidden="true">
          <path d="M 256,90 C 340,90 400,160 380,270 C 360,380 280,430 256,440 C 232,430 152,380 132,270 C 112,160 172,90 256,90 Z" fill="#1e222b" stroke="#f59e0b" stroke-width="20"/>
          <circle cx="256" cy="240" r="42" fill="#0b0d11" stroke="#f59e0b" stroke-width="12"/>
        </svg>
      </div>
      <div class="logo-text">
        <span class="brand-name">GUITAR TOOLKIT</span>
        <span class="brand-tag">€0 &middot; LOCAL-FIRST &middot; PC SUITE</span>
      </div>
    </a>

    <nav class="header-nav" aria-label="Main navigation">
      {#if isOffline}
        <span class="offline-pill" title="Working fully offline with cached assets">
          <span class="dot offline"></span> Offline Mode
        </span>
      {:else}
        <span class="online-pill" title="Connected & precached">
          <span class="dot online"></span> PWA Ready
        </span>
      {/if}

      {#if installPrompt && !isInstalled}
        <button class="btn btn-secondary install-btn" onclick={handleInstall} aria-label="Install app to your PC">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Install App
        </button>
      {/if}

      <a href="https://github.com/csx63910-coder/guitar-app" target="_blank" rel="noopener noreferrer" class="nav-link" aria-label="GitHub Repository">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </a>
    </nav>
  </div>
</header>

<style>
  .site-header {
    background-color: var(--bg-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-subtle);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4.25rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    text-decoration: none;
  }

  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.6rem;
    height: 2.6rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
  }

  .logo-text {
    display: flex;
    flex-direction: column;
  }

  .brand-name {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: var(--text-primary);
  }

  .brand-tag {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--accent);
  }

  .header-nav {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .online-pill, .offline-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.65rem;
    border-radius: var(--radius-full);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .dot.online {
    background-color: var(--status-live);
    box-shadow: 0 0 8px var(--status-live);
  }

  .dot.offline {
    background-color: var(--accent);
    box-shadow: 0 0 8px var(--accent);
  }

  .install-btn {
    padding: 0.35rem 0.8rem;
    font-size: 0.8rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    color: var(--text-secondary);
    transition: color var(--transition-fast);
  }

  .nav-link:hover {
    color: var(--text-primary);
  }
</style>
