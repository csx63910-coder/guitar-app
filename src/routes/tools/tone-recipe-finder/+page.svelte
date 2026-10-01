<script lang="ts">
  import { onMount } from 'svelte';

  interface ToneRecipe {
    id: string;
    artist: string;
    song: string;
    year: string;
    genre: string;
    guitar: {
      type: string;
      pickup: string;
      volume: string;
      tone: string;
      strings: string;
    };
    amp: {
      model: string;
      type: string;
      gain: number;
      bass: number;
      mid: number;
      treble: number;
      presence: number;
    };
    pedalChain: {
      order: number;
      name: string;
      type: string;
      settings: string;
    }[];
    secretSauce: string;
    audioProfile: {
      distortion: number;
      cutoff: number;
      delayTime: number;
      delayFeedback: number;
    };
  }

  const RECIPES: ToneRecipe[] = [
    {
      id: 'gilmour-numb',
      artist: 'David Gilmour (Pink Floyd)',
      song: 'Comfortably Numb (Outro Solo)',
      year: '1979',
      genre: 'Classic / Progressive Rock',
      guitar: {
        type: 'Black Stratocaster (Maple Neck)',
        pickup: 'Seymour Duncan Custom SSL-1C (Bridge)',
        volume: '10 (Wide Open)',
        tone: '7.5 (Tamed High-End)',
        strings: 'GHS Boomers Custom Light (10-12-16-28-38-48)'
      },
      amp: {
        model: 'Hiwatt DR103 Custom 100W Head + WEM 4x12 (Fane Crescendo Speakers)',
        type: 'High-Headroom Clean Tube',
        gain: 4,
        bass: 6.5,
        mid: 7,
        treble: 5.5,
        presence: 6
      },
      pedalChain: [
        { order: 1, name: 'Electro-Harmonix "Ram\'s Head" Big Muff Pi', type: 'Fuzz', settings: 'Sustain: 70%, Tone: 45%, Vol: 60%' },
        { order: 2, name: 'Colorsound Power Boost / Overdriver', type: 'EQ / Boost', settings: 'Treble: 12:00, Bass: 1:00, Gain: slight edge' },
        { order: 3, name: 'Electro-Harmonix Electric Mistress', type: 'Flanger', settings: 'Rate: 9:00, Range: 1:00, Color: 10:00 (Subtle swirl)' },
        { order: 4, name: 'MXR Phase 90 (Script)', type: 'Phaser', settings: 'Speed: 9:30' },
        { order: 5, name: 'Binson Echorec 2 / Digital Delay', type: 'Echo', settings: '440ms quarter note, 4-5 repeats, mix 35%' }
      ],
      secretSauce: 'Gilmour does not use high-gain amps: he stacks a Big Muff fuzz into a clean, massive-headroom Hiwatt power amp with a mild flanger to round off the fuzz fizzy edges.',
      audioProfile: { distortion: 0.85, cutoff: 3200, delayTime: 0.44, delayFeedback: 0.45 }
    },
    {
      id: 'srv-texas',
      artist: 'Stevie Ray Vaughan',
      song: 'Texas Flood / Pride and Joy',
      year: '1983',
      genre: 'Electric Texas Blues',
      guitar: {
        type: "'Number One' 1963 Stratocaster (Rosewood Slab)",
        pickup: 'Custom 1959 Single Coils (Neck or Neck+Middle)',
        volume: '8.5 - 10',
        tone: '8 (Full Bell Clarity)',
        strings: 'Heavy Heavy Gauges: .013 to .058 tuned to Eb (Half-Step Down)'
      },
      amp: {
        model: 'Fender Vibroverb (15" JBL Speaker) + Dumble Steel String Singer',
        type: 'Cranked Tube with 15" Bass Punch',
        gain: 7.5,
        bass: 8,
        mid: 6.5,
        treble: 7,
        presence: 7.5
      },
      pedalChain: [
        { order: 1, name: 'Ibanez TS808 / TS9 Tube Screamer', type: 'Overdrive', settings: 'Drive: 9:00 (Very Low), Level: Max 10 (Boost), Tone: 11:30' },
        { order: 2, name: 'Vox V846 / Dallas Arbiter Fuzz Face', type: 'Fuzz (occasional)', settings: 'Fuzz: 80%, Volume: 70%' }
      ],
      secretSauce: 'The TS808 is NOT used for heavy distortion; it is used as a clean midrange mid-hump booster (Gain low, Level max) pushing an already screaming tube amp into organic power-tube saturation.',
      audioProfile: { distortion: 0.55, cutoff: 4500, delayTime: 0.12, delayFeedback: 0.15 }
    },
    {
      id: 'evh-brown',
      artist: 'Eddie Van Halen',
      song: 'Eruption / Ain\'t Talkin\' \'Bout Love',
      year: '1978',
      genre: 'Hard Rock / Glam Metal',
      guitar: {
        type: "'Frankenstrat' (Ash body, Maple neck)",
        pickup: 'Gibson PAF rewound & dipped in paraffin wax (Bridge alone, slanted)',
        volume: '10 (Single knob labeled "Tone")',
        tone: 'None (Bypassed completely)',
        strings: 'Fender 150XL (.009 - .040)'
      },
      amp: {
        model: '1968 Marshall 100W Super Lead Plexi (Variac starved to 90V AC)',
        type: 'Starved-Voltage Power Tube Overdrive',
        gain: 10,
        bass: 2,
        mid: 8,
        treble: 6,
        presence: 5
      },
      pedalChain: [
        { order: 1, name: 'MXR Phase 90 (Script Logo)', type: 'Phaser', settings: 'Speed: 9:00 (Engaged during tapping and solos)' },
        { order: 2, name: 'MXR 6-Band Graphic EQ', type: 'Mid Boost', settings: 'Frown curve boosting 800Hz and 1.6kHz by +4dB' },
        { order: 3, name: 'Echoplex EP-3 Tape Echo', type: 'Preamp / Delay', settings: 'Echo off or slapback (EP-3 preamp colorates tone)' }
      ],
      secretSauce: 'The Variac step-down transformer dropped AC wall voltage from 120V to 90V, causing the Marshall power tubes to sag early with smooth sponge-like compression and thick "brown" harmonics.',
      audioProfile: { distortion: 0.75, cutoff: 4000, delayTime: 0.22, delayFeedback: 0.25 }
    },
    {
      id: 'the-edge-streets',
      artist: 'The Edge (U2)',
      song: 'Where the Streets Have No Name',
      year: '1987',
      genre: 'Post-Punk / Arena Rock',
      guitar: {
        type: '1973 Fender Stratocaster (Black, Maple Fretboard)',
        pickup: 'Position 2 or 4 (In-between quack)',
        volume: '10',
        tone: '9',
        strings: '.010 - .046 with Herdim nylon pick (gripped sideways with dimples scraping strings)'
      },
      amp: {
        model: '1964 Vox AC30 Top Boost (Celestion Blue Alnico Speakers)',
        type: 'Chimey Class-A Tube',
        gain: 5.5,
        bass: 4,
        mid: 7,
        treble: 7.5,
        presence: 8
      },
      pedalChain: [
        { order: 1, name: 'Korg SDD-3000 Preamp / Digital Delay', type: 'Preamp + Delay', settings: 'Dotted-Eighth (355ms at 126 BPM), 3-4 repeats, Modulation depth 30%' },
        { order: 2, name: 'Electro-Harmonix Memory Man (Secondary Delay)', type: 'Analog Delay', settings: 'Quarter-note anchor' },
        { order: 3, name: 'Boss FA-1 FET Amplifier', type: 'Clean Boost', settings: 'Flat boost with low-cut engaged' }
      ],
      secretSauce: 'Dotted-eighth delay math: Edge plays simple, sparse straight 8th notes, and the 3/16 delay bounce fills in every 16th-note gap, sounding like a torrential wall of 3 guitars.',
      audioProfile: { distortion: 0.35, cutoff: 5800, delayTime: 0.355, delayFeedback: 0.6 }
    },
    {
      id: 'mayer-gravity',
      artist: 'John Mayer (Continuum)',
      song: 'Gravity / Slow Dancing in a Burning Room',
      year: '2006',
      genre: 'Contemporary Neo-Blues',
      guitar: {
        type: "'The Black One' Custom Shop Stratocaster",
        pickup: 'Big Dipper Single Coils with Scooped Midrange (Position 4: Neck + Middle)',
        volume: '8 - 9',
        tone: '8',
        strings: 'Ernie Ball Regular Slinky (.010 - .046)'
      },
      amp: {
        model: 'Two-Rock Custom Reverb Signature + Dumble Overdrive Special',
        type: 'Transparent Boutique High-Headroom Clean',
        gain: 3.5,
        bass: 6,
        mid: 4.5,
        treble: 7,
        presence: 6.5
      },
      pedalChain: [
        { order: 1, name: 'Keeley Katana Clean Boost', type: 'Clean Boost', settings: 'Knob pulled out (+15dB clean high-headroom boost)' },
        { order: 2, name: 'Marshall Bluesbreaker (Original Vintage)', type: 'Transparent Drive', settings: 'Gain: 11:00, Tone: 1:00, Vol: 2:00' },
        { order: 3, name: 'Ibanez TS10 Tube Screamer', type: 'Mid-Hump Drive', settings: 'Drive: 10:00, Level: 2:00, Tone: 11:00' },
        { order: 4, name: 'Way Huge Aqua-Puss Analog Delay', type: 'Slapback', settings: 'Delay: 9:00 (Very short slap), Feedback: 1-2 repeats, Blend: 40%' }
      ],
      secretSauce: 'Scooped mids from the "Big Dipper" pickups are balanced by stacking two gentle overdrives (Bluesbreaker for transparent grit + TS10 for vocal mid-hump) into massive clean wattage.',
      audioProfile: { distortion: 0.45, cutoff: 5000, delayTime: 0.14, delayFeedback: 0.2 }
    }
  ];

  let searchQuery = $state('');
  let selectedRecipeId = $state('gilmour-numb');
  let isPlayingPreview = $state(false);

  let activeRecipe = $derived(
    RECIPES.find((r) => r.id === selectedRecipeId) || RECIPES[0]
  );

  let filteredRecipes = $derived(
    RECIPES.filter(
      (r) =>
        r.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.song.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.genre.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Web Audio Tone Synthesis
  let audioCtx: AudioContext | null = null;

  function playToneDemo() {
    if (isPlayingPreview) return;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    isPlayingPreview = true;
    const now = audioCtx.currentTime;
    const prof = activeRecipe.audioProfile;

    // Guitar Lick Synth (E4 -> G4 -> A4 -> B4)
    const freqs = [329.63, 392.0, 440.0, 493.88];
    const duration = 0.5;

    freqs.forEach((freq, i) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      const shaper = audioCtx.createWaveShaper();
      const delay = audioCtx.createDelay();
      const delayFeedback = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * duration);

      // Waveshaper distortion
      const curve = makeDistortionCurve(prof.distortion * 50);
      shaper.curve = curve;
      shaper.oversample = '4x';

      // Lowpass Filter for Tone & Amp Cab simulation
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(prof.cutoff, now);
      filter.Q.setValueAtTime(2.0, now);

      // Delay Line
      delay.delayTime.setValueAtTime(prof.delayTime, now);
      delayFeedback.gain.setValueAtTime(prof.delayFeedback, now);

      // Pluck Gain Envelope
      gain.gain.setValueAtTime(0.001, now + i * duration);
      gain.gain.linearRampToValueAtTime(0.2, now + i * duration + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * duration + duration * 0.95);

      // Routing
      osc.connect(gain);
      gain.connect(shaper);
      shaper.connect(filter);
      filter.connect(audioCtx.destination);

      // Connect Delay
      filter.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay);
      delay.connect(audioCtx.destination);

      osc.start(now + i * duration);
      osc.stop(now + i * duration + duration);
    });

    setTimeout(() => {
      isPlayingPreview = false;
    }, (freqs.length * duration + prof.delayTime * 3) * 1000);
  }

  function makeDistortionCurve(amount: number): Float32Array {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
</script>

<svelte:head>
  <title>"How Do I Get This Tone?" Recipe Finder | Guitar Toolkit</title>
  <meta
    name="description"
    content="Instant tone recipes for iconic guitar solos and songs. Exact pickup selector positions, amp tone stack dials, pedal order, and secret sauce."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Tone & Rig Engineering</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#63 Tone Engine</span>
      <span class="badge">Iconic Rig Recipes</span>
      <span class="badge">Audio DSP Simulation</span>
    </div>
    <h1>🎸 "How Do I Get This Tone?" Recipe Finder</h1>
    <p class="tool-sub">
      Exact blueprints to dial in iconic recorded tones. Guitar pickup selections, amp tone-stack knob positions (Bass, Mid, Treble), pedalboard signal orders, and luthier secrets.
    </p>
  </div>

  <!-- Search & Recipe Selection -->
  <div class="selector-card">
    <div class="search-row">
      <input
        type="search"
        placeholder="Search tone by artist, song, or genre (e.g. Gilmour, Eruption, Blues)..."
        bind:value={searchQuery}
      />
    </div>

    <div class="recipes-list">
      {#each filteredRecipes as recipe}
        <button
          type="button"
          class="recipe-tab-btn"
          class:active={recipe.id === selectedRecipeId}
          onclick={() => (selectedRecipeId = recipe.id)}
        >
          <span class="recipe-tab-song">{recipe.song}</span>
          <span class="recipe-tab-artist">{recipe.artist} ({recipe.year})</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Main Recipe Blueprint -->
  <div class="recipe-blueprint-card">
    <div class="blueprint-header">
      <div>
        <span class="genre-pill">{activeRecipe.genre}</span>
        <h2>{activeRecipe.song}</h2>
        <h3 class="artist-name">By {activeRecipe.artist} ({activeRecipe.year})</h3>
      </div>
      <button
        type="button"
        class="demo-listen-btn"
        disabled={isPlayingPreview}
        onclick={playToneDemo}
      >
        {isPlayingPreview ? '🔊 AUDITIONING TONE...' : '▶ AUDITION SYNTH TONE'}
      </button>
    </div>

    <!-- 3 Core Pillars: Guitar, Amp, and Pedals -->
    <div class="pillars-grid">
      <!-- Pillar 1: Instrument Setup -->
      <div class="pillar-box">
        <div class="pillar-title">1. GUITAR & PICKUPS</div>
        <div class="pillar-content">
          <div class="field-item">
            <span class="field-label">Instrument:</span>
            <span class="field-val">{activeRecipe.guitar.type}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Pickup Selector:</span>
            <span class="field-val highlight">{activeRecipe.guitar.pickup}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Volume Pot:</span>
            <span class="field-val">{activeRecipe.guitar.volume}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Tone Pot:</span>
            <span class="field-val">{activeRecipe.guitar.tone}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Strings:</span>
            <span class="field-val">{activeRecipe.guitar.strings}</span>
          </div>
        </div>
      </div>

      <!-- Pillar 2: Amp Tone Stack -->
      <div class="pillar-box">
        <div class="pillar-title">2. AMP TONE-STACK DIALS</div>
        <div class="pillar-content">
          <div class="field-item">
            <span class="field-label">Amplifier:</span>
            <span class="field-val">{activeRecipe.amp.model}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Architecture:</span>
            <span class="field-val">{activeRecipe.amp.type}</span>
          </div>

          <!-- Knob Dials Visualizer -->
          <div class="knob-grid">
            <div class="knob-item">
              <div class="knob-circle">{activeRecipe.amp.gain}</div>
              <span class="knob-label">Gain</span>
            </div>
            <div class="knob-item">
              <div class="knob-circle">{activeRecipe.amp.bass}</div>
              <span class="knob-label">Bass</span>
            </div>
            <div class="knob-item">
              <div class="knob-circle">{activeRecipe.amp.mid}</div>
              <span class="knob-label">Mid</span>
            </div>
            <div class="knob-item">
              <div class="knob-circle">{activeRecipe.amp.treble}</div>
              <span class="knob-label">Treble</span>
            </div>
            <div class="knob-item">
              <div class="knob-circle">{activeRecipe.amp.presence}</div>
              <span class="knob-label">Presence</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pillar 3: Pedalboard Signal Chain -->
    <div class="pedalboard-container">
      <div class="pillar-title">3. PEDALBOARD SIGNAL CHAIN (IN ORDER)</div>
      <div class="pedal-chain-row">
        {#each activeRecipe.pedalChain as pedal}
          <div class="pedal-stomp-box">
            <span class="pedal-order">#{pedal.order} &bull; {pedal.type}</span>
            <span class="pedal-name">{pedal.name}</span>
            <span class="pedal-knobs">{pedal.settings}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Secret Sauce Callout -->
    <div class="secret-sauce-box">
      <h4>⚡ The Secret Sauce (Studio & Luthier Nuance)</h4>
      <p>{activeRecipe.secretSauce}</p>
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

  .selector-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
  }
  .search-row input {
    width: 100%;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-bottom: 12px;
  }

  .recipes-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 8px;
  }
  .recipe-tab-btn {
    text-align: left;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 10px 12px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .recipe-tab-btn:hover {
    border-color: #f59e0b;
  }
  .recipe-tab-btn.active {
    background: rgba(245, 158, 11, 0.15);
    border-color: #f59e0b;
  }
  .recipe-tab-song {
    display: block;
    font-weight: 700;
    font-size: 0.85rem;
    color: #f3f4f6;
  }
  .recipe-tab-artist {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 2px;
  }

  .recipe-blueprint-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 24px;
  }
  .blueprint-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #1f2937;
    padding-bottom: 20px;
    margin-bottom: 20px;
    gap: 20px;
    flex-wrap: wrap;
  }
  .genre-pill {
    background: #1f2937;
    color: #38bdf8;
    border: 1px solid #374151;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .blueprint-header h2 {
    font-size: 1.6rem;
    font-weight: 800;
    margin: 8px 0 2px;
    color: #f9fafb;
  }
  .artist-name {
    font-size: 1rem;
    color: #f59e0b;
    margin: 0;
    font-weight: 600;
  }
  .demo-listen-btn {
    background: #0284c7;
    color: #ffffff;
    border: none;
    font-weight: 700;
    font-size: 0.85rem;
    padding: 10px 18px;
    border-radius: 6px;
    cursor: pointer;
  }
  .demo-listen-btn:hover {
    background: #0369a1;
  }
  .demo-listen-btn:disabled {
    opacity: 0.5;
  }

  .pillars-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  @media (max-width: 768px) {
    .pillars-grid {
      grid-template-columns: 1fr;
    }
  }

  .pillar-box {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 16px;
  }
  .pillar-title {
    font-size: 0.8rem;
    font-weight: 800;
    color: #38bdf8;
    letter-spacing: 0.05em;
    margin-bottom: 14px;
    border-bottom: 1px solid #1f2937;
    padding-bottom: 6px;
  }

  .field-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px dashed #1f2937;
  }
  .field-label {
    color: #9ca3af;
  }
  .field-val {
    color: #f3f4f6;
    font-weight: 600;
    text-align: right;
  }
  .field-val.highlight {
    color: #f59e0b;
  }

  .knob-grid {
    display: flex;
    justify-content: space-around;
    gap: 8px;
    margin-top: 16px;
    background: #111827;
    padding: 12px 6px;
    border-radius: 6px;
  }
  .knob-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .knob-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #1f2937;
    border: 2px solid #f59e0b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.95rem;
    color: #f9fafb;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);
  }
  .knob-label {
    font-size: 0.7rem;
    color: #9ca3af;
    text-transform: uppercase;
  }

  .pedalboard-container {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .pedal-chain-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }
  .pedal-stomp-box {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .pedal-order {
    font-size: 0.65rem;
    color: #f59e0b;
    font-weight: 700;
    text-transform: uppercase;
  }
  .pedal-name {
    font-weight: 700;
    font-size: 0.85rem;
    color: #f3f4f6;
    margin: 4px 0 6px;
  }
  .pedal-knobs {
    font-size: 0.75rem;
    color: #9ca3af;
    font-family: monospace;
    line-height: 1.3;
  }

  .secret-sauce-box {
    background: #182232;
    border-left: 4px solid #f59e0b;
    border-radius: 0 6px 6px 0;
    padding: 16px 20px;
  }
  .secret-sauce-box h4 {
    margin: 0 0 6px;
    color: #f59e0b;
    font-size: 0.95rem;
  }
  .secret-sauce-box p {
    margin: 0;
    font-size: 0.85rem;
    color: #d1d5db;
    line-height: 1.5;
  }
</style>
