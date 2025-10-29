/**
 * scales.test.js
 * Comprehensive test suite for the scales module
 *
 * Tests all scale generation, metadata, and utility functions
 * to ensure correct music theory implementation.
 *
 * @module scales.test
 */

import { describe, it, expect } from 'vitest';
import {
  SCALE_TYPES,
  SCALE_PATTERNS,
  generateScale,
  getScaleMetadata,
  isNoteInScale,
  getScaleDegree,
  getRelativeMinor,
  getParallelMinor,
  getParallelMajor,
} from './scales.js';

describe('Scales Module', () => {
  describe('Constants', () => {
    it('should have all expected scale types defined', () => {
      const expectedTypes = [
        'major',
        'minor',
        'naturalMinor',
        'harmonicMinor',
        'melodicMinor',
        'ionianMode',
        'dorianMode',
        'phrygianMode',
        'lydianMode',
        'mixolydianMode',
        'aeolianMode',
        'locrianMode',
        'majorPentatonic',
        'minorPentatonic',
        'bluesScale',
      ];

      expectedTypes.forEach((scaleType) => {
        expect(SCALE_TYPES).toContain(scaleType);
      });
    });

    it('should have correct semitone patterns for major scale', () => {
      expect(SCALE_PATTERNS.major).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should have correct semitone patterns for natural minor', () => {
      expect(SCALE_PATTERNS.naturalMinor).toEqual([0, 2, 3, 5, 7, 8, 10]);
    });

    it('should have correct semitone patterns for harmonic minor', () => {
      expect(SCALE_PATTERNS.harmonicMinor).toEqual([0, 2, 3, 5, 7, 8, 11]);
    });

    it('should have correct semitone patterns for pentatonic scales', () => {
      expect(SCALE_PATTERNS.majorPentatonic).toEqual([0, 2, 4, 7, 9]);
      expect(SCALE_PATTERNS.minorPentatonic).toEqual([0, 3, 5, 7, 10]);
    });

    it('should have correct semitone patterns for all modes', () => {
      // Modes are just rotations of the major scale
      expect(SCALE_PATTERNS.dorianMode).toEqual([0, 2, 3, 5, 7, 9, 10]);
      expect(SCALE_PATTERNS.phrygianMode).toEqual([0, 1, 3, 5, 7, 8, 10]);
      expect(SCALE_PATTERNS.lydianMode).toEqual([0, 2, 4, 6, 7, 9, 11]);
      expect(SCALE_PATTERNS.mixolydianMode).toEqual([0, 2, 4, 5, 7, 9, 10]);
    });
  });

  describe('generateScale()', () => {
    it('should generate C major scale correctly', () => {
      const cMajor = generateScale(60, 'major'); // MIDI 60 = C4
      expect(cMajor).toEqual([60, 62, 64, 65, 67, 69, 71]);
    });

    it('should generate scale from any MIDI note', () => {
      const aMajor = generateScale(57, 'major'); // MIDI 57 = A3
      expect(aMajor).toEqual([57, 59, 61, 62, 64, 66, 68]);
    });

    it('should generate minor scales correctly', () => {
      const aMinor = generateScale(57, 'naturalMinor'); // A3 natural minor
      expect(aMinor).toEqual([57, 59, 60, 62, 64, 65, 67]);
    });

    it('should generate harmonic minor with raised 7th', () => {
      const aHarmonicMinor = generateScale(57, 'harmonicMinor');
      expect(aHarmonicMinor).toEqual([57, 59, 60, 62, 64, 65, 68]);
      // 7th degree should be G# (68) not G (67)
    });

    it('should generate melodic minor correctly', () => {
      const aMelodicMinor = generateScale(57, 'melodicMinor');
      // A melodic minor: A B C D E F# G#
      expect(aMelodicMinor).toEqual([57, 59, 60, 62, 64, 66, 68]);
    });

    it('should generate pentatonic scales', () => {
      const cMajorPent = generateScale(60, 'majorPentatonic');
      expect(cMajorPent).toEqual([60, 62, 64, 67, 69]); // C D E G A
      expect(cMajorPent.length).toBe(5);
    });

    it('should generate minor pentatonic', () => {
      const aMinorPent = generateScale(57, 'minorPentatonic');
      expect(aMinorPent).toEqual([57, 60, 62, 64, 67]); // A C D E G
      expect(aMinorPent.length).toBe(5);
    });

    it('should generate blues scale', () => {
      const cBlues = generateScale(60, 'bluesScale');
      expect(cBlues).toEqual([60, 63, 65, 66, 67, 70]); // C Eb F F# G Bb
      expect(cBlues.length).toBe(6);
    });

    it('should generate all modes of C major', () => {
      const ionian = generateScale(60, 'ionianMode'); // C D E F G A B = major
      const dorian = generateScale(62, 'dorianMode'); // D E F G A B C = D dorian
      const phrygian = generateScale(64, 'phrygianMode'); // E F G A B C D = E phrygian

      expect(ionian).toEqual([60, 62, 64, 65, 67, 69, 71]);
      expect(dorian).toEqual([62, 64, 65, 67, 69, 71, 72]);
      expect(phrygian).toEqual([64, 65, 67, 69, 71, 72, 74]);
    });

    it('should wrap octaves correctly for high notes', () => {
      const highScale = generateScale(120, 'major'); // C7
      expect(highScale.length).toBe(7);
      expect(highScale[0]).toBe(120);
      expect(highScale[6]).toBe(131); // B7
    });

    it('should handle low MIDI notes (MIDI 0)', () => {
      const lowScale = generateScale(0, 'major'); // C-1
      expect(lowScale).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should throw error for invalid scale type', () => {
      expect(() => generateScale(60, 'invalidScale')).toThrow();
    });

    it('should throw error for invalid MIDI note', () => {
      expect(() => generateScale(-1, 'major')).toThrow();
      expect(() => generateScale(128, 'major')).toThrow();
    });
  });

  describe('getScaleMetadata()', () => {
    it('should return metadata for major scale', () => {
      const metadata = getScaleMetadata('major');
      expect(metadata).toHaveProperty('pattern');
      expect(metadata).toHaveProperty('intervals');
      expect(metadata).toHaveProperty('description');
      expect(metadata.pattern).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should include correct interval names', () => {
      const metadata = getScaleMetadata('major');
      expect(metadata.intervals).toContain('Unison');
      expect(metadata.intervals).toContain('Major 2nd');
      expect(metadata.intervals).toContain('Major 3rd');
    });

    it('should have descriptions for all scale types', () => {
      Object.keys(SCALE_TYPES).forEach((scaleType) => {
        const metadata = getScaleMetadata(scaleType);
        expect(metadata.description).toBeDefined();
        expect(metadata.description.length).toBeGreaterThan(0);
      });
    });

    it('should throw error for invalid scale type', () => {
      expect(() => getScaleMetadata('invalidScale')).toThrow();
    });
  });

  describe('isNoteInScale()', () => {
    it('should correctly identify notes in C major', () => {
      const cMajor = generateScale(60, 'major');
      expect(isNoteInScale(60, cMajor)).toBe(true); // C
      expect(isNoteInScale(62, cMajor)).toBe(true); // D
      expect(isNoteInScale(61, cMajor)).toBe(false); // C#
      expect(isNoteInScale(63, cMajor)).toBe(false); // D#
    });

    it('should identify all scale tones correctly', () => {
      const aMajor = generateScale(57, 'major');
      aMajor.forEach((note) => {
        expect(isNoteInScale(note, aMajor)).toBe(true);
      });
    });

    it('should reject chromatic alterations', () => {
      const scale = generateScale(60, 'major');
      expect(isNoteInScale(61, scale)).toBe(false); // C#
      expect(isNoteInScale(63, scale)).toBe(false); // D#
      expect(isNoteInScale(66, scale)).toBe(false); // F#
    });

    it('should handle empty scale', () => {
      expect(isNoteInScale(60, [])).toBe(false);
    });
  });

  describe('getScaleDegree()', () => {
    it('should return correct degree for major scale tones', () => {
      const cMajor = generateScale(60, 'major');
      expect(getScaleDegree(60, cMajor)).toBe(1); // C = I
      expect(getScaleDegree(62, cMajor)).toBe(2); // D = II
      expect(getScaleDegree(64, cMajor)).toBe(3); // E = III
      expect(getScaleDegree(65, cMajor)).toBe(4); // F = IV
      expect(getScaleDegree(67, cMajor)).toBe(5); // G = V
      expect(getScaleDegree(69, cMajor)).toBe(6); // A = VI
      expect(getScaleDegree(71, cMajor)).toBe(7); // B = VII
    });

    it('should return 0 for notes not in scale', () => {
      const cMajor = generateScale(60, 'major');
      expect(getScaleDegree(61, cMajor)).toBe(0); // C# not in scale
      expect(getScaleDegree(63, cMajor)).toBe(0); // D# not in scale
    });

    it('should handle notes in different octaves', () => {
      const cMajor = generateScale(60, 'major');
      // C in next octave
      expect(getScaleDegree(72, cMajor)).toBe(1);
      // D in next octave
      expect(getScaleDegree(74, cMajor)).toBe(2);
    });
  });

  describe('Relative and parallel minor/major relationships', () => {
    it('should return correct relative minor', () => {
      const cMajor = 60; // C major
      const aMinor = getRelativeMinor(cMajor); // A minor (relative)
      expect(aMinor).toBe(57); // A is 3 semitones below C
    });

    it('should return correct parallel minor', () => {
      const cMajor = 60; // C major
      const cMinor = getParallelMinor(cMajor); // C minor (parallel)
      expect(cMinor).toBe(60); // Same root, different scale
    });

    it('should return correct parallel major', () => {
      const aMinor = 57; // A minor
      const aMajor = getParallelMajor(aMinor); // A major (parallel)
      expect(aMajor).toBe(57); // Same root
    });

    it('should work for all chromatic roots', () => {
      for (let midi = 0; midi < 12; midi++) {
        const relMin = getRelativeMinor(midi);
        const parMin = getParallelMinor(midi);
        const parMaj = getParallelMajor(midi);

        expect(relMin).toBeGreaterThanOrEqual(0);
        expect(parMin).toBe(midi);
        expect(parMaj).toBe(midi);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle MIDI boundary notes (0 and 127)', () => {
      const lowScale = generateScale(0, 'major');
      const highScale = generateScale(127, 'major');

      expect(lowScale).toBeDefined();
      expect(highScale).toBeDefined();
      expect(lowScale[0]).toBe(0);
      // 127 + 2 would wrap, but should still be valid
    });

    it('should generate same scale regardless of octave', () => {
      const c4Major = generateScale(60, 'major');
      const c5Major = generateScale(72, 'major');

      const c4Intervals = c4Major.map((n, i) => n - c4Major[0]);
      const c5Intervals = c5Major.map((n, i) => n - c5Major[0]);

      expect(c4Intervals).toEqual(c5Intervals);
    });

    it('should handle all 12 chromatic roots', () => {
      const roots = [
        60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
      ];

      roots.forEach((root) => {
        const scale = generateScale(root, 'major');
        expect(scale).toHaveLength(7);
        expect(scale[0]).toBe(root);
      });
    });
  });

  describe('Integration with music theory concepts', () => {
    it('should generate scales that follow music theory rules', () => {
      // All scale degrees should be within an octave of the root
      const cMajor = generateScale(60, 'major');
      cMajor.forEach((note) => {
        expect(note).toBeGreaterThanOrEqual(60);
        expect(note).toBeLessThan(72);
      });
    });

    it('should have consistent intervals between scale degrees', () => {
      const cMajor = generateScale(60, 'major');
      const intervals = [];
      for (let i = 0; i < cMajor.length - 1; i++) {
        intervals.push(cMajor[i + 1] - cMajor[i]);
      }
      // Major scale: W W H W W W H (2 2 1 2 2 2 1 semitones)
      expect(intervals).toEqual([2, 2, 1, 2, 2, 2, 1]);
    });

    it('should generate harmonically valid scales', () => {
      // Verify by checking against known scale formulas
      const cMajor = generateScale(60, 'major');
      const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

      // Each note should be exactly one letter name apart
      // C(0) D(2) E(4) F(5) G(7) A(9) B(11)
      expect(cMajor).toEqual([60, 62, 64, 65, 67, 69, 71]);
    });
  });
});
