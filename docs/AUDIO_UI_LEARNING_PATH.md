# Audio UI Learning Path: Building Audio-Specific Components with Svelte

> **Purpose**: Learn to build professional audio plugin UI components by understanding audio UX principles, common patterns, and progressive Svelte development exercises.

**Target**: Transform from basic UI components (Knob, Slider, Button) into a comprehensive audio design system with matrices, EQ bands, graphs, and advanced interactions.

---

## Table of Contents

1. [Audio UI Principles](#audio-ui-principles)
2. [Component Hierarchy](#component-hierarchy)
3. [Phase 1: Foundations (Weeks 1-2)](#phase-1-foundations-weeks-1-2)
4. [Phase 2: Intermediate Controls (Weeks 3-4)](#phase-2-intermediate-controls-weeks-3-4)
5. [Phase 3: Complex Components (Weeks 5-7)](#phase-3-complex-components-weeks-5-7)
6. [Phase 4: Advanced Interactions (Weeks 8-10)](#phase-4-advanced-interactions-weeks-8-10)
7. [Design System Best Practices](#design-system-best-practices)
8. [Exercise Roadmap](#exercise-roadmap)

---

## Audio UI Principles

### Five Core UX Principles for Audio Plugins

Based on industry research (Voger Design, iZotope, FabFilter), professional audio UI follows these principles:

#### 1. **Simplicity**
- **Goal**: Clean, uncluttered layouts that don't overwhelm
- **Practice**: Group related controls into sections
- **Audio Context**: A compressor should show Attack, Ratio, Threshold in logical groupings, not scattered randomly

```svelte
<!-- BAD: Scattered controls -->
<div>
  <Knob label="Attack" />
  <Knob label="Makeup Gain" />
  <Slider label="Threshold" />
  <Knob label="Ratio" />
</div>

<!-- GOOD: Grouped controls -->
<section class="compressor-group">
  <div class="detection">
    <Slider label="Threshold" />
    <Knob label="Ratio" />
  </div>
  <div class="envelope">
    <Knob label="Attack" />
    <Knob label="Release" />
  </div>
  <div class="output">
    <Slider label="Makeup Gain" />
  </div>
</section>
```

#### 2. **Consistency**
- **Goal**: Predictable behavior across all controls
- **Practice**: Same interaction = same result (all knobs turn the same direction)
- **Audio Context**: Frequency controls always increase clockwise, volume always decreases when turned left

```javascript
// All frequency controls follow same logic
knobValue → exponentialMap(20Hz, 20000Hz)
// Exponential, not linear (matches human hearing perception)
```

#### 3. **Feedback**
- **Goal**: Instant visual/audio confirmation of actions
- **Practice**: Real-time parameter display, waveform visualization, frequency response graphs
- **Audio Context**: Change an EQ band → see the frequency response curve update live

```svelte
<script>
  let frequency = $state(1000);
  let eqResponse = $derived(calculateEQResponse(frequency));
</script>

<div class="control">
  <Knob bind:value={frequency} />
  <svg class="graph">{/* Render eqResponse in real-time */}</svg>
</div>
```

#### 4. **Accessibility**
- **Goal**: Usable by everyone, including users with disabilities
- **Practice**: Keyboard shortcuts, high contrast, clear labels, ARIA attributes
- **Audio Context**: Allow precise parameter entry via text input alongside knob

```svelte
<div class="parameter">
  <Knob bind:value={frequency} min={20} max={20000} />
  <input type="number" bind:value={frequency} />
  <!-- User can either drag knob OR type exact value -->
</div>
```

#### 5. **Performance**
- **Goal**: Responsive, no lag, smooth animations
- **Practice**: Optimize re-renders, use efficient update schedules
- **Audio Context**: Dragging a knob must feel instant, graph updates must not stutter

### Audio-Specific Feedback Design

Professional audio plugins provide multiple feedback layers:

| Feedback Type | Example | Learning Value |
|---------------|---------|-----------------|
| **Visual** | Knob rotates smoothly, value display updates | Core UI interaction |
| **Haptic** | Click sensation when dragging knob (CSS animation) | UX refinement |
| **Parametric** | Live frequency response graph while adjusting EQ | Advanced: real-time visualization |
| **Audio** | Click sound on parameter change (optional) | Advanced: audio-in-audio-UI |

---

## Component Hierarchy

### Level 1: Basic Components (Already Implemented)
```
Knob.svelte (rotary control with mouse/touch)
Slider.svelte (linear fader)
Button.svelte (toggle/action)
Label.svelte (text display)
```

### Level 2: Parameterized Controls (Week 2-3)
```
NumberInput.svelte (text input for precise values)
FrequencyKnob.svelte (logarithmic, 20Hz-20kHz)
DecibelsKnob.svelte (±24dB range)
TimeKnob.svelte (milliseconds to seconds)
Meter.svelte (VU meter, level display)
Toggle.svelte (on/off state)
```

### Level 3: Grouped Components (Week 4-5)
```
CompressorPanel.svelte (Threshold, Ratio, Attack, Release, Makeup Gain)
EQBand.svelte (Frequency, Q, Gain for single band)
FilterPanel.svelte (Type, Frequency, Q display)
DelayControls.svelte (Time, Feedback, Wet/Dry)
```

### Level 4: Complex Visualizations (Week 6-8)
```
FrequencyResponseGraph.svelte (EQ curve visualization)
EnvelopeEditor.svelte (ADSR graphical editor)
WaveformDisplay.svelte (audio buffer visualization)
SpectrumAnalyzer.svelte (frequency content display)
```

### Level 5: Advanced Interactions (Week 9-10)
```
EQMatrix.svelte (multi-band EQ with interactive graph)
MatrixControl.svelte (parameter automation grid)
XYPad.svelte (2D parameter control)
CrossfaderSlider.svelte (smooth mixing between states)
ParameterAutomation.svelte (time-based parameter changes)
```

---

## Phase 1: Foundations (Weeks 1-2)

### Goal
Understand Svelte 5 Runes, basic state management, and mouse/touch interactions. Build upon existing Knob/Slider.

### Exercise 1.1: Enhanced Knob with Text Display

**Concepts**:
- `$state` rune for reactive values (Svelte 5)
- `$derived` rune for computed values (Svelte 5)
- Event handler binding with `onchange`
- Formatting numbers using `$derived`
- Input validation in event handlers

**Task**: Extend existing `Knob.svelte` to show numeric value and allow direct text input.

```svelte
<script>
  import Knob from '@ui/controls/Knob.svelte';

  let frequency = $state(440);

  // Use $derived for computed display value
  let displayValue = $derived(frequency.toFixed(1));

  // Handle input change with proper validation
  function handleInputChange(e) {
    const value = parseFloat(e.target.value);
    // Validate range before updating state
    if (!isNaN(value) && value >= 20 && value <= 20000) {
      frequency = value;
    }
  }
</script>

<div class="frequency-control">
  <Knob bind:value={frequency} min={20} max={20000} />
  <div class="display">
    <input
      type="number"
      value={displayValue}
      onchange={handleInputChange}
      aria-label="Frequency in Hz"
      min="20"
      max="20000"
    />
    <span class="unit">Hz</span>
  </div>
</div>

<style>
  .frequency-control {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .display {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  input {
    width: 60px;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
  }

  .unit {
    font-size: 12px;
    color: #666;
  }
</style>
```

**Svelte 5 Best Practices Applied**:
- ✅ Use `$state` rune instead of reactive declarations
- ✅ Use `$derived` for computed display value (recalculates automatically)
- ✅ Modern event handler syntax (`onchange` instead of `on:change`)
- ✅ Direct state mutation instead of setter functions (`frequency = value`)

**Learning Outcomes**:
- ✅ Combine visual control (knob) with text input
- ✅ Use `$derived` for real-time display formatting
- ✅ Handle two-way binding (knob ↔ input)
- ✅ Add accessibility with aria-label

### Exercise 1.2: Logarithmic Frequency Knob

**Concepts**:
- Non-linear value mapping for audio (exponential/logarithmic)
- Human hearing perception models
- Value conversion functions (Hz ↔ linear 0-1)
- Using `$derived` for computed frequency values

**Task**: Create a frequency knob that maps linear control (0-1) to logarithmic frequency (20Hz-20kHz).

**Utility module** (`src/lib/utils/audioMath.js`):

```javascript
/**
 * Audio Mathematics Utilities
 * Convert between linear and logarithmic frequency ranges
 * @module audioMath
 */

/**
 * Convert linear 0-1 to logarithmic frequency 20Hz-20kHz
 * Human hearing perceives frequency logarithmically
 * @param {number} linear - Linear value 0-1
 * @returns {number} Frequency in Hz
 */
export function linearToFrequency(linear) {
  const minFreq = 20;
  const maxFreq = 20000;
  return minFreq * Math.pow(maxFreq / minFreq, linear);
}

/**
 * Convert frequency to linear 0-1 range
 * @param {number} frequency - Frequency in Hz
 * @returns {number} Linear value 0-1
 */
export function frequencyToLinear(frequency) {
  const minFreq = 20;
  const maxFreq = 20000;
  return Math.log(frequency / minFreq) / Math.log(maxFreq / minFreq);
}
```

**Component** (`FrequencyKnobExercise.svelte`):

```svelte
<script>
  import Knob from '@ui/controls/Knob.svelte';
  import { linearToFrequency, frequencyToLinear } from '$lib/utils/audioMath';

  // State: linear control value 0-1
  let linearValue = $state(0.5);

  // Derived: convert linear to frequency automatically
  let frequency = $derived(linearToFrequency(linearValue));

  // Format for display
  let displayFreq = $derived(Math.round(frequency));

  function handleKnobChange(newLinear) {
    linearValue = newLinear;
    // If you had an oscillator, update it here:
    // oscillator?.setFrequency(frequency);
  }
</script>

<div class="frequency-knob">
  <Knob value={linearValue} onchange={handleKnobChange} />
  <div class="display">
    <span class="frequency">{displayFreq} Hz</span>
  </div>
</div>

<style>
  .frequency-knob {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .display {
    text-align: center;
    font-family: monospace;
    font-size: 14px;
    font-weight: bold;
  }

  .frequency {
    display: block;
    padding: 4px 8px;
    background: #f5f5f5;
    border-radius: 4px;
    min-width: 80px;
  }
</style>
```

**Why Logarithmic?**
- Humans perceive frequency exponentially (octave relationships matter more than Hz differences)
- 100Hz → 200Hz feels like same interval as 1000Hz → 2000Hz
- Linear mapping would waste resolution in lower frequencies

**Learning Outcomes**:
- ✅ Understand logarithmic vs. linear mapping
- ✅ Implement exponential functions
- ✅ Match UI to human perception

### Exercise 1.3: Decibel Slider

**Concepts**:
- Linear dB scale (±24dB standard range)
- dB-to-linear amplitude conversion formula
- Using multiple `$derived` values
- Proper slider step sizes for audio controls

**Task**: Create a slider that ranges from -24dB to +12dB with proper display.

```svelte
<script>
  import Slider from '@ui/controls/Slider.svelte';

  // Constants for audio gain range
  const MIN_DB = -24;
  const MAX_DB = 12;
  const STEP_SIZE = 0.1; // 0.1dB resolution

  // State: gain in decibels
  let decibels = $state(0);

  // Derived: format dB for display
  let displayDb = $derived(decibels.toFixed(1));

  // Derived: convert dB to linear amplitude using standard formula
  // Formula: linear = 10^(dB/20)
  let linearGain = $derived(Math.pow(10, decibels / 20));

  // Derived: format linear multiplier
  let displayLinear = $derived(linearGain.toFixed(3));

  // Derived: human-readable description
  let gainDescription = $derived.by(() => {
    if (decibels === 0) return 'Unity (no change)';
    if (decibels > 0) return `+${decibels.toFixed(1)} dB (boost)`;
    return `${decibels.toFixed(1)} dB (cut)`;
  });
</script>

<div class="gain-control">
  <label for="gain-slider">Gain Control</label>

  <Slider
    id="gain-slider"
    bind:value={decibels}
    min={MIN_DB}
    max={MAX_DB}
    step={STEP_SIZE}
    aria-label={gainDescription}
  />

  <div class="display">
    <div class="db-value">
      <span class="label">dB:</span>
      <span class="value">{displayDb}</span>
    </div>
    <div class="linear-value">
      <span class="label">Amplitude:</span>
      <span class="value">{displayLinear}x</span>
    </div>
  </div>

  <p class="description">{gainDescription}</p>
</div>

<style>
  .gain-control {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fafafa;
  }

  label {
    font-weight: bold;
    font-size: 14px;
  }

  .display {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 8px 0;
  }

  .db-value,
  .linear-value {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-family: monospace;
    padding: 4px 8px;
    background: white;
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .label {
    font-weight: bold;
    color: #666;
  }

  .value {
    color: #000;
  }

  .description {
    margin: 0;
    padding: 8px;
    background: #e3f2fd;
    border-radius: 4px;
    font-size: 12px;
    color: #0d47a1;
  }
</style>
```

**dB to Linear Formula**:
- Linear = 10^(dB/20)
- Example: 0 dB = 1x (unity), 6 dB ≈ 2x, -6 dB ≈ 0.5x
- 3 dB represents approximately 2x perceived loudness (psychoacoustic)

**Svelte 5 Best Practices**:
- ✅ Use `$derived.by()` for multi-line computed logic
- ✅ Multiple simple `$derived` for single expressions
- ✅ Modern HTML attributes (`for`, `id` linking)
- ✅ No need for handlers—just bind values directly

**Learning Outcomes**:
- ✅ Understand dB-to-linear conversion formula
- ✅ Display dual values (dB and linear multiplier)
- ✅ Use `$derived.by()` for complex derivations
- ✅ Proper ARIA labels for accessibility
- ✅ Multi-line computed values with `$derived.by()`

---

## Phase 2: Intermediate Controls (Weeks 3-4)

### Goal
Build specialized controls for audio parameters. Learn value mapping, multi-touch, and real-time visualization.

### Exercise 2.1: FrequencyKnob Component

**Concepts**:
- Reusable specialized component
- Logarithmic mapping baked into component
- Formatted display

**Task**: Create a `FrequencyKnob.svelte` that handles Hz conversion internally.

```svelte
<!-- src/lib/components/FrequencyKnob.svelte -->
<script>
  import Knob from './Knob.svelte';

  let { value = 1000, min = 20, max = 20000, label = 'Frequency' } = $props();

  // Linear 0-1 for internal knob
  let linear = $derived.by(() => {
    return Math.log(value / min) / Math.log(max / min);
  });

  // Track changes to linear → convert back to Hz
  function handleKnobChange(newLinear) {
    value = min * Math.pow(max / min, newLinear);
  }

  let displayHz = $derived(Math.round(value));
  let displayNote = $derived(frequencyToNote(value));
</script>

<div class="frequency-knob">
  <Knob value={linear} onchange={handleKnobChange} />
  <div class="display">
    <div class="hz">{displayHz} Hz</div>
    <div class="note">{displayNote}</div>
  </div>
</div>

<style>
  .frequency-knob {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .display {
    text-align: center;
    font-size: 12px;
  }

  .hz {
    font-family: monospace;
    font-weight: bold;
  }

  .note {
    color: #666;
    font-size: 11px;
  }
</style>

<script>
  // Utility: Convert frequency to musical note
  function frequencyToNote(freq) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteNum = Math.round(12 * Math.log2(freq / 440)) + 69;
    const octave = Math.floor(noteNum / 12) - 1;
    const noteName = notes[noteNum % 12];
    return `${noteName}${octave}`;
  }
</script>
```

**Learning Outcomes**:
- ✅ Encapsulate logarithmic mapping in component
- ✅ Export clean API (Hz values, not linear)
- ✅ Add musical note display for context

### Exercise 2.2: Meter Component (VU Meter)

**Concepts**:
- Real-time animation
- SVG graphics
- Smooth value transitions

**Task**: Create a VU meter that displays audio level in real-time.

```svelte
<!-- src/lib/components/Meter.svelte -->
<script>
  let { level = 0, min = -40, max = 6 } = $props();

  // Smooth the level change
  let displayLevel = $state(level);

  $effect(() => {
    // Exponential smoothing for visual appeal
    displayLevel = displayLevel * 0.7 + level * 0.3;
  });

  // Convert dB to angle (0° to 270°)
  let angle = $derived((displayLevel - min) / (max - min) * 270);

  let displayDb = $derived(Math.round(displayLevel));
</script>

<div class="meter">
  <svg viewBox="0 0 200 120" class="meter-svg">
    <!-- Background arc -->
    <defs>
      <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
        <stop offset="70%" style="stop-color:#facc15;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
      </linearGradient>
    </defs>

    <!-- Background arc (gray) -->
    <path
      d="M 30,100 A 70,70 0 0,1 170,100"
      fill="none"
      stroke="#ddd"
      stroke-width="8"
    />

    <!-- Colored arc (active level) -->
    <path
      d="M 30,100 A 70,70 0 0,1 170,100"
      fill="none"
      stroke="url(#meterGradient)"
      stroke-width="8"
      stroke-dasharray={`${(angle / 270) * 219} 219`}
    />

    <!-- Needle -->
    <g transform={`rotate(${angle - 90} 100 100)`}>
      <rect x="98" y="30" width="4" height="70" fill="#333" />
    </g>

    <!-- Center dot -->
    <circle cx="100" cy="100" r="6" fill="#333" />
  </svg>

  <div class="value">{displayDb} dB</div>
</div>

<style>
  .meter {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .meter-svg {
    width: 180px;
    height: 100px;
  }

  .value {
    font-size: 12px;
    font-family: monospace;
    margin-top: 8px;
  }
</style>
```

**Learning Outcomes**:
- ✅ Create SVG graphics from scratch
- ✅ Animate values smoothly (exponential smoothing)
- ✅ Use gradients for visual appeal
- ✅ Real-time parameter visualization

### Exercise 2.3: Multi-Parameter Panel

**Concepts**:
- Grouping related controls
- Layout organization
- State management across multiple parameters

**Task**: Create a compressor control panel with Attack, Ratio, Threshold, and Release.

```svelte
<!-- src/lib/components/CompressorPanel.svelte -->
<script>
  import Knob from './Knob.svelte';
  import Meter from './Meter.svelte';

  let { threshold = -20, ratio = 4, attack = 0.01, release = 0.5, outputLevel = 0 } = $props();

  const MIN_THRESHOLD = -60;
  const MAX_THRESHOLD = 0;
  const MIN_RATIO = 1;
  const MAX_RATIO = 20;
  const MIN_ATTACK = 0.001;
  const MAX_ATTACK = 0.1;
  const MIN_RELEASE = 0.01;
  const MAX_RELEASE = 1;
</script>

<div class="compressor-panel">
  <h3>Compressor</h3>

  <div class="controls">
    <div class="control-group">
      <label>Threshold</label>
      <Knob bind:value={threshold} min={MIN_THRESHOLD} max={MAX_THRESHOLD} />
      <span class="value">{threshold.toFixed(1)} dB</span>
    </div>

    <div class="control-group">
      <label>Ratio</label>
      <Knob bind:value={ratio} min={MIN_RATIO} max={MAX_RATIO} step={0.1} />
      <span class="value">{ratio.toFixed(1)}:1</span>
    </div>

    <div class="control-group">
      <label>Attack</label>
      <Knob bind:value={attack} min={MIN_ATTACK} max={MAX_ATTACK} />
      <span class="value">{(attack * 1000).toFixed(0)} ms</span>
    </div>

    <div class="control-group">
      <label>Release</label>
      <Knob bind:value={release} min={MIN_RELEASE} max={MAX_RELEASE} />
      <span class="value">{(release * 1000).toFixed(0)} ms</span>
    </div>
  </div>

  <div class="meter-section">
    <Meter level={outputLevel} />
  </div>
</div>

<style>
  .compressor-panel {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    background: #fafafa;
  }

  h3 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: bold;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  label {
    font-size: 12px;
    font-weight: bold;
  }

  .value {
    font-size: 11px;
    font-family: monospace;
    color: #666;
  }

  .meter-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ddd;
  }
</style>
```

**Learning Outcomes**:
- ✅ Organize multiple controls logically
- ✅ Use consistent labeling and spacing
- ✅ Create reusable panel components
- ✅ Manage related state changes

---

## Phase 3: Complex Components (Weeks 5-7)

### Goal
Build interactive visualizations and complex multi-parameter controls. Learn canvas/SVG manipulation, real-time calculation, and advanced state management.

### Exercise 3.1: Frequency Response Graph (EQ Visualization)

**Concepts**:
- Canvas or SVG drawing
- Real-time calculation of frequency response
- Logarithmic frequency axis

**Task**: Create an interactive graph showing EQ curve as you adjust bands.

```svelte
<!-- src/lib/components/FrequencyResponseGraph.svelte -->
<script>
  import { onMount } from 'svelte';

  let { bands = [], width = 300, height = 150 } = $props();

  let canvas;

  // Calculate amplitude at given frequency
  function calculateResponseAtFrequency(frequency) {
    let totalDb = 0;

    for (const band of bands) {
      // Simple peak filter approximation
      const Q = band.q || 1;
      const bandwidth = frequency / (2 * Q);
      const distance = Math.abs(frequency - band.frequency) / bandwidth;
      const boost = band.gain * Math.exp(-distance * distance);
      totalDb += boost;
    }

    return totalDb;
  }

  function drawGraph() {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size accounting for pixel density
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    // Frequency grid lines (logarithmic)
    const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    for (const freq of frequencies) {
      const x = Math.log(freq / 20) / Math.log(20000 / 20) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      ctx.fillStyle = '#999';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${freq}Hz`, x, height - 2);
    }

    // dB grid lines
    for (let db = -24; db <= 24; db += 6) {
      const y = height / 2 - (db / 48) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.fillStyle = '#999';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${db}dB`, width - 2, y + 3);
    }

    // Draw response curve
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const linearFreq = x / width;
      const frequency = 20 * Math.pow(20000 / 20, linearFreq);
      const responseDb = calculateResponseAtFrequency(frequency);
      const y = height / 2 - (responseDb / 48) * height;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw center line (0 dB)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  $effect(() => {
    drawGraph();
  });

  onMount(() => {
    drawGraph();
  });
</script>

<div class="graph-container">
  <canvas bind:this={canvas} {width} {height} />
</div>

<style>
  .graph-container {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    background: #fafafa;
  }

  canvas {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
```

**Learning Outcomes**:
- ✅ Draw to canvas with real-time updates
- ✅ Understand frequency response curves
- ✅ Implement logarithmic scales
- ✅ Render complex visual data

### Exercise 3.2: ADSR Envelope Editor

**Concepts**:
- Interactive graph manipulation
- Draggable points
- Path drawing

**Task**: Create a clickable/draggable ADSR envelope editor.

```svelte
<!-- src/lib/components/ADSREnvelopeEditor.svelte -->
<script>
  let { attack = 0.1, decay = 0.2, sustain = 0.7, release = 0.5 } = $props();

  let canvas;
  let isDragging = $state(false);
  let dragPoint = $state(null);

  const totalTime = attack + decay + release;
  const sustainLevel = sustain;

  function getPointPositions(width, height) {
    const peaks = [
      { x: (attack / totalTime) * width, y: height * 0.1, label: 'A' }, // Attack peak
      { x: ((attack + decay) / totalTime) * width, y: height * (1 - sustainLevel) * 0.8 + height * 0.1, label: 'D' }, // Decay
      { x: ((attack + decay) / totalTime) * width, y: height * (1 - sustainLevel) * 0.8 + height * 0.1, label: 'S' }, // Sustain (same as D end)
      { x: width, y: height * 0.9, label: 'R' } // Release end
    ];
    return peaks;
  }

  function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const points = getPointPositions(canvas.width, canvas.height);
    for (let i = 0; i < points.length; i++) {
      const dist = Math.hypot(points[i].x - x, points[i].y - y);
      if (dist < 8) {
        isDragging = true;
        dragPoint = i;
        break;
      }
    }
  }

  function handleMouseMove(e) {
    if (!isDragging || dragPoint === null) return;

    const rect = canvas.getBoundingClientRect();
    const y = Math.max(0, Math.min(canvas.height, e.clientY - rect.top));

    // Convert Y position back to attack/decay/sustain/release values
    // (Implementation simplified)

    drawEnvelope();
  }

  function handleMouseUp() {
    isDragging = false;
    dragPoint = null;
  }

  function drawEnvelope() {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    const points = getPointPositions(width, height);

    // Draw envelope path
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.9); // Start at 0
    ctx.lineTo(points[0].x, points[0].y); // Attack
    ctx.lineTo(points[1].x, points[1].y); // Decay to Sustain
    ctx.lineTo(points[3].x, points[3].y); // Release

    ctx.stroke();

    // Draw control points
    for (const point of points) {
      ctx.fillStyle = dragPoint === points.indexOf(point) ? '#ef4444' : '#2563eb';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, point.x, point.y - 12);
    }
  }

  $effect(() => {
    drawEnvelope();
  });
</script>

<div class="editor">
  <canvas
    bind:this={canvas}
    width={300}
    height={150}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
  />
  <div class="info">
    <span>A: {(attack * 1000).toFixed(0)}ms</span>
    <span>D: {(decay * 1000).toFixed(0)}ms</span>
    <span>S: {(sustain * 100).toFixed(0)}%</span>
    <span>R: {(release * 1000).toFixed(0)}ms</span>
  </div>
</div>

<style>
  .editor {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 12px;
    background: #fafafa;
  }

  canvas {
    display: block;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 12px;
  }

  .info {
    display: flex;
    justify-content: space-around;
    font-size: 12px;
    font-family: monospace;
  }
</style>
```

**Learning Outcomes**:
- ✅ Handle mouse events on canvas
- ✅ Draw interactive controls
- ✅ Implement dragging behavior
- ✅ Real-time visualization updates

### Exercise 3.3: EQBand Component

**Concepts**:
- Multi-parameter control
- Visual band representation
- Integration with graph

**Task**: Create a single EQ band with Frequency, Q, and Gain, visualized on the graph.

```svelte
<!-- src/lib/components/EQBand.svelte -->
<script>
  import FrequencyKnob from './FrequencyKnob.svelte';
  import Knob from './Knob.svelte';

  let {
    frequency = 1000,
    q = 1,
    gain = 0,
    bandIndex = 0,
    onRemove = null
  } = $props();

  const MIN_FREQUENCY = 20;
  const MAX_FREQUENCY = 20000;
  const MIN_Q = 0.1;
  const MAX_Q = 10;
  const MIN_GAIN = -24;
  const MAX_GAIN = 24;

  let displayQ = $derived(q.toFixed(2));
  let displayGain = $derived(gain > 0 ? `+${gain.toFixed(1)}` : `${gain.toFixed(1)}`);
</script>

<div class="eq-band">
  <div class="header">
    <span class="title">Band {bandIndex + 1}</span>
    {#if onRemove}
      <button class="remove-btn" onclick={() => onRemove(bandIndex)}>×</button>
    {/if}
  </div>

  <div class="controls">
    <div class="control-item">
      <label>Frequency</label>
      <FrequencyKnob bind:value={frequency} min={MIN_FREQUENCY} max={MAX_FREQUENCY} />
    </div>

    <div class="control-item">
      <label>Q</label>
      <Knob bind:value={q} min={MIN_Q} max={MAX_Q} step={0.05} />
      <span class="value">{displayQ}</span>
    </div>

    <div class="control-item">
      <label>Gain</label>
      <Knob bind:value={gain} min={MIN_GAIN} max={MAX_GAIN} step={0.5} />
      <span class="value">{displayGain} dB</span>
    </div>
  </div>
</div>

<style>
  .eq-band {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 12px;
    background: linear-gradient(to bottom, #fafafa, #fff);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .title {
    font-size: 12px;
    font-weight: bold;
  }

  .remove-btn {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .control-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  label {
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    color: #666;
  }

  .value {
    font-size: 10px;
    font-family: monospace;
    color: #999;
  }
</style>
```

**Learning Outcomes**:
- ✅ Compose specialized knobs into band components
- ✅ Manage multiple inter-related parameters
- ✅ Design visual hierarchy

---

## Phase 4: Advanced Interactions (Weeks 8-10)

### Goal
Build complex multi-parameter systems with matrices, XY pads, and advanced automation. Learn optimization and state management at scale.

### Exercise 4.1: XY Pad (2D Control)

**Concepts**:
- 2D coordinate mapping
- Independent X/Y values
- Visual feedback

**Task**: Create an XY pad for controlling two parameters simultaneously.

```svelte
<!-- src/lib/components/XYPad.svelte -->
<script>
  let { xValue = 0.5, yValue = 0.5, xLabel = 'X', yLabel = 'Y' } = $props();

  let canvas;
  let isDragging = $state(false);

  function handleMouseDown(e) {
    isDragging = true;
    updatePosition(e);
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    updatePosition(e);
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function updatePosition(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));

    xValue = x;
    yValue = y;
  }

  function drawPad() {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e0e7ff');
    gradient.addColorStop(1, '#c7d2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = (i / 4) * width;
      const y = (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center crosshair
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Control point
    const pointX = xValue * width;
    const pointY = (1 - yValue) * height;

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  $effect(() => {
    drawPad();
  });
</script>

<div class="xy-pad-container">
  <canvas
    bind:this={canvas}
    width={200}
    height={200}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
  />
  <div class="labels">
    <div class="x-label">{xLabel}: {(xValue * 100).toFixed(0)}%</div>
    <div class="y-label">{yLabel}: {(yValue * 100).toFixed(0)}%</div>
  </div>
</div>

<style>
  .xy-pad-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  canvas {
    border: 2px solid #cbd5e1;
    border-radius: 4px;
    cursor: crosshair;
    background: white;
  }

  .labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-family: monospace;
  }
</style>
```

**Learning Outcomes**:
- ✅ Handle 2D coordinate input
- ✅ Map 2D space to parameter values
- ✅ Create complex visual feedback

### Exercise 4.2: Multi-Band EQ Matrix

**Concepts**:
- Multiple independent components coordinated
- Complex state management
- Interactive frequency response visualization

**Task**: Create a full EQ with 4-10 bands, interactive graph, and real-time response curve.

```svelte
<!-- src/lib/components/EQMatrix.svelte -->
<script>
  import EQBand from './EQBand.svelte';
  import FrequencyResponseGraph from './FrequencyResponseGraph.svelte';

  let bands = $state([
    { frequency: 100, q: 0.7, gain: 0 },
    { frequency: 500, q: 0.7, gain: 0 },
    { frequency: 2000, q: 0.7, gain: 0 },
    { frequency: 8000, q: 0.7, gain: 0 }
  ]);

  let selectedBand = $state(null);

  function addBand() {
    bands = [...bands, { frequency: 1000, q: 0.7, gain: 0 }];
  }

  function removeBand(index) {
    bands = bands.filter((_, i) => i !== index);
  }

  function resetAll() {
    bands = bands.map((b) => ({ ...b, gain: 0 }));
  }
</script>

<div class="eq-matrix">
  <div class="header">
    <h2>Parametric Equalizer</h2>
    <div class="buttons">
      <button onclick={addBand}>Add Band</button>
      <button onclick={resetAll}>Reset</button>
    </div>
  </div>

  <FrequencyResponseGraph {bands} width={500} height={150} />

  <div class="bands-container">
    {#each bands as band, index (index)}
      <EQBand
        bind:frequency={band.frequency}
        bind:q={band.q}
        bind:gain={band.gain}
        {index}
        onRemove={removeBand}
      />
    {/each}
  </div>
</div>

<style>
  .eq-matrix {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    background: #fafafa;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  h2 {
    margin: 0;
    font-size: 18px;
  }

  .buttons {
    display: flex;
    gap: 8px;
  }

  button {
    padding: 8px 16px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
  }

  button:hover {
    background: #1d4ed8;
  }

  .bands-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-top: 20px;
  }
</style>
```

**Learning Outcomes**:
- ✅ Manage state across multiple related components
- ✅ Coordinate parameter updates
- ✅ Build professional audio UI panel

### Exercise 4.3: Parameter Automation Timeline

**Concepts**:
- Time-based parameter changes
- Curve editing
- Playback visualization

**Task**: Create a simple automation editor for recording parameter changes over time.

```svelte
<!-- src/lib/components/AutomationTrack.svelte -->
<script>
  let { parameter = 'Frequency', points = [], duration = 4 } = $props();

  let canvas;
  let isDrawing = $state(false);
  let currentTime = $state(0);
  let isPlaying = $state(false);

  function addPoint(x, y) {
    const time = (x / canvas.width) * duration;
    const value = 1 - y / canvas.height;

    points = [
      ...points,
      { time, value },
      // Re-sort by time
    ].sort((a, b) => a.time - b.time);
  }

  function clearPoints() {
    points = [];
  }

  function play() {
    isPlaying = true;
    const startTime = performance.now();

    function update(now) {
      currentTime = ((now - startTime) / 1000) % duration;
      if (isPlaying) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function drawAutomation() {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = (i / 4) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw automation curve
    if (points.length > 0) {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < points.length; i++) {
        const x = (points[i].time / duration) * width;
        const y = height - points[i].value * height;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw points
    for (const point of points) {
      const x = (point.time / duration) * width;
      const y = height - point.value * height;

      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Playback cursor
    const cursorX = (currentTime / duration) * width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, height);
    ctx.stroke();
  }

  $effect(() => {
    drawAutomation();
  });
</script>

<div class="automation-track">
  <div class="header">
    <h3>{parameter} Automation</h3>
    <div class="controls">
      <button onclick={() => play()} disabled={isPlaying}>Play</button>
      <button onclick={() => (isPlaying = false)}>Stop</button>
      <button onclick={clearPoints}>Clear</button>
    </div>
  </div>

  <canvas
    bind:this={canvas}
    width={400}
    height={100}
    onclick={(e) => {
      const rect = canvas.getBoundingClientRect();
      addPoint(e.clientX - rect.left, e.clientY - rect.top);
    }}
  />

  <div class="info">
    <span>Time: {currentTime.toFixed(2)}s / {duration}s</span>
    <span>Points: {points.length}</span>
  </div>
</div>

<style>
  .automation-track {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 12px;
    background: white;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  h3 {
    margin: 0;
    font-size: 14px;
  }

  .controls {
    display: flex;
    gap: 4px;
  }

  button {
    padding: 4px 8px;
    font-size: 11px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 2px;
    cursor: pointer;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  canvas {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    width: 100%;
    display: block;
    margin-bottom: 8px;
    cursor: crosshair;
  }

  .info {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-family: monospace;
  }
</style>
```

**Learning Outcomes**:
- ✅ Implement time-based animations
- ✅ Create automation editing interfaces
- ✅ Manage complex parameter curves

---

## Svelte 5 Best Practices for Audio Components

### 1. **Use Runes, Not Legacy Patterns**

```svelte
<!-- ✅ CORRECT: Svelte 5 Runes -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<!-- ❌ WRONG: Svelte 4 Style (don't do this in Svelte 5) -->
<script>
  let count = 0;
  $: doubled = count * 2;
</script>
```

### 2. **Props with $props Rune**

```svelte
<!-- ✅ CORRECT: Svelte 5 Props -->
<script>
  let { value = 440, min = 20, max = 20000 } = $props();
</script>

<!-- ❌ WRONG: Svelte 4 Style -->
<script>
  export let value = 440;
  export let min = 20;
  export let max = 20000;
</script>
```

### 3. **Event Handlers: Modern Syntax**

```svelte
<!-- ✅ CORRECT: Modern event handler syntax -->
<button onclick={() => count++}>Click me</button>
<input onchange={handleChange} />

<!-- ❌ WRONG: Legacy syntax -->
<button on:click={() => count++}>Click me</button>
<input on:change={handleChange} />
```

### 4. **Computed Values: $derived vs $derived.by**

```svelte
<script>
  let frequency = $state(440);

  // ✅ Simple: Use $derived for expressions
  let doubleFreq = $derived(frequency * 2);

  // ✅ Complex: Use $derived.by for multi-line logic
  let frequencyBand = $derived.by(() => {
    if (frequency < 250) return 'Low';
    if (frequency < 2000) return 'Mid';
    return 'High';
  });
</script>
```

### 5. **Effects for Side Effects Only**

```svelte
<script>
  let frequency = $state(440);

  // ✅ CORRECT: Use $effect for side effects
  $effect(() => {
    console.log('Frequency changed to', frequency);
    // Update audio node, trigger animations, etc.
    oscillator?.setFrequency(frequency);
  });

  // ❌ WRONG: Don't use $effect to update state
  let displayed = $state('');
  $effect(() => {
    displayed = frequency.toString(); // Bad! Use $derived instead
  });
</script>
```

### 6. **Binding: Two-Way Data Flow**

```svelte
<script>
  let value = $state(0);
</script>

<!-- ✅ CORRECT: Use bind: for two-way binding -->
<input bind:value />

<!-- ❌ WRONG: Manual sync -->
<input value={value} onchange={(e) => value = e.target.value} />
```

### 7. **Accessibility: Always Include Labels**

```svelte
<!-- ✅ CORRECT: Proper accessibility -->
<label for="frequency-input">Frequency (Hz)</label>
<input id="frequency-input" type="number" bind:value={frequency} />

<!-- Also use aria-label for controls without labels -->
<Knob aria-label="Filter cutoff frequency" bind:value={cutoff} />

<!-- ❌ WRONG: No accessibility -->
<Knob bind:value={cutoff} />
```

### 8. **Scoped Styles: Always Use Them**

```svelte
<script>
  let { label } = $props();
</script>

<div class="control">
  <label>{label}</label>
</div>

<!-- ✅ CORRECT: Scoped styles (default in Svelte) -->
<style>
  .control {
    padding: 8px;
  }
  label {
    font-weight: bold;
  }
</style>

<!-- ❌ WRONG: Global styles leak into other components -->
<style global>
  .control { padding: 8px; }
</style>
```

### 9. **Conditional Rendering with {#if}**

```svelte
<script>
  let showAdvanced = $state(false);
</script>

<!-- ✅ CORRECT: Use {#if} blocks -->
{#if showAdvanced}
  <AdvancedControls />
{:else}
  <BasicControls />
{/if}

<!-- ❌ WRONG: Don't use ternaries in markup -->
<div>{showAdvanced ? <AdvancedControls /> : <BasicControls />}</div>
```

### 10. **Arrays and Lists with {#each}**

```svelte
<script>
  let bands = $state([
    { id: 1, frequency: 100 },
    { id: 2, frequency: 1000 }
  ]);
</script>

<!-- ✅ CORRECT: Always use key for lists -->
{#each bands as band (band.id)}
  <EQBand {band} />
{/each}

<!-- ❌ WRONG: No key (will break animations/state) -->
{#each bands as band}
  <EQBand {band} />
{/each}
```

---

## Design System Best Practices

### 1. **Naming Convention for Audio Components**

```
AudioKnob.svelte (base audio control)
FrequencyKnob.svelte (specialized for Hz)
GainSlider.svelte (specialized for dB)
TimeKnob.svelte (specialized for ms/s)
CompressorPanel.svelte (group of related controls)
```

### 2. **File Organization**

```
shared/ui-components/
├── controls/
│   ├── Knob.svelte
│   ├── Slider.svelte
│   └── Button.svelte
├── audio/
│   ├── FrequencyKnob.svelte
│   ├── GainSlider.svelte
│   ├── Meter.svelte
│   └── TimeKnob.svelte
├── visualizations/
│   ├── FrequencyResponseGraph.svelte
│   ├── WaveformDisplay.svelte
│   └── SpectrumAnalyzer.svelte
├── panels/
│   ├── CompressorPanel.svelte
│   ├── EQBand.svelte
│   └── FilterPanel.svelte
└── advanced/
    ├── EQMatrix.svelte
    ├── XYPad.svelte
    └── AutomationTrack.svelte
```

### 3. **Consistent Value Ranges**

```javascript
// Frequency: Always 20Hz - 20kHz (human hearing range)
export const FREQUENCY_RANGE = { min: 20, max: 20000 };

// Gain: ±24dB is standard for most plugins
export const GAIN_RANGE = { min: -24, max: 24 };

// Time: milliseconds internally, display varies
export const TIME_RANGE = { min: 1, max: 5000 }; // 1ms - 5s

// Q (resonance): 0.1 (narrow) - 20 (wide)
export const Q_RANGE = { min: 0.1, max: 20 };
```

### 4. **Accessibility Requirements**

- ✅ All controls have `aria-label`
- ✅ Keyboard support (arrow keys for sliders)
- ✅ High contrast (minimum WCAG AA 4.5:1 ratio)
- ✅ Text input alternative for all knobs
- ✅ Clear labeling (Hz, dB, ms units)

### 5. **Performance Optimization**

```svelte
<!-- Use $derived for computed values (doesn't trigger reactivity) -->
let displayHz = $derived(Math.round(frequency));

<!-- Use $effect sparingly (only when needed) -->
$effect(() => {
  // Only runs when dependencies change
  oscillator.setFrequency(frequency);
});

<!-- Avoid unnecessary canvas redraws -->
let lastDrawnValue = $state(0);
$effect(() => {
  if (Math.abs(currentValue - lastDrawnValue) > THRESHOLD) {
    redraw();
    lastDrawnValue = currentValue;
  }
});
```

---

## Exercise Roadmap

### Week 1-2: Foundations
- [ ] Exercise 1.1: Enhanced Knob with Text Display
- [ ] Exercise 1.2: Logarithmic Frequency Knob
- [ ] Exercise 1.3: Decibel Slider

### Week 3-4: Intermediate
- [ ] Exercise 2.1: FrequencyKnob Component
- [ ] Exercise 2.2: Meter (VU Meter)
- [ ] Exercise 2.3: CompressorPanel

### Week 5-7: Complex
- [ ] Exercise 3.1: Frequency Response Graph
- [ ] Exercise 3.2: ADSR Envelope Editor
- [ ] Exercise 3.3: EQBand Component

### Week 8-10: Advanced
- [ ] Exercise 4.1: XY Pad
- [ ] Exercise 4.2: Multi-Band EQ Matrix
- [ ] Exercise 4.3: Parameter Automation Timeline

### Final Project: Complete Audio Plugin UI
- [ ] Design complete plugin interface (synth, EQ, effects)
- [ ] Integrate all components
- [ ] Add preset save/load
- [ ] Implement MIDI mapping
- [ ] Performance testing and optimization

---

## Resources & References

### Official Documentation
- [Svelte 5 Runes](https://svelte.dev/docs)
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [SVG Basics](https://developer.mozilla.org/en-US/docs/Web/SVG)

### Audio Plugin Design
- [Voger Design Portfolio](https://vogerdesign.com) - Industry-leading audio UI examples
- [JUCE Framework](https://juce.com) - Professional audio plugin framework
- [KVRAudio Forums](https://www.kvraudio.com/forum) - Audio developer community

### Inspiration & Reference
- iZotope Ozone (real-time visualizations, clean UI)
- FabFilter Pro-Q 3 (interactive EQ editor)
- Serum (waveform display, modern design)
- Waves SSL (professional mixing tools)

### Design Patterns
- **Knob Design**: Multi-layer construction (base, rotate, highlight)
- **Frequency Response**: Logarithmic frequency axis, linear dB axis
- **EQ Bands**: Draggable points on frequency response curve
- **Automation**: Time-based curve editing with playback

---

## Getting Started

1. **Start with Phase 1** (Foundations) - Understand value mapping and Svelte Runes
2. **Build each exercise** in order - Each builds on previous knowledge
3. **Create your own variations** - Experiment with colors, shapes, interactions
4. **Study existing plugins** - Analyze professional UI patterns
5. **Join the community** - Share your work, get feedback

---

## Quick Reference: Svelte 5 Audio Component Patterns

### Component Template

```svelte
<script>
  // 1. Import dependencies
  import { getAudioContext } from '@audio/utils/audio-context';
  import Knob from '@ui/controls/Knob.svelte';

  // 2. Declare props with $props
  let {
    value = $bindable(440),
    min = 20,
    max = 20000,
    label = 'Frequency'
  } = $props();

  // 3. Internal state with $state
  let isActive = $state(false);

  // 4. Simple derivations with $derived
  let displayValue = $derived(value.toFixed(1));

  // 5. Complex derivations with $derived.by
  let frequency = $derived.by(() => {
    return value * 2; // Could be much more complex
  });

  // 6. Side effects with $effect
  $effect(() => {
    const ctx = getAudioContext();
    console.log('Frequency updated to', frequency);
    // Update Web Audio API nodes here
  });

  // 7. Event handlers (modern syntax)
  function handleChange(newValue) {
    // Validation
    if (newValue >= min && newValue <= max) {
      // Direct mutation—no setter needed
      value = newValue;
    }
  }
</script>

<!-- 8. Markup: semantic HTML + Svelte components -->
<div class="frequency-control" class:active={isActive}>
  <label for="freq-knob">{label}</label>

  <Knob
    id="freq-knob"
    bind:value
    {min}
    {max}
    aria-label={`${label} in Hz`}
  />

  <div class="display">
    <span>{displayValue} Hz</span>
  </div>

  <!-- Conditional rendering -->
  {#if isActive}
    <p>Frequency is locked</p>
  {/if}
</div>

<!-- 9. Scoped styles (default in Svelte) -->
<style>
  .frequency-control {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
    background: #fafafa;
  }

  .frequency-control.active {
    background: #e8f5e9;
  }

  label {
    font-weight: bold;
    font-size: 14px;
  }

  .display {
    font-family: monospace;
    font-size: 12px;
    padding: 4px 8px;
    background: white;
    border-radius: 4px;
    text-align: center;
  }
</style>
```

### State Management Cheat Sheet

| Pattern | Use Case | Example |
|---------|----------|---------|
| `$state(value)` | Mutable state | `let freq = $state(440)` |
| `$state.raw(value)` | Non-reactive state | `let bigArray = $state.raw([...])` |
| `$derived(expr)` | Simple computed value | `let doubled = $derived(freq * 2)` |
| `$derived.by(fn)` | Complex computed value | `let band = $derived.by(() => {...})` |
| `$effect(() => {...})` | Side effects (audio, DOM) | `$effect(() => osc?.setFreq(freq))` |
| `$effect.pre(() => {...})` | Before DOM update | `$effect.pre(() => {...})` |
| `$props()` | Component props | `let { value } = $props()` |
| `$bindable()` | Two-way prop binding | `let { value = $bindable() } = $props()` |

### Event Handler Patterns

```svelte
<script>
  let count = $state(0);

  // Inline handlers (modern syntax)
  function handleClick() { count++; }
</script>

<!-- Modern: use on* attributes -->
<button onclick={handleClick}>Click</button>
<input onchange={(e) => count = parseInt(e.target.value)} />
<input bind:value={count} /> <!-- Even better: use binding -->

<!-- Keyboard events -->
<input
  onkeydown={(e) => {
    if (e.key === 'Enter') { /* handle */ }
  }}
/>

<!-- Mouse events -->
<div
  onmousedown={() => console.log('down')}
  onmouseup={() => console.log('up')}
  onmousemove={(e) => console.log(e.clientX, e.clientY)}
/>
```

### Reactivity Best Practices

```svelte
<script>
  // DO: Use $state for mutable values
  let value = $state(0);

  // DO: Use $derived for computed values
  let doubled = $derived(value * 2);

  // DO: Update state directly
  value = 5; // ✅ Just assign

  // DON'T: Use $effect to update state
  $effect(() => {
    doubled = value * 2; // ❌ Bad! Use $derived instead
  });

  // DO: Use $effect for side effects
  $effect(() => {
    console.log('Value changed:', value);
  });

  // DO: Limit $effect dependencies with untrack (if needed)
  $effect(() => {
    console.log(value); // Tracked
    untrack(() => {
      console.log('Hidden'); // Not tracked
    });
  });
</script>
```

---

**Last Updated**: October 2025
**Svelte Version**: 5.0+
**Status**: Ready to implement exercises
**Next Step**: Start with Exercise 1.1 (Enhanced Knob)

## Quick Links

- **Svelte 5 Official Docs**: https://svelte.dev/docs
- **Web Audio API Reference**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Audio Plugin UX Research**: https://vogerdesign.com
- **Din-ZAudioToolLibrary**: `shared/audio-core` and `shared/ui-components`
