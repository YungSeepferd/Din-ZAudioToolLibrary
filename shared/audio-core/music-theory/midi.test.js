/**
 * midi.test.js
 * Comprehensive test suite for the MIDI utilities module
 *
 * Tests MIDI conversions (note names, frequencies, intervals)
 * and piano range utilities.
 *
 * @module midi.test
 */

import { describe, it, expect } from 'vitest';
import {
  midiToNoteName,
  noteNameToMidi,
  midiToFrequency,
  frequencyToMidi,
  getIntervalName,
  getIntervalSemitones,
  isValidMidiNote,
  getPianoRange,
  isInPianoRange,
  transposeNote,
  getOctave,
  getNoteInOctave,
} from './midi.js';

describe('MIDI Module', () => {
  describe('midiToNoteName()', () => {
    it('should convert MIDI 60 to C4', () => {
      expect(midiToNoteName(60)).toBe('C4');
    });

    it('should convert MIDI 69 to A4 (concert pitch)', () => {
      expect(midiToNoteName(69)).toBe('A4');
    });

    it('should convert MIDI 0 to C-1', () => {
      expect(midiToNoteName(0)).toBe('C-1');
    });

    it('should convert MIDI 127 to G9', () => {
      expect(midiToNoteName(127)).toBe('G9');
    });

    it('should include sharps for black keys', () => {
      expect(midiToNoteName(61)).toBe('C#4');
      expect(midiToNoteName(63)).toBe('D#4');
      expect(midiToNoteName(66)).toBe('F#4');
    });

    it('should handle all 12 chromatic notes in octave 4', () => {
      const noteNames = [
        'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4',
        'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
      ];

      for (let i = 0; i < 12; i++) {
        expect(midiToNoteName(60 + i)).toBe(noteNames[i]);
      }
    });

    it('should work for all valid MIDI notes', () => {
      for (let midi = 0; midi <= 127; midi++) {
        const noteName = midiToNoteName(midi);
        expect(noteName).toBeDefined();
        expect(typeof noteName).toBe('string');
        expect(noteName.length).toBeGreaterThan(1);
      }
    });

    it('should throw error for invalid MIDI notes', () => {
      expect(() => midiToNoteName(-1)).toThrow();
      expect(() => midiToNoteName(128)).toThrow();
      expect(() => midiToNoteName(256)).toThrow();
    });
  });

  describe('noteNameToMidi()', () => {
    it('should convert C4 to MIDI 60', () => {
      expect(noteNameToMidi('C4')).toBe(60);
    });

    it('should convert A4 to MIDI 69', () => {
      expect(noteNameToMidi('A4')).toBe(69);
    });

    it('should convert C-1 to MIDI 0', () => {
      expect(noteNameToMidi('C-1')).toBe(0);
    });

    it('should convert G9 to MIDI 127', () => {
      expect(noteNameToMidi('G9')).toBe(127);
    });

    it('should handle sharps correctly', () => {
      expect(noteNameToMidi('C#4')).toBe(61);
      expect(noteNameToMidi('D#4')).toBe(63);
      expect(noteNameToMidi('F#4')).toBe(66);
    });

    it('should handle flats (as alternatives to sharps)', () => {
      expect(noteNameToMidi('Db4')).toBe(61);
      expect(noteNameToMidi('Eb4')).toBe(63);
      expect(noteNameToMidi('Gb4')).toBe(66);
    });

    it('should be inverse of midiToNoteName for standard notes', () => {
      for (let midi = 0; midi <= 127; midi++) {
        const noteName = midiToNoteName(midi);
        const midi2 = noteNameToMidi(noteName);
        expect(midi2).toBe(midi);
      }
    });

    it('should throw error for invalid note names', () => {
      expect(() => noteNameToMidi('H4')).toThrow();
      expect(() => noteNameToMidi('C99')).toThrow();
      expect(() => noteNameToMidi('invalid')).toThrow();
    });
  });

  describe('midiToFrequency()', () => {
    it('should convert A4 to 440 Hz (concert pitch)', () => {
      const freq = midiToFrequency(69);
      expect(freq).toBeCloseTo(440, 1);
    });

    it('should convert C4 to approximately 261.6 Hz', () => {
      const freq = midiToFrequency(60);
      expect(freq).toBeCloseTo(261.6, 1);
    });

    it('should convert A3 to approximately 220 Hz', () => {
      const freq = midiToFrequency(57);
      expect(freq).toBeCloseTo(220, 1);
    });

    it('should convert A5 to approximately 880 Hz', () => {
      const freq = midiToFrequency(81);
      expect(freq).toBeCloseTo(880, 1);
    });

    it('should have frequency double in next octave', () => {
      const freq69 = midiToFrequency(69);
      const freq81 = midiToFrequency(81); // One octave higher (12 semitones)

      expect(freq81).toBeCloseTo(freq69 * 2, 1);
    });

    it('should work for all valid MIDI notes', () => {
      for (let midi = 0; midi <= 127; midi++) {
        const freq = midiToFrequency(midi);
        expect(freq).toBeGreaterThan(0);
        expect(typeof freq).toBe('number');
      }
    });

    it('should throw error for invalid MIDI notes', () => {
      expect(() => midiToFrequency(-1)).toThrow();
      expect(() => midiToFrequency(128)).toThrow();
    });
  });

  describe('frequencyToMidi()', () => {
    it('should convert 440 Hz to A4 (MIDI 69)', () => {
      expect(frequencyToMidi(440)).toBe(69);
    });

    it('should convert 261.6 Hz to C4 (MIDI 60)', () => {
      expect(frequencyToMidi(261.6)).toBe(60);
    });

    it('should be inverse of midiToFrequency', () => {
      for (let midi = 0; midi <= 127; midi++) {
        const freq = midiToFrequency(midi);
        const midi2 = frequencyToMidi(freq);
        expect(midi2).toBe(midi);
      }
    });

    it('should round to nearest MIDI note', () => {
      // 440 Hz should be MIDI 69 (A4)
      expect(frequencyToMidi(440)).toBe(69);
      // Slightly higher frequency should still be 69
      expect(frequencyToMidi(442)).toBe(69);
      // Much higher should be 70
      expect(frequencyToMidi(466)).toBe(70);
    });

    it('should throw error for invalid frequencies', () => {
      expect(() => frequencyToMidi(-1)).toThrow();
      expect(() => frequencyToMidi(0)).toThrow();
    });
  });

  describe('getIntervalName()', () => {
    it('should return unison for 0 semitones', () => {
      expect(getIntervalName(0)).toBe('Unison');
    });

    it('should return perfect 5th for 7 semitones', () => {
      expect(getIntervalName(7)).toBe('Perfect 5th');
    });

    it('should return major 3rd for 4 semitones', () => {
      expect(getIntervalName(4)).toBe('Major 3rd');
    });

    it('should return minor 3rd for 3 semitones', () => {
      expect(getIntervalName(3)).toBe('Minor 3rd');
    });

    it('should return perfect 4th for 5 semitones', () => {
      expect(getIntervalName(5)).toBe('Perfect 4th');
    });

    it('should return tritone for 6 semitones', () => {
      expect(getIntervalName(6)).toContain('tritone');
    });

    it('should return octave for 12 semitones', () => {
      expect(getIntervalName(12)).toBe('Octave');
    });

    it('should handle large intervals', () => {
      const twoOctaves = getIntervalName(24);
      expect(twoOctaves).toBeDefined();
    });

    it('should handle negative intervals (descending)', () => {
      const negFifth = getIntervalName(-7);
      expect(negFifth).toBeDefined();
    });
  });

  describe('getIntervalSemitones()', () => {
    it('should return correct semitones for interval names', () => {
      expect(getIntervalSemitones('Unison')).toBe(0);
      expect(getIntervalSemitones('Perfect 5th')).toBe(7);
      expect(getIntervalSemitones('Major 3rd')).toBe(4);
      expect(getIntervalSemitones('Minor 3rd')).toBe(3);
      expect(getIntervalSemitones('Octave')).toBe(12);
    });

    it('should be inverse of getIntervalName', () => {
      for (let semitones = 0; semitones <= 12; semitones++) {
        const name = getIntervalName(semitones);
        const semitones2 = getIntervalSemitones(name);
        expect(semitones2).toBe(semitones);
      }
    });
  });

  describe('isValidMidiNote()', () => {
    it('should return true for valid MIDI notes (0-127)', () => {
      expect(isValidMidiNote(0)).toBe(true);
      expect(isValidMidiNote(60)).toBe(true);
      expect(isValidMidiNote(127)).toBe(true);
    });

    it('should return false for invalid MIDI notes', () => {
      expect(isValidMidiNote(-1)).toBe(false);
      expect(isValidMidiNote(128)).toBe(false);
      expect(isValidMidiNote(256)).toBe(false);
      expect(isValidMidiNote(-50)).toBe(false);
    });

    it('should return false for non-integer values', () => {
      expect(isValidMidiNote(60.5)).toBe(false);
      expect(isValidMidiNote(60.1)).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(isValidMidiNote('60')).toBe(false);
      expect(isValidMidiNote(null)).toBe(false);
      expect(isValidMidiNote(undefined)).toBe(false);
    });
  });

  describe('getPianoRange()', () => {
    it('should return standard 88-key piano range', () => {
      const range = getPianoRange();
      expect(range).toHaveProperty('min');
      expect(range).toHaveProperty('max');
      expect(range.min).toBe(21); // A0
      expect(range.max).toBe(108); // C8
    });

    it('should return correct octave range', () => {
      const range = getPianoRange();
      const minNote = midiToNoteName(range.min);
      const maxNote = midiToNoteName(range.max);
      expect(minNote).toBe('A0');
      expect(maxNote).toBe('C8');
    });
  });

  describe('isInPianoRange()', () => {
    it('should return true for notes in piano range', () => {
      expect(isInPianoRange(21)).toBe(true); // A0
      expect(isInPianoRange(60)).toBe(true); // C4
      expect(isInPianoRange(108)).toBe(true); // C8
    });

    it('should return false for notes outside piano range', () => {
      expect(isInPianoRange(20)).toBe(false); // Below A0
      expect(isInPianoRange(109)).toBe(false); // Above C8
      expect(isInPianoRange(0)).toBe(false);
      expect(isInPianoRange(127)).toBe(false);
    });
  });

  describe('transposeNote()', () => {
    it('should transpose up by positive semitones', () => {
      expect(transposeNote(60, 12)).toBe(72); // C4 + 1 octave
      expect(transposeNote(60, 7)).toBe(67); // C4 + perfect 5th
      expect(transposeNote(60, 5)).toBe(65); // C4 + perfect 4th
    });

    it('should transpose down by negative semitones', () => {
      expect(transposeNote(72, -12)).toBe(60); // C5 - 1 octave
      expect(transposeNote(67, -7)).toBe(60); // G4 - perfect 5th
    });

    it('should handle no transposition', () => {
      expect(transposeNote(60, 0)).toBe(60);
    });

    it('should throw error for notes outside MIDI range after transposition', () => {
      expect(() => transposeNote(127, 1)).toThrow(); // Would exceed 127
      expect(() => transposeNote(0, -1)).toThrow(); // Would be below 0
    });
  });

  describe('getOctave()', () => {
    it('should return correct octave for MIDI notes', () => {
      expect(getOctave(0)).toBe(-1); // C-1
      expect(getOctave(11)).toBe(-1); // B-1
      expect(getOctave(12)).toBe(0); // C0
      expect(getOctave(60)).toBe(4); // C4
      expect(getOctave(69)).toBe(4); // A4
      expect(getOctave(127)).toBe(9); // G9
    });

    it('should handle all octaves', () => {
      for (let octave = -1; octave <= 9; octave++) {
        const midi = (octave + 1) * 12; // C of that octave
        if (midi <= 127) {
          expect(getOctave(midi)).toBe(octave);
        }
      }
    });
  });

  describe('getNoteInOctave()', () => {
    it('should return note position within octave (0-11)', () => {
      expect(getNoteInOctave(60)).toBe(0); // C
      expect(getNoteInOctave(61)).toBe(1); // C#
      expect(getNoteInOctave(69)).toBe(9); // A
    });

    it('should wrap within 0-11 range', () => {
      expect(getNoteInOctave(0)).toBe(0); // C-1 = C
      expect(getNoteInOctave(12)).toBe(0); // C0 = C
      expect(getNoteInOctave(24)).toBe(0); // C1 = C
    });
  });

  describe('Musical accuracy', () => {
    it('should follow equal temperament tuning standard', () => {
      // Each semitone is 2^(1/12) times the previous frequency
      const freq1 = midiToFrequency(60);
      const freq2 = midiToFrequency(61);
      const ratio = freq2 / freq1;

      expect(ratio).toBeCloseTo(Math.pow(2, 1 / 12), 5);
    });

    it('should preserve interval qualities', () => {
      // Perfect intervals
      const c = 60;
      const g = c + 7; // Perfect 5th

      const freqC = midiToFrequency(c);
      const freqG = midiToFrequency(g);
      const ratio = freqG / freqC;

      expect(ratio).toBeCloseTo(3 / 2, 2); // Just intonation ratio
    });

    it('should have octave doublings', () => {
      for (let octave = 0; octave < 8; octave++) {
        const midi = 60 + octave * 12;
        if (midi <= 127) {
          const freq = midiToFrequency(midi);
          const freqOctaveUp = midiToFrequency(midi + 12);
          expect(freqOctaveUp).toBeCloseTo(freq * 2, 1);
        }
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle boundary MIDI values', () => {
      expect(midiToNoteName(0)).toBe('C-1');
      expect(midiToNoteName(127)).toBe('G9');
      expect(noteNameToMidi('C-1')).toBe(0);
      expect(noteNameToMidi('G9')).toBe(127);
    });

    it('should handle all 12 chromatic notes', () => {
      const noteLetters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const roots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      roots.forEach((root) => {
        const name = midiToNoteName(root);
        const expectedStart = noteLetters[root];
        expect(name).toContain(expectedStart);
      });
    });

    it('should handle all valid MIDI notes consistently', () => {
      for (let midi = 0; midi <= 127; midi++) {
        const name = midiToNoteName(midi);
        const midi2 = noteNameToMidi(name);
        expect(midi2).toBe(midi);
      }
    });
  });
});
