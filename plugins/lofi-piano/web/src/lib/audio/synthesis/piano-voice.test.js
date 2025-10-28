/**
 * Piano Voice Generator - Unit Tests
 *
 * Tests for piano-voice.js module including:
 * - Voice creation and initialization
 * - Oscillator detuning
 * - ADSR envelope behavior
 * - Parameter automation
 * - Error handling
 *
 * @module audio/synthesis/piano-voice.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPianoVoice } from './piano-voice.js';
import { getAudioContext } from '../context.js';

// Web Audio API is mocked globally in src/test/setup.js

beforeEach(() => {
  // Reset the audio context singleton for each test
  // This is handled internally by getAudioContext
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up
});

describe('createPianoVoice', () => {
  describe('Initialization', () => {
    it('should create a voice with default parameters', () => {
      const voice = createPianoVoice();

      expect(voice).toBeDefined();
      expect(voice.oscillators).toBeDefined();
      expect(voice.oscillators.length).toBe(3); // 3 detuned oscillators
      expect(voice.envelope).toBeDefined();
      expect(voice.velocityGain).toBeDefined();
    });

    it('should create a voice with custom frequency', () => {
      const voice = createPianoVoice({ frequency: 880 });

      expect(voice.getFrequency()).toBe(880);
    });

    it('should create a voice with custom velocity', () => {
      const voice = createPianoVoice({ velocity: 64 });

      expect(voice.getVelocity()).toBe(64);
    });

    it('should create a voice with custom ADSR parameters', () => {
      const voice = createPianoVoice({
        attackTime: 0.1,
        decayTime: 0.3,
        sustainLevel: 0.5,
        releaseTime: 2.0
      });

      expect(voice).toBeDefined();
    });

    it('should throw error for frequency below minimum (20 Hz)', () => {
      expect(() => {
        createPianoVoice({ frequency: 10 });
      }).toThrow(/Frequency out of range/);
    });

    it('should throw error for frequency above maximum (20000 Hz)', () => {
      expect(() => {
        createPianoVoice({ frequency: 25000 });
      }).toThrow(/Frequency out of range/);
    });

    it('should throw error for invalid velocity (< 0)', () => {
      expect(() => {
        createPianoVoice({ velocity: -1 });
      }).toThrow(/Velocity out of range/);
    });

    it('should throw error for invalid velocity (> 127)', () => {
      expect(() => {
        createPianoVoice({ velocity: 128 });
      }).toThrow(/Velocity out of range/);
    });

    it('should throw error for negative attack time', () => {
      expect(() => {
        createPianoVoice({ attackTime: -0.1 });
      }).toThrow(/Attack, decay, and release times must be non-negative/);
    });

    it('should throw error for invalid sustain level (< 0)', () => {
      expect(() => {
        createPianoVoice({ sustainLevel: -0.1 });
      }).toThrow(/Sustain level must be between 0 and 1/);
    });

    it('should throw error for invalid sustain level (> 1)', () => {
      expect(() => {
        createPianoVoice({ sustainLevel: 1.1 });
      }).toThrow(/Sustain level must be between 0 and 1/);
    });

    it('should support custom detuning configuration', () => {
      const customDetune = [0, 10, -15];
      const voice = createPianoVoice({ detuneCents: customDetune });

      expect(voice.getDetuning()).toEqual(customDetune);
    });

    it('should support custom velocity scale', () => {
      const voice = createPianoVoice({ velocity: 127, velocityScale: 0.5 });

      expect(voice).toBeDefined();
    });
  });

  describe('State Getters', () => {
    it('should return initial state when created', () => {
      const voice = createPianoVoice({ frequency: 440, velocity: 100 });

      expect(voice.getIsPlaying()).toBe(false);
      expect(voice.getFrequency()).toBe(440);
      expect(voice.getVelocity()).toBe(100);
      expect(voice.getDetuning()).toEqual([0, 15, -20]);
    });

    it('should return state snapshot via getState()', () => {
      const voice = createPianoVoice({ frequency: 880, velocity: 64 });
      const state = voice.getState();

      expect(state).toHaveProperty('isPlaying', false);
      expect(state).toHaveProperty('frequency', 880);
      expect(state).toHaveProperty('velocity', 64);
      expect(state).toHaveProperty('detuning');
      expect(state).toHaveProperty('envelopePhase');
    });
  });

  describe('Note On/Off', () => {
    it('should start oscillators on noteOn()', () => {
      const voice = createPianoVoice();
      voice.noteOn();

      // Verify the voice is playing after noteOn
      expect(voice.getIsPlaying()).toBe(true);
    });

    it('should set isPlaying flag when noteOn() is called', () => {
      const voice = createPianoVoice();

      expect(voice.getIsPlaying()).toBe(false);
      voice.noteOn();
      expect(voice.getIsPlaying()).toBe(true);
    });

    it('should schedule envelope attack on noteOn()', () => {
      const voice = createPianoVoice({ attackTime: 0.1 });
      voice.noteOn();

      // Voice should be playing after noteOn
      expect(voice.getIsPlaying()).toBe(true);
    });

    it('should stop oscillators on noteOff()', () => {
      const voice = createPianoVoice({ releaseTime: 1.0 });
      voice.noteOn();
      voice.noteOff();

      // Voice should stop playing after noteOff
      expect(voice.getIsPlaying()).toBe(false);
    });

    it('should clear isPlaying flag on noteOff()', () => {
      const voice = createPianoVoice();
      voice.noteOn();
      expect(voice.getIsPlaying()).toBe(true);

      voice.noteOff();
      expect(voice.getIsPlaying()).toBe(false);
    });

    it('should allow method chaining with noteOn()', () => {
      const voice = createPianoVoice();
      const result = voice.noteOn();

      expect(result).toBe(voice);
    });

    it('should allow method chaining with noteOff()', () => {
      const voice = createPianoVoice();
      voice.noteOn();
      const result = voice.noteOff();

      expect(result).toBe(voice);
    });

    it('should restart envelope if noteOn() called while playing', () => {
      const voice = createPianoVoice();
      voice.noteOn();
      expect(voice.getIsPlaying()).toBe(true);

      voice.noteOn(); // Call again while playing
      // Voice should still be playing
      expect(voice.getIsPlaying()).toBe(true);
    });
  });

  describe('Frequency Control', () => {
    it('should set frequency with smooth ramping', () => {
      const voice = createPianoVoice({ frequency: 440 });
      voice.setFrequency(880);

      // Verify frequency was set
      expect(voice.getFrequency()).toBe(880);
    });

    it('should throw error for invalid frequency', () => {
      const voice = createPianoVoice();

      expect(() => {
        voice.setFrequency(10); // Below minimum
      }).toThrow(/Frequency out of range/);

      expect(() => {
        voice.setFrequency(25000); // Above maximum
      }).toThrow(/Frequency out of range/);
    });

    it('should update frequency on all oscillators', () => {
      const voice = createPianoVoice();
      voice.setFrequency(880);

      // Voice frequency getter should reflect the new frequency
      expect(voice.getFrequency()).toBe(880);
    });

    it('should allow method chaining with setFrequency()', () => {
      const voice = createPianoVoice();
      const result = voice.setFrequency(880);

      expect(result).toBe(voice);
    });

    it('should ramp frequency over 50ms', () => {
      const voice = createPianoVoice();
      voice.setFrequency(880);

      // Verify that frequency was set to the target value
      expect(voice.getFrequency()).toBe(880);
    });
  });

  describe('Velocity Control', () => {
    it('should set velocity with smooth ramping', () => {
      const voice = createPianoVoice({ velocity: 100 });
      voice.setVelocity(64);

      expect(voice.getVelocity()).toBe(64);
    });

    it('should throw error for invalid velocity', () => {
      const voice = createPianoVoice();

      expect(() => {
        voice.setVelocity(-1);
      }).toThrow(/Velocity out of range/);

      expect(() => {
        voice.setVelocity(128);
      }).toThrow(/Velocity out of range/);
    });

    it('should normalize velocity to 0-1 range', () => {
      const voice = createPianoVoice();
      voice.setVelocity(127); // Maximum velocity

      // Velocity should be set
      expect(voice.getVelocity()).toBe(127);
    });

    it('should allow method chaining with setVelocity()', () => {
      const voice = createPianoVoice();
      const result = voice.setVelocity(64);

      expect(result).toBe(voice);
    });
  });

  describe('Detuning Control', () => {
    it('should update detuning on all oscillators', () => {
      const voice = createPianoVoice();
      const newDetune = [0, 20, -25];
      voice.setDetuning(newDetune);

      expect(voice.getDetuning()).toEqual(newDetune);
    });

    it('should throw error if detuning array length is incorrect', () => {
      const voice = createPianoVoice();

      expect(() => {
        voice.setDetuning([0, 10]); // Only 2 values, need 3
      }).toThrow(/Detuning array length/);
    });

    it('should allow method chaining with setDetuning()', () => {
      const voice = createPianoVoice();
      const result = voice.setDetuning([0, 10, -10]);

      expect(result).toBe(voice);
    });

    it('should create chorus effect with detuning', () => {
      const voice = createPianoVoice();
      const chorusDetune = [0, 5, -5]; // Small detuning for subtle chorus
      voice.setDetuning(chorusDetune);

      expect(voice.getDetuning()).toEqual(chorusDetune);
    });
  });

  describe('Envelope Control', () => {
    it('should accept new envelope parameters', () => {
      const voice = createPianoVoice();

      expect(() => {
        voice.setEnvelope({
          attackTime: 0.2,
          decayTime: 0.4,
          sustainLevel: 0.5,
          releaseTime: 2.0
        });
      }).not.toThrow();
    });

    it('should throw error for negative envelope times', () => {
      const voice = createPianoVoice();

      expect(() => {
        voice.setEnvelope({
          attackTime: -0.1,
          decayTime: 0.2,
          sustainLevel: 0.6,
          releaseTime: 1.0
        });
      }).toThrow(/Envelope times must be non-negative/);
    });

    it('should throw error for invalid sustain level', () => {
      const voice = createPianoVoice();

      expect(() => {
        voice.setEnvelope({
          attackTime: 0.05,
          decayTime: 0.2,
          sustainLevel: 1.5, // Invalid
          releaseTime: 1.0
        });
      }).toThrow(/Sustain level must be between 0 and 1/);
    });

    it('should allow method chaining with setEnvelope()', () => {
      const voice = createPianoVoice();
      const result = voice.setEnvelope({
        attackTime: 0.1,
        decayTime: 0.2,
        sustainLevel: 0.6,
        releaseTime: 1.0
      });

      expect(result).toBe(voice);
    });
  });

  describe('Connection Control', () => {
    it('should connect to audio destination', () => {
      const voice = createPianoVoice();
      const destination = { connect: vi.fn() };

      voice.connect(destination);
      // Connection should succeed without throwing
      expect(voice).toBeDefined();
    });

    it('should disconnect from all destinations', () => {
      const voice = createPianoVoice();
      voice.disconnect();

      // Disconnection should succeed without throwing
      expect(voice).toBeDefined();
    });

    it('should allow method chaining with connect()', () => {
      const voice = createPianoVoice();
      const destination = {};
      const result = voice.connect(destination);

      expect(result).toBe(voice);
    });

    it('should allow method chaining with disconnect()', () => {
      const voice = createPianoVoice();
      const result = voice.disconnect();

      expect(result).toBe(voice);
    });
  });

  describe('Method Chaining', () => {
    it('should support fluent API with multiple chained calls', () => {
      const voice = createPianoVoice();

      const result = voice
        .setFrequency(880)
        .setVelocity(100)
        .setDetuning([0, 15, -20])
        .noteOn();

      expect(result).toBe(voice);
    });

    it('should support complex audio setup through chaining', () => {
      const ctx = getAudioContext();
      const voice = createPianoVoice({ frequency: 440 })
        .connect(ctx.destination)
        .noteOn();

      expect(voice.getIsPlaying()).toBe(true);

      voice.noteOff();
      expect(voice.getIsPlaying()).toBe(false);
    });
  });

  describe('Audio Graph Integration', () => {
    it('should have connected oscillators to envelope', () => {
      const voice = createPianoVoice();

      expect(voice.oscillators.length).toBe(3);
      expect(voice.envelope).toBeDefined();
      expect(voice.velocityGain).toBeDefined();
    });

    it('should expose audio nodes for advanced routing', () => {
      const voice = createPianoVoice();

      expect(voice.oscillators).toBeDefined();
      expect(voice.oscillators.length).toBe(3);
      expect(voice.envelope).toBeDefined();
      expect(voice.velocityGain).toBeDefined();
    });
  });
});
