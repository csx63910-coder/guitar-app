<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  interface DilemmaCase {
    id: string;
    title: string;
    orderA: string;
    orderB: string;
    descriptionA: string;
    descriptionB: string;
    sonicResultA: string;
    sonicResultB: string;
    whyItHappens: string;
    recommendedFor: string;
  }

  const DILEMMAS: DilemmaCase[] = [
    {
      id: 'wah-fuzz',
      title: 'Wah Pedal vs. Vintage Fuzz Face',
      orderA: 'Guitar → Wah → Fuzz Face → Amp',
      orderB: 'Guitar → Fuzz Face → Wah → Amp',
      descriptionA: 'Vintage Fuzz Face expects direct inductive pickup connection. Buffered/Wah output causes extreme sweep dropouts and piercing feedback squeal.',
      descriptionB: 'Fuzz Face receives raw guitar impedance. The sweeping Wah filter comes AFTER the clipping stage, producing a dramatic, vocal synth-like sweep.',
      sonicResultA: 'Harsh, thin filter sweep with potential oscillation squeals.',
      sonicResultB: 'Rich, thick vocal filter sweeps with fat harmonic distortion.',
      whyItHappens: 'Vintage germanium/silicon Fuzz Faces have an extremely low input impedance (~10kΩ). A modern wah pedal’s output buffer destroys the guitar volume knob cleanup interaction unless an output buffer mod (Foxrox buffer) is installed.',
      recommendedFor: 'Order B (Fuzz before Wah) is classic Hendrix / Gilmour standard unless using an impedance buffer.'
    },
    {
      id: 'reverb-drive',
      title: 'Reverb into Overdrive vs. Overdrive into Reverb',
      orderA: 'Guitar → Reverb → High-Gain Overdrive → Amp (Pre-Drive)',
      orderB: 'Guitar → High-Gain Overdrive → Reverb → Amp (Post-Drive)',
      descriptionA: 'Every ambient echo and diffuse reverb reflection gets fed into clipping diodes and compressed into an explosive, surging wall of sound.',
      descriptionB: 'Clean, defined distorted notes with lush, spacious decay blooming behind each chord.',
      sonicResultA: 'Shoegaze / My Bloody Valentine wall of sound. Huge, chaotic texture.',
      sonicResultB: 'Pristine, articulate studio rock and lead guitar soloing.',
      whyItHappens: 'Distortion compresses dynamic peaks. When reverb is before drive, the quiet decay tails are artificially boosted by compressor gain, creating a swelling sonic explosion.',
      recommendedFor: 'Order A for Shoegaze / Post-Rock; Order B for classic Rock, Blues, and Metal.'
    },
    {
      id: 'fx-loop',
      title: 'Delay in Front of Amp vs. Delay in Effects Loop (FX Loop)',
      orderA: 'Guitar → Delay → High-Gain Amp Preamp Input',
      orderB: 'Guitar → High-Gain Amp Preamp → FX Loop (Delay) → Power Amp',
      descriptionA: 'Delay repeats are fed into high-gain 12AX7 tube saturation, making each successive echo increasingly distorted, compressed, and muddy.',
      descriptionB: 'Preamplifier generates the distortion tone first. Delay processes the already-distorted sound with pristine, clear stereo repeats.',
      sonicResultA: 'Vintage Eddie Van Halen / classic arena rock grittiness where repeats blend into rhythm crunch.',
      sonicResultB: 'Modern studio clarity; lead lines stay articulate and repeats never turn into a mushy blur.',
      whyItHappens: 'The FX loop sits BETWEEN the high-gain preamplifier (distortion generator) and the power amplifier (clean volume booster). Placing time-based effects in the loop prevents the distortion engine from re-distorting previously delayed echoes.',
      recommendedFor: 'Order B for high-gain amps (Mesa Rectifier, 5150); Order A for clean/edge-of-breakup amps.'
    }
  ];

  let selectedDilemmaId = $state('wah-fuzz');
  let activeTab = $state<'A' | 'B'>('A');

  const currentDilemma = $derived(
    DILEMMAS.find((d) => d.id === selectedDilemmaId) || DILEMMAS[0]
  );

  // Audio Demo Preview (synthesized A/B audition)
  let audioCtx: AudioContext | null = null;
  let isAuditioning = $state(false);

  function playAuditionSample() {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    isAuditioning = true;
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    if (activeTab === 'A') {
      // Order A preview (chaotic/raw)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(2200, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    } else {
      // Order B preview (articulate/lush)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.6);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + (activeTab === 'A' ? 1.2 : 1.6));

    setTimeout(() => {
      isAuditioning = false;
    }, 1600);
  }

  onDestroy(() => {
    if (audioCtx) audioCtx.close();
  });
</script>

<svelte:head>
  <title>#180 Interactive Signal-Path Explainer — Guitar Toolkit</title>
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
        <span class="badge badge-accent">#180 &middot; TONE &amp; PEDALBOARDS</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Interactive Signal-Path Explainer</h1>
      <p class="lead-text">
        Understand <em>why</em> pedal order fundamentally alters your guitar tone. Compare classic signal chain dilemmas (Wah vs. Fuzz, Reverb pre/post Drive, FX Loop vs. Front-of-Amp) with <strong>circuit impedance physics and A/B audio previews</strong>.
      </p>
    </header>

    <!-- Dilemma Selector Tabs -->
    <div class="dilemma-tabs">
      {#each DILEMMAS as d}
        <button
          class="tab-btn {selectedDilemmaId === d.id ? 'tab-active' : ''}"
          onclick={() => { selectedDilemmaId = d.id; activeTab = 'A'; }}
        >
          {d.title}
        </button>
      {/each}
    </div>

    <!-- Interactive Comparison Stage -->
    <div class="comparison-grid">
      <!-- Order A Card -->
      <button
        class="card-panel order-card {activeTab === 'A' ? 'order-card-active' : ''}"
        onclick={() => (activeTab = 'A')}
      >
        <div class="order-badge-row">
          <span class="badge badge-accent">CONFIG OPTION A</span>
          {#if activeTab === 'A'}<span class="badge badge-live">ACTIVE PREVIEW</span>{/if}
        </div>
        <h3 class="order-flow">{currentDilemma.orderA}</h3>
        <p class="order-desc">{currentDilemma.descriptionA}</p>
        <div class="sonic-badge-box">
          <span class="sonic-title">Sonic Character:</span>
          <strong>{currentDilemma.sonicResultA}</strong>
        </div>
      </button>

      <!-- Order B Card -->
      <button
        class="card-panel order-card {activeTab === 'B' ? 'order-card-active' : ''}"
        onclick={() => (activeTab = 'B')}
      >
        <div class="order-badge-row">
          <span class="badge badge-accent">CONFIG OPTION B</span>
          {#if activeTab === 'B'}<span class="badge badge-live">ACTIVE PREVIEW</span>{/if}
        </div>
        <h3 class="order-flow">{currentDilemma.orderB}</h3>
        <p class="order-desc">{currentDilemma.descriptionB}</p>
        <div class="sonic-badge-box">
          <span class="sonic-title">Sonic Character:</span>
          <strong>{currentDilemma.sonicResultB}</strong>
        </div>
      </button>
    </div>

    <!-- Audition Bar -->
    <div class="audition-bar">
      <button class="btn btn-primary" onclick={playAuditionSample} disabled={isAuditioning}>
        {isAuditioning ? '🔊 Auditioning...' : `▶ Audition Option ${activeTab} Synthetic Tone Preview`}
      </button>
      <span class="audition-hint">Click Config A or B above to switch audio routing comparison.</span>
    </div>

    <!-- Deep Electrical Physics Explanation -->
    <section class="card-panel physics-panel">
      <h2>Electrical &amp; Acoustic Physics: Why This Happens</h2>
      <p class="physics-body">{currentDilemma.whyItHappens}</p>

      <div class="luthier-rule-box">
        <strong>Luthier &amp; Engineer Rule of Thumb:</strong>
        <span>{currentDilemma.recommendedFor}</span>
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

  .dilemma-tabs {
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

  /* Comparison Grid */
  .comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .comparison-grid {
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

  .order-card {
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
    border-width: 2px;
  }

  .order-card:hover {
    border-color: var(--accent);
  }

  .order-card-active {
    border-color: var(--accent);
    background-color: rgba(245, 158, 11, 0.05);
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
  }

  .order-badge-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .order-flow {
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.4;
  }

  .order-desc {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }

  .sonic-badge-box {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
  }

  .sonic-title {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 700;
  }

  /* Audition Bar */
  .audition-bar {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    flex-wrap: wrap;
  }

  .audition-hint {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  /* Physics */
  .physics-panel h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .physics-body {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
  }

  .luthier-rule-box {
    background-color: rgba(16, 185, 129, 0.1);
    border-left: 3px solid #10b981;
    padding: 1rem;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: #e5e7eb;
  }
</style>
