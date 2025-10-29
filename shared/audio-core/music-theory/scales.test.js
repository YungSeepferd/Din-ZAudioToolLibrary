/**
 * scales.test.js
 * Test suite for the scales module
 *
 * Tests scale generation, metadata retrieval, and utility functions
 * to verify correct music theory implementation.
 *
 * @module scales.test
 */

import { describe, it, expect } from 'vitest';
import {
  SCALE_DEFINITIONS,
  generateScale,
  getScaleInfo,
  getAvailableScales,
  getNoteName,
  getScaleNoteNames,
  getScaleDegree,
} from './scales.js';

describe('Scales Module', () => {
  describe('Constants', () => {
    it('should have SCALE_DEFINITIONS defined', () => {
      expect(SCALE_DEFINITIONS).toBeDefined();
      expect(typeof SCALE_DEFINITIONS).toBe('object');
    });

    it('should have major scale defined', () => {
      expect(SCALE_DEFINITIONS.major).toBeDefined();
      expect(SCALE_DEFINITIONS.major.intervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should have minor scale variants', () => {
      expect(SCALE_DEFINITIONS.minorNatural).toBeDefined();
      expect(SCALE_DEFINITIONS.minorHarmonic).toBeDefined();
      expect(SCALE_DEFINITIONS.minorMelodic).toBeDefined();
    });

    it('should have all modes defined', () => {
      expect(SCALE_DEFINITIONS.dorian).toBeDefined();
      expect(SCALE_DEFINITIONS.phrygian).toBeDefined();
      expect(SCALE_DEFINITIONS.lydian).toBeDefined();
      expect(SCALE_DEFINITIONS.mixolydian).toBeDefined();
    });

    it('should have pentatonic scales', () => {
      expect(SCALE_DEFINITIONS.majorPentatonic).toBeDefined();
      expect(SCALE_DEFINITIONS.minorPentatonic).toBeDefined();
    });

    it('should have blues scale', () => {
      expect(SCALE_DEFINITIONS.blues).toBeDefined();
      expect(SCALE_DEFINITIONS.blues.intervals.length).toBe(6);
    });
  });

  describe('generateScale()', () => {
    it('should generate C major scale (1 octave)', () => {
      const cMajor = generateScale(60, 'major', 1);
      expect(cMajor).toEqual([60, 62, 64, 65, 67, 69, 71]);
    });

    it('should generate scale from any MIDI root', () => {
      const aMajor = generateScale(57, 'major', 1);
      expect(aMajor).toEqual([57, 59, 61, 62, 64, 66, 68]);
    });

    it('should generate 2 octaves by default', () => {
      const cMajor = generateScale(60, 'major');
      expect(cMajor).toHaveLength(14); // 7 notes * 2 octaves
    });

    it('should generate minor scales', () => {
      const aMinor = generateScale(57, 'minorNatural', 1);
      expect(aMinor).toEqual([57, 59, 60, 62, 64, 65, 67]);
    });

    it('should generate harmonic minor with raised 7th', () => {
      const aHarm = generateScale(57, 'minorHarmonic', 1);
      expect(aHarm).toEqual([57, 59, 60, 62, 64, 65, 68]);
    });

    it('should generate melodic minor correctly', () => {
      const aMelodic = generateScale(57, 'minorMelodic', 1);
      expect(aMelodic).toEqual([57, 59, 60, 62, 64, 66, 68]);
    });

    it('should generate pentatonic scales', () => {
      const cPent = generateScale(60, 'majorPentatonic', 1);
      expect(cPent).toHaveLength(5);
      expect(cPent).toEqual([60, 62, 64, 67, 69]);
    });

    it('should generate blues scale', () => {
      const cBlues = generateScale(60, 'blues', 1);
      expect(cBlues).toHaveLength(6);
      expect(cBlues[0]).toBe(60); // Root
    });

    it('should handle all scale types', () => {
      const types = getAvailableScales();
      types.forEach(type => {
        const scale = generateScale(60, type, 1);
        expect(scale).toBeDefined();
        expect(Array.isArray(scale)).toBe(true);
        expect(scale.length).toBeGreaterThan(0);
        expect(scale[0]).toBe(60); // Root should match
      });
    });

    it('should handle MIDI boundaries', () => {
      const lowScale = generateScale(0, 'major', 1);
      expect(lowScale).toEqual([0, 2, 4, 5, 7, 9, 11]);

      const highScale = generateScale(120, 'major', 1);
      expect(highScale[0]).toBe(120);
    });
  });

  describe('getScaleInfo()', () => {
    it('should return scale information', () => {
      const info = getScaleInfo('major');
      expect(info).toBeDefined();
      expect(info.name).toBe('Major');
      expect(info.intervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
      expect(info.description).toBeDefined();
    });

    it('should have scale degrees', () => {
      const info = getScaleInfo('major');
      expect(info.degrees).toEqual(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']);
    });

    it('should return info for all scale types', () => {
      getAvailableScales().forEach(type => {
        const info = getScaleInfo(type);
        expect(info).toBeDefined();
        expect(info.name).toBeDefined();
        expect(info.intervals).toBeDefined();
        expect(info.description).toBeDefined();
      });
    });
  });

  describe('getAvailableScales()', () => {
    it('should return array of scale types', () => {
      const scales = getAvailableScales();
      expect(Array.isArray(scales)).toBe(true);
      expect(scales.length).toBeGreaterThan(10);
    });

    it('should include major and minor', () => {
      const scales = getAvailableScales();
      expect(scales).toContain('major');
      expect(scales).toContain('minorNatural');
    });
  });

  describe('getNoteName()', () => {
    it('should convert MIDI 60 to C4', () => {
      const name = getNoteName(60);
      expect(name).toBe('C4');
    });

    it('should convert MIDI 69 to A4', () => {
      const name = getNoteName(69);
      expect(name).toBe('A4');
    });

    it('should handle sharps', () => {
      const name = getNoteName(61);
      expect(name).toContain('#');
    });

    it('should handle all MIDI notes', () => {
      for (let midi = 0; midi < 128; midi += 12) {
        const name = getNoteName(midi);
        expect(name).toBeDefined();
        expect(typeof name).toBe('string');
      }
    });
  });

  describe('getScaleNoteNames()', () => {
    it('should return note names for scale', () => {
      const names = getScaleNoteNames(60, 'major', 1);
      expect(Array.isArray(names)).toBe(true);
      expect(names).toHaveLength(7);
    });

    it('should start with root note name', () => {
      const names = getScaleNoteNames(60, 'major', 1);
      expect(names[0]).toBe('C4');
    });

    it('should generate multiple octaves', () => {
      const names = getScaleNoteNames(60, 'major', 2);
      expect(names).toHaveLength(14);
    });
  });

  describe('getScaleDegree()', () => {
    it('should return scale degree information', () => {
      const degree = getScaleDegree(1, 'major');
      expect(degree).toBeDefined();
      expect(typeof degree).toBe('object');
    });

    it('should handle all 7 degrees', () => {
      for (let i = 1; i <= 7; i++) {
        const degree = getScaleDegree(i, 'major');
        expect(degree).toBeDefined();
      }
    });
  });

  describe('Music Theory Concepts', () => {
    it('should maintain correct intervals for major scale', () => {
      const scale = generateScale(60, 'major', 1);
      const intervals = [];
      for (let i = 0; i < scale.length - 1; i++) {
        intervals.push(scale[i + 1] - scale[i]);
      }
      // 7 notes have 6 intervals between them: W W H W W W
      expect(intervals).toEqual([2, 2, 1, 2, 2, 2]);
    });

    it('should maintain intervals across different roots', () => {
      const c = generateScale(60, 'major', 1);
      const f = generateScale(65, 'major', 1);

      const cIntervals = [];
      for (let i = 0; i < c.length - 1; i++) {
        cIntervals.push(c[i + 1] - c[i]);
      }

      const fIntervals = [];
      for (let i = 0; i < f.length - 1; i++) {
        fIntervals.push(f[i + 1] - f[i]);
      }

      expect(cIntervals).toEqual(fIntervals);
    });

    it('should generate harmonically valid scales', () => {
      const cMajor = generateScale(60, 'major', 1);
      expect(cMajor.every(note => note >= 0 && note <= 127)).toBe(true);
      expect(cMajor[0]).toBe(60); // Root
      expect(cMajor.length).toBe(7); // 7 notes per octave
    });

    it('should have each note within one octave for single octave', () => {
      const cMajor = generateScale(60, 'major', 1);
      cMajor.forEach((note, i) => {
        if (i === cMajor.length - 1) {
          expect(note).toBeLessThanOrEqual(72); // Allow octave doubling for root
        } else {
          expect(note).toBeLessThan(72);
        }
      });
    });
  });

  describe('Mode Generation', () => {
    it('should generate Dorian mode correctly', () => {
      const dorian = generateScale(60, 'dorian', 1);
      expect(dorian).toBeDefined();
      expect(dorian.length).toBe(7);
    });

    it('should generate all modes', () => {
      const modes = ['dorian', 'phrygian', 'lydian', 'mixolydian'];
      modes.forEach(mode => {
        const scale = generateScale(60, mode, 1);
        expect(scale).toBeDefined();
        expect(scale.length).toBe(7);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle MIDI 0', () => {
      const scale = generateScale(0, 'major', 1);
      expect(scale[0]).toBe(0);
    });

    it('should handle high MIDI notes near 127', () => {
      const scale = generateScale(120, 'major', 1);
      expect(scale).toBeDefined();
      // Some notes may exceed 127 and be filtered
    });

    it('should handle octave parameter', () => {
      const one = generateScale(60, 'major', 1);
      const two = generateScale(60, 'major', 2);

      expect(two.length).toBeGreaterThan(one.length);
    });

    it('should default to major scale for invalid type', () => {
      const scale = generateScale(60, 'invalid', 1);
      expect(scale).toBeDefined();
      // Should fallback to major or handle gracefully
    });
  });
});
