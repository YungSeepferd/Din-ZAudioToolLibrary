# UI Components Library

**Reusable Svelte 5 components for audio plugin interfaces**

The `ui-components` library provides production-ready UI controls and visualizers for building audio plugin interfaces with Svelte 5. All components follow modern Svelte 5 Runes patterns and are optimized for real-time audio parameter control.

## 📦 Installation & Import

### In a Plugin Project

The library is available via the `@ui` import alias:

```javascript
// Controls
import Knob from '@ui/controls/Knob.svelte';
import VintageKnob from '@ui/controls/VintageKnob.svelte';
import Slider from '@ui/controls/Slider.svelte';
import Button from '@ui/controls/Button.svelte';

// Visualizers
import SpectrumAnalyzer from '@ui/visualizers/SpectrumAnalyzer.svelte';
import VUMeter from '@ui/visualizers/VUMeter.svelte';
import EnvelopeGraph from '@ui/visualizers/EnvelopeGraph.svelte';
```

### Direct Import (without alias)

```javascript
import Knob from '../shared/ui-components/controls/Knob.svelte';
```

## 🎛️ Components Overview

| Component | Category | Purpose | Test Coverage |
|-----------|----------|---------|---------------|
| **Knob** | Control | Basic rotary control for numeric parameters | ❌ No tests |
| **VintageKnob** | Control | Styled rotary control with vintage aesthetic | ❌ No tests |
| **Slider** | Control | Linear horizontal/vertical slider | ❌ No tests |
| **Button** | Control | Styled interactive button | ❌ No tests |
| **SpectrumAnalyzer** | Visualizer | Real-time frequency spectrum (FFT) | ❌ No tests |
| **VUMeter** | Visualizer | Volume level meter (peak + RMS) | ❌ No tests |
| **EnvelopeGraph** | Visualizer | ADSR envelope visualization | ❌ No tests |

---

## 🎚️ Controls

### Knob (`controls/Knob.svelte`)

Basic rotary control for numeric parameters with mouse/wheel interaction.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current value (bindable with `bind:value`) |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Increment step size |
| `label` | `string` | `''` | Display label |
| `showValue` | `boolean` | `false` | Show numeric value display |

#### Events

- **Mouse drag**: Click and drag vertically to change value
- **Mouse wheel**: Scroll to increment/decrement value
- **Keyboard**: Focus and use arrow keys

#### Example

```svelte
<script>
  import Knob from '@ui/controls/Knob.svelte';

  let frequency = $state(440);

  // Reactive to frequency changes
  $effect(() => {
    console.log('Frequency changed:', frequency);
    // Update audio parameter here
  });
</script>

<Knob
  bind:value={frequency}
  min={20}
  max={20000}
  step={1}
  label="Frequency"
  showValue={true}
/>

<p>Current frequency: {frequency} Hz</p>
```

#### Styling

The Knob component includes basic CSS. Override with custom styles:

```css
:global(.knob-container) {
  /* Custom knob container styles */
}

:global(.knob) {
  /* Custom knob styles */
}

:global(.knob-indicator) {
  /* Custom indicator line styles */
}
```

---

### VintageKnob (`controls/VintageKnob.svelte`)

Styled rotary control with vintage aesthetic, ideal for audio plugin UIs. Includes better visual feedback and skeuomorphic design.

#### Props

Same as Knob, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `'#d4a574'` | Knob color (vintage gold by default) |
| `size` | `number` | `60` | Knob diameter in pixels |

#### Example

```svelte
<script>
  import VintageKnob from '@ui/controls/VintageKnob.svelte';

  let cutoff = $state(1000);
  let resonance = $state(1);
</script>

<div class="synth-controls">
  <VintageKnob
    bind:value={cutoff}
    min={20}
    max={20000}
    label="Cutoff"
    color="#d4a574"
    size={70}
  />

  <VintageKnob
    bind:value={resonance}
    min={0.1}
    max={20}
    step={0.1}
    label="Resonance"
    color="#c49a6c"
    size={60}
  />
</div>
```

---

### Slider (`controls/Slider.svelte`)

