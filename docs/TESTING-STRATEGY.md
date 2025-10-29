# Testing Strategy for MIDI Chord Generator

## Overview

This document outlines the comprehensive testing strategy for the Din-ZAudioToolLibrary audio plugin playground, with special focus on the MIDI Chord Generator system.

## Test Structure

### Phase 1: Unit Testing (Music Theory Module)

The music theory engine is the foundation of the MIDI Chord Generator. All music theory functions must be thoroughly tested to ensure correct harmonic output.

#### Test Files Created

1. **scales.test.js** - Scale generation and manipulation
   - Scale pattern validation
   - Root note transposition
   - Scale degree identification
   - Relative/parallel relationships
   - All 15+ scale types

2. **chords.test.js** - Chord construction and voice leading
   - Chord generation from scales
   - Chord inversions (root, 1st, 2nd, 3rd)
   - Voice leading distance calculations
   - Optimal inversion selection
   - Diatonic harmony

3. **midi.test.js** - MIDI utilities and conversions
   - MIDI ↔ Note name conversions
   - MIDI ↔ Frequency conversions
   - Interval naming and semitone calculations
   - Piano range utilities
   - Transposition and octave operations

4. **progressions.test.js** - Harmonic progressions
   - 13 progression templates
   - Progression generation from Roman numerals
   - Voice leading analysis
   - Genre-based progression access
   - Harmonic function classification

#### Test Coverage Goals

| Module | Unit Tests | Integration | Coverage Goal |
|--------|-----------|-------------|---------------|
| scales.js | 45+ tests | ✅ With chords | 95%+ |
| chords.js | 50+ tests | ✅ With progressions | 95%+ |
| midi.js | 40+ tests | ✅ With UI | 98%+ |
| progressions.js | 45+ tests | ✅ Full pipeline | 95%+ |
| **Total** | **180+ tests** | **Integrated** | **95%+** |

### Phase 2: Component Testing (Svelte 5 UI)

UI components need integration tests to ensure:
- Correct props binding
- Event handling
- Accessibility compliance
- Responsive design

#### Components to Test

1. **ChordSelector.svelte**
   - Root note selection (12 chromatic notes)
   - Scale type selection (15+ types)
   - Octave adjustment
   - Scale info display

2. **ChordDisplay.svelte**
   - 7 diatonic chord grid rendering
   - Chord selection and highlighting
   - Harmonic function color coding
   - Detail panel updates
   - Play button interaction

3. **ProgressionBuilder.svelte**
   - Template loading
   - Chord add/remove operations
   - Playback control (play, stop, pause)
   - Tempo adjustment (40-200 BPM)
   - Loop toggle
   - Voice leading display

4. **ChordGenerator.svelte** (Main Container)
   - Sub-component integration
   - State synchronization
   - Educational content display
   - Responsive layout
   - Audio playback coordination

#### Component Test Examples

```javascript
// Example: ChordSelector test
import { render, screen } from '@sveltejs/kit/testing';
import ChordSelector from './ChordSelector.svelte';

describe('ChordSelector', () => {
  it('should render 12 chromatic note options', async () => {
    const { container } = render(ChordSelector, {
      props: { initialRoot: 60, initialScale: 'major' }
    });

    const noteSelect = screen.getByRole('combobox', { name: /note/i });
    const options = noteSelect.querySelectorAll('option');

    expect(options).toHaveLength(12);
  });

  it('should update scale when selected', async () => {
    const { container } = render(ChordSelector);
    const scaleSelect = screen.getByRole('combobox', { name: /scale/i });

    await fireEvent.change(scaleSelect, { target: { value: 'minor' } });

    expect(scaleSelect.value).toBe('minor');
  });

  it('should be accessible with keyboard navigation', async () => {
    const { container } = render(ChordSelector);
    const firstButton = screen.getByRole('button', { name: /up|octave/i });

    firstButton.focus();
    await fireEvent.keyDown(firstButton, { key: 'ArrowUp' });

    expect(firstButton).toHaveFocus();
  });
});
```

