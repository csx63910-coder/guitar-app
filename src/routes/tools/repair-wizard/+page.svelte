<script lang="ts">
  import fretBuzzTree from '$lib/data/trees/fret-buzz.json';
  import highActionTree from '$lib/data/trees/high-action.json';
  import tuningInstabilityTree from '$lib/data/trees/tuning-instability.json';
  import type { SymptomTree, DecisionNode, Diagnosis } from '$lib/types';
  import { base } from '$app/paths';

  const trees: Record<string, SymptomTree> = {
    'fret-buzz': fretBuzzTree as SymptomTree,
    'high-action': highActionTree as SymptomTree,
    'tuning-instability': tuningInstabilityTree as SymptomTree
  };

  let activeTreeId = $state<string>('fret-buzz');
  let currentTree = $derived(trees[activeTreeId]);

  let currentNodeId = $state<string>(trees['fret-buzz'].startNodeId);
  let currentNode = $derived<DecisionNode | undefined>(currentTree.nodes[currentNodeId]);

  let currentDiagnosisId = $state<string | null>(null);
  let currentDiagnosis = $derived<Diagnosis | null>(
    currentDiagnosisId ? currentTree.diagnoses[currentDiagnosisId] : null
  );

  interface HistoryItem {
    nodeId: string;
    question: string;
    selectedLabel: string;
  }
  let history = $state<HistoryItem[]>([]);

  function switchTree(treeId: string) {
    activeTreeId = treeId;
    currentNodeId = trees[treeId].startNodeId;
    currentDiagnosisId = null;
    history = [];
  }

  function handleOptionSelect(option: { label: string; nextNodeId?: string; diagnosisId?: string }) {
    if (!currentNode) return;

    history.push({
      nodeId: currentNode.id,
      question: currentNode.question,
      selectedLabel: option.label
    });

    if (option.diagnosisId) {
      currentDiagnosisId = option.diagnosisId;
    } else if (option.nextNodeId) {
      currentNodeId = option.nextNodeId;
    }
  }

  function goBackStep() {
    if (history.length === 0) return;
    const last = history.pop();
    if (last) {
      currentDiagnosisId = null;
      currentNodeId = last.nodeId;
    }
  }

  function restartDiagnosis() {
    currentNodeId = currentTree.startNodeId;
    currentDiagnosisId = null;
    history = [];
  }

  function printDiagnosis() {
    window.print();
  }
</script>

<svelte:head>
  <title>#131 Repair Diagnostic Wizard — Guitar Toolkit</title>
  <meta name="description" content="Interactive decision-tree troubleshooter for fret buzz, high action, and tuning instability." />
</svelte:head>

