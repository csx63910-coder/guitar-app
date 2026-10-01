<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  const STORAGE_KEY = 'guitar_toolkit_daily_riff_streak';

  interface DailyRiff {
    dayNum: number;
    title: string;
    genre: string;
    key: string;
    targetBpm: number;
    tabText: string;
    notes: { freq: number; duration: number }[];
    techniqueTip: string;
  }

  const RIFFS: DailyRiff[] = [
    {
      dayNum: 1,
      title: 'Funk Double-Stop Scratch',
      genre: 'Funk / Soul',
      key: 'E9',
      targetBpm: 100,
      tabText: `e|--7--7---x-x---7--7---x-x---|
B|--7--7---x-x---7--7---x-x---|
G|--7--7---x-x---7--7---x-x---|
D|--6--6---x-x---6--6---x-x---|
A|--7--7---x-x---7--7---x-x---|
E|----------------------------|`,
      notes: [{ freq: 164.81, duration: 0.2 }, { freq: 329.63, duration: 0.2 }, { freq: 392.00, duration: 0.2 }, { freq: 493.88, duration: 0.2 }],
      techniqueTip: 'Relax the left-hand pressure immediately after strumming to choke the strings for dead-note scratches.'
    },
    {
      dayNum: 2,
      title: 'Texas Blues Turnaround',
      genre: 'Blues',
      key: 'E Major',
      targetBpm: 90,
      tabText: `e|--12--11--10--9-------------------|
B|------------------12b14--12--9----|
G|----------------------------------|
D|----------------------------------|
A|----------------------------------|
E|----------------------------------|`,
      notes: [{ freq: 659.25, duration: 0.3 }, { freq: 622.25, duration: 0.3 }, { freq: 587.33, duration: 0.3 }, { freq: 554.37, duration: 0.3 }],
      techniqueTip: 'Use your ring finger for the full-step bend at the 12th fret with index and middle fingers backing it up for strength.'
    },
    {
      dayNum: 3,
      title: 'Iron Gallop Rhythm',
      genre: 'Heavy Metal',
      key: 'E Minor',
      targetBpm: 130,
      tabText: `e|----------------------------------|
B|----------------------------------|
G|----------------------------------|
D|----------------------------------|
A|--2-------2-------2-------2-------|
E|--0-0-0---0-0-0---0-0-0---0-0-0---|`,
      notes: [{ freq: 82.41, duration: 0.15 }, { freq: 82.41, duration: 0.15 }, { freq: 82.41, duration: 0.15 }, { freq: 123.47, duration: 0.3 }],
      techniqueTip: 'Tight palm muting on the bridge saddles: Eighth-Sixteenth-Sixteenth rhythmic gallop.'
    }
  ];

  let selectedDayIndex = $state(0);
  const currentRiff = $derived(RIFFS[selectedDayIndex]);

  let streakDays = $state(7);
  let completedToday = $state(false);
  let speedMultiplier = $state(0.75); // 0.5, 0.75, 1.0, 1.1

  const activeBpm = $derived(
    Math.round(currentRiff.targetBpm * speedMultiplier)
  );

  // Audio Playback
  let audioCtx: AudioContext | null = null;
  let isPlayingRiff = $state(false);

  function playRiffPreview() {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    isPlayingRiff = true;
    const now = audioCtx.currentTime;
    const durRatio = currentRiff.targetBpm / activeBpm;

    currentRiff.notes.forEach((n, idx) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.freq, now + idx * n.duration * durRatio);
      gain.gain.setValueAtTime(0.2, now + idx * n.duration * durRatio);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * n.duration * durRatio);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(now + idx * n.duration * durRatio);
      osc.stop(now + (idx + 1) * n.duration * durRatio);
    });

    setTimeout(() => {
      isPlayingRiff = false;
    }, currentRiff.notes.length * 400 * durRatio);
  }

  function completeRiffChallenge() {
    if (!completedToday) {
      streakDays++;
      completedToday = true;
    }
    alert('Daily Riff Completed! Streak extended!');
  }

  onDestroy(() => {
    if (audioCtx) audioCtx.close();
  });
</script>

