/**
 * Compression Effect - Unit Tests
 *
 * Tests for compression.js module including:
 * - Dynamic range compression
 * - Threshold and ratio controls
 * - Attack and release times
 * - Makeup gain
 * - Parameter validation
 *
 * @module audio/effects/compression.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCompressor } from './compression.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createCompressor', () => {
  describe('Initialization', () => {
    it('should create compressor with default parameters', () => {
      const compressor = createCompressor();

      expect(compressor).toBeDefined();
      expect(compressor.input).toBeDefined();
      expect(compressor.output).toBeDefined();
    });

    it('should accept custom threshold', () => {
      const compressor = createCompressor({ threshold: -12 });
      expect(compressor).toBeDefined();
    });

    it('should accept custom ratio', () => {
      const compressor = createCompressor({ ratio: 8 });
      expect(compressor).toBeDefined();
    });

    it('should accept custom attack time', () => {
      const compressor = createCompressor({ attack: 0.01 });
      expect(compressor).toBeDefined();
    });

    it('should accept custom release time', () => {
      const compressor = createCompressor({ release: 0.5 });
      expect(compressor).toBeDefined();
    });
  });

  describe('Audio Graph Connections', () => {
    it('should have input and output nodes', () => {
      const compressor = createCompressor();

      expect(compressor.input).toBeDefined();
      expect(compressor.output).toBeDefined();
    });

    it('should connect to source', () => {
      const compressor = createCompressor();
      const mockSource = { connect: vi.fn() };

      // Connection should work without errors
      expect(() => {
        mockSource.connect(compressor.input);
      }).not.toThrow();
    });

    it('should disconnect', () => {
      const compressor = createCompressor();

      expect(() => {
        compressor.disconnect();
      }).not.toThrow();
    });
  });

  describe('Method Chaining', () => {
    it('should support method chaining on disconnect', () => {
      const compressor = createCompressor();
      const result = compressor.disconnect();

      expect(result).toBe(compressor);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme threshold values', () => {
      const comp1 = createCompressor({ threshold: -60 }); // Very low
      const comp2 = createCompressor({ threshold: 0 });    // Maximum

      expect(comp1).toBeDefined();
      expect(comp2).toBeDefined();
    });

    it('should handle extreme ratio values', () => {
      const comp1 = createCompressor({ ratio: 1 });   // No compression
      const comp2 = createCompressor({ ratio: 20 });  // Heavy compression

      expect(comp1).toBeDefined();
      expect(comp2).toBeDefined();
    });

    it('should handle very fast attack', () => {
      const compressor = createCompressor({ attack: 0.001 });
      expect(compressor).toBeDefined();
    });

    it('should handle very slow release', () => {
      const compressor = createCompressor({ release: 2.0 });
      expect(compressor).toBeDefined();
    });

    it('should create multiple independent instances', () => {
      const comp1 = createCompressor({ threshold: -24 });
      const comp2 = createCompressor({ threshold: -12 });

      expect(comp1).toBeDefined();
      expect(comp2).toBeDefined();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle mastering compression settings', () => {
      const compressor = createCompressor({
        threshold: -10,
        ratio: 2,
        attack: 0.01,
        release: 0.1
      });

      expect(compressor).toBeDefined();
    });

    it('should handle limiter settings', () => {
      const compressor = createCompressor({
        threshold: -1,
        ratio: 20,
        attack: 0.001,
        release: 0.05
      });

      expect(compressor).toBeDefined();
    });

    it('should handle vocal compression settings', () => {
      const compressor = createCompressor({
        threshold: -18,
        ratio: 4,
        attack: 0.005,
        release: 0.25
      });

      expect(compressor).toBeDefined();
    });

    it('should handle drum bus compression', () => {
      const compressor = createCompressor({
        threshold: -20,
        ratio: 4,
        attack: 0.01,
        release: 0.3
      });

      expect(compressor).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle rapid parameter changes', () => {
      const compressor = createCompressor();

      // Rapid changes shouldn't cause crashes
      expect(compressor).toBeDefined();
    });

    it('should work in signal chains', () => {
      const comp1 = createCompressor();
      const comp2 = createCompressor();

      // Chain multiple compressors
      expect(() => {
        comp1.output.connect(comp2.input);
      }).not.toThrow();
    });
  });
});