<div class="wizard-page">
  <div class="container wizard-inner">
    <!-- Breadcrumb / Back link -->
    <nav class="back-nav" aria-label="Breadcrumb">
      <a href="{base}/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Guitar Toolkit Hub
      </a>
    </nav>

    <!-- Tool Header -->
    <header class="tool-header">
      <div class="tool-header-badges">
        <span class="badge badge-accent">#131 &middot; TIER 1 PURE LOGIC</span>
        <span class="badge badge-live">● LIVE APPLICATION</span>
        <span class="badge badge-difficulty">Beginner Friendly</span>
      </div>
      <h1>Repair Diagnostic Wizard</h1>
      <p class="lead-text">
        Identify and solve guitar hardware problems with step-by-step plain-language checks. No expensive luthier calipers required — simple household items like credit cards and business cards work as accurate feeler gauges.
      </p>

      <!-- Symptom Selector Tabs -->
      <div class="symptom-tabs" role="tablist" aria-label="Select guitar symptom tree">
        {#each Object.entries(trees) as [id, tree]}
          <button
            class="symptom-tab {activeTreeId === id ? 'active' : ''}"
            onclick={() => switchTree(id)}
            role="tab"
            aria-selected={activeTreeId === id}
          >
            <span class="tab-name">{tree.symptomName}</span>
          </button>
        {/each}
      </div>
    </header>

    <!-- Interactive Decision Tree Container -->
    <main class="wizard-workspace">
      {#if currentDiagnosis}
        <!-- Diagnosis Report View -->
        <div class="diagnosis-card" id="printable-diagnosis">
          <div class="diag-header">
            <div class="diag-meta">
              <span class="diag-pill severity-{currentDiagnosis.severity}">
                Severity: {currentDiagnosis.severity.toUpperCase()}
              </span>
              <span class="diag-pill confidence">
                Confidence: {currentDiagnosis.confidence}
              </span>
            </div>
            <h2>{currentDiagnosis.title}</h2>
            <p class="diag-symptom-tag">Symptom Tree: {currentTree.symptomName}</p>
          </div>

          <div class="diag-section">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Ranked Likely Causes
            </h3>
            <ol class="causes-list">
              {#each currentDiagnosis.rankedCauses as cause}
                <li>{cause}</li>
              {/each}
            </ol>
          </div>

          <div class="diag-section">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              Recommended Fix Order
            </h3>
            <div class="fix-steps">
              {#each currentDiagnosis.fixOrder as step, idx}
                <div class="fix-step-item">
                  <span class="step-badge">{idx + 1}</span>
                  <p>{step}</p>
                </div>
              {/each}
            </div>
          </div>

          <div class="diag-grid-two">
            <div class="diag-subcard">
              <h4>Required Measurements &amp; Checks</h4>
              <ul>
                {#each currentDiagnosis.measurementsRequired as measure}
                  <li>{measure}</li>
                {/each}
              </ul>
            </div>

            <div class="diag-subcard luthier-card">
              <h4>When to Take It to a Luthier</h4>
              <p>{currentDiagnosis.whenToConsultLuthier}</p>
            </div>
          </div>

          <div class="diag-actions no-print">
            <button class="btn btn-secondary" onclick={restartDiagnosis}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              Start Over
            </button>
            <button class="btn btn-secondary" onclick={goBackStep}>
              &larr; Back One Step
            </button>
            <button class="btn btn-primary" onclick={printDiagnosis}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print / Save Fix Sheet
            </button>
          </div>
        </div>
      {:else if currentNode}
        <!-- Step Decision View -->
        <div class="question-card">
          <!-- Step Breadcrumbs -->
          {#if history.length > 0}
            <div class="history-trail">
              <span class="history-label">Previous checks:</span>
              <div class="trail-items">
                {#each history as h, i}
                  <span class="trail-item">
                    <strong>Step {i + 1}:</strong> {h.selectedLabel}
                  </span>
                  {#if i < history.length - 1}
                    <span class="trail-sep">&rarr;</span>
                  {/if}
                {/each}
              </div>
            </div>
          {/if}

          <div class="question-header">
            <span class="step-indicator">Step {history.length + 1} &middot; {currentNode.title}</span>
            <h2 class="question-text">{currentNode.question}</h2>
          </div>

          {#if currentNode.measurementGuide}
            <div class="measurement-box">
              <div class="measure-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div class="measure-text">
                <strong>Measurement / Feeler Guide:</strong>
                <p>{currentNode.measurementGuide}</p>
              </div>
            </div>
          {/if}

          <!-- Options Buttons -->
          <div class="options-grid">
            {#each currentNode.options as opt}
              <button class="option-card" onclick={() => handleOptionSelect(opt)}>
                <div class="opt-content">
                  <span class="opt-label">{opt.label}</span>
                  {#if opt.description}
                    <span class="opt-desc">{opt.description}</span>
                  {/if}
                </div>
                <div class="opt-arrow" aria-hidden="true">&rarr;</div>
              </button>
            {/each}
          </div>

          <div class="question-footer">
            {#if history.length > 0}
              <button class="btn btn-secondary btn-sm" onclick={goBackStep}>
                &larr; Back to Previous Question
              </button>
            {/if}
            <button class="btn btn-secondary btn-sm" onclick={restartDiagnosis}>
              Reset This Diagnosis
            </button>
          </div>
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  .wizard-page {
    padding: 2rem 0 4rem;
  }

  .wizard-inner {
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
    transition: color var(--transition-fast);
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
    max-width: 800px;
    line-height: 1.6;
  }

  .symptom-tabs {
    display: flex;
    gap: 0.65rem;
    margin-top: 0.75rem;
    flex-wrap: wrap;
  }

  .symptom-tab {
    padding: 0.65rem 1.1rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
    transition: all var(--transition-fast);
  }

  .symptom-tab:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .symptom-tab.active {
    background-color: var(--accent-subtle);
    border-color: var(--accent);
    color: var(--accent-light);
  }

  /* Question Card */
  .question-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 2.2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: var(--shadow-card);
  }

  .history-trail {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.75rem 1rem;
    background-color: var(--bg-primary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
  }

  .history-label {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .trail-items {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    color: var(--text-secondary);
  }

  .trail-sep {
    color: var(--accent);
  }

  .question-header {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .step-indicator {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent);
  }

  .question-text {
    font-size: 1.5rem;
    color: var(--text-primary);
    line-height: 1.35;
  }

  .measurement-box {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background-color: rgba(56, 189, 248, 0.08);
    border: 1px solid rgba(56, 189, 248, 0.25);
    border-radius: var(--radius-md);
  }

  .measure-icon {
    color: #38bdf8;
    flex-shrink: 0;
    margin-top: 0.15rem;
  }

  .measure-text strong {
    font-size: 0.85rem;
    color: #38bdf8;
    display: block;
    margin-bottom: 0.2rem;
  }

  .measure-text p {
    font-size: 0.9rem;
    color: var(--text-primary);
    line-height: 1.45;
  }

  .options-grid {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .option-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.4rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    text-align: left;
    transition: all var(--transition-fast);
  }

  .option-card:hover {
    border-color: var(--accent);
    background-color: var(--bg-elevated);
    transform: translateX(4px);
  }

  .opt-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .opt-label {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .opt-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .opt-arrow {
    font-size: 1.3rem;
    color: var(--accent);
    margin-left: 1rem;
    transition: transform var(--transition-fast);
  }

  .option-card:hover .opt-arrow {
    transform: translateX(3px);
  }

  .question-footer {
    display: flex;
    gap: 0.85rem;
    margin-top: 0.5rem;
  }

  /* Diagnosis View */
  .diagnosis-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    box-shadow: var(--shadow-card);
  }

  .diag-header {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .diag-meta {
    display: flex;
    gap: 0.6rem;
  }

  .diag-pill {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-full);
  }

  .severity-low {
    background-color: rgba(16, 185, 129, 0.15);
    color: var(--status-live);
    border: 1px solid var(--status-live-border);
  }

  .severity-medium {
    background-color: var(--accent-subtle);
    color: var(--accent);
    border: 1px solid var(--accent-border);
  }

  .severity-high, .severity-luthier {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.35);
  }

  .confidence {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
  }

  .diag-header h2 {
    font-size: 2rem;
  }

  .diag-symptom-tag {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .diag-section {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .diag-section h3 {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.15rem;
    color: var(--text-primary);
  }

  .causes-list {
    margin-left: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.95rem;
    color: var(--text-secondary);
  }

  .fix-steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .fix-step-item {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
  }

  .step-badge {
    background-color: var(--accent);
    color: var(--text-inverse);
    font-weight: 800;
    font-size: 0.85rem;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .fix-step-item p {
    font-size: 0.95rem;
    color: var(--text-primary);
    line-height: 1.5;
  }

  .diag-grid-two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  .diag-subcard {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .diag-subcard h4 {
    font-size: 0.95rem;
    color: var(--text-primary);
  }

  .diag-subcard ul {
    margin-left: 1.25rem;
    font-size: 0.88rem;
    color: var(--text-secondary);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .luthier-card {
    border-color: rgba(245, 158, 11, 0.25);
  }

  .luthier-card p {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .diag-actions {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-subtle);
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .diag-grid-two {
      grid-template-columns: 1fr;
    }
    .question-card, .diagnosis-card {
      padding: 1.5rem;
    }
  }

  @media print {
    .no-print, .back-nav, .symptom-tabs {
      display: none !important;
    }
    .diagnosis-card {
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      color: #000 !important;
      background: #fff !important;
    }
  }
</style>
