<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  let audioCtx: AudioContext | null = null;
  let isPlaying = $state(false);
  let tempoBpm = $state(100);
  let currentBeat = $state(0);
  let currentMeasure = $state(1);

  interface StylePreset {
    id: string;
    name: string;
    key: string;
    timeSig: string;
    suggestedBpm: number;
    chords: { name: string; bassFreq: number; chordFreqs: number[] }[];
  }

  const PRESETS: StylePreset[] = [
    {
      id: 'blues-a',
      name: '12-Bar Blues Shuffle in A',
      key: 'A Major / Blues',
      timeSig: '4/4 Shuffle',
      suggestedBpm: 96,
      chords: [
        { name: 'A7', bassFreq: 110.00, chordFreqs: [220.00, 277.18, 329.63, 392.00] },
        { name: 'A7', bassFreq: 110.00, chordFreqs: [220.00, 277.18, 329.63, 392.00] },
        { name: 'A7', bassFreq: 110.00, chordFreqs: [220.00, 277.18, 329.63, 392.00] },
        { name: 'A7', bassFreq: 110.00, chordFreqs: [220.00, 277.18, 329.63, 392.00] },
        { name: 'D7', bassFreq: 146.83, chordFreqs: [293.66, 369.99, 440.00, 523.25] },
        { name: 'D7', bassFreq: 146.83, chordFreqs: [293.66, 369.99, 440.00, 523.25] },
        { name: 'A7', bassFreq: 110.00, chordFreqs: [220.00, 277.18, 329.63, 392.00] },
        { name: 'A7', bassFreq: 110.00, chordFreqs: [220.00, 277.18, 329.63, 392.00] },
        { name: 'E7', bassFreq: 164.81, chordFreqs: [329.63, 415.30, 493.88, 587.33] },
        { name: 'D7', bassFreq: 146.83, chordFreqs: [293.66, 369.99, 440.00, 523.25] },
        { name: 'A7', bassFreq: 110.00, chordFreqs: [220.00, 277.18, 329.63, 392.00] },
        { name: 'E7', bassFreq: 164.81, chordFreqs: [329.63, 415.30, 493.88, 587.33] }
      ]
    },
    {
      id: 'rock-am',
      name: 'Slow Rock Progression in Am',
      key: 'A Minor',
      timeSig: '4/4 Straight',
      suggestedBpm: 84,
      chords: [
        { name: 'Am', bassFreq: 110.00, chordFreqs: [220.00, 261.63, 329.63] },
        { name: 'F', bassFreq: 87.31, chordFreqs: [174.61, 220.00, 261.63] },
        { name: 'C', bassFreq: 130.81, chordFreqs: [261.63, 329.63, 392.00] },
        { name: 'G', bassFreq: 98.00, chordFreqs: [196.00, 246.94, 293.66] }
      ]
    },
    {
      id: 'jazz-c',
      name: 'Jazz II-V-I Standard in C',
      key: 'C Major',
      timeSig: '4/4 Swing',
      suggestedBpm: 112,
      chords: [
        { name: 'Dm7', bassFreq: 146.83, chordFreqs: [293.66, 349.23, 440.00, 523.25] },
        { name: 'G7', bassFreq: 98.00, chordFreqs: [196.00, 246.94, 293.66, 349.23] },
        { name: 'Cmaj7', bassFreq: 130.81, chordFreqs: [261.63, 329.63, 392.00, 493.88] },
        { name: 'A7', bassFreq: 110.00, chordFreqs: [220.00, 277.18, 329.63, 392.00] }
      ]
    }
  ];

  let selectedPresetIndex = $state(0);
  const activePreset = $derived(PRESETS[selectedPresetIndex]);

  let nextNoteTime = 0;
  let current16thNote = 0;
  let timerId: any = null;

  // Synthesizers
  function triggerKick(time: number) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.25);
  }

  function triggerSnare(time: number) {
    if (!audioCtx) return;
    // Tone
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    oscGain.gain.setValueAtTime(0.2, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.15);

    // Noise
    const bufSize = audioCtx.sampleRate * 0.15;
    const noiseBuf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const output = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) output[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuf;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.3, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(time);
    noise.stop(time + 0.2);
  }

  function triggerHihat(time: number, accent: boolean) {
    if (!audioCtx) return;
    const bufSize = audioCtx.sampleRate * 0.05;
    const noiseBuf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const output = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) output[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuf;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(accent ? 0.18 : 0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(time);
    noise.stop(time + 0.05);
  }

  function triggerBass(time: number, freq: number) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq / 2, time);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.35);
  }

  function triggerChord(time: number, freqs: number[]) {
    if (!audioCtx) return;
    freqs.forEach((f) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, time);
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(time);
      osc.stop(time + 0.4);
    });
  }

  function schedule() {
    while (nextNoteTime < audioCtx!.currentTime + 0.1) {
      const beatInBar = Math.floor(current16thNote / 4) % 4;
      const step16th = current16thNote % 16;
      const measureIdx = Math.floor(current16thNote / 16) % activePreset.chords.length;
      const chord = activePreset.chords[measureIdx];

      currentBeat = beatInBar;
      currentMeasure = measureIdx + 1;

      // Drums
      if (step16th === 0 || step16th === 8) triggerKick(nextNoteTime);
      if (step16th === 4 || step16th === 12) triggerSnare(nextNoteTime);
      if (step16th % 2 === 0) triggerHihat(nextNoteTime, step16th % 4 === 0);

      // Bass & Chords
      if (step16th === 0 || step16th === 8) {
        triggerBass(nextNoteTime, chord.bassFreq);
      }
      if (step16th === 4 || step16th === 10) {
        triggerChord(nextNoteTime, chord.chordFreqs);
      }

      const secondsPerBeat = 60.0 / tempoBpm;
      nextNoteTime += 0.25 * secondsPerBeat;
      current16thNote++;
    }
    timerId = setTimeout(schedule, 25);
  }

  function togglePlay() {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    isPlaying = !isPlaying;
    if (isPlaying) {
      current16thNote = 0;
      nextNoteTime = audioCtx.currentTime + 0.05;
      schedule();
    } else {
      if (timerId) clearTimeout(timerId);
    }
  }

  function changePreset(idx: number) {
    selectedPresetIndex = idx;
    tempoBpm = activePreset.suggestedBpm;
    if (isPlaying) {
      current16thNote = 0;
    }
  }

  onDestroy(() => {
    if (timerId) clearTimeout(timerId);
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
  });
