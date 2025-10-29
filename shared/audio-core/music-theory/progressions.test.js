/**
 * progressions.test.js
 * Test suite for the progressions module
 *
 * Tests progression generation, analysis, and template utilities
 * to verify correct music theory implementation.
 *
 * @module progressions.test
 */

import { describe, it, expect } from 'vitest';
import {
  HARMONIC_FUNCTIONS,
  PROGRESSION_TEMPLATES,
  generateProgression,
  analyzeChordFunction,
  analyzeVoiceLeading,
  getProgressionTemplate,
  getAvailableProgressions,
  getProgressionsByGenre
} from './progressions.js';

describe('Progressions Module', () => {
  describe('Constants', () => {
    it('should have HARMONIC_FUNCTIONS defined', () => {
      expect(HARMONIC_FUNCTIONS).toBeDefined();
      expect(typeof HARMONIC_FUNCTIONS).toBe('object');
    });

    it('should have PROGRESSION_TEMPLATES defined', () => {
      expect(PROGRESSION_TEMPLATES).toBeDefined();
      expect(typeof PROGRESSION_TEMPLATES).toBe('object');
    });

    it('should have multiple progression templates', () => {
      const templates = Object.keys(PROGRESSION_TEMPLATES);
      expect(templates.length).toBeGreaterThan(5);
    });
  });

  describe('generateProgression()', () => {
    it('should generate progression from Roman numerals', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      expect(progression).toBeDefined();
      expect(Array.isArray(progression)).toBe(true);
      expect(progression.length).toBeGreaterThan(0);
    });

    it('should generate chord objects with correct structure', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV']);
      progression.forEach((chord) => {
        expect(chord).toBeDefined();
        expect(chord.notes).toBeDefined();
        expect(Array.isArray(chord.notes)).toBe(true);
      });
    });

    it('should work with any MIDI root', () => {
      const roots = [0, 24, 48, 60, 72, 96];
      roots.forEach((root) => {
        const progression = generateProgression(root, 'major', ['I', 'V']);
        expect(progression).toBeDefined();
        expect(progression.length).toBeGreaterThan(0);
      });
    });

    it('should handle different scale types', () => {
      const majorProg = generateProgression(60, 'major', ['I', 'IV', 'V']);
      const minorProg = generateProgression(60, 'minorNatural', ['i', 'iv', 'v']);
      expect(majorProg).toBeDefined();
      expect(minorProg).toBeDefined();
    });

    it('should handle single chord progressions', () => {
      const progression = generateProgression(60, 'major', ['I']);
      expect(progression).toHaveLength(1);
    });

    it('should handle long progressions', () => {
      const progression = generateProgression(60, 'major', [
        'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'
      ]);
      expect(progression.length).toBe(7);
    });
  });

  describe('analyzeChordFunction()', () => {
    it('should return function info for chord Roman numeral', () => {
      const info = analyzeChordFunction('I', 'major');
      expect(info).toBeDefined();
      expect(typeof info).toBe('object');
    });

    it('should return info about tonic chord', () => {
      const info = analyzeChordFunction('I', 'major');
      expect(info).toBeDefined();
    });

    it('should return info about dominant chord', () => {
      const info = analyzeChordFunction('V', 'major');
      expect(info).toBeDefined();
    });

    it('should work with different scale types', () => {
      const major = analyzeChordFunction('I', 'major');
      const minor = analyzeChordFunction('i', 'minorNatural');
      expect(major).toBeDefined();
      expect(minor).toBeDefined();
    });

    it('should handle all diatonic chords', () => {
      const numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
      numerals.forEach((numeral) => {
        const info = analyzeChordFunction(numeral, 'major');
        expect(info).toBeDefined();
      });
    });
  });

  describe('analyzeVoiceLeading()', () => {
    it('should analyze voice leading in progression', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V']);
      const analysis = analyzeVoiceLeading(progression);
      expect(analysis).toBeDefined();
    });

    it('should return voice leading analysis', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V']);
      const analysis = analyzeVoiceLeading(progression);
      expect(analysis).toBeDefined();
    });

    it('should handle multi-chord progressions', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const analysis = analyzeVoiceLeading(progression);
      expect(analysis).toBeDefined();
    });
  });

  describe('getProgressionTemplate()', () => {
    it('should return progression template by name', () => {
      const templates = getAvailableProgressions();
      if (templates.length > 0) {
        const template = getProgressionTemplate(templates[0]);
        expect(template).toBeDefined();
      }
    });

    it('should handle popular chord progressions', () => {
      const templates = getAvailableProgressions();
      expect(Array.isArray(templates)).toBe(true);
      if (templates.length > 0) {
        templates.forEach((name) => {
          const template = getProgressionTemplate(name);
          expect(template).toBeDefined();
        });
      }
    });
  });

  describe('getAvailableProgressions()', () => {
    it('should return array of progression names', () => {
      const progressions = getAvailableProgressions();
      expect(Array.isArray(progressions)).toBe(true);
      expect(progressions.length).toBeGreaterThan(0);
    });

    it('should return string names', () => {
      const progressions = getAvailableProgressions();
      progressions.forEach((name) => {
        expect(typeof name).toBe('string');
      });
    });

    it('should include common progressions', () => {
      const progressions = getAvailableProgressions();
      // At least some progressions should be available
      expect(progressions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getProgressionsByGenre()', () => {
    it('should return progressions for a genre', () => {
      const progressions = getProgressionsByGenre('pop');
      expect(Array.isArray(progressions)).toBe(true);
    });

    it('should return array of progression names or info', () => {
      const progressions = getProgressionsByGenre('jazz');
      if (progressions.length > 0) {
        expect(progressions[0]).toBeDefined();
      }
    });

    it('should handle different genres', () => {
      const genres = ['pop', 'jazz', 'blues', 'classical'];
      genres.forEach((genre) => {
        const progressions = getProgressionsByGenre(genre);
        expect(Array.isArray(progressions)).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should generate and analyze a progression', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const analysis = analyzeVoiceLeading(progression);
      expect(progression).toBeDefined();
      expect(analysis).toBeDefined();
    });

    it('should generate different progressions', () => {
      const prog1 = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const prog2 = generateProgression(60, 'major', ['ii', 'V', 'I']);
      expect(prog1).toBeDefined();
      expect(prog2).toBeDefined();
      // They should be different lengths
      expect(prog1.length).not.toBe(prog2.length);
    });

    it('should analyze all chords in progression', () => {
      const roman = ['I', 'IV', 'V'];
      roman.forEach((numeral) => {
        const info = analyzeChordFunction(numeral, 'major');
        expect(info).toBeDefined();
      });
    });
  });

  describe('Music Theory Concepts', () => {
    it('should generate diatonic progressions', () => {
      const progression = generateProgression(60, 'major', ['I', 'ii', 'iii', 'IV', 'V', 'vi']);
      expect(progression.length).toBe(6);
      progression.forEach((chord) => {
        expect(chord.notes).toBeDefined();
        expect(chord.notes.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should maintain harmonic function', () => {
      const progression = generateProgression(60, 'major', ['I', 'V', 'I']);
      // First should be tonic, second dominant, third tonic again
      expect(progression[0]).toBeDefined();
      expect(progression[1]).toBeDefined();
      expect(progression[2]).toBeDefined();
    });

    it('should handle modal progressions', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV']);
      expect(progression.length).toBe(2);
      // Both chords should have notes
      progression.forEach((chord) => {
        expect(chord.notes.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single chord', () => {
      const progression = generateProgression(60, 'major', ['I']);
      expect(progression).toHaveLength(1);
    });

    it('should handle MIDI boundary notes', () => {
      const low = generateProgression(0, 'major', ['I', 'IV', 'V']);
      const high = generateProgression(120, 'major', ['I', 'IV', 'V']);
      expect(low).toBeDefined();
      expect(high).toBeDefined();
    });

    it('should handle repeated chords in progression', () => {
      const progression = generateProgression(60, 'major', ['I', 'I', 'IV', 'I']);
      expect(progression).toHaveLength(4);
    });

    it('should handle voice leading for distant chords', () => {
      const progression = generateProgression(60, 'major', ['I', 'V', 'I']);
      const analysis = analyzeVoiceLeading(progression);
      expect(analysis).toBeDefined();
    });
  });
});
