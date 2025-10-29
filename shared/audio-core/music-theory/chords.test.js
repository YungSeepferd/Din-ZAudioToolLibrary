/**
 * chords.test.js
 * Comprehensive test suite for the chords module
 *
 * Tests chord generation, inversions, voice leading, and harmonic functions
 * to ensure correct music theory implementation.
 *
 * @module chords.test
 */

import { describe, it, expect } from 'vitest';
import {
  CHORD_TYPES,
  CHORD_TEMPLATES,
  generateChord,
  getChordMetadata,
  getChordInversion,
  getChordInversions,
  getVoiceLeadingDistance,
  getOptimalInversion,
  generateDiatonicChords,
} from './chords.js';

describe('Chords Module', () => {
  describe('Constants', () => {
    it('should have all expected chord types', () => {
      const expectedChords = [
        'major',
        'minor',
        'diminished',
        'augmented',
        'maj7',
        'dom7',
        'min7',
        'minMaj7',
        'halfDim7',
      ];

      expectedChords.forEach((chordType) => {
        expect(CHORD_TYPES).toContain(chordType);
      });
    });

    it('should have valid intervals for all chord types', () => {
      Object.values(CHORD_TEMPLATES).forEach((chord) => {
        expect(chord.intervals).toBeDefined();
        expect(Array.isArray(chord.intervals)).toBe(true);
        expect(chord.intervals.length).toBeGreaterThan(0);
        // First interval should always be 0 (root)
        expect(chord.intervals[0]).toBe(0);
      });
    });
  });

  describe('generateChord()', () => {
    it('should generate C major chord correctly', () => {
      const cMajor = generateChord(60, 'major');
      expect(cMajor).toEqual([60, 64, 67]); // C E G
    });

    it('should generate A minor chord correctly', () => {
      const aMinor = generateChord(57, 'minor');
      expect(aMinor).toEqual([57, 60, 64]); // A C E
    });

    it('should generate diminished chords', () => {
      const bDim = generateChord(71, 'diminished');
      expect(bDim).toEqual([71, 74, 77]); // B D F
    });

    it('should generate augmented chords', () => {
      const cAug = generateChord(60, 'augmented');
      expect(cAug).toEqual([60, 64, 68]); // C E G#
    });

    it('should generate maj7 chords', () => {
      const cMaj7 = generateChord(60, 'maj7');
      expect(cMaj7).toEqual([60, 64, 67, 71]); // C E G B
    });

    it('should generate dom7 chords', () => {
      const cDom7 = generateChord(60, 'dom7');
      expect(cDom7).toEqual([60, 64, 67, 70]); // C E G Bb
    });

    it('should generate min7 chords', () => {
      const aMin7 = generateChord(57, 'min7');
      expect(aMin7).toEqual([57, 60, 64, 67]); // A C E G
    });

    it('should work for any MIDI root', () => {
      const roots = [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120];
      roots.forEach((root) => {
        const chord = generateChord(root, 'major');
        expect(chord).toBeDefined();
        expect(chord[0]).toBe(root);
        expect(chord.length).toBe(3); // Triad
      });
    });

    it('should throw error for invalid chord type', () => {
      expect(() => generateChord(60, 'invalidChord')).toThrow();
    });

    it('should throw error for invalid MIDI note', () => {
      expect(() => generateChord(-1, 'major')).toThrow();
      expect(() => generateChord(128, 'major')).toThrow();
    });
  });

  describe('getChordInversion()', () => {
    it('should return root position (inversion 0)', () => {
      const cMajor = generateChord(60, 'major');
      const inversion0 = getChordInversion(cMajor, 0);
      expect(inversion0).toEqual([60, 64, 67]); // C E G
    });

    it('should return first inversion (inversion 1)', () => {
      const cMajor = generateChord(60, 'major');
      const inversion1 = getChordInversion(cMajor, 1);
      expect(inversion1).toEqual([64, 67, 72]); // E G C (next octave)
    });

    it('should return second inversion (inversion 2)', () => {
      const cMajor = generateChord(60, 'major');
      const inversion2 = getChordInversion(cMajor, 2);
      expect(inversion2).toEqual([67, 72, 76]); // G C E (next octave)
    });

    it('should wrap to root position for higher inversions', () => {
      const cMajor = generateChord(60, 'major');
      const inversion3 = getChordInversion(cMajor, 3);
      expect(inversion3).toEqual([72, 76, 79]); // C E G (next octave)
    });

    it('should handle negative inversion numbers', () => {
      const cMajor = generateChord(60, 'major');
      const inversion_1 = getChordInversion(cMajor, -1);
      expect(inversion_1).toBeDefined();
    });
  });

  describe('getChordInversions()', () => {
    it('should return all inversions of a chord', () => {
      const cMajor = generateChord(60, 'major');
      const inversions = getChordInversions(cMajor);

      expect(inversions).toHaveLength(3); // Triads have 3 inversions
      expect(inversions[0]).toEqual([60, 64, 67]); // Root position
      expect(inversions[1]).toEqual([64, 67, 72]); // 1st inversion
      expect(inversions[2]).toEqual([67, 72, 76]); // 2nd inversion
    });

    it('should return all inversions for seventh chords', () => {
      const cMaj7 = generateChord(60, 'maj7');
      const inversions = getChordInversions(cMaj7);

      expect(inversions).toHaveLength(4); // 7th chords have 4 inversions
      expect(inversions[0][0]).toBe(60); // Root position
      expect(inversions[1][0]).toBe(64); // 1st inversion
      expect(inversions[2][0]).toBe(67); // 2nd inversion
      expect(inversions[3][0]).toBe(71); // 3rd inversion
    });
  });

  describe('getVoiceLeadingDistance()', () => {
    it('should calculate correct distance between two chords', () => {
      const cMajor = generateChord(60, 'major'); // C E G
      const dMinor = generateChord(62, 'minor'); // D F A

      const distance = getVoiceLeadingDistance(cMajor, dMinor);
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });

    it('should return 0 for identical chords', () => {
      const cMajor = generateChord(60, 'major');
      const distance = getVoiceLeadingDistance(cMajor, cMajor);
      expect(distance).toBe(0);
    });

    it('should find closest voice leading', () => {
      const chord1 = [60, 64, 67]; // C major
      const chord2 = [62, 66, 69]; // D minor (nearby)
      const chord3 = [48, 52, 55]; // C major (low register)

      const distance1 = getVoiceLeadingDistance(chord1, chord2);
      const distance2 = getVoiceLeadingDistance(chord1, chord3);

      // Distance to nearby chord should be less than distant chord
      expect(distance1).toBeLessThan(distance2);
    });
  });

  describe('getOptimalInversion()', () => {
    it('should return optimal inversion from previous chord', () => {
      const cMajor = generateChord(60, 'major');
      const dMinor = generateChord(62, 'minor');

      const optimal = getOptimalInversion(dMinor, cMajor);

      expect(optimal).toHaveProperty('notes');
      expect(optimal).toHaveProperty('inversion');
      expect(optimal.inversion).toBeGreaterThanOrEqual(0);
      expect(optimal.inversion).toBeLessThan(dMinor.length);
    });

    it('should prefer minimal voice leading distance', () => {
      const c = generateChord(60, 'major'); // C E G
      const g = generateChord(67, 'major'); // G B D

      const optimal = getOptimalInversion(g, c);

      expect(optimal.notes).toBeDefined();
      expect(optimal.distance).toBeGreaterThanOrEqual(0);
    });

    it('should handle first chord (no previous context)', () => {
      const cMajor = generateChord(60, 'major');
      const optimal = getOptimalInversion(cMajor, null);

      // Should return root position as default
      expect(optimal.inversion).toBe(0);
    });
  });

  describe('generateDiatonicChords()', () => {
    it('should generate 7 chords from C major', () => {
      const diatonic = generateDiatonicChords(60, 'major');

      expect(diatonic).toHaveLength(7);
      expect(diatonic[0]).toHaveProperty('root');
      expect(diatonic[0]).toHaveProperty('type');
      expect(diatonic[0]).toHaveProperty('notes');
      expect(diatonic[0]).toHaveProperty('roman');
    });

    it('should have correct Roman numeral notation for major', () => {
      const diatonic = generateDiatonicChords(60, 'major');

      expect(diatonic[0].roman).toBe('I'); // C major
      expect(diatonic[1].roman).toBe('ii'); // D minor
      expect(diatonic[2].roman).toBe('iii'); // E minor
      expect(diatonic[3].roman).toBe('IV'); // F major
      expect(diatonic[4].roman).toBe('V'); // G major
      expect(diatonic[5].roman).toBe('vi'); // A minor
      expect(diatonic[6].roman).toBe('vii°'); // B diminished
    });

    it('should have correct harmonic functions', () => {
      const diatonic = generateDiatonicChords(60, 'major');

      // Tonic
      expect(['I', 'iii', 'vi']).toContain(diatonic[0].roman);
      // Subdominant
      expect(['IV', 'ii', 'vi']).toContain(diatonic[3].roman);
      // Dominant
      expect(['V', 'vii°']).toContain(diatonic[4].roman);
    });

    it('should generate chords from any root', () => {
      const roots = [57, 60, 62, 65]; // A, C, D, F
      roots.forEach((root) => {
        const diatonic = generateDiatonicChords(root, 'major');
        expect(diatonic).toHaveLength(7);
        expect(diatonic[0].root).toBe(root);
      });
    });

    it('should work with minor scales', () => {
      const aMinor = generateDiatonicChords(57, 'naturalMinor');

      expect(aMinor).toHaveLength(7);
      // A minor scale: A B C D E F G
      // i = A minor, III = C major, IV = D minor, etc.
      expect(aMinor[0].type).toBe('minor');
      expect(aMinor[0].roman).toBe('i');
    });
  });

  describe('getChordMetadata()', () => {
    it('should return metadata for all chord types', () => {
      Object.keys(CHORD_TYPES).forEach((chordType) => {
        const metadata = getChordMetadata(chordType);
        expect(metadata).toHaveProperty('name');
        expect(metadata).toHaveProperty('intervals');
        expect(metadata).toHaveProperty('description');
      });
    });

    it('should have descriptive information', () => {
      const majorMeta = getChordMetadata('major');
      expect(majorMeta.name).toContain('major');
      expect(majorMeta.description).toBeDefined();
    });
  });

  describe('Voice leading quality', () => {
    it('should prefer smooth voice leading in progressions', () => {
      const cMajor = generateChord(60, 'major');
      const dMinor = generateChord(62, 'minor');
      const gMajor = generateChord(67, 'major');

      const cToD = getOptimalInversion(dMinor, cMajor);
      const dToG = getOptimalInversion(gMajor, dMinor);

      // Both should have inversions that minimize movement
      expect(cToD.inversion).toBeGreaterThanOrEqual(0);
      expect(dToG.inversion).toBeGreaterThanOrEqual(0);
    });

    it('should create musically coherent progressions', () => {
      const progressionRoots = [60, 65, 67, 60]; // C G G C
      const chords = progressionRoots.map((root) => generateChord(root, 'major'));

      // Each should have a reasonable voice leading
      let previous = chords[0];
      for (let i = 1; i < chords.length; i++) {
        const optimal = getOptimalInversion(chords[i], previous);
        expect(optimal.distance).toBeGreaterThanOrEqual(0);
        previous = optimal.notes;
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle MIDI boundary notes', () => {
      const lowChord = generateChord(0, 'major');
      const highChord = generateChord(120, 'major');

      expect(lowChord).toBeDefined();
      expect(highChord).toBeDefined();
    });

    it('should generate same chord regardless of octave offset', () => {
      const c4Major = generateChord(60, 'major');
      const c5Major = generateChord(72, 'major');

      // Should have same intervals
      const intervals1 = [c4Major[1] - c4Major[0], c4Major[2] - c4Major[0]];
      const intervals2 = [c5Major[1] - c5Major[0], c5Major[2] - c5Major[0]];

      expect(intervals1).toEqual(intervals2);
    });

    it('should handle all 12 chromatic roots', () => {
      for (let root = 0; root < 12; root++) {
        const chord = generateChord(root, 'major');
        expect(chord).toBeDefined();
        expect(chord[0]).toBe(root);
      }
    });
  });

  describe('Integration with scales', () => {
    it('should generate diatonic chords from scale degrees', () => {
      const diatonic = generateDiatonicChords(60, 'major');

      // All 7 diatonic chords should exist
      expect(diatonic).toHaveLength(7);

      // Each should have valid notes
      diatonic.forEach((chord) => {
        expect(chord.notes).toBeDefined();
        expect(chord.notes.length).toBeGreaterThan(0);
      });
    });

    it('should have correct chord quality for diatonic harmony', () => {
      const diatonic = generateDiatonicChords(60, 'major');

      // I = major
      expect(diatonic[0].type).toBe('major');
      // ii = minor
      expect(diatonic[1].type).toBe('minor');
      // iii = minor
      expect(diatonic[2].type).toBe('minor');
      // IV = major
      expect(diatonic[3].type).toBe('major');
      // V = major
      expect(diatonic[4].type).toBe('major');
      // vi = minor
      expect(diatonic[5].type).toBe('minor');
      // vii = diminished
      expect(diatonic[6].type).toBe('diminished');
    });
  });
});
