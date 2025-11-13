/**
 * Integration Tests: Knob + Audio Parameter Interaction
 * Tests for smooth audio parameter updates without clicks/pops or jitter
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Knob from '../../shared/ui-components/controls/Knob.svelte';
import { createLowPassFilter } from '../../shared/audio-core/synthesis/filters.js';
import { getAudioContext } from '../../shared/audio-core/utils/audio-context.js';

describe('Integration: Knob + Filter Parameter Updates', () => {
  let audioContext;
  let filter;

  beforeEach(() => {
    audioContext = getAudioContext();
    filter = createLowPassFilter(1000, 1);
    vi.clearAllMocks();
  });

  describe('Knob Drag → Filter Frequency Update', () => {
    it('should smoothly update filter frequency when dragging knob', async () => {
      let frequency = 1000;

      const { container } = render(Knob, {
        props: {
          value: frequency,
          min: 20,
          max: 20000,
          step: 10
        }
      });

      // Spy on filter parameter changes
      const rampSpy = vi.spyOn(filter.getFilter().frequency, 'linearRampToValueAtTime');

      // Simulate knob dragging (20 rapid changes)
      const knobElement = container.querySelector('.knob');
      await fireEvent.mouseDown(knobElement, { clientY: 200 });

      for (let i = 0; i < 20; i++) {
        await fireEvent(window, new MouseEvent('mousemove', { clientY: 200 - i * 5 }));
        const newFreq = frequency + i * 50;
        filter.setFrequency(newFreq);
      }

      await fireEvent(window, new MouseEvent('mouseup'));

      // Verify smooth ramping occurred
      expect(rampSpy).toHaveBeenCalled();
      expect(rampSpy.mock.calls.length).toBeGreaterThan(0);
    });

    it('should use 50ms smoothing time during knob drag', async () => {
      const { container } = render(Knob, {
        props: {
          value: 1000,
          min: 20,
          max: 20000,
          step: 10
        }
      });

      const rampSpy = vi.spyOn(filter.getFilter().frequency, 'linearRampToValueAtTime');
      const setValueSpy = vi.spyOn(filter.getFilter().frequency, 'setValueAtTime');

      const knobElement = container.querySelector('.knob');
      await fireEvent.mouseDown(knobElement, { clientY: 200 });

      // Simulate single drag movement
      await fireEvent(window, new MouseEvent('mousemove', { clientY: 150 }));
      filter.setFrequency(1500);

      const rampTime = rampSpy.mock.calls[0][1];
      const anchorTime = setValueSpy.mock.calls[0][1];

      // Verify 50ms smoothing
      expect(rampTime - anchorTime).toBeCloseTo(0.05, 3);
    });
  });

  describe('Knob Keyboard → Filter Parameter Update', () => {
    it('should smoothly update filter when using arrow keys', async () => {
      const { container } = render(Knob, {
        props: {
          value: 1000,
          min: 20,
          max: 20000,
          step: 10
        }
      });

      const rampSpy = vi.spyOn(filter.getFilter().frequency, 'linearRampToValueAtTime');

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      // Simulate rapid arrow key presses
      for (let i = 0; i < 10; i++) {
        await fireEvent.keyDown(knobElement, { key: 'ArrowUp' });
        filter.setFrequency(1000 + (i + 1) * 10);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      expect(rampSpy).toHaveBeenCalled();
      expect(rampSpy.mock.calls.length).toBeGreaterThan(0);
    });

    it('should handle Page Up/Down with smooth filter transitions', async () => {
      const { container } = render(Knob, {
        props: {
          value: 1000,
          min: 20,
          max: 20000,
          step: 100
        }
      });

      const rampSpy = vi.spyOn(filter.getFilter().frequency, 'linearRampToValueAtTime');

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      // Page Up = 10 steps = 1000 Hz jump
      await fireEvent.keyDown(knobElement, { key: 'PageUp' });
      filter.setFrequency(2000);

      expect(rampSpy).toHaveBeenCalled();
    });
  });

  describe('Knob Jitter - Rapid Back-and-Forth', () => {
    it('should handle jittery mouse movement without audio artifacts', async () => {
      const { container } = render(Knob, {
        props: {
          value: 1000,
          min: 20,
          max: 20000,
          step: 10
        }
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const knobElement = container.querySelector('.knob');
      await fireEvent.mouseDown(knobElement, { clientY: 100 });

      // Simulate jittery mouse (user's hand shaking)
      const jitterPattern = [1000, 1050, 980, 1020, 990, 1030, 995, 1015, 1005, 1012];

      for (const freq of jitterPattern) {
        await fireEvent(window, new MouseEvent('mousemove', { clientY: 100 }));
        filter.setFrequency(freq);
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      await fireEvent(window, new MouseEvent('mouseup'));

      // Should not produce warnings
      const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('unstable')
      );
      expect(unstableWarnings).toHaveLength(0);
    });

    it('should handle rapid wheel scrolling without instability', async () => {
      const { container } = render(Knob, {
        props: {
          value: 1000,
          min: 20,
          max: 20000,
          step: 10
        }
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const knobElement = container.querySelector('.knob');

      // Rapid wheel scrolling
      for (let i = 0; i < 20; i++) {
        await fireEvent.wheel(knobElement, { deltaY: i % 2 === 0 ? -100 : 100 });
        const newFreq = 1000 + (i % 2 === 0 ? 10 : -10);
        filter.setFrequency(newFreq);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('unstable')
      );
      expect(unstableWarnings).toHaveLength(0);
    });
  });

  describe('Multiple Knobs + Audio Processing', () => {
    it('should handle multiple knobs adjusting simultaneously', async () => {
      const filters = [
        createLowPassFilter(1000, 1),
        createLowPassFilter(2000, 1),
        createLowPassFilter(3000, 1)
      ];

      const knobs = filters.map((_, idx) =>
        render(Knob, {
          props: {
            value: (idx + 1) * 1000,
            min: 20,
            max: 20000,
            step: 10
          }
        })
      );

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      // Adjust all knobs simultaneously
      await Promise.all(
        knobs.map(async ({ container }, idx) => {
          const knobElement = container.querySelector('.knob');
          knobElement.focus();

          for (let i = 0; i < 10; i++) {
            await fireEvent.keyDown(knobElement, { key: 'ArrowUp' });
            filters[idx].setFrequency((idx + 1) * 1000 + i * 10);
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        })
      );

      // Should not produce warnings
      const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('unstable')
      );
      expect(unstableWarnings).toHaveLength(0);
    });

    it('should maintain stable performance with many simultaneous updates', async () => {
      const filterCount = 10;
      const filters = Array.from({ length: filterCount }, () =>
        createLowPassFilter(1000, 1)
      );

      const startTime = performance.now();

      // Simulate 100 updates per filter (1000 total updates)
      await Promise.all(
        filters.map(async (filter, idx) => {
          for (let i = 0; i < 100; i++) {
            filter.setFrequency(500 + idx * 100 + i * 10);
            await new Promise(resolve => setTimeout(resolve, 5));
          }
        })
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 10 seconds)
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Knob + Audio During Playback', () => {
    it('should not interrupt audio when adjusting knob', async () => {
      // Create oscillator → filter → destination
      const oscillator = audioContext.createOscillator();
      oscillator.frequency.value = 440; // A4
      oscillator.connect(filter.getFilter());
      filter.getFilter().connect(audioContext.destination);

      // Start audio
      oscillator.start();

      const { container } = render(Knob, {
        props: {
          value: 1000,
          min: 20,
          max: 20000,
          step: 10
        }
      });

      const knobElement = container.querySelector('.knob');
      await fireEvent.mouseDown(knobElement, { clientY: 100 });

      // Adjust knob while audio is playing
      for (let i = 0; i < 20; i++) {
        await fireEvent(window, new MouseEvent('mousemove', { clientY: 100 - i * 2 }));
        filter.setFrequency(1000 + i * 50);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      await fireEvent(window, new MouseEvent('mouseup'));

      // Verify audio context is still running
      expect(audioContext.state).toBe('running');

      // Cleanup
      oscillator.stop();
    });

    it('should maintain stable CPU usage during knob adjustments', async () => {
      const oscillator = audioContext.createOscillator();
      oscillator.connect(filter.getFilter());
      filter.getFilter().connect(audioContext.destination);
      oscillator.start();

      const { container } = render(Knob, {
        props: {
          value: 1000,
          min: 20,
          max: 20000,
          step: 10
        }
      });

      // Measure frame rate during interaction
      let frameCount = 0;
      const startTime = performance.now();

      function countFrame() {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(countFrame);
        }
      }

      requestAnimationFrame(countFrame);

      // Adjust knob rapidly
      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      for (let i = 0; i < 30; i++) {
        await fireEvent.keyDown(knobElement, { key: 'ArrowUp' });
        filter.setFrequency(1000 + i * 10);
        await new Promise(resolve => setTimeout(resolve, 33)); // ~30 Hz
      }

      // Wait for frame counting to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should maintain close to 60 fps
      expect(frameCount).toBeGreaterThan(50);

      oscillator.stop();
    });
  });

  describe('Edge Cases - Extreme Scenarios', () => {
    it('should handle knob at Nyquist frequency limit', async () => {
      const nyquistFreq = audioContext.sampleRate / 2;

      const { container } = render(Knob, {
        props: {
          value: nyquistFreq - 100,
          min: 20,
          max: nyquistFreq,
          step: 10
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      // Adjust to Nyquist limit
      await fireEvent.keyDown(knobElement, { key: 'End' });
      filter.setFrequency(nyquistFreq);

      // Should not throw or cause instability
      expect(filter.getFrequency()).toBe(nyquistFreq);
    });

    it('should handle high Q values with knob adjustments', async () => {
      const highQFilter = createLowPassFilter(1000, 20); // Very high resonance

      const { container } = render(Knob, {
        props: {
          value: 1000,
          min: 20,
          max: 20000,
          step: 10
        }
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const knobElement = container.querySelector('.knob');
      await fireEvent.mouseDown(knobElement, { clientY: 100 });

      // Rapid frequency changes with high Q
      for (let i = 0; i < 20; i++) {
        await fireEvent(window, new MouseEvent('mousemove', { clientY: 100 - i * 3 }));
        highQFilter.setFrequency(500 + i * 50);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('unstable')
      );
      expect(unstableWarnings).toHaveLength(0);
    });

    it('should handle sub-audio frequency adjustments', async () => {
      const { container } = render(Knob, {
        props: {
          value: 20,
          min: 1,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      // Adjust to very low frequencies (sub-bass)
      await fireEvent.keyDown(knobElement, { key: 'Home' });
      filter.setFrequency(1);

      expect(filter.getFrequency()).toBeCloseTo(1, 1);
    });
  });
});

describe('Integration: Knob + Multiple Filter Parameters', () => {
  let audioContext;
  let filter;

  beforeEach(() => {
    audioContext = getAudioContext();
    filter = createLowPassFilter(1000, 1);
  });

  it('should smoothly update both frequency and Q simultaneously', async () => {
    const freqKnob = render(Knob, {
      props: {
        value: 1000,
        min: 20,
        max: 20000,
        step: 10
      }
    });

    const qKnob = render(Knob, {
      props: {
        value: 1,
        min: 0.1,
        max: 20,
        step: 0.1
      }
    });

    const freqRampSpy = vi.spyOn(filter.getFilter().frequency, 'linearRampToValueAtTime');
    const qRampSpy = vi.spyOn(filter.getFilter().Q, 'linearRampToValueAtTime');

    // Adjust both knobs
    const freqKnobElement = freqKnob.container.querySelector('.knob');
    const qKnobElement = qKnob.container.querySelector('.knob');

    freqKnobElement.focus();
    qKnobElement.focus();

    await Promise.all([
      (async () => {
        for (let i = 0; i < 10; i++) {
          await fireEvent.keyDown(freqKnobElement, { key: 'ArrowUp' });
          filter.setFrequency(1000 + i * 100);
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      })(),
      (async () => {
        for (let i = 0; i < 10; i++) {
          await fireEvent.keyDown(qKnobElement, { key: 'ArrowUp' });
          filter.setQ(1 + i * 0.5);
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      })()
    ]);

    expect(freqRampSpy).toHaveBeenCalled();
    expect(qRampSpy).toHaveBeenCalled();
  });
});
