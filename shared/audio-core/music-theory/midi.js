/**
 * midi.js - MIDI Utilities
 *
 * CONCEPT:
 * MIDI (Musical Instrument Digital Interface) is the standard for
 * representing musical notes and control information in digital systems.
 *
 * MIDI BASICS:
 * - MIDI notes: 0-127 (0 = C-1 to 127 = G9)
 * - Middle C = MIDI 60 = C4
 * - A4 (concert pitch) = MIDI 69
 * - Each semitone = 1 MIDI number
 * - Octaves: 12 semitones = 12 MIDI numbers
 *
 * NOTE NAMING:
 * - Scientific pitch notation: Note + Accidental + Octave
 * - Note: C, D, E, F, G, A, B
 * - Accidental: sharp (#) = +1 semitone, flat (b) = -1 semitone
 * - Octave: numbered from C (C0 = MIDI 0, C1 = MIDI 12, etc.)
 *
 * @module music-theory/midi
 */

// ============================================================
// CONSTANTS
// ============================================================

/**
 * MIDI note names
 * 12 notes per octave, repeating pattern
 */
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Standard MIDI note reference points
 * - Middle C (C4): MIDI 60 (used as reference in most DAWs)
 * - A4 (concert pitch): MIDI 69 (440 Hz, standard tuning)
 * - C0: MIDI 0 (lowest MIDI note)
 * - G9: MIDI 127 (highest MIDI note)
 */
export const MIDI_REFERENCE_NOTES = {
  C0: 0,
  C1: 12,
  C2: 24,
  C3: 36,
  C4: 48, // One octave below Middle C
  C5: 60, // Middle C (most common reference)
  C6: 72,
  C7: 84,
  C8: 96,
  A0: 9,
  A1: 21,
  A2: 33,
  A3: 45,
  A4: 69,    // Concert pitch (440 Hz standard tuning)
  A5: 81,
  A6: 93,
  A7: 105,
  // Piano key range: A0 to C8
  PIANO_LOWEST: 21,  // A0
  PIANO_HIGHEST: 108  // C8
};

/**
 * Note frequency mapping (equal temperament tuning)
 * Used to convert MIDI note to frequency in Hz
 *
 * Formula: f = 440 * 2^((n - 69) / 12)
 * Where: f = frequency (Hz), n = MIDI note number, 69 = A4
 */
const A4_FREQUENCY = 440; // Hz
const A4_MIDI = 69;

// ============================================================
// MIDI NOTE CONVERSION FUNCTIONS
// ============================================================

/**
 * Convert MIDI note number to note name
 *
 * ALGORITHM:
 * 1. Octave = floor(MIDI / 12) - 1
 * 2. Note index = MIDI % 12
 * 3. Look up note name from array
 *
 * WHY OCTAVE FORMULA:
 * - MIDI 0-11 = C-1 to B-1 (below octave 0)
 * - MIDI 12-23 = C0 to B0 (octave 0)
 * - MIDI 60-71 = C5 to B5 (middle C is C5)
 * - Formula accounts for this offset
 *
 * @param {number} midiNote - MIDI note number (0-127)
 * @param {boolean} useSharps - Use sharps (default) or flats
 * @returns {string} Note name (e.g., "C4", "F#3", "Bb5")
 *
 * @example
 * midiToNoteName(60);        // "C5" (Middle C)
 * midiToNoteName(69);        // "A4" (Concert pitch)
 * midiToNoteName(61);        // "C#5"
 * midiToNoteName(61, false); // "Db5"
 * midiToNoteName(0);         // "C-1"
 * midiToNoteName(127);       // "G9"
 */
