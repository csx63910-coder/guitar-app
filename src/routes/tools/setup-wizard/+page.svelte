<script lang="ts">
  import { onMount } from 'svelte';

  interface GuitarSpec {
    id: string;
    name: string;
    reliefTarget: string; // e.g. "0.010 in (0.25 mm)"
    actionLowETarget: string; // e.g. "4/64 in (1.6 mm)"
    actionHighETarget: string; // e.g. "3/64 in (1.2 mm)"
    pickupNeckTarget: string; // e.g. "6/64 in (2.4 mm)"
    pickupBridgeTarget: string; // e.g. "5/64 in (2.0 mm)"
    trussRodNut: string;
    bridgeAdjustmentType: string;
  }

  const SPECS: Record<string, GuitarSpec> = {
    strat: {
      id: 'strat',
      name: 'Fender Stratocaster / Telecaster',
      reliefTarget: '0.010 in (0.25 mm) — thickness of a business card',
      actionLowETarget: '4/64 in (1.6 mm) at 17th fret',
      actionHighETarget: '3/64 in (1.2 mm) at 17th fret',
      pickupNeckTarget: '6/64 in (2.4 mm) from pole to string',
      pickupBridgeTarget: '5/64 in (2.0 mm) from pole to string',
      trussRodNut: '3/16" or 1/8" Allen Hex Key at headstock (or heel vintage cross)',
      bridgeAdjustmentType: 'Individual hex saddle height screws (0.050" Allen)'
    },
    lespaul: {
      id: 'lespaul',
      name: 'Gibson Les Paul / SG (Tune-o-matic)',
      reliefTarget: '0.010 in (0.25 mm)',
      actionLowETarget: '4/64 in (1.6 mm) at 12th fret',
      actionHighETarget: '3/64 in (1.2 mm) at 12th fret',
      pickupNeckTarget: '6/64 in (2.4 mm) (Humbucker)',
      pickupBridgeTarget: '4/64 in (1.6 mm) (Humbucker)',
      trussRodNut: '5/16" Brass Hex Nut wrench under bell truss cover',
      bridgeAdjustmentType: 'Tune-o-matic thumbwheels on bridge posts'
    },
    acoustic: {
      id: 'acoustic',
      name: 'Steel-String Acoustic (Martin / Taylor style)',
      reliefTarget: '0.008 - 0.010 in (0.20 - 0.25 mm)',
      actionLowETarget: '6/64 in (2.4 mm) at 12th fret',
      actionHighETarget: '4/64 in (1.6 mm) at 12th fret',
      pickupNeckTarget: 'Under-saddle Piezo (N/A)',
      pickupBridgeTarget: 'Internal transducer / soundhole mag',
      trussRodNut: 'Internal soundhole hex wrench (4mm or 5mm)',
      bridgeAdjustmentType: 'Sanding bone saddle bottom on flat block'
    },
    bass: {
      id: 'bass',
      name: '4-String Electric Bass (P / J-Bass)',
      reliefTarget: '0.014 in (0.35 mm)',
      actionLowETarget: '6/64 in (2.4 mm) at 17th fret (E string)',
      actionHighETarget: '5/64 in (2.0 mm) at 17th fret (G string)',
      pickupNeckTarget: '8/64 in (3.2 mm)',
      pickupBridgeTarget: '6/64 in (2.4 mm)',
      trussRodNut: '3/16" Allen key or spoke wheel',
      bridgeAdjustmentType: 'Individual bridge saddle hex screws'
    }
  };

  let selectedGuitar = $state<'strat' | 'lespaul' | 'acoustic' | 'bass'>('strat');
  let currentStep = $state<1 | 2 | 3 | 4>(1);

  // Measurements Input
  let measuredRelief = $state<'too_flat' | 'ideal' | 'too_much'>('ideal');
  let measuredActionLow = $state(1.8); // mm
  let measuredActionHigh = $state(1.4); // mm
  let measuredPickupNeck = $state(2.5); // mm
  let measuredPickupBridge = $state(2.0); // mm

  let spec = $derived(SPECS[selectedGuitar]);

  // Truss rod advice
  let trussAdvice = $derived(() => {
    if (measuredRelief === 'too_flat') {
      return {
        issue: 'Neck is completely flat or in Backbow (Fret buzz in frets 1–5)',
        fix: 'Loosen the truss rod by turning COUNTER-CLOCKWISE 1/8th to 1/4th turn. Relieve tension to let string pull create necessary forward bow.',
        caution: 'Never force a stuck nut. Apply penetrating lubricant if binding.'
      };
    } else if (measuredRelief === 'too_much') {
      return {
        issue: 'Too much forward relief / High action in frets 5–12',
        fix: 'Tighten the truss rod by turning CLOCKWISE 1/8th turn. This pulls the headstock back and flattens the fretboard.',
        caution: 'Tighten in small 1/8th turn increments, then retune and recheck.'
      };
    } else {
      return {
        issue: 'Neck relief is ideal (~0.010" / 0.25mm)',
        fix: 'Truss rod is dialed in perfectly! Move straight to Step 2 (Bridge Action).',
        caution: 'No truss rod adjustment needed.'
      };
    }
  });

  // Action advice
  let actionAdvice = $derived(() => {
    const targetLow = selectedGuitar === 'acoustic' || selectedGuitar === 'bass' ? 2.4 : 1.6;
    const diff = measuredActionLow - targetLow;
    if (Math.abs(diff) <= 0.2) {
      return 'Action is within golden spec! Playing feel should be fast with minimal buzz.';
    } else if (diff > 0.2) {
      return `Action is ${Math.round(diff * 10) / 10} mm higher than standard spec. Lower the ${spec.bridgeAdjustmentType} by lowering screws/thumbwheels counter-clockwise.`;
    } else {
      return `Action is very low. If you experience buzz on middle frets, raise the bridge saddles slightly clockwise.`;
    }
  });

  function printSpecSheet() {
    window.print();
  }
