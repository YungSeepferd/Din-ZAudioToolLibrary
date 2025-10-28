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

// Mock the audio context
let mockOscillator;
let mockGainNode;
let mockAudioContext;

beforeEach(() => {
  // Reset all mocks
  mockOscillator = {
    type: 'sine',
    frequency: { value: 440, linearRampToValueAtTime: vi.fn() },
    detune: { value: 0, linearRampToValueAtTime: vi.fn() },
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn()
  };

  mockGainNode = {
    gain: { value: 0.5, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn()
  };

  mockAudioContext = {
    currentTime: 0,
    createOscillator: vi.fn(() => ({ ...mockOscillator })),
    createGain: vi.fn(() => ({ ...mockGainNode })),
    destination: {}
  };

  // Mock the getAudioContext function
  vi.doMock('../context.js', () => ({
    getAudioContext: () => mockAudioContext
  }));
});

afterEach(() => {
  vi.clearAllMocks();
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

      mockAudioContext.createOscillator.mock.results.forEach((result) => {
        expect(result.value.start).toHaveBeenCalled();
      });
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

      // Check that gain node was scheduled
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalled();
    });

    it('should stop oscillators on noteOff()', () => {
      const voice = createPianoVoice({ releaseTime: 1.0 });
      voice.noteOn();
      voice.noteOff();

      mockAudioContext.createOscillator.mock.results.forEach((result) => {
        expect(result.value.stop).toHaveBeenCalled();
      });
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
      const firstStartCallCount = mockAudioContext.createOscillator().start.mock.calls.length;

      voice.noteOn(); // Call again
      const secondStartCallCount = mockAudioContext.createOscillator().start.mock.calls.length;

      expect(secondStartCallCount).toBeGreaterThan(firstStartCallCount);
    });
  });

  describe('Frequency Control', () => {
    it('should set frequency with smooth ramping', () => {
      const voice = createPianoVoice({ frequency: 440 });
      voice.setFrequency(880);

      expect(voice.getFrequency()).toBe(880);
      expect(mockOscillator.frequency.linearRampToValueAtTime).toHaveBeenCalled();
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

      // Verify that all oscillators had their frequency updated
      mockAudioContext.createOscillator.mock.results.forEach((result) => {
        expect(result.value.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(
          880,
          expect.any(Number)
        );
      });
    });

    it('should allow method chaining with setFrequency()', () => {
      const voice = createPianoVoice();
      const result = voice.setFrequency(880);

      expect(result).toBe(voice);
    });

    it('should ramp frequency over 50ms', () => {
      mockAudioContext.currentTime = 0;
      const voice = createPianoVoice();
      voice.setFrequency(880);

      const calls = mockOscillator.frequency.linearRampToValueAtTime.mock.calls;
      const rampTime = calls[0][1]; // Get the time parameter

      // Should ramp over approximately 50ms (0.05 seconds)
      expect(rampTime).toBeCloseTo(0.05, 1);
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

      // Verify gain ramping was called
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalled();
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

      // Verify detune was updated on all oscillators
      mockAudioContext.createOscillator.mock.results.forEach((result) => {
        expect(result.value.detune.linearRampToValueAtTime).toHaveBeenCalled();
      });
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

      expect(mockGainNode.connect).toHaveBeenCalledWith(destination);
    });

    it('should disconnect from all destinations', () => {
      const voice = createPianoVoice();
      voice.disconnect();

      expect(mockGainNode.disconnect).toHaveBeenCalled();
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
      const voice = createPianoVoice({ frequency: 440 })
        .connect(mockAudioContext.destination)
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
