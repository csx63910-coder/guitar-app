<script lang="ts">
  import { onMount } from 'svelte';

  interface SimplifiedChord {
    original: string;
    shellName: string;
    root: string;
    third: string;
    seventh: string;
    frets: (number | 'x')[]; // 6 strings: [Low E, A, D, G, B, High E]
    fingers: string;
    description: string;
  }

  let rawChordInput = $state('Cmaj7 Dm7 G7 Em7 A7 Dm9 G13 C6');
  let simplificationStyle = $state<'shell' | 'cowboy'>('shell');
  let isPlayingAudio = $state(false);

  // Shell chord dictionary & decomposition logic
  function simplifyChord(chordRaw: string): SimplifiedChord {
    const chord = chordRaw.trim();
    const root = chord.match(/^[A-G][#b]?/)?.[0] || 'C';

    if (chord.includes('maj') || chord.includes('Maj') || chord.includes('M7')) {
      return {
        original: chord,
        shellName: `${root}maj7 (Shell)`,
        root,
        third: 'Major 3rd',
        seventh: 'Major 7th',
        frets: root === 'C' ? ['x', 3, 2, 4, 'x', 'x'] : [3, 'x', 2, 4, 'x', 'x'],
        fingers: '1 - 2 - 3',
        description: 'Crisp 3-note shell chord omitting the 5th for acoustic air and clarity.'
      };
    } else if (chord.includes('m7') || chord.includes('min7') || chord.includes('m9')) {
      return {
        original: chord,
        shellName: `${root}m7 (Shell)`,
        root,
        third: 'Minor 3rd',
        seventh: 'Minor 7th',
        frets: root === 'D' ? ['x', 5, 3, 5, 'x', 'x'] : [5, 'x', 3, 5, 'x', 'x'],
        fingers: '2 - 1 - 3',
        description: 'Essential minor 3rd and flat 7th voicing for smooth walking rhythm.'
      };
    } else if (chord.includes('7') || chord.includes('13') || chord.includes('9')) {
      return {
        original: chord,
        shellName: `${root}7 (Dominant Shell)`,
        root,
        third: 'Major 3rd',
        seventh: 'Minor 7th',
        frets: root === 'G' ? [3, 'x', 3, 4, 'x', 'x'] : ['x', 3, 2, 3, 'x', 'x'],
        fingers: '1 - 2 - 3',
        description: 'Freddie Green style dominant guide tones that lead directly into resolution.'
      };
    } else {
      // Triad fallback
      return {
        original: chord,
        shellName: `${root} (Compact)`,
        root,
        third: '3rd',
        seventh: 'None',
        frets: ['x', 3, 2, 0, 1, 0],
        fingers: 'Open',
        description: 'Standard comfortable 3-finger grip.'
      };
    }
  }

  let parsedChords = $derived(
    rawChordInput
      .split(/[\s,|]+/)
      .filter((c) => c.trim().length > 0)
      .map(simplifyChord)
  );

  // Audio Playback
  let audioCtx: AudioContext | null = null;

  function playChordGrip(frets: (number | 'x')[]) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const openMidi = [40, 45, 50, 55, 59, 64]; // E A D G B E
    const now = audioCtx.currentTime;

    frets.forEach((fret, strIdx) => {
      if (fret === 'x' || !audioCtx) return;
      const midi = openMidi[strIdx] + (fret as number);
      const freq = 440 * Math.pow(2, (midi - 69) / 12);

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + strIdx * 0.03); // Strum stagger

      gain.gain.setValueAtTime(0.001, now + strIdx * 0.03);
      gain.gain.linearRampToValueAtTime(0.2, now + strIdx * 0.03 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + strIdx * 0.03 + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + strIdx * 0.03);
      osc.stop(now + strIdx * 0.03 + 1.25);
    });
  }
</script>

