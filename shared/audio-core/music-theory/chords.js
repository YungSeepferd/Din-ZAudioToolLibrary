/**
 * chords.js - Music Theory: Chord System
 *
 * CONCEPT:
 * Chords are combinations of three or more notes played simultaneously.
 * Understanding chords is essential to music - almost all songs use chords.
 *
 * MUSIC THEORY BASICS:
 * - Triad: 3 notes (root, 3rd, 5th)
 * - Seventh chord: 4 notes (triad + 7th)
 * - Intervals: measured from root in semitones
 * - Inversion: moving the root note up an octave
 * - Voice leading: smooth movement between chords
 *
 * CHORD QUALITIES:
 * - Major (maj): happy, resolved, bright
 * - Minor (min): sad, dark, introspective
 * - Diminished (dim): unstable, needs resolution
 * - Augmented (aug): tense, unusual
 *
 * HARMONIC FUNCTION:
 * - Tonic (I): home, rest (C, c)
 * - Subdominant (IV): moving away from home (F, f)
 * - Dominant (V): tension, needs resolution (G, g)
 * - Pre-dominant (ii, iii, vi): lead to dominant
 *
 * @module music-theory/chords
 */

import { SCALE_DEFINITIONS, generateScale } from './scales.js';

// ============================================================
// CHORD DEFINITIONS
// ============================================================

/**
 * Chord templates - intervals from root note
 *
 * Triads (3 notes):
 * - Major: root + major 3rd + perfect 5th = [0, 4, 7]
 * - Minor: root + minor 3rd + perfect 5th = [0, 3, 7]
 * - Diminished: root + minor 3rd + diminished 5th = [0, 3, 6]
 * - Augmented: root + major 3rd + augmented 5th = [0, 4, 8]
 *
 * Seventh chords (4 notes):
 * - Maj7: major triad + major 7th = [0, 4, 7, 11]
 * - Dom7: major triad + minor 7th = [0, 4, 7, 10] (V7)
 * - Min7: minor triad + minor 7th = [0, 3, 7, 10]
 * - Min7b5: diminished + minor 7th = [0, 3, 6, 10] (half-diminished, ii7b5)
 *
 * WHY THESE INTERVALS:
 * - Intervals are measured in semitones
 * - Major 3rd = 4 semitones = bright, happy
 * - Minor 3rd = 3 semitones = dark, sad
 * - Perfect 5th = 7 semitones = stable, consonant
 * - Major 7th = 11 semitones = jazz, sophisticated
 * - Minor 7th = 10 semitones = blues, funk, dominant
 */
export const CHORD_TEMPLATES = {
  // TRIADS - 3-note chords
  major: {
    intervals: [0, 4, 7],
    name: 'Major',
    symbol: '',
    quality: 'major',
    numNotes: 3,
    description: 'Happy, bright, resolved'
  },

  minor: {
    intervals: [0, 3, 7],
    name: 'Minor',
    symbol: 'm',
    quality: 'minor',
    numNotes: 3,
    description: 'Sad, dark, introspective'
  },

  diminished: {
    intervals: [0, 3, 6],
    name: 'Diminished',
    symbol: '°',
    quality: 'diminished',
    numNotes: 3,
    description: 'Unstable, needs resolution'
  },

  augmented: {
    intervals: [0, 4, 8],
    name: 'Augmented',
    symbol: '+',
    quality: 'augmented',
    numNotes: 3,
    description: 'Tense, unusual, exotic'
  },

  // SEVENTH CHORDS - 4-note chords
  maj7: {
    intervals: [0, 4, 7, 11],
    name: 'Major 7th',
    symbol: 'maj7',
    quality: 'maj7',
    numNotes: 4,
    description: 'Jazz, sophisticated, bright'
  },

  dom7: {
    intervals: [0, 4, 7, 10],
    name: 'Dominant 7th',
    symbol: '7',
    quality: 'dom7',
    numNotes: 4,
    description: 'Blues, funk, dominant tension'
  },

  min7: {
    intervals: [0, 3, 7, 10],
    name: 'Minor 7th',
    symbol: 'm7',
    quality: 'min7',
    numNotes: 4,
    description: 'Jazz, funk, dark and smooth'
  },

  minMaj7: {
    intervals: [0, 3, 7, 11],
    name: 'Minor Major 7th',
    symbol: 'm(maj7)',
    quality: 'minMaj7',
    numNotes: 4,
    description: 'Jazz, mysterious, iii or vi chord'
  },

  halfDim7: {
    intervals: [0, 3, 6, 10],
    name: 'Half Diminished 7th',
    symbol: 'ø7',
    quality: 'halfDim7',
    numNotes: 4,
    description: 'Jazz, pre-dominant tension'
  }
};

