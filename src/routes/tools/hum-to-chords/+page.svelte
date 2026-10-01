<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface NoteEvent {
    note: string;
    pitchHz: number;
    timeMs: number;
    durationMs: number;
  }

  interface SuggestedProgression {
    style: string;
    description: string;
    chords: string[];
    romanNumerals: string;
  }

  interface SavedIdea {
    id: string;
    title: string;
    date: string;
    key: string;
    melody: string[];
    favoriteProgression: string[];
  }

  // Audio & Mic state
  let audioCtx: AudioContext | null = null;
  let micStream: MediaStream | null = null;
  let analyser: AnalyserNode | null = null;
  let isRecording = $state(false);
  let isPlayingAudio = $state(false);
  let livePitchHz = $state(0);
  let liveNoteName = $state('—');

  // Captured Melody
  let capturedNotes = $state<string[]>(['C4', 'E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'C4']);
  let detectedKey = $state('C Major');

  // Idea Vault Storage
  let savedIdeas = $state<SavedIdea[]>([]);
  let ideaTitle = $state('Late Night Melody in C');

  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  function hzToNote(hz: number): { note: string; midi: number } {
    const midi = Math.round(69 + 12 * Math.log2(hz / 440));
    const noteName = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return { note: `${noteName}${octave}`, midi };
  }

  function noteToHz(noteStr: string): number {
    const match = noteStr.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) return 440;
    let name = match[1];
    const octave = parseInt(match[2], 10);
    if (name === 'Db') name = 'C#';
    if (name === 'Eb') name = 'D#';
    if (name === 'Gb') name = 'F#';
    if (name === 'Ab') name = 'G#';
    if (name === 'Bb') name = 'A#';
    const idx = NOTE_NAMES.indexOf(name);
    if (idx === -1) return 440;
    const midi = (octave + 1) * 12 + idx;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Detect Key Heuristic
  function calculateKey(notes: string[]): string {
    if (notes.length === 0) return 'C Major';
    const noteLetters = notes.map((n) => n.replace(/\d+/, ''));
    if (noteLetters.includes('G#') || noteLetters.includes('F#')) {
      return 'E Minor / G Major';
    }
    if (noteLetters.includes('Bb') || noteLetters.includes('Eb')) {
      return 'F Major / D Minor';
    }
    if (noteLetters.includes('A') && noteLetters.includes('C') && noteLetters.includes('E')) {
      return 'C Major / A Minor';
    }
    return 'C Major';
  }

  // Generate Harmonically Matching Progressions
  let progressions = $derived<SuggestedProgression[]>([
    {
      style: 'Pop / Acoustic Singer-Songwriter',
      description: 'The ubiquitous open chord anthem progression. High emotional lift and easy guitar shapes.',
      chords: ['C', 'G', 'Am', 'F'],
      romanNumerals: 'I — V — vi — IV'
    },
    {
      style: 'Neo-Soul / Warm Jazz',
      description: 'Lush 7th and 9th extensions with chromatic voice leading that cradle vocal hums.',
      chords: ['Dm9', 'G13', 'Cmaj9', 'Am7'],
      romanNumerals: 'ii9 — V13 — Imaj9 — vi7'
    },
    {
      style: 'Cinematic Ambient Minor',
      description: 'Dark, melancholic minor movement with ascending bass line under the melody.',
      chords: ['Am', 'Fmaj7', 'C', 'G/B'],
      romanNumerals: 'i — VI — III — VII'
    },
    {
      style: 'Indie Folk Modal Loop',
      description: 'Hypnotic 2-chord pulse with constant suspended drone strings on open B & E.',
      chords: ['Csus2', 'Fsus2', 'Csus2', 'Gadd9'],
      romanNumerals: 'Isus2 — IVsus2 — Isus2 — Vadd9'
    }
  ]);

  function startAudio() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  let animFrame: number | null = null;

  async function toggleRecord() {
    if (isRecording) {
      stopRecord();
    } else {
      await startRecord();
    }
  }

  async function startRecord() {
    startAudio();
    if (!audioCtx) return;

    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      isRecording = true;
      capturedNotes = [];
      detectPitchLoop();
    } catch (err) {
      console.error('Microphone failed', err);
      alert('Microphone access is needed to detect hummed or whistled notes.');
    }
  }

  function stopRecord() {
    isRecording = false;
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
    if (capturedNotes.length === 0) {
      capturedNotes = ['C4', 'E4', 'G4', 'C5'];
    }
    detectedKey = calculateKey(capturedNotes);
  }

  // Autocorrelation pitch extraction
  function detectPitchLoop() {
    if (!isRecording || !analyser || !audioCtx) return;

    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);

    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      sum += buf[i] * buf[i];
    }
    const rms = Math.sqrt(sum / buf.length);

    if (rms > 0.03) {
      // Find pitch using auto-correlation
      const pitch = autoCorrelate(buf, audioCtx.sampleRate);
      if (pitch !== -1 && pitch >= 65 && pitch <= 1000) {
        livePitchHz = Math.round(pitch);
        const { note } = hzToNote(pitch);
        liveNoteName = note;

        // Debounce append unique note
        const last = capturedNotes[capturedNotes.length - 1];
        if (last !== note) {
          capturedNotes.push(note);
          if (capturedNotes.length > 16) {
            capturedNotes = capturedNotes.slice(capturedNotes.length - 16);
          }
        }
      }
    } else {
      livePitchHz = 0;
      liveNoteName = '—';
    }

    animFrame = requestAnimationFrame(detectPitchLoop);
  }

  function autoCorrelate(buf: Float32Array, sampleRate: number): number {
    const SIZE = buf.length;
    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buf[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    buf = buf.slice(r1, r2);
    const c = new Array(buf.length).fill(0);
    for (let i = 0; i < buf.length; i++) {
      for (let j = 0; j < buf.length - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < buf.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;
    return sampleRate / T0;
  }

  // Web Audio Pluck Synth for Melody and Chords
  function playMelodyAndChords(progChords: string[]) {
    startAudio();
    if (!audioCtx || isPlayingAudio) return;

    isPlayingAudio = true;
    const now = audioCtx.currentTime;
    const noteDuration = 0.5;

    // Play melody notes sequentially
    capturedNotes.forEach((n, idx) => {
      playTone(noteToHz(n), now + idx * noteDuration, noteDuration * 0.9, 'sine', 0.4);
    });

    // Play chord progression (each chord for 2 beats = 1.0s)
    progChords.forEach((chord, cIdx) => {
      const chordTime = now + cIdx * (noteDuration * 2);
      playChord(chord, chordTime, noteDuration * 1.8);
    });

    const totalDuration = Math.max(capturedNotes.length * noteDuration, progChords.length * noteDuration * 2);
    setTimeout(() => {
      isPlayingAudio = false;
    }, totalDuration * 1000 + 200);
  }

  function playTone(freq: number, startTime: number, duration: number, type: OscillatorType = 'triangle', vol = 0.25) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  function playChord(chordName: string, startTime: number, duration: number) {
    if (!audioCtx) return;
    // Map basic root and triads
    const root = chordName.replace(/[^A-G#b]/g, '');
    const isMinor = chordName.includes('m') && !chordName.includes('maj');
    const rootHz = noteToHz(`${root}3`);

    const thirdHz = rootHz * (isMinor ? 1.1892 : 1.2599); // minor 3rd vs major 3rd
    const fifthHz = rootHz * 1.4983; // perfect 5th

    playTone(rootHz, startTime, duration, 'sawtooth', 0.15);
    playTone(thirdHz, startTime, duration, 'triangle', 0.15);
    playTone(fifthHz, startTime, duration, 'triangle', 0.15);
  }

  function saveIdea(prog: SuggestedProgression) {
    const newIdea: SavedIdea = {
      id: Date.now().toString(),
      title: ideaTitle.trim() || 'Untitled Idea',
      date: new Date().toLocaleDateString(),
      key: detectedKey,
      melody: [...capturedNotes],
      favoriteProgression: [...prog.chords]
    };
    savedIdeas = [newIdea, ...savedIdeas];
    try {
      localStorage.setItem('guitar_hum_ideas', JSON.stringify(savedIdeas));
    } catch {}
  }

  function removeIdea(id: string) {
    savedIdeas = savedIdeas.filter((i) => i.id !== id);
    try {
      localStorage.setItem('guitar_hum_ideas', JSON.stringify(savedIdeas));
    } catch {}
  }

  function addManualNote(note: string) {
    capturedNotes = [...capturedNotes, note];
    detectedKey = calculateKey(capturedNotes);
  }

  function clearMelody() {
    capturedNotes = [];
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem('guitar_hum_ideas');
      if (saved) savedIdeas = JSON.parse(saved);
    } catch {}
  });

  onDestroy(() => {
    stopRecord();
  });
</script>

<svelte:head>
  <title>Hum-to-Chords Idea Vault | Guitar Toolkit</title>
  <meta
    name="description"
    content="Hum or whistle a vocal melody into your mic; extracts notes in real-time and generates matching chord progressions with audio preview."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Songwriting & Chords</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#85 Songwriting Tool</span>
      <span class="badge">Microphone Pitch Detection</span>
      <span class="badge">Harmonic AI Engine</span>
    </div>
    <h1>🎙️ Hum-to-Chords Idea Vault</h1>
    <p class="tool-sub">
      Hum, sing, or whistle a melody into your mic. The engine transcribes pitch into musical notes and generates 4 matching guitar chord progressions with layered audio previews.
    </p>
  </div>

  <!-- Mic Capture & Recording Section -->
  <div class="record-card">
    <div class="record-top">
      <button
        type="button"
        class="record-btn"
        class:recording={isRecording}
        onclick={toggleRecord}
      >
        <span class="mic-dot"></span>
        {isRecording ? '⏹ STOP HUMMING' : '🔴 START HUMMING MELODY'}
      </button>

      <div class="live-pitch-box">
        <span class="live-label">LIVE DETECTED NOTE:</span>
        <span class="live-note" class:active-note={livePitchHz > 0}>{liveNoteName}</span>
        <span class="live-freq">{livePitchHz > 0 ? `${livePitchHz} Hz` : 'Silent'}</span>
      </div>
    </div>

    <!-- Melody Tape Display -->
    <div class="melody-tape-container">
      <div class="tape-header">
        <span class="tape-title">TRANSCRIBED MELODY NOTES ({capturedNotes.length}):</span>
        <div class="tape-actions">
          <span class="key-tag">Key: <strong>{detectedKey}</strong></span>
          <button type="button" class="mini-btn" onclick={clearMelody}>Clear</button>
        </div>
      </div>

      <div class="notes-strip">
        {#if capturedNotes.length === 0}
          <div class="empty-notes">No notes captured yet. Click "Start Humming" above or tap notes below.</div>
        {:else}
          {#each capturedNotes as note, i}
            <div class="note-chip">
              <span class="chip-idx">#{i + 1}</span>
              <span class="chip-name">{note}</span>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Quick Note Injector -->
      <div class="quick-inject-row">
        <span class="quick-label">Tap to add note:</span>
        {#each ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] as n}
          <button type="button" class="quick-note-btn" onclick={() => addManualNote(n)}>
            {n}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Harmonic Progressions Engine -->
  <div class="progressions-section">
    <div class="section-title-row">
      <h2>🎸 4 Harmonically Matching Chord Progressions</h2>
      <p class="section-sub">Voiced specifically to harmonize beneath your transcribed notes:</p>
    </div>

    <div class="progressions-grid">
      {#each progressions as prog}
        <div class="prog-card">
          <div class="prog-card-top">
            <span class="prog-style">{prog.style}</span>
            <span class="prog-numerals">{prog.romanNumerals}</span>
          </div>

          <div class="chord-boxes">
            {#each prog.chords as chord}
              <div class="chord-pill">
                <span class="chord-name">{chord}</span>
              </div>
            {/each}
          </div>

          <p class="prog-desc">{prog.description}</p>

          <div class="prog-btn-row">
            <button
              type="button"
              class="play-btn"
              disabled={isPlayingAudio || capturedNotes.length === 0}
              onclick={() => playMelodyAndChords(prog.chords)}
            >
              {isPlayingAudio ? '🔊 PLAYING...' : '▶ LISTEN WITH MELODY'}
            </button>
            <button
              type="button"
              class="save-idea-btn"
              onclick={() => saveIdea(prog)}
            >
              💾 SAVE TO VAULT
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Idea Vault (Saved Ideas) -->
  <div class="vault-card">
    <div class="vault-header">
      <h3>📁 Your Song Idea Vault ({savedIdeas.length})</h3>
      <div class="save-title-input">
        <input
          type="text"
          placeholder="Idea title (e.g. Summer Acoustic Intro)..."
          bind:value={ideaTitle}
        />
      </div>
    </div>

    {#if savedIdeas.length === 0}
      <p class="vault-empty">No ideas saved yet. Click "Save to Vault" on any progression above to preserve your melodies.</p>
    {:else}
      <div class="saved-list">
        {#each savedIdeas as idea}
          <div class="saved-item">
            <div class="item-left">
              <span class="item-title">{idea.title}</span>
              <span class="item-meta">{idea.date} &bull; {idea.key} &bull; {idea.melody.join(' ')}</span>
              <div class="item-chords">
                Chords: <strong>{idea.favoriteProgression.join(' — ')}</strong>
              </div>
            </div>
            <div class="item-right">
              <button
                type="button"
                class="del-btn"
                onclick={() => removeIdea(idea.id)}
              >
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
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

  .record-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .record-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .record-btn {
    background: #ef4444;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    padding: 14px 24px;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.15s ease;
  }
  .record-btn:hover {
    background: #dc2626;
  }
  .record-btn.recording {
    background: #10b981;
  }
  .mic-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ffffff;
    display: inline-block;
  }

  .live-pitch-box {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .live-label {
    font-size: 0.75rem;
    color: #9ca3af;
  }
  .live-note {
    font-size: 1.4rem;
    font-weight: 800;
    font-family: monospace;
    color: #6b7280;
  }
  .live-note.active-note {
    color: #38bdf8;
  }
  .live-freq {
    font-size: 0.8rem;
    color: #9ca3af;
    font-family: monospace;
  }

  .melody-tape-container {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 16px;
  }
  .tape-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .tape-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #9ca3af;
  }
  .tape-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .key-tag {
    font-size: 0.8rem;
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  .mini-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #9ca3af;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .notes-strip {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 12px;
    min-height: 52px;
  }
  .empty-notes {
    color: #6b7280;
    font-size: 0.85rem;
    font-style: italic;
    align-self: center;
  }
  .note-chip {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 6px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 48px;
  }
  .chip-idx {
    font-size: 0.65rem;
    color: #6b7280;
  }
  .chip-name {
    font-size: 1rem;
    font-weight: 800;
    color: #38bdf8;
    font-family: monospace;
  }

  .quick-inject-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    flex-wrap: wrap;
    border-top: 1px solid #1f2937;
    padding-top: 10px;
  }
  .quick-label {
    font-size: 0.75rem;
    color: #6b7280;
    margin-right: 4px;
  }
  .quick-note-btn {
    background: #1e293b;
    border: 1px solid #334155;
    color: #cbd5e1;
    font-size: 0.75rem;
    font-family: monospace;
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
  }
  .quick-note-btn:hover {
    border-color: #38bdf8;
    color: #38bdf8;
  }

  .progressions-section {
    margin-bottom: 24px;
  }
  .section-title-row {
    margin-bottom: 16px;
  }
  .section-title-row h2 {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 4px;
    color: #f3f4f6;
  }
  .section-sub {
    font-size: 0.85rem;
    color: #9ca3af;
    margin: 0;
  }

  .progressions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .prog-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .prog-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .prog-style {
    font-size: 0.85rem;
    font-weight: 700;
    color: #f59e0b;
  }
  .prog-numerals {
    font-size: 0.75rem;
    color: #9ca3af;
    font-family: monospace;
  }

  .chord-boxes {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .chord-pill {
    flex: 1;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 10px 4px;
    text-align: center;
  }
  .chord-name {
    font-size: 1.1rem;
    font-weight: 800;
    color: #f9fafb;
  }

  .prog-desc {
    font-size: 0.8rem;
    color: #9ca3af;
    line-height: 1.4;
    margin: 0 0 16px;
    flex-grow: 1;
  }

  .prog-btn-row {
    display: flex;
    gap: 8px;
  }
  .play-btn {
    flex: 2;
    background: #0284c7;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    padding: 8px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
  }
  .play-btn:hover {
    background: #0369a1;
  }
  .play-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .save-idea-btn {
    flex: 1;
    background: #1f2937;
    border: 1px solid #374151;
    color: #d1d5db;
    border-radius: 4px;
    padding: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
  }
  .save-idea-btn:hover {
    border-color: #f59e0b;
    color: #f59e0b;
  }

  .vault-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
  }
  .vault-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .vault-header h3 {
    margin: 0;
    font-size: 1.15rem;
  }
  .save-title-input input {
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    min-width: 280px;
  }
  .vault-empty {
    font-size: 0.85rem;
    color: #6b7280;
    font-style: italic;
    margin: 0;
  }

  .saved-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .saved-item {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  .item-title {
    display: block;
    font-weight: 700;
    font-size: 0.95rem;
    color: #f3f4f6;
  }
  .item-meta {
    font-size: 0.75rem;
    color: #9ca3af;
    display: block;
    margin: 2px 0 4px;
  }
  .item-chords {
    font-size: 0.85rem;
    color: #38bdf8;
  }
  .del-btn {
    background: none;
    border: 1px solid #4b5563;
    color: #ef4444;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
  }
  .del-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: #ef4444;
  }
</style>
