/**
 * scales.js - Music Theory: Scale System
 *
 * CONCEPT:
 * Scales are ordered sequences of notes with specific interval patterns.
 * All Western music is built on scales. Understanding scales is fundamental
 * to understanding chords and progressions.
 *
 * MUSIC THEORY BASICS:
 * - Semitone (half-step): smallest interval in Western music = 1 MIDI number
 * - Whole tone (whole-step): = 2 semitones
 * - Octave: 12 semitones, same note name, different pitch
 * - Scale degree: position in scale (I, II, III, IV, V, VI, VII)
 * - Root note: starting note of the scale
 *
 * EXAMPLES:
 * - C Major scale: C D E F G A B C
 * - Intervals: W W H W W W H (Whole, Whole, Half, Whole, Whole, Whole, Half)
 * - MIDI pattern: [0, 2, 4, 5, 7, 9, 11] (semitones from root)
 *
 * HOW THIS MODULE WORKS:
 * 1. Scale definitions stored as interval patterns (semitones from root)
 * 2. Generate scale notes given a root MIDI note
 * 3. Map scale degrees to notes
 * 4. Provide scale information (name, intervals, etc.)
 *
 * @module music-theory/scales
 */

// ============================================================
// SCALE DEFINITIONS - Interval patterns (semitones from root)
// ============================================================

/**
 * Scale definitions as interval patterns
 *
 * Each scale is an array of semitone intervals from the root note.
 * The root (0) is always included, and the pattern repeats at octave (12).
 *
 * WHY THIS FORMAT:
 * - Works with any root note (transposition)
 * - MIDI compatible (can multiply by root MIDI number)
 * - Easy to understand visually
 * - Extensible (add new scales easily)
 */
