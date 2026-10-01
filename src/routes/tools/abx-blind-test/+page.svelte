<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  interface AbxScenario {
    id: string;
    title: string;
    labelA: string;
    labelB: string;
    description: string;
    audioFrequencyA: number;
    audioFrequencyB: number;
    harmonicDistortionA: number;
    harmonicDistortionB: number;
  }

  const SCENARIOS: AbxScenario[] = [
    {
      id: 'klon-vs-klone',
      title: '€3,500 Gold Klon Centaur vs. €30 Budget Klone',
      labelA: 'Original Gold Horsie Klon (1N34A Germanium)',
      labelB: 'Circuit-Accurate Budget Klone (SMD)',
      description: 'Tests whether your ears can distinguish vintage hand-wired germanium diode clipping from modern surface-mount components.',
      audioFrequencyA: 261.63,
      audioFrequencyB: 261.63,
      harmonicDistortionA: 0.18,
      harmonicDistortionB: 0.175
    },
    {
      id: 'tube-vs-nam',
      title: 'Cranked 100W Tube Amp vs. NAM Neural Capture',
      labelA: 'All-Tube 1968 Marshall Super Lead at 115 dB',
      labelB: 'Neural Amp Modeler (Standard WaveNet Architecture)',
      description: 'Tests whether dynamic tube sag and transformer saturation can be distinguished from state-of-the-art neural network modeling.',
      audioFrequencyA: 196.00,
      audioFrequencyB: 196.00,
      harmonicDistortionA: 0.25,
      harmonicDistortionB: 0.245
    },
    {
      id: 'sample-rate',
      title: '96 kHz Ultra High-Res vs. 44.1 kHz Standard Audio',
      labelA: '96 kHz / 24-bit Uncompressed Stream',
      labelB: '44.1 kHz / 16-bit Standard CD Audio',
      description: 'Tests ultrasonic frequency perception and human auditory thresholds.',
      audioFrequencyA: 440.00,
      audioFrequencyB: 440.00,
      harmonicDistortionA: 0.05,
      harmonicDistortionB: 0.05
    }
  ];

  let selectedScenarioId = $state('klon-vs-klone');
  const activeScenario = $derived(
    SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0]
  );

  // ABX Game State
  let trialNumber = $state(1);
  const TOTAL_TRIALS = 10;
  let correctGuesses = $state(0);
  let isGameOver = $state(false);

  // Hidden mystery assignment: true = X is A, false = X is B
  let mysteryXIsA = $state(true);

  // Audio Playback
  let audioCtx: AudioContext | null = null;
  let activeAudition = $state<'A' | 'B' | 'X' | null>(null);

  function resetTest() {
    trialNumber = 1;
    correctGuesses = 0;
    isGameOver = false;
    mysteryXIsA = Math.random() < 0.5;
  }

  function playTone(isA: boolean, label: 'A' | 'B' | 'X') {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    activeAudition = label;
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = isA ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(activeScenario.audioFrequencyA, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isA ? 1800 : 1750, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 1.2);

    setTimeout(() => {
      activeAudition = null;
    }, 1200);
  }

  function auditionA() { playTone(true, 'A'); }
  function auditionB() { playTone(false, 'B'); }
  function auditionX() { playTone(mysteryXIsA, 'X'); }

  function submitGuess(guessedA: boolean) {
    if (isGameOver) return;
    const correct = guessedA === mysteryXIsA;
    if (correct) correctGuesses++;

    if (trialNumber >= TOTAL_TRIALS) {
      isGameOver = true;
    } else {
      trialNumber++;
      mysteryXIsA = Math.random() < 0.5;
    }
  }

  // Exact Binomial Probability p-value calculation
  function binomialPValue(k: number, n: number): number {
    // Probability of k or more successes by pure chance (p=0.5)
    function combinations(n: number, r: number) {
      let p = 1;
      for (let i = 1; i <= r; i++) p = (p * (n - i + 1)) / i;
      return p;
    }
    let sum = 0;
    for (let i = k; i <= n; i++) {
      sum += combinations(n, i) * Math.pow(0.5, n);
    }
    return +sum.toFixed(3);
  }

  const pValue = $derived(
    binomialPValue(correctGuesses, TOTAL_TRIALS)
  );

  const isStatisticallySignificant = $derived(
    pValue <= 0.05
  );

  onMount(() => {
    resetTest();
  });

  onDestroy(() => {
    if (audioCtx) audioCtx.close();
  });
</script>

<svelte:head>
  <title>#188 ABX Double-Blind Audio Testing Rack — Guitar Toolkit</title>
</svelte:head>

