<script lang="ts">
  import { onDestroy } from 'svelte';

  export interface SongSection {
    id: string;
    name: string;
    chords: string;
    bars: number;
    tempo: number;
    key: string;
    notes: string;
  }

  export interface MoodOption {
    name: string;
    key: string;
    chords: string[];
    numerals: string[];
    vibe: string;
    tips: string;
  }

  interface Props {
    toolTitle: string;
    toolNumber: number;
    engineConfig?: {
      defaultMood?: string;
      customMoods?: MoodOption[];
      initialSections?: SongSection[];
    };
  }

  let { toolTitle, toolNumber, engineConfig }: Props = $props();

  const standardMoods: MoodOption[] = [
    {
      name: 'Melancholic & Reflective',
      key: 'A Minor',
      chords: ['Am', 'F', 'C', 'G'],
      numerals: ['i', 'VI', 'III', 'VII'],
      vibe: 'Bittersweet nostalgia, emotional indie folk or post-rock.',
      tips: 'Let the open high E and B strings drone across all four chords for lush acoustic resonance.'
    },
    {
      name: 'Uplifting & Triumphant',
      key: 'D Major',
      chords: ['D', 'A', 'Bm', 'G'],
      numerals: ['I', 'V', 'vi', 'IV'],
      vibe: 'Anthemic pop-rock, energetic festival chorus.',
      tips: 'Use Dsus2 and Gsus2 embellishments with pinky on fret 3 of high E.'
    },
    {
      name: 'Dark Heavy Tension',
      key: 'E Minor',
      chords: ['Em', 'C', 'Bb5', 'B7'],
      numerals: ['i', 'bVI', 'bV5', 'V7'],
      vibe: 'Heavy metal riffage, thriller soundtrack tension.',
      tips: 'Hit the Tritone flat-5 (Bb5) on beat 4 to create maximum harmonic pull into B7.'
    },
    {
      name: 'Neo-Soul & Warm Velvet',
      key: 'F Major',
      chords: ['Gm7', 'C9', 'Fmaj7', 'D7alt'],
      numerals: ['ii7', 'V9', 'Imaj7', 'VI7'],
      vibe: 'Late-night R&B, jazz-funk groove.',
      tips: 'Play rootless voicings on strings 2-3-4-5 and mute outer 1st and 6th strings with index finger.'
    },
    {
      name: 'Cinematic Dreamscape',
      key: 'E Major',
      chords: ['E', 'Asus2', 'C#m7', 'Badd11'],
      numerals: ['I', 'IVsus2', 'vi7', 'Vadd11'],
      vibe: 'Ambient shoe-gaze, wide reverbs and open drones.',
      tips: 'Keep fingers 3 & 4 stationary on the 2nd and 1st strings at fret 2/0 while shifting bass notes.'
    }
  ];

  const initialMood = (engineConfig?.customMoods && engineConfig.customMoods[0]) || standardMoods[0];
  const moods = $derived(engineConfig?.customMoods || standardMoods);
  let selectedMoodName = $state(initialMood.name);

  const currentMood = $derived(
    moods.find((m) => m.name === selectedMoodName) || moods[0]
  );

  const defaultSections: SongSection[] = [
    { id: '1', name: 'Intro', chords: 'Am - F', bars: 4, tempo: 110, key: 'A Minor', notes: 'Soft fingerpicking' },
    { id: '2', name: 'Verse 1', chords: 'Am - F - C - G', bars: 8, tempo: 110, key: 'A Minor', notes: 'Add bass drum pulse' },
    { id: '3', name: 'Chorus', chords: 'F - C - G - Am', bars: 8, tempo: 110, key: 'A Minor', notes: 'Full strumming open chords' },
    { id: '4', name: 'Bridge', chords: 'Dm - Am - G - E7', bars: 8, tempo: 110, key: 'A Minor', notes: 'Dynamic build up with crescendos' },
    { id: '5', name: 'Outro', chords: 'F - Am', bars: 4, tempo: 110, key: 'A Minor', notes: 'Fade out on sustained drone' }
  ];

  let sections = $state<SongSection[]>(
    engineConfig?.initialSections ? [...engineConfig.initialSections] : defaultSections
  );

  // Total runtime calculation
  const totalSeconds = $derived(
    sections.reduce((acc, s) => {
      const beats = s.bars * 4;
      const sec = (beats / s.tempo) * 60;
      return acc + sec;
    }, 0)
  );

  const formattedTotalTime = $derived(
    `${Math.floor(totalSeconds / 60)}m ${Math.round(totalSeconds % 60)}s`
  );

  // Audio Chord Player
  let audioCtx: AudioContext | null = null;
  let isAuditioning = $state(false);
  let auditionTimeout: number | null = null;
  let copyBanner = $state('');

  const chordFrequencies: Record<string, number[]> = {
    Am: [220, 261.63, 329.63, 440],
    F: [174.61, 220, 261.63, 349.23],
    C: [130.81, 164.81, 196, 261.63],
    G: [196, 246.94, 293.66, 392],
    D: [146.83, 220, 293.66, 369.99],
    A: [220, 277.18, 329.63, 440],
    Bm: [246.94, 293.66, 369.99, 493.88],
    Em: [164.81, 196, 246.94, 329.63],
    Bb5: [233.08, 349.23, 466.16],
    B7: [246.94, 311.13, 369.99, 440],
    Gm7: [196, 233.08, 293.66, 349.23],
    C9: [130.81, 196, 277.18, 329.63, 392],
    Fmaj7: [174.61, 220, 261.63, 329.63],
    D7alt: [146.83, 233.08, 293.66, 369.99],
    E: [164.81, 207.65, 246.94, 329.63],
    Asus2: [220, 277.18, 293.66, 440],
    'C#m7': [277.18, 329.63, 415.3, 493.88],
    Badd11: [246.94, 329.63, 369.99, 493.88]
  };

  function playChordVoices(chordName: string, duration = 1.6) {
    if (typeof window === 'undefined') return;
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const freqs = chordFrequencies[chordName] || [220, 277, 330];
    freqs.forEach((freq, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3, audioCtx.currentTime);

      // Slight acoustic strum arpeggio delay (25ms between strings)
      const startTime = audioCtx.currentTime + idx * 0.025;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18 / freqs.length, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  }

  function auditionProgression() {
    isAuditioning = true;
    const chords = currentMood.chords;
    chords.forEach((chord, i) => {
      setTimeout(() => {
        if (isAuditioning) playChordVoices(chord, 1.4);
      }, i * 1500);
    });

    auditionTimeout = window.setTimeout(() => {
      isAuditioning = false;
    }, chords.length * 1500 + 400);
  }

  function stopAudition() {
    isAuditioning = false;
    if (auditionTimeout) clearTimeout(auditionTimeout);
  }

  function addSection() {
    const newId = (sections.length + 1).toString();
    sections = [
      ...sections,
      {
        id: newId,
        name: `Section ${newId}`,
        chords: currentMood.chords.join(' - '),
        bars: 4,
        tempo: 110,
        key: currentMood.key,
        notes: 'Arrangement dynamics'
      }
    ];
  }

  function removeSection(id: string) {
    sections = sections.filter((s) => s.id !== id);
  }

  function exportChartText() {
    const lines = [
      `# ${toolTitle} (#${toolNumber}) — Song Structure & Chord Chart`,
      `Key: ${currentMood.key} | Mood: ${currentMood.name}`,
      `Total Estimated Duration: ${formattedTotalTime}`,
      '',
      '## Generated Harmony Progression',
      `Chords: ${currentMood.chords.join('  |  ')}`,
      `Roman Numerals: ${currentMood.numerals.join('  |  ')}`,
      `Performance Tips: ${currentMood.tips}`,
      '',
      '## Arrangement Timeline'
    ];

    sections.forEach((s) => {
      lines.push(`### ${s.name} (${s.bars} bars @ ${s.tempo} BPM)`);
      lines.push(`Chords: [ ${s.chords} ]`);
      if (s.notes) lines.push(`Notes: ${s.notes}`);
      lines.push('');
    });

    const text = lines.join('\n');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      copyBanner = 'Song chart & structure copied to clipboard!';
      setTimeout(() => (copyBanner = ''), 3000);
    }
  }

  onDestroy(() => {
    stopAudition();
    if (audioCtx) {
      try {
        audioCtx.close();
      } catch {}
      audioCtx = null;
    }
  });
