<script lang="ts">
  import { onMount } from 'svelte';

  interface SkillScores {
    rhythm: number; // 0 to 100
    barre: number;
    fretboard: number;
    bends: number;
    picking: number;
  }

  let scores = $state<SkillScores>({
    rhythm: 75,
    barre: 50,
    fretboard: 40,
    bends: 65,
    picking: 70
  });

  const SKILL_NAMES = [
    { key: 'rhythm', label: 'Rhythm & Pocket', angle: -Math.PI / 2 },
    { key: 'barre', label: 'Barre Stamina', angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
    { key: 'fretboard', label: 'Fretboard Recall', angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
    { key: 'bends', label: 'Bend Accuracy', angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
    { key: 'picking', label: 'Alternate Picking', angle: -Math.PI / 2 + (8 * Math.PI) / 5 }
  ];

  const CX = 160;
  const CY = 160;
  const MAX_RADIUS = 110;

  // Radar Polygon Points calculation
  let polygonPoints = $derived(() => {
    return SKILL_NAMES.map((s) => {
      const val = scores[s.key as keyof SkillScores] / 100;
      const r = val * MAX_RADIUS;
      const x = CX + r * Math.cos(s.angle);
      const y = CY + r * Math.sin(s.angle);
      return `${x},${y}`;
    }).join(' ');
  });

  // Calculate Weakest and Strongest Areas
  let analysis = $derived(() => {
    const entries = Object.entries(scores) as [keyof SkillScores, number][];
    entries.sort((a, b) => a[1] - b[1]);

    const weakest = entries[0];
    const strongest = entries[entries.length - 1];

    let prescription = '';
    if (weakest[0] === 'fretboard') {
      prescription = 'Dedicate 10 minutes daily to Fretboard Memory Palace (#13) and Octave patterns. Internalize strings 6 and 5 first.';
    } else if (weakest[0] === 'barre') {
      prescription = 'Focus on biomechanical shoulder leverage and 30s isometric holds in the Barre Chord Gym (#16) before thumb cramps occur.';
    } else if (weakest[0] === 'rhythm') {
      prescription = 'Train with The Listening Metronome (#54) at 80 BPM to eliminate unconscious rushing on 8th-note downbeats.';
    } else if (weakest[0] === 'bends') {
      prescription = 'Use the Bend Trainer (#60) with 3-finger reinforcement behind the ring finger to hit full-step targets accurately.';
    } else {
      prescription = 'Run the Daily Riff Streak speed ladder (#148) with strict metronome clicks to synchronize pick and fretboard hands.';
    }

    return {
      weakestName: SKILL_NAMES.find((s) => s.key === weakest[0])?.label || '',
      weakestScore: weakest[1],
      strongestName: SKILL_NAMES.find((s) => s.key === strongest[0])?.label || '',
      strongestScore: strongest[1],
      prescription
    };
  });

  function saveProfile() {
    try {
      localStorage.setItem('guitar_weakness_radar', JSON.stringify(scores));
      alert('✅ Skill assessment profile saved locally!');
    } catch {}
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem('guitar_weakness_radar');
      if (saved) scores = JSON.parse(saved);
    } catch {}
  });
</script>

<svelte:head>
  <title>Guitarist Weakness Radar & Skill Assessment | Guitar Toolkit</title>
  <meta
    name="description"
    content="Diagnostic 5-axis spider chart skill assessment for guitarists. Pinpoint technique weak spots and get an algorithmic practice prescription."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Practice & Diagnostic</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#5 Skill Assessment</span>
      <span class="badge">5-Axis Spider Radar</span>
      <span class="badge">Targeted Prescription</span>
    </div>
    <h1>🕸️ Guitarist Weakness Radar & Skill Assessment</h1>
    <p class="tool-sub">
      Most guitarists practice what they are already good at. Grade yourself across the 5 fundamental technical pillars to generate a visual radar chart and an algorithmic daily practice prescription.
    </p>
  </div>

  <div class="main-layout-grid">
    <!-- Left Column: Interactive Sliders & Self-Grading -->
    <div class="grading-card">
      <h3>📊 Grade Your Technical Proficiencies (0–100)</h3>

      <div class="sliders-list">
        <div class="slider-box">
          <div class="slider-top">
            <span class="slider-title">Rhythm & Pocket Timing</span>
            <span class="slider-val">{scores.rhythm} / 100</span>
          </div>
          <input type="range" min="10" max="100" bind:value={scores.rhythm} />
          <span class="slider-hint">Subdivision consistency, playing on the beat without rushing</span>
        </div>

        <div class="slider-box">
          <div class="slider-top">
            <span class="slider-title">Barre Chord Stamina</span>
            <span class="slider-val">{scores.barre} / 100</span>
          </div>
          <input type="range" min="10" max="100" bind:value={scores.barre} />
          <span class="slider-hint">Clean 6-string ring without thumb cramping or joint buzzing</span>
        </div>

        <div class="slider-box">
          <div class="slider-top">
            <span class="slider-title">Fretboard Note Recall</span>
            <span class="slider-val">{scores.fretboard} / 100</span>
          </div>
          <input type="range" min="10" max="100" bind:value={scores.fretboard} />
          <span class="slider-hint">Instant note location across all 6 strings without counting up</span>
        </div>

        <div class="slider-box">
          <div class="slider-top">
            <span class="slider-title">String Bending Accuracy</span>
            <span class="slider-val">{scores.bends} / 100</span>
          </div>
          <input type="range" min="10" max="100" bind:value={scores.bends} />
          <span class="slider-hint">Hitting &plusmn;10 cent pitch target on whole and half step bends</span>
        </div>

        <div class="slider-box">
          <div class="slider-top">
            <span class="slider-title">Alternate Picking Synchronization</span>
            <span class="slider-val">{scores.picking} / 100</span>
          </div>
          <input type="range" min="10" max="100" bind:value={scores.picking} />
          <span class="slider-hint">Clean 16th note alternate picking at high tempos without hand tension</span>
        </div>
      </div>

      <button type="button" class="save-profile-btn" onclick={saveProfile}>
        💾 SAVE RADAR PROFILE
      </button>
    </div>

    <!-- Right Column: SVG Spider Radar Visualizer -->
    <div class="radar-card">
      <h3>🕸️ Your Technical Skill Polygon</h3>

      <div class="svg-radar-container">
        <svg viewBox="0 0 320 320" class="radar-svg">
          <!-- Background Concentric Rings (20%, 40%, 60%, 80%, 100%) -->
          {#each [0.2, 0.4, 0.6, 0.8, 1.0] as ring}
            <circle cx={CX} cy={CY} r={ring * MAX_RADIUS} fill="none" stroke="#1f2937" stroke-width="1.5" />
          {/each}

          <!-- Radial Axis Lines -->
          {#each SKILL_NAMES as s}
            {@const x = CX + MAX_RADIUS * Math.cos(s.angle)}
            {@const y = CY + MAX_RADIUS * Math.sin(s.angle)}
            <line x1={CX} y1={CY} x2={x} y2={y} stroke="#374151" stroke-width="1" stroke-dasharray="2,2" />
            <!-- Axis Label -->
            {@const labelR = MAX_RADIUS + 24}
            {@const lx = CX + labelR * Math.cos(s.angle)}
            {@const ly = CY + labelR * Math.sin(s.angle) + 4}
            <text x={lx} y={ly} fill="#9ca3af" font-size="9" font-weight="bold" text-anchor="middle">
              {s.label}
            </text>
          {/each}

          <!-- Filled Skill Polygon -->
          <polygon
            points={polygonPoints()}
            fill="rgba(56, 189, 248, 0.25)"
            stroke="#38bdf8"
            stroke-width="2.5"
          />

          <!-- Vertex Points -->
          {#each SKILL_NAMES as s}
            {@const val = scores[s.key as keyof SkillScores] / 100}
            {@const r = val * MAX_RADIUS}
            {@const vx = CX + r * Math.cos(s.angle)}
            {@const vy = CY + r * Math.sin(s.angle)}
            <circle cx={vx} cy={vy} r="4.5" fill="#f59e0b" />
          {/each}
        </svg>
      </div>

      <!-- Diagnostic Prescription Box -->
      <div class="prescription-card">
        <div class="presc-head">
          <span class="bottleneck-tag">PRIMARY BOTTLENECK:</span>
          <span class="bottleneck-name">{analysis().weakestName} ({analysis().weakestScore}%)</span>
        </div>
        <p class="presc-text">{analysis().prescription}</p>
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
    background: rgba(14, 165, 233, 0.15);
    color: #0ea5e9;
    border-color: rgba(14, 165, 233, 0.4);
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

  .main-layout-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 800px) {
    .main-layout-grid {
      grid-template-columns: 1fr;
    }
  }

  .grading-card, .radar-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
  }
  h3 {
    margin: 0 0 16px;
    font-size: 1.15rem;
    color: #f3f4f6;
  }

  .sliders-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
  }
  .slider-box {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 12px;
  }
  .slider-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .slider-title {
    font-weight: 700;
    font-size: 0.85rem;
    color: #f3f4f6;
  }
  .slider-val {
    font-weight: 800;
    font-size: 0.85rem;
    color: #38bdf8;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #38bdf8;
  }
  .slider-hint {
    font-size: 0.7rem;
    color: #6b7280;
    display: block;
    margin-top: 4px;
  }

  .save-profile-btn {
    width: 100%;
    background: #1f2937;
    border: 1px solid #374151;
    color: #38bdf8;
    font-weight: 700;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
  }
  .save-profile-btn:hover {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
  }

  .svg-radar-container {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }
  .radar-svg {
    width: 100%;
    max-width: 320px;
    height: auto;
  }

  .prescription-card {
    background: #182232;
    border-left: 4px solid #f59e0b;
    border-radius: 0 6px 6px 0;
    padding: 16px;
  }
  .presc-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  .bottleneck-tag {
    font-size: 0.7rem;
    font-weight: 800;
    color: #f59e0b;
  }
  .bottleneck-name {
    font-size: 0.85rem;
    font-weight: 800;
    color: #ffffff;
  }
  .presc-text {
    margin: 0;
    font-size: 0.85rem;
    color: #d1d5db;
    line-height: 1.5;
  }
</style>
