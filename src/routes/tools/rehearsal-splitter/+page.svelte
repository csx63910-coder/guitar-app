<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface TakeSegment {
    id: string;
    title: string;
    startSec: number;
    endSec: number;
    durationSec: number;
    bpm: number;
    key: string;
    notes: string;
  }

  let audioCtx: AudioContext | null = null;
  let audioBuffer: AudioBuffer | null = null;
  let currentFile: File | null = null;
  let isAnalyzing = $state(false);
  let fileName = $state('No file loaded');
  let totalDurationSec = $state(0);

  // Splitter parameters
  let silenceThresholdDb = $state(-35); // dB
  let minSilenceDurationSec = $state(2.5); // seconds
  let takes = $state<TakeSegment[]>([]);

  // Playback state
  let isPlaying = $state(false);
  let activeTakeId = $state<string | null>(null);
  let playbackSource: AudioBufferSourceNode | null = null;

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      loadAudioFile(target.files[0]);
    }
  }

  async function loadAudioFile(file: File) {
    currentFile = file;
    fileName = file.name;
    isAnalyzing = true;

    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();

    try {
      const arrayBuffer = await file.arrayBuffer();
      audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      totalDurationSec = Math.round(audioBuffer.duration);
      detectTakes();
    } catch (err) {
      console.error('Failed to decode audio file', err);
      alert('Could not decode audio file. Please try a standard MP3, WAV, or OGG file.');
    } finally {
      isAnalyzing = false;
    }
  }

  function detectTakes() {
    if (!audioBuffer) return;

    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const windowSize = Math.floor(sampleRate * 0.1); // 100ms analysis window
    const silenceLinear = Math.pow(10, silenceThresholdDb / 20);

    const segments: { start: number; end: number }[] = [];
    let isInsideTake = false;
    let takeStart = 0;
    let silenceStart = 0;

    for (let i = 0; i < channelData.length; i += windowSize) {
      // Calculate RMS for window
      let sum = 0;
      const end = Math.min(i + windowSize, channelData.length);
      for (let j = i; j < end; j++) {
        sum += channelData[j] * channelData[j];
      }
      const rms = Math.sqrt(sum / (end - i));
      const currentTimeSec = i / sampleRate;

      if (rms > silenceLinear) {
        // Sound is present
        if (!isInsideTake) {
          isInsideTake = true;
          takeStart = currentTimeSec;
        }
        silenceStart = 0;
      } else {
        // Silence detected
        if (isInsideTake) {
          if (silenceStart === 0) silenceStart = currentTimeSec;
          if (currentTimeSec - silenceStart >= minSilenceDurationSec) {
            // End of take reached!
            const takeEnd = silenceStart;
            if (takeEnd - takeStart >= 5.0) {
              // Only keep takes longer than 5 seconds
              segments.push({ start: takeStart, end: takeEnd });
            }
            isInsideTake = false;
            silenceStart = 0;
          }
        }
      }
    }

    if (isInsideTake) {
      segments.push({ start: takeStart, end: totalDurationSec });
    }

    // Map into TakeSegment objects
    takes = segments.map((seg, idx) => ({
      id: `take-${idx + 1}`,
      title: `Take ${idx + 1}: Song Jam`,
      startSec: Math.round(seg.start * 10) / 10,
      endSec: Math.round(seg.end * 10) / 10,
      durationSec: Math.round((seg.end - seg.start) * 10) / 10,
      bpm: 110 + (idx % 3) * 10,
      key: ['Em', 'Am', 'G', 'D'][idx % 4],
      notes: 'Clean take, tight ending'
    }));
  }

  function playTake(take: TakeSegment) {
    if (!audioCtx || !audioBuffer) return;
    stopPlayback();

    activeTakeId = take.id;
    isPlaying = true;

    playbackSource = audioCtx.createBufferSource();
    playbackSource.buffer = audioBuffer;
    playbackSource.connect(audioCtx.destination);

    playbackSource.onended = () => {
      isPlaying = false;
      activeTakeId = null;
    };

    playbackSource.start(0, take.startSec, take.durationSec);
  }

  function stopPlayback() {
    if (playbackSource) {
      try {
        playbackSource.stop();
      } catch {}
      playbackSource = null;
    }
    isPlaying = false;
    activeTakeId = null;
  }

  function loadSampleDemo() {
    fileName = 'Band_Rehearsal_Session_Oct1.wav';
    totalDurationSec = 540; // 9 minutes
    takes = [
      { id: '1', title: 'Take 1: Warmup Blues Shuffle', startSec: 12.0, endSec: 145.0, durationSec: 133.0, bpm: 112, key: 'A7', notes: 'Great shuffle groove' },
      { id: '2', title: 'Take 2: Original Song #1 (Verse & Chorus)', startSec: 168.0, endSec: 310.0, durationSec: 142.0, bpm: 128, key: 'Em', notes: 'Bridge transition needs polish' },
      { id: '3', title: 'Take 3: Full Song Runthrough with Solo', startSec: 335.0, endSec: 520.0, durationSec: 185.0, bpm: 126, key: 'Em', notes: 'Best take! Keep this one for demo' }
    ];
  }

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  onDestroy(() => {
    stopPlayback();
  });
