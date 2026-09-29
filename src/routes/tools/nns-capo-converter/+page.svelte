<script lang="ts">
  import {
    MAJOR_KEYS,
    noteToIndex,
    indexToNote,
    parseChord,
    chordToNNS,
    nnsToChord,
    transposeChord,
    calculateCapoPossibilities,
    type CapoSolution,
    STANDARD_TUNING
  } from '$lib/utils/musicTheory';
  import { base } from '$app/paths';

  let selectedKey = $state<string>('G');
  let conversionMode = $state<'chords-to-nns' | 'nns-to-chords'>('chords-to-nns');
  let semitoneShift = $state<number>(0);

  // Default sample chart
  let inputChart = $state<string>(
`[Verse 1]
G                 D
Amazing grace, how sweet the sound
     Em               C
That saved a wretch like me!
  G               D
I once was lost, but now am found;
    Em       D        G
Was blind, but now I see.`
  );

  let targetSingerKey = $state<string>('Bb');
  let capoSolutions = $derived<CapoSolution[]>(calculateCapoPossibilities(targetSingerKey));
  let selectedCapoSolution = $state<CapoSolution | null>(null);

  $effect(() => {
    if (capoSolutions.length > 0 && !selectedCapoSolution) {
      selectedCapoSolution = capoSolutions[0];
    }
  });

  // Convert chart text preserving lines
  function transformChart(text: string, key: string, mode: 'chords-to-nns' | 'nns-to-chords', shift: number): string {
    const lines = text.split('\n');
    return lines
      .map((line) => {
        // Skip comment lines like [Verse] or [Chorus]
        if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
          return line;
        }

        // Split line while preserving spacing
        // Replace chord tokens
        return line.replace(/\b([A-G][#b]?(?:m|maj|dim|aug|sus\d*|\d+)*(?:\/[A-G][#b]?)?|\b[1-7][b#]?(?:m|maj|dim|aug|sus\d*|\d+)*)\b/g, (token) => {
          if (shift !== 0) {
            token = transposeChord(token, shift);
          }
          if (mode === 'chords-to-nns') {
            return chordToNNS(token, key);
          } else {
            return nnsToChord(token, key);
          }
        });
      })
      .join('\n');
  }

  let convertedChart = $derived<string>(
    transformChart(inputChart, selectedKey, conversionMode, semitoneShift)
  );

  let copyFeedback = $state(false);
  function copyToClipboard() {
    navigator.clipboard.writeText(convertedChart).then(() => {
      copyFeedback = true;
      setTimeout(() => (copyFeedback = false), 2000);
    });
  }

  // Fretboard visualization for Capo
  const FRET_COUNT = 12;
  const FRET_MARKERS = [3, 5, 7, 9, 12];
</script>

<svelte:head>
  <title>#37 + #39 Nashville Number & Capo Intelligence — Guitar Toolkit</title>
</svelte:head>

