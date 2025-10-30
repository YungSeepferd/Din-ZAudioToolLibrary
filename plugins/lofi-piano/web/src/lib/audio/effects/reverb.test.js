/**
 * Reverb Effect - Unit Tests
 *
 * Tests for reverb.js module including:
 * - Parameter validation and ranges
 * - Audio graph connections
 * - Decay time control
 * - Room size control
 * - Pre-delay functionality
 * - Dry/wet mixing
 * - Tone control
 * - Edge cases and error handling
 *
 * @module audio/effects/reverb.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createReverb } from './reverb.js';
import { getAudioContext } from '../context.js';

// Web Audio API is mocked globally in src/test/setup.js

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createReverb', () => {
  describe('Initialization', () => {
    it('should create a reverb with default parameters', () => {
      const reverb = createReverb();

      expect(reverb).toBeDefined();
      expect(reverb.input).toBeDefined();
      expect(reverb.output).toBeDefined();
      expect(reverb.getDecayTime()).toBe(2.0);
      expect(reverb.getRoomSize()).toBe(0.5);
      expect(reverb.getPreDelay()).toBe(0.02);
      expect(reverb.getDryWet()).toBe(0.3);
    });

    it('should create a reverb with custom decay time', () => {
      const reverb = createReverb({ decayTime: 5.0 });

      expect(reverb.getDecayTime()).toBe(5.0);
    });

    it('should create a reverb with custom room size', () => {
      const reverb = createReverb({ roomSize: 0.8 });

      expect(reverb.getRoomSize()).toBe(0.8);
    });

    it('should create a reverb with custom pre-delay', () => {
      const reverb = createReverb({ preDelay: 0.05 });

      expect(reverb.getPreDelay()).toBe(0.05);
    });

    it('should create a reverb with custom dry/wet', () => {
      const reverb = createReverb({ dryWet: 0.7 });

      expect(reverb.getDryWet()).toBe(0.7);
    });
  });

  describe('Parameter Validation', () => {
    it('should throw error for decay time below minimum (0.1s)', () => {
      expect(() => {
        createReverb({ decayTime: 0.05 });
      }).toThrow(/Decay time out of range/);
    });

    it('should throw error for decay time above maximum (10s)', () => {
      expect(() => {
        createReverb({ decayTime: 15 });
      }).toThrow(/Decay time out of range/);
    });

    it('should throw error for room size below 0', () => {
      expect(() => {
        createReverb({ roomSize: -0.1 });
      }).toThrow(/Room size out of range/);
    });

    it('should throw error for room size above 1', () => {
      expect(() => {
        createReverb({ roomSize: 1.5 });
      }).toThrow(/Room size out of range/);
    });

    it('should throw error for pre-delay below 0', () => {
      expect(() => {
        createReverb({ preDelay: -0.01 });
      }).toThrow(/Pre-delay out of range/);
    });

    it('should throw error for pre-delay above 1', () => {
      expect(() => {
        createReverb({ preDelay: 1.5 });
      }).toThrow(/Pre-delay out of range/);
    });

    it('should throw error for dry/wet below 0', () => {
      expect(() => {
        createReverb({ dryWet: -0.1 });
      }).toThrow(/Dry\/wet balance out of range/);
    });

    it('should throw error for dry/wet above 1', () => {
      expect(() => {
        createReverb({ dryWet: 1.2 });
      }).toThrow(/Dry\/wet balance out of range/);
    });
  });

  describe('Decay Time Control', () => {
    it('should update decay time', () => {
      const reverb = createReverb({ decayTime: 2.0 });
      reverb.setDecayTime(4.0);

      expect(reverb.getDecayTime()).toBe(4.0);
    });

    it('should throw error for invalid decay time', () => {
      const reverb = createReverb();

      expect(() => {
        reverb.setDecayTime(0.05); // Too short
      }).toThrow(/Decay time out of range/);

      expect(() => {
        reverb.setDecayTime(15); // Too long
      }).toThrow(/Decay time out of range/);
    });

    it('should allow method chaining', () => {
      const reverb = createReverb();
      const result = reverb.setDecayTime(3.0);

      expect(result).toBe(reverb);
    });

    it('should handle boundary values', () => {
      const reverb = createReverb();

      reverb.setDecayTime(0.1); // Minimum
      expect(reverb.getDecayTime()).toBe(0.1);

      reverb.setDecayTime(10); // Maximum
      expect(reverb.getDecayTime()).toBe(10);
    });
  });

  describe('Room Size Control', () => {
    it('should update room size', () => {
      const reverb = createReverb({ roomSize: 0.5 });
      reverb.setRoomSize(0.8);

      expect(reverb.getRoomSize()).toBe(0.8);
    });

    it('should throw error for invalid room size', () => {
      const reverb = createReverb();

      expect(() => {
        reverb.setRoomSize(-0.1);
      }).toThrow(/Room size out of range/);

      expect(() => {
        reverb.setRoomSize(1.5);
      }).toThrow(/Room size out of range/);
    });

    it('should allow method chaining', () => {
      const reverb = createReverb();
      const result = reverb.setRoomSize(0.7);

      expect(result).toBe(reverb);
    });

    it('should handle boundary values', () => {
      const reverb = createReverb();

      reverb.setRoomSize(0); // Minimum
      expect(reverb.getRoomSize()).toBe(0);

      reverb.setRoomSize(1); // Maximum
      expect(reverb.getRoomSize()).toBe(1);
    });
  });

  describe('Pre-Delay Control', () => {
    it('should update pre-delay', () => {
      const reverb = createReverb({ preDelay: 0.02 });
      reverb.setPreDelay(0.05);

      expect(reverb.getPreDelay()).toBe(0.05);
    });

    it('should throw error for invalid pre-delay', () => {
      const reverb = createReverb();

      expect(() => {
        reverb.setPreDelay(-0.01);
      }).toThrow(/Pre-delay out of range/);

      expect(() => {
        reverb.setPreDelay(1.5);
      }).toThrow(/Pre-delay out of range/);
    });

    it('should allow method chaining', () => {
      const reverb = createReverb();
      const result = reverb.setPreDelay(0.03);

      expect(result).toBe(reverb);
    });
  });

  describe('Dry/Wet Control', () => {
    it('should update dry/wet balance', () => {
      const reverb = createReverb({ dryWet: 0.3 });
      reverb.setDryWet(0.6);

      expect(reverb.getDryWet()).toBe(0.6);
    });

    it('should throw error for invalid dry/wet', () => {
      const reverb = createReverb();

      expect(() => {
        reverb.setDryWet(-0.1);
      }).toThrow(/Dry\/wet balance out of range/);

      expect(() => {
        reverb.setDryWet(1.3);
      }).toThrow(/Dry\/wet balance out of range/);
    });

    it('should allow method chaining', () => {
      const reverb = createReverb();
      const result = reverb.setDryWet(0.5);

      expect(result).toBe(reverb);
    });

    it('should handle extreme values', () => {
      const reverb = createReverb();

      reverb.setDryWet(0); // Fully dry
      expect(reverb.getDryWet()).toBe(0);

      reverb.setDryWet(1); // Fully wet
      expect(reverb.getDryWet()).toBe(1);
    });
  });

  describe('Tone Control', () => {
    it('should set reverb tone frequency', () => {
      const reverb = createReverb();

      expect(() => {
        reverb.setTone(3000);
      }).not.toThrow();
    });

    it('should throw error for invalid tone frequency', () => {
      const reverb = createReverb();

      expect(() => {
        reverb.setTone(50); // Too low
      }).toThrow(/Tone frequency out of range/);

      expect(() => {
        reverb.setTone(25000); // Too high
      }).toThrow(/Tone frequency out of range/);
    });

    it('should allow method chaining', () => {
      const reverb = createReverb();
      const result = reverb.setTone(5000);

      expect(result).toBe(reverb);
    });
  });

  describe('Audio Graph Connections', () => {
    it('should have input and output nodes', () => {
      const reverb = createReverb();

      expect(reverb.input).toBeDefined();
      expect(reverb.output).toBeDefined();
    });

    it('should connect to source', () => {
      const reverb = createReverb();
      const mockSource = { connect: vi.fn() };

      reverb.connect(mockSource);
      // Verify connection logic executed without error
      expect(reverb).toBeDefined();
    });

    it('should allow method chaining on connect', () => {
      const reverb = createReverb();
      const mockSource = { connect: vi.fn() };
      const result = reverb.connect(mockSource);

      expect(result).toBe(reverb);
    });

    it('should disconnect all nodes', () => {
      const reverb = createReverb();
      reverb.disconnect();

      // Verify disconnection executed without error
      expect(reverb).toBeDefined();
    });

    it('should allow method chaining on disconnect', () => {
      const reverb = createReverb();
      const result = reverb.disconnect();

      expect(result).toBe(reverb);
    });
  });

  describe('State Management', () => {
    it('should return current state', () => {
      const reverb = createReverb({
        decayTime: 3.0,
        roomSize: 0.7,
        preDelay: 0.03,
        dryWet: 0.5
      });

      const state = reverb.getState();

      expect(state.decayTime).toBe(3.0);
      expect(state.roomSize).toBe(0.7);
      expect(state.preDelay).toBe(0.03);
      expect(state.dryWet).toBe(0.5);
    });

    it('should reflect parameter changes in state', () => {
      const reverb = createReverb();

      reverb.setDecayTime(4.0);
      reverb.setRoomSize(0.9);

      const state = reverb.getState();
      expect(state.decayTime).toBe(4.0);
      expect(state.roomSize).toBe(0.9);
    });
  });

  describe('Method Chaining', () => {
    it('should support fluent API with multiple chained calls', () => {
      const reverb = createReverb();

      const result = reverb
        .setDecayTime(3.0)
        .setRoomSize(0.8)
        .setPreDelay(0.04)
        .setDryWet(0.6)
        .setTone(4000);

      expect(result).toBe(reverb);
      expect(reverb.getDecayTime()).toBe(3.0);
      expect(reverb.getRoomSize()).toBe(0.8);
      expect(reverb.getPreDelay()).toBe(0.04);
      expect(reverb.getDryWet()).toBe(0.6);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero room size (no reverb)', () => {
      const reverb = createReverb({ roomSize: 0 });
      expect(reverb.getRoomSize()).toBe(0);
    });

    it('should handle maximum room size', () => {
      const reverb = createReverb({ roomSize: 1 });
      expect(reverb.getRoomSize()).toBe(1);
    });

    it('should handle very short decay time', () => {
      const reverb = createReverb({ decayTime: 0.1 });
      expect(reverb.getDecayTime()).toBe(0.1);
    });

    it('should handle very long decay time', () => {
      const reverb = createReverb({ decayTime: 10 });
      expect(reverb.getDecayTime()).toBe(10);
    });

    it('should handle zero pre-delay', () => {
      const reverb = createReverb({ preDelay: 0 });
      expect(reverb.getPreDelay()).toBe(0);
    });

    it('should handle fully dry signal', () => {
      const reverb = createReverb({ dryWet: 0 });
      expect(reverb.getDryWet()).toBe(0);
    });

    it('should handle fully wet signal', () => {
      const reverb = createReverb({ dryWet: 1 });
      expect(reverb.getDryWet()).toBe(1);
    });
  });

  describe('Performance and Stability', () => {
    it('should create multiple instances without conflict', () => {
      const reverb1 = createReverb({ decayTime: 2.0 });
      const reverb2 = createReverb({ decayTime: 4.0 });

      expect(reverb1.getDecayTime()).toBe(2.0);
      expect(reverb2.getDecayTime()).toBe(4.0);
    });

    it('should handle rapid parameter changes', () => {
      const reverb = createReverb();

      for (let i = 0; i < 100; i++) {
        reverb.setRoomSize(Math.random());
      }

      // Should not crash or throw
      expect(reverb).toBeDefined();
    });
  });
});
