<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  interface PedalNode {
    id: string;
    name: string;
    type: 'drive' | 'fuzz' | 'chorus' | 'delay' | 'reverb';
    color: string;
    enabled: boolean;
    knob1Name: string;
    knob1Val: number; // 0 - 10
    knob2Name: string;
    knob2Val: number; // 0 - 10
  }

  const DEFAULT_CHAIN: PedalNode[] = [
    { id: 'drive-1', name: 'Tube Drive 808', type: 'drive', color: '#16a34a', enabled: true, knob1Name: 'Drive', knob1Val: 6.5, knob2Name: 'Tone', knob2Val: 5.0 },
    { id: 'fuzz-1', name: 'Vintage Silicone Fuzz', type: 'fuzz', color: '#dc2626', enabled: false, knob1Name: 'Fuzz', knob1Val: 8.0, knob2Name: 'Sustain', knob2Val: 7.0 },
    { id: 'chorus-1', name: 'Stereo Chorus Ensemble', type: 'chorus', color: '#2563eb', enabled: true, knob1Name: 'Depth', knob1Val: 4.5, knob2Name: 'Rate', knob2Val: 3.0 },
    { id: 'delay-1', name: 'Analog Bucket-Brigade Delay', type: 'delay', color: '#d97706', enabled: true, knob1Name: 'Time', knob1Val: 5.5, knob2Name: 'Repeats', knob2Val: 4.0 },
    { id: 'reverb-1', name: 'Ambient Spring & Plate', type: 'reverb', color: '#9333ea', enabled: true, knob1Name: 'Decay', knob1Val: 6.0, knob2Name: 'Mix', knob2Val: 4.0 }
  ];

  let chain = $state<PedalNode[]>(DEFAULT_CHAIN);
  let audioCtx: AudioContext | null = null;
  let isRunningAudio = $state(false);
  let isMicActive = $state(false);
  let micStream: MediaStream | null = null;

  // Synthesized demo DI test loop (clean funk chords)
  let diOscInterval: any = null;

  function movePedal(index: number, direction: 'left' | 'right') {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chain.length) return;
    const temp = chain[index];
    chain[index] = chain[targetIndex];
    chain[targetIndex] = temp;
  }

  function togglePedal(index: number) {
    chain[index].enabled = !chain[index].enabled;
  }

  // Audio Graph Engine
  function playCleanDiStrum() {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Generate rich clean chord
    const freqs = [196.00, 246.94, 293.66, 392.00]; // G chord
    const now = audioCtx.currentTime;

    freqs.forEach((f, i) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      const shaper = audioCtx!.createWaveShaper();

      // Check active drive/fuzz
      const drivePedal = chain.find((p) => p.type === 'drive' && p.enabled);
      const fuzzPedal = chain.find((p) => p.type === 'fuzz' && p.enabled);

      if (drivePedal || fuzzPedal) {
        osc.type = 'sawtooth';
      } else {
        osc.type = 'triangle';
      }

      osc.frequency.setValueAtTime(f, now + i * 0.03);

      gain.gain.setValueAtTime(0.2, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx!.destination);

      osc.start(now + i * 0.03);
      osc.stop(now + 1.2);
    });
  }

  function toggleTestLoop() {
    isRunningAudio = !isRunningAudio;
    if (isRunningAudio) {
      playCleanDiStrum();
      diOscInterval = setInterval(playCleanDiStrum, 2000);
    } else {
      if (diOscInterval) clearInterval(diOscInterval);
    }
  }

  async function toggleMic() {
    if (isMicActive) {
      if (micStream) {
        micStream.getTracks().forEach((t) => t.stop());
        micStream = null;
      }
      isMicActive = false;
    } else {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
        isMicActive = true;
      } catch (err) {
        alert('Could not access microphone.');
      }
    }
  }

  function getShareableUrl() {
    const encoded = encodeURIComponent(JSON.stringify(chain.map(p => ({ id: p.id, on: p.enabled, k1: p.knob1Val, k2: p.knob2Val }))));
    const url = `${window.location.origin}${window.location.pathname}#rig=${encoded}`;
    navigator.clipboard.writeText(url);
    alert('Shareable rig preset URL copied to clipboard!');
  }

  onDestroy(() => {
    if (diOscInterval) clearInterval(diOscInterval);
    if (micStream) micStream.getTracks().forEach((t) => t.stop());
    if (audioCtx) audioCtx.close();
  });
</script>

