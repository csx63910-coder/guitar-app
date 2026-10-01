<script lang="ts">
  import { onMount } from 'svelte';

  interface Circuit {
    id: string;
    title: string;
    subtitle: string;
    category: 'strat' | 'tele' | 'lp' | 'mods';
    pots: string;
    caps: string;
    switchType: string;
    description: string;
    positions: { name: string; pickups: string; toneNotes: string }[];
    bom: { item: string; qty: number; spec: string }[];
  }

  const CIRCUITS: Circuit[] = [
    {
      id: 'strat-standard',
      title: 'Standard Stratocaster (5-Way Blade)',
      subtitle: 'Classic 3 Single-Coil with Master Volume and Dual Tone Controls',
      category: 'strat',
      pots: '3x 250kΩ Audio Taper (CTS style)',
      caps: '1x 0.047µF (or 0.022µF for brighter tone) Polyester Film',
      switchType: 'Oak Grigsby or CRL 5-Way Blade Switch',
      description: 'The golden standard Stratocaster circuit. Tone 1 controls the neck pickup, Tone 2 controls the middle pickup, leaving the bridge pickup wide open for maximum bite and presence (or bridge tone mod).',
      positions: [
        { name: 'Pos 1: Bridge', pickups: 'Bridge single coil alone', toneNotes: 'Wide open bite, bypasses standard tone pot' },
        { name: 'Pos 2: Bridge + Middle', pickups: 'Parallel in-between quack', toneNotes: 'Classic funk quack, hum-cancelling if middle is RWRP' },
        { name: 'Pos 3: Middle', pickups: 'Middle single coil alone', toneNotes: 'Controlled by Tone 2 pot (0.047µF)' },
        { name: 'Pos 4: Middle + Neck', pickups: 'Parallel Hendrix chime', toneNotes: 'Controlled by Tone 1 & Tone 2 concurrently' },
        { name: 'Pos 5: Neck', pickups: 'Neck single coil alone', toneNotes: 'Warm glassy blues tone, controlled by Tone 1 pot' }
      ],
      bom: [
        { item: 'CTS 250k Audio Potentiometer', qty: 3, spec: 'Short shaft split-knurled (3/8" bushing)' },
        { item: '5-Way CRL / Oak Grigsby Switch', qty: 1, spec: 'Heavy-duty spring action lever' },
        { item: '0.047µF Tone Capacitor', qty: 1, spec: 'Orange Drop 225P or Mallory 150 (100V)' },
        { item: 'Switchcraft #11 1/4" Mono Output Jack', qty: 1, spec: 'Mil-spec open-frame jack' },
        { item: 'Gavitt 22 AWG Vintage Cloth Push-Back Wire', qty: 3, spec: 'Feet (Black ground + White signal)' }
      ]
    },
    {
      id: 'tele-4way',
      title: 'Telecaster 4-Way Mod (Series + Parallel)',
      subtitle: 'Adds Humbucker-Like Punch to a Traditional 2-Single Telecaster',
      category: 'tele',
      pots: '2x 250kΩ Audio Taper',
      caps: '1x 0.047µF or 0.022µF Capacitor',
      switchType: 'Oak Grigsby 4-Way Blade Switch',
      description: 'The premier Telecaster wiring mod. Keeps all traditional 3 Tele sounds intact, but adds Position 4 which connects the Bridge and Neck in series instead of parallel, yielding higher output, fat midrange, and zero hum like a PAF humbucker.',
      positions: [
        { name: 'Pos 1: Bridge', pickups: 'Bridge pickup alone', toneNotes: 'Classic Tele twang and cut' },
        { name: 'Pos 2: Bridge + Neck (Parallel)', pickups: 'Both pickups parallel', toneNotes: 'Hollow, acoustic-like Tele chime' },
        { name: 'Pos 3: Neck', pickups: 'Neck pickup alone', toneNotes: 'Warm jazzy roundness' },
        { name: 'Pos 4: Bridge + Neck (SERIES)', pickups: 'Both pickups wired in series', toneNotes: 'Fat, high-output pseudo-humbucker rhythm crunch' }
      ],
      bom: [
        { item: 'Oak Grigsby 4-Way Blade Switch', qty: 1, spec: 'Special terminal layout for series pairing' },
        { item: 'CTS 250k Solid Shaft Audio Pot', qty: 2, spec: 'For Tele barrel knobs' },
        { item: '0.047µF Tone Capacitor', qty: 1, spec: 'Sprague Orange Drop' },
        { item: 'Separate Neck Cover Ground Wire', qty: 1, spec: 'Crucial: Unclip neck cover tab from black lead and run dedicated ground wire' }
      ]
    },
    {
      id: 'lp-50s',
      title: 'Les Paul 1950s Vintage Wiring',
      subtitle: 'Preserves Treble Clarity When Rolling Down Volume Controls',
      category: 'lp',
      pots: '4x 500kΩ Audio Taper (Long or Short Shaft)',
      caps: '2x 0.022µF Paper-in-Oil or Mylar Capacitors',
      switchType: 'Switchcraft Long Straight 3-Way Toggle Switch',
      description: 'In 50s wiring, the tone capacitor is connected to the middle wiper (output) of the volume pot instead of the input lug. As you roll down volume from 10 to 7, highs stay crisp and articulate instead of turning into muddy mush.',
      positions: [
        { name: 'Bridge Only', pickups: 'Bridge Humbucker', toneNotes: 'Independent bridge volume & bridge tone' },
        { name: 'Both (Middle)', pickups: 'Bridge + Neck in parallel', toneNotes: 'Dual blend capability: either volume pot acts as master' },
        { name: 'Neck Only', pickups: 'Neck Humbucker', toneNotes: 'Full creamy neck sustain with dynamic roll-off' }
      ],
      bom: [
        { item: 'CTS 500k Audio Pots', qty: 4, spec: 'Long shaft for LP carved maple top, short shaft for Special/Junior' },
        { item: '0.022µF Vintage Capacitors', qty: 2, spec: 'Luxe Bumblebee or Orange Drop 715P' },
        { item: 'Switchcraft 3-Way Long Toggle', qty: 1, spec: 'Deep nut with knurled bezel' },
        { item: 'Braided 1-Conductor Shielded Wire', qty: 4, spec: 'Feet of Gibson vintage tinned wire' }
      ]
    },
    {
      id: 'humbucker-coil-split',
      title: 'Humbucker Coil-Split & Phase Push-Pull Mod',
      subtitle: 'Converts 4-Conductor Humbuckers into Spanky Single-Coil Modes',
      category: 'mods',
      pots: '1x 500k DPDT Push-Pull Pot + Standard Pots',
      caps: '0.022µF Tone Cap',
      switchType: 'Integrated DPDT 6-Pin Mini Toggle on Pot Base',
      description: 'Shunts the series junction (North Finish + South Finish) of a 4-conductor humbucker to ground when the pot knob is pulled up, muting one coil and leaving an authentic Strat-style single-coil voice.',
      positions: [
        { name: 'Knob Pushed Down (Normal)', pickups: 'Full Humbucker in Series', toneNotes: 'Full low-end punch, thick output, hum-cancelling' },
        { name: 'Knob Pulled Up (Split)', pickups: 'North Slug Coil Active Only', toneNotes: 'Crisp high-end bite, single coil dynamics, glassier cleans' }
      ],
      bom: [
        { item: 'CTS / Bourns 500k DPDT Push-Pull Pot', qty: 1, spec: 'Integrated double-pole double-throw switch' },
        { item: '1.1kΩ Resistor (Partial Split Option)', qty: 1, spec: 'PRS style partial split resistor (prevents single-coil volume drop)' }
      ]
    },
    {
      id: 'treble-bleed',
      title: 'Treble Bleed (Volume Bypass) Networks',
      subtitle: 'Stop High-Frequency Loss at Low Volume Settings',
      category: 'mods',
      pots: 'Works on any 250k or 500k Volume Pot',
      caps: '1000pF (0.001µF) Silver Mica or Ceramic',
      switchType: 'Wired across Input & Wiper lugs of Volume Pot',
      description: 'Guitar volume pots act as a low-pass filter when dialed back due to cable capacitance. Adding a RC treble bleed network across lugs 1 and 2 allows treble frequencies to bypass the resistance divider, keeping high-end shimmer at 3 on the volume dial.',
      positions: [
        { name: 'Kinman Style', pickups: 'Capacitor in series with Resistor', toneNotes: '1.2nF cap + 130kΩ resistor. Consistent taper with no treble boost.' },
        { name: 'Duncan Style (Parallel)', pickups: 'Capacitor in parallel with Resistor', toneNotes: '1000pF cap + 100kΩ resistor. Best all-around for modern Strats & Teles.' },
        { name: 'Simple Cap Only', pickups: 'Single capacitor without resistor', toneNotes: '1000pF cap alone. Can sound overly bright when dialed down to 2-3.' }
      ],
      bom: [
        { item: '1000pF (1nF) 100V Silver Mica Cap', qty: 1, spec: 'Zero microphonics and temperature stability' },
        { item: '150kΩ 1/4W Metal Film Resistor', qty: 1, spec: '1% tolerance' },
        { item: 'Heat-shrink Tubing', qty: 1, spec: 'Protects leads across pot terminals' }
      ]
    }
  ];

  interface ColorCode {
    brand: string;
    hot: string;
    seriesLink: string;
    ground: string;
    shield: string;
    notes: string;
  }

  const COLOR_CODES: ColorCode[] = [
    { brand: 'Seymour Duncan', hot: 'Black', seriesLink: 'White + Red', ground: 'Green', shield: 'Bare Wire', notes: 'Most common aftermarket standard' },
    { brand: 'DiMarzio', hot: 'Red', seriesLink: 'Black + White', ground: 'Green', shield: 'Bare Wire', notes: 'Red is hot (opposite of Duncan)' },
    { brand: 'Gibson (Modern 4-Conductor)', hot: 'Red', seriesLink: 'White + Green', ground: 'Black', shield: 'Bare Wire', notes: 'Black is ground on Gibson' },
    { brand: 'Fender (Enforcer / Atomic)', hot: 'Green', seriesLink: 'Red + White', ground: 'Black', shield: 'Bare Wire', notes: 'Green is hot' },
    { brand: 'Bare Knuckle', hot: 'Red', seriesLink: 'Green + White', ground: 'Black', shield: 'Bare Wire', notes: 'British color scheme' },
    { brand: 'PRS (Modern)', hot: 'White', seriesLink: 'Black + Red', ground: 'Green', shield: 'Bare Wire', notes: 'Varying vintages may differ' }
  ];

  let selectedCircuitId = $state('strat-standard');
  let selectedPositionIdx = $state(0);
  let activeTab = $state<'diagram' | 'bom' | 'colorcodes' | 'theory'>('diagram');

  let currentCircuit = $derived(
    CIRCUITS.find((c) => c.id === selectedCircuitId) || CIRCUITS[0]
  );
