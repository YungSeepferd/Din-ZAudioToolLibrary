/**
 * progressions.js - Music Theory: Chord Progressions
 *
 * CONCEPT:
 * A chord progression is a sequence of chords in a song.
 * Understanding progressions is key to writing and understanding music.
 *
 * MUSIC THEORY:
 * - Harmonic function: each chord has a role (tonic, subdominant, dominant)
 * - Diatonic progressions: chords from the same scale sound "right" together
 * - Voice leading: smooth movement between chords
 * - Cadences: ending progressions that create specific feelings (resolution, suspension)
 *
 * COMMON PROGRESSIONS:
 * - I-IV-V-I (classic, resolves strongly)
 * - vi-IV-I-V (sad start, happy resolution, very popular)
 * - ii-V-I (jazz standard, smooth movement)
 * - I-V-vi-IV (pop progression, extremely common)
 *
 * @module music-theory/progressions
 */

import { generateDiatonicChords, calculateVoiceLeading } from './chords.js';

// ============================================================
// HARMONIC FUNCTION DEFINITIONS
// ============================================================

/**
 * Harmonic functions describe the role each chord plays
 *
 * MUSIC THEORY:
 * - Tonic (I): home, rest, resolution (stable)
 * - Subdominant (IV): moving away from home (pre-dominant function)
 * - Dominant (V): tension, wants to resolve back to tonic (unstable)
 * - Pre-dominant: chords that lead to dominant (ii, iii, vi)
 *
 * WHY THIS MATTERS:
 * - Understanding function helps predict where progressions will go
 * - Creates emotional tension and release
 * - Foundation of classical harmony and song structure
 */
export const HARMONIC_FUNCTIONS = {
  tonic: {
    name: 'Tonic',
    symbol: 'T',
    description: 'Home, rest, resolution',
    stability: 'stable',
    examples: ['I', 'iii', 'vi']
  },

  subdominant: {
    name: 'Subdominant',
    symbol: 'S',
    description: 'Move away from tonic',
    stability: 'stable',
    examples: ['IV', 'ii']
  },

  dominant: {
    name: 'Dominant',
    symbol: 'D',
    description: 'Tension, wants to resolve',
    stability: 'unstable',
    examples: ['V', 'vii°']
  },

  preDominant: {
    name: 'Pre-dominant',
    symbol: 'PD',
    description: 'Lead to dominant',
    stability: 'stable-unstable',
    examples: ['ii', 'iii', 'vi', 'IV']
  }
};

// ============================================================
// PROGRESSION TEMPLATES
// ============================================================

/**
 * Common chord progressions from different genres
 *
 * Each progression stored as Roman numerals so it works in any key
 */
