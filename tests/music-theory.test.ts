import { describe, it, expect } from 'vitest';
import {
  noteToIndex,
  indexToNote,
  parseChord,
  chordToNNS,
  nnsToChord,
  transposeChord,
  calculateCapoPossibilities
} from '../src/lib/utils/musicTheory';

describe('Music Theory Utility Engine', () => {
  it('correctly maps note names to 0-11 indices and vice versa', () => {
    expect(noteToIndex('C')).toBe(0);
    expect(noteToIndex('D')).toBe(2);
    expect(noteToIndex('E')).toBe(4);
    expect(noteToIndex('F')).toBe(5);
    expect(noteToIndex('G')).toBe(7);
    expect(noteToIndex('A')).toBe(9);
    expect(noteToIndex('B')).toBe(11);

    expect(noteToIndex('C#')).toBe(1);
    expect(noteToIndex('Db')).toBe(1);
    expect(noteToIndex('F#')).toBe(6);
    expect(noteToIndex('Gb')).toBe(6);

    expect(indexToNote(0)).toBe('C');
    expect(indexToNote(1, false)).toBe('C#');
    expect(indexToNote(1, true)).toBe('Db');
  });

  it('parses complex guitar chords accurately', () => {
    expect(parseChord('G')).toEqual({ root: 'G', quality: '', bass: undefined });
    expect(parseChord('Am7')).toEqual({ root: 'A', quality: 'm7', bass: undefined });
    expect(parseChord('F#m7b5/C')).toEqual({ root: 'F#', quality: 'm7b5', bass: 'C' });
    expect(parseChord('Bbmaj9')).toEqual({ root: 'Bb', quality: 'maj9', bass: undefined });
  });

  it('converts chords to Nashville Number System (NNS)', () => {
    // In Key of C
    expect(chordToNNS('C', 'C')).toBe('1');
    expect(chordToNNS('Dm', 'C')).toBe('2m');
    expect(chordToNNS('Em', 'C')).toBe('3m');
    expect(chordToNNS('F', 'C')).toBe('4');
    expect(chordToNNS('G', 'C')).toBe('5');
    expect(chordToNNS('Am', 'C')).toBe('6m');

    // In Key of G
    expect(chordToNNS('G', 'G')).toBe('1');
    expect(chordToNNS('C', 'G')).toBe('4');
    expect(chordToNNS('D', 'G')).toBe('5');
    expect(chordToNNS('Em', 'G')).toBe('6m');
    expect(chordToNNS('B7', 'G')).toBe('3m7');
  });

  it('converts NNS back to chords for a given key', () => {
    expect(nnsToChord('1', 'D')).toBe('D');
    expect(nnsToChord('4', 'D')).toBe('G');
    expect(nnsToChord('5', 'D')).toBe('A');
    expect(nnsToChord('6m', 'D')).toBe('Bm');
  });

  it('transposes chords by semitones', () => {
    expect(transposeChord('C', 2)).toBe('D');
    expect(transposeChord('Am', 2)).toBe('Bm');
    expect(transposeChord('G/B', 2)).toBe('A/C#');
    expect(transposeChord('E', 1, true)).toBe('F');
  });

  it('calculates Capo possibilities for a target key', () => {
    // Target Key: Eb
    const solutions = calculateCapoPossibilities('Eb');
    expect(solutions.length).toBeGreaterThan(0);

    // E.g. Capo 1 with D shape sounds like Eb
    const capo1 = solutions.find((s) => s.capoFret === 1);
    expect(capo1).toBeDefined();
    expect(capo1?.shapeKey).toBe('D');

    // E.g. Capo 3 with C shape sounds like Eb
    const capo3 = solutions.find((s) => s.capoFret === 3);
    expect(capo3).toBeDefined();
    expect(capo3?.shapeKey).toBe('C');
  });
});