export const SCALE_DEFINITIONS = {
  // MAJOR SCALE - Happiest, most common scale
  // Pattern: W W H W W W H
  // Used in: pop, classical, folk, many genres
  // Emotional: bright, happy, resolved
  major: {
    name: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'Bright, happy, resolved',
    degrees: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  },

  // MINOR (Natural) - Darker than major
  // Pattern: W H W W H W W
  // Used in: blues, rock, metal, sad songs
  // Emotional: melancholic, introspective, darker
  minorNatural: {
    name: 'Minor (Natural)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Dark, introspective, melancholic',
    degrees: ['I', 'II', 'IIIb', 'IV', 'V', 'VIb', 'VIIb']
  },

  // MINOR (Harmonic) - Minor with raised VII for dominant function
  // Pattern: W H W W H W+H W (augmented 2nd between VI-VII)
  // Used in: classical, flamenco
  // Why: Makes V chord sound more resolved
  minorHarmonic: {
    name: 'Minor (Harmonic)',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: 'Dark with classical harmonic strength',
    degrees: ['I', 'II', 'IIIb', 'IV', 'V', 'VIb', 'VII']
  },

  // MINOR (Melodic) - Minor scale with raised VI and VII in ascending direction
  // Pattern: W H W W W W H (ascending)
  // Used in: classical melodies, jazz improvisations
  // Why: Easier to play in ascending passages
  minorMelodic: {
    name: 'Minor (Melodic)',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    description: 'Dark but with melodic ease',
    degrees: ['I', 'II', 'IIIb', 'IV', 'V', 'VI', 'VII']
  },

  // MODES - Same notes as major scale, different starting points
  // Dorian: Major scale starting from II
  // Phrygian: Major scale starting from III
  // Lydian: Major scale starting from IV
  // Mixolydian: Major scale starting from V
  // Aeolian: Major scale starting from VI (= natural minor)
  // Locrian: Major scale starting from VII

  // DORIAN - II mode of major scale
  // Pattern: W H W W W H W
  // Used in: jazz, funk, blues, modal jazz
  // Emotional: jazzy, slightly dark but not sad
  dorian: {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'Jazzy, funky, slightly dark',
    degrees: ['I', 'II', 'IIIb', 'IV', 'V', 'VI', 'VIIb']
  },

  // PHRYGIAN - III mode of major scale
  // Pattern: H W W W H W W
  // Used in: Spanish/flamenco, metal, exotic sounds
  // Emotional: exotic, dark, ominous
  phrygian: {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: 'Spanish, exotic, ominous',
    degrees: ['I', 'IIb', 'IIIb', 'IV', 'V', 'VIb', 'VIIb']
  },

  // LYDIAN - IV mode of major scale
  // Pattern: W W W H W W H
  // Used in: video game music, film scores, quirky pop
  // Emotional: bright, ethereal, whimsical
  lydian: {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: 'Bright, ethereal, whimsical',
    degrees: ['I', 'II', 'III', '#IV', 'V', 'VI', 'VII']
  },

  // MIXOLYDIAN - V mode of major scale
  // Pattern: W W H W W H W
  // Used in: blues, rock, funk, country
  // Emotional: bluesy, dominant feel, not quite major
  mixolydian: {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'Bluesy, dominant, rock-oriented',
    degrees: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VIIb']
  },

  // AEOLIAN - VI mode of major scale (same as natural minor)
  // Pattern: W H W W H W W
  // Used in: any music using natural minor
  // Emotional: dark, introspective
  aeolian: {
    name: 'Aeolian',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Dark, introspective',
    degrees: ['I', 'II', 'IIIb', 'IV', 'V', 'VIb', 'VIIb']
  },

  // LOCRIAN - VII mode of major scale
  // Pattern: H W W H W W W
  // Used in: heavy metal, experimental, rarely in other genres
  // Emotional: dark, dissonant, unstable
  locrian: {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    description: 'Dark, dissonant, unstable',
    degrees: ['I', 'IIb', 'IIIb', 'IV', 'Vb', 'VIb', 'VIIb']
  },

  // PENTATONIC SCALES - 5-note scales (penta = 5)
  // Simpler than 7-note scales, very common in world music
  // Hard to play wrong - great for beginners

  // MAJOR PENTATONIC - Major scale without IV and VII
  // Notes: 1 2 3 5 6
  // Pattern: W W W+H W W+H (irregular)
  // Used in: blues, rock, pop, Asian music
  // Why: No "wrong" notes, very musical
  majorPentatonic: {
    name: 'Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    description: 'Pentatonic, musical, versatile',
    degrees: ['I', 'II', 'III', 'V', 'VI']
  },

  // MINOR PENTATONIC - Natural minor without II and VI
  // Notes: 1 b3 4 5 b7
  // Pattern: W+H W W W+H W (irregular)
  // Used in: blues, rock, funk, worldmusic
  // Why: Same as major pentatonic - no "wrong" notes
  minorPentatonic: {
    name: 'Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    description: 'Pentatonic blues, versatile',
    degrees: ['I', 'IIIb', 'IV', 'V', 'VIIb']
  },

  // BLUES SCALE - Minor pentatonic + flat 5 (blue note)
  // Pattern: W+H W W H W+H W
  // Used in: blues, rock, funk
  // Why: The flat 5 (Vb) creates that classic blues sound
  blues: {
    name: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    description: 'Blues, rock, with blue notes',
    degrees: ['I', 'IIIb', 'IV', 'Vb', 'V', 'VIIb']
  }
};

// ============================================================
// NOTE NAMES AND ENHARMONICS
// ============================================================

/**
 * Note names: C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B
 * Sharp (#): raise by 1 semitone
 * Flat (b): lower by 1 semitone
 */
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// ============================================================
// SCALE GENERATION FUNCTIONS
// ============================================================

/**
 * Generate all notes in a scale given a root MIDI note
 *
 * MUSIC THEORY CONCEPT:
 * - Transposition: applying the same interval pattern to a different root
 * - This works because Western music is based on repeating interval patterns
 * - Example: C Major and F# Major have the same interval pattern,
 *   just starting from different notes
 *
 * ALGORITHM:
 * 1. Get scale definition (interval pattern)
 * 2. For each interval, add to root MIDI note
 * 3. Generate additional octaves to fill range
 * 4. Return array of scale notes in MIDI numbers
 *
 * @param {number} rootMidi - Root note in MIDI (0-127, usually 48-84)
 * @param {string} scaleType - Key from SCALE_DEFINITIONS (e.g., 'major', 'minorPentatonic')
 * @param {number} octaves - How many octaves to generate (default: 2)
 * @returns {Array<number>} Array of MIDI notes in the scale
 *
 * @example
 * const cMajor = generateScale(60, 'major', 2);
 * // Returns: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83]
 * // Which is: C4, D4, E4, F4, G4, A4, B4, C5, D5, E5, F5, G5, A5, B5
 */
