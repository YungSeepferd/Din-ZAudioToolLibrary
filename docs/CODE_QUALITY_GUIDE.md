# Code Quality & Best Practices Guide

This guide establishes the standards for clean, maintainable, and well-documented code across the Audio Plugin Playground.

## Table of Contents

1. [Code Formatting](#code-formatting)
2. [Naming Conventions](#naming-conventions)
3. [Comments and Documentation](#comments-and-documentation)
4. [Code Structure](#code-structure)
5. [Svelte Best Practices](#svelte-best-practices)
6. [JavaScript/Node Best Practices](#javascriptnode-best-practices)
7. [Audio Code Patterns](#audio-code-patterns)
8. [Testing & Debugging](#testing--debugging)
9. [Git Workflow](#git-workflow)

---

## Code Formatting

### Automated Formatting with Prettier

All code is automatically formatted using **Prettier**. Configuration is in `.prettierrc.json`:

- **Tab Width**: 2 spaces
- **Line Length**: 100 characters
- **Semicolons**: Always required
- **Quotes**: Single quotes
- **Trailing Commas**: None (modern JavaScript)
- **Arrow Functions**: Always use parentheses

### Using Prettier

```bash
# Format a single file
npx prettier --write src/main.js

# Format entire project
npx prettier --write "**/*.{js,svelte,css,md}"

# Check formatting without writing
npx prettier --check "**/*.{js,svelte,css,md}"
```

### ESLint for Code Quality

ESLint catches errors and enforces patterns. Configuration in `.eslintrc.json`:

```bash
# Lint all files
npx eslint "**/*.{js,svelte}"

# Fix auto-fixable issues
npx eslint "**/*.{js,svelte}" --fix

# Lint watch mode
npx eslint "**/*.{js,svelte}" --watch
```

### Pre-commit Hook (Optional)

To automatically format before committing:

```bash
# Install husky
pnpm add -D husky

# Setup
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx prettier --write . && npx eslint --fix ."
```

---

## Naming Conventions

### Variables and Constants

```javascript
// ✅ GOOD: Descriptive, camelCase
const audioContext = new AudioContext();
const delayTime = 0.5;
const isPlaying = true;

// ❌ BAD: Unclear, too short
const ac = new AudioContext();
const dt = 0.5;
const p = true;
```

### Functions

```javascript
// ✅ GOOD: Verb + noun, camelCase, describes action
function createOscillator(frequency) {}
function calculateFrequency(note) {}
function handleClick() {}
function formatDecibels(value) {}

// ❌ BAD: Unclear what it does
function process(x) {}
function doStuff() {}
function calc() {}
```

### Classes and Constructors

```javascript
// ✅ GOOD: PascalCase, noun, represents object
class AudioProcessor {}
class SynthesisEngine {}
class FilterBank {}

// ❌ BAD: camelCase, verb
class audioProcessor {}
class createSynthesis {}
```

### Constants

```javascript
// ✅ GOOD: UPPER_SNAKE_CASE for important constants
const MAX_DELAY_TIME = 5;
const MIN_FREQUENCY = 20;
const DEFAULT_SAMPLE_RATE = 44100;

// ✅ OK: camelCase for object constants
const defaultSettings = {
  frequency: 440,
  gain: 0.5
};
```

### Svelte Component Props

```javascript
// ✅ GOOD: Descriptive, clear type
let {
  value = 0,           // What does it control?
  min = 0,             // Range
  max = 100,
  step = 1,
  label = 'Parameter', // User-facing text
  disabled = false     // State
} = $props();

// ❌ BAD: Unclear purpose
let { val, mn, mx, s, l, dis } = $props();
```

---

## Comments and Documentation

### Comment Types

#### 1. File Header Comments

Every file should start with:

```javascript
/**
 * Module: Audio Context Manager
 *
 * Purpose:
 * Provides a singleton AudioContext instance with browser compatibility
 * handling and unlock functionality for iOS/Safari.
 *
 * Features:
 * - Singleton pattern prevents multiple contexts
 * - Automatic browser unlock on user interaction
 * - Fallback to webkitAudioContext
 *
 * Usage:
 * import { getAudioContext, unlockAudioContext } from '@audio/utils/audio-context.js';
 *
 * onMount(async () => {
 *   await unlockAudioContext(); // Call on user interaction
 *   const ctx = getAudioContext();
 * });
 *
 * Dependencies: None (native Web Audio API)
 * Exports: getAudioContext, unlockAudioContext, suspendAudioContext
 *
 * Author: [Your Name]
 * Last Updated: 2024-01-15
 */
```

#### 2. Function/Method Comments

```javascript
/**
 * Creates a low-pass filter for audio processing
 *
 * Removes high frequencies while preserving low frequencies.
 * Uses a biquad filter which is computationally efficient.
 *
 * Audio Flow:
 * Input ──▶ [ BiquadFilter ] ──▶ Output
 *               (lowpass)
 *           frequency: 2000 Hz
 *           Q: resonance/width
 *
 * Parameters:
 * @param {number} frequency - Cutoff frequency in Hz (20-20000)
 * @param {number} q - Resonance/Q factor (0.1-30)
 *                     Higher Q = sharper peak
 *
 * Returns:
 * @returns {Object} Filter instance with methods:
 *   - setFrequency(freq): Update cutoff frequency
 *   - setQ(q): Update resonance
 *   - connect(destination): Connect to next node
 *   - disconnect(): Remove connections
 *   - getFilter(): Get raw BiquadFilterNode
 *
 * Example:
 * const filter = createLowPassFilter(2000, 10);
 * osc.connect(filter.filter);
 * filter.connect(ctx.destination);
 * filter.setFrequency(1000); // Change cutoff
 *
 * Related:
 * - See createHighPassFilter for high-pass variant
 * - See resources/examples/supercollider/resonant-filter.scd for SC pattern
 * - See resources/examples/puredata/resonant-filter.pd for Pd pattern
 *
 * Performance:
 * - Minimal CPU overhead (single biquad filter)
 * - Safe to update parameters in real-time
 * - No audio artifacts on parameter changes
 *
 * Browser Support: All modern browsers (IE 10+)
 */
export function createLowPassFilter(frequency = 1000, q = 1) {
  // Implementation...
}
```

#### 3. Inline Comments

```javascript
// ✅ GOOD: Explain WHY, not WHAT
// Feedback creates resonance by delaying the signal
feedbackGain.gain.value = 0.3;

// Clamp feedback to prevent instability (can cause digital distortion)
const safeFeedback = Math.max(0, Math.min(0.8, feedback));

// ❌ BAD: Obvious from code
// Set feedback to 0.3
feedbackGain.gain.value = 0.3;

// Add 0.3 to feedback
const safeFeedback = Math.max(0, Math.min(0.8, feedback + 0.3));
```

#### 4. Algorithm Explanations

```javascript
/**
 * Resonant Feedback Algorithm
 *
 * Theory:
 * -------
 * When you delay a signal and mix it back with the original, the delayed
 * copy interferes with the original signal. At certain frequencies, the
 * delayed copy amplifies the original (constructive interference), creating
 * resonance. At other frequencies, they cancel out (destructive interference).
 *
 * The amount of feedback controls how strong the resonance is:
 * - 0% feedback = no resonance, just a simple delay echo
 * - 50% feedback = moderate resonance, stable
 * - 80%+ feedback = extreme resonance, risk of instability/distortion
 *
 * Step-by-step:
 * 1. Input signal arrives
 * 2. Signal goes to output (direct path, no delay)
 * 3. Signal also enters delay buffer
 * 4. Delayed signal mixes back (feedback)
 * 5. Delayed signal enters delay again (feedback loop)
 * 6. Repeat creates exponentially-damped echoes
 *
 * Visual:
 * ┌─────────────────────────────────────────┐
 * │  Input Signal                           │
 * └──────┬──────────────────────────────────┘
 *        │
 *        ├──▶ Output (direct)
 *        │
 *        └──▶ [ Delay 0.5s ] ──┐
 *            │                 │
 *            ├──▶ Output (echo)│
 *            │                 │
 *            └─ [ Gain 0.3 ] ──┘ (feedback loop)
 *
 * Mathematical model:
 * output(t) = input(t) + 0.3 * input(t - 0.5s) + 0.09 * input(t - 1s) + ...
 * (feedback decays as -0.3, -0.09, -0.027, -0.0081, ...)
 *
 * Cross-reference implementations:
 * - Pure Data: pd/resonant-filter.pd
 * - SuperCollider: sc/resonant-filter.scd
 * - Web Audio: THIS FILE
 */
```

#### 5. Svelte Component Comments

```svelte
<!--
  Knob Component

  A rotary control for audio parameters with:
  - Mouse drag to adjust value
  - Scroll wheel sensitivity
  - Visual feedback (rotation angle)
  - Accessibility support (ARIA labels)

  Props:
  - value: Current numeric value
  - min/max: Range boundaries
  - step: Change increment
  - label: Display label

  Events:
  - onChange: Fires when user changes value

  Styling:
  - Uses CSS custom properties for theming
  - Dark theme by default
  - Hover/active states included

  Usage:
  <Knob bind:value={freq} min={20} max={2000} label="Frequency" />
-->

<script>
  // Binding state for value
  let { value = 0, min = 0, max = 100 } = $props();
</script>
```

---

## Code Structure

### File Organization

```javascript
/**
 * Typical file structure for audio modules
 */

// 1. File header comment (see above)

// 2. Imports
import { getAudioContext } from './audio-context.js';
import { logger } from '../utils/logger.js';

// 3. Constants
const DEFAULT_FREQUENCY = 440;
const DEFAULT_GAIN = 0.3;

// 4. Type definitions (if using JSDoc)
/**
 * @typedef {Object} FilterOptions
 * @property {number} frequency - Cutoff frequency
 * @property {number} q - Resonance
 */

// 5. Private helpers (functions not exported)
/**
 * Clamp value to range [min, max]
 * @private
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// 6. Main exported functions
export function createFilter(options = {}) {
  // Implementation
}

// 7. Exports list at end (optional, but recommended)
// Exports: createFilter, DEFAULT_FREQUENCY, FilterOptions
```

### Function Structure

```javascript
export function createOscillator(type = 'sine', frequency = 440) {
  // 1. Validate inputs
  if (!['sine', 'square', 'sawtooth', 'triangle'].includes(type)) {
    throw new Error(`Invalid waveform type: ${type}`);
  }
  if (frequency < 0 || frequency > 20000) {
    throw new Error(`Frequency out of range: ${frequency}`);
  }

  // 2. Setup
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  // 3. Configure
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.3;

  // 4. Connect
  oscillator.connect(gain);

  // 5. Return interface
  return {
    oscillator,
    gain,
    start: () => oscillator.start(),
    stop: () => oscillator.stop(),
    setFrequency: (freq) => oscillator.frequency.value = freq,
    connect: (destination) => gain.connect(destination)
  };
}
```

---

## Svelte Best Practices

### Component Structure

```svelte
<!--
  Component: ParameterKnob

  Purpose: Interactive rotary control for audio parameters
  Dependencies: None (web-native)
  Accessibility: Full ARIA support
  Mobile: Touch-friendly
-->

<script>
  import { onMount } from 'svelte';

  // Props - document expected types
  let {
    value = 0,           // Current value
    min = 0,             // Minimum value
    max = 100,           // Maximum value
    step = 1,            // Change increment
    label = '',          // Display label
    disabled = false,    // Disabled state
    onchange = () => {} // Change callback
  } = $props();

  // State
  let isDragging = $state(false);
  let startY = $state(0);
  let startValue = $state(0);

  // Computed
  const normalized = (value - min) / (max - min);
  const rotation = -135 + (normalized * 270);

  // Lifecycle
  onMount(() => {
    // Initialization if needed
  });

  // Event handlers
  function handleMouseDown(e) {
    isDragging = true;
    startY = e.clientY;
    startValue = value;
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    const delta = (startY - e.clientY) * 0.5;
    const newValue = Math.max(min, Math.min(max, startValue + delta));
    value = newValue;
    onchange(value);
  }

  function handleMouseUp() {
    isDragging = false;
  }
</script>

<!-- Template -->
<div class="knob-container">
  {#if label}
    <label>{label}</label>
  {/if}
  <div
    class="knob"
    style="transform: rotate({rotation}deg)"
    on:mousedown={handleMouseDown}
    role="slider"
    aria-label={label}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
  >
    <div class="knob-indicator" />
  </div>
  <span class="value">{value.toFixed(1)}</span>
</div>

<!-- Lifecycle events -->
<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<!-- Styles -->
<style>
  /* Use CSS custom properties for theming */
  :root {
    --knob-primary: #3b82f6;
    --knob-secondary: #1f2937;
  }

  .knob-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
  }

  .knob {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(to bottom, var(--knob-primary), var(--knob-secondary));
    cursor: grab;
    transition: transform 0.1s ease;
  }

  .knob:active {
    cursor: grabbing;
  }

  /* ... more styles ... */
</style>
```

### Reactivity with Runes

```svelte
<script>
  // State Rune - creates reactive state
  let count = $state(0);

  // Computed Rune - creates derived state
  let doubled = $derived(count * 2);

  // Effect Rune - runs side effects
  $effect(() => {
    console.log(`Count changed to: ${count}`);
  });

  // Conditional effect
  $effect.pre(() => {
    // Runs BEFORE DOM updates
    // Good for logging/debugging
  });
</script>
```

---

## JavaScript/Node Best Practices

### Error Handling

```javascript
// ✅ GOOD: Handle errors gracefully
async function loadAudioFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await getAudioContext().decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    console.error('Error loading audio:', error);
    // Return fallback or rethrow
    throw new Error(`Failed to load audio: ${error.message}`);
  }
}

// ❌ BAD: Silent failure
async function loadAudioFile(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return getAudioContext().decodeAudioData(arrayBuffer);
}
```

### Modern JavaScript Patterns

```javascript
// ✅ GOOD: Use const by default
const frequency = 440;
let isPlaying = false; // Change only when needed

// ✅ GOOD: Use object/array destructuring
const { frequency, gain, type } = oscillatorConfig;
const [first, second, ...rest] = array;

// ✅ GOOD: Use arrow functions
const map = (fn) => (arr) => arr.map(fn);
const square = (x) => x * x;

// ✅ GOOD: Use template literals
const message = `Frequency changed to ${frequency} Hz`;

// ✅ GOOD: Use spread operator
const newConfig = { ...oldConfig, frequency: 880 };

// ❌ BAD: var (hoisting issues)
var audioContext = new AudioContext();

// ❌ BAD: Unnecessary let/const redeclaration
let x = 5;
let x = 10; // Error!
```

### Async/Await

```javascript
// ✅ GOOD: Use async/await for readability
async function playSound() {
  try {
    await unlockAudioContext();
    const ctx = getAudioContext();
    const osc = createOscillator('sine', 440);
    osc.connect(ctx.destination);
    osc.start();
    await delay(1000);
    osc.stop();
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
}

// ❌ BAD: Callback hell
function playSound() {
  unlockAudioContext(function() {
    const ctx = getAudioContext();
    const osc = createOscillator('sine', 440);
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(function() {
      osc.stop();
    }, 1000);
  });
}
```

---

## Audio Code Patterns

### Audio Graph Pattern

```javascript
/**
 * Always follow this pattern for audio processing
 */

// 1. Get audio context
const ctx = getAudioContext();

// 2. Create nodes
const source = ctx.createOscillator();
const effect = ctx.createBiquadFilter();
const output = ctx.createGain();

// 3. Configure nodes (setups, not connections)
source.type = 'sine';
source.frequency.value = 440;
effect.frequency.value = 2000;
output.gain.value = 0.5;

// 4. Connect (signal flow: source → processing → output)
source.connect(effect);
effect.connect(output);
output.connect(ctx.destination);

// 5. Start audio
source.start();

// 6. Return control interface
export const synthesizer = {
  setFrequency: (f) => source.frequency.value = f,
  setFilter: (f) => effect.frequency.value = f,
  setGain: (g) => output.gain.value = g,
  stop: () => source.stop()
};
```

### Parameter Animation Pattern

```javascript
/**
 * Always use AudioParam scheduling for automation
 */

function automateFilter() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Wrong: Continuous updates (wasteful)
  // setInterval(() => {
  //   filter.frequency.value += 10;
  // }, 10);

  // Right: Schedule with Web Audio API
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.linearRampToValueAtTime(5000, now + 3);
  filter.frequency.exponentialRampToValueAtTime(100, now + 6);
}
```

---

## Testing & Debugging

### Console Logging Pattern

```javascript
// ✅ GOOD: Structured logging with context
console.log('🎵 Audio: Oscillator started', {
  frequency: 440,
  type: 'sine',
  time: audioContext.currentTime
});

console.warn('⚠️ Audio: High feedback detected', {
  feedback: 0.85,
  recommendation: 'Reduce to < 0.8'
});

console.error('❌ Audio Error: Failed to load sample', {
  url: 'path/to/file.wav',
  error: error.message
});

// ❌ BAD: Unclear messages
console.log('test');
console.log(x); // What is x?
console.log('done');
```

### Audio Debugging Helper

```javascript
/**
 * Debug audio processing by analyzing nodes
 */

function analyzeAudioGraph(startNode, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}📍 ${startNode.constructor.name}`);

  // Show node properties
  if (startNode.frequency) {
    console.log(`${indent}   Frequency: ${startNode.frequency.value} Hz`);
  }
  if (startNode.type) {
    console.log(`${indent}   Type: ${startNode.type}`);
  }

  // Show connected nodes
  if (startNode._connectedNodes) {
    startNode._connectedNodes.forEach((node) => {
      analyzeAudioGraph(node, depth + 1);
    });
  }
}

// Usage
analyzeAudioGraph(audioContext.destination);
```

---

## Git Workflow

### Commit Message Format

```bash
# Format: <type>: <subject>

# Types: feat, fix, docs, style, refactor, perf, test, chore
git commit -m "feat: Add resonant filter effect"
git commit -m "fix: Prevent audio context state error"
git commit -m "docs: Add SuperCollider integration guide"
git commit -m "refactor: Simplify oscillator API"
```

### Branch Naming

```bash
# Feature branch
git checkout -b feature/resonant-filter

# Bug fix branch
git checkout -b fix/audio-context-unlock

# Documentation branch
git checkout -b docs/mcp-server-setup

# Experiment branch (don't merge to main)
git checkout -b experiment/waveshaper-effect
```

### Pre-commit Checklist

Before committing:

- [ ] Code formatted with Prettier (`npx prettier --write .`)
- [ ] Linting passed (`npx eslint .`)
- [ ] Comments are clear and helpful
- [ ] No console.log or debug code remains
- [ ] No TODO comments (or tracked as issues)
- [ ] Cross-framework examples updated if algorithm changed
- [ ] Documentation updated if API changed

---

## Summary Checklist

When writing code, always verify:

- [ ] **Formatting**: Run Prettier
- [ ] **Linting**: Run ESLint with no errors
- [ ] **Naming**: Clear, descriptive, following conventions
- [ ] **Comments**: File header, function docs, inline explanations
- [ ] **Structure**: Organized logically, easy to follow
- [ ] **Audio Patterns**: Follows Web Audio best practices
- [ ] **Error Handling**: Try-catch, validation, user feedback
- [ ] **Documentation**: Updated README if needed
- [ ] **Cross-Reference**: Links to equivalent code in other frameworks
- [ ] **Git History**: Clean, descriptive commit messages

---

## Quick Reference

| Task | Command |
|------|---------|
| Format code | `npx prettier --write .` |
| Check formatting | `npx prettier --check .` |
| Lint code | `npx eslint .` |
| Fix lint errors | `npx eslint . --fix` |
| Format before commit | `npx husky add` (one-time setup) |

---

See also:
- [FRAMEWORKS_AND_TOOLS.md](FRAMEWORKS_AND_TOOLS.md) - Framework integration
- [PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md) - Plugin development guide
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - Quick lookup guide