export function midiToNoteName(midiNote, useSharps = true) {
  // Validate MIDI range
  if (midiNote < 0 || midiNote > 127) {
    console.warn(`MIDI note out of range: ${midiNote}. Clamping to 0-127.`);
    midiNote = Math.max(0, Math.min(127, midiNote));
  }

  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  const noteNames = useSharps ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;

  return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Convert note name to MIDI note number
 *
 * PARSER ALGORITHM:
 * 1. Extract note letter (C-G)
 * 2. Extract accidental (# or b if present)
 * 3. Extract octave number
 * 4. Calculate: base note + accidental adjustment + (octave * 12)
 *
 * @param {string} noteName - Note name (e.g., "C4", "F#3", "Bb5")
 * @returns {number} MIDI note number (0-127), or null if invalid
 *
 * @example
 * noteNameToMidi("C5");    // 60 (Middle C)
 * noteNameToMidi("A4");    // 69 (Concert pitch)
 * noteNameToMidi("C#5");   // 61
 * noteNameToMidi("Db5");   // 61 (enharmonic equivalent)
 * noteNameToMidi("G9");    // 127
 * noteNameToMidi("Invalid"); // null
 */
export function noteNameToMidi(noteName) {
  // Validate input
  if (typeof noteName !== 'string') return null;

  // Parse note name: letter + accidental + octave
  // Example: "C#5" or "Db5"
  const match = noteName.match(/^([A-G])([#b]?)(-?\d+)$/);
  if (!match) return null;

  const [, letter, accidental, octaveStr] = match;
  const octave = parseInt(octaveStr);

  // Find base note (assuming C = 0)
  const baseNotes = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let noteNum = baseNotes[letter];

  if (noteNum === undefined) return null;

  // Apply accidental
  if (accidental === '#') noteNum += 1;
  if (accidental === 'b') noteNum -= 1;

  // Calculate MIDI note: ((octave + 1) * 12) + note_in_octave
  const midiNote = (octave + 1) * 12 + noteNum;

  // Validate MIDI range
  if (midiNote < 0 || midiNote > 127) return null;

  return midiNote;
}

/**
 * Convert MIDI note to frequency in Hz
 *
 * FORMULA (Equal Temperament Tuning):
 * f = 440 * 2^((n - 69) / 12)
 *
 * Where:
 * - f = frequency in Hz
 * - n = MIDI note number
 * - 69 = A4 (reference note at 440 Hz)
 * - 12 = semitones per octave
 *
 * WHY THIS FORMULA:
 * - Equal temperament: each semitone = constant frequency ratio
 * - Ratio = 2^(1/12) ≈ 1.0595 (5.95% increase per semitone)
 * - A4 = 440 Hz is international standard tuning
 * - Musicians hear frequency logarithmically (logarithmic scale)
 *
 * @param {number} midiNote - MIDI note number (0-127)
 * @returns {number} Frequency in Hz (e.g., 440 for A4)
 *
 * @example
 * midiToFrequency(69);  // 440 (A4, concert pitch)
 * midiToFrequency(60);  // ~261.63 (Middle C)
 * midiToFrequency(81);  // ~880 (A5, one octave above)
 * midiToFrequency(57);  // ~220 (A3, one octave below concert pitch)
 */
export function midiToFrequency(midiNote) {
  // Validate MIDI range
  if (midiNote < 0 || midiNote > 127) {
    console.warn(`MIDI note out of range: ${midiNote}`);
    return null;
  }

  // Equal temperament formula
  // Exponent: (midiNote - 69) / 12 = semitones away from A4 divided by semitones per octave
  const exponent = (midiNote - A4_MIDI) / 12;
  const frequency = A4_FREQUENCY * Math.pow(2, exponent);

  return frequency;
}

/**
 * Convert frequency in Hz to MIDI note number
 *
 * INVERSE FORMULA:
 * n = 69 + 12 * log2(f / 440)
 *
 * Used when:
 * - Converting from frequency domain (FFT analysis, oscillator frequencies)
 * - Finding nearest MIDI note to arbitrary frequency
 *
 * @param {number} frequency - Frequency in Hz
 * @returns {number} Nearest MIDI note number (0-127), or null if out of range
 *
 * @example
 * frequencyToMidi(440);       // 69 (A4, concert pitch)
 * frequencyToMidi(261.63);    // 60 (Middle C)
 * frequencyToMidi(880);       // 81 (A5)
 * frequencyToMidi(55);        // 33 (A1, very low)
 */
export function frequencyToMidi(frequency) {
  if (frequency <= 0) {
    console.warn(`Frequency must be positive: ${frequency}`);
    return null;
  }

  // Inverse of equal temperament formula
  // n = A4 + 12 * log2(f / 440)
  const midiNote = A4_MIDI + 12 * Math.log2(frequency / A4_FREQUENCY);

  // Round to nearest semitone
  const roundedMidi = Math.round(midiNote);

  // Validate MIDI range
  if (roundedMidi < 0 || roundedMidi > 127) {
    console.warn(`Frequency ${frequency} Hz is out of MIDI range`);
    return null;
  }

  return roundedMidi;
}

// ============================================================
// MIDI NOTE UTILITIES
// ============================================================

/**
 * Get MIDI note offset between two notes
 *
 * ALGORITHM:
 * Calculate semitone distance between two MIDI notes
 * Positive = interval up, negative = interval down
 *
 * @param {number} fromMidi - Starting MIDI note
 * @param {number} toMidi - Target MIDI note
 * @returns {number} Semitone distance (positive = up, negative = down)
 *
 * @example
 * getMidiOffset(60, 67);   // 7 (perfect 5th up)
 * getMidiOffset(67, 60);   // -7 (perfect 5th down)
 * getMidiOffset(60, 60);   // 0 (unison)
 * getMidiOffset(60, 72);   // 12 (octave up)
 */
export function getMidiOffset(fromMidi, toMidi) {
  return toMidi - fromMidi;
}

/**
 * Transpose MIDI notes by semitone interval
 *
 * @param {Array<number>|number} notes - MIDI note(s) to transpose
 * @param {number} semitones - Semitone distance (positive = up, negative = down)
 * @returns {Array<number>|number} Transposed MIDI note(s)
 *
 * @example
 * transpose(60, 5);       // 65 (C5 → F5)
 * transpose([60, 64, 67], 7);  // [67, 71, 74] (C major → G major)
 * transpose(69, -12);     // 57 (A4 → A3, octave down)
 */
export function transpose(notes, semitones) {
  if (Array.isArray(notes)) {
    return notes.map(note => {
      const transposed = note + semitones;
      // Clamp to MIDI range
      return Math.max(0, Math.min(127, transposed));
    });
  } else {
    const transposed = notes + semitones;
    return Math.max(0, Math.min(127, transposed));
  }
}

/**
 * Get interval name (musical interval between two notes)
 *
 * MUSIC THEORY:
 * Intervals are named by distance between notes:
 * - Unison (1): same note
 * - 2nd: 1 semitone (minor) or 2 semitones (major)
 * - 3rd: 3 semitones (minor) or 4 semitones (major)
 * - 4th: 5 semitones (perfect)
 * - 5th: 7 semitones (perfect)
 * - 6th: 8 semitones (minor) or 9 semitones (major)
 * - 7th: 10 semitones (minor) or 11 semitones (major)
 * - Octave (8): 12 semitones
 *
 * @param {number} semitones - Semitone distance
 * @returns {string} Interval name (e.g., "major 3rd", "perfect 5th")
 */
export function getIntervalName(semitones) {
  const intervals = {
    0: 'unison',
    1: 'minor 2nd',
    2: 'major 2nd',
    3: 'minor 3rd',
    4: 'major 3rd',
    5: 'perfect 4th',
    6: 'tritone',
    7: 'perfect 5th',
    8: 'minor 6th',
    9: 'major 6th',
    10: 'minor 7th',
    11: 'major 7th',
    12: 'octave'
  };

  return intervals[semitones % 12] || 'unknown';
}

/**
 * Clamp MIDI notes to valid range and piano key range
 *
 * @param {number|Array<number>} notes - MIDI note(s) to clamp
 * @param {number} min - Minimum MIDI note (default: 0)
 * @param {number} max - Maximum MIDI note (default: 127)
 * @returns {number|Array<number>} Clamped MIDI note(s)
 */
export function clampMidi(notes, min = 0, max = 127) {
  if (Array.isArray(notes)) {
    return notes.map(note => Math.max(min, Math.min(max, note)));
  } else {
    return Math.max(min, Math.min(max, notes));
  }
}

/**
 * Check if MIDI note is in piano range (A0-C8)
 *
 * @param {number} midiNote - MIDI note to check
 * @returns {boolean} True if note is in piano range
 */
export function isInPianoRange(midiNote) {
  return midiNote >= MIDI_REFERENCE_NOTES.PIANO_LOWEST &&
         midiNote <= MIDI_REFERENCE_NOTES.PIANO_HIGHEST;
}

export default {
  MIDI_REFERENCE_NOTES,
  midiToNoteName,
  noteNameToMidi,
  midiToFrequency,
  frequencyToMidi,
  getMidiOffset,
  transpose,
  getIntervalName,
  clampMidi,
  isInPianoRange
};