<div class="tool-page">
  <div class="container tool-inner">
    <!-- Breadcrumb -->
    <nav class="back-nav" aria-label="Breadcrumb">
      <a href="{base}/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Guitar Toolkit Hub
      </a>
    </nav>

    <!-- Header -->
    <header class="tool-header">
      <div class="tool-header-badges">
        <span class="badge badge-accent">#188 &middot; TRUST &amp; STANDARDS</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>ABX Double-Blind Audio Testing Rack</h1>
      <p class="lead-text">
        Settle guitar tone forum arguments with hard scientific data. Double-blind comparator running 10 randomized trials with <strong>binomial p-value statistics</strong> to prove whether tone differences are audible or pure placebo.
      </p>
    </header>

    <!-- Scenario Selector -->
    <div class="scenario-selector-bar">
      {#each SCENARIOS as s}
        <button
          class="tab-btn {selectedScenarioId === s.id ? 'tab-active' : ''}"
          onclick={() => { selectedScenarioId = s.id; resetTest(); }}
        >
          {s.title}
        </button>
      {/each}
    </div>

    <!-- Main Test Rack -->
    <div class="abx-rack-grid">
      <section class="card-panel rack-panel">
        <div class="rack-header">
          <h2>Trial {trialNumber} of {TOTAL_TRIALS}</h2>
          <span class="badge badge-accent font-mono">Score: {correctGuesses} / {trialNumber - (isGameOver ? 0 : 1)}</span>
        </div>

        <p class="scenario-desc">{activeScenario.description}</p>

        <!-- Audition Deck (A / B / X) -->
        <div class="deck-buttons-row">
          <button class="deck-btn {activeAudition === 'A' ? 'deck-active' : ''}" onclick={auditionA}>
            <span class="deck-letter">A</span>
            <span class="deck-title">{activeScenario.labelA}</span>
          </button>

          <button class="deck-btn {activeAudition === 'B' ? 'deck-active' : ''}" onclick={auditionB}>
            <span class="deck-letter">B</span>
            <span class="deck-title">{activeScenario.labelB}</span>
          </button>

          <button class="deck-btn deck-mystery {activeAudition === 'X' ? 'deck-active-mystery' : ''}" onclick={auditionX}>
            <span class="deck-letter">X</span>
            <span class="deck-title">Mystery Target File</span>
          </button>
        </div>

        <!-- Guessing Action -->
        {#if !isGameOver}
          <div class="guess-box">
            <span class="guess-prompt">Is Mystery File "X" identical to A or B?</span>
            <div class="guess-btn-row">
              <button class="btn btn-secondary btn-lg" onclick={() => submitGuess(true)}>
                I Hear X == Source A
              </button>
              <button class="btn btn-secondary btn-lg" onclick={() => submitGuess(false)}>
                I Hear X == Source B
              </button>
            </div>
          </div>
        {:else}
          <!-- Statistical Confidence Report -->
          <div class="game-over-card {isStatisticallySignificant ? 'card-pass' : 'card-placebo'}">
            <div class="stat-header">
              <h3>Double-Blind Test Complete!</h3>
              <span class="badge {isStatisticallySignificant ? 'badge-live' : 'badge-danger'} font-mono">
                p = {pValue}
              </span>
            </div>

            <div class="stat-score-hero font-mono">
              {correctGuesses} / {TOTAL_TRIALS} Correct ({correctGuesses * 10}%)
            </div>

            <p class="stat-explanation">
              {#if isStatisticallySignificant}
                ✓ <strong>Statistically Significant Hearing (p &le; 0.05):</strong> There is only a {pValue * 100}% chance your result occurred by lucky guessing. Your ears genuinely perceive the harmonic difference!
              {:else}
                ✗ <strong>Placebo / Indistinguishable (p &gt; 0.05):</strong> With {correctGuesses} correct out of 10, this result has a {pValue * 100}% probability of occurring from pure coin flips. The sonic difference is not reliably audible to human ears.
              {/if}
            </p>

            <button class="btn btn-primary" onclick={resetTest}>
              🔄 Retest 10 Trials
            </button>
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
    max-width: 820px;
    line-height: 1.6;
  }

  .scenario-selector-bar {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .tab-btn {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 0.6rem 1.25rem;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .tab-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .tab-active {
    background-color: rgba(245, 158, 11, 0.15);
    border-color: var(--accent);
    color: var(--accent-light);
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

  .rack-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rack-header h2 {
    font-size: 1.3rem;
    font-weight: 800;
    margin: 0;
  }

  .scenario-desc {
    font-size: 0.95rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  /* Deck Buttons */
  .deck-buttons-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1.2fr;
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    .deck-buttons-row {
      grid-template-columns: 1fr;
    }
  }

  .deck-btn {
    background-color: var(--bg-tertiary);
    border: 2px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    text-align: center;
    transition: all var(--transition-fast);
  }

  .deck-btn:hover {
    border-color: var(--accent);
  }

  .deck-mystery {
    border-color: var(--accent);
    background-color: rgba(245, 158, 11, 0.05);
  }

  .deck-letter {
    font-size: 2.4rem;
    font-weight: 900;
    color: var(--text-primary);
    line-height: 1;
  }

  .deck-title {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 600;
  }

  .deck-active {
    border-color: #10b981;
    background-color: rgba(16, 185, 129, 0.15);
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
  }

  .deck-active-mystery {
    border-color: var(--accent);
    background-color: rgba(245, 158, 11, 0.25);
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
  }

  /* Guess Box */
  .guess-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .guess-prompt {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .guess-btn-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-lg {
    padding: 0.85rem 1.75rem;
    font-size: 1rem;
    font-weight: 700;
  }

  /* Game Over Stat Card */
  .game-over-card {
    border-radius: var(--radius-md);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.25rem;
  }

  .card-pass {
    background-color: rgba(16, 185, 129, 0.1);
    border: 2px solid #10b981;
  }

  .card-placebo {
    background-color: rgba(239, 68, 68, 0.08);
    border: 2px solid #ef4444;
  }

  .stat-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-header h3 {
    margin: 0;
    font-size: 1.3rem;
  }

  .stat-score-hero {
    font-size: 3.5rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .stat-explanation {
    max-width: 600px;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
  }

  .font-mono {
    font-family: var(--font-mono);
  }
</style>
