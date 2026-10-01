<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface StringCheck {
    stringName: string;
    status: 'clean' | 'buzz' | 'muted';
    note: string;
    midi: number;
  }

  let selectedChord = $state<'F_major' | 'Bm' | 'F_sharp_minor'>('F_major');
  let currentWeek = $state<1 | 2 | 3 | 4>(1);

  // String Clarity Diagnostic
  let stringChecks = $state<StringCheck[]>([
    { stringName: '1st (High E)', status: 'clean', note: 'F4', midi: 65 },
    { stringName: '2nd (B)', status: 'clean', note: 'C4', midi: 60 },
    { stringName: '3rd (G)', status: 'clean', note: 'A3', midi: 57 },
    { stringName: '4th (D)', status: 'clean', note: 'F3', midi: 53 },
    { stringName: '5th (A)', status: 'clean', note: 'C3', midi: 48 },
    { stringName: '6th (Low E)', status: 'clean', note: 'F2', midi: 41 }
  ]);

  // Endurance Timer
  let holdSeconds = $state(0);
  let isTimerRunning = $state(false);
  let holdInterval: number | null = null;
  let targetHoldSeconds = 30;

  // Web Audio Context
  let audioCtx: AudioContext | null = null;

  function playPluck(midi: number, isMuted = false) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (isMuted) {
      // Dull percussive thud
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
      return;
    }

    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.95);
  }

  function cycleStatus(idx: number) {
    const nextStatus = stringChecks[idx].status === 'clean' ? 'buzz' : stringChecks[idx].status === 'buzz' ? 'muted' : 'clean';
    stringChecks[idx].status = nextStatus;
    playPluck(stringChecks[idx].midi, nextStatus === 'muted');
  }

  let cleanCount = $derived(
    stringChecks.filter((s) => s.status === 'clean').length
  );

  let diagnosisAdvice = $derived(() => {
    const bString = stringChecks[1].status;
    const gString = stringChecks[2].status;
    const highE = stringChecks[0].status;

    if (cleanCount === 6) {
      return '🎉 Perfect 6-string clamp! Every note rings with clear resonance and zero buzzing.';
    }
    if (bString !== 'clean' || gString !== 'clean') {
      return '⚠️ Middle Crease Buzz: Strings 2 & 3 are sitting in the soft skin folds of your index finger joint. Roll your finger slightly onto its bony side edge (radial bone) to present a flat, solid clamping surface.';
    }
    if (highE !== 'clean') {
      return '⚠️ High E Mute: The base of your index finger is collapsing onto the first string. Raise your index finger up by 2–3 millimeters so the tip extends slightly past the top edge of the fretboard.';
    }
    return 'Keep your thumb anchored directly behind your middle finger to balance torque without over-squeezing.';
  });

  function toggleHoldTimer() {
    if (isTimerRunning) {
      stopHoldTimer();
    } else {
      startHoldTimer();
    }
  }

  function startHoldTimer() {
    holdSeconds = 0;
    isTimerRunning = true;
    holdInterval = window.setInterval(() => {
      holdSeconds++;
      if (holdSeconds >= targetHoldSeconds) {
        stopHoldTimer();
        alert('🎉 30-Second Barre Hold Complete! Great isometric stamina work.');
      }
    }, 1000);
  }

  function stopHoldTimer() {
    isTimerRunning = false;
    if (holdInterval) {
      clearInterval(holdInterval);
      holdInterval = null;
    }
  }

  onDestroy(() => {
    stopHoldTimer();
  });
</script>