Linear slider for parameter control with horizontal or vertical orientation.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current value (bindable with `bind:value`) |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Increment step size |
| `label` | `string` | `''` | Display label |
| `vertical` | `boolean` | `false` | Vertical orientation (default: horizontal) |
| `showValue` | `boolean` | `false` | Show numeric value display |

#### Example

```svelte
<script>
  import Slider from '@ui/controls/Slider.svelte';

  let volume = $state(0.7);
  let pan = $state(0); // -1 (left) to +1 (right)
</script>

<!-- Horizontal slider -->
<Slider
  bind:value={volume}
  min={0}
  max={1}
  step={0.01}
  label="Volume"
  showValue={true}
/>

<!-- Vertical slider -->
<Slider
  bind:value={pan}
  min={-1}
  max={1}
  step={0.01}
  label="Pan"
  vertical={true}
/>
```

---

### Button (`controls/Button.svelte`)

Styled interactive button for triggering actions.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Button'` | Button text |
| `variant` | `string` | `'primary'` | Style variant: `'primary'`, `'secondary'`, `'danger'` |
| `disabled` | `boolean` | `false` | Disable button interaction |
| `onclick` | `function` | `undefined` | Click handler (Svelte 5 style) |

#### Example

```svelte
<script>
  import Button from '@ui/controls/Button.svelte';

  let isPlaying = $state(false);

  function togglePlayback() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      // Start audio playback
    } else {
      // Stop audio playback
    }
  }
</script>

<Button
  label={isPlaying ? 'Stop' : 'Play'}
  variant="primary"
  onclick={togglePlayback}
/>

<Button
  label="Reset"
  variant="secondary"
  onclick={() => console.log('Reset clicked')}
/>

<Button
  label="Delete"
  variant="danger"
  disabled={!isPlaying}
  onclick={() => console.log('Delete clicked')}
/>
```

---

## 📊 Visualizers

### SpectrumAnalyzer (`visualizers/SpectrumAnalyzer.svelte`)

Real-time frequency spectrum visualization using Web Audio API FFT analysis.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `audioContext` | `AudioContext` | `undefined` | Web Audio AudioContext instance |
| `sourceNode` | `AudioNode` | `undefined` | Audio node to analyze |
| `width` | `number` | `600` | Canvas width in pixels |
| `height` | `number` | `150` | Canvas height in pixels |
| `fftSize` | `number` | `2048` | FFT size (must be power of 2: 256-32768) |
| `smoothing` | `number` | `0.8` | Smoothing time constant (0-1) |

#### Features

- Real-time FFT visualization (frequency domain)
- Logarithmic frequency scale (matches human hearing)
- Smooth animation with configurable smoothing
- Low CPU overhead (uses Canvas 2D, not WebGL)
- Educational: shows effect of harmonics, filtering, saturation

#### Example

```svelte
<script>
  import { onMount } from 'svelte';
  import { getAudioContext } from '@audio/utils/audio-context';
  import { createOscillator } from '@audio/synthesis/oscillators';
  import SpectrumAnalyzer from '@ui/visualizers/SpectrumAnalyzer.svelte';

  let audioContext = $state(null);
  let masterGain = $state(null);

  onMount(() => {
    audioContext = getAudioContext();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);

    // Create sound source
    const osc = createOscillator('sawtooth', 220);
    osc.connect(masterGain);
    osc.start();
  });
</script>

{#if audioContext && masterGain}
  <SpectrumAnalyzer
    audioContext={audioContext}
    sourceNode={masterGain}
    width={800}
    height={200}
    fftSize={4096}
    smoothing={0.85}
  />
{/if}
```

#### What You'll See

- **Pure sine wave**: Single peak at fundamental frequency
- **Sawtooth wave**: Fundamental + harmonics decreasing in amplitude
- **Square wave**: Fundamental + odd harmonics only
- **With saturation**: Additional harmonic content (distortion)
- **With filter**: Reduced high-frequency content

---

### VUMeter (`visualizers/VUMeter.svelte`)