// ============================================================
// DIATONIC CHORDS - Chords built from scale degrees
// ============================================================

/**
 * Diatonic chords: chords built using only notes from a scale
 *
 * MUSIC THEORY CONCEPT:
 * - Each scale degree becomes a chord root
 * - The chord quality depends on the intervals in the scale
 * - For major scale: I(maj), ii(min), iii(min), IV(maj), V(maj), vi(min), vii°
 * - For minor scale: i(min), ii°, III(maj), iv(min), v(min), VI(maj), VII(maj)
 *
 * WHY DIATONIC CHORDS:
 * - All notes in the chord come from the scale = harmonically coherent
 * - Chords sound "right" together
 * - No accidental clashes or dissonance
 * - Foundation of melody/harmony rules
 *
 * This function generates all 7 diatonic chords for a given scale
 */
export const DIATONIC_CHORD_QUALITIES = {
  // Major scale diatonic chords
  major: [
    { degree: 1, quality: 'major', symbol: 'I', name: 'I', function: 'tonic' },
    { degree: 2, quality: 'minor', symbol: 'ii', name: 'ii', function: 'pre-dominant' },
    { degree: 3, quality: 'minor', symbol: 'iii', name: 'iii', function: 'relative' },
    { degree: 4, quality: 'major', symbol: 'IV', name: 'IV', function: 'subdominant' },
    { degree: 5, quality: 'major', symbol: 'V', name: 'V', function: 'dominant' },
    { degree: 6, quality: 'minor', symbol: 'vi', name: 'vi', function: 'relative' },
    { degree: 7, quality: 'diminished', symbol: 'vii°', name: 'vii°', function: 'diminished' }
  ],

  // Natural minor scale diatonic chords
  minorNatural: [
    { degree: 1, quality: 'minor', symbol: 'i', name: 'i', function: 'tonic' },
    { degree: 2, quality: 'diminished', symbol: 'ii°', name: 'ii°', function: 'diminished' },
    { degree: 3, quality: 'major', symbol: 'III', name: 'III', function: 'relative' },
    { degree: 4, quality: 'minor', symbol: 'iv', name: 'iv', function: 'subdominant' },
    { degree: 5, quality: 'minor', symbol: 'v', name: 'v', function: 'dominant' },
    { degree: 6, quality: 'major', symbol: 'VI', name: 'VI', function: 'subdominant' },
    { degree: 7, quality: 'major', symbol: 'VII', name: 'VII', function: 'dominant-like' }
  ],

  // Harmonic minor scale diatonic chords
  minorHarmonic: [
    { degree: 1, quality: 'minor', symbol: 'i', name: 'i', function: 'tonic' },
    { degree: 2, quality: 'diminished', symbol: 'ii°', name: 'ii°', function: 'diminished' },
    { degree: 3, quality: 'augmented', symbol: 'III+', name: 'III+', function: 'relative' },
    { degree: 4, quality: 'minor', symbol: 'iv', name: 'iv', function: 'subdominant' },
    { degree: 5, quality: 'major', symbol: 'V', name: 'V', function: 'dominant' },
    { degree: 6, quality: 'major', symbol: 'VI', name: 'VI', function: 'subdominant' },
    { degree: 7, quality: 'diminished', symbol: 'vii°', name: 'vii°', function: 'diminished' }
  ]
};

