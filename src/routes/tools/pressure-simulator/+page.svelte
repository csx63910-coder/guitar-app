<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let audioCtx: AudioContext | null = null;
  let isSimulating = $state(false);
  let venueType = $state<'dive_bar' | 'coffeehouse' | 'arena' | 'audition'>('dive_bar');

  // Distraction settings
  let randomDistractions = $state(true);
  let redLightMode = $state(true);
  let crowdVolume = $state(0.4);

  // Performance timer
  let sessionSeconds = $state(0);
  let timerId: number | null = null;
  let distractionTimeoutId: number | null = null;

  // Active distraction visual popup
  let activeDistraction = $state<string | null>(null);
  let distractionClearTimer: number | null = null;

  // Audio Nodes
  let crowdNoiseNode: AudioNode | null = null;
  let crowdGain: GainNode | null = null;

  const DISTRACTIONS = [
    { text: '🍺 Clinking beer glasses & shouting bartender', sound: 'glass' },
    { text: '📱 Loud smartphone ringtone in front row', sound: 'phone' },
    { text: '🚪 Heavy venue door slams shut', sound: 'door' },
    { text: '🗣️ Loud conversation right next to stage monitor', sound: 'shout' },
    { text: '⚡ Mic feedback squeal spike', sound: 'feedback' },
    { text: '👏 Premature single-person clap during quiet section', sound: 'clap' }
  ];

  function startAudio() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function startSimulation() {
    startAudio();
    if (!audioCtx) return;

    isSimulating = true;
    sessionSeconds = 0;
    activeDistraction = null;

    // Start crowd ambience generator
    startCrowdAmbience();

    // Session timer
    timerId = window.setInterval(() => {
      sessionSeconds++;
    }, 1000);

    // Schedule random distractions
    if (randomDistractions) {
      scheduleNextDistraction();
    }
  }

  function stopSimulation() {
    isSimulating = false;
    if (timerId) clearInterval(timerId);
    if (distractionTimeoutId) clearTimeout(distractionTimeoutId);
    stopCrowdAmbience();
  }

  function startCrowdAmbience() {
    if (!audioCtx) return;

    // Pink / Brown noise synthesis simulating crowd murmur
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.1;
      b2 = 0.85 * b2 + white * 0.2;
      data[i] = (b0 + b1 + b2) * 0.25;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to murmur frequencies (200Hz - 1800Hz)
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(venueType === 'arena' ? 600 : 900, audioCtx.currentTime);
    bandpass.Q.setValueAtTime(0.8, audioCtx.currentTime);

    crowdGain = audioCtx.createGain();
    crowdGain.gain.setValueAtTime(crowdVolume * 0.3, audioCtx.currentTime);

    noise.connect(bandpass);
    bandpass.connect(crowdGain);
    crowdGain.connect(audioCtx.destination);
    noise.start();
    crowdNoiseNode = noise;
  }

  function stopCrowdAmbience() {
    if (crowdNoiseNode) {
      try {
        (crowdNoiseNode as AudioBufferSourceNode).stop();
      } catch {}
      crowdNoiseNode = null;
    }
  }

  function scheduleNextDistraction() {
    if (!isSimulating) return;
    // Random delay between 8 and 22 seconds
    const delayMs = (Math.random() * 14 + 8) * 1000;

    distractionTimeoutId = window.setTimeout(() => {
      triggerDistraction();
      scheduleNextDistraction();
    }, delayMs);
  }

  function triggerDistraction() {
    if (!audioCtx || !isSimulating) return;
    const item = DISTRACTIONS[Math.floor(Math.random() * DISTRACTIONS.length)];
    activeDistraction = item.text;

    // Synthesize distraction audio cue
    playDistractionSound(item.sound);

    if (distractionClearTimer) clearTimeout(distractionClearTimer);
    distractionClearTimer = window.setTimeout(() => {
      activeDistraction = null;
    }, 4000);
  }

  function playDistractionSound(type: string) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    if (type === 'feedback') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2850, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } else if (type === 'glass') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(3200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'phone') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.setValueAtTime(1800, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  onDestroy(() => {
    stopSimulation();
  });
</script>

<svelte:head>
  <title>Performance-Pressure Simulator | Guitar Toolkit</title>
  <meta
    name="description"
    content="Overcome stage fright and red-light recording panic. Rehearse with crowd chatter, sudden real-world bar distractions, and one-take recovery rules."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Performance & Practice</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#23 Stage Simulator</span>
      <span class="badge">Red Light Mode</span>
      <span class="badge">Adrenaline Desensitization</span>
    </div>
    <h1>🎤 Performance-Pressure Simulator</h1>
    <p class="tool-sub">
      Playing alone in a quiet bedroom is easy; playing live under pressure with cold hands, crowd chatter, and dropped glasses is a completely different skill. Train your mental recovery muscle.
    </p>
  </div>

  <!-- Big Stage Display & Red Light Panic Box -->
  <div class="stage-display-card" class:live-on-air={isSimulating && redLightMode}>
    <div class="stage-top-bar">
      <div class="on-air-badge" class:blinking={isSimulating && redLightMode}>
        <span class="red-bulb"></span>
        {isSimulating ? 'ON AIR &bull; LIVE PERFORMANCE IN PROGRESS' : 'STAGE READY &bull; STANDBY'}
      </div>
      <span class="timer-display">{formatTime(sessionSeconds)}</span>
    </div>

    <!-- Center Stage Experience -->
    <div class="stage-center">
      {#if !isSimulating}
        <div class="standby-text">
          <h3>The "One-Take" Mental Gym</h3>
          <p>Rule: When you start, <strong>you cannot stop or restart if you make a mistake</strong>. You must play through, cover the flub, and stay on beat like a professional on stage.</p>
        </div>
      {:else}
        <div class="active-stage-view">
          <div class="venue-title">
            {#if venueType === 'dive_bar'}🍻 Crowded Corner Bar Stage
            {:else if venueType === 'coffeehouse'}☕ Acoustic Coffeehouse Listening Room
            {:else if venueType === 'arena'}🏟️ 10,000-Seat Festival Main Stage
            {:else}📋 High-Stakes Music School Audition Panel{/if}
          </div>

          <!-- Dynamic Distraction Alert Popup -->
          {#if activeDistraction}
            <div class="distraction-alert">
              <span class="alert-tag">⚠️ SUDDEN DISTRACTION:</span>
              <span class="alert-desc">{activeDistraction}</span>
              <span class="keep-going">DO NOT STOP! KEEP PLAYING!</span>
            </div>
          {:else}
            <div class="playing-prompt">
              <span class="pulse-icon">⚡</span>
              Keep your eyes up and fingers moving. Maintain the tempo through the noise.
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="stage-actions">
      <button
        type="button"
        class="sim-action-btn"
        class:stop={isSimulating}
        onclick={isSimulating ? stopSimulation : startSimulation}
      >
        {isSimulating ? '⏹ FINISH PERFORMANCE TAKE' : '🔴 STEP ON STAGE & BEGIN TAKE'}
      </button>

      {#if isSimulating}
        <button type="button" class="inject-distract-btn" onclick={triggerDistraction}>
          ⚡ Trigger Surprise Distraction
        </button>
      {/if}
    </div>
  </div>

  <!-- Simulator Settings Card -->
  <div class="settings-card">
    <h3>⚙️ Stage & Venue Simulator Settings</h3>
    <div class="settings-grid">
      <div class="setting-col">
        <label for="venue-select" class="col-label">VENUE ENVIRONMENT:</label>
        <select id="venue-select" bind:value={venueType} disabled={isSimulating}>
          <option value="dive_bar">Noisy Local Pub (Murmurs, Beers, Clatter)</option>
          <option value="coffeehouse">Quiet Intimate Room (Every note audible)</option>
          <option value="arena">Arena Festival (Massive distant roar & echoes)</option>
          <option value="audition">Audition Room (Dead silence & staring judges)</option>
        </select>
      </div>

      <div class="setting-col">
        <label for="crowd-vol" class="col-label">CROWD AMBIENCE VOLUME: <strong>{Math.round(crowdVolume * 100)}%</strong></label>
        <input
          id="crowd-vol"
          type="range"
          min="0"
          max="1"
          step="0.05"
          bind:value={crowdVolume}
          oninput={() => {
            if (crowdGain && audioCtx) {
              crowdGain.gain.setValueAtTime(crowdVolume * 0.3, audioCtx.currentTime);
            }
          }}
        />
      </div>

      <div class="setting-col checkboxes">
        <label class="cb-label">
          <input type="checkbox" bind:checked={randomDistractions} />
          Random Sudden Distractions (Every 10-25s)
        </label>
        <label class="cb-label">
          <input type="checkbox" bind:checked={redLightMode} />
          Flashing Red-Light Panic Indicator
        </label>
      </div>
    </div>
  </div>

  <!-- Post-Take Mental Recovery Checklist -->
  <div class="debrief-card">
    <h3>🧠 Pro Mental Recovery Rules for Stage</h3>
    <div class="debrief-grid">
      <div class="rule-card">
        <h4>1. The 1-Second Amnesia Rule</h4>
        <p>If you hit a clam or miss a note, <strong>forget it within 100 milliseconds</strong>. The audience only notices mistakes if your face flinches or your tempo falters. Play through with confidence.</p>
      </div>

      <div class="rule-card">
        <h4>2. Never Stop the Right Hand</h4>
        <p>If your left fretting hand gets lost, keep the right hand strumming the rhythm on muted strings. Time is sacred; the melody can recover on the next downbeat.</p>
      </div>

      <div class="rule-card">
        <h4>3. Controlled Exhalation</h4>
        <p>Adrenaline causes players to hold their breath, causing muscle stiffness and finger shakes. Force a slow exhale at every verse transition.</p>
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
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.4);
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

  .stage-display-card {
    background: #0d1117;
    border: 2px solid #1f2937;
    border-radius: 12px;
    padding: 28px;
    margin-bottom: 24px;
    transition: all 0.3s ease;
  }
  .stage-display-card.live-on-air {
    border-color: #ef4444;
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
  }

  .stage-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #1f2937;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .on-air-badge {
    font-size: 0.85rem;
    font-weight: 800;
    color: #9ca3af;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .red-bulb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #4b5563;
    display: inline-block;
  }
  .on-air-badge.blinking .red-bulb {
    background: #ef4444;
    box-shadow: 0 0 12px #ef4444;
    animation: blink 1s infinite alternate;
  }
  @keyframes blink {
    from { opacity: 0.4; }
    to { opacity: 1; }
  }
  .timer-display {
    font-size: 1.4rem;
    font-family: monospace;
    font-weight: 800;
    color: #38bdf8;
  }

  .stage-center {
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin-bottom: 24px;
  }
  .standby-text h3 {
    margin: 0 0 8px;
    font-size: 1.25rem;
    color: #f3f4f6;
  }
  .standby-text p {
    font-size: 0.9rem;
    color: #9ca3af;
    max-width: 600px;
    line-height: 1.5;
    margin: 0;
  }

  .venue-title {
    font-size: 1.2rem;
    font-weight: 800;
    color: #f59e0b;
    margin-bottom: 16px;
  }
  .playing-prompt {
    font-size: 1.1rem;
    color: #d1d5db;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pulse-icon {
    color: #ef4444;
    font-size: 1.3rem;
  }

  .distraction-alert {
    background: rgba(239, 68, 68, 0.2);
    border: 2px solid #ef4444;
    border-radius: 8px;
    padding: 16px 24px;
    animation: shake 0.4s ease-in-out;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
  .alert-tag {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    color: #fca5a5;
  }
  .alert-desc {
    display: block;
    font-size: 1.2rem;
    font-weight: 800;
    color: #ffffff;
    margin: 4px 0 6px;
  }
  .keep-going {
    font-size: 0.85rem;
    font-weight: 800;
    color: #fbbf24;
    letter-spacing: 0.05em;
  }

  .stage-actions {
    display: flex;
    gap: 12px;
  }
  .sim-action-btn {
    flex: 2;
    background: #ef4444;
    color: #ffffff;
    border: none;
    font-size: 1.05rem;
    font-weight: 800;
    padding: 14px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .sim-action-btn:hover {
    background: #dc2626;
  }
  .sim-action-btn.stop {
    background: #374151;
  }
  .inject-distract-btn {
    flex: 1;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f59e0b;
    font-weight: 700;
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .inject-distract-btn:hover {
    border-color: #f59e0b;
  }

  .settings-card, .debrief-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  h3 {
    margin: 0 0 16px;
    font-size: 1.15rem;
  }
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  .col-label {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    font-weight: 700;
    margin-bottom: 6px;
  }
  select, input[type='range'] {
    width: 100%;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 8px;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  input[type='range'] {
    accent-color: #ef4444;
  }

  .checkboxes {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
  }
  .cb-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #d1d5db;
    cursor: pointer;
  }

  .debrief-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  .rule-card {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 16px;
  }
  .rule-card h4 {
    margin: 0 0 6px;
    color: #38bdf8;
    font-size: 0.95rem;
  }
  .rule-card p {
    margin: 0;
    font-size: 0.85rem;
    color: #9ca3af;
    line-height: 1.5;
  }
</style>
