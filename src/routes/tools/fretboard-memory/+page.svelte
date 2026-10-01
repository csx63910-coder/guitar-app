<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // Standard tuning open string MIDI note numbers: E2(40), A2(45), D3(50), G3(55), B3(59), E4(64)
  const OPEN_STRINGS_MIDI = [64, 59, 55, 50, 45, 40]; // String 1 (High E) to String 6 (Low E)
  const STRING_NAMES = ['High E', 'B', 'G', 'D', 'A', 'Low E'];

  interface Question {
    type: 'find_note' | 'name_fret';
    targetNote: string;
    targetStringIdx: number; // 0 to 5
    targetFret: number; // 0 to 12
    promptText: string;
  }

  let mode = $state<'drill' | 'explore'>('drill');
  let gameStatus = $state<'idle' | 'playing' | 'game_over'>('idle');
  let score = $state(0);
  let streak = $state(0);
  let bestStreak = $state(0);
  let timeLeft = $state(60);
  let timerInterval: number | null = null;

  // Active question in drill mode
  let currentQuestion = $state<Question | null>(null);
  let feedbackMessage = $state<{ text: string; success: boolean } | null>(null);

  // Fretboard highlight markers
  let activeFretMarker = $state<{ strIdx: number; fret: number } | null>(null);
  let showAllNotes = $state(false);

  // Web Audio Context
  let audioCtx: AudioContext | null = null;

  function getNoteAt(strIdx: number, fret: number): { note: string; midi: number } {
    const baseMidi = OPEN_STRINGS_MIDI[strIdx];
    const midi = baseMidi + fret;
    const note = NOTES[midi % 12];
    return { note, midi };
  }

  function midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function playPluck(midi: number) {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(midiToFreq(midi), now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.85);
  }

  function startSprint() {
    score = 0;
    streak = 0;
    timeLeft = 60;
    gameStatus = 'playing';
    feedbackMessage = null;
    generateQuestion();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = window.setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        endSprint();
      }
    }, 1000);
  }

  function endSprint() {
    gameStatus = 'game_over';
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function generateQuestion() {
    // Randomly pick between find_note or name_fret
    const isFindNote = Math.random() > 0.4;
    const strIdx = Math.floor(Math.random() * 6);
    const fret = Math.floor(Math.random() * 13);
    const { note } = getNoteAt(strIdx, fret);

    if (isFindNote) {
      currentQuestion = {
        type: 'find_note',
        targetNote: note,
        targetStringIdx: strIdx,
        targetFret: fret,
        promptText: `Find the note "${note}" on ${STRING_NAMES[strIdx]} string`
      };
      activeFretMarker = null;
    } else {
      currentQuestion = {
        type: 'name_fret',
        targetNote: note,
        targetStringIdx: strIdx,
        targetFret: fret,
        promptText: `What note is at Fret ${fret} on ${STRING_NAMES[strIdx]} string?`
      };
      activeFretMarker = { strIdx, fret };
    }
  }

  function handleFretClick(strIdx: number, fret: number) {
    const { note, midi } = getNoteAt(strIdx, fret);
    playPluck(midi);

    if (mode === 'explore') {
      activeFretMarker = { strIdx, fret };
      feedbackMessage = { text: `${STRING_NAMES[strIdx]} string, Fret ${fret}: Note ${note}`, success: true };
      return;
    }

    if (gameStatus !== 'playing' || !currentQuestion) return;

    if (currentQuestion.type === 'find_note') {
      if (strIdx === currentQuestion.targetStringIdx && note === currentQuestion.targetNote) {
        handleSuccess();
      } else {
        handleFail(`That was ${note}. Look for ${currentQuestion.targetNote}.`);
      }
    }
  }

  function handleNoteButtonAnswer(guessedNote: string) {
    if (gameStatus !== 'playing' || !currentQuestion) return;

    if (guessedNote === currentQuestion.targetNote) {
      handleSuccess();
    } else {
      handleFail(`Incorrect! It was ${currentQuestion.targetNote}, you picked ${guessedNote}.`);
    }
  }

  function handleSuccess() {
    score += 10 + streak * 2;
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    feedbackMessage = { text: `Correct! 🔥 Streak: ${streak}`, success: true };
    generateQuestion();
  }

  function handleFail(msg: string) {
    streak = 0;
    feedbackMessage = { text: msg, success: false };
    generateQuestion();
  }

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });
</script>