</script>

<svelte:head>
  <title>Interactive Guitar Wiring Diagram Generator | Guitar Toolkit</title>
  <meta
    name="description"
    content="Free interactive guitar wiring diagram generator with color-coded schematics, pickup switch position simulator, pickup wire color matrix, and bill of materials."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Wiring & Electronics</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#76 Interactive Tool</span>
      <span class="badge">100% Free & Offline</span>
      <span class="badge">Workbench Reference</span>
    </div>
    <h1>⚡ Interactive Guitar Wiring Diagram Generator</h1>
    <p class="tool-sub">
      Schematics, color-coded wire traces, switch position audio preview notes, pickup wire brand translator, and complete bill of materials for DIY guitar upgrades.
    </p>
  </div>

  <!-- Circuit Selection Grid -->
  <div class="circuit-selector">
    <div class="selector-label">SELECT GUITAR CIRCUIT ARCHITECTURE:</div>
    <div class="circuit-chips">
      {#each CIRCUITS as circuit}
        <button
          type="button"
          class="circuit-chip"
          class:active={circuit.id === selectedCircuitId}
          onclick={() => {
            selectedCircuitId = circuit.id;
            selectedPositionIdx = 0;
          }}
        >
          <span class="chip-title">{circuit.title}</span>
          <span class="chip-sub">{circuit.subtitle}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Circuit Details & Controls -->
  <div class="circuit-overview-card">
    <div class="overview-header">
      <div>
        <h2>{currentCircuit.title}</h2>
        <p class="overview-desc">{currentCircuit.description}</p>
      </div>
      <div class="spec-pills">
        <div class="spec-pill">
          <span class="pill-label">Pots:</span>
          <span class="pill-val">{currentCircuit.pots}</span>
        </div>
        <div class="spec-pill">
          <span class="pill-label">Tone Cap:</span>
          <span class="pill-val">{currentCircuit.caps}</span>
        </div>
        <div class="spec-pill">
          <span class="pill-label">Switch:</span>
          <span class="pill-val">{currentCircuit.switchType}</span>
        </div>
      </div>
    </div>

    <!-- Mode Tabs -->
    <div class="tab-row">
      <button
        type="button"
        class="tab-btn"
        class:active={activeTab === 'diagram'}
        onclick={() => (activeTab = 'diagram')}
      >
        🔌 Interactive Diagram & Switch
      </button>
      <button
        type="button"
        class="tab-btn"
        class:active={activeTab === 'bom'}
        onclick={() => (activeTab = 'bom')}
      >
        📋 Bill of Materials (BOM)
      </button>
      <button
        type="button"
        class="tab-btn"
        class:active={activeTab === 'colorcodes'}
        onclick={() => (activeTab = 'colorcodes')}
      >
        🎨 Pickup Wire Color Matrix
      </button>
      <button
        type="button"
        class="tab-btn"
        class:active={activeTab === 'theory'}
        onclick={() => (activeTab = 'theory')}
      >
        💡 Pot & Cap Selection Theory
      </button>
    </div>

    {#if activeTab === 'diagram'}
      <!-- Switch Position Simulator -->
      <div class="switch-simulator">
        <div class="sim-header">
          <span class="sim-title">SWITCH POSITION SIMULATOR</span>
          <span class="sim-hint">Click a position below to trace active pickups and circuit behavior:</span>
        </div>
        <div class="position-buttons">
          {#each currentCircuit.positions as pos, idx}
            <button
              type="button"
              class="pos-btn"
              class:active={selectedPositionIdx === idx}
              onclick={() => (selectedPositionIdx = idx)}
            >
              <span class="pos-num">#{idx + 1}</span>
              <span class="pos-name">{pos.name}</span>
            </button>
          {/each}
        </div>

        <div class="pos-status-banner">
          <div class="status-left">
            <span class="status-tag">Active Signal:</span>
            <strong>{currentCircuit.positions[selectedPositionIdx]?.pickups}</strong>
          </div>
          <div class="status-right">
            <span class="status-tag">Tone Characteristics:</span>
            <span>{currentCircuit.positions[selectedPositionIdx]?.toneNotes}</span>
          </div>
        </div>
      </div>

      <!-- Interactive SVG Schematic Visualizer -->
      <div class="diagram-viewer">
        <div class="svg-container">
          <svg viewBox="0 0 900 480" class="wiring-svg" xmlns="http://www.w3.org/2000/svg">
            <!-- Background Grid & Bench Surface -->
            <rect width="900" height="480" fill="#0d1117" rx="10" />
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1f2937" stroke-width="0.5" />
              </pattern>
              <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#9ca3af" />
                <stop offset="50%" stop-color="#d1d5db" />
                <stop offset="100%" stop-color="#6b7280" />
              </linearGradient>
              <linearGradient id="copper" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#f59e0b" />
                <stop offset="100%" stop-color="#b45309" />
              </linearGradient>
            </defs>
            <rect width="900" height="480" fill="url(#grid)" rx="10" />

            <!-- Pickups Section (Left) -->
            <g transform="translate(60, 40)">
              <text x="70" y="20" fill="#9ca3af" font-family="monospace" font-size="12" text-anchor="middle">PICKUPS</text>
              
              <!-- Neck Pickup -->
              <rect x="0" y="40" width="140" height="50" rx="8" fill="#1f2937" stroke={selectedPositionIdx >= 3 ? '#f59e0b' : '#374151'} stroke-width="2" />
              <circle cx="25" cy="65" r="5" fill="#9ca3af" />
              <circle cx="45" cy="65" r="5" fill="#9ca3af" />
              <circle cx="65" cy="65" r="5" fill="#9ca3af" />
              <circle cx="85" cy="65" r="5" fill="#9ca3af" />
              <circle cx="105" cy="65" r="5" fill="#9ca3af" />
              <circle cx="125" cy="65" r="5" fill="#9ca3af" />
              <text x="70" y="85" fill={selectedPositionIdx >= 3 ? '#fbbf24' : '#6b7280'} font-size="10" font-weight="bold" text-anchor="middle">NECK PICKUP</text>

              <!-- Middle Pickup (for Strat) -->
              {#if currentCircuit.category === 'strat'}
                <rect x="0" y="130" width="140" height="50" rx="8" fill="#1f2937" stroke={selectedPositionIdx === 1 || selectedPositionIdx === 2 || selectedPositionIdx === 3 ? '#f59e0b' : '#374151'} stroke-width="2" />
                <circle cx="25" cy="155" r="5" fill="#9ca3af" />
                <circle cx="45" cy="155" r="5" fill="#9ca3af" />
                <circle cx="65" cy="155" r="5" fill="#9ca3af" />
                <circle cx="85" cy="155" r="5" fill="#9ca3af" />
                <circle cx="105" cy="155" r="5" fill="#9ca3af" />
                <circle cx="125" cy="155" r="5" fill="#9ca3af" />
                <text x="70" y="175" fill={selectedPositionIdx === 1 || selectedPositionIdx === 2 || selectedPositionIdx === 3 ? '#fbbf24' : '#6b7280'} font-size="10" font-weight="bold" text-anchor="middle">MIDDLE (RWRP)</text>
              {/if}

              <!-- Bridge Pickup -->
              <rect x="0" y="220" width="140" height="50" rx="8" fill="#1f2937" stroke={selectedPositionIdx <= 1 ? '#f59e0b' : '#374151'} stroke-width="2" />
              <circle cx="25" cy="245" r="5" fill="#9ca3af" />
              <circle cx="45" cy="245" r="5" fill="#9ca3af" />
              <circle cx="65" cy="245" r="5" fill="#9ca3af" />
              <circle cx="85" cy="245" r="5" fill="#9ca3af" />
              <circle cx="105" cy="245" r="5" fill="#9ca3af" />
              <circle cx="125" cy="245" r="5" fill="#9ca3af" />
              <text x="70" y="265" fill={selectedPositionIdx <= 1 ? '#fbbf24' : '#6b7280'} font-size="10" font-weight="bold" text-anchor="middle">BRIDGE PICKUP</text>
            </g>

            <!-- Selector Switch (Center-Left) -->
            <g transform="translate(320, 60)">
              <rect x="0" y="20" width="100" height="180" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2" />
              <text x="50" y="10" fill="#9ca3af" font-family="monospace" font-size="11" text-anchor="middle">5-WAY / TOGGLE</text>
              
              <!-- Switch Lugs (Left Side) -->
              <circle cx="10" cy="50" r="5" fill="#e2e8f0" stroke="#0284c7" stroke-width="2" />
              <circle cx="10" cy="80" r="5" fill="#e2e8f0" stroke="#0284c7" stroke-width="2" />
              <circle cx="10" cy="110" r="5" fill="#e2e8f0" stroke="#0284c7" stroke-width="2" />
              <circle cx="10" cy="140" r="5" fill="#e2e8f0" stroke="#0284c7" stroke-width="2" />

              <!-- Switch Lugs (Right Side) -->
              <circle cx="90" cy="50" r="5" fill="#e2e8f0" stroke="#f59e0b" stroke-width="2" />
              <circle cx="90" cy="80" r="5" fill="#e2e8f0" stroke="#f59e0b" stroke-width="2" />
              <circle cx="90" cy="110" r="5" fill="#e2e8f0" stroke="#f59e0b" stroke-width="2" />
              <circle cx="90" cy="140" r="5" fill="#e2e8f0" stroke="#f59e0b" stroke-width="2" />
              <text x="50" y="100" fill="#38bdf8" font-size="12" font-family="monospace" text-anchor="middle">BLADE</text>
            </g>

            <!-- Potentiometers Section (Right Side) -->
            <g transform="translate(540, 50)">
              <!-- Volume Pot -->
              <g transform="translate(0, 0)">
                <circle cx="70" cy="60" r="45" fill="url(#metal)" stroke="#374151" stroke-width="3" />
                <circle cx="70" cy="60" r="16" fill="#111827" />
                <text x="70" y="64" fill="#f3f4f6" font-size="11" font-weight="bold" text-anchor="middle">VOL</text>
                <text x="70" y="120" fill="#9ca3af" font-size="10" font-family="monospace" text-anchor="middle">250kΩ / 500kΩ</text>
                
                <!-- Lugs: 1 (Ground), 2 (Wiper/Jack), 3 (Input from switch) -->
                <rect x="35" y="10" width="12" height="15" rx="2" fill="url(#copper)" />
                <rect x="64" y="10" width="12" height="15" rx="2" fill="url(#copper)" />
                <rect x="93" y="10" width="12" height="15" rx="2" fill="url(#copper)" />
                <text x="41" y="5" fill="#9ca3af" font-size="9" text-anchor="middle">GND</text>
                <text x="70" y="5" fill="#38bdf8" font-size="9" text-anchor="middle">WIPER</text>
                <text x="99" y="5" fill="#f59e0b" font-size="9" text-anchor="middle">HOT IN</text>
              </g>

              <!-- Tone 1 Pot -->
              <g transform="translate(0, 160)">
                <circle cx="70" cy="60" r="45" fill="url(#metal)" stroke="#374151" stroke-width="3" />
                <circle cx="70" cy="60" r="16" fill="#111827" />
                <text x="70" y="64" fill="#f3f4f6" font-size="11" font-weight="bold" text-anchor="middle">TONE 1</text>
                <text x="70" y="120" fill="#9ca3af" font-size="10" font-family="monospace" text-anchor="middle">0.047µF Cap</text>
                
                <!-- Capacitor representation -->
                <rect x="85" y="45" width="30" height="18" rx="4" fill="#f97316" stroke="#c2410c" stroke-width="1.5" />
                <text x="100" y="58" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">.047</text>
              </g>

              <!-- Tone 2 Pot -->
              <g transform="translate(0, 310)">
                <circle cx="70" cy="40" r="35" fill="url(#metal)" stroke="#374151" stroke-width="3" />
                <text x="70" y="44" fill="#f3f4f6" font-size="10" font-weight="bold" text-anchor="middle">TONE 2</text>
              </g>
            </g>

            <!-- Output Jack (Far Right) -->
            <g transform="translate(760, 180)">
              <rect x="0" y="20" width="80" height="90" rx="6" fill="#1f2937" stroke="#4b5563" stroke-width="2" />
              <circle cx="40" cy="65" r="14" fill="#030712" stroke="#9ca3af" stroke-width="3" />
              <text x="40" y="15" fill="#9ca3af" font-family="monospace" font-size="11" text-anchor="middle">OUTPUT JACK</text>
              <!-- Jack Lugs -->
              <circle cx="25" cy="30" r="5" fill="#38bdf8" />
              <text x="25" y="45" fill="#38bdf8" font-size="8" text-anchor="middle">TIP (+)</text>
              <circle cx="55" cy="30" r="5" fill="#10b981" />
              <text x="55" y="45" fill="#10b981" font-size="8" text-anchor="middle">SLEEVE (GND)</text>
            </g>

            <!-- Traced Signal Wires (Color-Coded) -->
            <!-- Neck Hot Wire -->
            <path d="M 200 105 C 260 105, 270 110, 330 110" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="none" />
            <!-- Middle Hot Wire -->
            {#if currentCircuit.category === 'strat'}
              <path d="M 200 195 C 260 195, 270 140, 330 140" fill="none" stroke="#a855f7" stroke-width="3" />
            {/if}
            <!-- Bridge Hot Wire -->
            <path d="M 200 285 C 260 285, 270 170, 330 170" fill="none" stroke="#f59e0b" stroke-width="3" />

            <!-- Switch to Volume Master Wire -->
            <path d="M 410 110 C 470 110, 520 60, 633 60" fill="none" stroke="#f59e0b" stroke-width="4" />

            <!-- Volume Wiper to Output Jack Tip -->
            <path d="M 604 60 C 670 60, 710 210, 785 210" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="4,2" />

            <!-- Master Ground Bus (Green) -->
            <path d="M 575 60 C 575 140, 575 220, 815 210" fill="none" stroke="#10b981" stroke-width="3" />

            <!-- Legend Overlay -->
            <g transform="translate(30, 420)">
              <rect width="840" height="45" rx="6" fill="#111827" stroke="#374151" />
              <circle cx="30" cy="22" r="6" fill="#f59e0b" />
              <text x="45" y="26" fill="#e5e7eb" font-size="11">Bridge Hot / Signal</text>

              <circle cx="210" cy="22" r="6" fill="#38bdf8" />
              <text x="225" y="26" fill="#e5e7eb" font-size="11">Neck Hot / Jack Tip (+)</text>

              <circle cx="410" cy="22" r="6" fill="#a855f7" />
              <text x="425" y="26" fill="#e5e7eb" font-size="11">Middle Coil / Tap</text>

              <circle cx="580" cy="22" r="6" fill="#10b981" />
              <text x="595" y="26" fill="#e5e7eb" font-size="11">Ground Bus (Jack Sleeve -)</text>
            </g>
          </svg>
        </div>
      </div>
    {:else if activeTab === 'bom'}
      <!-- Bill of Materials Section -->
      <div class="bom-table-container">
        <h3>🛒 Bill of Materials (BOM) & Parts List</h3>
        <p class="tab-sub">Exact values and specs required to wire the <strong>{currentCircuit.title}</strong>:</p>
        <table class="bom-table">
          <thead>
            <tr>
              <th>Qty</th>
              <th>Component Item</th>
              <th>Recommended Spec / Value</th>
              <th>Wiring Notes</th>
            </tr>
          </thead>
          <tbody>
            {#each currentCircuit.bom as item}
              <tr>
                <td class="qty-cell">{item.qty}x</td>
                <td class="item-cell"><strong>{item.item}</strong></td>
                <td class="spec-cell">{item.spec}</td>
                <td class="notes-cell">CTS/Bourns low-torque audio taper; test tolerance &plusmn;10% with multimeter before soldering.</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if activeTab === 'colorcodes'}
      <!-- Pickup Wire Color Matrix -->
      <div class="color-matrix-container">
        <h3>🎨 4-Conductor Pickup Wire Color Code Matrix</h3>
        <p class="tab-sub">Each manufacturer uses different colored insulation for coil starts and finishes. Never guess or solder blindly:</p>
        
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Pickup Brand</th>
              <th>Hot Output (+)</th>
              <th>Series Link (Coil Tap)</th>
              <th>Ground (-)</th>
              <th>Ground Shield</th>
              <th>Key Notes</th>
            </tr>
          </thead>
          <tbody>
            {#each COLOR_CODES as code}
              <tr>
                <td><strong>{code.brand}</strong></td>
                <td><span class="color-badge" style="background: #374151; color: #f9fafb;">{code.hot}</span></td>
                <td><span class="color-badge" style="background: #4b5563; color: #fbbf24;">{code.seriesLink}</span></td>
                <td><span class="color-badge" style="background: #1f2937; color: #34d399;">{code.ground}</span></td>
                <td><span class="color-badge" style="background: #111827; color: #9ca3af;">{code.shield}</span></td>
                <td class="notes-col">{code.notes}</td>
              </tr>
            {/each}
          </tbody>
        </table>

        <div class="tip-card">
          <h4>⚡ Pro Luthier Solder Tip:</h4>
          <p>
            When pairing pickups from two different brands (e.g. a Seymour Duncan in the bridge and a DiMarzio in the neck), their coils will frequently be <strong>out-of-phase</strong> in the middle position (producing a thin, nasal honk). If this happens, swap the hot and ground wires of ONE pickup to reverse electrical polarity.
          </p>
        </div>
      </div>
    {:else if activeTab === 'theory'}
      <!-- Pot & Cap Theory -->
      <div class="theory-container">
        <h3>💡 Potentiometer & Tone Capacitor Science</h3>
        <div class="theory-grid">
          <div class="theory-card">
            <h4>250kΩ vs 500kΩ vs 1MΩ Pots</h4>
            <p>
              The resistance value of your volume pot forms a path to ground even when fully cranked to 10.
            </p>
            <ul>
              <li><strong>250kΩ (Single Coils):</strong> Bleeds off high shrill frequencies to ground, warming up naturally bright Strat and Tele pickups.</li>
              <li><strong>500kΩ (Humbuckers):</strong> Retains more high-end clarity and prevents dark, muddy humbuckers from choking.</li>
              <li><strong>1MΩ (Jazzmaster / Wide Range):</strong> Maximum bright shimmer and ultra-fast dynamic transient attack.</li>
            </ul>
          </div>

          <div class="theory-card">
            <h4>Capacitor Values: .022µF vs .047µF</h4>
            <p>
              Your tone pot and capacitor form a variable low-pass RC filter.
            </p>
            <ul>
              <li><strong>0.047µF (Standard Fender):</strong> Darker roll-off, rolling highs off earlier in the frequency spectrum.</li>
              <li><strong>0.022µF (Standard Gibson):</strong> More gradual roll-off, retaining vocal midrange qualities when dialed back to 3–5.</li>
              <li><strong>0.015µF ("Woman Tone"):</strong> Eric Clapton Cream mod. Retains clear high-mids for creamy singing solos.</li>
            </ul>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .tool-container {
    max-width: 1100px;
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

  .circuit-selector {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
  }
  .selector-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #6b7280;
    letter-spacing: 0.05em;
    margin-bottom: 10px;
  }
  .circuit-chips {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
  }
  .circuit-chip {
    text-align: left;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 10px 14px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .circuit-chip:hover {
    border-color: #f59e0b;
    background: #283548;
  }
  .circuit-chip.active {
    background: rgba(245, 158, 11, 0.12);
    border-color: #f59e0b;
  }
  .chip-title {
    display: block;
    font-weight: 700;
    font-size: 0.9rem;
    color: #f3f4f6;
  }
  .chip-sub {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 2px;
  }

  .circuit-overview-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
  }
  .overview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    border-bottom: 1px solid #1f2937;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
  .overview-header h2 {
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0 0 6px;
    color: #f59e0b;
  }
  .overview-desc {
    font-size: 0.9rem;
    color: #9ca3af;
    margin: 0;
    line-height: 1.5;
  }

  .spec-pills {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 260px;
  }
  .spec-pill {
    background: #1f2937;
    border: 1px solid #374151;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    display: flex;
    justify-content: space-between;
  }
  .pill-label {
    color: #9ca3af;
  }
  .pill-val {
    color: #f3f4f6;
    font-weight: 600;
  }

  .tab-row {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid #374151;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .tab-btn {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #9ca3af;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 10px 16px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .tab-btn:hover {
    color: #f3f4f6;
  }
  .tab-btn.active {
    color: #f59e0b;
    border-bottom-color: #f59e0b;
  }

  .switch-simulator {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 14px;
    margin-bottom: 16px;
  }
  .sim-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 0.8rem;
  }
  .sim-title {
    font-weight: 700;
    color: #38bdf8;
  }
  .sim-hint {
    color: #6b7280;
  }

  .position-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .pos-btn {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    color: #d1d5db;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
  }
  .pos-btn:hover {
    border-color: #38bdf8;
  }
  .pos-btn.active {
    background: rgba(56, 189, 248, 0.15);
    border-color: #38bdf8;
    color: #38bdf8;
  }
  .pos-num {
    font-weight: 700;
    background: #111827;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.75rem;
  }

  .pos-status-banner {
    display: flex;
    justify-content: space-between;
    background: #161e2e;
    border: 1px solid #1e293b;
    border-radius: 4px;
    padding: 10px 14px;
    font-size: 0.85rem;
    flex-wrap: wrap;
    gap: 12px;
  }
  .status-tag {
    color: #9ca3af;
    margin-right: 6px;
  }

  .diagram-viewer {
    background: #030712;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 10px;
  }
  .svg-container {
    width: 100%;
    overflow-x: auto;
  }
  .wiring-svg {
    width: 100%;
    min-width: 650px;
    height: auto;
    display: block;
  }

  /* BOM Table */
  .bom-table-container, .color-matrix-container, .theory-container {
    padding: 8px 0;
  }
  h3 {
    margin: 0 0 6px;
    font-size: 1.15rem;
    color: #f3f4f6;
  }
  .tab-sub {
    font-size: 0.85rem;
    color: #9ca3af;
    margin: 0 0 16px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    margin-bottom: 20px;
  }
  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #1f2937;
  }
  th {
    background: #1f2937;
    color: #9ca3af;
    font-size: 0.75rem;
    text-transform: uppercase;
  }
  .qty-cell {
    color: #f59e0b;
    font-weight: 700;
  }
  .spec-cell {
    color: #38bdf8;
  }

  .color-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .tip-card {
    background: #182232;
    border-left: 4px solid #f59e0b;
    padding: 14px 18px;
    border-radius: 0 6px 6px 0;
  }
  .tip-card h4 {
    margin: 0 0 4px;
    color: #f59e0b;
  }
  .tip-card p {
    margin: 0;
    font-size: 0.85rem;
    color: #d1d5db;
    line-height: 1.5;
  }

  .theory-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }
  .theory-card {
    background: #161e2e;
    border: 1px solid #1f2937;
    padding: 16px;
    border-radius: 6px;
  }
  .theory-card h4 {
    margin: 0 0 8px;
    color: #38bdf8;
    font-size: 1rem;
  }
  .theory-card p {
    font-size: 0.85rem;
    color: #9ca3af;
    margin: 0 0 10px;
    line-height: 1.4;
  }
  .theory-card ul {
    margin: 0;
    padding-left: 18px;
    font-size: 0.85rem;
    color: #d1d5db;
    line-height: 1.5;
  }
</style>