</script>

<svelte:head>
  <title>#89 Procedural Backing Track Generator — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#89 &middot; TIER 3 REAL DSP &amp; AUDIO</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner</span>
      </div>
      <h1>Procedural Generated Backing Tracks</h1>
      <p class="lead-text">
        Pure in-browser rhythm band generator powered by <strong>Web Audio API synthesis</strong>. Practice soloing over 12-bar blues, slow rock, and jazz progressions with dynamic drums, walking bass lines, and chord stabs.
      </p>

      <div class="action-bar">
        <button class="btn {isPlaying ? 'btn-danger' : 'btn-primary'}" onclick={togglePlay}>
          {isPlaying ? '⏸ Stop Backing Track' : '▶ Play Procedural Band'}
        </button>

        <div class="bpm-slider-box">
          <label for="bpm-range">Tempo: <strong class="font-mono">{tempoBpm} BPM</strong></label>
          <input
            id="bpm-range"
            type="range"
            min="60"
            max="180"
            bind:value={tempoBpm}
          />
        </div>
      </div>
    </header>

    <!-- Genre Preset Tabs -->
    <div class="genre-tabs">
      {#each PRESETS as preset, idx}
        <button
          class="tab-btn {selectedPresetIndex === idx ? 'tab-active' : ''}"
          onclick={() => changePreset(idx)}
        >
          {preset.name}
        </button>
      {/each}
    </div>

    <!-- Live Stage Visualizer -->
    <div class="stage-display card-panel">
      <div class="stage-top">
        <div class="band-meta">
          <span class="meta-label">KEY &amp; GROOVE:</span>
          <strong class="meta-val">{activePreset.key} &middot; {activePreset.timeSig}</strong>
        </div>

        <div class="beat-indicators">
          {#each [0, 1, 2, 3] as beat}
            <div class="beat-dot {isPlaying && currentBeat === beat ? 'dot-active' : ''}">
              {beat + 1}
            </div>
          {/each}
        </div>
      </div>

      <!-- Progression Grid -->
      <div class="chord-grid">
        {#each activePreset.chords as chord, idx}
          <div class="chord-cell {isPlaying && currentMeasure === idx + 1 ? 'cell-active' : ''}">
            <span class="bar-num font-mono">Bar {idx + 1}</span>
            <span class="chord-symbol font-mono">{chord.name}</span>
          </div>
        {/each}
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
    align-items: center;
    gap: 2rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }

  .btn-danger {
    background-color: #ef4444;
    color: #fff;
    border: 1px solid transparent;
    padding: 0.6rem 1.4rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 700;
  }

  .bpm-slider-box {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
  }

  .bpm-slider-box input[type="range"] {
    width: 120px;
  }

  /* Genre Tabs */
  .genre-tabs {
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

  /* Stage Display */
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

  .stage-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .meta-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 700;
  }

  .meta-val {
    font-size: 1.1rem;
    color: var(--text-primary);
    margin-left: 0.5rem;
  }

  .beat-indicators {
    display: flex;
    gap: 0.5rem;
  }

  .beat-dot {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
    transition: all 0.05s ease;
  }

  .dot-active {
    background-color: var(--accent);
    border-color: var(--accent-light);
    color: #000;
    transform: scale(1.15);
    box-shadow: 0 0 10px var(--accent);
  }

  .chord-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  @media (max-width: 600px) {
    .chord-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .chord-cell {
    background-color: var(--bg-tertiary);
    border: 2px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.1s ease;
  }

  .cell-active {
    border-color: var(--accent);
    background-color: rgba(245, 158, 11, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25);
  }

  .bar-num {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .chord-symbol {
    font-size: 2.2rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .cell-active .chord-symbol {
    color: var(--accent-light);
  }

  .font-mono {
    font-family: var(--font-mono);
  }
</style>
