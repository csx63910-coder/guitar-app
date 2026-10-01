<script lang="ts">
  import { onDestroy } from 'svelte';

  interface Props {
    toolTitle: string;
    toolNumber: number;
    engineConfig?: {
      defaultKey?: string;
      defaultScale?: string;
      defaultTuning?: string;
      subtitle?: string;
    };
  }

  let { toolTitle, toolNumber, engineConfig }: Props = $props();

  const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  const tunings: Record<string, { name: string; notes: string[]; frets: number[] }> = {
    standard: { name: 'Standard (E-A-D-G-B-E)', notes: ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'], frets: [64, 59, 55, 50, 45, 40] },
    dropD: { name: 'Drop D (D-A-D-G-B-E)', notes: ['E4', 'B3', 'G3', 'D3', 'A2', 'D2'], frets: [64, 59, 55, 50, 45, 38] },
    dadgad: { name: 'DADGAD Celtic', notes: ['D4', 'A3', 'G3', 'D3', 'A2', 'D2'], frets: [62, 57, 55, 50, 45, 38] },
    openG: { name: 'Open G (D-G-D-G-B-D)', notes: ['D4', 'B3', 'G3', 'D3', 'G2', 'D2'], frets: [62, 59, 55, 50, 43, 38] },
    openD: { name: 'Open D (D-A-D-F#-A-D)', notes: ['D4', 'A3', 'F#3', 'D3', 'A2', 'D2'], frets: [62, 57, 54, 50, 45, 38] },
    halfStep: { name: 'Half-Step Down (Eb-Ab-Db-Gb-Bb-Eb)', notes: ['Eb4', 'Bb3', 'Gb3', 'Db3', 'Ab2', 'Eb2'], frets: [63, 58, 54, 49, 44, 39] }
  };

  const scaleFormulas: Record<string, { name: string; intervals: number[]; degrees: string[] }> = {
    pentatonicMinor: { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10], degrees: ['1', 'b3', '4', '5', 'b7'] },
    pentatonicMajor: { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9], degrees: ['1', '2', '3', '5', '6'] },
    blues: { name: 'Blues Scale', intervals: [0, 3, 5, 6, 7, 10], degrees: ['1', 'b3', '4', 'b5', '5', 'b7'] },
    major: { name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11], degrees: ['1', '2', '3', '4', '5', '6', '7'] },
    minor: { name: 'Natural Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10], degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'] },
    dorian: { name: 'Dorian Mode', intervals: [0, 2, 3, 5, 7, 9, 10], degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'] },
    mixolydian: { name: 'Mixolydian Mode', intervals: [0, 2, 4, 5, 7, 9, 10], degrees: ['1', '2', '3', '4', '5', '6', 'b7'] },
    majorTriad: { name: 'Major Triad (1-3-5)', intervals: [0, 4, 7], degrees: ['1', '3', '5'] },
    minorTriad: { name: 'Minor Triad (1-b3-5)', intervals: [0, 3, 7], degrees: ['1', 'b3', '5'] },
    dom7: { name: 'Dominant 7th (1-3-5-b7)', intervals: [0, 4, 7, 10], degrees: ['1', '3', '5', 'b7'] },
    m7: { name: 'Minor 7th (1-b3-5-b7)', intervals: [0, 3, 7, 10], degrees: ['1', 'b3', '5', 'b7'] },
    maj7: { name: 'Major 7th (1-3-5-7)', intervals: [0, 4, 7, 11], degrees: ['1', '3', '5', '7'] }
  };

  const noteNamesChromatic = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  const initialKey = engineConfig?.defaultKey || 'A';
  const initialScale = engineConfig?.defaultScale || 'pentatonicMinor';
  const initialTuning = engineConfig?.defaultTuning || 'standard';

  let selectedKey = $state(initialKey);
  let selectedScale = $state(initialScale);
  let selectedTuning = $state(initialTuning);
  let displayMode = $state<'note' | 'degree'>('note');
  let stringFilter = $state<string>('all');

  // Custom user clicked notes [stringIdx, fret]
  let activeFretClicks = $state<Set<string>>(new Set());

  let audioCtx: AudioContext | null = null;
  let copyFeedback = $state('');

  function midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function getNoteAt(stringIdx: number, fret: number) {
    const tuningObj = tunings[selectedTuning] || tunings.standard;
    const baseMidi = tuningObj.frets[stringIdx];
    const midi = baseMidi + fret;
    const noteIndex = midi % 12;
    const noteName = noteNamesChromatic[noteIndex];
    return { midi, noteName, noteIndex };
  }

  function isScaleNote(noteIndex: number) {
    const rootIdx = noteNamesChromatic.indexOf(selectedKey);
    const scaleObj = scaleFormulas[selectedScale];
    if (!scaleObj || rootIdx === -1) return null;

    const interval = (noteIndex - rootIdx + 12) % 12;
    const idxInScale = scaleObj.intervals.indexOf(interval);
    if (idxInScale !== -1) {
      return {
        isRoot: interval === 0,
        degree: scaleObj.degrees[idxInScale],
        interval
      };
    }
    return null;
  }

  function playTone(midi: number, durationSec = 0.6) {
    if (typeof window === 'undefined') return;
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const freq = midiToFreq(midi);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationSec);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + durationSec);
  }

  function handleFretClick(stringIdx: number, fret: number) {
    const key = `${stringIdx}-${fret}`;
    const nextSet = new Set(activeFretClicks);
    if (nextSet.has(key)) {
      nextSet.delete(key);
    } else {
      nextSet.add(key);
    }
    activeFretClicks = nextSet;

    const { midi } = getNoteAt(stringIdx, fret);
    playTone(midi, 0.7);
  }

  function playArpeggio() {
    const notesToPlay: { midi: number; delay: number }[] = [];
    const rootIdx = noteNamesChromatic.indexOf(selectedKey);
    const scaleObj = scaleFormulas[selectedScale];
    if (!scaleObj) return;

    let delayCounter = 0;
    for (let stringIdx = 5; stringIdx >= 0; stringIdx--) {
      // Find lowest in-scale fret on string between 0 and 12
      for (let fret = 0; fret <= 12; fret++) {
        const { midi, noteIndex } = getNoteAt(stringIdx, fret);
        const interval = (noteIndex - rootIdx + 12) % 12;
        if (scaleObj.intervals.includes(interval)) {
          notesToPlay.push({ midi, delay: delayCounter });
          delayCounter += 0.16;
          break; // Take one note per string for clean arpeggiation
        }
      }
    }

    notesToPlay.forEach(({ midi, delay }) => {
      setTimeout(() => playTone(midi, 0.8), delay * 1000);
    });
  }

  function generateTabAscii(): string {
    const lines = ['e|', 'B|', 'G|', 'D|', 'A|', 'E|'];
    const stringNames = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

    for (let s = 0; s < 6; s++) {
      let segment = '';
      for (let f = 0; f <= 12; f++) {
        const key = `${s}-${f}`;
        const isCustom = activeFretClicks.has(key);
        const { noteIndex } = getNoteAt(s, f);
        const scaleMatch = isScaleNote(noteIndex);

        if (isCustom || (scaleMatch && scaleMatch.isRoot)) {
          segment += `-${f}-`;
        } else if (scaleMatch) {
          segment += `-${f}-`;
        } else {
          segment += '---';
        }
      }
      lines[s] += segment + '|';
    }

    return `# Tool #${toolNumber}: ${toolTitle}\n# Key: ${selectedKey} ${scaleFormulas[selectedScale]?.name}\n# Tuning: ${tunings[selectedTuning]?.name}\n\n` + lines.join('\n');
  }

  function copyTabToClipboard() {
    const tab = generateTabAscii();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(tab);
      copyFeedback = 'ASCII Tab copied to clipboard!';
      setTimeout(() => (copyFeedback = ''), 2800);
    }
  }

  function clearActiveNotes() {
    activeFretClicks = new Set();
  }

  onDestroy(() => {
    if (audioCtx) {
      try {
        audioCtx.close();
      } catch {}
      audioCtx = null;
    }
  });

  const fretsArray = Array.from({ length: 16 }, (_, i) => i);