</script>

<svelte:head>
  <title>Complete Guitar Setup Wizard | Guitar Toolkit</title>
  <meta
    name="description"
    content="Interactive step-by-step guitar setup wizard. Diagnose neck relief, bridge action, intonation, and pickup height in the correct luthier order of operations."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header no-print">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Luthier & Bench</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#79 Bench Wizard</span>
      <span class="badge">Luthier Order of Operations</span>
      <span class="badge">Printable Work Order</span>
    </div>
    <h1>🔧 Complete Guitar Setup Wizard</h1>
    <p class="tool-sub">
      Follow the mandatory 4-step order of operations (Relief &rarr; Action &rarr; Intonation &rarr; Pickups). Diagnoses buzzes, stiff fretting, and outputs exact saddle turns and truss rod specs.
    </p>
  </div>

  <!-- Instrument Type Selector -->
  <div class="instrument-selector no-print">
    <span class="sel-label">SELECT GUITAR PLATFORM:</span>
    <div class="inst-chips">
      {#each Object.keys(SPECS) as key}
        <button
          type="button"
          class="inst-chip"
          class:active={selectedGuitar === key}
          onclick={() => (selectedGuitar = key as any)}
        >
          {SPECS[key].name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Setup Order Progress Steps -->
  <div class="steps-nav no-print">
    <button
      type="button"
      class="step-tab"
      class:active={currentStep === 1}
      onclick={() => (currentStep = 1)}
    >
      <span class="step-num">STEP 1</span>
      <span class="step-title">Neck Relief (Truss Rod)</span>
    </button>

    <button
      type="button"
      class="step-tab"
      class:active={currentStep === 2}
      onclick={() => (currentStep = 2)}
    >
      <span class="step-num">STEP 2</span>
      <span class="step-title">Action (Bridge Saddles)</span>
    </button>

    <button
      type="button"
      class="step-tab"
      class:active={currentStep === 3}
      onclick={() => (currentStep = 3)}
    >
      <span class="step-num">STEP 3</span>
      <span class="step-title">Intonation (Saddle Travel)</span>
    </button>

    <button
      type="button"
      class="step-tab"
      class:active={currentStep === 4}
      onclick={() => (currentStep = 4)}
    >
      <span class="step-num">STEP 4</span>
      <span class="step-title">Pickup Height & Print</span>
    </button>
  </div>

  <!-- Active Step Interactive Card -->
  <div class="step-card">
    {#if currentStep === 1}
      <!-- STEP 1: TRUSS ROD -->
      <div class="step-content">
        <div class="step-badge">STEP 1 OF 4 &bull; MANDATORY FIRST STEP</div>
        <h2>Truss Rod & Neck Relief Calibration</h2>
        <p class="step-desc">
          <strong>Why first:</strong> The truss rod counteracts string tension along the neck. Adjusting neck relief changes string height everywhere, so adjusting bridge saddles before the neck is straight wastes your time.
        </p>

        <!-- Measurement Instructions -->
        <div class="how-to-box">
          <h4>📏 How to Measure Relief with Household Items:</h4>
          <ol>
            <li>Put a capo on the 1st fret (or hold down Low E at 1st fret).</li>
            <li>Press down and hold the Low E string at the last fret where the neck joins the body (usually 17th or 21st fret). The string now forms a straight edge!</li>
            <li>Inspect the gap between the bottom of the string and top of the <strong>7th or 8th fret wire</strong>.</li>
            <li><strong>Target Gap:</strong> 0.010" (0.25mm) — <em>exact thickness of a standard business card</em>.</li>
          </ol>
        </div>

        <div class="measurement-selector">
          <span class="meas-label">WHAT DOES YOUR 7TH FRET GAP LOOK LIKE?</span>
          <div class="relief-options">
            <button
              type="button"
              class="relief-btn"
              class:active={measuredRelief === 'too_flat'}
              onclick={() => (measuredRelief = 'too_flat')}
            >
              <span class="opt-title">No Gap / String Resting on Fret</span>
              <span class="opt-sub">Backbow / Too Flat (Buzz on frets 1–5)</span>
            </button>

            <button
              type="button"
              class="relief-btn"
              class:active={measuredRelief === 'ideal'}
              onclick={() => (measuredRelief = 'ideal')}
            >
              <span class="opt-title">Slight Gap (~Business Card)</span>
              <span class="opt-sub">Target relief (0.010" / 0.25 mm)</span>
            </button>

            <button
              type="button"
              class="relief-btn"
              class:active={measuredRelief === 'too_much'}
              onclick={() => (measuredRelief = 'too_much')}
            >
              <span class="opt-title">Large Gap (> Credit Card)</span>
              <span class="opt-sub">Excessive forward bow (High action in center)</span>
            </button>
          </div>
        </div>

        <!-- Diagnostic Prescription -->
        <div class="prescription-box">
          <h4>🛠️ Luthier Prescription:</h4>
          <div class="presc-content">
            <div class="presc-row">
              <span class="presc-label">Assessment:</span>
              <strong class="presc-val">{trussAdvice().issue}</strong>
            </div>
            <div class="presc-row">
              <span class="presc-label">Required Fix:</span>
              <span class="presc-fix">{trussAdvice().fix}</span>
            </div>
            <div class="presc-row">
              <span class="presc-label">Wrench Spec:</span>
              <span>{spec.trussRodNut}</span>
            </div>
          </div>
        </div>

        <div class="step-footer-nav">
          <span></span>
          <button type="button" class="next-btn" onclick={() => (currentStep = 2)}>
            PROCEED TO STEP 2 (ACTION) &rarr;
          </button>
        </div>
      </div>

    {:else if currentStep === 2}
      <!-- STEP 2: BRIDGE ACTION -->
      <div class="step-content">
        <div class="step-badge">STEP 2 OF 4</div>
        <h2>Bridge Saddle Action & String Height</h2>
        <p class="step-desc">
          Measure string clearance from the top of the 12th or 17th fret wire to the bottom of the open string (no fretting or capo).
        </p>

        <div class="action-inputs-grid">
          <div class="action-input-card">
            <label class="action-label" for="action-low-e">LOW E STRING HEIGHT (12TH FRET)</label>
            <div class="val-display">{measuredActionLow} mm ({Math.round(measuredActionLow * 25.4 * 64 / 25.4) / 10} / 64")</div>
            <input
              id="action-low-e"
              type="range"
              min="1.0"
              max="3.5"
              step="0.1"
              bind:value={measuredActionLow}
            />
            <span class="spec-target-text">Target: {spec.actionLowETarget}</span>
          </div>

          <div class="action-input-card">
            <label class="action-label" for="action-high-e">HIGH E STRING HEIGHT (12TH FRET)</label>
            <div class="val-display">{measuredActionHigh} mm ({Math.round(measuredActionHigh * 25.4 * 64 / 25.4) / 10} / 64")</div>
            <input
              id="action-high-e"
              type="range"
              min="0.8"
              max="3.0"
              step="0.1"
              bind:value={measuredActionHigh}
            />
            <span class="spec-target-text">Target: {spec.actionHighETarget}</span>
          </div>
        </div>

        <div class="prescription-box">
          <h4>🛠️ Saddle Height Recommendation:</h4>
          <p class="presc-fix">{actionAdvice()}</p>
          <div class="presc-sub">Hardware mechanism: {spec.bridgeAdjustmentType}</div>
        </div>

        <div class="step-footer-nav">
          <button type="button" class="back-btn" onclick={() => (currentStep = 1)}>&larr; Back to Step 1</button>
          <button type="button" class="next-btn" onclick={() => (currentStep = 3)}>PROCEED TO STEP 3 (INTONATION) &rarr;</button>
        </div>
      </div>

    {:else if currentStep === 3}
      <!-- STEP 3: INTONATION -->
      <div class="step-content">
        <div class="step-badge">STEP 3 OF 4</div>
        <h2>12th-Fret Octave Intonation</h2>
        <p class="step-desc">
          Strings stretch when fretted, raising their pitch. Intonation moves the bridge saddle forward or backward to compensate for string core thickness.
        </p>

        <div class="intonation-rule-card">
          <div class="rule-col">
            <div class="rule-icon sharp">♯</div>
            <h4>IF 12TH FRETTED NOTE IS SHARP:</h4>
            <p>The string is too short. Move the bridge saddle <strong>BACKWARD</strong> (away from the neck / toward the strap button) to lengthen the vibrating string.</p>
          </div>
          <div class="rule-divider"></div>
          <div class="rule-col">
            <div class="rule-icon flat">♭</div>
            <h4>IF 12TH FRETTED NOTE IS FLAT:</h4>
            <p>The string is too long. Move the bridge saddle <strong>FORWARD</strong> (toward the neck / pickups) to shorten the vibrating string.</p>
          </div>
        </div>

        <div class="pro-tip-box">
          <strong>Luthier Intonation Rule of Thumb:</strong> "Flat Forward, Sharp Back" (FF / SB). Always tune in playing position (not flat on the table, as gravity pulls the neck).
        </div>

        <div class="step-footer-nav">
          <button type="button" class="back-btn" onclick={() => (currentStep = 2)}>&larr; Back to Step 2</button>
          <button type="button" class="next-btn" onclick={() => (currentStep = 4)}>PROCEED TO STEP 4 (PICKUPS) &rarr;</button>
        </div>
      </div>

    {:else if currentStep === 4}
      <!-- STEP 4: PICKUP HEIGHT & PRINT -->
      <div class="step-content">
        <div class="step-badge">STEP 4 OF 4 &bull; FINAL INSPECTION</div>
        <h2>Pickup Height Calibration & Work Order</h2>
        <p class="step-desc">
          Hold down the strings at the highest fret and measure distance from the top of the magnetic pole piece to the bottom of the string.
        </p>

        <div class="pickup-specs-summary">
          <div class="pickup-card">
            <h4>Neck Pickup Spec</h4>
            <div class="pickup-val">{spec.pickupNeckTarget}</div>
            <p>Higher clearance prevents powerful Alnico magnets from dampening string vibration and causing "wolf tones".</p>
          </div>

          <div class="pickup-card">
            <h4>Bridge Pickup Spec</h4>
            <div class="pickup-val">{spec.pickupBridgeTarget}</div>
            <p>Set closer to the strings than the neck pickup to compensate for smaller string vibration amplitude at the bridge.</p>
          </div>
        </div>

        <!-- Printable Work Order Summary -->
        <div class="printable-summary">
          <div class="summary-top">
            <h3>📋 Guitar Bench Setup Summary Record</h3>
            <button type="button" class="print-btn no-print" onclick={printSpecSheet}>
              🖨️ PRINT SETUP RECORD
            </button>
          </div>

          <table class="summary-table">
            <tbody>
              <tr>
                <td><strong>Instrument Platform:</strong></td>
                <td>{spec.name}</td>
              </tr>
              <tr>
                <td><strong>Neck Relief:</strong></td>
                <td>Target: {spec.reliefTarget} &bull; Status: {measuredRelief.replace('_', ' ').toUpperCase()}</td>
              </tr>
              <tr>
                <td><strong>Low E Action:</strong></td>
                <td>Target: {spec.actionLowETarget} &bull; Measured: {measuredActionLow} mm</td>
              </tr>
              <tr>
                <td><strong>High E Action:</strong></td>
                <td>Target: {spec.actionHighETarget} &bull; Measured: {measuredActionHigh} mm</td>
              </tr>
              <tr>
                <td><strong>Intonation Rule:</strong></td>
                <td>Flat = Forward, Sharp = Backward</td>
              </tr>
              <tr>
                <td><strong>Pickup Clearance:</strong></td>
                <td>Neck: {spec.pickupNeckTarget} &bull; Bridge: {spec.pickupBridgeTarget}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="step-footer-nav no-print">
          <button type="button" class="back-btn" onclick={() => (currentStep = 3)}>&larr; Back to Step 3</button>
          <span></span>
        </div>
      </div>
    {/if}
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

  .instrument-selector {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 14px 18px;
    margin-bottom: 20px;
  }
  .sel-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 700;
    display: block;
    margin-bottom: 8px;
  }
  .inst-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .inst-chip {
    background: #1f2937;
    border: 1px solid #374151;
    color: #d1d5db;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }
  .inst-chip:hover {
    border-color: #f59e0b;
  }
  .inst-chip.active {
    background: rgba(245, 158, 11, 0.15);
    border-color: #f59e0b;
    color: #f59e0b;
  }

  .steps-nav {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 24px;
  }
  @media (max-width: 640px) {
    .steps-nav {
      grid-template-columns: 1fr 1fr;
    }
  }
  .step-tab {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 12px 10px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }
  .step-tab.active {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.08);
  }
  .step-num {
    display: block;
    font-size: 0.7rem;
    font-weight: 800;
    color: #6b7280;
  }
  .step-tab.active .step-num {
    color: #38bdf8;
  }
  .step-title {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    color: #f3f4f6;
    margin-top: 2px;
  }

  .step-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 24px;
  }
  .step-badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: #f59e0b;
    margin-bottom: 8px;
  }
  h2 {
    font-size: 1.4rem;
    margin: 0 0 8px;
    color: #f9fafb;
  }
  .step-desc {
    font-size: 0.9rem;
    color: #9ca3af;
    line-height: 1.5;
    margin: 0 0 20px;
  }

  .how-to-box {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .how-to-box h4 {
    margin: 0 0 10px;
    color: #38bdf8;
    font-size: 0.95rem;
  }
  .how-to-box ol {
    margin: 0;
    padding-left: 20px;
    font-size: 0.85rem;
    color: #d1d5db;
    line-height: 1.6;
  }

  .measurement-selector {
    margin-bottom: 24px;
  }
  .meas-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    color: #9ca3af;
    margin-bottom: 10px;
  }
  .relief-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }
  .relief-btn {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 14px;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .relief-btn:hover {
    border-color: #f59e0b;
  }
  .relief-btn.active {
    background: rgba(245, 158, 11, 0.15);
    border-color: #f59e0b;
  }
  .opt-title {
    display: block;
    font-weight: 700;
    font-size: 0.9rem;
    color: #f3f4f6;
  }
  .opt-sub {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 4px;
  }

  .prescription-box {
    background: #182232;
    border-left: 4px solid #10b981;
    padding: 16px 20px;
    border-radius: 0 6px 6px 0;
    margin-bottom: 24px;
  }
  .prescription-box h4 {
    margin: 0 0 10px;
    color: #10b981;
    font-size: 1rem;
  }
  .presc-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.85rem;
  }
  .presc-row {
    display: flex;
    gap: 10px;
  }
  .presc-label {
    color: #9ca3af;
    min-width: 100px;
  }
  .presc-fix {
    color: #f3f4f6;
    line-height: 1.4;
  }

  .step-footer-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #1f2937;
    padding-top: 18px;
  }
  .next-btn {
    background: #f59e0b;
    color: #78350f;
    border: none;
    font-weight: 800;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
  }
  .next-btn:hover {
    background: #fbbf24;
  }
  .back-btn {
    background: none;
    border: 1px solid #4b5563;
    color: #d1d5db;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
  }

  /* Action step */
  .action-inputs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  @media (max-width: 640px) {
    .action-inputs-grid {
      grid-template-columns: 1fr;
    }
  }
  .action-input-card {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 16px;
  }
  .action-label {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    font-weight: 700;
  }
  .val-display {
    font-size: 1.4rem;
    font-weight: 800;
    color: #38bdf8;
    margin: 8px 0;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #38bdf8;
  }
  .spec-target-text {
    font-size: 0.75rem;
    color: #6b7280;
    display: block;
    margin-top: 6px;
  }

  /* Intonation step */
  .intonation-rule-card {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 24px;
    gap: 20px;
    margin-bottom: 20px;
  }
  @media (max-width: 640px) {
    .intonation-rule-card {
      grid-template-columns: 1fr;
    }
  }
  .rule-divider {
    width: 1px;
    background: #1f2937;
  }
  .rule-col h4 {
    margin: 8px 0;
    font-size: 0.95rem;
    color: #f3f4f6;
  }
  .rule-col p {
    font-size: 0.85rem;
    color: #9ca3af;
    line-height: 1.5;
    margin: 0;
  }
  .rule-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.2rem;
  }
  .rule-icon.sharp {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }
  .rule-icon.flat {
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
  }
  .pro-tip-box {
    background: #1e293b;
    border-left: 4px solid #38bdf8;
    padding: 12px 16px;
    border-radius: 0 4px 4px 0;
    font-size: 0.85rem;
    color: #cbd5e1;
    margin-bottom: 24px;
  }

  /* Pickups & Print */
  .pickup-specs-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
  .pickup-card {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 16px;
  }
  .pickup-card h4 {
    margin: 0 0 6px;
    color: #38bdf8;
    font-size: 0.95rem;
  }
  .pickup-val {
    font-size: 1.3rem;
    font-weight: 800;
    color: #f59e0b;
    margin-bottom: 6px;
  }
  .pickup-card p {
    font-size: 0.8rem;
    color: #9ca3af;
    line-height: 1.4;
    margin: 0;
  }

  .printable-summary {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .summary-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .summary-top h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #f9fafb;
  }
  .print-btn {
    background: #10b981;
    color: #064e3b;
    border: none;
    font-weight: 800;
    font-size: 0.8rem;
    padding: 8px 14px;
    border-radius: 4px;
    cursor: pointer;
  }
  .summary-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  .summary-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #1f2937;
  }
  .summary-table td:first-child {
    color: #9ca3af;
    width: 180px;
  }
  .summary-table td:last-child {
    color: #f3f4f6;
  }

  @media print {
    .no-print {
      display: none !important;
    }
    .tool-container {
      max-width: 100%;
      padding: 0;
      color: #000000;
    }
    .printable-summary {
      background: #ffffff !important;
      color: #000000 !important;
      border: 1px solid #cccccc !important;
    }
    .summary-table td {
      color: #000000 !important;
      border-bottom: 1px solid #dddddd !important;
    }
  }
</style>