export const PROGRESSION_TEMPLATES = {
  // CLASSIC PROGRESSIONS
  perfectCadence: {
    name: 'Perfect Cadence',
    roman: ['V', 'I'],
    description: 'Dominant to Tonic, strong resolution',
    genre: 'classical, universal',
    feel: 'resolved, satisfied',
    difficulty: 'beginner'
  },

  plagalCadence: {
    name: 'Plagal Cadence',
    roman: ['IV', 'I'],
    description: 'Subdominant to Tonic, like "Amen"',
    genre: 'classical, hymns',
    feel: 'resolved, peaceful',
    difficulty: 'beginner'
  },

  deceptiveCadence: {
    name: 'Deceptive Cadence',
    roman: ['V', 'vi'],
    description: 'Dominant expects I but gets vi (relative minor)',
    genre: 'classical, surprise effect',
    feel: 'unexpected, sad turn',
    difficulty: 'intermediate'
  },

  // POPULAR POP PROGRESSIONS
  popProgression: {
    name: 'Popular Pop Progression',
    roman: ['I', 'V', 'vi', 'IV'],
    description: 'One of the most common progressions in modern pop',
    genre: 'pop, rock',
    feel: 'uplifting, energetic',
    difficulty: 'beginner',
    repeatable: true
  },

  sadProgression: {
    name: 'Sad Pop Progression',
    roman: ['vi', 'IV', 'I', 'V'],
    description: 'Starts sad (vi=relative minor), resolves happy',
    genre: 'pop, ballads',
    feel: 'emotional journey',
    difficulty: 'beginner',
    repeatable: true
  },

  circleOfFifths: {
    name: 'Circle of Fifths',
    roman: ['I', 'IV', 'vii°', 'iii', 'vi', 'ii', 'V', 'I'],
    description: 'Each chord is a perfect 5th below the previous',
    genre: 'baroque, classical, jazz',
    feel: 'sophisticated, musical journey',
    difficulty: 'advanced'
  },

  // JAZZ PROGRESSIONS
  jazzTurnaround: {
    name: 'Jazz Turnaround',
    roman: ['vi', 'ii', 'V', 'I'],
    description: 'Common ending progression in jazz standards',
    genre: 'jazz, standards',
    feel: 'sophisticated, smooth',
    difficulty: 'intermediate',
    repeatable: true
  },

  iimV: {
    name: 'ii-V-I (Jazz Standard)',
    roman: ['ii', 'V', 'I'],
    description: 'Most common progression in jazz, very smooth',
    genre: 'jazz, blues',
    feel: 'smooth, professional',
    difficulty: 'intermediate',
    repeatable: true
  },

  // BLUES PROGRESSIONS
  bluesProgression12Bar: {
    name: '12-Bar Blues',
    roman: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'],
    description: 'Classic 12-bar blues structure',
    genre: 'blues, rock',
    feel: 'soulful, groovy',
    difficulty: 'beginner',
    bars: 12
  },

  blues12BarMinor: {
    name: '12-Bar Blues (Minor)',
    roman: ['i', 'i', 'i', 'i', 'iv', 'iv', 'i', 'i', 'v', 'iv', 'i', 'v'],
    description: 'Classic 12-bar blues in minor key',
    genre: 'blues, rock, metal',
    feel: 'dark, bluesy',
    difficulty: 'beginner',
    bars: 12
  },

  // MINIMALIST PROGRESSIONS
  singleChord: {
    name: 'Single Chord Vamp',
    roman: ['I'],
    description: 'Focus on rhythm and timbre, not harmony',
    genre: 'minimalism, ambient, techno',
    feel: 'meditative, hypnotic',
    difficulty: 'beginner',
    repeatable: true
  },

  twoChordVamp: {
    name: 'Two Chord Vamp',
    roman: ['I', 'IV'],
    description: 'Simple back and forth, very effective',
    genre: 'rock, pop, folk',
    feel: 'driving, energetic',
    difficulty: 'beginner',
    repeatable: true
  }
};

// ============================================================
// PROGRESSION GENERATION & ANALYSIS
// ============================================================

/**
 * Generate a chord progression given root key and Roman numerals
 *
 * ALGORITHM:
 * 1. Generate all diatonic chords for the key/scale
 * 2. For each Roman numeral in the progression:
 *    a. Find corresponding chord by degree
 *    b. Apply voice leading for smooth transitions
 *    c. Add to progression
 * 3. Return array of chord objects with notes
 *
 * @param {number} rootMidi - Root MIDI note for the key
 * @param {string} scaleType - Scale type (e.g., 'major', 'minorNatural')
 * @param {Array<string>} romanNumerals - Progression as Roman numerals (e.g., ['I', 'IV', 'V', 'I'])
 * @returns {Array<Object>} Array of chord objects with notes and voice leading
 *
 * @example
 * const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
 * // Returns chords with smooth voice leading applied
 */
export function generateProgression(rootMidi, scaleType, romanNumerals) {
  const diatonicChords = generateDiatonicChords(rootMidi, scaleType);
  const progression = [];
  let previousChord = null;

  for (const roman of romanNumerals) {
    // Find matching chord by Roman numeral
    const chord = diatonicChords.find(c => c.roman === roman);

    if (!chord) {
      console.warn(`Chord not found: ${roman}`);
      continue;
    }

    // Apply voice leading if not first chord
    let voiceLedChord = { ...chord };
    if (previousChord) {
      const voiceLeading = calculateVoiceLeading(previousChord.notes, chord.notes);
      voiceLedChord.voiceLeadingInversion = voiceLeading.bestInversion;
      voiceLedChord.notes = voiceLeading.suggestedNotes;
      voiceLedChord.voiceLeadingDistance = voiceLeading.minDistance;
    }

    progression.push(voiceLedChord);
    previousChord = voiceLedChord;
  }

  return progression;
}

/**
 * Analyze harmonic function of a chord
 *
 * ALGORITHM:
 * 1. Get scale degrees involved in chord
 * 2. Find common harmonic function patterns
 * 3. Return function description
 *
 * @param {string} roman - Roman numeral (e.g., 'V', 'IV')
 * @param {string} scaleType - Scale type (major, minorNatural, etc.)
 * @returns {Object} Function information
 *
 * @example
 * const func = analyzeChordFunction('V', 'major');
 * // Returns: { primary: 'dominant', secondary: [...], qualities: [...] }
 */