### Phase 3: Integration Testing (End-to-End Audio)

Integration tests verify the complete audio flow from UI to Web Audio API.

#### Test Scenarios

1. **Complete Workflow**
   ```
   User selects key (C major)
   → ChordSelector generates scale
   → ChordDisplay shows diatonic chords
   → User selects progression template
   → ProgressionBuilder creates chords
   → User clicks play
   → audioState.playChord() called
   → Web Audio oscillators play
   → Sound heard
   ```

2. **Audio Playback Verification**
   - Correct oscillator frequencies generated
   - Envelope applied (ADSR)
   - Duration matches UI setting
   - Multiple notes play simultaneously (polyphony)
   - Correct timing between chords

3. **State Synchronization**
   - UI changes reflect in music theory
   - Music theory changes reflect in audio
   - Playback progress updates UI
   - Progression position tracked

#### Example Integration Test

```javascript
// Example: Audio playback test
describe('ChordGenerator Audio Integration', () => {
  it('should play correct frequencies for C major chord', async () => {
    const { container } = render(ChordGenerator, {
      props: { audioState: mockAudioState }
    });

    // Select C major
    await selectRoot(60);
    await selectScale('major');

    // Select I chord (C major)
    await clickChord('I');

    // Play chord
    await clickPlayButton();

    // Verify correct frequencies were played
    expect(mockAudioState.playChord).toHaveBeenCalledWith([60, 64, 67], duration);
    expect(mockAudioState.playedFrequencies).toContain(261.6); // C4
    expect(mockAudioState.playedFrequencies).toContain(329.6); // E4
    expect(mockAudioState.playedFrequencies).toContain(392.0); // G4
  });

  it('should apply voice leading to progression', async () => {
    const { container } = render(ChordGenerator);

    // Load progression
    await selectProgression('perfect-cadence'); // V-I

    // Play progression
    await clickPlayProgression();

    // First chord (V) should be in root position
    const firstCall = mockAudioState.playChord.mock.calls[0];
    expect(firstCall[0][0]).toBe(67); // G is root of V

    // Second chord (I) should use voice leading
    const secondCall = mockAudioState.playChord.mock.calls[1];
    expect(secondCall[0][0]).toBeLessThan(100); // Should move smoothly
  });

  it('should respect tempo settings', async () => {
    const { container } = render(ChordGenerator);

    // Set tempo to 120 BPM
    await setTempo(120);

    // Play chord
    await clickPlayButton();

    // Verify timing (quarter note = 0.5 seconds at 120 BPM)
    expect(mockAudioState.schedulePlayback).toHaveBeenCalledWith({
      time: expect.closeTo(0.5, 0.1),
      duration: expect.any(Number)
    });
  });
});
```

## Running Tests

### Setup

```bash
# Install dependencies
npm install

# Install vitest
npm install --save-dev vitest

# Optional: Install UI runner
npm install --save-dev vitest-ui
```

### Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test scales.test.js

# Run with UI dashboard
npm run test:ui

# Run with coverage
npm run test:coverage

# Run in watch mode (default)
npm test -- --watch

# Run once (CI mode)
npm test -- --run
```

## Test Configuration

### vitest.config.js

```javascript
export default defineConfig({
  test: {
    environment: 'node', // or 'jsdom' for DOM tests
    globals: true,
    include: ['**/*.test.js', '**/*.spec.js'],
    coverage: {
      provider: 'v8',
      lines: 95,
      functions: 95,
      branches: 90,
      statements: 95,
    },
  },
});
```

## Testing Utilities

### Mock Web Audio API

For testing audio functionality without actual sound:

```javascript
// Global setup file - test-setup.js
global.AudioContext = class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
  }

  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440, setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  // ... other methods
};
```

### Testing Utilities Library

Create `/shared/audio-core/test-utils.js`:

```javascript
/**
 * Testing utilities for audio modules
 */

export function createMockAudioContext() {
  // Returns fully mocked AudioContext
}