Volume Unit meter showing peak and RMS levels in real-time.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `audioContext` | `AudioContext` | `undefined` | Web Audio AudioContext instance |
| `sourceNode` | `AudioNode` | `undefined` | Audio node to monitor |
| `width` | `number` | `60` | Meter width in pixels |
| `height` | `number` | `200` | Meter height in pixels |
| `orientation` | `string` | `'vertical'` | Orientation: `'vertical'` or `'horizontal'` |

#### Features

- Peak level indicator (fast attack, slow decay)
- RMS level indicator (average loudness)
- Clipping indicator (red when level > 0 dBFS)
- Calibrated in dBFS (decibels relative to full scale)
- Smooth ballistics (like analog VU meters)

#### Example

```svelte
<script>
  import { getAudioContext } from '@audio/utils/audio-context';
  import VUMeter from '@ui/visualizers/VUMeter.svelte';

  let audioContext = $state(getAudioContext());
  let masterGain = $state(audioContext.createGain());
  masterGain.connect(audioContext.destination);
</script>

<div class="meter-section">
  <VUMeter
    audioContext={audioContext}
    sourceNode={masterGain}
    width={50}
    height={200}
    orientation="vertical"
  />

  <p>Master Level</p>
</div>
```

---

### EnvelopeGraph (`visualizers/EnvelopeGraph.svelte`)

Visual representation of ADSR envelope with real-time parameter updates.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attack` | `number` | `0.1` | Attack time in seconds |
| `decay` | `number` | `0.2` | Decay time in seconds |
| `sustain` | `number` | `0.7` | Sustain level (0-1) |
| `release` | `number` | `0.5` | Release time in seconds |
| `width` | `number` | `400` | Canvas width in pixels |
| `height` | `number` | `150` | Canvas height in pixels |

#### Features

- Visual feedback for envelope parameters
- Shows attack, decay, sustain, release stages clearly
- Updates in real-time as parameters change
- Educational: helps understand ADSR envelope shaping
- Labeled stages for clarity

#### Example

```svelte
<script>
  import Knob from '@ui/controls/Knob.svelte';
  import EnvelopeGraph from '@ui/visualizers/EnvelopeGraph.svelte';

  let attack = $state(0.1);
  let decay = $state(0.2);
  let sustain = $state(0.7);
  let release = $state(0.5);
</script>

<div class="envelope-section">
  <!-- Visual feedback -->
  <EnvelopeGraph
    attack={attack}
    decay={decay}
    sustain={sustain}
    release={release}
    width={500}
    height={200}
  />

  <!-- Controls -->
  <div class="envelope-controls">
    <Knob bind:value={attack} min={0.001} max={2} step={0.001} label="Attack" />
    <Knob bind:value={decay} min={0.001} max={2} step={0.001} label="Decay" />
    <Knob bind:value={sustain} min={0} max={1} step={0.01} label="Sustain" />
    <Knob bind:value={release} min={0.01} max={5} step={0.01} label="Release" />
  </div>
