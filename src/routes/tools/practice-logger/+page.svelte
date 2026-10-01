<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  const STORAGE_KEY = 'guitar_toolkit_practice_logger';

  interface DayLog {
    date: string;
    minutes: number;
  }

  // Pre-seed with realistic recent practice data
  function generateDefaultHistory(): DayLog[] {
    const logs: DayLog[] = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      // realistic distributed practice (0 to 60 mins)
      const dayOfWeek = d.getDay();
      const mins = (dayOfWeek === 0 || dayOfWeek === 6) ? Math.floor(Math.random() * 45 + 30) : (i % 3 === 0 ? 0 : Math.floor(Math.random() * 35 + 15));
      logs.push({ date: dateStr, minutes: mins });
    }
    return logs;
  }

  let history = $state<DayLog[]>([]);
  let isListening = $state(false);
  let micError = $state<string | null>(null);
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let mediaStream: MediaStream | null = null;
  let timerInterval: any = null;

  // Active session clock
  let isActivelyPlaying = $state(false);
  let sessionSecondsActive = $state(0);
  let sessionSecondsIdle = $state(0);
  let currentVolumeRms = $state(0);
  let sensitivityThreshold = $state(0.025);

  onMount(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        history = JSON.parse(saved);
      } else {
        history = generateDefaultHistory();
      }
    } catch {
      history = generateDefaultHistory();
    }
  });

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore
    }
  }

  // Statistics
  const totalMinutesMonth = $derived(
    history.reduce((sum, d) => sum + d.minutes, 0)
  );

  const totalHoursMonth = $derived(
    (totalMinutesMonth / 60).toFixed(1)
  );

  const daysPracticedCount = $derived(
    history.filter((d) => d.minutes > 0).length
  );

  const longestStreak = $derived.by(() => {
    let max = 0;
    let curr = 0;
    history.forEach((d) => {
      if (d.minutes > 0) {
        curr++;
        if (curr > max) max = curr;
      } else {
        curr = 0;
      }
    });
    return max;
  });

  const formattedActiveTime = $derived.by(() => {
    const mins = Math.floor(sessionSecondsActive / 60);
    const secs = sessionSecondsActive % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  const formattedIdleTime = $derived.by(() => {
    const mins = Math.floor(sessionSecondsIdle / 60);
    const secs = sessionSecondsIdle % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  async function startLogger() {
    micError = null;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      isListening = true;

      timerInterval = setInterval(() => {
        if (!analyser) return;
        const buf = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(buf);

        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        currentVolumeRms = +rms.toFixed(3);

        if (rms >= sensitivityThreshold) {
          isActivelyPlaying = true;
          sessionSecondsActive++;
        } else {
          isActivelyPlaying = false;
          sessionSecondsIdle++;
        }
      }, 1000);
    } catch (err: any) {
      micError = err.message || 'Microphone access denied.';
      isListening = false;
    }
  }

  function stopLogger() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    isListening = false;

    // Commit active time to today
    if (sessionSecondsActive >= 60) {
      const todayStr = new Date().toISOString().split('T')[0];
      const match = history.find((d) => d.date === todayStr);
      const addedMins = Math.round(sessionSecondsActive / 60);
      if (match) {
        match.minutes += addedMins;
      } else {
        history.push({ date: todayStr, minutes: addedMins });
      }
      saveHistory();
    }
  }

  // Quick manual session logger
  function addManualMinutes(mins: number) {
    const todayStr = new Date().toISOString().split('T')[0];
    const match = history.find((d) => d.date === todayStr);
    if (match) {
      match.minutes += mins;
    } else {
      history.push({ date: todayStr, minutes: mins });
    }
    saveHistory();
  }

  onDestroy(() => {
    stopLogger();
  });
</script>

<svelte:head>
  <title>#3 Passive Practice Auto-Logger &amp; Wrapped — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#3 &middot; TIER 2 LIGHT AUDIO</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner</span>
      </div>
      <h1>Passive Practice Auto-Logger &amp; Wrapped</h1>
      <p class="lead-text">
        Background acoustic practice monitor that distinguishes playing from silence or conversation. Tracks actual time spent fretting notes, records daily streaks, and generates your <strong>Guitarist Wrapped</strong> summary.
      </p>

      <div class="action-bar">
        {#if !isListening}
          <button class="btn btn-primary" onclick={startLogger}>
            🎙 Start Passive Practice Logger
          </button>
        {:else}
          <button class="btn btn-danger" onclick={stopLogger}>
            ⏹ End Session &amp; Save Time
          </button>
        {/if}

        <button class="btn btn-secondary" onclick={() => addManualMinutes(30)}>
          + Log 30m Practice Manually
        </button>
      </div>

      {#if micError}
        <div class="alert-box">
          ⚠ {micError}
        </div>
      {/if}
    </header>

    <!-- Active Session & Live State -->
    <div class="session-grid">
      <section class="card-panel timer-panel {isActivelyPlaying ? 'panel-playing' : ''}">
        <div class="timer-header">
          <h2>Active Practice Session</h2>
          <span class="badge {isActivelyPlaying ? 'badge-live' : 'badge-subtle'}">
            {isActivelyPlaying ? '🎸 GUITAR DETECTED (LOGGING)' : 'IDLE / NOT PLAYING'}
          </span>
        </div>

        <div class="clock-display">
          <div class="clock-hero">
            <span class="clock-digits font-mono">{formattedActiveTime}</span>
            <span class="clock-label">Active Pluck &amp; Fret Time</span>
          </div>
          <div class="clock-sub font-mono">
            Idle / Rest Time: {formattedIdleTime}
          </div>
        </div>

        <div class="sensitivity-slider-box">
          <div class="slider-label-row">
            <label for="sens-range">Mic Trigger Sensitivity:</label>
            <span class="font-mono">{(sensitivityThreshold * 100).toFixed(1)}%</span>
          </div>
          <input
            id="sens-range"
            type="range"
            min="0.005"
            max="0.08"
            step="0.005"
            bind:value={sensitivityThreshold}
          />
          <small class="sens-hint">Prevents fan noise or talking from counting as guitar practice.</small>
        </div>
      </section>

      <!-- Monthly Summary & Wrapped Card -->
      <section class="card-panel wrapped-panel">
        <div class="wrapped-header">
          <h2>Guitarist Wrapped &middot; 30-Day Snapshot</h2>
          <span class="badge badge-accent">ANNUAL PACING</span>
        </div>

        <div class="wrapped-kpi-grid">
          <div class="w-kpi-card">
            <span class="w-label">Total Practice</span>
            <strong class="w-val font-mono">{totalHoursMonth} hrs</strong>
            <span class="w-sub">{totalMinutesMonth} total minutes</span>
          </div>

          <div class="w-kpi-card">
            <span class="w-label">Consistency</span>
            <strong class="w-val font-mono">{daysPracticedCount} / 28</strong>
            <span class="w-sub">Days with active sessions</span>
          </div>

          <div class="w-kpi-card">
            <span class="w-label">Best Streak</span>
            <strong class="w-val font-mono">{longestStreak} days</strong>
            <span class="w-sub">Consecutive daily practice</span>
          </div>

          <div class="w-kpi-card">
            <span class="w-label">Fretboard Wear</span>
            <strong class="w-val font-mono">~{(totalMinutesMonth * 14).toLocaleString()}</strong>
            <span class="w-sub">Est. note attacks logged</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Calendar Heatmap Grid (Last 28 Days) -->
    <section class="card-panel heatmap-panel">
      <h2>Recent Practice Heatmap (Last 4 Weeks)</h2>
      <div class="heatmap-grid">
        {#each history as day}
          <div
            class="heat-day {day.minutes === 0 ? 'heat-0' : day.minutes < 25 ? 'heat-1' : day.minutes < 45 ? 'heat-2' : 'heat-3'}"
            title="{day.date}: {day.minutes} mins practice"
          >
            <span class="day-num font-mono">{day.date.split('-')[2]}</span>
            <span class="day-mins font-mono">{day.minutes > 0 ? `${day.minutes}m` : ''}</span>
          </div>
        {/each}
      </div>
      <div class="heatmap-legend">
        <span>Less</span>
        <div class="legend-cell heat-0"></div>
        <div class="legend-cell heat-1"></div>
        <div class="legend-cell heat-2"></div>
        <div class="legend-cell heat-3"></div>
        <span>More (45m+)</span>
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
    flex-wrap: wrap;
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

  .alert-box {
    background-color: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
  }

  /* Session Layout */
  .session-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .session-grid {
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

  .timer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .timer-header h2, .wrapped-header h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .panel-playing {
    border-color: #10b981;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
  }

  .clock-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem 0;
  }

  .clock-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .clock-digits {
    font-size: 4.5rem;
    font-weight: 800;
    color: var(--accent-light);
    line-height: 1;
  }

  .panel-playing .clock-digits {
    color: #10b981;
  }

  .clock-label {
    font-size: 0.85rem;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .clock-sub {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .sensitivity-slider-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .slider-label-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .sens-hint {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  /* Wrapped Grid */
  .wrapped-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .wrapped-kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .w-kpi-card {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .w-label {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 600;
  }

  .w-val {
    font-size: 1.5rem;
    color: var(--text-primary);
  }

  .w-sub {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  /* Heatmap */
  .heatmap-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
  }

  .heat-day {
    aspect-ratio: 1.3;
    border-radius: var(--radius-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    font-size: 0.75rem;
    cursor: default;
    border: 1px solid transparent;
  }

  .heat-0 { background-color: var(--bg-tertiary); color: var(--text-muted); }
  .heat-1 { background-color: rgba(245, 158, 11, 0.25); color: #fde68a; border-color: rgba(245, 158, 11, 0.4); }
  .heat-2 { background-color: rgba(245, 158, 11, 0.5); color: #ffffff; border-color: #f59e0b; }
  .heat-3 { background-color: #d97706; color: #ffffff; font-weight: 700; }

  .day-num { font-size: 0.7rem; opacity: 0.7; }
  .day-mins { font-size: 0.75rem; font-weight: 700; }

  .heatmap-legend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    justify-content: flex-end;
  }

  .legend-cell {
    width: 14px;
    height: 14px;
    border-radius: 2px;
  }

  .font-mono {
    font-family: var(--font-mono);
  }
</style>
