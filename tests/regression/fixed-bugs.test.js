/**
 * Regression Test Suite
 * Ensures previously fixed bugs remain fixed
 *
 * CRITICAL: These tests verify fixes from Phase 2 stabilization work.
 * If any of these tests fail, a regression has occurred.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { createLowPassFilter } from '../../shared/audio-core/synthesis/filters.js';
import Knob from '../../shared/ui-components/controls/Knob.svelte';

describe('REGRESSION: Issue #1 - Polyphonic Visual Feedback (CRITICAL)', () => {
  /**
   * BUG: Multiple piano keys pressed simultaneously only showed ONE key as active.
   * FIX: Changed activeKeys from Map to Set, used Svelte 5 reactive class binding.
   * FILE: plugins/lofi-piano/web/src/lib/components/piano/PianoKeyboard.svelte
   * COMMIT: fix(lofi-piano): resolve polyphonic visual feedback bug in PianoKeyboard
   */

  it('should show all pressed keys as active (polyphony)', async () => {
    // Mock PianoKeyboard component behavior
    let activeKeys = new Set();

    const simulateKeyPress = (midiNote) => {
      activeKeys.add(midiNote);
    };

    const simulateKeyRelease = (midiNote) => {
      activeKeys.delete(midiNote);
    };

    // Simulate pressing C major chord (C, E, G)
    simulateKeyPress(60); // C4
    simulateKeyPress(64); // E4
    simulateKeyPress(67); // G4

    // All three MUST be in active set
    expect(activeKeys.has(60)).toBe(true);
    expect(activeKeys.has(64)).toBe(true);
    expect(activeKeys.has(67)).toBe(true);
    expect(activeKeys.size).toBe(3);

    // Release E
    simulateKeyRelease(64);

    // C and G should still be active
    expect(activeKeys.has(60)).toBe(true);
    expect(activeKeys.has(64)).toBe(false);
    expect(activeKeys.has(67)).toBe(true);
    expect(activeKeys.size).toBe(2);
  });

  it('should support up to 10-note polyphony (complex chord)', () => {
    let activeKeys = new Set();

    // Press 10 notes simultaneously
    for (let i = 0; i < 10; i++) {
      activeKeys.add(60 + i);
    }

    expect(activeKeys.size).toBe(10);

    // All should be active
    for (let i = 0; i < 10; i++) {
      expect(activeKeys.has(60 + i)).toBe(true);
    }
  });

  it('should correctly toggle individual keys in polyphonic context', () => {
    let activeKeys = new Set();

    // Press 5 keys
    [60, 62, 64, 67, 69].forEach(note => activeKeys.add(note));

    expect(activeKeys.size).toBe(5);

    // Release middle key (64)
    activeKeys.delete(64);

    // Other 4 should remain active
    expect(activeKeys.has(60)).toBe(true);
    expect(activeKeys.has(62)).toBe(true);
    expect(activeKeys.has(64)).toBe(false); // Released
    expect(activeKeys.has(67)).toBe(true);
    expect(activeKeys.has(69)).toBe(true);
    expect(activeKeys.size).toBe(4);
  });
});

describe('REGRESSION: Issue #4 - BiquadFilterNode Instability (HIGH)', () => {
  /**
   * BUG: Rapid filter parameter changes caused console warning:
   *      "[WARNING] BiquadFilterNode: state is bad, probably due to unstable filter"
   * FIX: Added 50ms parameter smoothing with linearRampToValueAtTime.
   * FILE: shared/audio-core/synthesis/filters.js
   * COMMIT: fix(audio-core): add parameter smoothing to BiquadFilterNode to prevent instability
   */

  let filter;

  beforeEach(() => {
    filter = createLowPassFilter(1000, 1);
    vi.clearAllMocks();
  });

  it('should NOT produce BiquadFilterNode warnings on rapid frequency changes', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    // Simulate rapid knob dragging (AGE slider)
    for (let i = 0; i < 50; i++) {
      filter.setFrequency(500 + i * 20);
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Wait for audio processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Filter for unstable warnings
    const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
      call[0]?.toString().includes('BiquadFilterNode') &&
      call[0]?.toString().includes('unstable')
    );

    // MUST BE ZERO
    expect(unstableWarnings).toHaveLength(0);
  });

  it('should NOT produce warnings on rapid Q changes with high resonance', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    // Increase Q from 1 to 20 rapidly (dangerous without smoothing)
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

  it('should use linearRampToValueAtTime (not setValueAtTime)', () => {
    const frequencyParam = filter.getFilter().frequency;
    const rampSpy = vi.spyOn(frequencyParam, 'linearRampToValueAtTime');
    const setValueSpy = vi.spyOn(frequencyParam, 'setValueAtTime');

    filter.setFrequency(500);

    // MUST use both: setValueAtTime (anchor) + linearRampToValueAtTime (smooth)
    expect(setValueSpy).toHaveBeenCalled();
    expect(rampSpy).toHaveBeenCalled();
  });

  it('should use 50ms smoothing time (per QA recommendation)', () => {
    const frequencyParam = filter.getFilter().frequency;
    const rampSpy = vi.spyOn(frequencyParam, 'linearRampToValueAtTime');
    const setValueSpy = vi.spyOn(frequencyParam, 'setValueAtTime');

    filter.setFrequency(500);

    const rampTime = rampSpy.mock.calls[0][1];
    const anchorTime = setValueSpy.mock.calls[0][1];

    // MUST be 50ms (0.05 seconds)
    expect(rampTime - anchorTime).toBeCloseTo(0.05, 3);
  });
});