export function generateScale(rootMidi, scaleType = 'major', octaves = 2) {
  // Validate inputs
  if (!SCALE_DEFINITIONS[scaleType]) {
    console.warn(`Unknown scale type: ${scaleType}, defaulting to major`);
    scaleType = 'major';
  }

  const scaleDef = SCALE_DEFINITIONS[scaleType];
  const notes = [];

  // Generate notes across specified octaves
  for (let oct = 0; oct < octaves; oct++) {
    for (const interval of scaleDef.intervals) {
      const midiNote = rootMidi + (oct * 12) + interval;
      // Validate MIDI range (0-127)
      if (midiNote >= 0 && midiNote <= 127) {
        notes.push(midiNote);
      }
    }
  }

  return notes;
}

/**
 * Get scale information (name, intervals, scale degrees)
 *
 * @param {string} scaleType - Key from SCALE_DEFINITIONS
 * @returns {Object} Scale definition object
 *
 * @example
 * const majorInfo = getScaleInfo('major');
 * // Returns:
 * // {
 * //   name: 'Major',
 * //   intervals: [0, 2, 4, 5, 7, 9, 11],
 * //   description: 'Bright, happy, resolved',
 * //   degrees: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
 * // }
 */
export function getScaleInfo(scaleType) {
  return SCALE_DEFINITIONS[scaleType] || SCALE_DEFINITIONS.major;
}

/**
 * Get all available scale types
 *
 * @returns {Array<string>} Array of scale type keys
 *
 * @example
 * const scales = getAvailableScales();
 * // Returns: ['major', 'minorNatural', 'minorHarmonic', ...]
 */
export function getAvailableScales() {
  return Object.keys(SCALE_DEFINITIONS);
}

/**
 * Get scale note name (e.g., C4, D#4, Bb3)
 *
 * MUSIC THEORY CONCEPT:
 * - Note name: letter + accidental (sharp/flat) + octave
 * - Middle C = C4 = MIDI 60
 * - Each octave starts on C and ends on B
 *
 * @param {number} midiNote - MIDI note number (0-127)
 * @param {boolean} useSharps - Use sharps (default) or flats
 * @returns {string} Note name (e.g., "C4", "F#3", "Bb5")
 *
 * @example
 * getNoteName(60);  // "C4"
 * getNoteName(61);  // "C#4"
 * getNoteName(61, false);  // "Db4"
 * getNoteName(69);  // "A4" (concert pitch)
 */
export function getNoteName(midiNote, useSharps = true) {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  const noteNames = useSharps ? NOTE_NAMES : NOTE_NAMES_FLAT;
  return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Get note names for a scale
 *
 * @param {number} rootMidi - Root note in MIDI
 * @param {string} scaleType - Scale type from SCALE_DEFINITIONS
 * @param {number} octaves - Number of octaves to generate
 * @param {boolean} useSharps - Use sharps or flats
 * @returns {Array<string>} Array of note names (e.g., ["C4", "D4", "E4", ...])
 *
 * @example
 * const cMajorNames = getScaleNoteNames(60, 'major', 1);
 * // Returns: ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]
 */
export function getScaleNoteNames(rootMidi, scaleType, octaves = 2, useSharps = true) {
  const midiNotes = generateScale(rootMidi, scaleType, octaves);
  return midiNotes.map(note => getNoteName(note, useSharps));
}

/**
 * Get scale degree information
 *
 * MUSIC THEORY CONCEPT:
 * - Scale degree: position in the scale (1-7 in Western music)
 * - Roman numerals: I, II, III, IV, V, VI, VII
 * - Uppercase = major, lowercase = minor, ° = diminished
 *
 * @param {number} degree - Scale degree (1-7, can be 8 for octave)
 * @param {string} scaleType - Scale type
 * @returns {Object} Degree information
 *
 * @example
 * const fifthDegree = getScaleDegree(5, 'major');
 * // Returns: { degree: 5, roman: 'V', name: 'Dominant', ... }
 */
export function getScaleDegree(degree, scaleType = 'major') {
  const scaleDef = getScaleInfo(scaleType);
  const degreeNames = ['Tonic', 'Supertonic', 'Mediant', 'Subdominant', 'Dominant', 'Submediant', 'Subtonic'];
  const degreeIndex = (degree - 1) % 7;

  return {
    degree,
    roman: scaleDef.degrees[degreeIndex],
    name: degreeNames[degreeIndex],
    interval: scaleDef.intervals[degreeIndex]
  };
}

export default {
  SCALE_DEFINITIONS,
  generateScale,
  getScaleInfo,
  getAvailableScales,
  getNoteName,
  getScaleNoteNames,
  getScaleDegree
};
