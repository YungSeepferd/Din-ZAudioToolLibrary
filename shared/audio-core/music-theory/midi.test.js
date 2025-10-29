/**
 * midi.test.js
 * Test suite for the MIDI module
 *
 * Tests MIDI/note conversions, frequency calculations, and utility functions
 * to verify correct MIDI implementation.
 *
 * @module midi.test
 */

import { describe, it, expect } from 'vitest';
import {
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

describe('MIDI Module', () => {
  describe('Constants', () => {
    it('should have MIDI_REFERENCE_NOTES defined', () => {
      expect(MIDI_REFERENCE_NOTES).toBeDefined();
      expect(typeof MIDI_REFERENCE_NOTES).toBe('object');
    });
  });

  describe('midiToNoteName()', () => {
    it('should convert MIDI 60 to C4', () => {
      const name = midiToNoteName(60);
      expect(name).toBe('C4');
    });

    it('should convert MIDI 69 to A4', () => {
      const name = midiToNoteName(69);
      expect(name).toBe('A4');
    });

    it('should convert MIDI 0 to C-1', () => {
      const name = midiToNoteName(0);
      expect(name).toBe('C-1');
    });

    it('should use sharps by default', () => {
      const name = midiToNoteName(61);
      expect(name).toContain('#');
    });

    it('should use flats when specified', () => {
      const name = midiToNoteName(61, false);
      expect(name).toContain('b');
    });
  });

  describe('noteNameToMidi()', () => {
    it('should convert C4 to MIDI 60', () => {
      const midi = noteNameToMidi('C4');
      expect(midi).toBe(60);
    });

    it('should convert A4 to MIDI 69', () => {
      const midi = noteNameToMidi('A4');
      expect(midi).toBe(69);
    });

    it('should handle sharps', () => {
      const midi = noteNameToMidi('C#4');
      expect(midi).toBe(61);
    });

    it('should handle flats', () => {
      const midi = noteNameToMidi('Db4');
      expect(midi).toBe(61);
    });

    it('should return null for invalid note names', () => {
      const midi = noteNameToMidi('Invalid');
      expect(midi).toBeNull();
    });
  });

  describe('midiToFrequency()', () => {
    it('should convert A4 (MIDI 69) to 440 Hz', () => {
      const freq = midiToFrequency(69);
      expect(freq).toBeCloseTo(440, 1);
    });

    it('should convert C4 (MIDI 60) to ~261.63 Hz', () => {
      const freq = midiToFrequency(60);
      expect(freq).toBeCloseTo(261.63, 1);
    });

    it('should convert octaves correctly', () => {
      const octave1 = midiToFrequency(60);
      const octave2 = midiToFrequency(72); // One octave higher
      expect(octave2).toBeCloseTo(octave1 * 2, 1);
    });

    it('should return null for invalid MIDI notes', () => {
      const freq = midiToFrequency(200);
      expect(freq).toBeNull();
    });
  });

  describe('frequencyToMidi()', () => {
    it('should convert 440 Hz to MIDI 69', () => {
      const midi = frequencyToMidi(440);
      expect(midi).toBe(69);
    });

    it('should convert ~261.63 Hz to MIDI 60', () => {
      const midi = frequencyToMidi(261.63);
      expect(midi).toBe(60);
    });

    it('should return null for invalid frequencies', () => {
      const midi = frequencyToMidi(-440);
      expect(midi).toBeNull();
    });
  });

  describe('getMidiOffset()', () => {
    it('should calculate offset between two MIDI notes', () => {
      const offset = getMidiOffset(60, 67);
      expect(offset).toBe(7); // C to G is 7 semitones
    });

    it('should handle same notes', () => {
      const offset = getMidiOffset(60, 60);
      expect(offset).toBe(0);
    });

    it('should handle descending intervals', () => {
      const offset = getMidiOffset(67, 60);
      expect(offset).toBe(-7);
    });

    it('should handle octave jumps', () => {
      const offset = getMidiOffset(60, 72);
      expect(offset).toBe(12); // One octave = 12 semitones
    });
  });

  describe('transpose()', () => {
    it('should transpose notes up by semitones', () => {
      const notes = [60, 64, 67]; // C E G
      const transposed = transpose(notes, 2);
      expect(transposed).toEqual([62, 66, 69]); // D F# A
    });

    it('should transpose notes down', () => {
      const notes = [60, 64, 67];
      const transposed = transpose(notes, -2);
      expect(transposed).toEqual([58, 62, 65]);
    });

    it('should handle no transposition', () => {
      const notes = [60, 64, 67];
      const transposed = transpose(notes, 0);
      expect(transposed).toEqual([60, 64, 67]);
    });

    it('should handle octave transposition', () => {
      const notes = [60];
      const transposed = transpose(notes, 12);
      expect(transposed).toEqual([72]);
    });
  });

  describe('getIntervalName()', () => {
    it('should return name for intervals', () => {
      const name = getIntervalName(0);
      expect(typeof name).toBe('string');
    });

    it('should handle semitone', () => {
      const name = getIntervalName(1);
      expect(typeof name).toBe('string');
    });

    it('should handle perfect fifth', () => {
      const name = getIntervalName(7);
      expect(typeof name).toBe('string');
    });

    it('should handle octave', () => {
      const name = getIntervalName(12);
      expect(typeof name).toBe('string');
    });
  });

  describe('clampMidi()', () => {
    it('should clamp notes to valid MIDI range', () => {
      const notes = [-5, 60, 100, 150];
      const clamped = clampMidi(notes);
      expect(clamped[0]).toBeGreaterThanOrEqual(0);
      expect(clamped[3]).toBeLessThanOrEqual(127);
    });

    it('should clamp to custom range', () => {
      const notes = [48, 60, 84];
      const clamped = clampMidi(notes, 50, 80);
      expect(clamped[0]).toBe(50);
      expect(clamped[2]).toBe(80);
    });

    it('should preserve notes within range', () => {
      const notes = [60, 64, 67];
      const clamped = clampMidi(notes, 0, 127);
      expect(clamped).toEqual([60, 64, 67]);
    });
  });

  describe('isInPianoRange()', () => {
    it('should return true for notes in piano range', () => {
      expect(isInPianoRange(21)).toBe(true); // Lowest piano note
      expect(isInPianoRange(60)).toBe(true); // Middle C
      expect(isInPianoRange(108)).toBe(true); // Highest piano note
    });

    it('should return false for notes below piano range', () => {
      expect(isInPianoRange(20)).toBe(false);
      expect(isInPianoRange(0)).toBe(false);
    });

    it('should return false for notes above piano range', () => {
      expect(isInPianoRange(109)).toBe(false);
      expect(isInPianoRange(127)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should round-trip MIDI to note name and back', () => {
      const originalMidi = 60;
      const noteName = midiToNoteName(originalMidi);
      const roundTripMidi = noteNameToMidi(noteName);
      expect(roundTripMidi).toBe(originalMidi);
    });

    it('should round-trip MIDI to frequency (approximately)', () => {
      const originalMidi = 60;
      const frequency = midiToFrequency(originalMidi);
      const roundTripMidi = frequencyToMidi(frequency);
      expect(roundTripMidi).toBe(originalMidi);
    });

    it('should transpose and verify interval', () => {
      const original = [60];
      const transposed = transpose(original, 7); // Perfect fifth
      const offset = getMidiOffset(original[0], transposed[0]);
      expect(offset).toBe(7);
    });
  });

  describe('Edge Cases', () => {
    it('should handle MIDI 0 (lowest)', () => {
      const name = midiToNoteName(0);
      expect(name).toBeDefined();
      const freq = midiToFrequency(0);
      expect(freq).toBeGreaterThan(0);
    });

    it('should handle MIDI 127 (highest)', () => {
      const name = midiToNoteName(127);
      expect(name).toBeDefined();
      const freq = midiToFrequency(127);
      expect(freq).toBeGreaterThan(0);
    });

    it('should handle boundary notes', () => {
      expect(isInPianoRange(21)).toBe(true);
      expect(isInPianoRange(108)).toBe(true);
    });
  });
});
