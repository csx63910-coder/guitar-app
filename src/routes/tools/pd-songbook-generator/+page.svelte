<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  interface SongPiece {
    id: string;
    title: string;
    composer: string;
    era: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    key: string;
    bpm: number;
    description: string;
    tabText: string;
    notes: { freq: number; duration: number }[];
  }

  const SONGBOOK: SongPiece[] = [
    {
      id: 'sor-op60-1',
      title: 'Study in C Major (Op. 60, No. 1)',
      composer: 'Fernando Sor (1778–1839)',
      era: 'Classical / Public Domain',
      difficulty: 'Beginner',
      key: 'C Major',
      bpm: 80,
      description: 'The definitive classical guitar method study for right-hand thumb/index alternating rest strokes.',
      tabText: `e|--------0---------------0----------|--------0---------------0----------|
B|----1-------1-------1-------1------|----1-------1-------1-------1------|
G|------0-------0-------0-------0----|------0-------0-------0-------0----|
D|------------------2----------------|--3---------------2----------------|
A|--3--------------------------------|-----------------------------------|
E|-----------------------------------|-----------------------------------|`,
      notes: [
        { freq: 130.81, duration: 0.4 }, { freq: 196.00, duration: 0.4 }, { freq: 261.63, duration: 0.4 }, { freq: 329.63, duration: 0.4 },
        { freq: 196.00, duration: 0.4 }, { freq: 261.63, duration: 0.4 }, { freq: 196.00, duration: 0.4 }, { freq: 261.63, duration: 0.4 },
        { freq: 146.83, duration: 0.4 }, { freq: 196.00, duration: 0.4 }, { freq: 261.63, duration: 0.4 }, { freq: 329.63, duration: 0.4 }
      ]
    },
    {
      id: 'carcassi-am',
      title: 'Etude in A Minor (Op. 60, No. 7)',
      composer: 'Matteo Carcassi (1792–1853)',
      era: 'Romantic / Public Domain',
      difficulty: 'Intermediate',
      key: 'A Minor',
      bpm: 96,
      description: 'Rapid 16th-note arpeggio study traversing the neck with open bass strings.',
      tabText: `e|----------0---------------0--------|----------0---------------0--------|
B|------1-------1-------1-------1----|------0-------0-------0-------0----|
G|----2---2---2---2---2---2---2---2--|----1---1---1---1---1---1---1---1--|
D|-----------------------------------|-----------------------------------|
A|--0--------------------------------|-----------------------------------|
E|-----------------------------------|--0--------------------------------|`,
      notes: [
        { freq: 110.00, duration: 0.3 }, { freq: 220.00, duration: 0.3 }, { freq: 261.63, duration: 0.3 }, { freq: 329.63, duration: 0.3 },
        { freq: 261.63, duration: 0.3 }, { freq: 220.00, duration: 0.3 }, { freq: 164.81, duration: 0.3 }, { freq: 207.65, duration: 0.3 }
      ]
    },
    {
      id: 'greensleeves',
      title: 'Greensleeves (Traditional English)',
      composer: 'Traditional (16th Century)',
      era: 'Renaissance / Public Domain',
      difficulty: 'Beginner',
      key: 'E Dorian / Minor',
      bpm: 72,
      description: 'Timeless folk melody featuring classic minor-to-major harmony transitions.',
      tabText: `e|--0---3---5---7-8-7---5-------0----|--0---3---5---7-8-7---5-------0----|
B|--------------------------8-------3|--------------------------8-------3|
G|-----------------------------------|-----------------------------------|
D|-----------------------------------|-----------------------------------|
A|--0---------------0----------------|-----------------------------------|
E|-----------------------------------|--0---------------0----------------|`,
      notes: [
        { freq: 329.63, duration: 0.5 }, { freq: 392.00, duration: 0.5 }, { freq: 440.00, duration: 0.5 }, { freq: 493.88, duration: 0.5 },
        { freq: 523.25, duration: 0.25 }, { freq: 493.88, duration: 0.5 }, { freq: 440.00, duration: 0.5 }, { freq: 392.00, duration: 0.5 }
      ]
    }
  ];

  let selectedIndex = $state(0);
  const activePiece = $derived(SONGBOOK[selectedIndex]);

  // Audio Playback Engine
  let audioCtx: AudioContext | null = null;
  let isPlaying = $state(false);
  let playbackIndex = $state(0);
  let playTimeout: any = null;

  function playAcousticNote(freq: number, duration: number) {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.1, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playStep() {
    if (!isPlaying) return;
    const note = activePiece.notes[playbackIndex];
    playAcousticNote(note.freq, note.duration);

    playbackIndex = (playbackIndex + 1) % activePiece.notes.length;
    playTimeout = setTimeout(playStep, note.duration * 1000);
  }

  function toggleAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    isPlaying = !isPlaying;
    if (isPlaying) {
      playbackIndex = 0;
      playStep();
    } else {
      if (playTimeout) clearTimeout(playTimeout);
    }
  }

  function selectPiece(idx: number) {
    if (isPlaying) toggleAudio();
    selectedIndex = idx;
  }

  onDestroy(() => {
    if (playTimeout) clearTimeout(playTimeout);
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
  });