<svelte:head>
  <title>Fretboard Chart Simplifier | Guitar Toolkit</title>
  <meta
    name="description"
    content="Turn complex jazz, R&B, and neo-soul chords into easy 3-note Freddie Green shell voicings and ergonomic acoustic shapes."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Songwriting & Chords</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#35 Rhythm Tool</span>
      <span class="badge">Freddie Green Shell Voicings</span>
      <span class="badge">Audio Strum Feedback</span>
    </div>
    <h1>✨ Fretboard Chart Simplifier</h1>
    <p class="tool-sub">
      Convert intimidating jazz charts, 13ths, and altered dominants into effortless 3-note "shell chords" (Root, 3rd, and 7th). Play through complex progressions without hand strain.
    </p>
  </div>

  <!-- Input Section -->
  <div class="input-card">
    <label for="chords-input" class="input-label">PASTE COMPLEX CHORD SEQUENCE:</label>
    <div class="input-row">
      <input
        id="chords-input"
        type="text"
        placeholder="e.g. Cmaj7 Dm7 G7 Em7 A7 Dm9 G13 C6..."
        bind:value={rawChordInput}
      />
    </div>

    <!-- Presets -->
    <div class="presets-row">
      <span class="presets-label">Preset Progressions:</span>
      <button type="button" class="preset-chip" onclick={() => (rawChordInput = 'Dm7 G7 Cmaj7 A7')}>Jazz II-V-I</button>
      <button type="button" class="preset-chip" onclick={() => (rawChordInput = 'Cmaj9 Am9 Dm9 G13')}>Neo-Soul Turnaround</button>
      <button type="button" class="preset-chip" onclick={() => (rawChordInput = 'Em7 A7 Dmaj7 B7')}>Bossa Nova Rhythm</button>
      <button type="button" class="preset-chip" onclick={() => (rawChordInput = 'Fm7 Bb7 Ebmaj7 Abmaj7')}>Autumn Leaves Cadence</button>
    </div>
  </div>

  <!-- Simplified Voicings Grid -->
  <div class="charts-section">
    <div class="charts-header">
      <h2>🎸 Simplified Shell Voicing Diagrams ({parsedChords.length} Chords)</h2>
      <span class="charts-sub">Click "Strum" to preview the voicing</span>
    </div>

    <div class="chords-grid">
      {#each parsedChords as chord}
        <div class="chord-card">
          <div class="card-top">
            <span class="orig-tag">{chord.original}</span>
            <span class="arrow">&rarr;</span>
            <span class="shell-tag">{chord.shellName}</span>
          </div>

          <!-- Mini SVG Fretboard Box Diagram -->
          <div class="svg-fret-box">
            <svg viewBox="0 0 140 160" class="chord-svg">
              <!-- Nut or top fret line -->
              <line x1="20" y1="30" x2="120" y2="30" stroke="#f3f4f6" stroke-width="4" />

              <!-- 4 Frets -->
              {#each [60, 90, 120, 150] as y}
                <line x1="20" y1={y} x2="120" y2={y} stroke="#475569" stroke-width="1.5" />
              {/each}

              <!-- 6 Strings: x = 20, 40, 60, 80, 100, 120 -->
              {#each [20, 40, 60, 80, 100, 120] as x, sIdx}
                <line x1={x} y1="30" x2={x} y2="150" stroke="#64748b" stroke-width="1.5" />
                <!-- Mute or Open marker above nut -->
                {#if chord.frets[sIdx] === 'x'}
                  <text x={x} y="20" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">✕</text>
                {:else if chord.frets[sIdx] === 0}
                  <circle cx={x} cy="18" r="4" fill="none" stroke="#10b981" stroke-width="1.5" />
                {/if}
              {/each}

              <!-- Finger dots on frets -->
              {#each chord.frets as f, sIdx}
                {#if typeof f === 'number' && f > 0}
                  <!-- Y pos: 30 + (f * 30) - 15 -->
                  <circle cx={20 + sIdx * 20} cy={30 + f * 30 - 15} r="7" fill="#f59e0b" />
                {/if}
              {/each}
            </svg>
          </div>

          <div class="guide-tones">
            <span>Root: <strong>{chord.root}</strong></span>
            <span>Guides: <strong>{chord.third} + {chord.seventh}</strong></span>
          </div>

          <p class="chord-desc">{chord.description}</p>

          <button
            type="button"
            class="strum-btn"
            onclick={() => playChordGrip(chord.frets)}
          >
            ▶ STRUM VOICING
          </button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Freddie Green Lesson Card -->
  <div class="theory-card">
    <h3>💡 Why 3-Note "Shell Chords" Sound Better in a Band</h3>
    <p>
      Pioneered by Count Basie's guitarist Freddie Green, shell voicings strip away the 5th and unnecessary doublings.
    </p>
    <ul>
      <li><strong>Sonic Space:</strong> The bass player plays the root, the keyboard or horns play color tones. A guitar playing 6-string bar chords turns the mix into mud.</li>
      <li><strong>Voice Leading:</strong> Between Dm7 and G7, only ONE finger moves! The 7th of Dm (C) drops a half step to become the 3rd of G (B).</li>
      <li><strong>Effortless Endurance:</strong> No barres across 6 strings. You can play a 4-hour gig without hand fatigue.</li>
    </ul>
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

  .input-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 18px;
    margin-bottom: 24px;
  }
  .input-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: #9ca3af;
    margin-bottom: 8px;
  }
  .input-row input {
    width: 100%;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: monospace;
  }

  .presets-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  .presets-label {
    font-size: 0.75rem;
    color: #6b7280;
  }
  .preset-chip {
    background: #1f2937;
    border: 1px solid #374151;
    color: #9ca3af;
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
  }
  .preset-chip:hover {
    color: #f59e0b;
    border-color: #f59e0b;
  }

  .charts-section {
    margin-bottom: 24px;
  }
  .charts-header {
    margin-bottom: 16px;
  }
  .charts-header h2 {
    font-size: 1.35rem;
    margin: 0 0 4px;
    color: #f9fafb;
  }
  .charts-sub {
    font-size: 0.85rem;
    color: #9ca3af;
  }

  .chords-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  .chord-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .card-top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
  }
  .orig-tag {
    background: #1f2937;
    color: #9ca3af;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.8rem;
    font-weight: 700;
  }
  .arrow {
    color: #6b7280;
    font-size: 0.8rem;
  }
  .shell-tag {
    color: #f59e0b;
    font-weight: 800;
    font-size: 0.9rem;
  }

  .svg-fret-box {
    background: #0d1117;
    border-radius: 6px;
    padding: 8px;
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
  }
  .chord-svg {
    width: 130px;
    height: 150px;
  }

  .guide-tones {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-bottom: 8px;
    border-bottom: 1px dashed #1f2937;
    padding-bottom: 6px;
  }
  .guide-tones strong {
    color: #38bdf8;
  }

  .chord-desc {
    font-size: 0.75rem;
    color: #9ca3af;
    line-height: 1.4;
    margin: 0 0 12px;
    flex-grow: 1;
  }

  .strum-btn {
    background: #0284c7;
    color: #ffffff;
    border: none;
    font-weight: 700;
    font-size: 0.75rem;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
  }
  .strum-btn:hover {
    background: #0369a1;
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
