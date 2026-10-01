import { describe, it, expect } from 'vitest';
import tools from '../src/lib/tools.json';
import fretBuzzTree from '../src/lib/data/trees/fret-buzz.json';
import highActionTree from '../src/lib/data/trees/high-action.json';
import tuningInstabilityTree from '../src/lib/data/trees/tuning-instability.json';
import type { SymptomTree, Tool } from '../src/lib/types';

describe('Tool Registry Validation', () => {
  const toolsList = tools as Tool[];

  it('has valid tools loaded in tools.json', () => {
    expect(toolsList.length).toBeGreaterThan(0);
  });

  it('contains unique tool numbers and IDs', () => {
    const numbers = new Set<number>();
    const ids = new Set<string>();

    for (const tool of toolsList) {
      expect(tool.id).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(['live', 'planned']).toContain(tool.status);
      expect(['Tier 1: Pure Logic', 'Tier 2: Light Audio', 'Tier 3: Real DSP']).toContain(tool.tier);
      expect(['Beginner', 'Intermediate', 'Advanced']).toContain(tool.difficulty);
      expect(Array.isArray(tool.tags)).toBe(true);
      expect(tool.tags.length).toBeGreaterThan(0);
      expect(tool.route).toMatch(/^\/tools\//);

      expect(numbers.has(tool.number)).toBe(false);
      numbers.add(tool.number);

      expect(ids.has(tool.id)).toBe(false);
      ids.add(tool.id);
    }
  });

  it('has Tier 1 live tools properly registered', () => {
    const liveTools = toolsList.filter((t) => t.status === 'live');
    const liveNumbers = liveTools.map((t) => t.number);

    // All Tier 1 tools
    expect(liveNumbers).toContain(131); // Repair Diagnostic Wizard
    expect(liveNumbers).toContain(83);  // Pedalboard Cost & Power Planner
    expect(liveNumbers).toContain(80);  // String-Life Tracker
    expect(liveNumbers).toContain(37);  // Nashville Number & Capo Intelligence
    expect(liveNumbers).toContain(132); // Serial Number Decoder
    expect(liveNumbers).toContain(44);  // Chord Chart Cleaner & Formatter
    expect(liveNumbers).toContain(75);  // Gear Flips Tracker
    expect(liveNumbers).toContain(134); // Collection Manager
    expect(liveNumbers).toContain(95);  // Lyric & Chord Sheet Designer
    expect(liveNumbers).toContain(209); // NAM Hardware Optimizer
    expect(liveNumbers).toContain(219); // AI-Tab Fidelity Checker
    expect(liveNumbers).toContain(220); // Preset Portability Hub

    // All Tier 2 & Tier 3 Audio/DSP tools
    expect(liveNumbers).toContain(58);  // Hearing Safety Meter
    expect(liveNumbers).toContain(60);  // Bend Trainer
    expect(liveNumbers).toContain(59);  // Intonation Diagnostic
    expect(liveNumbers).toContain(3);   // Practice Logger
    expect(liveNumbers).toContain(49);  // On-Instrument Ear Trainer
    expect(liveNumbers).toContain(89);  // Backing Track Generator
    expect(liveNumbers).toContain(194); // Guitar to Tab
    expect(liveNumbers).toContain(27);  // PD Songbook Generator

    // Advanced & Social Master Tools
    expect(liveNumbers).toContain(64);  // Browser Amp Sim & Modular FX Chain
    expect(liveNumbers).toContain(180); // Interactive Signal-Path Explainer
    expect(liveNumbers).toContain(175); // Audio Interface Input Gain Calibrator
    expect(liveNumbers).toContain(118); // Self-Grading Homework Studio
    expect(liveNumbers).toContain(148); // Daily Riff Streak & Speed Ladder
    expect(liveNumbers).toContain(188); // ABX Double-Blind Audio Testing Rack

    expect(liveTools.length).toBe(26);
  });
});

describe('Symptom Decision Trees Integrity', () => {
  const trees: SymptomTree[] = [
    fretBuzzTree as SymptomTree,
    highActionTree as SymptomTree,
    tuningInstabilityTree as SymptomTree
  ];

  it.each(trees)('tree $symptomName has valid nodes and diagnoses', (tree: SymptomTree) => {
    expect(tree.id).toBeTruthy();
    expect(tree.symptomName).toBeTruthy();
    expect(tree.startNodeId).toBeTruthy();
    expect(tree.nodes[tree.startNodeId]).toBeDefined();

    // Check all options link to either an existing node or an existing diagnosis
    for (const [nodeId, node] of Object.entries(tree.nodes)) {
      expect(node.id).toBe(nodeId);
      expect(node.question).toBeTruthy();
      expect(node.options.length).toBeGreaterThan(0);

      for (const opt of node.options) {
        expect(opt.label).toBeTruthy();
        if (opt.nextNodeId) {
          expect(tree.nodes[opt.nextNodeId]).toBeDefined();
        } else if (opt.diagnosisId) {
          expect(tree.diagnoses[opt.diagnosisId]).toBeDefined();
        } else {
          throw new Error(`Option "${opt.label}" in node "${nodeId}" has neither nextNodeId nor diagnosisId`);
        }
      }
    }

    // Check diagnoses integrity
    for (const [diagId, diag] of Object.entries(tree.diagnoses)) {
      expect(diag.id).toBe(diagId);
      expect(diag.title).toBeTruthy();
      expect(diag.rankedCauses.length).toBeGreaterThan(0);
      expect(diag.fixOrder.length).toBeGreaterThan(0);
      expect(diag.measurementsRequired.length).toBeGreaterThan(0);
      expect(diag.whenToConsultLuthier).toBeTruthy();
    }
  });
});
