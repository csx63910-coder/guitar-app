<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface TuningChord {
    name: string;
    frets: (number | 'x')[]; // 6 strings: Low to High
    fingers: string;
    description: string;
  }

  interface TuningProfile {
    id: string;
    name: string;
    notes: string[]; // [Str 6, 5, 4, 3, 2, 1]
    genre: string;
    famousSongs: string;
    droneFreqs: [number, number]; // Root and Fifth in Hz
    chords: TuningChord[];
  }

  const TUNINGS: TuningProfile[] = [
    {
      id: 'dadgad',
      name: 'DADGAD (Celtic / Folk)',
      notes: ['D', 'A', 'D', 'G', 'A', 'D'],
      genre: 'Celtic, Fingerstyle, Acoustic Rock',
      famousSongs: 'Kashmir (Led Zeppelin), White Summer, Bert Jansch tunes',
      droneFreqs: [73.42, 110.0], // D2 and A2
      chords: [
        { name: 'D (Modal Open)', frets: [0, 0, 0, 0, 0, 0], fingers: 'All Open', description: 'Massive ringing modal D chord with shimmering unisons on D and A.' },
        { name: 'Gadd9', frets: [5, 0, 0, 4, 0, 0], fingers: 'T - 2', description: 'Lush open G chord utilizing open D and A drone strings.' },
        { name: 'Asus4', frets: ['x', 0, 2, 2, 0, 0], fingers: '1 - 2', description: 'Ethereal dominant resolution chord with ringing high chime.' },
        { name: 'Bm7 (Celtic)', frets: ['x', 2, 0, 2, 2, 0], fingers: '1 - 2 - 3', description: 'Deep, melancholic minor voicing with modal open strings.' },
        { name: 'Em7', frets: [2, 0, 2, 0, 0, 0], fingers: '1 - 2', description: 'Spooky natural minor shape; effortless 2-finger grip.' }
      ]
    },
    {
      id: 'open-g',
      name: 'Open G (Keith Richards / Stones)',
      notes: ['D', 'G', 'D', 'G', 'B', 'D'],
      genre: 'Rolling Stones, Delta Blues, Slide',
      famousSongs: 'Start Me Up, Brown Sugar, Honky Tonk Women',
      droneFreqs: [98.0, 146.83], // G2 and D3
      chords: [
        { name: 'G Major (Open)', frets: ['x', 0, 0, 0, 0, 0], fingers: 'Open (Keith removes 6th string)', description: 'Full major chord without fretting a single note.' },
        { name: 'C (Stones 2-Finger Hammer)', frets: ['x', 0, 2, 0, 1, 0], fingers: '2 - 1', description: 'The legendary Keith Richards signature rhythm riff.' },
        { name: 'D (Barre Fret 7)', frets: ['x', 7, 7, 7, 7, 7], fingers: '1 Barre', description: 'Single finger barre delivers full 5-string D major.' },
        { name: 'F (Barre Fret 10)', frets: ['x', 10, 10, 10, 10, 10], fingers: '1 Barre', description: 'Perfect for slide across the 10th fret.' }
      ]
    },
    {
      id: 'open-d',
      name: 'Open D (Vestapol / Slide)',
      notes: ['D', 'A', 'D', 'F#', 'A', 'D'],
      genre: 'Bottleneck Slide, Joni Mitchell, Elmore James',
      famousSongs: 'Dust My Broom, Big Yellow Taxi, The Cave (Mumford & Sons)',
      droneFreqs: [73.42, 110.0], // D2 and A2
      chords: [
        { name: 'D Major (Open)', frets: [0, 0, 0, 0, 0, 0], fingers: 'All Open', description: 'Pure sweet major chord; the foundational slide guitar standard.' },
        { name: 'G (IV Chord)', frets: [5, 5, 5, 5, 5, 5], fingers: '1 Barre', description: 'Barre at the 5th fret produces the IV chord instantly.' },
        { name: 'A (V Chord)', frets: [7, 7, 7, 7, 7, 7], fingers: '1 Barre', description: 'Barre at the 7th fret gives the V chord for blues turnarounds.' },
        { name: 'Bm (Minor Shape)', frets: [0, 2, 0, 1, 2, 0], fingers: '2 - 1 - 3', description: 'Haunting acoustic minor ballad shape.' }
      ]
    },
    {
      id: 'drop-d',
      name: 'Drop D',
      notes: ['D', 'A', 'D', 'G', 'B', 'E'],
      genre: 'Grunge, Hard Rock, Alternative Metal, Classical',
      famousSongs: 'Everlong (Foo Fighters), Soundgarden Spoonman, Killing in the Name',
      droneFreqs: [73.42, 110.0],
      chords: [
        { name: 'D Power Chord (1-Finger)', frets: [0, 0, 0, 'x', 'x', 'x'], fingers: 'Open', description: 'Brutal low-end punch across strings 6, 5, 4.' },
        { name: 'G5 Power Chord', frets: [5, 5, 5, 'x', 'x', 'x'], fingers: '1 Barre', description: 'Single-finger barre across bottom 3 strings.' },
        { name: 'A5 Power Chord', frets: [7, 7, 7, 'x', 'x', 'x'], fingers: '1 Barre', description: 'Fast sliding power chord transitions with one finger.' },
        { name: 'D Major (Rich Acoustic)', frets: [0, 0, 0, 2, 3, 2], fingers: '1 - 3 - 2', description: 'Acoustic standard with resonant low D bass note.' }
      ]
    }
  ];

  let selectedTuningId = $state('dadgad');
  let isDronePlaying = $state(false);

  let activeTuning = $derived(
    TUNINGS.find((t) => t.id === selectedTuningId) || TUNINGS[0]
  );

  // Web Audio Context & Drone
  let audioCtx: AudioContext | null = null;
  let droneOsc1: OscillatorNode | null = null;
  let droneOsc2: OscillatorNode | null = null;
  let droneGain: GainNode | null = null;

  function toggleDrone() {
    if (isDronePlaying) {
      stopDrone();
    } else {
      startDrone();
    }
  }

  function startDrone() {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const [f1, f2] = activeTuning.droneFreqs;

    droneOsc1 = audioCtx.createOscillator();
    droneOsc2 = audioCtx.createOscillator();
    droneGain = audioCtx.createGain();

    droneOsc1.type = 'sawtooth';
    droneOsc1.frequency.setValueAtTime(f1, now);

    droneOsc2.type = 'triangle';
    droneOsc2.frequency.setValueAtTime(f2, now);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    droneGain.gain.setValueAtTime(0.001, now);
    droneGain.gain.linearRampToValueAtTime(0.2, now + 1.0);

    droneOsc1.connect(filter);
    droneOsc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(audioCtx.destination);

    droneOsc1.start();
    droneOsc2.start();
    isDronePlaying = true;
  }

  function stopDrone() {
    if (droneGain && audioCtx) {
      droneGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        try {
          droneOsc1?.stop();
          droneOsc2?.stop();
        } catch {}
        isDronePlaying = false;
      }, 500);
    } else {
      isDronePlaying = false;
    }
  }

  function playChord(frets: (number | 'x')[]) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Map fret offsets
    const now = audioCtx.currentTime;
    frets.forEach((fret, strIdx) => {
      if (fret === 'x' || !audioCtx) return;
      // Synthesize plucks
      const baseFreq = 82.41 * Math.pow(1.3, strIdx);
      const freq = baseFreq * Math.pow(2, (fret as number) / 12);

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + strIdx * 0.03);

      gain.gain.setValueAtTime(0.001, now + strIdx * 0.03);
      gain.gain.linearRampToValueAtTime(0.2, now + strIdx * 0.03 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + strIdx * 0.03 + 1.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + strIdx * 0.03);
      osc.stop(now + strIdx * 0.03 + 1.45);
    });
  }

  onDestroy(() => {
    stopDrone();
  });