<svelte:head>
  <title>#64 Browser Amp Sim &amp; FX Chain — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#64 &middot; PLUGINS &amp; TONE</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Intermediate</span>
      </div>
      <h1>Browser Amp Sim &amp; Modular FX Chain</h1>
      <p class="lead-text">
        Interactive virtual pedalboard and guitar rig. Drag, reorder, and tweak stompboxes with live audio processing and <strong>shareable preset URLs</strong> to swap full tone chains with friends.
      </p>

      <div class="action-bar">
        <button class="btn {isRunningAudio ? 'btn-danger' : 'btn-primary'}" onclick={toggleTestLoop}>
          {isRunningAudio ? '⏹ Stop Test Strum Loop' : '▶ Play Clean DI Strum Loop'}
        </button>

        <button class="btn {isMicActive ? 'btn-danger' : 'btn-secondary'}" onclick={toggleMic}>
          {isMicActive ? '🔴 Stop Live Guitar In' : '🎙 Plug In Guitar (Mic In)'}
        </button>

        <button class="btn btn-secondary" onclick={getShareableUrl}>
          🔗 Copy Shareable Rig Link
        </button>
      </div>
    </header>

    <!-- Signal Flow Indicator -->
    <div class="signal-indicator">
      <span class="sig-tag">GUITAR IN &rarr;</span>
      <div class="sig-line"></div>
      <span class="sig-tag">&rarr; STEREO OUT (CAB SIM)</span>
    </div>

    <!-- Modular Pedalboard Chain -->
    <div class="pedalboard-rack">
      {#each chain as pedal, idx}
        <div class="pedal-box {pedal.enabled ? 'pedal-on' : 'pedal-bypassed'}" style="--pedal-color: {pedal.color}">
          <div class="pedal-top">
            <span class="order-badge">#{idx + 1}</span>
            <div class="order-arrows">
              <button class="arrow-btn" onclick={() => movePedal(idx, 'left')} disabled={idx === 0}>&larr;</button>
              <button class="arrow-btn" onclick={() => movePedal(idx, 'right')} disabled={idx === chain.length - 1}>&rarr;</button>
            </div>
          </div>

          <div class="pedal-body">
            <h3 class="pedal-name">{pedal.name}</h3>

            <!-- Knobs -->
            <div class="knobs-row">
              <div class="knob-unit">
                <label for="k1-{pedal.id}">{pedal.knob1Name}</label>
                <input
                  id="k1-{pedal.id}"
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  bind:value={pedal.knob1Val}
                />
                <span class="font-mono">{pedal.knob1Val}</span>
              </div>

              <div class="knob-unit">
                <label for="k2-{pedal.id}">{pedal.knob2Name}</label>
                <input
                  id="k2-{pedal.id}"
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  bind:value={pedal.knob2Val}
                />
                <span class="font-mono">{pedal.knob2Val}</span>
              </div>
            </div>

            <!-- Footswitch & LED -->
            <div class="footswitch-area">
              <div class="led-light {pedal.enabled ? 'led-on' : ''}"></div>
              <button class="footswitch-btn" onclick={() => togglePedal(idx)}>
                {pedal.enabled ? 'BYPASS' : 'ENGAGE'}
              </button>
            </div>
          </div>
        </div>
      {/each}
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

  .signal-indicator {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text-muted);
    font-size: 0.8rem;
    font-weight: 700;
  }

  .sig-line {
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
    opacity: 0.3;
  }

  /* Rack */
  .pedalboard-rack {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 1.5rem;
  }

  .pedal-box {
    background-color: #1a1a20;
    border: 2px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    transition: all 0.2s ease;
  }

  .pedal-on {
    border-color: var(--pedal-color);
  }

  .pedal-bypassed {
    opacity: 0.65;
  }

  .pedal-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .order-badge {
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--text-muted);
  }

  .order-arrows {
    display: flex;
    gap: 0.35rem;
  }

  .arrow-btn {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    width: 26px;
    height: 26px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .arrow-btn:hover:not(:disabled) {
    color: var(--accent);
    border-color: var(--accent);
  }

  .pedal-name {
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    min-height: 40px;
  }

  .knobs-row {
    display: flex;
    gap: 1rem;
    margin: 0.5rem 0;
  }

  .knob-unit {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .knob-unit input[type="range"] {
    width: 100%;
  }

  .footswitch-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px dashed var(--border-subtle);
  }

  .led-light {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background-color: #333;
    border: 1px solid #555;
    transition: all 0.15s ease;
  }

  .led-on {
    background-color: var(--pedal-color);
    box-shadow: 0 0 10px var(--pedal-color);
  }

  .footswitch-btn {
    background-color: #2a2a35;
    border: 2px solid #555;
    color: var(--text-primary);
    padding: 0.45rem 1rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.75rem;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: all 0.1s ease;
  }

  .footswitch-btn:hover {
    background-color: #3a3a48;
  }

  .font-mono {
    font-family: var(--font-mono);
  }
</style>
