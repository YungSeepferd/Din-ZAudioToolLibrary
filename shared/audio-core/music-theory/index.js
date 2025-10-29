/**
 * @audio/music-theory - Complete Music Theory Engine
 *
 * This module provides a comprehensive, modular music theory system for building
 * audio applications. It's designed for educational value, with clear concepts and
 * well-documented examples.
 *
 * MODULES:
 * 1. scales.js - Scale definitions and generation
 * 2. chords.js - Chord generation and voice leading
 * 3. midi.js - MIDI note conversion and utilities
 * 4. progressions.js - Chord progressions and harmonic function
 *
 * TYPICAL USAGE:
 *
 * // 1. Choose a key and scale
 * import { generateScale, getScaleInfo } from '@audio/music-theory';
 * const cMajorScale = generateScale(60, 'major');  // C Major scale starting at Middle C
 *
 * // 2. Generate diatonic chords for that scale
 * import { generateDiatonicChords } from '@audio/music-theory';
 * const chords = generateDiatonicChords(60, 'major');
 * // Returns: I, ii, iii, IV, V, vi, vii°
 *
 * // 3. Create a progression
 * import { generateProgression } from '@audio/music-theory';
 * const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
 *
 * // 4. Play the chords
 * for (const chord of progression) {
 *   audioState.playChord(chord.notes, 1.0);  // duration in seconds
 * }
 *
 * EDUCATIONAL PHILOSOPHY:
 * - Every function is documented with music theory context
 * - Comments explain "WHY" not just "WHAT"
 * - Examples provided for every major function
 * - Designed to teach music theory while you use it
 *
 * @module @audio/music-theory
 */

// ============================================================
// SCALES MODULE
// ============================================================

export {
  SCALE_DEFINITIONS,
  generateScale,
  getScaleInfo,
  getAvailableScales,
  getNoteName,
  getScaleNoteNames,
  getScaleDegree
} from './scales.js';

// ============================================================
// CHORDS MODULE
// ============================================================

export {
  CHORD_TEMPLATES,
  DIATONIC_CHORD_QUALITIES,
  generateChord,
  generateDiatonicChords,
  invert,
  calculateVoiceLeading,
  getChordInfo,
  getAvailableChords
} from './chords.js';

// ============================================================
// MIDI MODULE
// ============================================================

export {
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
} from './midi.js';

// ============================================================
// PROGRESSIONS MODULE
// ============================================================

export {
  HARMONIC_FUNCTIONS,
  PROGRESSION_TEMPLATES,
  generateProgression,
  analyzeChordFunction,
  analyzeVoiceLeading,
  getProgressionTemplate,
  getAvailableProgressions,
  getProgressionsByGenre
} from './progressions.js';

// ============================================================
// CONVENIENCE FUNCTIONS
// ============================================================

/**
 * Complete workflow: from key selection to chord progression
 *
 * WORKFLOW:
 * 1. Select key and scale type
 * 2. Get all diatonic chords
 * 3. Build progression from Roman numerals
 * 4. Apply voice leading
 * 5. Ready to play!
 *
 * @param {number} rootMidi - Root MIDI note (e.g., 60 for C)
 * @param {string} scaleType - Scale type (e.g., 'major', 'minorNatural')
 * @param {Array<string>} progressionRoman - Progression as Roman numerals
 * @returns {Object} Complete progression object with analysis
 *
 * @example
 * const prog = generateCompleteProgression(60, 'major', ['I', 'IV', 'V', 'I']);
 * // Returns: { progression: [...], analysis: {...}, info: {...} }
 */
export function generateCompleteProgression(rootMidi, scaleType, progressionRoman) {
  const { generateProgression, analyzeVoiceLeading } = await import('./progressions.js');
  const { getScaleInfo } = await import('./scales.js');
  const { midiToNoteName } = await import('./midi.js');

  const scaleInfo = getScaleInfo(scaleType);
  const progression = generateProgression(rootMidi, scaleType, progressionRoman);
  const analysis = analyzeVoiceLeading(progression);

  return {
    key: midiToNoteName(rootMidi),
    scale: scaleType,
    scaleInfo,
    progression,
    voiceLeadingAnalysis: analysis,
    romanNumerals: progressionRoman
  };
}

export default {
  // Re-export everything for default import
  // Usage: import MusicTheory from '@audio/music-theory'
  // Then: MusicTheory.generateScale, MusicTheory.generateChord, etc.
};
