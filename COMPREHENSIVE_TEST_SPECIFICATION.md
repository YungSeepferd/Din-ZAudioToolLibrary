# Comprehensive Test Specification
## Din-ZAudioToolLibrary - Stabilization & Deployment Testing

**Version**: 1.0.0
**Date**: 2025-01-13
**Purpose**: Validate plugins for stable production deployment
**Scope**: All shared libraries and both plugins (lofi-piano, _template)

---

## Table of Contents

1. [Test Strategy Overview](#test-strategy-overview)
2. [Unit Tests - Shared Audio Core](#unit-tests-shared-audio-core)
3. [Unit Tests - UI Components](#unit-tests-ui-components)
4. [Integration Tests - Audio-UI Interaction](#integration-tests-audio-ui-interaction)
5. [E2E Tests - Critical User Flows](#e2e-tests-critical-user-flows)
6. [Edge Case & Stress Tests](#edge-case-stress-tests)
7. [Performance & Memory Tests](#performance-memory-tests)
8. [Accessibility Compliance Tests](#accessibility-compliance-tests)
9. [Browser Compatibility Tests](#browser-compatibility-tests)
10. [Regression Test Suite](#regression-test-suite)

---

## Test Strategy Overview

### Testing Pyramid

```
         /\
        /  \  E2E Tests (10%)
       /    \  - Critical user flows
      /------\  - Cross-browser validation
     /        \
    / Integr.  \ Integration Tests (30%)
   /   Tests    \  - Audio-UI interaction
  /--------------\  - Parameter smoothing
 /                \
/  Unit Tests (60%) \ Unit Tests
\____________________/  - Filters, oscillators
                        - UI components (isolated)
```

### Test Environments

- **Local Development**: Vitest (unit/integration)
- **E2E Testing**: Playwright (multi-browser)
- **CI/CD Pipeline**: GitHub Actions (automated)
- **Manual QA**: Real devices (iOS Safari, Android Chrome)

### Success Criteria

- ✅ 95%+ code coverage on shared libraries
- ✅ Zero critical bugs in production code
- ✅ All accessibility tests pass (WCAG 2.1 AA)
- ✅ Performance benchmarks met (see Performance section)
- ✅ Cross-browser compatibility verified

---

## Unit Tests - Shared Audio Core

### Test Suite: `shared/audio-core/synthesis/filters.js`

#### Test Group 1: Filter Creation & Initialization

**Test Case 1.1: createLowPassFilter - Default Parameters**
```javascript
describe('createLowPassFilter', () => {
  it('should create filter with default frequency=1000 and q=1', () => {
    const filter = createLowPassFilter();
    expect(filter.getFrequency()).toBe(1000);
    expect(filter.getQ()).toBe(1);
    expect(filter.getFilter().type).toBe('lowpass');
  });
});
```

**Test Case 1.2: createLowPassFilter - Custom Parameters**
```javascript
it('should accept custom frequency and Q values', () => {
  const filter = createLowPassFilter(500, 2.5);
  expect(filter.getFrequency()).toBe(500);
  expect(filter.getQ()).toBe(2.5);
});
```

**Test Case 1.3: Filter Types - All Variants**
```javascript
it('should create all filter types correctly', () => {
  expect(createLowPassFilter().getFilter().type).toBe('lowpass');
  expect(createHighPassFilter().getFilter().type).toBe('highpass');
  expect(createBandPassFilter().getFilter().type).toBe('bandpass');
  expect(createPeakingEQFilter().getFilter().type).toBe('peaking');
});
```

#### Test Group 2: Parameter Smoothing (CRITICAL)

**Test Case 2.1: Frequency Smoothing - No Instant Jumps**
```javascript
it('should use linearRampToValueAtTime for frequency changes', async () => {
  const filter = createLowPassFilter(1000, 1);
  const audioContext = getAudioContext();

  // Mock AudioParam to spy on method calls
  const frequencyParam = filter.getFilter().frequency;
  const setValueSpy = vi.spyOn(frequencyParam, 'setValueAtTime');
  const rampSpy = vi.spyOn(frequencyParam, 'linearRampToValueAtTime');

  filter.setFrequency(500);

  // Verify smooth transition pattern
  expect(setValueSpy).toHaveBeenCalledWith(1000, expect.any(Number)); // Anchor current value
  expect(rampSpy).toHaveBeenCalledWith(500, expect.any(Number)); // Ramp to new value

  // Verify 50ms smoothing time
  const rampTime = rampSpy.mock.calls[0][1];
  const anchorTime = setValueSpy.mock.calls[0][1];
  expect(rampTime - anchorTime).toBeCloseTo(0.05, 3); // 50ms = 0.05s
});
```

**Test Case 2.2: Q Parameter Smoothing**
```javascript
it('should smooth Q parameter changes to prevent filter instability', () => {
  const filter = createLowPassFilter(1000, 1);
  const qParam = filter.getFilter().Q;
  const rampSpy = vi.spyOn(qParam, 'linearRampToValueAtTime');

  filter.setQ(10); // High Q (resonance)

  expect(rampSpy).toHaveBeenCalled();
  expect(rampSpy.mock.calls[0][0]).toBe(10); // Target Q value
});
```

**Test Case 2.3: Rapid Parameter Changes - No BiquadFilterNode Errors**
```javascript
it('should handle rapid parameter changes without instability warnings', async () => {
  const filter = createLowPassFilter(1000, 1);
  const consoleWarnSpy = vi.spyOn(console, 'warn');

  // Simulate rapid slider dragging (100 changes in 1 second)
  for (let i = 0; i < 100; i++) {
    filter.setFrequency(200 + i * 10);
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Verify no "unstable filter" warnings
  const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
    call[0]?.includes('BiquadFilterNode') && call[0]?.includes('unstable')
  );
  expect(unstableWarnings).toHaveLength(0);
});
```

#### Test Group 3: Multi-Pole Filter Cascades

**Test Case 3.1: Multi-Pole Filter - Correct Chain**
```javascript
it('should cascade filters correctly for multi-pole filter', () => {
  const multiFilter = createMultiPoleFilter(4, 1000, 1); // 4-pole = 4 filters
  expect(multiFilter.filters).toHaveLength(4);

  // Verify all filters have same frequency/Q
  multiFilter.filters.forEach(f => {
    expect(f.frequency.value).toBe(1000);
    expect(f.Q.value).toBe(1);
  });
});
```

**Test Case 3.2: Multi-Pole Frequency - All Filters Update**
```javascript
it('should update all filters in cascade when setFrequency is called', () => {
  const multiFilter = createMultiPoleFilter(3, 1000, 1);

  multiFilter.setFrequency(500);

  // All 3 filters should ramp to new frequency
  multiFilter.filters.forEach(f => {
    const rampCalls = vi.spyOn(f.frequency, 'linearRampToValueAtTime').mock.calls;
    expect(rampCalls.length).toBeGreaterThan(0);
    expect(rampCalls[0][0]).toBe(500);
  });
});
```

### Test Suite: `shared/audio-core/synthesis/oscillators.js`

**Test Case 4.1: Oscillator Creation - Valid Waveforms**
```javascript
it('should create oscillators with all waveform types', () => {
  const waveforms = ['sine', 'square', 'sawtooth', 'triangle'];

  waveforms.forEach(waveform => {
    const osc = createOscillator(waveform, 440);
    expect(osc.type).toBe(waveform);
    expect(osc.frequency.value).toBe(440);
  });
});
```

**Test Case 4.2: Oscillator Frequency Range - Edge Cases**
```javascript
it('should handle extreme frequency values', () => {
  const minFreq = createOscillator('sine', 20); // Sub-bass
  const maxFreq = createOscillator('sine', 20000); // Upper hearing limit

  expect(minFreq.frequency.value).toBe(20);
  expect(maxFreq.frequency.value).toBe(20000);
});
```

### Test Suite: `shared/audio-core/synthesis/envelopes.js`

**Test Case 5.1: ADSR Envelope - Timing Accuracy**
```javascript
it('should schedule ADSR stages at correct times', () => {
  const envelope = createADSREnvelope({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.7,
    release: 0.5
  });

  const gainNode = getAudioContext().createGain();
  const now = getAudioContext().currentTime;

  envelope.trigger(gainNode, now);

  // Verify scheduling points
  // Attack: 0 → 1 over 0.1s
  // Decay: 1 → 0.7 over 0.2s (starting at 0.1s)
  // Sustain: hold at 0.7
  expect(gainNode.gain.value).toBe(0); // Start at 0
  // Further assertions would check scheduled values
});
```

---

## Unit Tests - UI Components

### Test Suite: `shared/ui-components/controls/Knob.svelte`

#### Test Group 6: Knob Interaction

**Test Case 6.1: Mouse Drag - Value Change**
```javascript
import { render, fireEvent } from '@testing-library/svelte';
import Knob from '@ui/controls/Knob.svelte';

it('should update value on mouse drag', async () => {
  const { component, container } = render(Knob, {
    value: 50,
    min: 0,
    max: 100
  });

  const knobElement = container.querySelector('.knob');

  // Simulate drag up (increase value)
  await fireEvent.mouseDown(knobElement, { clientY: 100 });
  await fireEvent.mouseMove(window, { clientY: 50 }); // 50px up
  await fireEvent.mouseUp(window);

  // Value should increase (dragging up = higher value)
  expect(component.value).toBeGreaterThan(50);
});
```

**Test Case 6.2: Mouse Wheel - Increment/Decrement**
```javascript
it('should increment value on wheel scroll up', async () => {
  const { component, container } = render(Knob, {
    value: 50,
    min: 0,
    max: 100,
    step: 1
  });

  const knobElement = container.querySelector('.knob');

  // Scroll up (deltaY < 0)
  await fireEvent.wheel(knobElement, { deltaY: -100 });

  expect(component.value).toBe(51); // Increased by step
});
```

**Test Case 6.3: Keyboard Accessibility - Arrow Keys (NEW FIX)**
```javascript
it('should support arrow key navigation', async () => {
  const { component, container } = render(Knob, {
    value: 50,
    min: 0,
    max: 100,
    step: 1
  });

  const knobElement = container.querySelector('.knob');
  knobElement.focus();

  // Arrow Up increases
  await fireEvent.keyDown(knobElement, { key: 'ArrowUp' });
  expect(component.value).toBe(51);

  // Arrow Down decreases
  await fireEvent.keyDown(knobElement, { key: 'ArrowDown' });
  expect(component.value).toBe(50);

  // Home jumps to min
  await fireEvent.keyDown(knobElement, { key: 'Home' });
  expect(component.value).toBe(0);

  // End jumps to max
  await fireEvent.keyDown(knobElement, { key: 'End' });
  expect(component.value).toBe(100);
});
```

**Test Case 6.4: Keyboard - Page Up/Down for Coarse Adjustment**
```javascript
it('should jump by 10 steps on Page Up/Down', async () => {
  const { component, container } = render(Knob, {
    value: 50,
    min: 0,
    max: 100,
    step: 1
  });

  const knobElement = container.querySelector('.knob');
  knobElement.focus();

  // Page Up increases by 10 steps
  await fireEvent.keyDown(knobElement, { key: 'PageUp' });
  expect(component.value).toBe(60);

  // Page Down decreases by 10 steps
  await fireEvent.keyDown(knobElement, { key: 'PageDown' });
  expect(component.value).toBe(50);
});
```

**Test Case 6.5: Value Bounds - Min/Max Clamping**
```javascript
it('should clamp value to min/max bounds', async () => {
  const { component, container } = render(Knob, {
    value: 95,
    min: 0,
    max: 100,
    step: 10
  });

  const knobElement = container.querySelector('.knob');
  knobElement.focus();

  // Try to exceed max
  await fireEvent.keyDown(knobElement, { key: 'PageUp' }); // Would go to 105
  expect(component.value).toBe(100); // Clamped to max

  // Try to go below min
  component.value = 5;
  await fireEvent.keyDown(knobElement, { key: 'PageDown' }); // Would go to -5
  expect(component.value).toBe(0); // Clamped to min
});
```

### Test Suite: `shared/ui-components/controls/VintageKnob.svelte`

**Test Case 6.6: VintageKnob - Visual Feedback**
```javascript
it('should update rotation transform on value change', async () => {
  const { component, container } = render(VintageKnob, {
    value: 0,
    min: 0,
    max: 100
  });

  const knobElement = container.querySelector('.knob');
  const initialTransform = knobElement.style.transform;

  // Change value
  component.value = 50;
  await tick(); // Wait for Svelte to update DOM

  const newTransform = knobElement.style.transform;
  expect(newTransform).not.toBe(initialTransform);
  expect(newTransform).toContain('rotate'); // Rotation should change
});
```

---

## Integration Tests - Audio-UI Interaction

### Test Suite: Knob + Filter Parameter Changes

#### Test Group 7: Real-time Audio Parameter Updates

**Test Case 7.1: Knob Drag + Filter Frequency - Smooth Transition**
```javascript
import { render, fireEvent } from '@testing-library/svelte';
import { createLowPassFilter } from '@audio/synthesis/filters';
import { getAudioContext } from '@audio/utils/audio-context';

it('should smoothly update filter frequency when dragging knob', async () => {
  // Create filter
  const filter = createLowPassFilter(1000, 1);
  const audioContext = getAudioContext();

  // Render knob bound to filter frequency
  let frequency = 1000;
  const { container } = render(Knob, {
    value: frequency,
    min: 20,
    max: 20000,
    step: 10
  });

  // Spy on filter parameter changes
  const rampSpy = vi.spyOn(filter.getFilter().frequency, 'linearRampToValueAtTime');

  // Simulate rapid knob dragging (simulates user dragging AGE slider)
  const knobElement = container.querySelector('.knob');
  await fireEvent.mouseDown(knobElement, { clientY: 200 });

  for (let i = 0; i < 20; i++) {
    await fireEvent.mouseMove(window, { clientY: 200 - i * 5 });
    const newFreq = frequency + i * 50;
    filter.setFrequency(newFreq);
  }

  await fireEvent.mouseUp(window);

  // Verify smooth ramping (no instant jumps)
  expect(rampSpy).toHaveBeenCalled();
  expect(rampSpy.mock.calls.length).toBeGreaterThan(0);

  // Verify 50ms smoothing time
  const lastCall = rampSpy.mock.calls[rampSpy.mock.calls.length - 1];
  expect(lastCall[1] - audioContext.currentTime).toBeCloseTo(0.05, 2);
});
```

**Test Case 7.2: Knob + Audio Playing - No Clicks/Pops**
```javascript
it('should not cause audio clicks when adjusting knob during playback', async () => {
  const audioContext = getAudioContext();
  const oscillator = audioContext.createOscillator();
  const filter = createLowPassFilter(1000, 1);
  const analyser = audioContext.createAnalyser();

  // Audio graph: Oscillator → Filter → Analyser → Destination
  oscillator.connect(filter.getFilter());
  filter.getFilter().connect(analyser);
  analyser.connect(audioContext.destination);

  oscillator.start();

  // Capture audio before knob change
  const dataArrayBefore = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArrayBefore);

  // Rapidly change filter frequency (simulate knob drag)
  for (let i = 0; i < 10; i++) {
    filter.setFrequency(500 + i * 100);
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Capture audio after knob change
  const dataArrayAfter = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArrayAfter);

  // Check for discontinuities (clicks/pops show as sudden jumps)
  const maxJump = Math.max(...dataArrayAfter.map((val, idx) =>
    Math.abs(val - dataArrayBefore[idx])
  ));

  // Max jump should be small (no clicks)
  expect(maxJump).toBeLessThan(20); // Threshold for acceptable change

  oscillator.stop();
});
```

**Test Case 7.3: Multiple Knobs Simultaneously - CPU Performance**
```javascript
it('should handle multiple knobs changing simultaneously without lag', async () => {
  const startTime = performance.now();

  // Create 10 filters (simulating complex plugin with many parameters)
  const filters = Array.from({ length: 10 }, () => createLowPassFilter(1000, 1));

  // Simulate all knobs changing at once
  const updatePromises = filters.map(async (filter, idx) => {
    for (let i = 0; i < 50; i++) {
      filter.setFrequency(200 + idx * 100 + i * 10);
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  });

  await Promise.all(updatePromises);

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Should complete in reasonable time (< 5 seconds for 500 total updates)
  expect(duration).toBeLessThan(5000);
});
```

### Test Suite: Piano Keyboard + Polyphony

#### Test Group 8: Polyphonic Note Handling

**Test Case 8.1: Polyphonic Visual Feedback (REGRESSION TEST - FIXED BUG)**
```javascript
import { render, fireEvent } from '@testing-library/svelte';
import PianoKeyboard from '$components/piano/PianoKeyboard.svelte';

it('should show multiple keys as active when playing chord', async () => {
  const mockAudioState = {
    playNote: vi.fn(),
    stopNote: vi.fn(),
    pianoState: { activeNotes: new Set() }
  };

  const { container } = render(PianoKeyboard, {
    audioState: mockAudioState
  });

  // Find C, E, G keys (C major chord)
  const cKey = container.querySelector('[data-note="60"]'); // Middle C
  const eKey = container.querySelector('[data-note="64"]'); // E
  const gKey = container.querySelector('[data-note="67"]'); // G

  // Press all three keys
  await fireEvent.mouseDown(cKey);
  await fireEvent.mouseDown(eKey);
  await fireEvent.mouseDown(gKey);

  // All three should have 'active' class
  expect(cKey.classList.contains('active')).toBe(true);
  expect(eKey.classList.contains('active')).toBe(true);
  expect(gKey.classList.contains('active')).toBe(true);

  // Release E key
  await fireEvent.mouseUp(eKey);

  // E should no longer be active, but C and G should remain active
  expect(cKey.classList.contains('active')).toBe(true);
  expect(eKey.classList.contains('active')).toBe(false);
  expect(gKey.classList.contains('active')).toBe(true);
});
```

**Test Case 8.2: QWERTY Keyboard Polyphony**
```javascript
it('should handle multiple QWERTY keys pressed simultaneously', async () => {
  const mockAudioState = {
    playNote: vi.fn(),
    stopNote: vi.fn()
  };

  const { container } = render(PianoKeyboard, {
    audioState: mockAudioState
  });

  // Simulate pressing Z, X, C keys simultaneously (C3, D3, E3)
  await fireEvent.keyDown(window, { key: 'z' });
  await fireEvent.keyDown(window, { key: 'x' });
  await fireEvent.keyDown(window, { key: 'c' });

  // All three notes should be playing
  expect(mockAudioState.playNote).toHaveBeenCalledWith(48, expect.any(Number)); // C3
  expect(mockAudioState.playNote).toHaveBeenCalledWith(50, expect.any(Number)); // D3
  expect(mockAudioState.playNote).toHaveBeenCalledWith(52, expect.any(Number)); // E3

  // Visual feedback: all keys should show as active
  const cKeyElement = container.querySelector('[data-note="48"]');
  const dKeyElement = container.querySelector('[data-note="50"]');
  const eKeyElement = container.querySelector('[data-note="52"]');

  expect(cKeyElement.classList.contains('active')).toBe(true);
  expect(dKeyElement.classList.contains('active')).toBe(true);
  expect(eKeyElement.classList.contains('active')).toBe(true);
});
```

**Test Case 8.3: Key Press + Knob Adjustment - No Jitter**
```javascript
it('should maintain stable audio when adjusting knob while playing notes', async () => {
  const audioContext = getAudioContext();
  const mockAudioState = createMockPianoState(audioContext);

  const { container: pianoContainer } = render(PianoKeyboard, {
    audioState: mockAudioState
  });

  const { container: knobContainer } = render(VintageKnob, {
    value: 50,
    min: 0,
    max: 100
  });

  // Start playing a note
  const cKey = pianoContainer.querySelector('[data-note="60"]');
  await fireEvent.mouseDown(cKey);

  // While note is playing, rapidly adjust knob
  const knob = knobContainer.querySelector('.knob');
  await fireEvent.mouseDown(knob, { clientY: 100 });

  for (let i = 0; i < 20; i++) {
    await fireEvent.mouseMove(window, { clientY: 100 - i * 2 });
    // Simulate filter update
    mockAudioState.filter.setFrequency(500 + i * 50);
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  await fireEvent.mouseUp(window);

  // Verify note is still playing (no interruption)
  expect(mockAudioState.pianoState.activeNotes.has(60)).toBe(true);

  // Verify no audio glitches (check AudioContext for suspended state)
  expect(audioContext.state).not.toBe('suspended');
});
```

---

## E2E Tests - Critical User Flows

### Test Suite: Complete Plugin Usage Scenarios

#### Test Group 9: LoFi Piano - Full Session

**Test Case 9.1: Cold Start to First Note**
```javascript
import { test, expect } from '@playwright/test';

test('User can load plugin and play first note within 5 seconds', async ({ page }) => {
  const startTime = Date.now();

  // Navigate to plugin
  await page.goto('http://localhost:5173');

  // Wait for "Live" status indicator (audio system ready)
  await expect(page.locator('.status-indicator')).toContainText('● Live', { timeout: 3000 });

  // Click first piano key (A0)
  await page.locator('[data-note="21"]').click();

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Should be ready to play within 5 seconds
  expect(duration).toBeLessThan(5000);

  // Verify audio context is running
  const audioState = await page.evaluate(() => {
    return window.audioContext?.state;
  });
  expect(audioState).toBe('running');
});
```

**Test Case 9.2: Play Chord + Adjust AGE + Adjust Reverb**
```javascript
test('User can play chord and adjust multiple effects simultaneously', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('.status-indicator')).toContainText('● Live');

  // Play C major chord (C, E, G)
  const cKey = page.locator('[data-note="60"]');
  const eKey = page.locator('[data-note="64"]');
  const gKey = page.locator('[data-note="67"]');

  await cKey.click();
  await eKey.click();
  await gKey.click();

  // Verify all keys show as active
  await expect(cKey).toHaveClass(/active/);
  await expect(eKey).toHaveClass(/active/);
  await expect(gKey).toHaveClass(/active/);

  // While chord is playing, adjust AGE knob
  const ageKnob = page.locator('text=AGE').locator('..').locator('.knob');
  const ageBox = await ageKnob.boundingBox();

  // Drag AGE knob up
  await page.mouse.move(ageBox.x + ageBox.width / 2, ageBox.y + ageBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(ageBox.x + ageBox.width / 2, ageBox.y - 50); // Drag up
  await page.mouse.up();

  // Verify no console errors (especially BiquadFilterNode warnings)
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push(msg.text());
    }
  });

  await page.waitForTimeout(1000); // Wait for any async errors

  const unstableFilterWarnings = consoleErrors.filter(err =>
    err.includes('BiquadFilterNode') && err.includes('unstable')
  );
  expect(unstableFilterWarnings).toHaveLength(0);

  // Chord should still be playing
  await expect(cKey).toHaveClass(/active/);
  await expect(gKey).toHaveClass(/active/);
});
```

**Test Case 9.3: Keyboard Accessibility - Tab Navigation**
```javascript
test('User can navigate and control plugin entirely with keyboard', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('.status-indicator')).toContainText('● Live');

  // Tab to first knob
  await page.keyboard.press('Tab');
  let focusedElement = await page.evaluate(() => document.activeElement.className);

  // Should focus on a knob
  expect(focusedElement).toContain('knob');

  // Use arrow keys to adjust knob
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');

  // Tab to next control
  await page.keyboard.press('Tab');

  // Adjust with Page Up (coarse adjustment)
  await page.keyboard.press('PageUp');

  // Tab to piano keyboard section
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
  }

  // Use QWERTY keys to play notes
  await page.keyboard.press('z'); // C3
  await page.keyboard.press('x'); // D3

  // Verify notes are playing (visual feedback)
  const cKey = page.locator('[data-note="48"]');
  const dKey = page.locator('[data-note="50"]');

  await expect(cKey).toHaveClass(/active/);
  await expect(dKey).toHaveClass(/active/);

  // Release keys
  await page.keyboard.up('z');
  await page.keyboard.up('x');

  // Keys should no longer be active
  await expect(cKey).not.toHaveClass(/active/);
  await expect(dKey).not.toHaveClass(/active/);
});
```

**Test Case 9.4: Mobile Touch - Piano Keyboard**
```javascript
test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

test('User can play piano with touch on mobile device', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('.status-indicator')).toContainText('● Live');

  // Touch first key
  const cKey = page.locator('[data-note="60"]');
  await cKey.tap();

  // Verify key is active
  await expect(cKey).toHaveClass(/active/);

  // Touch second key while holding first (polyphony)
  const eKey = page.locator('[data-note="64"]');
  await eKey.tap();

  // Both keys should be active
  await expect(cKey).toHaveClass(/active/);
  await expect(eKey).toHaveClass(/active/);

  // Drag across keys (glissando)
  const gKey = page.locator('[data-note="67"]');
  const aKey = page.locator('[data-note="69"]');

  const cBox = await cKey.boundingBox();
  const aBox = await aKey.boundingBox();

  // Swipe from C to A
  await page.touchscreen.tap(cBox.x + cBox.width / 2, cBox.y + cBox.height / 2);
  await page.touchscreen.tap(aBox.x + aBox.width / 2, aBox.y + aBox.height / 2);

  // Verify multiple notes were triggered
  const activeKeys = await page.locator('.key.active').count();
  expect(activeKeys).toBeGreaterThan(0);
});
```

---

## Edge Case & Stress Tests

### Test Suite: Boundary Conditions & Extreme Scenarios

#### Test Group 10: Parameter Extremes

**Test Case 10.1: Filter Frequency - Nyquist Limit**
```javascript
it('should handle frequency at Nyquist limit (half sample rate)', () => {
  const audioContext = getAudioContext();
  const sampleRate = audioContext.sampleRate;
  const nyquistFreq = sampleRate / 2; // Typically 22050 Hz for 44100 Hz sample rate

  const filter = createLowPassFilter(nyquistFreq, 1);
  expect(filter.getFrequency()).toBe(nyquistFreq);

  // Should not throw error or cause instability
  filter.setFrequency(nyquistFreq - 100);
  expect(filter.getFrequency()).toBeCloseTo(nyquistFreq - 100, 1);
});
```

**Test Case 10.2: Filter Q - Extreme Resonance**
```javascript
it('should handle very high Q values without instability', async () => {
  const filter = createLowPassFilter(1000, 1);
  const consoleWarnSpy = vi.spyOn(console, 'warn');

  // Test increasingly high Q values
  const qValues = [5, 10, 20, 50, 100];

  for (const q of qValues) {
    filter.setQ(q);
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for ramp
  }

  // Should not produce instability warnings
  const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
    call[0]?.includes('BiquadFilterNode') && call[0]?.includes('unstable')
  );
  expect(unstableWarnings).toHaveLength(0);
});
```

**Test Case 10.3: Zero-Crossing - Filter Frequency = 0 Hz**
```javascript
it('should handle edge case of 0 Hz frequency', () => {
  const filter = createLowPassFilter(0, 1);
  expect(filter.getFrequency()).toBe(0);

  // Should not crash or throw
  filter.setFrequency(100);
  expect(filter.getFrequency()).toBeCloseTo(100, 1);
});
```

#### Test Group 11: Rapid User Actions

**Test Case 11.1: Knob Jitter - Rapid Back-and-Forth**
```javascript
it('should handle rapid knob jitter without audio artifacts', async () => {
  const filter = createLowPassFilter(1000, 1);
  const audioContext = getAudioContext();
  const analyser = audioContext.createAnalyser();

  filter.getFilter().connect(analyser);

  // Simulate jittery mouse movement (user shaking hand while dragging)
  const jitterPattern = [1000, 1050, 980, 1020, 990, 1030, 995, 1015];

  for (const freq of jitterPattern) {
    filter.setFrequency(freq);
    await new Promise(resolve => setTimeout(resolve, 5)); // Very rapid
  }

  // Check for audio discontinuities
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArray);

  // Calculate variance (high variance = clicks/pops)
  const mean = dataArray.reduce((a, b) => a + b) / dataArray.length;
  const variance = dataArray.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dataArray.length;

  // Variance should be low (smooth signal)
  expect(variance).toBeLessThan(100);
});
```

**Test Case 11.2: Polyphonic Stress - 88 Keys Simultaneously**
```javascript
it('should handle all 88 piano keys pressed at once', async () => {
  const mockAudioState = createMockPianoState();
  const { container } = render(PianoKeyboard, {
    audioState: mockAudioState,
    startNote: 21, // A0
    keyCount: 88
  });

  const allKeys = container.querySelectorAll('.key');
  expect(allKeys.length).toBe(88);

  // Press all keys
  for (const key of allKeys) {
    await fireEvent.mouseDown(key);
  }

  // All keys should be active
  const activeKeys = container.querySelectorAll('.key.active');
  expect(activeKeys.length).toBe(88);

  // Audio system should not crash
  expect(mockAudioState.playNote).toHaveBeenCalledTimes(88);
});
```

**Test Case 11.3: Knob Spam - 1000 Changes in 1 Second**
```javascript
it('should survive extreme knob spam without crashing', async () => {
  const filter = createLowPassFilter(1000, 1);
  const startTime = performance.now();

  // Spam 1000 frequency changes
  for (let i = 0; i < 1000; i++) {
    filter.setFrequency(200 + (i % 100) * 10);
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Should complete quickly (< 100ms for parameter changes alone)
  expect(duration).toBeLessThan(100);

  // Filter should still be functional
  expect(filter.getFrequency()).toBeGreaterThan(0);
});
```

#### Test Group 12: Memory & Resource Management

**Test Case 12.1: Memory Leak - Repeated Component Mount/Unmount**
```javascript
it('should not leak memory when repeatedly creating/destroying knobs', async () => {
  const initialMemory = performance.memory?.usedJSHeapSize || 0;

  // Create and destroy 100 knob components
  for (let i = 0; i < 100; i++) {
    const { unmount } = render(Knob, {
      value: 50,
      min: 0,
      max: 100
    });

    // Simulate interaction
    // ... (truncated for brevity)

    unmount();
  }

  // Force garbage collection (if available)
  if (global.gc) global.gc();

  const finalMemory = performance.memory?.usedJSHeapSize || 0;
  const memoryGrowth = finalMemory - initialMemory;

  // Memory growth should be minimal (< 5MB for 100 components)
  expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024);
});
```

**Test Case 12.2: AudioContext - Cleanup on Unmount**
```javascript
it('should properly disconnect audio nodes on component unmount', async () => {
  const audioContext = getAudioContext();
  const { unmount } = render(PianoKeyboard, {
    audioState: createMockPianoState(audioContext)
  });

  // Count active nodes before unmount
  const nodesBefore = audioContext.destination.numberOfInputs;

  // Unmount component
  unmount();

  // Nodes should be disconnected
  const nodesAfter = audioContext.destination.numberOfInputs;
  expect(nodesAfter).toBeLessThanOrEqual(nodesBefore);
});
```

**Test Case 12.3: Long Session - 30 Minutes Continuous Use**
```javascript
test.slow(); // Mark as slow test

test('Plugin remains stable after 30 minutes of continuous use', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('.status-indicator')).toContainText('● Live');

  const testDuration = 30 * 60 * 1000; // 30 minutes
  const startTime = Date.now();

  while (Date.now() - startTime < testDuration) {
    // Randomly play notes
    const randomNote = 21 + Math.floor(Math.random() * 88);
    await page.locator(`[data-note="${randomNote}"]`).click();

    // Randomly adjust knobs
    if (Math.random() > 0.7) {
      const knobs = await page.locator('.knob').all();
      const randomKnob = knobs[Math.floor(Math.random() * knobs.length)];
      const box = await randomKnob.boundingBox();

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y - Math.random() * 50);
      await page.mouse.up();
    }

    await page.waitForTimeout(100); // 100ms between actions
  }

  // After 30 minutes, verify plugin is still functional
  await page.locator('[data-note="60"]').click();
  await expect(page.locator('[data-note="60"]')).toHaveClass(/active/);

  // Check for memory leaks (heap size should stabilize)
  const memoryStats = await page.evaluate(() => {
    return performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize
    } : null;
  });

  if (memoryStats) {
    const memoryUsagePercent = (memoryStats.used / memoryStats.total) * 100;
    expect(memoryUsagePercent).toBeLessThan(90); // Not close to limit
  }
});
```

---

## Performance & Memory Tests

### Test Suite: CPU & Audio Thread Performance

#### Test Group 13: Realtime Audio Performance

**Test Case 13.1: CPU Usage - Idle State**
```javascript
test('CPU usage should be minimal when no audio is playing', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('.status-indicator')).toContainText('● Live');

  // Wait for plugin to settle
  await page.waitForTimeout(2000);

  // Measure CPU usage
  const cpuMetrics = await page.evaluate(() => {
    return new Promise(resolve => {
      const startTime = performance.now();
      let frames = 0;

      function measureFrame() {
        frames++;
        const elapsed = performance.now() - startTime;

        if (elapsed > 1000) {
          resolve({ fps: frames, elapsed });
        } else {
          requestAnimationFrame(measureFrame);
        }
      }

      requestAnimationFrame(measureFrame);
    });
  });

  // Should maintain 60 FPS even with audio system running
  expect(cpuMetrics.fps).toBeGreaterThan(55);
});
```

**Test Case 13.2: Audio Buffer Underruns - Real-time Stability**
```javascript
it('should not cause audio buffer underruns during heavy load', async () => {
  const audioContext = getAudioContext();
  const bufferSize = 4096;

  // Monitor for buffer underruns
  let underrunCount = 0;
  const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

  processor.onaudioprocess = (event) => {
    const outputBuffer = event.outputBuffer.getChannelData(0);

    // Simulate heavy processing
    for (let i = 0; i < outputBuffer.length; i++) {
      outputBuffer[i] = Math.sin(Math.random());
    }

    // Check for discontinuities (underruns)
    if (event.playbackTime - audioContext.currentTime > 0.1) {
      underrunCount++;
    }
  };

  processor.connect(audioContext.destination);

  // Run for 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));

  processor.disconnect();

  // Should have zero or minimal underruns
  expect(underrunCount).toBeLessThan(5);
});
```

**Test Case 13.3: Latency - Input to Audio Output**
```javascript
test('User input should trigger audio within 50ms', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('.status-indicator')).toContainText('● Live');

  // Measure time from click to audio start
  const latency = await page.evaluate(() => {
    return new Promise(resolve => {
      const startTime = performance.now();

      // Hook into AudioContext to detect audio start
      const audioContext = window.audioContext;
      const originalCreateOscillator = audioContext.createOscillator.bind(audioContext);

      audioContext.createOscillator = function() {
        const osc = originalCreateOscillator();
        const originalStart = osc.start.bind(osc);

        osc.start = function() {
          const latency = performance.now() - startTime;
          resolve(latency);
          return originalStart.apply(this, arguments);
        };

        return osc;
      };
    });
  });

  // Click a piano key
  await page.locator('[data-note="60"]').click();

  const measuredLatency = await page.evaluate(() => window.latency);

  // Latency should be under 50ms
  expect(measuredLatency).toBeLessThan(50);
});
```

---

## Accessibility Compliance Tests

### Test Suite: WCAG 2.1 AA Compliance

#### Test Group 14: Keyboard Navigation

**Test Case 14.1: Tab Order - Logical Navigation**
```javascript
test('Tab order should follow logical visual flow', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const tabOrder = [];

  // Press Tab 20 times and record focused elements
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el.tagName,
        class: el.className,
        ariaLabel: el.getAttribute('aria-label'),
        text: el.textContent?.slice(0, 20)
      };
    });
    tabOrder.push(focusedElement);
  }

  // Verify knobs are reachable via Tab
  const knobsFocused = tabOrder.filter(el => el.class?.includes('knob'));
  expect(knobsFocused.length).toBeGreaterThan(0);

  // Verify buttons are reachable
  const buttonsFocused = tabOrder.filter(el => el.tag === 'BUTTON');
  expect(buttonsFocused.length).toBeGreaterThan(0);
});
```

**Test Case 14.2: Focus Indicators - Visible Outlines**
```javascript
test('Focused elements should have visible focus indicators', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Tab to first focusable element
  await page.keyboard.press('Tab');

  // Check for focus indicator
  const focusOutline = await page.evaluate(() => {
    const el = document.activeElement;
    const styles = window.getComputedStyle(el);
    return {
      outline: styles.outline,
      outlineWidth: styles.outlineWidth,
      outlineColor: styles.outlineColor,
      boxShadow: styles.boxShadow
    };
  });

  // Should have visible outline or box-shadow
  const hasOutline = focusOutline.outlineWidth !== '0px' &&
                     focusOutline.outlineWidth !== 'none';
  const hasBoxShadow = focusOutline.boxShadow !== 'none';

  expect(hasOutline || hasBoxShadow).toBe(true);
});
```

**Test Case 14.3: Screen Reader - ARIA Labels**
```javascript
test('All interactive elements should have ARIA labels', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Find all knobs
  const knobs = await page.locator('.knob').all();

  for (const knob of knobs) {
    const ariaLabel = await knob.getAttribute('aria-label');
    const ariaDescribedBy = await knob.getAttribute('aria-describedby');

    // Should have aria-label or aria-describedby
    expect(ariaLabel || ariaDescribedBy).toBeTruthy();
  }

  // Find all buttons
  const buttons = await page.locator('button').all();

  for (const button of buttons) {
    const ariaLabel = await button.getAttribute('aria-label');
    const textContent = await button.textContent();

    // Should have aria-label or visible text
    expect(ariaLabel || textContent?.trim()).toBeTruthy();
  }
});
```

**Test Case 14.4: Color Contrast - WCAG AA Standard**
```javascript
test('Text should meet WCAG AA contrast ratio (4.5:1)', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Check various text elements
  const textElements = await page.locator('h1, h2, h3, p, label, button').all();

  for (const element of textElements.slice(0, 10)) { // Sample first 10
    const contrast = await element.evaluate(el => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const bgColor = styles.backgroundColor;

      // Simple contrast calculation (simplified)
      const rgb1 = color.match(/\d+/g).map(Number);
      const rgb2 = bgColor.match(/\d+/g).map(Number);

      const luminance = (rgb) => {
        const [r, g, b] = rgb.map(val => {
          val = val / 255;
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      const lum1 = luminance(rgb1);
      const lum2 = luminance(rgb2);

      return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    });

    // WCAG AA requires 4.5:1 for normal text
    expect(contrast).toBeGreaterThan(4.5);
  }
});
```

---

## Browser Compatibility Tests

### Test Suite: Cross-Browser & Cross-Platform

**Test Case 15.1: Chrome - All Features**
```javascript
test.use({ browserName: 'chromium' });

test('Plugin works fully in Chrome', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('.status-indicator')).toContainText('● Live');

  // Test audio playback
  await page.locator('[data-note="60"]').click();
  await expect(page.locator('[data-note="60"]')).toHaveClass(/active/);

  // Test knob interaction
  const knob = page.locator('.knob').first();
  const box = await knob.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y - 30);
  await page.mouse.up();

  // Should complete without errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.waitForTimeout(1000);
  expect(errors).toHaveLength(0);
});
```

**Test Case 15.2: Firefox - Web Audio API Differences**
```javascript
test.use({ browserName: 'firefox' });

test('Plugin works in Firefox with proper AudioContext handling', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Firefox may require user interaction to unlock AudioContext
  await page.click('body'); // Initial click

  await expect(page.locator('.status-indicator')).toContainText('● Live');

  // Test audio functionality
  await page.locator('[data-note="60"]').click();
  await expect(page.locator('[data-note="60"]')).toHaveClass(/active/);
});
```

**Test Case 15.3: Safari/WebKit - iOS Compatibility**
```javascript
test.use({ browserName: 'webkit' });

test('Plugin works in Safari with proper iOS audio unlock', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Safari requires explicit user interaction
  await page.click('body');
  await page.waitForTimeout(500);

  await expect(page.locator('.status-indicator')).toContainText('● Live', { timeout: 5000 });

  // Test audio playback
  await page.locator('[data-note="60"]').click();
  await expect(page.locator('[data-note="60"]')).toHaveClass(/active/);
});
```

**Test Case 15.4: Mobile Safari - Touch Events**
```javascript
test.use({
  browserName: 'webkit',
  viewport: { width: 375, height: 667 },
  isMobile: true,
  hasTouch: true
});

test('Plugin works on iOS Safari with touch events', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Initial tap to unlock audio
  await page.tap('body');
  await page.waitForTimeout(500);

  await expect(page.locator('.status-indicator')).toContainText('● Live');

  // Test touch interaction
  await page.tap('[data-note="60"]');
  await expect(page.locator('[data-note="60"]')).toHaveClass(/active/);

  // Test touch drag on knob
  const knob = page.locator('.knob').first();
  const box = await knob.boundingBox();

  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  // Note: actual drag would require more complex touch sequence
});
```

---

## Regression Test Suite

### Test Suite: Previously Fixed Bugs - Ensure No Regressions

**Test Case 16.1: REGRESSION - Polyphonic Visual Feedback (Issue #1)**
```javascript
it('should show all pressed keys as active (polyphony bug fixed)', async () => {
  // This was CRITICAL bug #1 - ensure it stays fixed
  const mockAudioState = createMockPianoState();
  const { container } = render(PianoKeyboard, {
    audioState: mockAudioState
  });

  const key1 = container.querySelector('[data-note="60"]');
  const key2 = container.querySelector('[data-note="64"]');
  const key3 = container.querySelector('[data-note="67"]');

  await fireEvent.mouseDown(key1);
  await fireEvent.mouseDown(key2);
  await fireEvent.mouseDown(key3);

  // All three MUST be active (this was broken before fix)
  expect(key1.classList.contains('active')).toBe(true);
  expect(key2.classList.contains('active')).toBe(true);
  expect(key3.classList.contains('active')).toBe(true);
});
```

**Test Case 16.2: REGRESSION - BiquadFilterNode Instability (Issue #4)**
```javascript
it('should not produce BiquadFilterNode warnings when dragging knobs (instability bug fixed)', async () => {
  // This was HIGH priority bug #4 - ensure it stays fixed
  const filter = createLowPassFilter(1000, 5); // High Q
  const consoleWarnSpy = vi.spyOn(console, 'warn');

  // Rapid parameter changes (simulate knob drag)
  for (let i = 0; i < 50; i++) {
    filter.setFrequency(500 + i * 20);
    filter.setQ(1 + i * 0.1);
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Should have ZERO instability warnings
  const unstableWarnings = consoleWarnSpy.mock.calls.filter(call =>
    call[0]?.includes('BiquadFilterNode') && call[0]?.includes('unstable')
  );
  expect(unstableWarnings).toHaveLength(0);
});
```

**Test Case 16.3: REGRESSION - WCAG Label Accessibility (Issue #3)**
```javascript
it('should not have label elements without associated controls', async () => {
  // This was accessibility violation - ensure it stays fixed
  const { container } = render(ProgressionBuilder, {
    audioState: createMockPianoState()
  });

  // Find all <label> elements
  const labels = container.querySelectorAll('label');

  labels.forEach(label => {
    // Each label must have 'for' attribute OR wrap an input
    const hasFor = label.hasAttribute('for');
    const wrapsInput = label.querySelector('input, select, textarea') !== null;

    expect(hasFor || wrapsInput).toBe(true);
  });
});
```

**Test Case 16.4: REGRESSION - Knob Keyboard Accessibility (Issue #2)**
```javascript
it('should allow keyboard control of knobs (accessibility fix)', async () => {
  // This was WCAG violation - ensure keyboard control stays functional
  const { component, container } = render(Knob, {
    value: 50,
    min: 0,
    max: 100,
    step: 1
  });

  const knob = container.querySelector('.knob');
  knob.focus();

  // Test all keyboard controls
  await fireEvent.keyDown(knob, { key: 'ArrowUp' });
  expect(component.value).toBe(51);

  await fireEvent.keyDown(knob, { key: 'ArrowDown' });
  expect(component.value).toBe(50);

  await fireEvent.keyDown(knob, { key: 'PageUp' });
  expect(component.value).toBe(60);

  await fireEvent.keyDown(knob, { key: 'Home' });
  expect(component.value).toBe(0);

  await fireEvent.keyDown(knob, { key: 'End' });
  expect(component.value).toBe(100);
});
```

---

## Test Execution Plan

### Phase 1: Local Development (Week 1)
- Run unit tests with Vitest: `pnpm test`
- Target: 95%+ coverage on shared libraries
- Fix any failing tests before proceeding

### Phase 2: Integration Testing (Week 1-2)
- Run integration tests: `pnpm test:integration`
- Manual testing of audio-UI interaction
- Performance profiling with Chrome DevTools

### Phase 3: E2E Testing (Week 2)
- Run Playwright tests: `pnpm test:e2e`
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile device testing (iOS Safari, Android Chrome)

### Phase 4: Stress & Edge Case Testing (Week 2-3)
- Run stress tests with extended timeouts
- Memory leak detection
- Long-session stability testing (30+ minutes)

### Phase 5: Accessibility Audit (Week 3)
- Automated WCAG testing
- Manual screen reader testing
- Keyboard-only navigation testing

### Phase 6: Regression Testing (Week 3-4)
- Run full regression suite
- Verify all previously fixed bugs remain fixed
- Update test suite with any new bugs found

---

## Success Metrics

### Code Coverage Targets
- ✅ Shared libraries: 95%+ coverage
- ✅ UI components: 90%+ coverage
- ✅ Plugin code: 85%+ coverage

### Performance Benchmarks
- ✅ CPU usage (idle): < 5%
- ✅ CPU usage (10 notes playing): < 15%
- ✅ Memory usage (idle): < 50MB
- ✅ Memory usage (active): < 100MB
- ✅ Input latency: < 50ms
- ✅ FPS: 60 fps maintained

### Bug Metrics
- ✅ Critical bugs: 0
- ✅ High priority bugs: 0
- ✅ Medium priority bugs: < 5
- ✅ Known regressions: 0

### Accessibility Compliance
- ✅ WCAG 2.1 AA: 100% compliance
- ✅ Keyboard navigation: All features accessible
- ✅ Screen reader: All content describable
- ✅ Color contrast: All text meets 4.5:1 ratio

---

## Appendix A: Test Utilities

### Mock Audio State Factory
```javascript
function createMockPianoState(audioContext = null) {
  const ctx = audioContext || getAudioContext();
  const activeNotes = new Set();

  return {
    audioContext: ctx,
    pianoState: { activeNotes },
    playNote: vi.fn((note, velocity) => {
      activeNotes.add(note);
    }),
    stopNote: vi.fn((note) => {
      activeNotes.delete(note);
    }),
    stopAll: vi.fn(() => {
      activeNotes.clear();
    }),
    filter: createLowPassFilter(1000, 1)
  };
}
```

### Performance Measurement Utility
```javascript
function measurePerformance(fn, iterations = 1000) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  return {
    mean: times.reduce((a, b) => a + b) / times.length,
    median: times.sort()[Math.floor(times.length / 2)],
    p95: times.sort()[Math.floor(times.length * 0.95)],
    p99: times.sort()[Math.floor(times.length * 0.99)]
  };
}
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-01-13
**Next Review**: After Phase 6 completion
**Maintainer**: Development Team
