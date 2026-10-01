<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface HitRecord {
    beatIndex: number;
    targetTime: number;
    hitTime: number;
    offsetMs: number; // negative = rushed/ahead, positive = dragged/behind
  }

  let audioCtx: AudioContext | null = null;
  let micStream: MediaStream | null = null;
  let analyser: AnalyserNode | null = null;
  let isSessionActive = $state(false);

  // Settings
  let bpm = $state(96);
  let grooveTarget = $state<'straight' | 'laidback' | 'ahead'>('straight');
  let barsToRecord = $state(4); // 4 bars = 16 beats

  // Real-time tracking
  let hits = $state<HitRecord[]>([]);
  let currentBeat = $state(0);
  let nextBeatTime = 0;
  let timerId: number | null = null;
  let animId: number | null = null;
  let lastTransientTime = 0;
  let prevRms = 0;

  // Analysis Metrics
  let pocketScore = $derived(() => {
    if (hits.length < 4) return 0;
    // Calculate standard deviation of offsets
    const offsets = hits.map((h) => h.offsetMs);
    const mean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    const variance = offsets.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / offsets.length;
    const stdDev = Math.sqrt(variance);

    // Score from 100 down to 0 based on jitter
    const score = Math.max(0, Math.min(100, Math.round(100 - stdDev * 1.5)));
    return score;
  });

  let averageBiasMs = $derived(() => {
    if (hits.length === 0) return 0;
    const sum = hits.reduce((acc, h) => acc + h.offsetMs, 0);
    return Math.round((sum / hits.length) * 10) / 10;
  });

  let grooveClassification = $derived(() => {
    if (hits.length < 4) return 'Awaiting rhythm input...';
    const bias = averageBiasMs();
    const score = pocketScore();

    if (score > 85 && Math.abs(bias) < 8) return '🏆 In The Cut (Master Pocket)';
    if (bias > 12 && score > 75) return '🕶️ Deep Laid-Back Pocket (Neo-Soul / D\'Angelo)';
    if (bias < -12 && score > 75) return '⚡ Driving Ahead (Energetic Punk / Funk)';
    if (score < 50) return '⚠️ Erratic Jitter (Inconsistent subdivisions)';
    if (bias > 15) return '🐢 Dragging noticeably behind the pulse';
    if (bias < -15) return '🏃 Rushing ahead of the beat';
    return 'Solid Rhythm Section Pocket';
  });

  function startAudio() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  async function toggleSession() {
    if (isSessionActive) {
      stopSession();
    } else {
      await startSession();
    }
  }

  async function startSession() {
    startAudio();
    if (!audioCtx) return;

    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });

      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      isSessionActive = true;
      hits = [];
      currentBeat = 0;
      nextBeatTime = audioCtx.currentTime + 0.2;

      scheduleMetronome();
      listenLoop();
    } catch (err) {
      console.error('Microphone error', err);
      alert('Microphone access is required to analyze guitar transient timing.');
    }
  }

  function stopSession() {
    isSessionActive = false;
    if (timerId) clearTimeout(timerId);
    if (animId) cancelAnimationFrame(animId);
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
  }

  function scheduleMetronome() {
    if (!isSessionActive || !audioCtx) return;
    const secPerBeat = 60.0 / bpm;

    while (nextBeatTime < audioCtx.currentTime + 0.1) {
      playClick(currentBeat % 4 === 0, nextBeatTime);
      currentBeat++;
      nextBeatTime += secPerBeat;
    }

    timerId = window.setTimeout(scheduleMetronome, 25);
  }

  function playClick(accent: boolean, time: number) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(accent ? 1100 : 750, time);
    osc.frequency.exponentialRampToValueAtTime(accent ? 550 : 375, time + 0.03);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.05);
  }

  function listenLoop() {
    if (!isSessionActive || !analyser || !audioCtx) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    const now = audioCtx.currentTime;

    if (rms > 0.04 && rms > prevRms * 1.8 && now - lastTransientTime > 0.15) {
      lastTransientTime = now;
      handleHit(now);
    }
    prevRms = rms;

    animId = requestAnimationFrame(listenLoop);
  }

  function handleHit(hitTime: number) {
    if (!audioCtx) return;
    const secPerBeat = 60.0 / bpm;

    // Find nearest beat
    const timeSinceLast = hitTime - (nextBeatTime - secPerBeat);
    const offsetSec = timeSinceLast > secPerBeat / 2 ? timeSinceLast - secPerBeat : timeSinceLast;
    const offsetMs = Math.round(offsetSec * 1000);

    // Target ideal offset for selected groove feel
    let targetOffset = 0;
    if (grooveTarget === 'laidback') targetOffset = 25; // +25ms behind
    if (grooveTarget === 'ahead') targetOffset = -18; // -18ms ahead

    const adjustedOffset = offsetMs - targetOffset;

    hits = [
      ...hits,
      {
        beatIndex: currentBeat,
        targetTime: hitTime - offsetSec,
        hitTime,
        offsetMs: adjustedOffset
      }
    ];

    if (hits.length > 32) {
      hits = hits.slice(hits.length - 32);
    }
  }

  function simulateDemoHits() {
    // Generates simulated hits for testing without a microphone
    hits = [
      { beatIndex: 1, targetTime: 1, hitTime: 1.004, offsetMs: 4 },
      { beatIndex: 2, targetTime: 2, hitTime: 1.996, offsetMs: -4 },
      { beatIndex: 3, targetTime: 3, hitTime: 3.008, offsetMs: 8 },
      { beatIndex: 4, targetTime: 4, hitTime: 4.002, offsetMs: 2 },
      { beatIndex: 5, targetTime: 5, hitTime: 5.012, offsetMs: 12 },
      { beatIndex: 6, targetTime: 6, hitTime: 5.998, offsetMs: -2 },
      { beatIndex: 7, targetTime: 7, hitTime: 7.006, offsetMs: 6 },
      { beatIndex: 8, targetTime: 8, hitTime: 8.001, offsetMs: 1 }
    ];
  }

  onDestroy(() => {
    stopSession();
  });