// ============================================================
// CHORD GENERATION FUNCTIONS
// ============================================================

/**
 * Generate chord notes from root MIDI note and chord template
 *
 * ALGORITHM:
 * 1. Get chord template (intervals)
 * 2. Add each interval to root MIDI note
 * 3. Return array of MIDI notes in chord
 *
 * @param {number} rootMidi - Root note in MIDI (0-127)
 * @param {string} chordType - Chord type key (e.g., 'major', 'min7', 'dim')
 * @returns {Array<number>} Array of MIDI notes in the chord
 *
 * @example
 * generateChord(60, 'major');
 * // Returns: [60, 64, 67] (C, E, G = C Major)
 *
 * generateChord(60, 'min7');
 * // Returns: [60, 63, 67, 70] (C, Eb, G, Bb = C min7)
 */
export function generateChord(rootMidi, chordType = 'major') {
  if (!CHORD_TEMPLATES[chordType]) {
    console.warn(`Unknown chord type: ${chordType}, defaulting to major`);
    chordType = 'major';
  }

  const template = CHORD_TEMPLATES[chordType];
  return template.intervals.map(interval => rootMidi + interval);
}

/**
 * Generate all diatonic chords for a scale
 *
 * MUSIC THEORY CONCEPT:
 * For each scale degree, build a chord using only notes from the scale.
 *
 * EXAMPLE: C Major scale
 * - I chord: C E G (from C major scale) = C major
 * - ii chord: D F A (from C major scale) = D minor
 * - iii chord: E G B (from C major scale) = E minor
 * - IV chord: F A C (from C major scale) = F major
 * - V chord: G B D (from C major scale) = G major
 * - vi chord: A C E (from C major scale) = A minor
 * - vii° chord: B D F (from C major scale) = B diminished
 *
 * ALGORITHM:
 * 1. Get scale notes
 * 2. For each scale degree (1-7):
 *    a. Use that degree as chord root
 *    b. Find 3rd (skip next note)
 *    c. Find 5th (skip another note)
 *    d. Use root MIDI + intervals to build chord
 * 3. Return array of chord objects
 *
 * @param {number} rootMidi - Root note in MIDI
 * @param {string} scaleType - Scale type (e.g., 'major', 'minorNatural')
 * @returns {Array<Object>} Array of chord objects with notes and info
 *
 * @example
 * const cMajorChords = generateDiatonicChords(60, 'major');
 * // Returns:
 * // [
 * //   { degree: 1, roman: 'I', root: 60, notes: [60, 64, 67], quality: 'major' },
 * //   { degree: 2, roman: 'ii', root: 62, notes: [62, 65, 69], quality: 'minor' },
 * //   ...
 * // ]
 */
export function generateDiatonicChords(rootMidi, scaleType = 'major') {
  const scaleNotes = generateScale(rootMidi, scaleType, 2);
  const qualities = DIATONIC_CHORD_QUALITIES[scaleType] || DIATONIC_CHORD_QUALITIES.major;
  const chords = [];

  for (const quality of qualities) {
    const degree = quality.degree - 1; // 0-indexed
    const chordRoot = scaleNotes[degree];

    // Build chord from scale notes (skip notes to get 3rd and 5th)
    const notes = [
      scaleNotes[degree],           // Root
      scaleNotes[degree + 2],       // 3rd (skip one)
      scaleNotes[degree + 4]        // 5th (skip another)
    ];

    chords.push({
      degree: quality.degree,
      roman: quality.symbol,
      root: chordRoot,
      notes,
      quality: quality.quality,
      function: quality.function,
      name: quality.name
    });
  }

  return chords;
}

