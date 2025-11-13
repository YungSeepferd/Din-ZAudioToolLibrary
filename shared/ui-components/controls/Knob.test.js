/**
 * Unit Tests: Knob Component Keyboard Accessibility
 * Critical tests for keyboard accessibility fix (Phase 2, Issue #2)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Knob from './Knob.svelte';

describe('Knob Component - Basic Rendering', () => {
  it('should render with default props', () => {
    const { container } = render(Knob);
    const knobElement = container.querySelector('.knob');

    expect(knobElement).toBeTruthy();
  });

  it('should render with custom value and range', () => {
    const { container } = render(Knob, {
      props: {
        value: 75,
        min: 0,
        max: 100
      }
    });

    const knobElement = container.querySelector('.knob');
    expect(knobElement).toBeTruthy();
  });

  it('should display label when provided', () => {
    const { container } = render(Knob, {
      props: {
        label: 'Frequency'
      }
    });

    const labelElement = container.querySelector('label');
    expect(labelElement?.textContent).toBe('Frequency');
  });

  it('should show value when showValue is true', () => {
    const { container } = render(Knob, {
      props: {
        value: 42.5,
        showValue: true
      }
    });

    const valueDisplay = container.querySelector('.value-display');
    expect(valueDisplay?.textContent).toBe('42.5');
  });
});

describe('Knob Component - Mouse Interaction', () => {
  it('should update value on mouse drag up (increase)', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 100,
        step: 1
      }
    });

    const knobElement = container.querySelector('.knob');

    // Simulate drag up
    await fireEvent.mouseDown(knobElement, { clientY: 100 });
    await fireEvent(window, new MouseEvent('mousemove', { clientY: 50 })); // 50px up
    await fireEvent(window, new MouseEvent('mouseup'));

    // Value should increase (dragging up = higher value)
    expect(component.value).toBeGreaterThan(50);
  });

  it('should update value on mouse drag down (decrease)', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 100,
        step: 1
      }
    });

    const knobElement = container.querySelector('.knob');

    // Simulate drag down
    await fireEvent.mouseDown(knobElement, { clientY: 100 });
    await fireEvent(window, new MouseEvent('mousemove', { clientY: 150 })); // 50px down
    await fireEvent(window, new MouseEvent('mouseup'));

    // Value should decrease
    expect(component.value).toBeLessThan(50);
  });

  it('should clamp value to max when dragging beyond limit', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 95,
        min: 0,
        max: 100,
        step: 1
      }
    });

    const knobElement = container.querySelector('.knob');

    // Drag way up (beyond max)
    await fireEvent.mouseDown(knobElement, { clientY: 100 });
    await fireEvent(window, new MouseEvent('mousemove', { clientY: -100 }));
    await fireEvent(window, new MouseEvent('mouseup'));

    // Should be clamped to max
    expect(component.value).toBe(100);
  });

  it('should clamp value to min when dragging below limit', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 5,
        min: 0,
        max: 100,
        step: 1
      }
    });

    const knobElement = container.querySelector('.knob');

    // Drag way down (below min)
    await fireEvent.mouseDown(knobElement, { clientY: 100 });
    await fireEvent(window, new MouseEvent('mousemove', { clientY: 300 }));
    await fireEvent(window, new MouseEvent('mouseup'));

    // Should be clamped to min
    expect(component.value).toBe(0);
  });
});

describe('Knob Component - Mouse Wheel Interaction', () => {
  it('should increment value on wheel scroll up', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 100,
        step: 1
      }
    });

    const knobElement = container.querySelector('.knob');

    // Scroll up (deltaY < 0)
    await fireEvent.wheel(knobElement, { deltaY: -100 });

    expect(component.value).toBe(51);
  });

  it('should decrement value on wheel scroll down', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 100,
        step: 1
      }
    });

    const knobElement = container.querySelector('.knob');

    // Scroll down (deltaY > 0)
    await fireEvent.wheel(knobElement, { deltaY: 100 });

    expect(component.value).toBe(49);
  });

  it('should respect step size on wheel scroll', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 100,
        step: 5
      }
    });

    const knobElement = container.querySelector('.knob');

    await fireEvent.wheel(knobElement, { deltaY: -100 });

    expect(component.value).toBe(55); // Increased by step=5
  });

  it('should prevent default scroll behavior on wheel', async () => {
    const { container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 100
      }
    });

    const knobElement = container.querySelector('.knob');
    const wheelEvent = new WheelEvent('wheel', { deltaY: -100, bubbles: true });
    const preventDefaultSpy = vi.spyOn(wheelEvent, 'preventDefault');

    knobElement.dispatchEvent(wheelEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});

describe('Knob Component - Keyboard Accessibility (CRITICAL TESTS)', () => {
  describe('Arrow Key Navigation', () => {
    it('should increase value on Arrow Up', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'ArrowUp' });

      expect(component.value).toBe(51);
    });

    it('should increase value on Arrow Right', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'ArrowRight' });

      expect(component.value).toBe(51);
    });

    it('should decrease value on Arrow Down', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'ArrowDown' });

      expect(component.value).toBe(49);
    });

    it('should decrease value on Arrow Left', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'ArrowLeft' });

      expect(component.value).toBe(49);
    });

    it('should respect step size with arrow keys', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100,
          step: 5
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'ArrowUp' });

      expect(component.value).toBe(55);

      await fireEvent.keyDown(knobElement, { key: 'ArrowDown' });

      expect(component.value).toBe(50);
    });
  });

  describe('Page Up/Down - Coarse Adjustment', () => {
    it('should increase by 10 steps on Page Up', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'PageUp' });

      expect(component.value).toBe(60); // 50 + (1 * 10)
    });

    it('should decrease by 10 steps on Page Down', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'PageDown' });

      expect(component.value).toBe(40); // 50 - (1 * 10)
    });

    it('should work with non-unit step sizes', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100,
          step: 2
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'PageUp' });

      expect(component.value).toBe(70); // 50 + (2 * 10)
    });
  });

  describe('Home/End Keys - Jump to Extremes', () => {
    it('should jump to minimum value on Home key', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'Home' });

      expect(component.value).toBe(0);
    });

    it('should jump to maximum value on End key', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'End' });

      expect(component.value).toBe(100);
    });

    it('should work with non-zero min values', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 50,
          min: 20,
          max: 100
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'Home' });

      expect(component.value).toBe(20);
    });
  });

  describe('Keyboard Event Prevention', () => {
    it('should prevent default on arrow keys to avoid page scroll', async () => {
      const { container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true
      });
      const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');

      knobElement.dispatchEvent(keyEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent default on Page Up/Down', async () => {
      const { container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      const pageUpEvent = new KeyboardEvent('keydown', {
        key: 'PageUp',
        bubbles: true
      });
      const preventDefaultSpy = vi.spyOn(pageUpEvent, 'preventDefault');

      knobElement.dispatchEvent(pageUpEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not prevent default on unhandled keys', async () => {
      const { container } = render(Knob, {
        props: {
          value: 50,
          min: 0,
          max: 100
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true
      });
      const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault');

      knobElement.dispatchEvent(tabEvent);

      // Tab should not be prevented (for navigation)
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Value Clamping', () => {
    it('should clamp to max when Page Up would exceed', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 95,
          min: 0,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'PageUp' }); // Would go to 105

      expect(component.value).toBe(100); // Clamped to max
    });

    it('should clamp to min when Page Down would go below', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 5,
          min: 0,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'PageDown' }); // Would go to -5

      expect(component.value).toBe(0); // Clamped to min
    });

    it('should clamp to max when Arrow Up at boundary', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 100,
          min: 0,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'ArrowUp' });

      expect(component.value).toBe(100); // Stays at max
    });

    it('should clamp to min when Arrow Down at boundary', async () => {
      const { component, container } = render(Knob, {
        props: {
          value: 0,
          min: 0,
          max: 100,
          step: 1
        }
      });

      const knobElement = container.querySelector('.knob');
      knobElement.focus();

      await fireEvent.keyDown(knobElement, { key: 'ArrowDown' });

      expect(component.value).toBe(0); // Stays at min
    });
  });
});

describe('Knob Component - ARIA Accessibility', () => {
  it('should have role="slider"', () => {
    const { container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 100
      }
    });

    const knobElement = container.querySelector('.knob');
    expect(knobElement.getAttribute('role')).toBe('slider');
  });

  it('should have aria-valuemin attribute', () => {
    const { container } = render(Knob, {
      props: {
        value: 50,
        min: 10,
        max: 100
      }
    });

    const knobElement = container.querySelector('.knob');
    expect(knobElement.getAttribute('aria-valuemin')).toBe('10');
  });

  it('should have aria-valuemax attribute', () => {
    const { container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 90
      }
    });

    const knobElement = container.querySelector('.knob');
    expect(knobElement.getAttribute('aria-valuemax')).toBe('90');
  });

  it('should have aria-valuenow attribute reflecting current value', () => {
    const { container } = render(Knob, {
      props: {
        value: 42,
        min: 0,
        max: 100
      }
    });

    const knobElement = container.querySelector('.knob');
    expect(knobElement.getAttribute('aria-valuenow')).toBe('42');
  });

  it('should have aria-label when label prop is provided', () => {
    const { container } = render(Knob, {
      props: {
        label: 'Volume Control',
        value: 50,
        min: 0,
        max: 100
      }
    });

    const knobElement = container.querySelector('.knob');
    expect(knobElement.getAttribute('aria-label')).toBe('Volume Control');
  });

  it('should be keyboard focusable with tabindex', () => {
    const { container } = render(Knob);

    const knobElement = container.querySelector('.knob');
    expect(knobElement.getAttribute('tabindex')).toBe('0');
  });
});

describe('Knob Component - Visual Rotation', () => {
  it('should apply rotation transform based on value', () => {
    const { container } = render(Knob, {
      props: {
        value: 0,
        min: 0,
        max: 100
      }
    });

    const knobElement = container.querySelector('.knob');
    const transform = knobElement.style.transform;

    // Should have rotate() in transform
    expect(transform).toContain('rotate');
  });

  it('should update rotation when value changes', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 0,
        min: 0,
        max: 100
      }
    });

    const knobElement = container.querySelector('.knob');
    const initialTransform = knobElement.style.transform;

    // Change value via keyboard
    knobElement.focus();
    await fireEvent.keyDown(knobElement, { key: 'End' }); // Jump to max

    // Wait for Svelte to update DOM
    await new Promise(resolve => setTimeout(resolve, 100));

    const newTransform = knobElement.style.transform;
    expect(newTransform).not.toBe(initialTransform);
  });
});

describe('Knob Component - Edge Cases', () => {
  it('should handle fractional step sizes', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 100,
        step: 0.1
      }
    });

    const knobElement = container.querySelector('.knob');
    knobElement.focus();

    await fireEvent.keyDown(knobElement, { key: 'ArrowUp' });

    expect(component.value).toBeCloseTo(50.1, 1);
  });

  it('should handle negative value ranges', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 0,
        min: -50,
        max: 50,
        step: 1
      }
    });

    const knobElement = container.querySelector('.knob');
    knobElement.focus();

    await fireEvent.keyDown(knobElement, { key: 'Home' });
    expect(component.value).toBe(-50);

    await fireEvent.keyDown(knobElement, { key: 'End' });
    expect(component.value).toBe(50);
  });

  it('should handle very large value ranges', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 10000,
        min: 0,
        max: 20000,
        step: 10
      }
    });

    const knobElement = container.querySelector('.knob');
    knobElement.focus();

    await fireEvent.keyDown(knobElement, { key: 'PageUp' });

    expect(component.value).toBe(10100); // 10000 + (10 * 10)
  });

  it('should handle rapid keyboard input without lag', async () => {
    const { component, container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 100,
        step: 1
      }
    });

    const knobElement = container.querySelector('.knob');
    knobElement.focus();

    const startTime = performance.now();

    // Rapid arrow key presses
    for (let i = 0; i < 20; i++) {
      await fireEvent.keyDown(knobElement, { key: 'ArrowUp' });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(component.value).toBe(70); // 50 + 20
    expect(duration).toBeLessThan(1000); // Should complete quickly
  });
});
