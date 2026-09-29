<script lang="ts">
  import { transposeChord } from '$lib/utils/musicTheory';
  import { base } from '$app/paths';

  let rawInput = $state(
`[Intro]
C   G   Am   F

[Verse 1]
C                     G
Yesterday, all my troubles seemed so far away
Am               F               G
Now it looks as though they're here to stay
C   G       Am      F       C
Oh, I believe in yesterday

[Chorus]
E   E7      Am       G   F
Why she had to go, I don't know
     G        C
She wouldn't say
E   E7        Am       G       F
I said something wrong, now I long
    G       C
For yesterday`
  );

  let semitoneOffset = $state(0);
  let fontSize = $state<'normal' | 'large' | 'xlarge'>('large');
  let columnLayout = $state<'1-col' | '2-col'>('2-col');
  let autoCapo = $state(0);

  // Cleans and normalizes chord sheet
  function cleanAndTranspose(text: string, shift: number): { type: 'section' | 'chords-lyrics' | 'text'; content: string; chordLine?: string; lyricLine?: string }[] {
    const rawLines = text.split('\n');
    const result: { type: 'section' | 'chords-lyrics' | 'text'; content: string; chordLine?: string; lyricLine?: string }[] = [];

    let i = 0;
    while (i < rawLines.length) {
      const line = rawLines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        result.push({ type: 'text', content: '' });
        i++;
        continue;
      }

      // Check if section header like [Verse 1] or Chorus:
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        result.push({ type: 'section', content: trimmed });
        i++;
        continue;
      }

      // Check if line is purely chords
      // Regex for chord tokens
      const words = trimmed.split(/\s+/);
      const isChordLine = words.every((w) =>
        /^[A-G][#b]?(?:m|maj|dim|aug|sus\d*|\d+)*(?:\/[A-G][#b]?)?$/.test(w)
      );

      if (isChordLine) {
        // Transpose chords in this line
        const transposedChordLine = line.replace(/\b([A-G][#b]?(?:m|maj|dim|aug|sus\d*|\d+)*(?:\/[A-G][#b]?)?)\b/g, (token) => {
          return transposeChord(token, shift);
        });

        // Check if next line is lyrics
        const nextLine = rawLines[i + 1];
        if (nextLine !== undefined && nextLine.trim() && !nextLine.trim().startsWith('[')) {
          result.push({
            type: 'chords-lyrics',
            content: '',
            chordLine: transposedChordLine,
            lyricLine: nextLine
          });
          i += 2;
          continue;
        } else {
          result.push({ type: 'text', content: transposedChordLine });
          i++;
          continue;
        }
      }

      // Normal line
      result.push({ type: 'text', content: line });
      i++;
    }

    return result;
  }

  let formattedSections = $derived(
    cleanAndTranspose(rawInput, semitoneOffset)
  );

  function printLeadSheet() {
    window.print();
  }
</script>

