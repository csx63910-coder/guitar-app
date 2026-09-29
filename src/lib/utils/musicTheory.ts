/**
 * Zero-dependency, pure TypeScript music theory engine for guitar.
 * Covers chromatic notes, scale degrees, chord parsing, Nashville Number System (NNS),
 * transposition, and capo calculation with fretboard geometry.
 */

export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'] as const; // String 6 to 1

export const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'] as const;

export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const;
export const NNS_ROMAN_MAJOR = ['1', '2m', '3m', '4', '5', '6m', '7dim'] as const;

export interface NoteInfo {
  index: number; // 0-11
  name: string;
}

export function noteToIndex(noteName: string): number {
  const clean = noteName.trim();
  const sharpIdx = CHROMATIC_SHARPS.indexOf(clean as any);
  if (sharpIdx !== -1) return sharpIdx;
  const flatIdx = CHROMATIC_FLATS.indexOf(clean as any);
  if (flatIdx !== -1) return flatIdx;

  // Handle enharmonics like B# (C) or Cb (B)
  if (clean === 'B#' || clean === 'b#') return 0;
  if (clean === 'E#' || clean === 'e#') return 5;
  if (clean === 'Cb' || clean === 'cb') return 11;
  if (clean === 'Fb' || clean === 'fb') return 4;

  return -1;
}

export function indexToNote(index: number, preferFlats = false): string {
  const norm = ((index % 12) + 12) % 12;
  return preferFlats ? CHROMATIC_FLATS[norm] : CHROMATIC_SHARPS[norm];
}

/**
 * Returns the 7 scale degree notes for any Major key.
 */
export function getMajorScaleNotes(rootNote: string): string[] {
  const rootIdx = noteToIndex(rootNote);
  if (rootIdx === -1) return [];

  const useFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(rootNote);

  return MAJOR_SCALE_INTERVALS.map((interval) => {
    return indexToNote(rootIdx + interval, useFlats);
  });
}

/**
 * Parses a chord string into { root, quality, bassNote }
 * e.g., "C#m7/G#" -> root: "C#", quality: "m7", bass: "G#"
 */
export function parseChord(chordStr: string): { root: string; quality: string; bass?: string } | null {
  const trimmed = chordStr.trim();
  if (!trimmed) return null;

  const [mainPart, bassPart] = trimmed.split('/');
  const match = mainPart.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return null;

  return {
    root: match[1],
    quality: match[2] || '',
    bass: bassPart?.trim()
  };
}

/**
 * Converts a chord to a Nashville Number relative to a key.
 * e.g. in Key of G, chord "Em" -> "6m"
 */
export function chordToNNS(chordStr: string, keyRoot: string): string {
  const parsed = parseChord(chordStr);
  if (!parsed) return chordStr;

  const keyIdx = noteToIndex(keyRoot);
  const chordIdx = noteToIndex(parsed.root);
  if (keyIdx === -1 || chordIdx === -1) return chordStr;

  const semitonesFromKey = ((chordIdx - keyIdx) % 12 + 12) % 12;
  const scaleDegreeIdx = MAJOR_SCALE_INTERVALS.indexOf(semitonesFromKey as any);

  let numString: string;
  if (scaleDegreeIdx !== -1) {
    // Diatonic scale degree (1-7)
    const degreeNumber = scaleDegreeIdx + 1;
    numString = degreeNumber.toString();
  } else {
    // Non-diatonic (e.g. b7, b3, b6, #4)
    if (semitonesFromKey === 1) numString = 'b2';
    else if (semitonesFromKey === 3) numString = 'b3';
    else if (semitonesFromKey === 6) numString = 'b5';
    else if (semitonesFromKey === 8) numString = 'b6';
    else if (semitonesFromKey === 10) numString = 'b7';
    else numString = `+${semitonesFromKey}`;
  }

  // Preserve quality suffixes (e.g. m, maj7, 7, sus4, dim)
  let quality = parsed.quality;
  // If quality is minor and user didn't write it or vice versa
  if (['2', '3', '6'].includes(numString) && !quality.includes('m') && !quality.includes('maj')) {
    // In NNS, natural minor chords (2, 3, 6) usually show 'm'
    quality = 'm' + quality;
  }

  const result = numString + quality;
  return parsed.bass ? `${result}/${chordToNNS(parsed.bass, keyRoot)}` : result;
}