export function analyzeChordFunction(roman, scaleType = 'major') {
  const functionMap = {
    'I': { primary: 'tonic', secondary: [], qualities: ['stable', 'resolved'] },
    'i': { primary: 'tonic', secondary: [], qualities: ['stable', 'resolved'] },
    'ii': { primary: 'pre-dominant', secondary: ['subdominant'], qualities: ['stable', 'smooth'] },
    'ii°': { primary: 'pre-dominant', secondary: [], qualities: ['unstable', 'darkens'] },
    'iii': { primary: 'relative', secondary: ['tonic'], qualities: ['stable', 'warm'] },
    'III': { primary: 'relative', secondary: ['subdominant'], qualities: ['stable', 'bright'] },
    'IV': { primary: 'subdominant', secondary: [], qualities: ['stable', 'moving-away'] },
    'iv': { primary: 'subdominant', secondary: [], qualities: ['stable', 'dark'] },
    'V': { primary: 'dominant', secondary: [], qualities: ['unstable', 'tension'] },
    'v': { primary: 'dominant', secondary: [], qualities: ['unstable', 'dark-tension'] },
    'VI': { primary: 'subdominant', secondary: ['tonic-alternative'], qualities: ['stable', 'peaceful'] },
    'vi': { primary: 'relative', secondary: ['tonic-alternative'], qualities: ['stable', 'sad'] },
    'VII': { primary: 'dominant-like', secondary: ['dominant'], qualities: ['unstable', 'unusual'] },
    'vii°': { primary: 'dominant', secondary: [], qualities: ['unstable', 'very-tense'] }
  };

  return functionMap[roman] || { primary: 'unknown', secondary: [], qualities: [] };
}

/**
 * Check if a progression follows good voice leading principles
 *
 * VOICE LEADING RULES:
 * 1. Minimize total note movement
 * 2. Keep common tones when possible
 * 3. Avoid large jumps (especially in bass)
 * 4. Smooth transitions = better sound
 *
 * @param {Array<Object>} progression - Array of chord objects with notes
 * @returns {Object} Voice leading analysis
 *
 * @example
 * const analysis = analyzeVoiceLeading(progression);
 * // Returns: { totalDistance: 45, averageDistance: 9, quality: 'good', suggestions: [...] }
 */
export function analyzeVoiceLeading(progression) {
  let totalDistance = 0;
  const distances = [];

  for (let i = 1; i < progression.length; i++) {
    const prevChord = progression[i - 1];
    const currChord = progression[i];

    // Calculate distance between chords
    let chordDistance = 0;
    for (let j = 0; j < Math.min(prevChord.notes.length, currChord.notes.length); j++) {
      chordDistance += Math.abs(prevChord.notes[j] - currChord.notes[j]);
    }

    distances.push(chordDistance);
    totalDistance += chordDistance;
  }

  const averageDistance = totalDistance / distances.length;
  const quality = averageDistance < 5 ? 'excellent' : averageDistance < 10 ? 'good' : 'fair';

  return {
    totalDistance,
    averageDistance,
    quality,
    distances,
    suggestions: quality !== 'excellent' ? ['Consider applying voice leading inversions'] : []
  };
}

/**
 * Get a progression template
 *
 * @param {string} templateName - Template key from PROGRESSION_TEMPLATES
 * @returns {Object} Progression template object
 */
export function getProgressionTemplate(templateName) {
  return PROGRESSION_TEMPLATES[templateName];
}

/**
 * Get all available progression templates
 *
 * @returns {Array<string>} Array of template keys
 */
export function getAvailableProgressions() {
  return Object.keys(PROGRESSION_TEMPLATES);
}

/**
 * Get progressions by genre
 *
 * @param {string} genre - Genre to filter by (e.g., 'jazz', 'pop', 'blues')
 * @returns {Array<Object>} Matching progression templates
 */
export function getProgressionsByGenre(genre) {
  return Object.values(PROGRESSION_TEMPLATES).filter(prog =>
    prog.genre && prog.genre.toLowerCase().includes(genre.toLowerCase())
  );
}

export default {
  HARMONIC_FUNCTIONS,
  PROGRESSION_TEMPLATES,
  generateProgression,
  analyzeChordFunction,
  analyzeVoiceLeading,
  getProgressionTemplate,
  getAvailableProgressions,
  getProgressionsByGenre
};
