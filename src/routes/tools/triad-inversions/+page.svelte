<script lang="ts">
  import { onMount } from 'svelte';

  interface TriadShape {
    inversion: 'Root Position' | '1st Inversion' | '2nd Inversion';
    formula: string; // e.g. "R - 3 - 5"
    frets: (number | 'x')[]; // 6 strings
    notes: string[];
    intervals: string[];
  }

  const TRIAD_SETS: Record<string, TriadShape[]> = {
    '123_major': [
      { inversion: 'Root Position', formula: '1 (G) - 3 (B) - 5 (D)', frets: ['x', 'x', 'x', 0, 0, 3], notes: ['G3', 'B3', 'D4'], intervals: ['Root', 'Major 3rd', 'Fifth'] },
      { inversion: '1st Inversion', formula: '3 (B) - 5 (D) - 1 (G)', frets: ['x', 'x', 'x', 4, 3, 3], notes: ['B3', 'D4', 'G4'], intervals: ['Major 3rd', 'Fifth', 'Root'] },
      { inversion: '2nd Inversion', formula: '5 (D) - 1 (G) - 3 (B)', frets: ['x', 'x', 'x', 7, 8, 7], notes: ['D4', 'G4', 'B4'], intervals: ['Fifth', 'Root', 'Major 3rd'] }
    ],
    '234_major': [
      { inversion: 'Root Position', formula: '1 (C) - 3 (E) - 5 (G)', frets: ['x', 'x', 10, 9, 8, 'x'], notes: ['C4', 'E4', 'G4'], intervals: ['Root', 'Major 3rd', 'Fifth'] },
      { inversion: '1st Inversion', formula: '3 (E) - 5 (G) - 1 (C)', frets: ['x', 'x', 2, 0, 1, 'x'], notes: ['E3', 'G3', 'C4'], intervals: ['Major 3rd', 'Fifth', 'Root'] },
      { inversion: '2nd Inversion', formula: '5 (G) - 1 (C) - 3 (E)', frets: ['x', 'x', 5, 5, 5, 'x'], notes: ['G3', 'C4', 'E4'], intervals: ['Fifth', 'Root', 'Major 3rd'] }
    ]
  };

  let selectedSet = $state<'123_major' | '234_major'>('123_major');
  let selectedInversionIdx = $state(0);
  let mode = $state<'learn' | 'quiz'>('learn');

  // Quiz state
  let quizQuestion = $state<{ set: string; invIdx: number; correctName: string } | null>(null);
  let quizFeedback = $state<string | null>(null);
  let score = $state(0);
  let totalQuizzed = $state(0);

  let activeShapes = $derived(TRIAD_SETS[selectedSet]);
  let currentShape = $derived(activeShapes[selectedInversionIdx]);

  // Audio Context
  let audioCtx: AudioContext | null = null;

  function playArpeggio(shape: TriadShape) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const openMidi = [40, 45, 50, 55, 59, 64];

    let noteIdx = 0;
    shape.frets.forEach((fret, strIdx) => {
      if (fret === 'x' || !audioCtx) return;
      const midi = openMidi[strIdx] + (fret as number);
      const freq = 440 * Math.pow(2, (midi - 69) / 12);

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + noteIdx * 0.2);

      gain.gain.setValueAtTime(0.001, now + noteIdx * 0.2);
      gain.gain.linearRampToValueAtTime(0.25, now + noteIdx * 0.2 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + noteIdx * 0.2 + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + noteIdx * 0.2);
      osc.stop(now + noteIdx * 0.2 + 0.85);

      noteIdx++;
    });
  }

  function startQuiz() {
    mode = 'quiz';
    nextQuizQuestion();
  }

  function nextQuizQuestion() {
    const setKeys = Object.keys(TRIAD_SETS);
    const randomSet = setKeys[Math.floor(Math.random() * setKeys.length)];
    const randomIdx = Math.floor(Math.random() * 3);
    const target = TRIAD_SETS[randomSet][randomIdx];

    quizQuestion = {
      set: randomSet,
      invIdx: randomIdx,
      correctName: target.inversion
    };
    quizFeedback = null;
  }

  function answerQuiz(choice: string) {
    if (!quizQuestion) return;
    totalQuizzed++;
    if (choice === quizQuestion.correctName) {
      score++;
      quizFeedback = '✅ Correct! Clean recognition.';
    } else {
      quizFeedback = `❌ Incorrect. That shape was ${quizQuestion.correctName}.`;
    }
    setTimeout(nextQuizQuestion, 1400);
  }
</script>

