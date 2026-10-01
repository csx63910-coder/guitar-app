<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  let audioCtx: AudioContext | null = null;

  type TrainingLevel = 'intervals' | 'pentatonic' | 'triads';
  let currentLevel = $state<TrainingLevel>('intervals');

  interface Challenge {
    id: string;
    prompt: string;
    notes: { name: string; freq: number }[];
    options: string[];
    correctOption: string;
    explanation: string;
  }

  const INTERVAL_CHALLENGES: Challenge[] = [
    {
      id: 'int-1',
      prompt: 'Identify the 2-note interval played by the guitar:',
      notes: [{ name: 'C4', freq: 261.63 }, { name: 'G4', freq: 392.00 }],
      options: ['Major 3rd (4 semitones)', 'Perfect 4th (5 semitones)', 'Perfect 5th (7 semitones)', 'Octave (12 semitones)'],
      correctOption: 'Perfect 5th (7 semitones)',
      explanation: 'From C4 to G4 is 7 semitones (a classic power chord interval).'
    },
    {
      id: 'int-2',
      prompt: 'Identify the 2-note interval played by the guitar:',
      notes: [{ name: 'A3', freq: 220.00 }, { name: 'C#4', freq: 277.18 }],
      options: ['Minor 3rd (3 semitones)', 'Major 3rd (4 semitones)', 'Perfect 5th (7 semitones)', 'Minor 7th (10 semitones)'],
      correctOption: 'Major 3rd (4 semitones)',
      explanation: 'A3 to C#4 is a bright, happy Major 3rd (4 semitones).'
    },
    {
      id: 'int-3',
      prompt: 'Identify the 2-note interval played by the guitar:',
      notes: [{ name: 'E3', freq: 164.81 }, { name: 'G3', freq: 196.00 }],
      options: ['Minor 2nd (1 semitone)', 'Minor 3rd (3 semitones)', 'Major 3rd (4 semitones)', 'Tritone (6 semitones)'],
      correctOption: 'Minor 3rd (3 semitones)',
      explanation: 'E3 to G3 is a somber, bluesy Minor 3rd (3 semitones).'
    },
    {
      id: 'int-4',
      prompt: 'Identify the 2-note interval played by the guitar:',
      notes: [{ name: 'D4', freq: 293.66 }, { name: 'D5', freq: 587.33 }],
      options: ['Perfect 4th', 'Perfect 5th', 'Major 7th', 'Octave (12 semitones)'],
      correctOption: 'Octave (12 semitones)',
      explanation: 'D4 to D5 is an exact 2:1 frequency ratio Octave.'
    }
  ];

  let challengeIndex = $state(0);
  let selectedOption = $state<string | null>(null);
  let showResult = $state(false);
  let isCorrect = $state(false);
  let score = $state(0);
  let totalAnswered = $state(0);
  let isPlayingAudio = $state(false);

  const currentChallenge = $derived(INTERVAL_CHALLENGES[challengeIndex]);

  // Plucked guitar string synthesis via Web Audio API
  function playNote(freq: number, startTime: number, duration = 0.8) {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    // Warm guitar tone: triangle + lowpass filter with pluck decay
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + duration);

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  function playPhrase() {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    isPlayingAudio = true;
    const now = audioCtx.currentTime;

    currentChallenge.notes.forEach((note, idx) => {
      playNote(note.freq, now + idx * 0.55, 0.9);
    });

    setTimeout(() => {
      isPlayingAudio = false;
    }, currentChallenge.notes.length * 600);
  }

  function handleSelectOption(opt: string) {
    if (showResult) return;
    selectedOption = opt;
    showResult = true;
    totalAnswered++;
    if (opt === currentChallenge.correctOption) {
      isCorrect = true;
      score++;
    } else {
      isCorrect = false;
    }
  }

  function nextChallenge() {
    showResult = false;
    selectedOption = null;
    challengeIndex = (challengeIndex + 1) % INTERVAL_CHALLENGES.length;
    setTimeout(() => {
      playPhrase();
    }, 200);
  }

  onMount(() => {
    // Play on load when clicked
  });

  onDestroy(() => {
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
  });
</script>

<svelte:head>
  <title>#49 On-Instrument Ear Trainer — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#49 &middot; TIER 3 REAL DSP &amp; AUDIO</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner</span>
      </div>
      <h1>On-Instrument Ear Trainer</h1>
      <p class="lead-text">
        Call-and-response ear training for guitarists. Listens to synthetic acoustic guitar intervals and pentatonic licks synthesized with <strong>Web Audio API physical modeling</strong>, then builds your relative pitch recognition.
      </p>
    </header>

    <!-- Score & Replay Bar -->
    <div class="game-top-bar">
      <button class="btn btn-primary" onclick={playPhrase} disabled={isPlayingAudio}>
        {isPlayingAudio ? '🔊 Playing Audio...' : '▶ Listen / Replay Phrase'}
      </button>

      <div class="score-pill">
        <span>Score:</span>
        <strong class="font-mono text-accent">{score} / {totalAnswered}</strong>
        {#if totalAnswered > 0}
          <span class="score-pct font-mono">({Math.round((score / totalAnswered) * 100)}%)</span>
        {/if}
      </div>
    </div>

    <!-- Active Challenge Card -->
    <section class="card-panel challenge-panel">
      <div class="challenge-header">
        <h2>Challenge #{challengeIndex + 1}: {currentChallenge.prompt}</h2>
      </div>

      <div class="options-grid">
        {#each currentChallenge.options as option}
          <button
            class="option-card {selectedOption === option ? (isCorrect ? 'opt-correct' : 'opt-wrong') : ''} {showResult && option === currentChallenge.correctOption ? 'opt-correct' : ''}"
            onclick={() => handleSelectOption(option)}
            disabled={showResult}
          >
            <span class="opt-text">{option}</span>
          </button>
        {/each}
      </div>

      {#if showResult}
        <div class="result-box {isCorrect ? 'box-correct' : 'box-wrong'}">
          <div class="result-title">
            {isCorrect ? '✓ Spot-On! Correct Ear Call!' : '✗ Not Quite!'}
          </div>
          <p class="result-explanation">{currentChallenge.explanation}</p>
          <div class="next-action">
            <button class="btn btn-primary" onclick={nextChallenge}>
              Next Challenge &rarr;
            </button>
          </div>
        </div>
      {/if}
    </section>
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

  .game-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .score-pill {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    padding: 0.5rem 1.25rem;
    border-radius: 999px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .text-accent {
    color: var(--accent-light);
  }

  .score-pct {
    font-size: 0.8rem;
    color: var(--text-muted);
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

  .challenge-header h2 {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 600px) {
    .options-grid {
      grid-template-columns: 1fr;
    }
  }

  .option-card {
    background-color: var(--bg-tertiary);
    border: 2px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-fast);
  }

  .option-card:hover:not(:disabled) {
    border-color: var(--accent);
    background-color: rgba(245, 158, 11, 0.05);
  }

  .opt-text {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .opt-correct {
    border-color: #10b981 !important;
    background-color: rgba(16, 185, 129, 0.15) !important;
  }

  .opt-wrong {
    border-color: #ef4444 !important;
    background-color: rgba(239, 68, 68, 0.15) !important;
  }

  .result-box {
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .box-correct {
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .box-wrong {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .result-title {
    font-size: 1.1rem;
    font-weight: 800;
  }

  .box-correct .result-title { color: #10b981; }
  .box-wrong .result-title { color: #ef4444; }

  .result-explanation {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .next-action {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .font-mono {
    font-family: var(--font-mono);
  }
</style>