</script>

<div class="workflow-card">
  <div class="wf-header">
    <div class="wf-info">
      <span class="engine-badge">SONGWRITING &middot; HARMONY ARCHITECT</span>
      <h3>{toolTitle} Progression &amp; Arrangement Engine</h3>
      <p class="wf-sub">
        Explore emotional mood chord progressions with voice leading hints, polyphonic Web Audio playback, and interactive section arrangement budgeting.
      </p>
    </div>

    <div class="wf-actions">
      <button class="btn {isAuditioning ? 'btn-danger' : 'btn-primary'}" onclick={() => isAuditioning ? stopAudition() : auditionProgression()}>
        {#if isAuditioning}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          Stop Audio
        {:else}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Audition Progression
        {/if}
      </button>

      <button class="btn btn-secondary btn-sm" onclick={exportChartText}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Copy Chart
      </button>
    </div>
  </div>

  <!-- Mood Selection Palette -->
  <div class="mood-selector-bar">
    <span class="bar-title">Harmonic Vibe / Emotional Mood:</span>
    <div class="mood-pills">
      {#each moods as m}
        <button
          type="button"
          class="pill-btn {selectedMoodName === m.name ? 'active' : ''}"
          onclick={() => { selectedMoodName = m.name; }}
        >
          {m.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Current Mood Card -->
  <div class="mood-spotlight-card">
    <div class="spotlight-top">
      <div>
        <span class="key-pill">Key of {currentMood.key}</span>
        <h4>{currentMood.name}</h4>
        <p class="vibe-text">{currentMood.vibe}</p>
      </div>

      <div class="progression-ribbon">
        {#each currentMood.chords as chord, i}
          <div class="chord-box">
            <span class="chord-name">{chord}</span>
            <span class="numeral-label">{currentMood.numerals[i]}</span>
          </div>
          {#if i < currentMood.chords.length - 1}
            <span class="chord-sep">&rarr;</span>
          {/if}
        {/each}
      </div>
    </div>

    <div class="voice-leading-tip">
      <span class="tip-icon">&starf;</span>
      <span><strong>Guitar Voice Leading Tip:</strong> {currentMood.tips}</span>
    </div>
  </div>

  <!-- Song Section Arrangement Timeline -->
  <div class="timeline-section">
    <div class="timeline-header">
      <div>
        <h4>Song Arrangement Timeline &amp; Duration Budget</h4>
        <p class="timeline-sub">Estimated Song Duration: <strong>{formattedTotalTime}</strong> ({sections.reduce((acc, s) => acc + s.bars, 0)} total bars)</p>
      </div>

      <button class="btn btn-secondary btn-sm" onclick={addSection}>
        + Add Section
      </button>
    </div>

    <div class="sections-table-wrap">
      <table class="sections-table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Chords / Progression</th>
            <th>Bars</th>
            <th>BPM</th>
            <th>Performance Cues</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each sections as s (s.id)}
            <tr>
              <td>
                <input type="text" bind:value={s.name} class="table-input name-input" />
              </td>
              <td>
                <input type="text" bind:value={s.chords} class="table-input chords-input" />
              </td>
              <td>
                <input type="number" min="1" max="64" bind:value={s.bars} class="table-input num-input" />
              </td>
              <td>
                <input type="number" min="40" max="260" bind:value={s.tempo} class="table-input num-input" />
              </td>
              <td>
                <input type="text" bind:value={s.notes} class="table-input notes-input" placeholder="Dynamics..." />
              </td>
              <td class="action-cell">
                <button
                  class="btn-delete"
                  onclick={() => removeSection(s.id)}
                  title="Remove Section"
                >
                  &times;
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  {#if copyBanner}
    <div class="copy-banner">{copyBanner}</div>
  {/if}
</div>

<style>
  .workflow-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: var(--shadow-card);
  }

  .wf-header {
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

  .wf-header h3 {
    font-size: 1.35rem;
    margin-bottom: 0.25rem;
  }

  .wf-sub {
    font-size: 0.88rem;
    color: var(--text-secondary);
    max-width: 650px;
  }

  .wf-actions {
    display: flex;
    gap: 0.65rem;
    align-items: center;
  }

  .btn-danger {
    background-color: #ef4444;
    color: #fff;
    border: none;
  }
  .btn-danger:hover {
    background-color: #dc2626;
  }

  .mood-selector-bar {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex-wrap: wrap;
    background-color: var(--bg-tertiary);
    padding: 0.65rem 1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-subtle);
  }

  .bar-title {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .mood-pills {
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
  }

  .pill-btn {
    font-size: 0.78rem;
    padding: 0.25rem 0.7rem;
    border-radius: var(--radius-full);
    border: 1px solid var(--border-default);
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .pill-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .pill-btn.active {
    background-color: var(--accent);
    color: #000;
    border-color: var(--accent);
    font-weight: 700;
  }

  .mood-spotlight-card {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.35rem;
    display: flex;
    flex-direction: column;
    gap: 1.15rem;
  }

  .spotlight-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .key-pill {
    font-size: 0.72rem;
    font-family: var(--font-mono);
    color: var(--accent-light);
    background-color: var(--accent-subtle);
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-sm);
    display: inline-block;
    margin-bottom: 0.35rem;
  }

  .spotlight-top h4 {
    font-size: 1.15rem;
    margin-bottom: 0.2rem;
  }

  .vibe-text {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .progression-ribbon {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .chord-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: 0.5rem 0.85rem;
    min-width: 65px;
  }

  .chord-name {
    font-size: 1.25rem;
    font-weight: 800;
    font-family: var(--font-mono);
    color: var(--text-primary);
  }

  .numeral-label {
    font-size: 0.72rem;
    color: var(--accent-light);
    font-weight: 600;
  }

  .chord-sep {
    color: var(--text-muted);
    font-weight: 700;
  }

  .voice-leading-tip {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    background-color: var(--bg-tertiary);
    padding: 0.75rem 1rem;
    border-radius: var(--radius-sm);
    font-size: 0.82rem;
    color: var(--text-secondary);
    border-left: 3px solid var(--accent);
  }

  .tip-icon {
    color: var(--accent);
  }

  .timeline-section {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .timeline-header h4 {
    font-size: 0.95rem;
  }

  .timeline-sub {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .timeline-sub strong {
    color: var(--accent-light);
  }

  .sections-table-wrap {
    overflow-x: auto;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
  }

  .sections-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
  }

  .sections-table th {
    text-align: left;
    padding: 0.65rem 0.85rem;
    color: var(--text-muted);
    font-size: 0.72rem;
    font-family: var(--font-mono);
    text-transform: uppercase;
    border-bottom: 1px solid var(--border-subtle);
  }

  .sections-table td {
    padding: 0.5rem 0.85rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .table-input {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    color: var(--text-primary);
    padding: 0.35rem 0.55rem;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    width: 100%;
  }

  .name-input {
    font-weight: 600;
    min-width: 90px;
  }

  .chords-input {
    font-family: var(--font-mono);
    color: var(--accent-light);
    min-width: 140px;
  }

  .num-input {
    width: 60px;
  }

  .notes-input {
    min-width: 150px;
  }

  .action-cell {
    width: 40px;
    text-align: center;
  }

  .btn-delete {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.2rem;
    cursor: pointer;
    line-height: 1;
  }

  .btn-delete:hover {
    color: #ef4444;
  }

  .copy-banner {
    background-color: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.35);
    padding: 0.65rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.82rem;
    font-weight: 600;
    text-align: center;
  }
</style>