<svelte:head>
  <title>Triad Inversion Visual Trainer | Guitar Toolkit</title>
  <meta
    name="description"
    content="Master 3-note triad inversions across strings 1-2-3 and 2-3-4 with interactive visual diagrams, audio arpeggiator, and flashcard quizzes."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Music Theory & Chords</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#9 Harmony Tool</span>
      <span class="badge">Voice Leading Engine</span>
      <span class="badge">Audio Arpeggios</span>
    </div>
    <h1>🔺 Triad Inversion Visual Trainer</h1>
    <p class="tool-sub">
      The secret weapon of professional rhythm players. Learn how every 3-note chord connects smoothly across the fretboard in Root Position, 1st Inversion, and 2nd Inversion.
    </p>
  </div>

  <!-- Mode Switch -->
  <div class="mode-bar">
    <button
      type="button"
      class="mode-chip"
      class:active={mode === 'learn'}
      onclick={() => (mode = 'learn')}
    >
      🗺️ Learn & Audition Shapes
    </button>
    <button
      type="button"
      class="mode-chip"
      class:active={mode === 'quiz'}
      onclick={startQuiz}
    >
      🎯 Flashcard Quiz Mode
    </button>
  </div>

  {#if mode === 'learn'}
    <!-- String Set Selector -->
    <div class="set-selector-card">
      <span class="sel-label">SELECT STRING SET:</span>
      <div class="set-buttons">
        <button
          type="button"
          class="set-btn"
          class:active={selectedSet === '123_major'}
          onclick={() => {
            selectedSet = '123_major';
            selectedInversionIdx = 0;
          }}
        >
          Strings 1-2-3 (Top Melody Trio: E-B-G)
        </button>
        <button
          type="button"
          class="set-btn"
          class:active={selectedSet === '234_major'}
          onclick={() => {
            selectedSet = '234_major';
            selectedInversionIdx = 0;
          }}
        >
          Strings 2-3-4 (Midrange R&B / Funk: B-G-D)
        </button>
      </div>
    </div>

    <!-- Inversions Carousel -->
    <div class="inversion-viewer-card">
      <div class="inversion-tabs">
        {#each activeShapes as shape, idx}
          <button
            type="button"
            class="inv-tab-btn"
            class:active={selectedInversionIdx === idx}
            onclick={() => (selectedInversionIdx = idx)}
          >
            <span class="tab-inv-title">{shape.inversion}</span>
            <span class="tab-inv-formula">{shape.formula}</span>
          </button>
        {/each}
      </div>

      <div class="diagram-and-details">
        <!-- SVG Fret Diagram -->
        <div class="fret-box">
          <svg viewBox="0 0 140 180" class="triad-svg">
            <line x1="20" y1="30" x2="120" y2="30" stroke="#f8fafc" stroke-width="4" />
            {#each [60, 90, 120, 150] as y}
              <line x1="20" y1={y} x2="120" y2={y} stroke="#475569" stroke-width="1.5" />
            {/each}
            {#each [20, 40, 60, 80, 100, 120] as x, sIdx}
              <line x1={x} y1="30" x2={x} y2="150" stroke="#64748b" stroke-width="1.5" />
              {#if currentShape.frets[sIdx] === 'x'}
                <text x={x} y="20" fill="#64748b" font-size="11" text-anchor="middle">✕</text>
              {:else if currentShape.frets[sIdx] === 0}
                <circle cx={x} cy="18" r="4" fill="none" stroke="#10b981" stroke-width="1.5" />
              {/if}
            {/each}
            {#each currentShape.frets as f, sIdx}
              {#if typeof f === 'number' && f > 0}
                <circle cx={20 + sIdx * 20} cy={30 + f * 30 - 15} r="8" fill="#f59e0b" />
              {/if}
            {/each}
          </svg>
        </div>

        <div class="inv-info">
          <h3>{currentShape.inversion}</h3>
          <div class="formula-banner">Interval Order: <strong>{currentShape.formula}</strong></div>

          <div class="intervals-list">
            {#each currentShape.intervals as interval, i}
              <div class="int-item">
                <span class="int-label">{interval}:</span>
                <span class="int-note">{currentShape.notes[i]}</span>
              </div>
            {/each}
          </div>

          <button
            type="button"
            class="arpeggio-btn"
            onclick={() => playArpeggio(currentShape)}
          >
            ▶ ARPEGGIATE TRIAD (AUDIO)
          </button>
        </div>
      </div>
    </div>
  {:else}
    <!-- QUIZ MODE -->
    <div class="quiz-card">
      <div class="quiz-top">
        <h3>🎯 Identify The Inversion</h3>
        <span class="quiz-score">Score: {score} / {totalQuizzed}</span>
      </div>

      {#if quizQuestion}
        <p class="quiz-prompt">
          Look at the active shape on {quizQuestion.set === '123_major' ? 'Strings 1-2-3' : 'Strings 2-3-4'}: What inversion is it?
        </p>

        <div class="quiz-btn-row">
          <button type="button" class="quiz-choice-btn" onclick={() => answerQuiz('Root Position')}>
            Root Position (Root in Bass)
          </button>
          <button type="button" class="quiz-choice-btn" onclick={() => answerQuiz('1st Inversion')}>
            1st Inversion (3rd in Bass)
          </button>
          <button type="button" class="quiz-choice-btn" onclick={() => answerQuiz('2nd Inversion')}>
            2nd Inversion (5th in Bass)
          </button>
        </div>

        {#if quizFeedback}
          <div class="quiz-feedback-box">
            {quizFeedback}
          </div>
        {/if}
      {/if}
    </div>
  {/if}

  <!-- Pedagogy Card -->
  <div class="theory-card">
    <h3>💡 Why Inversions Matter More Than Bar Chords</h3>
    <p>
      Inversions allow you to transition between chords by moving each voice by only 1 or 2 frets (smooth voice leading), rather than leaping 5 frets up the neck.
    </p>
    <ul>
      <li><strong>Root Position:</strong> Most stable, bold, direct sound.</li>
      <li><strong>1st Inversion (3rd in bass):</strong> Warm, melodic, vocal bass movement.</li>
      <li><strong>2nd Inversion (5th in bass):</strong> Floating, suspended, transitional tension that resolves powerfully.</li>
    </ul>
  </div>
</div>

<style>
  .tool-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 24px 16px 64px;
    color: var(--text-main, #e5e7eb);
  }

  .breadcrumbs {
    font-size: 0.85rem;
    color: var(--text-sub, #9ca3af);
    margin-bottom: 8px;
  }
  .breadcrumbs a {
    color: var(--accent-cyan, #38bdf8);
    text-decoration: none;
  }

  .badge-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .badge {
    font-size: 0.75rem;
    padding: 3px 8px;
    border-radius: 4px;
    background: #1f2937;
    color: #9ca3af;
    border: 1px solid #374151;
  }
  .badge-accent {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border-color: rgba(245, 158, 11, 0.4);
  }

  h1 {
    font-size: 1.85rem;
    font-weight: 800;
    margin: 0 0 8px;
    color: #f9fafb;
  }
  .tool-sub {
    font-size: 1rem;
    color: #9ca3af;
    line-height: 1.5;
    margin: 0 0 24px;
  }

  .mode-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  .mode-chip {
    background: #1f2937;
    border: 1px solid #374151;
    color: #9ca3af;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
  }
  .mode-chip.active {
    background: rgba(56, 189, 248, 0.15);
    border-color: #38bdf8;
    color: #38bdf8;
  }

  .set-selector-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .sel-label {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .set-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .set-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #d1d5db;
    padding: 8px 14px;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
  }
  .set-btn.active {
    background: rgba(245, 158, 11, 0.15);
    border-color: #f59e0b;
    color: #f59e0b;
  }

  .inversion-viewer-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
  }
  .inversion-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 24px;
  }
  .inv-tab-btn {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 12px;
    text-align: center;
    cursor: pointer;
  }
  .inv-tab-btn.active {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }
  .tab-inv-title {
    display: block;
    font-weight: 700;
    font-size: 0.9rem;
    color: #f3f4f6;
  }
  .tab-inv-formula {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 2px;
  }

  .diagram-and-details {
    display: flex;
    gap: 32px;
    align-items: center;
    flex-wrap: wrap;
  }
  .fret-box {
    background: #0d1117;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid #1f2937;
  }
  .triad-svg {
    width: 140px;
    height: 180px;
  }

  .inv-info {
    flex: 1;
  }
  .inv-info h3 {
    margin: 0 0 8px;
    font-size: 1.4rem;
    color: #f59e0b;
  }
  .formula-banner {
    font-size: 0.85rem;
    color: #9ca3af;
    margin-bottom: 16px;
  }
  .formula-banner strong {
    color: #38bdf8;
  }

  .intervals-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }
  .int-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    background: #1f2937;
    padding: 8px 12px;
    border-radius: 4px;
    max-width: 240px;
  }
  .int-label {
    color: #9ca3af;
  }
  .int-note {
    color: #10b981;
    font-weight: 700;
    font-family: monospace;
  }

  .arpeggio-btn {
    background: #0284c7;
    color: #ffffff;
    border: none;
    font-weight: 700;
    font-size: 0.85rem;
    padding: 10px 18px;
    border-radius: 6px;
    cursor: pointer;
  }
  .arpeggio-btn:hover {
    background: #0369a1;
  }

  /* Quiz card */
  .quiz-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
  }
  .quiz-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .quiz-score {
    font-size: 0.9rem;
    font-weight: 800;
    color: #10b981;
  }
  .quiz-prompt {
    font-size: 1rem;
    color: #d1d5db;
    margin-bottom: 20px;
  }
  .quiz-btn-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  .quiz-choice-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 14px;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
  }
  .quiz-choice-btn:hover {
    border-color: #38bdf8;
    color: #38bdf8;
  }
  .quiz-feedback-box {
    background: #182232;
    border-left: 4px solid #f59e0b;
    padding: 12px 16px;
    border-radius: 0 4px 4px 0;
    font-weight: 700;
    font-size: 0.9rem;
    color: #f3f4f6;
  }

  .theory-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
  }
  .theory-card h3 {
    margin: 0 0 12px;
    font-size: 1.15rem;
  }
  .theory-card p {
    font-size: 0.85rem;
    color: #9ca3af;
    line-height: 1.5;
    margin: 0 0 10px;
  }
  .theory-card ul {
    margin: 0;
    padding-left: 20px;
    font-size: 0.85rem;
    color: #d1d5db;
    line-height: 1.6;
  }
</style>