<svelte:head>
  <title>#44 Chord Chart Cleaner & Lead Sheet Formatter — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#44 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Chord Chart Cleaner &amp; Lead Sheet Reflower</h1>
      <p class="lead-text">
        Paste messy forum chord sheets or text files. Automatically normalizes chords, reflows lyrics into 2-column stage sheets, transposes keys, and generates print-ready lead sheets with zero mid-song page turns.
      </p>

      <!-- Stage Toolbar -->
      <div class="toolbar">
        <div class="tool-group">
          <span class="t-label">Transpose:</span>
          <div class="btn-group">
            <button class="tool-btn" onclick={() => semitoneOffset--}>-1</button>
            <span class="shift-badge">{semitoneOffset > 0 ? `+${semitoneOffset}` : semitoneOffset}</span>
            <button class="tool-btn" onclick={() => semitoneOffset++}>+1</button>
            {#if semitoneOffset !== 0}
              <button class="reset-link" onclick={() => (semitoneOffset = 0)}>Reset</button>
            {/if}
          </div>
        </div>

        <div class="tool-group">
          <span class="t-label">Font Size:</span>
          <div class="btn-group">
            <button class="tool-btn {fontSize === 'normal' ? 'active' : ''}" onclick={() => (fontSize = 'normal')}>Normal</button>
            <button class="tool-btn {fontSize === 'large' ? 'active' : ''}" onclick={() => (fontSize = 'large')}>Large</button>
            <button class="tool-btn {fontSize === 'xlarge' ? 'active' : ''}" onclick={() => (fontSize = 'xlarge')}>XL Stage</button>
          </div>
        </div>

        <div class="tool-group">
          <span class="t-label">Columns:</span>
          <div class="btn-group">
            <button class="tool-btn {columnLayout === '1-col' ? 'active' : ''}" onclick={() => (columnLayout = '1-col')}>1-Col</button>
            <button class="tool-btn {columnLayout === '2-col' ? 'active' : ''}" onclick={() => (columnLayout = '2-col')}>2-Col</button>
          </div>
        </div>

        <button class="btn btn-primary btn-sm print-action-btn" onclick={printLeadSheet}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print / Save PDF
        </button>
      </div>
    </header>

    <!-- Main Workspace Split -->
    <div class="cleaner-split">
      <!-- Input Panel -->
      <section class="card-panel input-panel no-print">
        <div class="panel-header">
          <h3>Raw Input (Paste here)</h3>
          <span class="panel-hint">Preserves your own files &amp; notes</span>
        </div>
        <textarea
          bind:value={rawInput}
          class="raw-textarea"
          placeholder="Paste raw chord sheet..."
          rows="18"
        ></textarea>
      </section>

      <!-- Cleaned Lead Sheet Output -->
      <section class="card-panel sheet-panel font-{fontSize}">
        <div class="sheet-container layout-{columnLayout}" id="print-sheet">
          {#each formattedSections as item}
            {#if item.type === 'section'}
              <div class="section-tag-box">
                <span class="section-tag">{item.content}</span>
              </div>
            {:else if item.type === 'chords-lyrics'}
              <div class="pair-block">
                <pre class="chord-line">{item.chordLine}</pre>
                <div class="lyric-line">{item.lyricLine}</div>
              </div>
            {:else}
              <div class="text-line">{item.content}</div>
            {/if}
          {/each}
        </div>
      </section>
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

  /* Toolbar */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    padding: 0.85rem 1.25rem;
    border-radius: var(--radius-md);
    margin-top: 0.5rem;
  }

  .tool-group {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .t-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .btn-group {
    display: flex;
    align-items: center;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 0.15rem;
  }

  .tool-btn {
    padding: 0.35rem 0.65rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .tool-btn.active {
    background-color: var(--accent);
    color: var(--text-inverse);
  }

  .shift-badge {
    font-family: var(--font-mono);
    font-weight: 700;
    min-width: 2rem;
    text-align: center;
    font-size: 0.85rem;
  }

  .reset-link {
    font-size: 0.75rem;
    color: var(--accent);
    text-decoration: underline;
    margin-left: 0.35rem;
  }

  .print-action-btn {
    margin-left: auto;
  }

  /* Cleaner Split */
  .cleaner-split {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 1.75rem;
  }

  .card-panel {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: var(--shadow-card);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-header h3 {
    font-size: 1.15rem;
  }

  .panel-hint {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .raw-textarea {
    width: 100%;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    line-height: 1.6;
    padding: 1.2rem;
    background-color: var(--bg-canvas);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    resize: vertical;
  }

  /* Sheet Panel */
  .sheet-panel {
    background-color: var(--bg-canvas);
    border-color: var(--border-default);
  }

  .sheet-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .layout-2-col {
    column-count: 2;
    column-gap: 2rem;
    display: block;
  }

  .font-normal { font-size: 0.9rem; }
  .font-large { font-size: 1.1rem; }
  .font-xlarge { font-size: 1.35rem; }

  .section-tag-box {
    margin: 1.25rem 0 0.5rem;
    break-after: avoid;
  }

  .section-tag {
    font-size: 0.85em;
    font-weight: 700;
    color: var(--accent);
    background-color: var(--accent-subtle);
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--accent-border);
    display: inline-block;
  }

  .pair-block {
    margin-bottom: 0.75rem;
    break-inside: avoid;
  }

  .chord-line {
    font-family: var(--font-mono);
    font-weight: 800;
    color: var(--accent-light);
    white-space: pre-wrap;
    line-height: 1.2;
    margin-bottom: 0.15rem;
  }

  .lyric-line {
    color: var(--text-primary);
    line-height: 1.4;
  }

  .text-line {
    color: var(--text-secondary);
    min-height: 1em;
  }

  @media (max-width: 900px) {
    .cleaner-split {
      grid-template-columns: 1fr;
    }
    .layout-2-col {
      column-count: 1;
    }
    .print-action-btn {
      margin-left: 0;
      width: 100%;
    }
  }

  @media print {
    .no-print {
      display: none !important;
    }
    .tool-page {
      padding: 0 !important;
    }
    .cleaner-split {
      display: block !important;
    }
    .sheet-panel {
      border: none !important;
      background: #fff !important;
      color: #000 !important;
      padding: 0 !important;
      box-shadow: none !important;
    }
    .chord-line {
      color: #000 !important;
      font-weight: 900 !important;
    }
    .lyric-line, .text-line {
      color: #222 !important;
    }
    .section-tag {
      border: 1px solid #000 !important;
      background: #eee !important;
      color: #000 !important;
    }
  }
</style>