/**
 * Converts a Nashville Number back to a chord in a specified key.
 * e.g., in Key of D, "4" -> "G", "6m" -> "Bm"
 */
export function nnsToChord(nnsStr: string, keyRoot: string): string {
  const trimmed = nnsStr.trim();
  if (!trimmed) return nnsStr;

  const useFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(keyRoot);
  const keyIdx = noteToIndex(keyRoot);
  if (keyIdx === -1) return nnsStr;

  const match = trimmed.match(/^([b#]?\d+)(.*)$/);
  if (!match) return nnsStr;

  const degreeToken = match[1];
  const suffix = match[2];

  let semitones = 0;
  if (degreeToken === '1') semitones = 0;
  else if (degreeToken === 'b2') semitones = 1;
  else if (degreeToken === '2') semitones = 2;
  else if (degreeToken === 'b3') semitones = 3;
  else if (degreeToken === '3') semitones = 4;
  else if (degreeToken === '4') semitones = 5;
  else if (degreeToken === 'b5' || degreeToken === '#4') semitones = 6;
  else if (degreeToken === '5') semitones = 7;
  else if (degreeToken === 'b6') semitones = 8;
  else if (degreeToken === '6') semitones = 9;
  else if (degreeToken === 'b7') semitones = 10;
  else if (degreeToken === '7') semitones = 11;
  else return nnsStr;

  const rootNote = indexToNote(keyIdx + semitones, useFlats);
  return rootNote + suffix;
}

/**
 * Transposes any chord text or chart by a semitone offset.
 */
export function transposeChord(chordStr: string, semitones: number, preferFlats = false): string {
  const parsed = parseChord(chordStr);
  if (!parsed) return chordStr;

  const rootIdx = noteToIndex(parsed.root);
  if (rootIdx === -1) return chordStr;

  const newRoot = indexToNote(rootIdx + semitones, preferFlats);
  let newBass = '';
  if (parsed.bass) {
    const bassIdx = noteToIndex(parsed.bass);
    if (bassIdx !== -1) {
      newBass = '/' + indexToNote(bassIdx + semitones, preferFlats);
    }
  }

  return `${newRoot}${parsed.quality}${newBass}`;
}

/**
 * Capo Intelligence:
 * Given a Target Sounding Key and a preferred "Fingering Shape Key" (e.g. C, G, D, E, A),
 * calculates where to place the capo and how many semitones it transposes.
 */
export interface CapoSolution {
  capoFret: number;
  shapeKey: string;
  targetKey: string;
  description: string;
}

export function calculateCapoPossibilities(targetKey: string): CapoSolution[] {
  const targetIdx = noteToIndex(targetKey);
  if (targetIdx === -1) return [];

  const commonGuitarKeys = ['C', 'A', 'G', 'E', 'D'];
  const solutions: CapoSolution[] = [];

  for (const shapeKey of commonGuitarKeys) {
    const shapeIdx = noteToIndex(shapeKey);
    // Capo fret is how many semitones shapeKey must be raised to equal targetKey
    let fret = ((targetIdx - shapeIdx) % 12 + 12) % 12;

    if (fret <= 9) { // Capos are rarely used above fret 9
      solutions.push({
        capoFret: fret,
        shapeKey,
        targetKey,
        description: fret === 0 
          ? `Play without capo using open ${shapeKey} shapes.` 
          : `Capo fret ${fret}: play ${shapeKey} open shapes to sound in ${targetKey}.`
      });
    }
  }

  return solutions.sort((a, b) => a.capoFret - b.capoFret);
}
