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

  it('has #131 Repair Diagnostic Wizard registered as live', () => {
    const wizard = toolsList.find((t) => t.number === 131);
    expect(wizard).toBeDefined();
    expect(wizard?.status).toBe('live');
    expect(wizard?.route).toBe('/tools/repair-wizard');
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