<svelte:head>
  <title>#148 Daily Riff Streak &amp; Speed Ladder — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#148 &middot; SOCIAL &amp; GAMIFIED</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Daily Riff Streak &amp; Speed Ladder</h1>
      <p class="lead-text">
        Bite-sized daily guitar habit builder. Learn today's curated riff across a <strong>progressive speed ladder</strong> (50% &rarr; 75% &rarr; 100% &rarr; 110% over-speed) and keep your daily streak alive.
      </p>

      <div class="action-bar">
        <button class="btn btn-primary" onclick={playRiffPreview} disabled={isPlayingRiff}>
          {isPlayingRiff ? '🔊 Playing Riff...' : `▶ Play Audio Preview (${activeBpm} BPM)`}
        </button>

        <button class="btn {completedToday ? 'btn-secondary' : 'btn-success'}" onclick={completeRiffChallenge}>
          {completedToday ? '✓ Completed Today!' : 'Mark Day Completed (+1 Streak)'}
        </button>
      </div>
    </header>

    <!-- Top Streak Stat Banner -->
    <div class="streak-banner">
      <div class="streak-icon">🔥</div>
      <div class="streak-info">
        <strong class="streak-number font-mono">{streakDays} Day Streak</strong>
        <span class="streak-sub">Consistency beats marathon practice sessions</span>
      </div>
      <div class="riff-selector-pills">
        {#each RIFFS as r, idx}
          <button
            class="chip-btn {selectedDayIndex === idx ? 'chip-active' : ''}"
            onclick={() => { selectedDayIndex = idx; completedToday = false; }}
          >
            Day #{r.dayNum}: {r.title}
          </button>
        {/each}
      </div>
    </div>

    <!-- Active Riff Workspace -->
    <div class="riff-workspace-grid">
      <!-- Main Tab & Sheet -->
      <section class="card-panel tab-panel">
        <div class="riff-title-row">
          <div>
            <h2>{currentRiff.title}</h2>
            <span class="riff-meta-sub">{currentRiff.genre} &middot; Key of {currentRiff.key}</span>
          </div>
          <span class="badge badge-accent font-mono">TARGET: {currentRiff.targetBpm} BPM</span>
        </div>

        <div class="tab-box font-mono">
          <pre>{currentRiff.tabText}</pre>
        </div>

        <div class="technique-tip-box">
          <strong>Luthier &amp; Technique Tip:</strong>
          <p>{currentRiff.techniqueTip}</p>
        </div>
      </section>

      <!-- Speed Ladder Ladder -->
      <section class="card-panel speed-panel">
        <h2>Progressive Speed Ladder</h2>
        <p class="speed-desc">Practice in stages to lock muscle memory before tackling 100% full tempo:</p>

        <div class="ladder-list">
          <button
            class="ladder-step {speedMultiplier === 0.5 ? 'step-active' : ''}"
            onclick={() => (speedMultiplier = 0.5)}
          >
            <span class="step-pct">50% Speed</span>
            <strong class="step-bpm font-mono">{Math.round(currentRiff.targetBpm * 0.5)} BPM</strong>
            <span class="step-role">Clean fingering drill</span>
          </button>

          <button
            class="ladder-step {speedMultiplier === 0.75 ? 'step-active' : ''}"
            onclick={() => (speedMultiplier = 0.75)}
          >
            <span class="step-pct">75% Speed</span>
            <strong class="step-bpm font-mono">{Math.round(currentRiff.targetBpm * 0.75)} BPM</strong>
            <span class="step-role">Metronome sync</span>
          </button>

          <button
            class="ladder-step {speedMultiplier === 1.0 ? 'step-active' : ''}"
            onclick={() => (speedMultiplier = 1.0)}
          >
            <span class="step-pct">100% Speed</span>
            <strong class="step-bpm font-mono">{currentRiff.targetBpm} BPM</strong>
            <span class="step-role">Original track tempo</span>
          </button>

          <button
            class="ladder-step {speedMultiplier === 1.1 ? 'step-active' : ''}"
            onclick={() => (speedMultiplier = 1.1)}
          >
            <span class="step-pct">110% Over-Speed</span>
            <strong class="step-bpm font-mono">{Math.round(currentRiff.targetBpm * 1.1)} BPM</strong>
            <span class="step-role">Fretboard mastery</span>
          </button>
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

  .btn-success {
    background-color: #10b981;
    color: #fff;
    border: 1px solid transparent;
    padding: 0.6rem 1.25rem;
    border-radius: var(--radius-md);
    font-weight: 700;
    cursor: pointer;
  }

  /* Streak Banner */
  .streak-banner {
    background: linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15));
    border: 1px solid rgba(245, 158, 11, 0.35);
    border-radius: var(--radius-lg);
    padding: 1.25rem 1.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .streak-icon {
    font-size: 2.2rem;
  }

  .streak-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    flex: 1;
  }

  .streak-number {
    font-size: 1.6rem;
    color: var(--accent-light);
  }

  .streak-sub {
    font-size: 0.82rem;
    color: var(--text-secondary);
  }

  .riff-selector-pills {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .chip-btn {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 0.45rem 0.85rem;
    border-radius: 9999px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .chip-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .chip-active {
    background-color: var(--accent);
    border-color: var(--accent-light);
    color: #000;
    font-weight: 700;
  }

  /* Workspace */
  .riff-workspace-grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .riff-workspace-grid {
      grid-template-columns: 1fr;
    }
  }

  .card-panel {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    box-shadow: var(--shadow-card);
  }

  .riff-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .riff-title-row h2 {
    font-size: 1.4rem;
    font-weight: 800;
    margin: 0;
    color: var(--text-primary);
  }

  .riff-meta-sub {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .tab-box {
    background-color: #0b0b0e;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    overflow-x: auto;
  }

  .tab-box pre {
    margin: 0;
    font-size: 1rem;
    color: #38bdf8;
    line-height: 1.5;
  }

  .technique-tip-box {
    background-color: rgba(245, 158, 11, 0.08);
    border-left: 3px solid var(--accent);
    padding: 0.85rem 1rem;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    font-size: 0.85rem;
  }

  .technique-tip-box p {
    margin: 0.25rem 0 0;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  /* Speed Ladder */
  .speed-panel h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .speed-desc {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0;
  }

  .ladder-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .ladder-step {
    background-color: var(--bg-tertiary);
    border: 2px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-fast);
  }

  .ladder-step:hover {
    border-color: var(--accent);
  }

  .step-active {
    border-color: var(--accent);
    background-color: rgba(245, 158, 11, 0.12);
  }

  .step-pct {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .step-bpm {
    font-size: 1.2rem;
    color: var(--accent-light);
  }

  .step-role {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .font-mono {
    font-family: var(--font-mono);
  }
</style>