</div>
```

---

## 🎹 Complete Example: Plugin Interface

Combining controls and visualizers for a complete plugin UI:

```svelte
<script>
  import { onMount } from 'svelte';
  import { getAudioContext, unlockAudioContext } from '@audio/utils/audio-context';
  import { createOscillator } from '@audio/synthesis/oscillators';
  import { createADSREnvelope } from '@audio/synthesis/envelopes';
  import { createLowPassFilter } from '@audio/synthesis/filters';

  // UI Components
  import VintageKnob from '@ui/controls/VintageKnob.svelte';
  import Slider from '@ui/controls/Slider.svelte';
  import Button from '@ui/controls/Button.svelte';
  import SpectrumAnalyzer from '@ui/visualizers/SpectrumAnalyzer.svelte';
  import VUMeter from '@ui/visualizers/VUMeter.svelte';
  import EnvelopeGraph from '@ui/visualizers/EnvelopeGraph.svelte';

  // State
  let audioContext = $state(null);
  let masterGain = $state(null);
  let isPlaying = $state(false);

  // Parameters
  let frequency = $state(440);
  let volume = $state(0.7);
  let cutoff = $state(2000);
  let resonance = $state(1);
  let attack = $state(0.1);
  let decay = $state(0.2);
  let sustain = $state(0.7);
  let release = $state(0.5);

  // Audio nodes (created on play)
  let osc = $state(null);
  let envelope = $state(null);
  let filter = $state(null);

  onMount(async () => {
    await unlockAudioContext();
    audioContext = getAudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioContext.destination);
  });

  // Update volume reactively
  $effect(() => {
    if (masterGain) {
      masterGain.gain.setValueAtTime(volume, audioContext.currentTime);
    }
  });

  // Update filter reactively
  $effect(() => {
    if (filter) {
      filter.setFrequency(cutoff);
      filter.setQ(resonance);
    }
  });

  function togglePlayback() {
    if (isPlaying) {
      // Stop
      if (envelope) envelope.release();
      setTimeout(() => {
        if (osc) osc.stop();
        osc = null;
        envelope = null;
        filter = null;
      }, release * 1000);
      isPlaying = false;
    } else {
      // Start
      osc = createOscillator('sawtooth', frequency);
      envelope = createADSREnvelope({ attack, decay, sustain, release });
      filter = createLowPassFilter(cutoff, resonance);

      // Connect: osc → envelope → filter → master
      osc.connect(envelope.gain);
      envelope.connect(filter.filter);
      filter.connect(masterGain);

      osc.start();
      envelope.trigger(1);
      isPlaying = true;
    }
  }
</script>