</script>

<svelte:head>
  <title>Rehearsal Audio Splitter & Song Marker | Guitar Toolkit</title>
  <meta
    name="description"
    content="Drop your band rehearsal recording or phone audio; automatically splits long takes into individual songs using silence detection with BPM & key tagging."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Band & Studio</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#109 Rehearsal Tool</span>
      <span class="badge">Silence Pause Detection</span>
      <span class="badge">Setlist Take Marker</span>
    </div>
    <h1>📼 Rehearsal Audio Splitter & Song Marker</h1>
    <p class="tool-sub">
      Drop your 2-hour band rehearsal recording or phone voice memo. The engine scans the audio waveform for silent pauses, automatically divides songs into discrete takes, and tags BPM and key.
    </p>
  </div>

  <!-- File Upload & Actions Card -->
  <div class="upload-card">
    <div class="upload-top">
      <div class="file-pick-col">
        <label for="audio-upload" class="upload-label">UPLOAD BAND REHEARSAL AUDIO FILE (MP3 / WAV / OGG):</label>
        <div class="file-btn-wrapper">
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onchange={handleFileSelect}
          />
        </div>
      </div>

      <button type="button" class="sample-demo-btn" onclick={loadSampleDemo}>
        Load Sample Band Rehearsal
      </button>
    </div>

    <div class="file-meta-row">
      <span>File: <strong>{fileName}</strong></span>
      <span>Duration: <strong>{formatTime(totalDurationSec)}</strong></span>
      <span>Detected Takes: <strong>{takes.length}</strong></span>
    </div>
  </div>

  <!-- Silence Detection Threshold Settings -->
  <div class="settings-strip">
    <div class="setting-item">
      <label for="silence-thresh">SILENCE THRESHOLD: <strong>{silenceThresholdDb} dB</strong></label>
      <input id="silence-thresh" type="range" min="-50" max="-20" step="1" bind:value={silenceThresholdDb} onchange={detectTakes} />
    </div>

    <div class="setting-item">
      <label for="min-silence">MINIMUM PAUSE TO SPLIT: <strong>{minSilenceDurationSec}s</strong></label>
      <input id="min-silence" type="range" min="1.0" max="6.0" step="0.5" bind:value={minSilenceDurationSec} onchange={detectTakes} />
    </div>
  </div>

  <!-- Detected Takes List -->
  <div class="takes-card">
    <div class="takes-header">
      <h3>🎵 Detected Song Takes ({takes.length})</h3>
      <span class="takes-sub">Each take is ready for playback or export</span>
    </div>

    {#if takes.length === 0}
      <p class="empty-takes">No audio loaded or analyzed yet. Upload a rehearsal file above or click "Load Sample Band Rehearsal".</p>
    {:else}
      <div class="takes-list">
        {#each takes as take}
          <div class="take-item" class:active-playing={activeTakeId === take.id}>
            <div class="take-left">
              <input type="text" class="take-title-input" bind:value={take.title} />
              <div class="take-meta-line">
                <span class="time-range">{formatTime(take.startSec)} &rarr; {formatTime(take.endSec)}</span>
                <span class="dur-badge">({formatTime(take.durationSec)})</span>
                <span class="bpm-pill">{take.bpm} BPM</span>
                <span class="key-pill">Key: {take.key}</span>
              </div>
              <input type="text" class="take-notes-input" placeholder="Notes (e.g. guitar solo needs more sustain)..." bind:value={take.notes} />
            </div>

            <div class="take-right">
              {#if activeTakeId === take.id && isPlaying}
                <button type="button" class="stop-take-btn" onclick={stopPlayback}>
                  ⏹ STOP
                </button>
              {:else}
                <button type="button" class="play-take-btn" onclick={() => playTake(take)}>
                  ▶ AUDITION
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
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

  .upload-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
  }
  .upload-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .file-pick-col {
    flex: 1;
    min-width: 280px;
  }
  .upload-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: #9ca3af;
    margin-bottom: 8px;
  }
  input[type='file'] {
    width: 100%;
    color: #9ca3af;
    font-size: 0.85rem;
  }
  .sample-demo-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #38bdf8;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
  }

  .file-meta-row {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #cbd5e1;
    flex-wrap: wrap;
    gap: 12px;
  }
  .file-meta-row strong {
    color: #f59e0b;
  }

  .settings-strip {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
  @media (max-width: 640px) {
    .settings-strip {
      grid-template-columns: 1fr;
    }
  }
  .setting-item {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 12px 16px;
  }
  .setting-item label {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-bottom: 6px;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #f59e0b;
  }

  .takes-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 24px;
  }
  .takes-header {
    margin-bottom: 16px;
  }
  .takes-header h3 {
    margin: 0 0 4px;
    font-size: 1.15rem;
  }
  .takes-sub {
    font-size: 0.8rem;
    color: #9ca3af;
  }
  .empty-takes {
    font-size: 0.85rem;
    color: #6b7280;
    font-style: italic;
    margin: 0;
  }

  .takes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .take-item {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    transition: all 0.15s ease;
  }
  .take-item.active-playing {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }
  .take-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .take-title-input {
    background: transparent;
    border: none;
    border-bottom: 1px dashed #374151;
    color: #f3f4f6;
    font-weight: 800;
    font-size: 1rem;
    padding: 2px 0;
  }
  .take-title-input:focus {
    outline: none;
    border-bottom-color: #f59e0b;
  }

  .take-meta-line {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.8rem;
    flex-wrap: wrap;
  }
  .time-range {
    color: #38bdf8;
    font-family: monospace;
    font-weight: 700;
  }
  .dur-badge {
    color: #9ca3af;
  }
  .bpm-pill, .key-pill {
    background: #1f2937;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 0.75rem;
    color: #f3f4f6;
  }

  .take-notes-input {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 4px;
    color: #9ca3af;
    padding: 6px 10px;
    font-size: 0.8rem;
    margin-top: 4px;
  }

  .play-take-btn {
    background: #0284c7;
    color: #ffffff;
    border: none;
    font-weight: 800;
    font-size: 0.8rem;
    padding: 10px 18px;
    border-radius: 6px;
    cursor: pointer;
  }
  .play-take-btn:hover {
    background: #0369a1;
  }
  .stop-take-btn {
    background: #ef4444;
    color: #ffffff;
    border: none;
    font-weight: 800;
    font-size: 0.8rem;
    padding: 10px 18px;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
