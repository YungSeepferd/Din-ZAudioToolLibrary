/**
 * Unit Tests: BiquadFilter Parameter Smoothing
 * Critical tests for filter instability fix (Phase 2, Issue #4)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLowPassFilter,
  createHighPassFilter,
  createBandPassFilter,
  createPeakingEQFilter,
  createShelfFilter,
  createMultiPoleFilter
} from './filters.js';
import { getAudioContext } from '../utils/audio-context.js';

describe('Filter Creation & Initialization', () => {
  let audioContext;

  beforeEach(() => {
    audioContext = getAudioContext();
  });

  describe('createLowPassFilter', () => {
    it('should create filter with default frequency=1000 and q=1', () => {
      const filter = createLowPassFilter();

      expect(filter.getFrequency()).toBe(1000);
      expect(filter.getQ()).toBe(1);
      expect(filter.getFilter().type).toBe('lowpass');
    });

    it('should accept custom frequency and Q values', () => {
      const filter = createLowPassFilter(500, 2.5);

      expect(filter.getFrequency()).toBe(500);
      expect(filter.getQ()).toBe(2.5);
    });

    it('should create filter connected to AudioContext', () => {
      const filter = createLowPassFilter();

      expect(filter.getFilter().context).toBe(audioContext);
    });
  });

  describe('Filter Types', () => {
    it('should create all filter types correctly', () => {
      expect(createLowPassFilter().getFilter().type).toBe('lowpass');
      expect(createHighPassFilter().getFilter().type).toBe('highpass');
      expect(createBandPassFilter().getFilter().type).toBe('bandpass');
      expect(createPeakingEQFilter().getFilter().type).toBe('peaking');
    });

    it('should create shelf filters with correct type', () => {
      const lowShelf = createShelfFilter('lowshelf', 200, 0);
      const highShelf = createShelfFilter('highshelf', 8000, 0);

      expect(lowShelf.getFilter().type).toBe('lowshelf');
      expect(highShelf.getFilter().type).toBe('highshelf');
    });
  });
});

describe('Parameter Smoothing - CRITICAL TESTS', () => {
  let audioContext;

  beforeEach(() => {
    audioContext = getAudioContext();
    vi.clearAllMocks();
  });

  describe('Frequency Parameter Smoothing', () => {
    it('should use linearRampToValueAtTime for frequency changes', () => {
      const filter = createLowPassFilter(1000, 1);
      const frequencyParam = filter.getFilter().frequency;

      // Spy on AudioParam methods
      const setValueSpy = vi.spyOn(frequencyParam, 'setValueAtTime');
      const rampSpy = vi.spyOn(frequencyParam, 'linearRampToValueAtTime');

      filter.setFrequency(500);

      // Verify smooth transition pattern
      expect(setValueSpy).toHaveBeenCalled();
      expect(rampSpy).toHaveBeenCalled();

      // Verify parameters
      expect(setValueSpy.mock.calls[0][0]).toBe(1000); // Anchor current value
      expect(rampSpy.mock.calls[0][0]).toBe(500); // Ramp to new value
    });

    it('should use 50ms smoothing time for frequency changes', () => {
      const filter = createLowPassFilter(1000, 1);
      const frequencyParam = filter.getFilter().frequency;

      const rampSpy = vi.spyOn(frequencyParam, 'linearRampToValueAtTime');
      const setValueSpy = vi.spyOn(frequencyParam, 'setValueAtTime');

      filter.setFrequency(500);

      // Get timing values
      const rampTime = rampSpy.mock.calls[0][1];
      const anchorTime = setValueSpy.mock.calls[0][1];

      // Verify 50ms smoothing (0.05 seconds)
      expect(rampTime - anchorTime).toBeCloseTo(0.05, 3);
    });

    it('should smooth frequency on all filter types', () => {
      const filters = [
        createLowPassFilter(1000, 1),
        createHighPassFilter(1000, 1),
        createBandPassFilter(1000, 1),
        createPeakingEQFilter(1000, 1, 0)
      ];

      filters.forEach(filter => {
        const rampSpy = vi.spyOn(filter.getFilter().frequency, 'linearRampToValueAtTime');

        filter.setFrequency(500);

        expect(rampSpy).toHaveBeenCalled();
        expect(rampSpy.mock.calls[0][0]).toBe(500);
      });
    });
  });

  describe('Q Parameter Smoothing', () => {
    it('should smooth Q parameter changes to prevent filter instability', () => {
      const filter = createLowPassFilter(1000, 1);
      const qParam = filter.getFilter().Q;

      const rampSpy = vi.spyOn(qParam, 'linearRampToValueAtTime');
      const setValueSpy = vi.spyOn(qParam, 'setValueAtTime');

      filter.setQ(10); // High Q (resonance)

      // Verify smooth transition
      expect(setValueSpy).toHaveBeenCalled();
      expect(rampSpy).toHaveBeenCalled();
      expect(rampSpy.mock.calls[0][0]).toBe(10);
    });

    it('should use 50ms smoothing time for Q changes', () => {
      const filter = createLowPassFilter(1000, 1);
      const qParam = filter.getFilter().Q;

      const rampSpy = vi.spyOn(qParam, 'linearRampToValueAtTime');
      const setValueSpy = vi.spyOn(qParam, 'setValueAtTime');

      filter.setQ(5);

      const rampTime = rampSpy.mock.calls[0][1];
      const anchorTime = setValueSpy.mock.calls[0][1];

      expect(rampTime - anchorTime).toBeCloseTo(0.05, 3);
    });
  });

  describe('Gain Parameter Smoothing (Peaking/Shelf Filters)', () => {
    it('should smooth gain parameter on peaking EQ filter', () => {
      const filter = createPeakingEQFilter(1000, 1, 0);
      const gainParam = filter.getFilter().gain;

      const rampSpy = vi.spyOn(gainParam, 'linearRampToValueAtTime');

      filter.setGain(6); // +6dB boost

      expect(rampSpy).toHaveBeenCalled();
      expect(rampSpy.mock.calls[0][0]).toBe(6);
    });

    it('should smooth gain parameter on shelf filter', () => {
      const filter = createShelfFilter('lowshelf', 200, 0);
      const gainParam = filter.getFilter().gain;

      const rampSpy = vi.spyOn(gainParam, 'linearRampToValueAtTime');

      filter.setGain(-3); // -3dB cut

      expect(rampSpy).toHaveBeenCalled();
      expect(rampSpy.mock.calls[0][0]).toBe(-3);
    });
  });

  describe('Rapid Parameter Changes - Stability Test', () => {
    it('should handle rapid parameter changes without BiquadFilterNode errors', async () => {
      const filter = createLowPassFilter(1000, 1);
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      // Simulate rapid slider dragging (100 changes)
      for (let i = 0; i < 100; i++) {
        filter.setFrequency(200 + i * 10);
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      // Wait for audio processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify no "unstable filter" warnings
      const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('BiquadFilterNode') &&
        call[0]?.toString().includes('unstable')
      );

      expect(unstableWarnings).toHaveLength(0);
    });

    it('should handle rapid Q changes with high resonance', async () => {
      const filter = createLowPassFilter(1000, 1);
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      // Rapidly increase Q to high values (dangerous without smoothing)
      for (let i = 1; i <= 20; i++) {
        filter.setQ(i);
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('unstable')
      );

      expect(unstableWarnings).toHaveLength(0);
    });

    it('should handle simultaneous frequency and Q changes', async () => {
      const filter = createLowPassFilter(1000, 1);
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      // Change both parameters rapidly
      for (let i = 0; i < 50; i++) {
        filter.setFrequency(500 + i * 20);
        filter.setQ(1 + i * 0.2);
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('unstable')
      );

      expect(unstableWarnings).toHaveLength(0);
    });
  });
});

describe('Multi-Pole Filter Cascades', () => {
  describe('Filter Chain Creation', () => {
    it('should create correct number of cascaded filters', () => {
      const multiFilter = createMultiPoleFilter(4, 1000, 1);

      expect(multiFilter.filters).toHaveLength(4);

      // Verify all filters are BiquadFilterNodes
      multiFilter.filters.forEach(f => {
        expect(f.type).toBe('lowpass');
      });
    });

    it('should initialize all filters with same frequency and Q', () => {
      const multiFilter = createMultiPoleFilter(3, 500, 2);

      multiFilter.filters.forEach(f => {
        expect(f.frequency.value).toBe(500);
        expect(f.Q.value).toBe(2);
      });
    });
  });

  describe('Multi-Pole Parameter Updates', () => {
    it('should update frequency on all filters in cascade', () => {
      const multiFilter = createMultiPoleFilter(3, 1000, 1);

      // Spy on each filter's frequency parameter
      const rampSpies = multiFilter.filters.map(f =>
        vi.spyOn(f.frequency, 'linearRampToValueAtTime')
      );

      multiFilter.setFrequency(500);

      // All filters should have received ramp command
      rampSpies.forEach(spy => {
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toBe(500);
      });
    });

    it('should update Q on all filters in cascade', () => {
      const multiFilter = createMultiPoleFilter(3, 1000, 1);

      const rampSpies = multiFilter.filters.map(f =>
        vi.spyOn(f.Q, 'linearRampToValueAtTime')
      );

      multiFilter.setQ(5);

      rampSpies.forEach(spy => {
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toBe(5);
      });
    });

    it('should use 50ms smoothing on all cascaded filters', () => {
      const multiFilter = createMultiPoleFilter(2, 1000, 1);

      const rampSpies = multiFilter.filters.map(f =>
        vi.spyOn(f.frequency, 'linearRampToValueAtTime')
      );
      const setValueSpies = multiFilter.filters.map(f =>
        vi.spyOn(f.frequency, 'setValueAtTime')
      );

      multiFilter.setFrequency(500);

      // Check timing on first filter (all should be same)
      const rampTime = rampSpies[0].mock.calls[0][1];
      const anchorTime = setValueSpies[0].mock.calls[0][1];

      expect(rampTime - anchorTime).toBeCloseTo(0.05, 3);
    });
  });
});

describe('Edge Cases - Boundary Conditions', () => {
  describe('Extreme Frequency Values', () => {
    it('should handle sub-bass frequencies (20 Hz)', () => {
      const filter = createLowPassFilter(20, 1);
      expect(filter.getFrequency()).toBe(20);

      filter.setFrequency(30);
      expect(filter.getFrequency()).toBeCloseTo(20, 1); // Still anchored at 20 initially
    });

    it('should handle ultrasonic frequencies (20 kHz)', () => {
      const filter = createLowPassFilter(20000, 1);
      expect(filter.getFrequency()).toBe(20000);
    });

    it('should handle Nyquist limit frequency', () => {
      const audioContext = getAudioContext();
      const nyquistFreq = audioContext.sampleRate / 2;

      const filter = createLowPassFilter(nyquistFreq, 1);
      expect(filter.getFrequency()).toBe(nyquistFreq);
    });
  });

  describe('Extreme Q Values', () => {
    it('should handle very high Q (resonance) values', () => {
      const filter = createLowPassFilter(1000, 100);
      expect(filter.getQ()).toBe(100);
    });

    it('should handle Q = 0.1 (very low resonance)', () => {
      const filter = createLowPassFilter(1000, 0.1);
      expect(filter.getQ()).toBe(0.1);
    });
  });

  describe('Extreme Gain Values', () => {
    it('should handle +20dB boost on peaking filter', () => {
      const filter = createPeakingEQFilter(1000, 1, 20);
      expect(filter.getFilter().gain.value).toBe(20);
    });

    it('should handle -20dB cut on shelf filter', () => {
      const filter = createShelfFilter('lowshelf', 200, -20);
      expect(filter.getFilter().gain.value).toBe(-20);
    });
  });
});

describe('Filter Connectivity & Cleanup', () => {
  it('should connect filter to destination', () => {
    const audioContext = getAudioContext();
    const filter = createLowPassFilter();

    expect(() => {
      filter.connect(audioContext.destination);
    }).not.toThrow();
  });

  it('should disconnect filter cleanly', () => {
    const audioContext = getAudioContext();
    const filter = createLowPassFilter();

    filter.connect(audioContext.destination);

    expect(() => {
      filter.disconnect();
    }).not.toThrow();
  });

  it('should return filter node for advanced usage', () => {
    const filter = createLowPassFilter();
    const biquadNode = filter.getFilter();

    expect(biquadNode).toBeDefined();
    expect(biquadNode.frequency).toBeDefined();
    expect(biquadNode.Q).toBeDefined();
  });
});