<div class="plugin-interface">
  <!-- Header -->
  <h1>My Synth Plugin</h1>

  <!-- Control Section -->
  <div class="controls">
    <div class="synth-params">
      <VintageKnob
        bind:value={frequency}
        min={20}
        max={4000}
        label="Frequency"
      />
      <VintageKnob
        bind:value={cutoff}
        min={20}
        max={20000}
        label="Cutoff"
      />
      <VintageKnob
        bind:value={resonance}
        min={0.1}
        max={20}
        step={0.1}
        label="Resonance"
      />
    </div>

    <div class="envelope-params">
      <VintageKnob
        bind:value={attack}
        min={0.001}
        max={2}
        step={0.001}
        label="Attack"
        size={50}
      />
      <VintageKnob
        bind:value={decay}
        min={0.001}
        max={2}
        step={0.001}
        label="Decay"
        size={50}
      />
      <VintageKnob
        bind:value={sustain}
        min={0}
        max={1}
        step={0.01}
        label="Sustain"
        size={50}
      />
      <VintageKnob
        bind:value={release}
        min={0.01}
        max={5}
        step={0.01}
        label="Release"
        size={50}
      />
    </div>
  </div>

  <!-- Visualizers -->
  <div class="visualizers">
    {#if audioContext && masterGain}
      <SpectrumAnalyzer
        audioContext={audioContext}
        sourceNode={masterGain}
        width={600}
        height={150}
      />

      <VUMeter
        audioContext={audioContext}
        sourceNode={masterGain}
        width={40}
        height={150}
      />
    {/if}

    <EnvelopeGraph
      attack={attack}
      decay={decay}
      sustain={sustain}
      release={release}
      width={400}
      height={150}
    />
  </div>

  <!-- Playback Controls -->
  <div class="playback">
    <Slider
      bind:value={volume}
      min={0}
      max={1}
      step={0.01}
      label="Master Volume"
    />

    <Button
      label={isPlaying ? 'Stop' : 'Play'}
      variant="primary"
      onclick={togglePlayback}
    />
  </div>
</div>

<style>
  .plugin-interface {
    padding: 2rem;
    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
    border-radius: 8px;
    color: #f0f0f0;
  }

  .controls {
    display: flex;
    gap: 2rem;
    margin: 2rem 0;
  }

  .synth-params,
  .envelope-params {
    display: flex;
    gap: 1rem;
  }

  .visualizers {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 2rem 0;
  }

  .playback {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
  }
</style>
```

---

## 🧪 Testing

### Current Test Coverage

- ❌ **No tests for UI components** (TODO for Phase 2)
  - Need component tests for all controls
  - Need visual regression tests for visualizers
  - Need accessibility tests (ARIA, keyboard navigation)

### Recommended Testing Strategy

```javascript
// Example test for Knob component (Vitest + Testing Library)
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Knob from './Knob.svelte';

describe('Knob Component', () => {
  it('renders with default props', () => {
    const { getByRole } = render(Knob);
    const slider = getByRole('slider');
    expect(slider).toBeInTheDocument();
  });

  it('updates value on mouse drag', async () => {
    let value = 50;
    const { getByRole } = render(Knob, {
      props: { value, min: 0, max: 100 }
    });

    const knob = getByRole('slider');
    await fireEvent.mouseDown(knob, { clientY: 100 });
    await fireEvent.mouseMove(window, { clientY: 50 }); // Drag up
    await fireEvent.mouseUp(window);

    // Value should increase
    expect(value).toBeGreaterThan(50);
  });
});
```

---

## 💡 Tips & Best Practices

### Svelte 5 Runes Integration

All components use Svelte 5 Runes. Bind to component values reactively:

```svelte
<script>
  import Knob from '@ui/controls/Knob.svelte';

  let frequency = $state(440);

  // React to changes with $effect
  $effect(() => {
    console.log('Frequency changed:', frequency);
    updateAudioParameter(frequency);
  });
</script>

<Knob bind:value={frequency} min={20} max={20000} />
```

### Accessibility

All control components include proper ARIA attributes:

- `role="slider"` for Knob and Slider
- `aria-label` for screen readers
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow` for current values
- `tabindex="0"` for keyboard focus

### Performance

- **Visualizers use requestAnimationFrame**: Smooth 60fps animation
- **Canvas 2D rendering**: Lower overhead than WebGL for simple visualizations
- **Throttled updates**: Parameter changes are scheduled to avoid clicks
- **Cleanup on unmount**: All animation loops and audio connections are properly cleaned up

### Styling

Components include minimal default styling. Customize with:

1. **Scoped styles** in your component:
```svelte
<style>
  :global(.knob-container) {
    /* Your custom styles */
  }
</style>
```

2. **CSS custom properties** (coming in future versions)

---

## 🔗 Related Documentation

- **[Svelte 5 Audio Guide](../../docs/guides/SVELTE5_AUDIO_GUIDE.md)** - Integrating components with audio
- **[Visual Feedback Guide](../../docs/guides/VISUAL-FEEDBACK-GUIDE.md)** - Implementing visualizers
- **[Design System](../../docs/projects/lofi-piano/DESIGN_SYSTEM.md)** - LoFi Piano aesthetic reference
- **[Audio Core Library](../audio-core/README.md)** - Audio DSP modules

---

## 🚀 Roadmap

### Planned Components (Phase 2)

- [ ] **Waveform Display** - Time-domain waveform visualization
- [ ] **XY Pad** - 2D parameter control (e.g., filter cutoff + resonance)
- [ ] **Toggle Switch** - Binary on/off control
- [ ] **Radio Group** - Multiple choice selection (waveform selector)
- [ ] **Dropdown Menu** - Preset selection
- [ ] **Modulation Matrix** - Visual routing of modulation sources

### Planned Features

- [ ] **CSS custom properties** - Theme tokens for easy styling
- [ ] **Accessibility improvements** - Better keyboard navigation
- [ ] **Touch support** - Mobile-friendly interactions
- [ ] **Preset system integration** - Save/load parameter states

---

## 📝 Contributing

### Adding New Components

1. Create component in `controls/` or `visualizers/` directory
2. Use Svelte 5 Runes (`$state`, `$props`, `$effect`)
3. Include comprehensive JSDoc comments
4. Add ARIA attributes for accessibility
5. Write component tests (target: 80% coverage)
6. Update this README with API documentation and examples

### Code Style

- Use Svelte 5 Runes (not Svelte 4 patterns)
- Destructure props with `let { prop } = $props()`
- Use `$effect` for side effects (e.g., audio parameter updates)
- Include cleanup in `$effect` return functions
- Follow naming conventions: PascalCase for components
- Add descriptive comments for complex interactions

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
**License**: MIT
**Maintainer**: Din-ZAudioToolLibrary Project

🎨 **Build beautiful audio interfaces!** ✨