<div class="tool-page">
  <div class="container tool-inner">
    <!-- Breadcrumb -->
    <nav class="back-nav" aria-label="Breadcrumb">
      <a href="{base}/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Guitar Toolkit Hub
      </a>
    </nav>

    <!-- Header -->
    <header class="tool-header">
      <div class="tool-header-badges">
        <span class="badge badge-accent">#37 + #39 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Nashville Number &amp; Capo Intelligence</h1>
      <p class="lead-text">
        Instant two-way transposition between chord sheets and the Nashville Number System (NNS), plus an intelligent Capo Advisor that calculates how to play in any singer's key using comfortable open chord shapes.
      </p>
    </header>

    <!-- Main Grid: NNS Converter + Capo Advisor -->
    <div class="converter-grid">
      <!-- Section 1: Chart & NNS Converter -->
      <section class="card-panel converter-panel">
        <div class="panel-header">
          <div class="header-left">
            <h2>1. Song Chart &amp; NNS Engine</h2>
            <p>Convert your chord charts or transpose to another key.</p>
          </div>
          <div class="mode-toggles">
            <button
              class="toggle-btn {conversionMode === 'chords-to-nns' ? 'active' : ''}"
              onclick={() => (conversionMode = 'chords-to-nns')}
            >
              Chords &rarr; NNS
            </button>
            <button
              class="toggle-btn {conversionMode === 'nns-to-chords' ? 'active' : ''}"
              onclick={() => (conversionMode = 'nns-to-chords')}
            >
              NNS &rarr; Chords
            </button>
          </div>
        </div>

        <div class="controls-row">
          <div class="control-group">
            <label for="song-key">Song Key:</label>
            <select id="song-key" bind:value={selectedKey} class="select-input">
              {#each MAJOR_KEYS as key}
                <option value={key}>Key of {key}</option>
              {/each}
            </select>
          </div>

          <div class="control-group">
            <label for="semitone-shift">Transpose (Semitones):</label>
            <div class="shift-selector">
              <button class="shift-btn" onclick={() => semitoneShift--}>-1</button>
              <span class="shift-display">{semitoneShift > 0 ? `+${semitoneShift}` : semitoneShift}</span>
              <button class="shift-btn" onclick={() => semitoneShift++}>+1</button>
              {#if semitoneShift !== 0}
                <button class="reset-shift" onclick={() => (semitoneShift = 0)}>Reset</button>
              {/if}
            </div>
          </div>
        </div>

        <div class="chart-split">
          <div class="chart-box">
            <div class="chart-header">
              <label for="input-chart">Input Sheet (Paste here):</label>
            </div>
            <textarea
              id="input-chart"
              bind:value={inputChart}
              class="chart-textarea"
              placeholder="Paste chord chart with chords or numbers..."
              rows="10"
            ></textarea>
          </div>

          <div class="chart-box output-box">
            <div class="chart-header">
              <span class="output-label">
                {conversionMode === 'chords-to-nns' ? 'Nashville Number System (NNS):' : `Converted Chords (Key of ${selectedKey}):`}
              </span>
              <button class="btn btn-secondary btn-sm copy-btn" onclick={copyToClipboard}>
                {#if copyFeedback}
                  ✓ Copied!
                {:else}
                  Copy Output
                {/if}
              </button>
            </div>
            <pre class="chart-pre">{convertedChart}</pre>
          </div>
        </div>
      </section>

      <!-- Section 2: Capo Intelligence & SVG Fretboard -->
      <section class="card-panel capo-panel">
        <div class="panel-header">
          <div>
            <h2>2. Capo Intelligence Advisor (#39)</h2>
            <p>"The singer wants Eb, but I only play G shapes" — solved instantly.</p>
          </div>
        </div>

        <div class="capo-selector-row">
          <div class="control-group">
            <label for="singer-key">Singer's Target Key:</label>
            <select id="singer-key" bind:value={targetSingerKey} class="select-input">
              {#each MAJOR_KEYS as key}
                <option value={key}>Key of {key}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="capo-solutions-list">
          <span class="solutions-title">Recommended Capo Positions for Key of {targetSingerKey}:</span>
          <div class="solutions-grid">
            {#each capoSolutions as sol}
              <button
                class="sol-card {selectedCapoSolution?.capoFret === sol.capoFret ? 'active' : ''}"
                onclick={() => (selectedCapoSolution = sol)}
              >
                <div class="sol-fret">
                  {sol.capoFret === 0 ? 'No Capo' : `Capo ${sol.capoFret}`}
                </div>
                <div class="sol-desc">
                  Play <strong>{sol.shapeKey}</strong> shapes
                </div>
              </button>
            {/each}
          </div>
        </div>

        {#if selectedCapoSolution}
          <div class="capo-summary-box">
            <div class="summary-badge">Selected Setup</div>
            <p class="summary-text">{selectedCapoSolution.description}</p>
          </div>

          <!-- Interactive SVG Fretboard -->
          <div class="fretboard-wrap" aria-label="Visual Guitar Fretboard">
            <div class="fretboard-header">
              <span>Nut (Fret 0)</span>
              <span>12th Fret (Octave)</span>
            </div>

            <svg viewBox="0 0 800 180" class="fretboard-svg" width="100%">
              <defs>
                <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#2a2421"/>
                  <stop offset="100%" stop-color="#181412"/>
                </linearGradient>
                <linearGradient id="fretMetal" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#d1d5db"/>
                  <stop offset="50%" stop-color="#9ca3af"/>
                  <stop offset="100%" stop-color="#6b7280"/>
                </linearGradient>
              </defs>

              <!-- Fretboard Wood Base -->
              <rect x="50" y="20" width="730" height="140" fill="url(#woodGrad)" rx="4"/>

              <!-- Nut Wire -->
              <rect x="48" y="20" width="8" height="140" fill="#f3f4f6" rx="2"/>

              <!-- 12 Fret Wires -->
              {#each Array(FRET_COUNT) as _, i}
                {@const fretNum = i + 1}
                {@const xPos = 50 + (730 / FRET_COUNT) * fretNum}
                <line x1={xPos} y1="20" x2={xPos} y2="160" stroke="url(#fretMetal)" stroke-width="3"/>
                <!-- Fret Number Labels -->
                <text x={xPos - 30} y="175" fill="#9ca3af" font-size="11" text-anchor="middle">{fretNum}</text>
              {/each}

              <!-- Fretboard Inlay Dots -->
              {#each FRET_MARKERS as m}
                {@const dotX = 50 + (730 / FRET_COUNT) * m - (730 / FRET_COUNT) / 2}
                {#if m === 12}
                  <circle cx={dotX} cy="60" r="5" fill="#9ca3af" opacity="0.6"/>
                  <circle cx={dotX} cy="120" r="5" fill="#9ca3af" opacity="0.6"/>
                {:else}
                  <circle cx={dotX} cy="90" r="5.5" fill="#9ca3af" opacity="0.6"/>
                {/if}
              {/each}

              <!-- 6 Guitar Strings -->
              {#each [0, 1, 2, 3, 4, 5] as strIdx}
                {@const yPos = 30 + strIdx * 24}
                {@const strokeThickness = 3.2 - strIdx * 0.4}
                <!-- String Line -->
                <line x1="10" y1={yPos} x2="780" y2={yPos} stroke="#e5e7eb" stroke-width={strokeThickness} opacity="0.85"/>
                <!-- Open String Tuning Label -->
                <text x="30" y={yPos + 4} fill="#f59e0b" font-weight="700" font-size="12" text-anchor="middle">
                  {STANDARD_TUNING[5 - strIdx]}
                </text>
              {/each}

              <!-- Active Capo Clamp Visualization -->
              {#if selectedCapoSolution.capoFret > 0}
                {@const capoX = 50 + (730 / FRET_COUNT) * selectedCapoSolution.capoFret - (730 / FRET_COUNT) / 2}
                <!-- Capo Bar -->
                <rect x={capoX - 6} y="10" width="12" height="160" rx="4" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
                <!-- Capo Clamp Screws / Rubber Pad -->
                <circle cx={capoX} cy="20" r="4" fill="#0b0d11"/>
                <circle cx={capoX} cy="160" r="4" fill="#0b0d11"/>
                <!-- Capo Badge Label -->
                <text x={capoX} y="5" fill="#fbbf24" font-weight="800" font-size="11" text-anchor="middle">
                  CAPO {selectedCapoSolution.capoFret}
                </text>
              {/if}
            </svg>
          </div>
        {/if}
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

  .converter-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
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
    flex-wrap: wrap;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .header-left h2 {
    font-size: 1.5rem;
  }

  .header-left p {
    font-size: 0.88rem;
    color: var(--text-secondary);
  }

  .mode-toggles {
    display: flex;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 0.25rem;
  }

  .toggle-btn {
    padding: 0.4rem 0.9rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .toggle-btn.active {
    background-color: var(--accent);
    color: var(--text-inverse);
  }

  .controls-row {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .control-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .select-input {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    color: var(--text-primary);
  }

  .shift-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .shift-btn {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    color: var(--text-primary);
    padding: 0.35rem 0.75rem;
    font-weight: 700;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .shift-btn:hover {
    background-color: var(--accent-subtle);
    border-color: var(--accent);
  }

  .shift-display {
    font-family: var(--font-mono);
    font-weight: 700;
    min-width: 2.5rem;
    text-align: center;
  }

  .reset-shift {
    font-size: 0.75rem;
    color: var(--accent);
    text-decoration: underline;
    margin-left: 0.25rem;
  }

  .chart-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .chart-box {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .chart-textarea {
    width: 100%;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    line-height: 1.6;
    padding: 1rem;
    background-color: var(--bg-canvas);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    resize: vertical;
    color: var(--text-primary);
  }

  .output-box {
    position: relative;
  }

  .chart-pre {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    line-height: 1.6;
    padding: 1rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    overflow-x: auto;
    color: var(--accent-light);
    white-space: pre-wrap;
    min-height: 220px;
  }

  /* Capo Panel Styles */
  .capo-selector-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .capo-solutions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .solutions-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .solutions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }

  .sol-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.85rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .sol-card:hover {
    border-color: var(--border-default);
    background-color: var(--bg-elevated);
  }

  .sol-card.active {
    border-color: var(--accent);
    background-color: var(--accent-subtle);
  }

  .sol-fret {
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--accent);
    font-family: var(--font-mono);
  }

  .sol-desc {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .capo-summary-box {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background-color: rgba(245, 158, 11, 0.08);
    border: 1px solid var(--accent-border);
    border-radius: var(--radius-md);
  }

  .summary-badge {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    background-color: var(--accent);
    color: var(--text-inverse);
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-sm);
  }

  .summary-text {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .fretboard-wrap {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.5rem 1rem 1rem;
    overflow-x: auto;
  }

  .fretboard-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    padding: 0 3rem 0.5rem;
  }

  @media (max-width: 860px) {
    .chart-split {
      grid-template-columns: 1fr;
    }
  }
</style>
