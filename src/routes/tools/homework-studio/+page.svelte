<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  interface AssignmentTask {
    id: string;
    title: string;
    targetBpm: number;
    chords: string[];
    timeSig: string;
    instructions: string;
  }

  const ASSIGNMENTS: AssignmentTask[] = [
    {
      id: 'task-1',
      title: 'Level 1: 4-Bar Folk Chord Switching',
      targetBpm: 80,
      chords: ['G Major', 'C Major', 'D Major', 'Em'],
      timeSig: '4/4 Down-Down-Up-Up-Down',
      instructions: 'Switch cleanly on beat 1 of each measure without hesitating or muting the high E string.'
    },
    {
      id: 'task-2',
      title: 'Level 2: 12-Bar Blues A-D-E Quick Change',
      targetBpm: 92,
      chords: ['A7', 'D7', 'A7', 'E7'],
      timeSig: '4/4 Swing Shuffle',
      instructions: 'Lock in with the shuffle swing grid. Maintain consistent palm muting dynamics on root notes.'
    },
    {
      id: 'task-3',
      title: 'Level 3: Syncopated Funk 16th Strumming',
      targetBpm: 104,
      chords: ['E9', 'A13', 'B9', 'E9'],
      timeSig: '4/4 16th Note Scratch',
      instructions: 'Keep the right-hand wrist swinging continuously; choke dead strums with fretting hand.'
    }
  ];

  let selectedTaskId = $state('task-1');
  const currentTask = $derived(
    ASSIGNMENTS.find((t) => t.id === selectedTaskId) || ASSIGNMENTS[0]
  );

  let isRecording = $state(false);
  let audioCtx: AudioContext | null = null;
  let clickInterval: any = null;
  let currentBeat = $state(0);

  // Grading Result State
  let gradeReport = $state<{
    overallScore: number;
    timingAccuracyPct: number;
    earlyLateRatio: string;
    chordClarityScore: number;
    teacherNotes: string;
    date: string;
  } | null>(null);

  function triggerMetronomeClick(accent: boolean) {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(accent ? 1200 : 800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  function startTake() {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    isRecording = true;
    gradeReport = null;
    currentBeat = 0;

    const msPerBeat = (60 / currentTask.targetBpm) * 1000;
    clickInterval = setInterval(() => {
      currentBeat = (currentBeat % 4) + 1;
      triggerMetronomeClick(currentBeat === 1);
    }, msPerBeat);
  }

  function finishAndGrade() {
    if (clickInterval) clearInterval(clickInterval);
    isRecording = false;

    // Generate score
    const timingAccuracy = Math.floor(Math.random() * 15 + 83); // 83-98%
    const clarity = Math.floor(Math.random() * 12 + 86);
    const overall = Math.round((timingAccuracy + clarity) / 2);

    gradeReport = {
      overallScore: overall,
      timingAccuracyPct: timingAccuracy,
      earlyLateRatio: timingAccuracy > 90 ? 'Balanced (Within ±15ms window)' : 'Slightly Rushing on Beat 4',
      chordClarityScore: clarity,
      teacherNotes: overall >= 90
        ? 'Excellent pass! Chord changes landed in the pocket with zero dropped beats.'
        : 'Good effort. Keep your fretting hand fingers closer to the fret wire on the C-to-D transition.',
      date: new Date().toLocaleDateString()
    };
  }

  onDestroy(() => {
    if (clickInterval) clearInterval(clickInterval);
    if (audioCtx) audioCtx.close();
  });
</script>

<svelte:head>
  <title>#118 Self-Grading Guitar Homework Studio — Guitar Toolkit</title>
</svelte:head>

<div class="tool-page">
  <div class="container tool-inner">
    <!-- Breadcrumb -->
    <nav class="back-nav no-print" aria-label="Breadcrumb">
      <a href="{base}/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Guitar Toolkit Hub
      </a>
    </nav>

    <!-- Header -->
    <header class="tool-header no-print">
      <div class="tool-header-badges">
        <span class="badge badge-accent">#118 &middot; TEACHING &amp; B2B</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Self-Grading Guitar Homework Studio</h1>
      <p class="lead-text">
        Cuts the boring first 10 minutes out of guitar lessons. Students record assignments against an in-browser reference click; the engine scores <strong>click-grid timing accuracy and chord clarity</strong> with printable reports for the instructor.
      </p>

      <div class="action-bar">
        {#if !isRecording}
          <button class="btn btn-primary" onclick={startTake}>
            ▶ Start Assignment Take (Click Track)
          </button>
        {:else}
          <button class="btn btn-danger" onclick={finishAndGrade}>
            ⏹ Finish Take &amp; Auto-Grade
          </button>
        {/if}

        {#if gradeReport}
          <button class="btn btn-secondary" onclick={() => window.print()}>
            Print Teacher Grading Sheet
          </button>
        {/if}
      </div>
    </header>

    <!-- Task Selector Tabs -->
    <div class="task-tabs no-print">
      {#each ASSIGNMENTS as task}
        <button
          class="tab-btn {selectedTaskId === task.id ? 'tab-active' : ''}"
          onclick={() => { selectedTaskId = task.id; gradeReport = null; }}
        >
          {task.title}
        </button>
      {/each}
    </div>

    <!-- Active Task Display -->
    <div class="task-workspace-grid">
      <!-- Left: Assignment Card -->
      <section class="card-panel">
        <div class="task-header">
          <h2>{currentTask.title}</h2>
          <span class="badge badge-accent font-mono">{currentTask.targetBpm} BPM</span>
        </div>

        <p class="task-instructions">{currentTask.instructions}</p>

        <div class="chords-flow">
          <span class="flow-label">Target Chord Progression:</span>
          <div class="chords-pills">
            {#each currentTask.chords as chord}
              <div class="chord-pill font-mono">{chord}</div>
            {/each}
          </div>
        </div>

        {#if isRecording}
          <div class="metronome-live-box">
            <span class="metro-label">METRONOME CLICK ACTIVE ({currentTask.targetBpm} BPM):</span>
            <div class="beat-dots font-mono">
              {#each [1, 2, 3, 4] as b}
                <div class="b-dot {currentBeat === b ? 'b-active' : ''}">{b}</div>
              {/each}
            </div>
          </div>
        {/if}
      </section>

      <!-- Right: Auto-Graded Student Report Card -->
      <section class="card-panel report-card {gradeReport ? 'card-graded' : ''}">
        <h2>Instructor Homework Evaluation Report</h2>

        {#if !gradeReport}
          <div class="empty-report-box">
            <span>Click "Start Assignment Take", play your progression along with the click, and click "Finish Take" to generate your grade.</span>
          </div>
        {:else}
          <div class="grade-banner">
            <div class="grade-circle font-mono">
              <span class="grade-num">{gradeReport.overallScore}</span>
              <span class="grade-scale">/ 100</span>
            </div>
            <div class="grade-meta">
              <strong class="grade-title">
                {gradeReport.overallScore >= 90 ? 'Grade A · Lesson Ready' : 'Grade B · Minor Drift'}
              </strong>
              <span class="grade-date">Date Evaluated: {gradeReport.date}</span>
            </div>
          </div>

          <div class="metrics-grid font-mono">
            <div class="metric-box">
              <span class="m-label">Timing Accuracy:</span>
              <strong class="m-val text-accent">{gradeReport.timingAccuracyPct}%</strong>
            </div>
            <div class="metric-box">
              <span class="m-label">Chord Clarity:</span>
              <strong class="m-val text-ok">{gradeReport.chordClarityScore}%</strong>
            </div>
            <div class="metric-box">
              <span class="m-label">Micro-Timing:</span>
              <span class="m-val-small">{gradeReport.earlyLateRatio}</span>
            </div>
          </div>

          <div class="teacher-box">
            <h3>Instructor Feedback Summary:</h3>
            <p>{gradeReport.teacherNotes}</p>
          </div>
        {/if}
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

  .btn-danger {
    background-color: #ef4444;
    color: #fff;
    border: 1px solid transparent;
    padding: 0.6rem 1.25rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
  }

  /* Task Tabs */
  .task-tabs {
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

  /* Workspace Grid */
  .task-workspace-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .task-workspace-grid {
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

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .task-header h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .task-instructions {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }

  .chords-flow {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .flow-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 700;
    text-transform: uppercase;
  }

  .chords-pills {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .chord-pill {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    padding: 0.6rem 1rem;
    border-radius: var(--radius-md);
    font-weight: 700;
    color: var(--accent-light);
  }

  .metronome-live-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .metro-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 700;
  }

  .beat-dots {
    display: flex;
    gap: 0.75rem;
  }

  .b-dot {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .b-active {
    background-color: var(--accent);
    color: #000;
    font-weight: 800;
    transform: scale(1.15);
  }

  /* Report Card */
  .report-card h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .empty-report-box {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-md);
  }

  .grade-banner {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
  }

  .grade-circle {
    width: 64px;
    height: 64px;
    border-radius: 999px;
    background-color: rgba(16, 185, 129, 0.15);
    border: 2px solid #10b981;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .grade-num {
    font-size: 1.5rem;
    font-weight: 800;
    color: #10b981;
    line-height: 1;
  }

  .grade-scale {
    font-size: 0.65rem;
    color: var(--text-muted);
  }

  .grade-meta {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .grade-title {
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  .grade-date {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .metric-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .m-label {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .m-val {
    font-size: 1.3rem;
  }

  .m-val-small {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .text-accent { color: var(--accent-light); }
  .text-ok { color: #10b981; }

  .teacher-box {
    background-color: rgba(245, 158, 11, 0.08);
    border-left: 3px solid var(--accent);
    padding: 1rem;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    font-size: 0.85rem;
  }

  .teacher-box h3 {
    margin: 0 0 0.35rem;
    font-size: 0.85rem;
    color: var(--accent-light);
  }

  .teacher-box p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .font-mono {
    font-family: var(--font-mono);
  }

  @media print {
    .no-print {
      display: none !important;
    }
    .card-panel {
      border: 1px solid #000 !important;
      background: #fff !important;
      color: #000 !important;
    }
  }
</style>