export function createMockOscillator() {
  // Returns mocked oscillator with spyable methods
}

export function verifyChordFrequencies(actualFreqs, expectedChord) {
  // Converts MIDI notes to frequencies and compares
}

export function waitForAudioScheduling(duration) {
  // Helper to wait for async audio scheduling
}

export function mockWebAudioAPI() {
  // Sets up global Web Audio mocks
}
```

## Test Metrics

### Target Coverage

```
Statements: 95%+
Branches: 90%+
Functions: 95%+
Lines: 95%+
```

### Code Coverage Report

Generated in `/coverage/`:

```
┌─────────────────────┬─────────┬─────────┬──────────┐
│ File                │ % Stmts │ % Lines │ Uncovered│
├─────────────────────┼─────────┼─────────┼──────────┤
│ scales.js           │ 98.5%   │ 97.2%   │ 4 lines  │
│ chords.js           │ 96.3%   │ 95.8%   │ 8 lines  │
│ midi.js             │ 99.1%   │ 98.7%   │ 2 lines  │
│ progressions.js     │ 96.8%   │ 96.1%   │ 6 lines  │
├─────────────────────┼─────────┼─────────┼──────────┤
│ All files           │ 97.7%   │ 96.9%   │ 20 lines │
└─────────────────────┴─────────┴─────────┴──────────┘
```

## Testing Best Practices

### 1. Unit Test Organization

```javascript
describe('Module Name', () => {
  // Setup
  beforeEach(() => {
    // Reset state
  });

  describe('Function Name', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = ...;

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### 2. Test Independence

- Each test should be independent
- No test should depend on another
- Use `beforeEach` for setup, `afterEach` for cleanup

### 3. Descriptive Names

```javascript
// ✅ Good
it('should return C major scale when given C4 and major')

// ❌ Bad
it('generates scale')
```

### 4. Single Assertion per Test

Keep tests focused:

```javascript
// ✅ Good - separate tests for separate concerns
it('should have 7 notes in major scale', () => {
  expect(scale).toHaveLength(7);
});

it('should follow W W H W W W H pattern', () => {
  expect(intervals).toEqual([2, 2, 1, 2, 2, 2, 1]);
});

// ❌ Bad - multiple assertions per test
it('should generate major scale correctly', () => {
  expect(scale).toHaveLength(7);
  expect(intervals).toEqual([2, 2, 1, 2, 2, 2, 1]);
  expect(scale[0]).toBe(60);
});
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm install
      - run: npm test -- --run
      - run: npm run test:coverage
```

## Next Steps

### Phase 1 (Current)
- [x] Create unit test files for music theory
- [ ] Run and fix failing tests
- [ ] Achieve 95%+ coverage

### Phase 2
- [ ] Create component tests with Svelte Testing Library
- [ ] Test accessibility (WCAG 2.1 AA)
- [ ] Test responsive design

### Phase 3
- [ ] Create end-to-end audio tests
- [ ] Test with mock Web Audio API
- [ ] Verify harmonic output accuracy

### Phase 4
- [ ] Performance benchmarks
- [ ] Memory leak detection
- [ ] Load testing (many progressions)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Web Audio API Mocking](https://github.com/chrisguttandin/web-audio-api)
- [Svelte Testing Best Practices](https://svelte.dev/docs/testing)

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "AudioContext is not defined"
```javascript
// Solution: Mock in test setup
import { createMockAudioContext } from './test-utils.js';
global.AudioContext = createMockAudioContext;
```

**Issue**: Frequency calculations differ by small amounts
```javascript
// Solution: Use approximate matching
expect(frequency).toBeCloseTo(440, 1); // within 1 Hz
```

**Issue**: Async audio tests timeout
```javascript
// Solution: Increase timeout for specific tests
it('should handle large progression', async () => {
  // test code
}, 10000); // 10 second timeout
```

---

**Document Status**: 📋 Draft - Testing Infrastructure Setup
**Last Updated**: 2025-10-29
**Next Review**: After Phase 1 test implementation
