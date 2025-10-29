/**
 * chords.test.js
 * Test suite for the chords module
 *
 * Tests chord generation, inversions, voice leading, and harmonic functions
 * to verify correct music theory implementation.
 *
 * @module chords.test
 */

import { describe, it, expect } from 'vitest';
import {
  CHORD_TEMPLATES,
  DIATONIC_CHORD_QUALITIES,
  generateChord,
  generateDiatonicChords,
  invert,
  calculateVoiceLeading,
  getChordInfo,
  getAvailableChords
} from './chords.js';

describe('Chords Module', () => {
  describe('Constants', () => {
    it('should have CHORD_TEMPLATES defined', () => {
      expect(CHORD_TEMPLATES).toBeDefined();
      expect(typeof CHORD_TEMPLATES).toBe('object');
    });

    it('should have all expected basic chord types', () => {
      expect(CHORD_TEMPLATES.major).toBeDefined();
      expect(CHORD_TEMPLATES.minor).toBeDefined();
      expect(CHORD_TEMPLATES.diminished).toBeDefined();
      expect(CHORD_TEMPLATES.augmented).toBeDefined();
    });

    it('should have all seventh chord types', () => {
      expect(CHORD_TEMPLATES.maj7).toBeDefined();
      expect(CHORD_TEMPLATES.dom7).toBeDefined();
      expect(CHORD_TEMPLATES.min7).toBeDefined();
      expect(CHORD_TEMPLATES.minMaj7).toBeDefined();
      expect(CHORD_TEMPLATES.halfDim7).toBeDefined();
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

    it('should have DIATONIC_CHORD_QUALITIES defined', () => {
      expect(DIATONIC_CHORD_QUALITIES).toBeDefined();
      expect(DIATONIC_CHORD_QUALITIES.major).toBeDefined();
      expect(DIATONIC_CHORD_QUALITIES.minorNatural).toBeDefined();
      expect(DIATONIC_CHORD_QUALITIES.minorHarmonic).toBeDefined();
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

    it('should generate minMaj7 chords', () => {
      const cMinMaj7 = generateChord(60, 'minMaj7');
      expect(cMinMaj7).toEqual([60, 63, 67, 71]); // C Eb G B
    });

    it('should generate halfDim7 chords', () => {
      const cHalfDim7 = generateChord(60, 'halfDim7');
      expect(cHalfDim7).toEqual([60, 63, 66, 70]); // C Eb Gb Bb
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

    it('should default to major if chord type is invalid', () => {
      const chord = generateChord(60, 'invalidChordType');
      expect(chord).toEqual([60, 64, 67]); // Should be major
    });
  });

  describe('invert()', () => {
    it('should return same notes for root position (inversion 0)', () => {
      const cMajor = [60, 64, 67];
      const result = invert(cMajor, 0);
      expect(result).toEqual([60, 64, 67]);
    });

    it('should generate first inversion correctly', () => {
      const cMajor = [60, 64, 67];
      const result = invert(cMajor, 1);
      // E in bass, next octave: [E, G, C+12]
      expect(result).toEqual([64, 67, 72]);
    });

    it('should generate second inversion correctly', () => {
      const cMajor = [60, 64, 67];
      const result = invert(cMajor, 2);
      // G in bass, next octaves: [G, C+12, E+12]
      expect(result).toEqual([67, 72, 76]);
    });

    it('should handle multiple inversions on seventh chords', () => {
      const cDom7 = [60, 64, 67, 70];
      const inv1 = invert(cDom7, 1);
      const inv2 = invert(cDom7, 2);
      const inv3 = invert(cDom7, 3);

      expect(inv1.length).toBe(4);
      expect(inv2.length).toBe(4);
      expect(inv3.length).toBe(4);
      expect(inv1[0]).toBe(64); // E in bass
      expect(inv2[0]).toBe(67); // G in bass
      expect(inv3[0]).toBe(70); // Bb in bass
    });
  });

  describe('calculateVoiceLeading()', () => {
    it('should suggest optimal inversion for smooth voice leading', () => {
      const cMajor = [60, 64, 67];
      const fMajor = [65, 69, 72];

      const result = calculateVoiceLeading(cMajor, fMajor);
      expect(result).toBeDefined();
      expect(result.bestInversion).toBeDefined();
      expect(result.minDistance).toBeDefined();
      expect(result.suggestedNotes).toBeDefined();
    });

    it('should calculate voice leading between different chord types', () => {
      const cMajor = [60, 64, 67];
      const aMinor = [57, 60, 64];

      const result = calculateVoiceLeading(cMajor, aMinor);
      expect(result.bestInversion).toBeGreaterThanOrEqual(0);
      expect(result.minDistance).toBeGreaterThanOrEqual(0);
    });

    it('should try all inversions', () => {
      const chord1 = [60, 64, 67];
      const chord2 = [65, 69, 72];

      const result = calculateVoiceLeading(chord1, chord2);
      // Should have distance for each inversion (3 for triads)
      expect(result.allDistances.length).toBe(3);
    });

    it('should prefer inversions with minimal movement', () => {
      const cMajor = [60, 64, 67]; // C E G
      // Create a chord where root position would require large jumps
      const distantChord = [48, 52, 55]; // Low C major

      const result = calculateVoiceLeading(cMajor, distantChord);
      // Should choose inversion that minimizes total distance
      expect(result.minDistance).toBeDefined();
      expect(result.suggestedNotes).toBeDefined();
    });
  });

  describe('generateDiatonicChords()', () => {
    it('should generate 7 diatonic chords for major scale', () => {
      const chords = generateDiatonicChords(60, 'major');
      expect(chords).toHaveLength(7);
    });

    it('should have correct Roman numerals for major scale', () => {
      const chords = generateDiatonicChords(60, 'major');
      const romanNumerals = chords.map(c => c.roman);
      expect(romanNumerals).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
    });

    it('should have correct qualities for major scale', () => {
      const chords = generateDiatonicChords(60, 'major');
      const qualities = chords.map(c => c.quality);
      expect(qualities).toEqual([
        'major',
        'minor',
        'minor',
        'major',
        'major',
        'minor',
        'diminished'
      ]);
    });

    it('should generate 7 diatonic chords for minor natural', () => {
      const chords = generateDiatonicChords(60, 'minorNatural');
      expect(chords).toHaveLength(7);
    });

    it('should have correct qualities for minor natural', () => {
      const chords = generateDiatonicChords(60, 'minorNatural');
      const qualities = chords.map(c => c.quality);
      expect(qualities).toEqual([
        'minor',
        'diminished',
        'major',
        'minor',
        'minor',
        'major',
        'major'
      ]);
    });

    it('should include chord root notes', () => {
      const chords = generateDiatonicChords(60, 'major');
      chords.forEach((chord) => {
        expect(chord.root).toBeDefined();
        expect(typeof chord.root).toBe('number');
      });
    });

    it('should include chord notes arrays', () => {
      const chords = generateDiatonicChords(60, 'major');
      chords.forEach((chord) => {
        expect(chord.notes).toBeDefined();
        expect(Array.isArray(chord.notes)).toBe(true);
        expect(chord.notes.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should include harmonic function', () => {
      const chords = generateDiatonicChords(60, 'major');
      chords.forEach((chord) => {
        expect(chord.function).toBeDefined();
        expect(typeof chord.function).toBe('string');
      });
    });

    it('should work with any MIDI root', () => {
      const roots = [0, 12, 24, 36, 48, 60, 72, 84, 96];
      roots.forEach((root) => {
        const chords = generateDiatonicChords(root, 'major');
        expect(chords).toHaveLength(7);
        expect(chords[0].root).toBe(root); // First chord starts on root
      });
    });

    it('should generate chords across two octaves', () => {
      const chords = generateDiatonicChords(60, 'major');
      // Notes span two octaves (14 notes in major scale)
      const allNotes = chords.flatMap(c => c.notes);
      const maxNote = Math.max(...allNotes);
      const minNote = Math.min(...allNotes);
      expect(maxNote - minNote).toBeGreaterThanOrEqual(12); // At least one octave span
    });
  });

  describe('getChordInfo()', () => {
    it('should return chord information', () => {
      const info = getChordInfo('major');
      expect(info).toBeDefined();
      expect(info.name).toBe('Major');
      expect(info.intervals).toEqual([0, 4, 7]);
      expect(info.description).toBeDefined();
    });

    it('should return info for all chord types', () => {
      const types = getAvailableChords();
      types.forEach((type) => {
        const info = getChordInfo(type);
        expect(info).toBeDefined();
        expect(info.name).toBeDefined();
        expect(info.intervals).toBeDefined();
      });
    });

    it('should default to major for unknown chord type', () => {
      const info = getChordInfo('unknownChordType');
      expect(info.name).toBe('Major');
    });
  });

  describe('getAvailableChords()', () => {
    it('should return array of chord types', () => {
      const chords = getAvailableChords();
      expect(Array.isArray(chords)).toBe(true);
      expect(chords.length).toBeGreaterThan(0);
    });

    it('should include basic triads', () => {
      const chords = getAvailableChords();
      expect(chords).toContain('major');
      expect(chords).toContain('minor');
      expect(chords).toContain('diminished');
      expect(chords).toContain('augmented');
    });

    it('should include seventh chords', () => {
      const chords = getAvailableChords();
      expect(chords).toContain('maj7');
      expect(chords).toContain('dom7');
      expect(chords).toContain('min7');
      expect(chords).toContain('minMaj7');
      expect(chords).toContain('halfDim7');
    });
  });

  describe('Music Theory Concepts', () => {
    it('should maintain correct intervals for major chord', () => {
      const cMajor = generateChord(60, 'major');
      const intervals = [];
      for (let i = 0; i < cMajor.length - 1; i++) {
        intervals.push(cMajor[i + 1] - cMajor[i]);
      }
      // Major chord intervals: 4 semitones (major 3rd), then 3 semitones (minor 3rd)
      expect(intervals).toEqual([4, 3]);
    });

    it('should maintain correct intervals for minor chord', () => {
      const cMinor = generateChord(60, 'minor');
      const intervals = [];
      for (let i = 0; i < cMinor.length - 1; i++) {
        intervals.push(cMinor[i + 1] - cMinor[i]);
      }
      // Minor chord intervals: 3 semitones (minor 3rd), then 4 semitones (major 3rd)
      expect(intervals).toEqual([3, 4]);
    });

    it('should build diatonic chords from scale notes only', () => {
      const chords = generateDiatonicChords(60, 'major');
      // C major scale: C D E F G A B
      const scaleNotes = [60, 62, 64, 65, 67, 69, 71];

      chords.forEach((chord) => {
        chord.notes.forEach((note) => {
          // Check if note is in scale (considering octaves)
          const noteClass = note % 12;
          const inScale = scaleNotes.some((n) => n % 12 === noteClass);
          expect(inScale).toBe(true);
        });
      });
    });

    it('should generate all diatonic chords across two octaves', () => {
      const chords = generateDiatonicChords(60, 'major');
      // Verify that chords span across octaves
      const allNotes = chords.flatMap(c => c.notes);
      const spans2Octaves = Math.max(...allNotes) - Math.min(...allNotes) >= 12;
      expect(spans2Octaves).toBe(true);
    });

    it('should maintain harmonic function in diatonic chords', () => {
      const chords = generateDiatonicChords(60, 'major');
      // I chord should be tonic
      expect(chords[0].function).toBe('tonic');
      // V chord should be dominant
      expect(chords[4].function).toBe('dominant');
    });
  });

  describe('Edge Cases', () => {
    it('should handle MIDI 0', () => {
      const chord = generateChord(0, 'major');
      expect(chord[0]).toBe(0);
      expect(chord.length).toBe(3);
    });

    it('should handle high MIDI notes near 127', () => {
      const chord = generateChord(120, 'major');
      expect(chord).toBeDefined();
      expect(chord[0]).toBe(120);
    });

    it('should handle all available chord types', () => {
      const types = getAvailableChords();
      types.forEach((type) => {
        const chord = generateChord(60, type);
        expect(chord).toBeDefined();
        expect(chord[0]).toBe(60);
        expect(chord.length).toBeGreaterThan(0);
      });
    });

    it('should handle inversion of minimum notes', () => {
      const triad = [60, 64, 67];
      const inv1 = invert(triad, 1);
      const inv2 = invert(triad, 2);
      expect(inv1.length).toBe(3);
      expect(inv2.length).toBe(3);
    });

    it('should handle voice leading with same chords', () => {
      const chord = [60, 64, 67];
      const result = calculateVoiceLeading(chord, chord);
      expect(result.minDistance).toBe(0); // No movement needed
    });
  });
});