</script>

<svelte:head>
  <title>#27 Public-Domain Songbook Generator &amp; Viewer — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#27 &middot; TIER 3 REAL DSP &amp; AUDIO</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner</span>
      </div>
      <h1>Public-Domain Guitar Songbook &amp; Player</h1>
      <p class="lead-text">
        Evergreen library of 100% legal, copyright-free guitar studies and traditional melodies (Sor, Carcassi, Aguado, Renaissance Folk). Features built-in <strong>interactive acoustic playback synthesis</strong> and clean print sheet formatting.
      </p>

      <div class="action-bar">
        <button class="btn {isPlaying ? 'btn-danger' : 'btn-primary'}" onclick={toggleAudio}>
          {isPlaying ? '⏸ Pause Playback' : '▶ Listen with Acoustic Synthesizer'}
        </button>

        <button class="btn btn-secondary" onclick={() => window.print()}>
          Print Lead Sheet
        </button>
      </div>
    </header>

    <!-- Song Selector Chips -->
    <div class="song-chips no-print">
      {#each SONGBOOK as piece, idx}
        <button
          class="chip-btn {selectedIndex === idx ? 'chip-active' : ''}"
          onclick={() => selectPiece(idx)}
        >
          {piece.title}
        </button>
      {/each}
    </div>

    <!-- Main Score View -->
    <section class="card-panel score-panel">
      <div class="score-header">
        <div class="score-title-box">
          <h1 class="piece-title">{activePiece.title}</h1>
          <h2 class="piece-composer">{activePiece.composer} &middot; {activePiece.era}</h2>
        </div>
        <div class="score-meta-badges">
          <span class="badge badge-accent">{activePiece.key}</span>
          <span class="badge badge-subtle">{activePiece.bpm} BPM</span>
          <span class="badge badge-live">{activePiece.difficulty}</span>
        </div>
      </div>

      <p class="piece-desc">{activePiece.description}</p>

      <div class="tab-viewer-box font-mono">
        <pre class="tab-content">{activePiece.tabText}</pre>
      </div>
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

  .action-bar {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .btn-danger {
    background-color: #ef4444;
    color: #fff;
    border: 1px solid transparent;
    padding: 0.6rem 1.25rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
  }

  .song-chips {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .chip-btn {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    cursor: pointer;
    font-weight: 600;
    transition: all var(--transition-fast);
  }

  .chip-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .chip-active {
    background-color: rgba(245, 158, 11, 0.15);
    border-color: var(--accent);
    color: var(--accent-light);
  }

  /* Score Panel */
  .card-panel {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 2.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: var(--shadow-card);
  }

  .score-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .piece-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .piece-composer {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .score-meta-badges {
    display: flex;
    gap: 0.5rem;
  }

  .piece-desc {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }

  .tab-viewer-box {
    background-color: #0c0c0f;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    overflow-x: auto;
  }

  .tab-content {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6;
    color: #e5e7eb;
    white-space: pre;
  }

  .font-mono {
    font-family: var(--font-mono);
  }

  @media print {
    .no-print {
      display: none !important;
    }
    .card-panel {
      border: none !important;
      box-shadow: none !important;
      background: #fff !important;
      color: #000 !important;
      padding: 0 !important;
    }
    .piece-title, .piece-composer {
      color: #000 !important;
    }
    .tab-viewer-box {
      background: #fff !important;
      border: 1px solid #ccc !important;
    }
    .tab-content {
      color: #000 !important;
    }
  }
</style>