</script>

<div class="fretboard-card">
  <div class="fret-header">
    <div class="fret-info">
      <span class="engine-badge">THEORY &middot; VISUAL FRETBOARD</span>
      <h3>{toolTitle} Interactive Fretboard Workspace</h3>
      <p class="fret-sub">Interactive 6-string fretboard with scale transposition, audio pitch synthesis, voice-leading intervals, and ASCII tablature export.</p>
    </div>

    <div class="fret-actions">
      <button class="btn btn-primary btn-sm" onclick={playArpeggio}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Arpeggiate Scale
      </button>

      <button class="btn btn-secondary btn-sm" onclick={clearActiveNotes}>
        Clear Selection
      </button>
    </div>
  </div>

  <!-- Settings Bar -->
  <div class="settings-bar">
    <div class="setting-item">
      <label for="key-sel">Root Key</label>
      <select id="key-sel" bind:value={selectedKey}>
        {#each keys as k}
          <option value={k}>{k}</option>
        {/each}
      </select>
    </div>

    <div class="setting-item">
      <label for="scale-sel">Scale / Chord Mode</label>
      <select id="scale-sel" bind:value={selectedScale}>
        {#each Object.entries(scaleFormulas) as [k, obj]}
          <option value={k}>{obj.name}</option>
        {/each}
      </select>
    </div>

    <div class="setting-item">
      <label for="tuning-sel">Guitar Tuning</label>
      <select id="tuning-sel" bind:value={selectedTuning}>
        {#each Object.entries(tunings) as [k, obj]}
          <option value={k}>{obj.name}</option>
        {/each}
      </select>
    </div>

    <div class="setting-item">
      <label for="display-sel">Note Markers</label>
      <select id="display-sel" bind:value={displayMode}>
        <option value="note">Note Names (A, C#, E)</option>
        <option value="degree">Scale Degrees (1, b3, 5)</option>
      </select>
    </div>
  </div>

  <!-- Interactive SVG Fretboard -->
  <div class="fretboard-viewport" role="region" aria-label="Interactive Guitar Fretboard">
    <div class="fret-labels-row">
      <div class="nut-header">NUT</div>
      {#each fretsArray.slice(1) as fret}
        <div class="fret-num-cell">
          <span>{fret}</span>
          {#if fret === 3 || fret === 5 || fret === 7 || fret === 9 || fret === 15}
            <span class="fret-marker-dot">&bull;</span>
          {:else if fret === 12}
            <span class="fret-marker-double">&bull;&bull;</span>
          {/if}
        </div>
      {/each}
    </div>

    <!-- 6 Guitar Strings -->
    {#each [0, 1, 2, 3, 4, 5] as stringIdx}
      <div class="guitar-string-row">
        <!-- String Name Label -->
        <div class="string-label">
          {tunings[selectedTuning]?.notes[stringIdx] || ''}
        </div>

        <!-- Open string & Frets 1..15 -->
        {#each fretsArray as fret}
          {@const { midi, noteName, noteIndex } = getNoteAt(stringIdx, fret)}
          {@const scaleMatch = isScaleNote(noteIndex)}
          {@const isCustom = activeFretClicks.has(`${stringIdx}-${fret}`)}
          {@const isHighlighted = isCustom || scaleMatch !== null}

          <button
            type="button"
            class="fret-cell {fret === 0 ? 'nut-cell' : ''} {scaleMatch?.isRoot ? 'root-note' : ''} {isCustom ? 'custom-active' : ''}"
            onclick={() => handleFretClick(stringIdx, fret)}
            title="{noteName} (String {stringIdx + 1}, Fret {fret}) — Click to sound"
          >
            {#if isHighlighted}
              <span class="note-pill {scaleMatch?.isRoot ? 'pill-root' : 'pill-scale'}">
                {displayMode === 'note' ? noteName : (scaleMatch ? scaleMatch.degree : noteName)}
              </span>
            {/if}
          </button>
        {/each}
      </div>
    {/each}
  </div>

  <!-- Tab Preview & Export Footer -->
  <div class="tab-export-tray">
    <div class="tab-desc">
      <h4>ASCII Tablature &amp; Position Preview</h4>
      <p>Click any fret above to audition notes and customize shapes. Automatically formats clean text tablature for songbooks.</p>
    </div>

    <div class="tab-actions">
      {#if copyFeedback}
        <span class="feedback-msg">{copyFeedback}</span>
      {/if}
      <button class="btn btn-secondary btn-sm" onclick={copyTabToClipboard}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy ASCII Tab
      </button>
    </div>
  </div>
</div>

<style>
  .fretboard-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: var(--shadow-card);
  }

  .fret-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.25rem;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 1.25rem;
  }

  .engine-badge {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--accent);
    background-color: var(--accent-subtle);
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
    display: inline-block;
    margin-bottom: 0.4rem;
  }

  .fret-header h3 {
    font-size: 1.35rem;
    margin-bottom: 0.25rem;
  }

  .fret-sub {
    font-size: 0.88rem;
    color: var(--text-secondary);
    max-width: 650px;
  }

  .fret-actions {
    display: flex;
    gap: 0.65rem;
    align-items: center;
  }

  .settings-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    background-color: var(--bg-tertiary);
    padding: 1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-subtle);
  }

  .setting-item {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .setting-item label {
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .setting-item select {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 0.45rem 0.6rem;
    font-size: 0.82rem;
  }

  .fretboard-viewport {
    overflow-x: auto;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .fret-labels-row {
    display: grid;
    grid-template-columns: 48px repeat(15, minmax(42px, 1fr));
    text-align: center;
    font-size: 0.74rem;
    font-family: var(--font-mono);
    color: var(--text-muted);
    margin-bottom: 0.35rem;
  }

  .nut-header {
    font-weight: 800;
    color: var(--accent);
  }

  .fret-num-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.1;
  }

  .fret-marker-dot, .fret-marker-double {
    color: var(--accent);
    font-size: 0.9rem;
    line-height: 0.5;
  }

  .guitar-string-row {
    display: grid;
    grid-template-columns: 48px repeat(16, minmax(42px, 1fr));
    align-items: center;
    height: 34px;
    position: relative;
  }

  .string-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--accent-light);
    font-family: var(--font-mono);
  }

  .fret-cell {
    height: 100%;
    border-left: 2px solid #4a5568;
    background: transparent;
    border-top: none;
    border-right: none;
    border-bottom: 1px solid #2d3748;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color var(--transition-fast);
  }

  .fret-cell:hover {
    background-color: rgba(245, 158, 11, 0.08);
  }

  .nut-cell {
    border-left: 4px solid var(--accent);
    background-color: rgba(245, 158, 11, 0.04);
  }

  .note-pill {
    width: 24px;
    height: 24px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
    font-family: var(--font-mono);
    box-shadow: 0 2px 5px rgba(0,0,0,0.4);
    z-index: 2;
  }

  .pill-root {
    background-color: var(--accent);
    color: #000;
    border: 2px solid #fff;
  }

  .pill-scale {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--accent-border);
  }

  .custom-active .note-pill {
    background-color: #10b981;
    color: #fff;
    border-color: #34d399;
  }

  .tab-export-tray {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    border-top: 1px solid var(--border-subtle);
    padding-top: 1.15rem;
  }

  .tab-desc h4 {
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
  }

  .tab-desc p {
    font-size: 0.82rem;
    color: var(--text-secondary);
  }

  .tab-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .feedback-msg {
    font-size: 0.78rem;
    color: var(--status-live);
    font-weight: 600;
  }
</style>
