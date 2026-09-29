<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';
  import { transposeChord } from '$lib/utils/musicTheory';

  let songTitle = $state('Knockin\' on Heaven\'s Door');
  let artist = $state('Bob Dylan / Guns N\' Roses');
  let originalKey = $state('G');
  let currentKey = $state('G');
  let tempoBpm = $state(68);
  let transposeOffset = $state(0);
  let fontSize = $state(18); // px
  let scrollSpeed = $state(3); // 1-10
  let isScrolling = $state(false);

  let rawSheetText = $state(`[Intro]
G  D  Am7
G  D  C

[Verse 1]
G         D               Am7
Mama, take this badge off of me
G         D          C
I can't use it anymore
G            D                  Am7
It's gettin' dark, too dark for me to see
G            D               C
I feel I'm knockin' on heaven's door

[Chorus]
G             D                   Am7
Knock, knock, knockin' on heaven's door
G             D                   C
Knock, knock, knockin' on heaven's door
G             D                   Am7
Knock, knock, knockin' on heaven's door
G             D                   C
Knock, knock, knockin' on heaven's door

[Verse 2]
G         D               Am7
Mama, put my guns in the ground
G         D          C
I can't shoot them anymore
G              D                   Am7
That long black cloud is comin' on down
G            D               C
I feel I'm knockin' on heaven's door

[Chorus]
G             D                   Am7
Knock, knock, knockin' on heaven's door
G             D                   C
Knock, knock, knockin' on heaven's door
G             D                   Am7
Knock, knock, knockin' on heaven's door
G             D                   C
Knock, knock, knockin' on heaven's door

[Outro]
G  D  Am7
G  D  C
(Repeat and fade)`);

  let scrollInterval: any = null;

  function toggleAutoScroll() {
    isScrolling = !isScrolling;
    if (isScrolling) {
      startScrolling();
    } else {
      stopScrolling();
    }
  }

  function startScrolling() {
    stopScrolling();
    scrollInterval = setInterval(() => {
      window.scrollBy({ top: 1, behavior: 'auto' });
      // Stop at bottom
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 5) {
        stopScrolling();
        isScrolling = false;
      }
    }, Math.max(10, 60 - scrollSpeed * 5));
  }

  function stopScrolling() {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  }

  function handleTranspose(delta: number) {
    transposeOffset += delta;
  }

  function resetTranspose() {
    transposeOffset = 0;
  }

  // Transpose chords in raw text when transposeOffset != 0
  const processedLines = $derived(
    rawSheetText.split('\n').map((line) => {
      const trimmed = line.trim();

      // Check section header like [Verse 1]
      const sectionMatch = trimmed.match(/^\[(.*?)\]$/);
      if (sectionMatch) {
        return {
          type: 'section',
          content: sectionMatch[1]
        };
      }

      // Check if line is purely chords
      // Match words like G, D, Am7, F#m, Bbmaj7, etc.
      const tokens = line.split(/(\s+)/);
      const isLikelyChordLine = line.length > 0 && tokens.filter(t => t.trim()).length > 0 && tokens.filter(t => t.trim()).every((t) => {
        return /^[A-G][b#]?(m|maj|min|dim|aug|sus|add|\d|\/)*$/i.test(t);
      });

      if (isLikelyChordLine) {
        const transposed = tokens.map((t) => {
          if (!t.trim()) return t;
          return transposeChord(t, transposeOffset);
        }).join('');

        return {
          type: 'chord',
          content: transposed
        };
      }

      // Check inline bracket chords like [G]Mama, [D]take
      if (line.includes('[') && line.includes(']')) {
        const replaced = line.replace(/\[([A-G][b#]?[^\]]*)\]/g, (_, chord) => {
          return `<span class="inline-chord">${transposeChord(chord, transposeOffset)}</span>`;
        });
        return {
          type: 'inline',
          content: replaced
        };
      }

      return {
        type: 'lyric',
        content: line
      };
    })
  );

  onDestroy(() => {
    stopScrolling();
  });
</script>

<svelte:head>
  <title>#95 Lyric &amp; Chord Sheet Designer — Guitar Toolkit</title>
</svelte:head>

<div class="tool-page">
  <div class="container tool-inner">
    <!-- Breadcrumb -->
    <nav class="back-nav no-print" aria-label="Breadcrumb">
      <a href="{base}/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Guitar Toolkit Hub
      </a>
    </nav>

    <!-- Header -->
    <header class="tool-header no-print">
      <div class="tool-header-badges">
        <span class="badge badge-accent">#95 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Stage-Ready Lyric &amp; Chord Sheet Designer</h1>
      <p class="lead-text">
        High-contrast stage charts optimized for iPad, Android tablets, and live performance. Features hands-free auto-scrolling, instantaneous transposition, section color tags, and single-click print / PDF export.
      </p>
    </header>

    <!-- Stage Toolbar (Sticky floating control bar) -->
    <div class="stage-toolbar no-print">
      <div class="toolbar-group">
        <button
          class="btn {isScrolling ? 'btn-danger' : 'btn-primary'}"
          onclick={toggleAutoScroll}
        >
          {isScrolling ? '⏸ Pause Auto-Scroll' : '▶ Start Hands-Free Scroll'}
        </button>

        <div class="slider-control">
          <label for="speed-range">Speed: {scrollSpeed}</label>
          <input
            id="speed-range"
            type="range"
            min="1"
            max="10"
            bind:value={scrollSpeed}
            oninput={() => { if (isScrolling) startScrolling(); }}
          />
        </div>
      </div>

      <div class="toolbar-group">
        <span class="tool-label">Transpose:</span>
        <button class="trans-btn" onclick={() => handleTranspose(-1)}>-1</button>
        <span class="font-mono trans-val">{transposeOffset >= 0 ? `+${transposeOffset}` : transposeOffset}</span>
        <button class="trans-btn" onclick={() => handleTranspose(1)}>+1</button>
        {#if transposeOffset !== 0}
          <button class="btn-text-small" onclick={resetTranspose}>Reset</button>
        {/if}
      </div>

      <div class="toolbar-group">
        <span class="tool-label">Font:</span>
        <button class="trans-btn" onclick={() => (fontSize = Math.max(14, fontSize - 2))}>A-</button>
        <span class="font-mono font-size-display">{fontSize}px</span>
        <button class="trans-btn" onclick={() => (fontSize = Math.min(32, fontSize + 2))}>A+</button>
      </div>

      <div class="toolbar-group">
        <button class="btn btn-secondary" onclick={() => window.print()}>
          Print Stage Chart
        </button>
      </div>
    </div>

    <!-- Workspace Layout -->
    <div class="chart-workspace">
      <!-- Editor Panel (Hideable during performance) -->
      <div class="editor-column no-print">
        <div class="editor-header">
          <h3>Song Metadata &amp; Raw Editor</h3>
        </div>

        <div class="meta-inputs">
          <div class="form-group">
            <label for="stitle">Song Title:</label>
            <input id="stitle" type="text" bind:value={songTitle} />
          </div>

          <div class="form-group">
            <label for="sartist">Artist / Band:</label>
            <input id="sartist" type="text" bind:value={artist} />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="skey">Key:</label>
              <input id="skey" type="text" bind:value={originalKey} />
            </div>
            <div class="form-group">
              <label for="sbpm">Tempo (BPM):</label>
              <input id="sbpm" type="number" bind:value={tempoBpm} />
            </div>
          </div>
        </div>

        <div class="editor-text-wrap">
          <label for="sheet-raw">Lyric &amp; Chord Text (Supports ChordPro or Line-over-Lyric):</label>
          <textarea
            id="sheet-raw"
            rows="16"
            bind:value={rawSheetText}
            placeholder="[Verse 1]&#10;G  D  Em  C..."
          ></textarea>
        </div>
      </div>

      <!-- Live Stage Chart Preview -->
      <div class="stage-view-column">
        <div class="stage-chart" style="font-size: {fontSize}px">
          <div class="chart-header">
            <div class="chart-title-box">
              <h1 class="stage-title">{songTitle}</h1>
              <h2 class="stage-artist">{artist}</h2>
            </div>
            <div class="chart-badges">
              <span class="meta-tag">KEY: <strong>{originalKey}</strong></span>
              {#if transposeOffset !== 0}
                <span class="meta-tag tag-transposed">PITCH: <strong>{transposeOffset > 0 ? `+${transposeOffset}` : transposeOffset}</strong></span>
              {/if}
              <span class="meta-tag">BPM: <strong>{tempoBpm}</strong></span>
            </div>
          </div>

          <div class="chart-body">
            {#each processedLines as line, idx}
              {#if line.type === 'section'}
                <div class="section-badge section-{line.content.toLowerCase().split(' ')[0]}">
                  {line.content}
                </div>
              {:else if line.type === 'chord'}
                <div class="chord-line font-mono">{line.content}</div>
              {:else if line.type === 'inline'}
                <div class="inline-lyric">{@html line.content}</div>
              {:else}
                <div class="lyric-line">{line.content}</div>
              {/if}
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .tool-page {
    padding: 2rem 0 4rem;
  }

  .tool-inner {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
  }

  .back-link:hover {
    color: var(--accent);
  }

  .tool-header {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
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

  /* Stage Toolbar */
  .stage-toolbar {
    position: sticky;
    top: 1rem;
    z-index: 50;
    background-color: rgba(26, 26, 30, 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 0.85rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    box-shadow: var(--shadow-card);
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .tool-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .slider-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .slider-control input[type="range"] {
    width: 80px;
  }

  .trans-btn {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 700;
  }

  .trans-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .trans-val, .font-size-display {
    min-width: 28px;
    text-align: center;
    font-weight: 700;
    color: var(--accent-light);
  }

  .btn-text-small {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-decoration: underline;
    cursor: pointer;
  }

  .btn-danger {
    background-color: #ef4444;
    color: #fff;
    border: 1px solid transparent;
    padding: 0.6rem 1.25rem;
    font-weight: 600;
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  /* Workspace */
  .chart-workspace {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .chart-workspace {
      grid-template-columns: 1fr;
    }
  }

  .editor-column {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .meta-inputs {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
    gap: 0.75rem;
  }

  .editor-text-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .editor-text-wrap label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .editor-text-wrap textarea {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    line-height: 1.4;
    padding: 0.75rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    resize: vertical;
  }

  /* Stage Chart Render */
  .stage-view-column {
    min-height: 800px;
  }

  .stage-chart {
    background-color: #121215;
    border: 2px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 2.5rem;
    color: #f3f4f6;
    line-height: 1.5;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 2rem;
  }

  .stage-title {
    font-size: 2.4rem;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.1;
  }

  .stage-artist {
    font-size: 1.2rem;
    color: #9ca3af;
    margin-top: 0.35rem;
    font-weight: 500;
  }

  .chart-badges {
    display: flex;
    gap: 0.5rem;
  }

  .meta-tag {
    background-color: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
  }

  .tag-transposed {
    background-color: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.5);
    color: #fbbf24;
  }

  .chart-body {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .section-badge {
    display: inline-block;
    align-self: flex-start;
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 1.75rem;
    margin-bottom: 0.6rem;
  }

  .section-verse {
    background-color: #1e3a8a;
    color: #93c5fd;
    border: 1px solid #3b82f6;
  }

  .section-chorus {
    background-color: #78350f;
    color: #fde68a;
    border: 1px solid #f59e0b;
  }

  .section-bridge {
    background-color: #581c87;
    color: #e9d5ff;
    border: 1px solid #a855f7;
  }

  .section-intro, .section-outro {
    background-color: #14532d;
    color: #bbf7d0;
    border: 1px solid #22c55e;
  }

  .chord-line {
    color: #fbbf24;
    font-weight: 800;
    letter-spacing: 0.04em;
    white-space: pre;
    font-size: 1.15em;
  }

  .lyric-line {
    color: #f3f4f6;
    font-weight: 500;
    white-space: pre-wrap;
    margin-bottom: 0.75rem;
  }

  :global(.inline-chord) {
    color: #fbbf24;
    font-weight: 800;
    font-family: var(--font-mono);
    margin: 0 0.15em;
  }

  @media print {
    .no-print {
      display: none !important;
    }
    .stage-chart {
      background: #fff !important;
      color: #000 !important;
      border: none !important;
      padding: 0 !important;
    }
    .stage-title, .stage-artist {
      color: #000 !important;
    }
    .chord-line, :global(.inline-chord) {
      color: #b45309 !important;
      font-weight: bold !important;
    }
    .lyric-line {
      color: #000 !important;
    }
    .section-badge {
      border: 1px solid #000 !important;
      color: #000 !important;
      background: #f3f4f6 !important;
    }
  }
</style>