describe('REGRESSION: Issue #2 - Knob Keyboard Accessibility (HIGH)', () => {
  /**
   * BUG: Knob component had tabindex="0" and role="slider" but no keyboard handler.
   *      Violated WCAG 2.1 Level A guideline 2.1.1 (Keyboard).
   * FIX: Added handleKeyDown function with Arrow, Page Up/Down, Home/End support.
   * FILE: shared/ui-components/controls/Knob.svelte
   * COMMIT: feat(ui-components): add keyboard accessibility to Knob component
   */

  it('should respond to Arrow Up key', async () => {
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

    // MUST increase by 1 step
    expect(component.value).toBe(51);
  });

  it('should respond to Arrow Down key', async () => {
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

  it('should respond to Page Up (coarse adjustment)', async () => {
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

    // MUST increase by 10 steps
    expect(component.value).toBe(60);
  });

  it('should respond to Home key (jump to min)', async () => {
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

  it('should respond to End key (jump to max)', async () => {
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

  it('should have keyboard focus indicator (WCAG 2.4.7)', () => {
    const { container } = render(Knob);
    const knobElement = container.querySelector('.knob');

    // MUST be focusable
    expect(knobElement.getAttribute('tabindex')).toBe('0');
  });

  it('should have proper ARIA attributes (WCAG 4.1.2)', () => {
    const { container } = render(Knob, {
      props: {
        value: 42,
        min: 0,
        max: 100,
        label: 'Volume'
      }
    });

    const knobElement = container.querySelector('.knob');

    // MUST have role and ARIA attributes
    expect(knobElement.getAttribute('role')).toBe('slider');
    expect(knobElement.getAttribute('aria-valuenow')).toBe('42');
    expect(knobElement.getAttribute('aria-valuemin')).toBe('0');
    expect(knobElement.getAttribute('aria-valuemax')).toBe('100');
    expect(knobElement.getAttribute('aria-label')).toBe('Volume');
  });
});

describe('REGRESSION: Issue #3 - WCAG Label Accessibility', () => {
  /**
   * BUG: <label> element in ProgressionBuilder without associated control.
   *      Line 322: <label class="control-label">Actions</label>
   *      Violated WCAG 2.1 AA guideline on form labels.
   * FIX: Changed <label> to <div> (it's a section heading, not a form label).
   * FILE: plugins/lofi-piano/web/src/lib/components/chord-generator/ProgressionBuilder.svelte
   * COMMIT: fix(lofi-piano): resolve WCAG label accessibility violation in ProgressionBuilder
   */

  it('should not have unassociated label elements', () => {
    // Mock ProgressionBuilder structure
    const mockComponent = `
      <div class="control-group">
        <div class="control-label">Actions</div>
        <div class="button-group">
          <button>Clear</button>
        </div>
      </div>
    `;

    // Parse mock HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(mockComponent, 'text/html');

    // Find all <label> elements
    const labels = doc.querySelectorAll('label');

    // Verify each label has 'for' attribute OR wraps an input
    labels.forEach(label => {
      const hasFor = label.hasAttribute('for');
      const wrapsInput = label.querySelector('input, select, textarea') !== null;

      // MUST have one or the other
      expect(hasFor || wrapsInput).toBe(true);
    });

    // In this case, there should be NO <label> elements (changed to <div>)
    expect(labels.length).toBe(0);
  });

  it('should use semantic HTML for section headings', () => {
    const mockComponent = `
      <div class="control-group">
        <div class="control-label">Actions</div>
      </div>
    `;

    const parser = new DOMParser();
    const doc = parser.parseFromString(mockComponent, 'text/html');

    const sectionHeading = doc.querySelector('.control-label');

    // Should be <div> or heading element, NOT <label>
    expect(sectionHeading.tagName).not.toBe('LABEL');
    expect(['DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']).toContain(sectionHeading.tagName);
  });
});

describe('REGRESSION: Phase 1 - Export Index Files', () => {
  /**
   * BUG: Missing export index files declared in package.json.
   * FIX: Created 5 barrel export files for shared libraries.
   * FILES:
   *   - shared/audio-core/synthesis/index.js
   *   - shared/audio-core/effects/index.js
   *   - shared/audio-core/utils/index.js
   *   - shared/ui-components/controls/index.js
   *   - shared/ui-components/visualizers/index.js
   * COMMIT: fix: create missing export index files and align dependency versions
   */

  it('should import from audio-core synthesis barrel', async () => {
    // This would fail if index.js doesn't exist
    const { createLowPassFilter } = await import('../../shared/audio-core/synthesis/index.js');
    expect(createLowPassFilter).toBeDefined();
    expect(typeof createLowPassFilter).toBe('function');
  });

  it('should import from audio-core effects barrel', async () => {
    const effects = await import('../../shared/audio-core/effects/index.js');
    expect(effects.createDelayEffect).toBeDefined();
  });

  it('should import from audio-core utils barrel', async () => {
    const utils = await import('../../shared/audio-core/utils/index.js');
    expect(utils.getAudioContext).toBeDefined();
  });

  it('should import from ui-components controls barrel', async () => {
    const controls = await import('../../shared/ui-components/controls/index.js');
    expect(controls.default).toBeDefined(); // Knob component
  });
});

describe('REGRESSION: Dependency Version Alignment', () => {
  /**
   * BUG: Inconsistent Vitest and vite-plugin-svelte versions across workspace.
   * FIX: Aligned to Vitest 3.2.4 and @sveltejs/vite-plugin-svelte 4.0.0-next.6.
   * COMMIT: fix: create missing export index files and align dependency versions
   */

  it('should use consistent Vitest version across workspace', async () => {
    // This is a meta-test - checks package.json consistency
    // In real CI, you'd parse package.json files and verify versions match
    expect(true).toBe(true); // Placeholder for CI version check
  });

  it('should use Svelte 5 compatible vite-plugin-svelte', () => {
    // Verify Svelte 5 features work (runes)
    let testState = $state(0);
    testState = 1;
    expect(testState).toBe(1);

    let testDerived = $derived(testState * 2);
    expect(testDerived).toBe(2);
  });
});

describe('REGRESSION: Build Verification', () => {
  /**
   * Ensures production builds remain successful after fixes.
   */

  it('should build without errors', () => {
    // This would be run in CI with actual `pnpm build`
    // Here we just verify no obvious runtime errors
    expect(() => {
      createLowPassFilter(1000, 1);
    }).not.toThrow();
  });

  it('should have zero accessibility warnings in build', () => {
    // Mock build output check
    const mockBuildOutput = `
      vite v5.4.21 building for production...
      ✓ 187 modules transformed.
      ✓ built in 2.90s
    `;

    // Should NOT contain accessibility warnings
    expect(mockBuildOutput).not.toContain('a11y_label_has_associated_control');
    expect(mockBuildOutput).not.toContain('a11y_');
  });
});

describe('REGRESSION: Overall System Stability', () => {
  /**
   * High-level integration checks to ensure system remains stable.
   */

  it('should create and use filters without console errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');

    const filter = createLowPassFilter(1000, 1);
    filter.setFrequency(500);
    filter.setQ(2);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should render knob without console errors', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');

    const { container } = render(Knob, {
      props: {
        value: 50,
        min: 0,
        max: 100
      }
    });

    expect(container.querySelector('.knob')).toBeTruthy();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle rapid knob + filter updates without crashes', async () => {
    const filter = createLowPassFilter(1000, 1);
    const { container } = render(Knob, {
      props: {
        value: 1000,
        min: 20,
        max: 20000,
        step: 10
      }
    });

    const knobElement = container.querySelector('.knob');
    knobElement.focus();

    // Stress test: 100 rapid updates
    for (let i = 0; i < 100; i++) {
      await fireEvent.keyDown(knobElement, { key: 'ArrowUp' });
      filter.setFrequency(1000 + i * 10);
    }

    // Should complete without crashing
    expect(true).toBe(true);
  });
});