</script>

<svelte:head>
  <title>Alternative Tuning Chord & Drone Library | Guitar Toolkit</title>
  <meta
    name="description"
    content="Chord library and acoustic drone engine for DADGAD, Open G, Open D, Drop D, and Open C alternative tunings with interactive fretboard voicings."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Tabs & Chords</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#40 Tunings Tool</span>
      <span class="badge">Acoustic Drone Synth</span>
      <span class="badge">DADGAD & Open Chords</span>
    </div>
    <h1>🌊 Alternative Tuning Chord & Drone Library</h1>
    <p class="tool-sub">
      Escape standard tuning rut. Explore DADGAD, Open G, Open D, and Drop D with verified chord grips, string-by-string pitch maps, and an ambient acoustic drone synth.
    </p>
  </div>

  <!-- Tuning Profile Selector -->
  <div class="tuning-selector-card">
    <span class="sel-label">SELECT ALTERNATIVE TUNING:</span>
    <div class="tunings-grid">
      {#each TUNINGS as tuning}
        <button
          type="button"
          class="tuning-chip"
          class:active={tuning.id === selectedTuningId}
          onclick={() => {
            if (isDronePlaying) stopDrone();
            selectedTuningId = tuning.id;
          }}
        >
          <span class="chip-name">{tuning.name}</span>
          <span class="chip-notes">{tuning.notes.join(' - ')}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Active Tuning Details & Drone Generator -->
  <div class="tuning-profile-card">
    <div class="profile-top">
      <div>
        <h2>{activeTuning.name}</h2>
        <div class="pitch-indicators">
          {#each activeTuning.notes as note, sIdx}
            <div class="string-pitch-badge">
              <span class="str-num">Str {6 - sIdx}</span>
              <span class="str-note">{note}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Ambient Drone Toggle -->
      <button
        type="button"
        class="drone-btn"
        class:playing={isDronePlaying}
        onclick={toggleDrone}
      >
        <span class="drone-pulse" class:active-pulse={isDronePlaying}></span>
        {isDronePlaying ? '⏹ STOP AMBIENT DRONE' : '▶ START ACOUSTIC DRONE'}
      </button>
    </div>

    <div class="profile-meta">
      <div><strong>Genres:</strong> {activeTuning.genre}</div>
      <div><strong>Notable Songs:</strong> {activeTuning.famousSongs}</div>
    </div>

    <!-- Chords Grid -->
    <div class="chords-grid">
      {#each activeTuning.chords as chord}
        <div class="chord-tile">
          <div class="tile-header">
            <h4>{chord.name}</h4>
            <span class="fingers-tag">Fingers: {chord.fingers}</span>
          </div>

          <!-- SVG Chord Box Diagram -->
          <div class="fret-diagram-box">
            <svg viewBox="0 0 140 160" class="chord-box-svg">
              <line x1="20" y1="30" x2="120" y2="30" stroke="#f3f4f6" stroke-width="4" />
              {#each [60, 90, 120, 150] as y}
                <line x1="20" y1={y} x2="120" y2={y} stroke="#475569" stroke-width="1.5" />
              {/each}
              {#each [20, 40, 60, 80, 100, 120] as x, sIdx}
                <line x1={x} y1="30" x2={x} y2="150" stroke="#64748b" stroke-width="1.5" />
                {#if chord.frets[sIdx] === 'x'}
                  <text x={x} y="20" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">✕</text>
                {:else if chord.frets[sIdx] === 0}
                  <circle cx={x} cy="18" r="4" fill="none" stroke="#10b981" stroke-width="1.5" />
                {/if}
              {/each}
              {#each chord.frets as f, sIdx}
                {#if typeof f === 'number' && f > 0}
                  <circle cx={20 + sIdx * 20} cy={30 + f * 30 - 15} r="7" fill="#f59e0b" />
                {/if}
              {/each}
            </svg>
          </div>

          <p class="chord-desc">{chord.description}</p>

          <button type="button" class="strum-chord-btn" onclick={() => playChord(chord.frets)}>
            ▶ STRUM CHORD
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .tool-container {
    max-width: 1050px;
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
    background: rgba(14, 165, 233, 0.15);
    color: #0ea5e9;
    border-color: rgba(14, 165, 233, 0.4);
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

  .tuning-selector-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 18px;
    margin-bottom: 24px;
  }
  .sel-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: #6b7280;
    margin-bottom: 10px;
  }
  .tunings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }
  .tuning-chip {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 10px 14px;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .tuning-chip:hover {
    border-color: #38bdf8;
  }
  .tuning-chip.active {
    background: rgba(56, 189, 248, 0.15);
    border-color: #38bdf8;
  }
  .chip-name {
    display: block;
    font-weight: 700;
    font-size: 0.9rem;
    color: #f3f4f6;
  }
  .chip-notes {
    display: block;
    font-size: 0.75rem;
    color: #38bdf8;
    font-family: monospace;
    margin-top: 2px;
  }

  .tuning-profile-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 24px;
  }
  .profile-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #1f2937;
    padding-bottom: 20px;
    margin-bottom: 16px;
    gap: 20px;
    flex-wrap: wrap;
  }
  h2 {
    font-size: 1.5rem;
    margin: 0 0 10px;
    color: #f9fafb;
  }

  .pitch-indicators {
    display: flex;
    gap: 8px;
  }
  .string-pitch-badge {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 6px 10px;
    text-align: center;
    min-width: 44px;
  }
  .str-num {
    display: block;
    font-size: 0.65rem;
    color: #6b7280;
  }
  .str-note {
    font-size: 1.1rem;
    font-weight: 800;
    color: #f59e0b;
    font-family: monospace;
  }

  .drone-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    font-weight: 800;
    font-size: 0.85rem;
    padding: 12px 20px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .drone-btn.playing {
    background: #0284c7;
    border-color: #0284c7;
  }
  .drone-pulse {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #64748b;
  }
  .drone-pulse.active-pulse {
    background: #38bdf8;
    box-shadow: 0 0 10px #38bdf8;
    animation: pulse 1s infinite alternate;
  }
  @keyframes pulse {
    from { opacity: 0.5; }
    to { opacity: 1; }
  }

  .profile-meta {
    display: flex;
    gap: 24px;
    font-size: 0.85rem;
    color: #9ca3af;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .profile-meta strong {
    color: #cbd5e1;
  }

  .chords-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  .chord-tile {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .tile-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  .tile-header h4 {
    margin: 0;
    font-size: 1rem;
    color: #f59e0b;
  }
  .fingers-tag {
    font-size: 0.7rem;
    color: #9ca3af;
  }

  .fret-diagram-box {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
  }
  .chord-box-svg {
    width: 130px;
    height: 150px;
  }

  .chord-desc {
    font-size: 0.75rem;
    color: #9ca3af;
    line-height: 1.4;
    margin: 0 0 12px;
    flex-grow: 1;
  }

  .strum-chord-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #38bdf8;
    font-weight: 700;
    padding: 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
  }
  .strum-chord-btn:hover {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
  }
</style>