<svelte:head>
  <title>Barre Chord Survival & Strength Gym | Guitar Toolkit</title>
  <meta
    name="description"
    content="Overcome the #1 beginner guitar wall. Biomechanical leverage ergonomics, 6-string knuckle pressure diagnostics, and isometric endurance timers."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Practice & Technique</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#16 Technique Gym</span>
      <span class="badge">Biomechanical Ergonomics</span>
      <span class="badge">String Clarity Diagnostics</span>
    </div>
    <h1>🏋️ Barre Chord Survival & Strength Gym</h1>
    <p class="tool-sub">
      Tackle the #1 reason beginners quit. Eliminate thumb fatigue and fret buzz through biomechanical leverage principles, knuckle diagnostic tests, and isometric endurance training.
    </p>
  </div>

  <!-- 4 Biomechanical Golden Rules Card -->
  <div class="rules-card">
    <h3>💡 The 4 Ergonomic Laws of Effortless Barre Chords</h3>
    <div class="rules-grid">
      <div class="rule-box">
        <span class="rule-num">LAW 1</span>
        <h4>Leverage Beats Pinching</h4>
        <p>Never squeeze hard with your thumb pad. Instead, pull your fretting arm gently backward from the shoulder, using your guitar against your torso as a lever.</p>
      </div>

      <div class="rule-box">
        <span class="rule-num">LAW 2</span>
        <h4>Roll to the Bony Edge</h4>
        <p>The soft flesh of your index finger muffles strings. Roll your index finger slightly to the thumb-facing side (radial bone) for a rigid clamp.</p>
      </div>

      <div class="rule-box">
        <span class="rule-num">LAW 3</span>
        <h4>Hug the Fret Wire</h4>
        <p>Place your barre 1 millimeter behind the fret wire. The closer you are to the fret, the less clamping pressure is physically required to stop buzz.</p>
      </div>

      <div class="rule-box">
        <span class="rule-num">LAW 4</span>
        <h4>Curve Non-Barre Fingers</h4>
        <p>Fingers 2, 3, and 4 must stay sharply arched on their fingertips so their undersides don't accidentally brush and choke neighboring strings.</p>
      </div>
    </div>
  </div>

  <!-- Interactive String-by-String Clarity Diagnostic -->
  <div class="diagnostic-card">
    <div class="diag-header">
      <div>
        <h3>🔍 F Major 6-String Clarity Diagnostic</h3>
        <p class="diag-sub">Form the full F Major barre chord. Pluck each string one-by-one and click its badge below to log the tone:</p>
      </div>
      <div class="clarity-score-pill">
        <span class="score-val">{cleanCount} / 6</span>
        <span class="score-label">CLEAN STRINGS</span>
      </div>
    </div>

    <div class="strings-tester-grid">
      {#each stringChecks as str, idx}
        <button
          type="button"
          class="string-check-btn {str.status}"
          onclick={() => cycleStatus(idx)}
        >
          <span class="str-name">{str.stringName}</span>
          <span class="str-note-badge">{str.note}</span>
          <span class="str-status-text">
            {str.status === 'clean' ? '🟢 CLEAN RING' : str.status === 'buzz' ? '🟡 BUZZING' : '🔴 DEAD / MUTED'}
          </span>
        </button>
      {/each}
    </div>

    <!-- Live Luthier / Pedagogy Prescription -->
    <div class="advice-box">
      <span class="advice-tag">BIOMECHANICAL DIAGNOSIS:</span>
      <p class="advice-p">{diagnosisAdvice()}</p>
    </div>
  </div>

  <!-- Isometric Hold Endurance Timer -->
  <div class="timer-card">
    <div class="timer-left">
      <h3>⏱️ 30-Second Isometric Endurance Challenge</h3>
      <p class="timer-desc">
        Hold a clean F Major barre chord without relaxing or resetting for 30 seconds. Builds stabilizing finger endurance without hand cramping.
      </p>
      <button
        type="button"
        class="timer-btn"
        class:running={isTimerRunning}
        onclick={toggleHoldTimer}
      >
        {isTimerRunning ? '⏹ ABORT TIMER' : '▶ START 30s ISOMETRIC HOLD'}
      </button>
    </div>

    <div class="timer-right">
      <div class="clock-dial" class:active-clock={isTimerRunning}>
        <span class="clock-num">{holdSeconds}s</span>
        <span class="clock-target">TARGET: 30s</span>
      </div>
    </div>
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

  .rules-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  h3 {
    margin: 0 0 16px;
    font-size: 1.15rem;
    color: #f3f4f6;
  }
  .rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }
  .rule-box {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 14px;
  }
  .rule-num {
    font-size: 0.65rem;
    font-weight: 800;
    color: #f59e0b;
    display: block;
    margin-bottom: 4px;
  }
  .rule-box h4 {
    margin: 0 0 6px;
    color: #38bdf8;
    font-size: 0.95rem;
  }
  .rule-box p {
    margin: 0;
    font-size: 0.8rem;
    color: #9ca3af;
    line-height: 1.5;
  }

  .diagnostic-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
  }
  .diag-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    gap: 20px;
    flex-wrap: wrap;
  }
  .diag-sub {
    font-size: 0.85rem;
    color: #9ca3af;
    margin: 0;
  }
  .clarity-score-pill {
    background: #0d1117;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 8px 16px;
    text-align: center;
  }
  .score-val {
    font-size: 1.4rem;
    font-weight: 800;
    color: #10b981;
    display: block;
  }
  .score-label {
    font-size: 0.65rem;
    color: #9ca3af;
    font-weight: 700;
  }

  .strings-tester-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
  }
  .string-check-btn {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 12px 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .string-check-btn:hover {
    border-color: #f59e0b;
  }
  .string-check-btn.clean {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.08);
  }
  .string-check-btn.buzz {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.08);
  }
  .string-check-btn.muted {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
  }
  .str-name {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-bottom: 4px;
  }
  .str-note-badge {
    font-size: 1.1rem;
    font-weight: 800;
    color: #f3f4f6;
    display: block;
    margin-bottom: 4px;
  }
  .str-status-text {
    font-size: 0.7rem;
    font-weight: 700;
    color: #cbd5e1;
  }

  .advice-box {
    background: #182232;
    border-left: 4px solid #38bdf8;
    padding: 14px 18px;
    border-radius: 0 6px 6px 0;
  }
  .advice-tag {
    font-size: 0.75rem;
    font-weight: 800;
    color: #38bdf8;
    display: block;
    margin-bottom: 4px;
  }
  .advice-p {
    margin: 0;
    font-size: 0.85rem;
    color: #d1d5db;
    line-height: 1.5;
  }

  .timer-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .timer-left {
    flex: 1;
    min-width: 280px;
  }
  .timer-desc {
    font-size: 0.85rem;
    color: #9ca3af;
    line-height: 1.5;
    margin: 0 0 16px;
  }
  .timer-btn {
    background: #f59e0b;
    color: #78350f;
    border: none;
    font-weight: 800;
    padding: 12px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .timer-btn.running {
    background: #ef4444;
    color: #ffffff;
  }

  .clock-dial {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: #0d1117;
    border: 3px solid #374151;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .clock-dial.active-clock {
    border-color: #f59e0b;
    box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
  }
  .clock-num {
    font-size: 2rem;
    font-weight: 800;
    color: #f3f4f6;
    line-height: 1;
  }
  .clock-target {
    font-size: 0.6rem;
    color: #9ca3af;
    margin-top: 4px;
  }
</style>