<svelte:head>
  <title>Fretboard Memory Palace | Guitar Toolkit</title>
  <meta
    name="description"
    content="Spaced-repetition fretboard note trainer with rapid-fire sprint mode, audio physical pluck synthesis, and visual interactive 22-fret neck."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Tabs & Practice</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#13 Memory Trainer</span>
      <span class="badge">Spaced Repetition</span>
      <span class="badge">Audio Pluck Feedback</span>
    </div>
    <h1>🧠 Fretboard Memory Palace</h1>
    <p class="tool-sub">
      Internalize every note on all 6 strings without hesitation. Rapid-fire recognition sprints, audio ear feedback, and instant visual fretboard navigation.
    </p>
  </div>

  <!-- Mode Switch & Score Dashboard -->
  <div class="dashboard-card">
    <div class="mode-tabs">
      <button
        type="button"
        class="mode-btn"
        class:active={mode === 'drill'}
        onclick={() => (mode = 'drill')}
      >
        🎯 60s Sprint Challenge
      </button>
      <button
        type="button"
        class="mode-btn"
        class:active={mode === 'explore'}
        onclick={() => (mode = 'explore')}
      >
        🗺️ Free Explore & Study
      </button>
    </div>

    {#if mode === 'drill'}
      <div class="sprint-dashboard">
        {#if gameStatus === 'idle'}
          <div class="idle-banner">
            <button type="button" class="start-sprint-btn" onclick={startSprint}>
              ▶ START 60-SECOND FRETBOARD SPRINT
            </button>
          </div>
        {:else if gameStatus === 'playing'}
          <div class="live-metrics">
            <div class="metric-box">
              <span class="metric-label">TIME LEFT</span>
              <span class="metric-val timer" class:urgent={timeLeft <= 10}>{timeLeft}s</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">SCORE</span>
              <span class="metric-val">{score}</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">STREAK</span>
              <span class="metric-val streak">{streak} 🔥</span>
            </div>
          </div>

          <!-- Active Question Banner -->
          {#if currentQuestion}
            <div class="prompt-banner">
              <span class="prompt-tag">QUESTION:</span>
              <span class="prompt-text">{currentQuestion.promptText}</span>
            </div>
          {/if}
        {:else if gameStatus === 'game_over'}
          <div class="game-over-box">
            <h3>🏁 TIME UP! Sprint Completed</h3>
            <div class="final-score">Final Score: <strong>{score}</strong> &bull; Best Streak: <strong>{bestStreak}</strong></div>
            <button type="button" class="start-sprint-btn" onclick={startSprint}>
              🔄 PLAY AGAIN
            </button>
          </div>
        {/if}

        {#if feedbackMessage}
          <div class="feedback-strip" class:success={feedbackMessage.success} class:fail={!feedbackMessage.success}>
            {feedbackMessage.text}
          </div>
        {/if}
      </div>
    {:else}
      <!-- Explore Mode Controls -->
      <div class="explore-controls">
        <label class="toggle-notes">
          <input type="checkbox" bind:checked={showAllNotes} />
          Show all note labels on fretboard
        </label>
        {#if feedbackMessage}
          <span class="explore-feedback">{feedbackMessage.text}</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Interactive Fretboard Visualizer -->
  <div class="fretboard-card">
    <div class="fretboard-scroll">
      <div class="fretboard">
        <!-- Nut Column (Fret 0) -->
        <div class="fret-column nut-column">
          <div class="fret-num">0 (Open)</div>
          {#each [0, 1, 2, 3, 4, 5] as sIdx}
            {@const { note } = getNoteAt(sIdx, 0)}
            <button
              type="button"
              class="fret-cell open-string"
              class:highlighted={activeFretMarker?.strIdx === sIdx && activeFretMarker?.fret === 0}
              onclick={() => handleFretClick(sIdx, 0)}
            >
              <div class="string-wire string-{sIdx}"></div>
              <span class="fret-note-label" class:visible={showAllNotes || (activeFretMarker?.strIdx === sIdx && activeFretMarker?.fret === 0)}>
                {note}
              </span>
            </button>
          {/each}
        </div>

        <!-- Frets 1 to 12 -->
        {#each Array(12) as _, f}
          {@const fretNum = f + 1}
          <div class="fret-column">
            <div class="fret-num">
              {fretNum}
              {#if [3, 5, 7, 9].includes(fretNum)}
                <span class="inlay-dot">&bull;</span>
              {:else if fretNum === 12}
                <span class="inlay-dot double">&bull;&bull;</span>
              {/if}
            </div>

            {#each [0, 1, 2, 3, 4, 5] as sIdx}
              {@const { note } = getNoteAt(sIdx, fretNum)}
              <button
                type="button"
                class="fret-cell"
                class:highlighted={activeFretMarker?.strIdx === sIdx && activeFretMarker?.fret === fretNum}
                onclick={() => handleFretClick(sIdx, fretNum)}
              >
                <div class="string-wire string-{sIdx}"></div>
                <span class="fret-note-label" class:visible={showAllNotes || (activeFretMarker?.strIdx === sIdx && activeFretMarker?.fret === fretNum)}>
                  {note}
                </span>
              </button>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Note Name Answering Buttons (for name_fret question type) -->
  {#if mode === 'drill' && gameStatus === 'playing' && currentQuestion?.type === 'name_fret'}
    <div class="note-answers-card">
      <span class="answers-title">SELECT THE NOTE NAME:</span>
      <div class="notes-button-grid">
        {#each NOTES as n}
          <button type="button" class="note-guess-btn" onclick={() => handleNoteButtonAnswer(n)}>
            {n}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Theory & Octave Pattern Guide -->
  <div class="palace-guide-card">
    <h3>🏰 The Fretboard Memory Palace Rules</h3>
    <div class="guide-rules-grid">
      <div class="rule-box">
        <h4>1. The 2-Fret Octave Shape (Strings 6 & 4, 5 & 3)</h4>
        <p>From any root note on the Low E or A strings, go <strong>2 frets up and 2 strings down</strong> toward the floor. That note is the exact same pitch an octave higher (e.g. G on 6th string fret 3 = G on 4th string fret 5).</p>
      </div>

      <div class="rule-box">
        <h4>2. The B-String Offset (The Major 3rd Shift)</h4>
        <p>Because the guitar is tuned in 4ths with a Major 3rd between G and B, any shape crossing onto the 2nd string (B) shifts <strong>1 fret higher toward the body</strong>.</p>
      </div>

      <div class="rule-box">
        <h4>3. The 12th Fret Reset</h4>
        <p>The 12th fret with double inlay dots is the exact halfway harmonic point of the string. All open string notes repeat identically at fret 12 (E-A-D-G-B-E).</p>
      </div>
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
    background: rgba(168, 85, 247, 0.15);
    color: #a855f7;
    border-color: rgba(168, 85, 247, 0.4);
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

  .dashboard-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 18px;
    margin-bottom: 20px;
  }
  .mode-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }
  .mode-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #9ca3af;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
  }
  .mode-btn.active {
    background: rgba(168, 85, 247, 0.15);
    border-color: #a855f7;
    color: #c084fc;
  }

  .start-sprint-btn {
    background: #a855f7;
    color: #ffffff;
    border: none;
    font-weight: 800;
    font-size: 1rem;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .start-sprint-btn:hover {
    background: #9333ea;
  }

  .live-metrics {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }
  .metric-box {
    background: #1f2937;
    border: 1px solid #374151;
    padding: 8px 16px;
    border-radius: 6px;
    text-align: center;
    flex: 1;
  }
  .metric-label {
    font-size: 0.65rem;
    color: #9ca3af;
    font-weight: 700;
  }
  .metric-val {
    display: block;
    font-size: 1.5rem;
    font-weight: 800;
    color: #f3f4f6;
  }
  .metric-val.timer.urgent {
    color: #ef4444;
  }
  .metric-val.streak {
    color: #f59e0b;
  }

  .prompt-banner {
    background: #1e1b4b;
    border: 1px solid #4338ca;
    padding: 12px 16px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .prompt-tag {
    font-size: 0.75rem;
    color: #a5b4fc;
    font-weight: 800;
  }
  .prompt-text {
    font-size: 1.1rem;
    font-weight: 800;
    color: #f5f3ff;
  }

  .feedback-strip {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 700;
    text-align: center;
  }
  .feedback-strip.success {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
  }
  .feedback-strip.fail {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .fretboard-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .fretboard-scroll {
    overflow-x: auto;
    padding-bottom: 8px;
  }
  .fretboard {
    display: flex;
    min-width: 900px;
    background: #2b1f1d; /* Rosewood dark brown */
    border: 2px solid #1c1413;
    border-radius: 6px;
  }

  .fret-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 3px solid #94a3b8; /* Nickel silver fret wire */
    position: relative;
  }
  .nut-column {
    flex: 0.6;
    border-right: 6px solid #f8fafc; /* Bone nut */
    background: #1a1413;
  }
  .fret-num {
    text-align: center;
    font-size: 0.7rem;
    color: #cbd5e1;
    padding: 4px 0;
    background: #0f172a;
    border-bottom: 1px solid #334155;
    font-weight: 700;
  }
  .inlay-dot {
    color: #f1f5f9;
    font-size: 1.1rem;
    line-height: 0;
    display: block;
    margin-top: 2px;
  }

  .fret-cell {
    height: 38px;
    background: transparent;
    border: none;
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  .fret-cell:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .fret-cell.highlighted {
    background: rgba(168, 85, 247, 0.35);
  }

  .string-wire {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: #cbd5e1;
    pointer-events: none;
  }
  .string-0 { height: 1px; }
  .string-1 { height: 1.5px; }
  .string-2 { height: 2px; }
  .string-3 { height: 2.5px; background: #e2e8f0; }
  .string-4 { height: 3px; background: #f1f5f9; }
  .string-5 { height: 3.5px; background: #f8fafc; }

  .fret-note-label {
    position: relative;
    z-index: 2;
    background: #0f172a;
    border: 1px solid #64748b;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 800;
    color: #38bdf8;
  }
  .fret-note-label.visible {
    display: flex;
  }

  .note-answers-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    text-align: center;
  }
  .answers-title {
    font-size: 0.75rem;
    color: #9ca3af;
    font-weight: 700;
    display: block;
    margin-bottom: 10px;
  }
  .notes-button-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  }
  @media (max-width: 640px) {
    .notes-button-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .note-guess-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    font-weight: 800;
    font-size: 1rem;
    padding: 10px 0;
    border-radius: 6px;
    cursor: pointer;
  }
  .note-guess-btn:hover {
    border-color: #a855f7;
    color: #c084fc;
  }

  .palace-guide-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
  }
  .palace-guide-card h3 {
    margin: 0 0 16px;
    font-size: 1.15rem;
  }
  .guide-rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .rule-box {
    background: #0d1117;
    border: 1px solid #1f2937;
    padding: 14px;
    border-radius: 6px;
  }
  .rule-box h4 {
    margin: 0 0 6px;
    color: #a855f7;
    font-size: 0.9rem;
  }
  .rule-box p {
    margin: 0;
    font-size: 0.85rem;
    color: #9ca3af;
    line-height: 1.5;
  }
</style>