/**
 * Generate chord inversion
 *
 * MUSIC THEORY CONCEPT:
 * - Root position: root is the lowest note [C, E, G]
 * - First inversion: 3rd is lowest note [E, G, C] (C/E)
 * - Second inversion: 5th is lowest note [G, C, E] (C/G)
 *
 * WHY INVERSIONS MATTER:
 * - Smooth voice leading (moving between chords with minimal motion)
 * - Better bass lines
 * - Different sounds and functions
 * - Cadences often use inversions
 *
 * @param {Array<number>} chordNotes - MIDI notes of chord
 * @param {number} inversion - 0 = root, 1 = first, 2 = second
 * @returns {Array<number>} Inverted chord notes
 *
 * @example
 * const cMajor = [60, 64, 67];
 * invert(cMajor, 0);  // [60, 64, 67] (root position)
 * invert(cMajor, 1);  // [64, 67, 72] (first inversion, E in bass)
 * invert(cMajor, 2);  // [67, 72, 76] (second inversion, G in bass)
 */
export function invert(chordNotes, inversion = 0) {
  if (inversion === 0) return chordNotes;

  const inverted = [...chordNotes];
  for (let i = 0; i < inversion; i++) {
    const lowest = inverted.shift();
    inverted.push(lowest + 12); // Move to next octave
  }
  return inverted;
}

/**
 * Calculate voice leading between two chords
 *
 * MUSIC THEORY CONCEPT:
 * Voice leading: smooth movement from one chord to another
 * Goals:
 * - Minimize total distance moved
 * - Avoid large jumps
 * - Keep common tones (notes that appear in both chords)
 *
 * WHY IT MATTERS:
 * - Smooth transitions sound better
 * - Easier to play
 * - More professional sounding
 *
 * ALGORITHM:
 * 1. Find which notes from first chord move to which notes in second chord
 * 2. Calculate total semitone distance
 * 3. Try different inversions of second chord
 * 4. Return the inversion with minimum total movement
 *
 * @param {Array<number>} fromChord - Starting chord MIDI notes
 * @param {Array<number>} toChord - Target chord MIDI notes
 * @returns {Object} Voice leading info
 *
 * @example
 * const cMajor = [60, 64, 67];  // C Major
 * const fMajor = [65, 69, 72];  // F Major
 *
 * const voiceLeading = calculateVoiceLeading(cMajor, fMajor);
 * // Suggests which inversion of F Major is closest
 */
export function calculateVoiceLeading(fromChord, toChord) {
  let bestInversion = 0;
  let minDistance = Infinity;
  const distances = [];

  // Try each possible inversion
  for (let inv = 0; inv < toChord.length; inv++) {
    const inverted = invert(toChord, inv);
    let totalDistance = 0;

    // Calculate total semitone movement
    for (let i = 0; i < Math.min(fromChord.length, inverted.length); i++) {
      const distance = Math.abs(fromChord[i] - inverted[i]);
      totalDistance += distance;
    }

    distances.push({ inversion: inv, distance: totalDistance });

    if (totalDistance < minDistance) {
      minDistance = totalDistance;
      bestInversion = inv;
    }
  }

  return {
    bestInversion,
    minDistance,
    allDistances: distances,
    suggestedNotes: invert(toChord, bestInversion)
  };
}

/**
 * Get chord information by name
 *
 * @param {string} chordType - Chord type key (e.g., 'major', 'min7')
 * @returns {Object} Chord template object
 */
export function getChordInfo(chordType) {
  return CHORD_TEMPLATES[chordType] || CHORD_TEMPLATES.major;
}

/**
 * Get all available chord types
 *
 * @returns {Array<string>} Array of chord type keys
 */
export function getAvailableChords() {
  return Object.keys(CHORD_TEMPLATES);
}

export default {
  CHORD_TEMPLATES,
  DIATONIC_CHORD_QUALITIES,
  generateChord,
  generateDiatonicChords,
  invert,
  calculateVoiceLeading,
  getChordInfo,
  getAvailableChords
};