</script>

<svelte:head>
  <title>Pocket & Groove Scoring Engine | Guitar Toolkit</title>
  <meta
    name="description"
    content="Measure guitar rhythm micro-timing jitter (ahead vs behind the beat) with quantitative pocket scoring and groove feel classification."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Practice & Timing</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#53 Rhythm Tool</span>
      <span class="badge">Micro-Timing Jitter</span>
      <span class="badge">Groove Feel Analysis</span>
    </div>
    <h1>🥁 Pocket & Groove Scoring Engine</h1>
    <p class="tool-sub">
      Great rhythm playing isn't robotic perfection: it's consistent pocket. Measure your micro-timing variations (ahead vs. behind the beat) and analyze your groove feel in milliseconds.
    </p>
  </div>

  <!-- Session Control Bar -->
  <div class="control-box">
    <div class="main-actions">
      <button
        type="button"
        class="session-btn"
        class:stop={isSessionActive}
        onclick={toggleSession}
      >
        {isSessionActive ? '⏹ STOP GROOVE SESSION' : '▶ START GROOVE TRACKER'}
      </button>

      <button type="button" class="demo-btn" onclick={simulateDemoHits}>
        Load Sample Hits
      </button>
    </div>

    <div class="settings-strip">
      <div class="setting-item">
        <label for="groove-bpm">TEMPO: <strong>{bpm} BPM</strong></label>
        <input id="groove-bpm" type="range" min="60" max="160" bind:value={bpm} disabled={isSessionActive} />
      </div>

      <div class="setting-item">
        <label for="feel-select">INTENDED GROOVE FEEL:</label>
        <select id="feel-select" bind:value={grooveTarget}>
          <option value="straight">Straight Pocket (&plusmn;0 ms grid)</option>
          <option value="laidback">Laid-Back / Neo-Soul (+25 ms behind)</option>
          <option value="ahead">Driving Ahead / Funk (-18 ms push)</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Big Groove Score & Classification Card -->
  <div class="score-card">
    <div class="score-top">
      <div class="score-circle">
        <span class="score-num">{pocketScore()}</span>
        <span class="score-sub">POCKET INDEX</span>
      </div>

      <div class="classification-info">
        <span class="class-label">GROOVE CLASSIFICATION:</span>
        <h2 class="class-title">{grooveClassification()}</h2>
        <div class="bias-stat">
          Average Timing Bias:
          <strong>
            {averageBiasMs() > 0 ? `+${averageBiasMs()} ms (Behind Beat)` : `${averageBiasMs()} ms (Ahead of Beat)`}
          </strong>
        </div>
      </div>
    </div>
  </div>

  <!-- Micro-Timing Scatterplot & Jitter Visualizer -->
  <div class="visualizer-card">
    <div class="vis-header">
      <h3>📈 Micro-Timing Deviation Timeline ({hits.length} Hits Recorded)</h3>
      <span class="vis-sub">Zero line is target pocket &bull; Left is rushed (&minus;ms) &bull; Right is dragged (+ms)</span>
    </div>

    <!-- Timeline Scatter Canvas / SVG -->
    <div class="scatter-box">
      <svg viewBox="0 0 800 240" class="scatter-svg">
        <rect width="800" height="240" fill="#0d1117" rx="8" />

        <!-- Target Center Zero Line (Green) -->
        <line x1="400" y1="20" x2="400" y2="210" stroke="#10b981" stroke-width="2" stroke-dasharray="4,4" />
        <text x="400" y="230" fill="#10b981" font-size="11" text-anchor="middle" font-weight="bold">TARGET POCKET (0 ms)</text>

        <!-- Left Rushed Grid Lines -->
        <line x1="250" y1="20" x2="250" y2="210" stroke="#374151" stroke-width="1" />
        <text x="250" y="230" fill="#9ca3af" font-size="10" text-anchor="middle">-25 ms</text>

        <line x1="100" y1="20" x2="100" y2="210" stroke="#ef4444" stroke-width="1" stroke-dasharray="2,2" />
        <text x="100" y="230" fill="#ef4444" font-size="10" text-anchor="middle">-50 ms (RUSH)</text>

        <!-- Right Dragged Grid Lines -->
        <line x1="550" y1="20" x2="550" y2="210" stroke="#374151" stroke-width="1" />
        <text x="550" y="230" fill="#9ca3af" font-size="10" text-anchor="middle">+25 ms</text>

        <line x1="700" y1="20" x2="700" y2="210" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2,2" />
        <text x="700" y="230" fill="#f59e0b" font-size="10" text-anchor="middle">+50 ms (DRAG)</text>

        <!-- Hit Dots -->
        {#if hits.length === 0}
          <text x="400" y="120" fill="#6b7280" font-size="14" text-anchor="middle">Play guitar notes to populate micro-timing scatter</text>
        {:else}
          {#each hits as hit, idx}
            <!-- X position: 400 + hit.offsetMs * 6 (scaled) -->
            <!-- Y position: 30 + (idx * 5) -->
            <circle
              cx={Math.max(20, Math.min(780, 400 + hit.offsetMs * 6))}
              cy={30 + (idx % 28) * 6}
              r="6"
              fill={Math.abs(hit.offsetMs) < 10 ? '#10b981' : hit.offsetMs > 0 ? '#f59e0b' : '#ef4444'}
              opacity="0.85"
            />
          {/each}
        {/if}
      </svg>
    </div>
  </div>

  <!-- Groove Physics Guide -->
  <div class="guide-card">
    <h3>💡 The Physics of Guitar Groove</h3>
    <div class="guide-grid">
      <div class="guide-box">
        <h4>1. Human Micro-Timing</h4>
        <p>Even legendary drummers like Bernard Purdie or Questlove deviate by &plusmn;10 to &plusmn;20 milliseconds. The secret of a legendary groove is not staying at 0.00ms, but maintaining <strong>ultra-consistent variance</strong>.</p>
      </div>

      <div class="guide-box">
        <h4>2. Behind vs Ahead Feel</h4>
        <p>Funk rhythm (Nile Rodgers) sits slightly ahead of the beat (&minus;10ms) to create dancing propulsion. Neo-soul and reggae guitar skank sits behind (+20ms) to create heavy head-bobbing relaxation.</p>
      </div>
    </div>
  </div>
</div>

<style>
  .tool-container {
    max-width: 950px;
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
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border-color: rgba(16, 185, 129, 0.4);
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

  .control-box {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .main-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  .session-btn {
    flex: 3;
    background: #10b981;
    color: #064e3b;
    border: none;
    font-weight: 800;
    font-size: 1rem;
    padding: 12px 20px;
    border-radius: 6px;
    cursor: pointer;
  }
  .session-btn:hover {
    background: #34d399;
  }
  .session-btn.stop {
    background: #ef4444;
    color: #ffffff;
  }
  .demo-btn {
    flex: 1;
    background: #1f2937;
    border: 1px solid #374151;
    color: #9ca3af;
    font-weight: 600;
    padding: 12px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
  }
  .demo-btn:hover {
    color: #38bdf8;
    border-color: #38bdf8;
  }

  .settings-strip {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 640px) {
    .settings-strip {
      grid-template-columns: 1fr;
    }
  }
  .setting-item label {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-bottom: 6px;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #10b981;
  }
  select {
    width: 100%;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .score-card {
    background: #111827;
    border: 2px solid #1f2937;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }
  .score-top {
    display: flex;
    align-items: center;
    gap: 28px;
    flex-wrap: wrap;
  }
  .score-circle {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, #1f2937 80%);
    border: 3px solid #10b981;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: 0 0 24px rgba(16, 185, 129, 0.2);
  }
  .score-num {
    font-size: 2.4rem;
    font-weight: 800;
    color: #10b981;
    line-height: 1;
  }
  .score-sub {
    font-size: 0.6rem;
    font-weight: 800;
    color: #9ca3af;
    letter-spacing: 0.05em;
    margin-top: 4px;
  }

  .classification-info {
    flex: 1;
  }
  .class-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 700;
    display: block;
    margin-bottom: 4px;
  }
  .class-title {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 8px;
    color: #f9fafb;
  }
  .bias-stat {
    font-size: 0.9rem;
    color: #9ca3af;
  }
  .bias-stat strong {
    color: #38bdf8;
  }

  .visualizer-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .vis-header {
    margin-bottom: 14px;
  }
  .vis-header h3 {
    margin: 0 0 4px;
    font-size: 1.1rem;
    color: #f3f4f6;
  }
  .vis-sub {
    font-size: 0.75rem;
    color: #9ca3af;
  }
  .scatter-box {
    width: 100%;
    overflow-x: auto;
  }
  .scatter-svg {
    width: 100%;
    min-width: 650px;
    height: auto;
    display: block;
  }

  .guide-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
  }
  .guide-card h3 {
    margin: 0 0 16px;
    font-size: 1.15rem;
  }
  .guide-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 640px) {
    .guide-grid {
      grid-template-columns: 1fr;
    }
  }
  .guide-box {
    background: #0d1117;
    border: 1px solid #1f2937;
    padding: 14px;
    border-radius: 6px;
  }
  .guide-box h4 {
    margin: 0 0 6px;
    color: #38bdf8;
    font-size: 0.95rem;
  }
  .guide-box p {
    margin: 0;
    font-size: 0.85rem;
    color: #9ca3af;
    line-height: 1.5;
  }
</style>
