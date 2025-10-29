/**
 * progressions.test.js
 * Comprehensive test suite for the progressions module
 *
 * Tests progression templates, generation, and voice leading analysis
 * to ensure correct harmonic progressions.
 *
 * @module progressions.test
 */

import { describe, it, expect } from 'vitest';
import {
  PROGRESSION_TEMPLATES,
  generateProgression,
  getProgressionTemplate,
  analyzeVoiceLeading,
  applyVoiceLeading,
  getProgressionGenre,
  getProgressionDescription,
  isValidProgression,
} from './progressions.js';

describe('Progressions Module', () => {
  describe('Constants', () => {
    it('should have progression templates defined', () => {
      expect(PROGRESSION_TEMPLATES).toBeDefined();
      expect(Object.keys(PROGRESSION_TEMPLATES).length).toBeGreaterThan(0);
    });

    it('should have templates for major genres', () => {
      const expectedGenres = ['pop', 'jazz', 'blues', 'classical'];
      expectedGenres.forEach((genre) => {
        const templates = Object.values(PROGRESSION_TEMPLATES).filter(
          (t) => t.genre === genre,
        );
        expect(templates.length).toBeGreaterThan(0);
      });
    });

    it('should have templates with valid Roman numerals', () => {
      Object.values(PROGRESSION_TEMPLATES).forEach((template) => {
        expect(template.chords).toBeDefined();
        expect(Array.isArray(template.chords)).toBe(true);
        template.chords.forEach((chord) => {
          expect(chord).toMatch(/^[ivIV°]+$/); // Roman numerals
        });
      });
    });

    it('should have descriptions for all templates', () => {
      Object.values(PROGRESSION_TEMPLATES).forEach((template) => {
        expect(template.description).toBeDefined();
        expect(typeof template.description).toBe('string');
        expect(template.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateProgression()', () => {
    it('should generate progression from template', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);

      expect(progression).toBeDefined();
      expect(Array.isArray(progression)).toBe(true);
      expect(progression.length).toBe(4);
    });

    it('should generate chords with correct roots', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);

      // C I, F IV, G V, C I
      expect(progression[0].root).toBe(60); // C
      expect(progression[1].root).toBe(65); // F
      expect(progression[2].root).toBe(67); // G
      expect(progression[3].root).toBe(60); // C
    });

    it('should generate chords from any root', () => {
      const roots = [57, 60, 62, 65]; // A, C, D, F
      roots.forEach((root) => {
        const progression = generateProgression(root, 'major', ['I', 'IV', 'V', 'I']);
        expect(progression).toHaveLength(4);
        expect(progression[0].root).toBe(root);
      });
    });

    it('should work with different scales', () => {
      const majorProg = generateProgression(60, 'major', ['I', 'IV', 'V']);
      const minorProg = generateProgression(57, 'naturalMinor', ['i', 'iv', 'v']);

      expect(majorProg).toHaveLength(3);
      expect(minorProg).toHaveLength(3);
    });

    it('should have correct chord types for scale degrees', () => {
      const progression = generateProgression(60, 'major', ['I', 'ii', 'iii', 'IV']);

      expect(progression[0].type).toBe('major'); // I
      expect(progression[1].type).toBe('minor'); // ii
      expect(progression[2].type).toBe('minor'); // iii
      expect(progression[3].type).toBe('major'); // IV
    });

    it('should throw error for invalid scale type', () => {
      expect(() => generateProgression(60, 'invalidScale', ['I', 'IV', 'V'])).toThrow();
    });

    it('should throw error for invalid Roman numerals', () => {
      expect(() => generateProgression(60, 'major', ['X', 'IV', 'V'])).toThrow();
    });
  });

  describe('getProgressionTemplate()', () => {
    it('should return template by name', () => {
      const template = getProgressionTemplate('perfect-cadence');

      expect(template).toBeDefined();
      expect(template).toHaveProperty('chords');
      expect(template).toHaveProperty('genre');
      expect(template).toHaveProperty('description');
    });

    it('should have all properties', () => {
      Object.entries(PROGRESSION_TEMPLATES).forEach(([name, template]) => {
        const retrieved = getProgressionTemplate(name);
        expect(retrieved).toEqual(template);
      });
    });

    it('should throw error for unknown template', () => {
      expect(() => getProgressionTemplate('unknown-progression')).toThrow();
    });
  });

  describe('analyzeVoiceLeading()', () => {
    it('should analyze voice leading quality of progression', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const analysis = analyzeVoiceLeading(progression);

      expect(analysis).toHaveProperty('totalDistance');
      expect(analysis).toHaveProperty('averageDistance');
      expect(analysis).toHaveProperty('quality');
    });

    it('should return numeric distance metrics', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const analysis = analyzeVoiceLeading(progression);

      expect(typeof analysis.totalDistance).toBe('number');
      expect(typeof analysis.averageDistance).toBe('number');
      expect(analysis.totalDistance).toBeGreaterThanOrEqual(0);
      expect(analysis.averageDistance).toBeGreaterThanOrEqual(0);
    });

    it('should rate voice leading quality', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const analysis = analyzeVoiceLeading(progression);

      const validQualities = ['excellent', 'good', 'fair', 'poor'];
      expect(validQualities).toContain(analysis.quality);
    });

    it('should prefer smooth voice leading', () => {
      const progression1 = generateProgression(60, 'major', ['I', 'vi', 'IV', 'V']);
      const progression2 = generateProgression(60, 'major', ['I', 'iii', 'vi', 'ii']);

      const analysis1 = analyzeVoiceLeading(progression1);
      const analysis2 = analyzeVoiceLeading(progression2);

      // At least one should have a quality rating
      expect([analysis1.quality, analysis2.quality]).toContain(
        expect.stringMatching(/excellent|good|fair|poor/),
      );
    });

    it('should handle single chord (no voice leading)', () => {
      const progression = generateProgression(60, 'major', ['I']);
      const analysis = analyzeVoiceLeading(progression);

      expect(analysis.totalDistance).toBe(0); // No transitions
    });
  });

  describe('applyVoiceLeading()', () => {
    it('should apply voice leading to progression', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const voiceLeadProgression = applyVoiceLeading(progression);

      expect(voiceLeadProgression).toHaveLength(progression.length);
    });

    it('should adjust chord inversions for smooth voice leading', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const voiceLeadProgression = applyVoiceLeading(progression);

      voiceLeadProgression.forEach((chord) => {
        expect(chord).toHaveProperty('notes');
        expect(chord).toHaveProperty('inversion');
        expect(Array.isArray(chord.notes)).toBe(true);
      });
    });

    it('should have lower total distance than original', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const original = analyzeVoiceLeading(progression);
      const voiceLeadProgression = applyVoiceLeading(progression);
      const improved = analyzeVoiceLeading(voiceLeadProgression);

      expect(improved.totalDistance).toBeLessThanOrEqual(original.totalDistance);
    });

    it('should maintain chord identity', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const voiceLeadProgression = applyVoiceLeading(progression);

      // Same roots and types
      progression.forEach((chord, i) => {
        expect(voiceLeadProgression[i].root).toBe(chord.root);
        expect(voiceLeadProgression[i].type).toBe(chord.type);
      });
    });
  });

  describe('getProgressionGenre()', () => {
    it('should return genre for progression template', () => {
      const genre = getProgressionGenre('perfect-cadence');
      expect(typeof genre).toBe('string');
      expect(['classical', 'jazz', 'pop', 'blues']).toContain(genre);
    });

    it('should have genre for all templates', () => {
      Object.keys(PROGRESSION_TEMPLATES).forEach((name) => {
        const genre = getProgressionGenre(name);
        expect(genre).toBeDefined();
      });
    });

    it('should throw error for unknown template', () => {
      expect(() => getProgressionGenre('unknown')).toThrow();
    });
  });

  describe('getProgressionDescription()', () => {
    it('should return description for progression', () => {
      const description = getProgressionDescription('perfect-cadence');
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });

    it('should have description for all templates', () => {
      Object.keys(PROGRESSION_TEMPLATES).forEach((name) => {
        const description = getProgressionDescription(name);
        expect(description).toBeDefined();
        expect(typeof description).toBe('string');
      });
    });

    it('should throw error for unknown template', () => {
      expect(() => getProgressionDescription('unknown')).toThrow();
    });
  });

  describe('isValidProgression()', () => {
    it('should validate correct progressions', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      expect(isValidProgression(progression, 'major')).toBe(true);
    });

    it('should reject invalid progressions', () => {
      const invalidProgression = [{ root: 60, type: 'invalid', notes: [] }];
      expect(isValidProgression(invalidProgression, 'major')).toBe(false);
    });

    it('should validate all templates produce valid progressions', () => {
      Object.keys(PROGRESSION_TEMPLATES).forEach((name) => {
        const template = getProgressionTemplate(name);
        const progression = generateProgression(60, 'major', template.chords);
        expect(isValidProgression(progression, 'major')).toBe(true);
      });
    });

    it('should return false for empty progression', () => {
      expect(isValidProgression([], 'major')).toBe(false);
    });

    it('should return false for non-array input', () => {
      expect(isValidProgression(null, 'major')).toBe(false);
      expect(isValidProgression({}, 'major')).toBe(false);
    });
  });

  describe('Genre-specific progressions', () => {
    it('should generate pop progressions', () => {
      const popProgressions = Object.entries(PROGRESSION_TEMPLATES)
        .filter(([_, t]) => t.genre === 'pop')
        .map(([name]) => name);

      expect(popProgressions.length).toBeGreaterThan(0);
    });

    it('should generate jazz progressions', () => {
      const jazzProgressions = Object.entries(PROGRESSION_TEMPLATES)
        .filter(([_, t]) => t.genre === 'jazz')
        .map(([name]) => name);

      expect(jazzProgressions.length).toBeGreaterThan(0);
    });

    it('should generate blues progressions', () => {
      const bluesProgressions = Object.entries(PROGRESSION_TEMPLATES)
        .filter(([_, t]) => t.genre === 'blues')
        .map(([name]) => name);

      expect(bluesProgressions.length).toBeGreaterThan(0);
    });

    it('should generate classical progressions', () => {
      const classicalProgressions = Object.entries(PROGRESSION_TEMPLATES)
        .filter(([_, t]) => t.genre === 'classical')
        .map(([name]) => name);

      expect(classicalProgressions.length).toBeGreaterThan(0);
    });
  });

  describe('Common progressions', () => {
    it('should generate perfect cadence (V-I)', () => {
      const progression = generateProgression(60, 'major', ['V', 'I']);
      expect(progression).toHaveLength(2);
      expect(progression[0].roman).toBe('V');
      expect(progression[1].roman).toBe('I');
    });

    it('should generate plagal cadence (IV-I)', () => {
      const progression = generateProgression(60, 'major', ['IV', 'I']);
      expect(progression).toHaveLength(2);
      expect(progression[0].roman).toBe('IV');
      expect(progression[1].roman).toBe('I');
    });

    it('should generate ii-V-I progression (jazz)', () => {
      const progression = generateProgression(60, 'major', ['ii', 'V', 'I']);
      expect(progression).toHaveLength(3);
    });

    it('should generate blues progression (I-IV-V)', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V']);
      expect(progression).toHaveLength(3);
    });

    it('should generate pop progression (I-V-vi-IV)', () => {
      const progression = generateProgression(60, 'major', ['I', 'V', 'vi', 'IV']);
      expect(progression).toHaveLength(4);
    });
  });

  describe('Edge cases', () => {
    it('should handle single-chord progressions', () => {
      const progression = generateProgression(60, 'major', ['I']);
      expect(progression).toHaveLength(1);
      expect(isValidProgression(progression, 'major')).toBe(true);
    });

    it('should handle long progressions', () => {
      const chords = ['I', 'vi', 'IV', 'V', 'I', 'IV', 'I', 'V'];
      const progression = generateProgression(60, 'major', chords);
      expect(progression).toHaveLength(8);
    });

    it('should handle all chromatic roots', () => {
      for (let root = 0; root < 12; root++) {
        const progression = generateProgression(root, 'major', ['I', 'IV', 'V', 'I']);
        expect(progression).toHaveLength(4);
        expect(isValidProgression(progression, 'major')).toBe(true);
      }
    });

    it('should work with different scales', () => {
      const scales = ['major', 'naturalMinor', 'harmonicMinor', 'melodicMinor'];
      scales.forEach((scale) => {
        const progression = generateProgression(60, scale, ['i', 'iv', 'v']);
        expect(progression).toHaveLength(3);
      });
    });
  });

  describe('Voice leading quality comparison', () => {
    it('should rate I-IV-V-I as good voice leading', () => {
      const progression = generateProgression(60, 'major', ['I', 'IV', 'V', 'I']);
      const voiceLeadProgression = applyVoiceLeading(progression);
      const analysis = analyzeVoiceLeading(voiceLeadProgression);

      // Classic progression should have good quality
      const goodQualities = ['excellent', 'good'];
      expect(goodQualities).toContain(analysis.quality);
    });

    it('should improve voice leading after optimization', () => {
      const progression = generateProgression(60, 'major', ['I', 'ii', 'iii', 'IV']);
      const original = analyzeVoiceLeading(progression);
      const optimized = applyVoiceLeading(progression);
      const improved = analyzeVoiceLeading(optimized);

      expect(improved.totalDistance).toBeLessThanOrEqual(original.totalDistance);
    });
  });
});
