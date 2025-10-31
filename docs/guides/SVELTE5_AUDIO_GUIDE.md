# Building Audio UI with Svelte 5: Complete Guide

> **For Developers Learning Audio Engineering UI with Svelte 5**

This guide bridges Web Audio API and Svelte 5, showing you how to build professional audio plugin interfaces.

---

## Quick Start: Your First Audio Component

```svelte
<!-- A frequency knob that controls an oscillator -->
<script>
  import Knob from '@ui/controls/Knob.svelte';
  import { createOscillator } from '@audio/synthesis/oscillators';

  // 1. State with Svelte 5 $state rune
  let frequency = $state(440);
  let isPlaying = $state(false);

  let oscillator;

  // 2. Side effects with $effect
  $effect(() => {
    // Initialize audio
    if (isPlaying && !oscillator) {
      oscillator = createOscillator('sine', frequency);
      oscillator.connect(getAudioContext().destination);
      oscillator.start();
    }
  });

  // 3. React to state changes
  $effect(() => {
    oscillator?.setFrequency(frequency);
  });

  function togglePlay() {
    isPlaying = !isPlaying;
    if (!isPlaying) {
      oscillator?.stop();
    }
  }
</script>

<div class="synth">
  <!-- Use modern event handler syntax -->
  <Knob bind:value={frequency} min={20} max={20000} />
  <button onclick={togglePlay}>
    {isPlaying ? 'Stop' : 'Play'}
  </button>
</div>

<style>
  .synth {
    display: flex;
    gap: 12px;
    padding: 16px;
  }
</style>
```

---

## The Three Layers of Audio UI

### 1. **Audio Logic** (Web Audio API)
Located in `shared/audio-core/`
- Pure JavaScript functions
- Create and manage audio nodes
- Handle parameter scheduling

```javascript
// shared/audio-core/synth.js
export function createSynth(frequency, volume) {
  const osc = createOscillator('sine', frequency);
  // ... setup audio graph ...
  return { start, stop, setFrequency, setVolume, cleanup };
}
```

### 2. **UI Components** (Svelte 5)
Located in `shared/ui-components/` and plugin components
- Manage user interaction state
- Render controls (Knob, Slider, etc.)
- Display parameter values

```svelte
<!-- Svelte Component -->
<script>
  import Knob from '@ui/controls/Knob.svelte';
  let frequency = $state(440);
</script>

<Knob bind:value={frequency} />
```

### 3. **Integration** (Effects & Binding)
Connect audio logic to UI with Svelte 5 `$effect`

```svelte
<script>
  let synth;

  $effect(() => {
    // When frequency changes, update audio
    synth?.setFrequency(frequency);
  });
</script>
```

---

## Svelte 5 Runes Reference for Audio

### State Management

| Pattern | Purpose | Example |
|---------|---------|---------|
| `let x = $state(0)` | Mutable state | `let freq = $state(440)` |
| `let x = $derived(y * 2)` | Computed value | `let doubled = $derived(freq * 2)` |
| `let x = $derived.by(() => {...})` | Complex computed | `let range = $derived.by(() => freq > 1000 ? 'high' : 'low')` |
| `$effect(() => {...})` | Run when deps change | `$effect(() => osc?.setFreq(freq))` |
| `$effect(() => { return () => {...} })` | Setup + cleanup | Initialization and teardown |

### Component Props

```svelte
<script>
  // Receive props with $props
  let { value, min = 0, max = 100 } = $props();

  // Make prop bindable (two-way binding)
  let { value = $bindable(440) } = $props();
</script>
```

### Event Handlers

```svelte
<!-- Modern syntax: no 'on:' prefix -->
<input onchange={(e) => console.log(e.target.value)} />
<button onclick={() => count++}>Click</button>
<div onmousemove={(e) => console.log(e.clientX, e.clientY)}></div>

<!-- Or use bind: for automatic two-way binding -->
<input bind:value={frequency} />
```

---

## Audio + Svelte 5 Patterns

### Pattern 1: Initialize Audio on Mount

```svelte
<script>
  let synth;

  // This effect runs once when component mounts
  $effect(() => {
    synth = createSynth();
    synth.start();

    // Return cleanup function
    return () => {
      synth?.stop();
    };
  });
</script>
```

### Pattern 2: Sync State to Audio

```svelte
<script>
  let frequency = $state(440);

  // This effect re-runs whenever frequency changes
  $effect(() => {
    synth?.setFrequency(frequency);
  });
</script>
```

### Pattern 3: Display Computed Values

```svelte
<script>
  let frequency = $state(440);

  // DON'T do this:
  // $effect(() => { displayFreq = frequency; })

  // DO this instead:
  let displayFreq = $derived(frequency.toFixed(1));
</script>

<span>{displayFreq} Hz</span>
```

### Pattern 4: Multi-Parameter Control

```svelte
<script>
  let frequency = $state(440);
  let resonance = $state(1);

  // Update both parameters together
  function updateFilter(freq, res) {
    frequency = freq;
    resonance = res;
  }

  // Or react to changes independently
  $effect(() => { filter?.setFrequency(frequency); });
  $effect(() => { filter?.setQ(resonance); });
</script>
```

---

## Common Mistakes to Avoid

### ❌ Don't: Update State in $effect

```svelte
<script>
  let frequency = $state(440);
  let displayed = $state('');

  // WRONG: Don't use $effect to update state
  $effect(() => {
    displayed = frequency.toString();
  });
</script>
```

### ✅ Do: Use $derived Instead

```svelte
<script>
  let frequency = $state(440);

  // CORRECT: Use $derived for computed values
  let displayed = $derived(frequency.toString());
</script>
```

### ❌ Don't: Use Old Event Syntax

```svelte
<!-- WRONG: Legacy Svelte 4 syntax -->
<button on:click={() => count++}>Click</button>
<input on:change={handleChange} />
```

### ✅ Do: Use New Event Syntax

```svelte
<!-- CORRECT: Svelte 5 modern syntax -->
<button onclick={() => count++}>Click</button>
<input onchange={handleChange} />
```

### ❌ Don't: Use Manual Sync

```svelte
<script>
  let value = $state(0);
</script>

<!-- WRONG: Manual event handling -->
<input value={value} onchange={(e) => value = e.target.value} />
```

### ✅ Do: Use bind:

```svelte
<script>
  let value = $state(0);
</script>

<!-- CORRECT: Automatic binding -->
<input bind:value />
```

---

## Building Your First Audio Control

### Step 1: Create Audio Logic

```javascript
// src/lib/audio/frequencyKnob.js
import { getAudioContext } from '@audio/utils/audio-context';

export function createFrequencyControl(initialFreq = 440) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.value = initialFreq;
  gain.gain.value = 0.3;
  osc.connect(gain);

  return {
    setFrequency: (freq) => {
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
    },
    setGain: (g) => {
      gain.gain.setValueAtTime(g, ctx.currentTime);
    },
    start: () => osc.start(),
    stop: () => osc.stop(),
    connect: (dest) => gain.connect(dest),
    cleanup: () => {
      osc.disconnect();
      gain.disconnect();
    }
  };
}
```

### Step 2: Create Svelte Component

```svelte
<!-- src/components/FrequencyKnobControl.svelte -->
<script>
  import Knob from '@ui/controls/Knob.svelte';
  import { createFrequencyControl } from '$lib/audio/frequencyKnob';
  import { getAudioContext } from '@audio/utils/audio-context';

  let frequency = $state(440);
  let isPlaying = $state(false);
  let control;

  // Initialize on mount
  $effect(() => {
    if (isPlaying) {
      control = createFrequencyControl(frequency);
      control.connect(getAudioContext().destination);
      control.start();
    }

    // Cleanup on unmount or when stopped
    return () => {
      control?.stop();
      control?.cleanup();
    };
  });

  // Update audio when frequency changes
  $effect(() => {
    control?.setFrequency(frequency);
  });

  function togglePlay() {
    isPlaying = !isPlaying;
  }
</script>

<div class="control">
  <label for="freq-knob">Frequency</label>

  <Knob
    id="freq-knob"
    bind:value={frequency}
    min={20}
    max={20000}
    aria-label="Frequency control"
  />

  <span class="value">{frequency.toFixed(0)} Hz</span>

  <button onclick={togglePlay} class:playing={isPlaying}>
    {isPlaying ? 'Stop' : 'Play'}
  </button>
</div>

<style>
  .control {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  label {
    font-weight: bold;
  }

  .value {
    font-family: monospace;
    font-size: 12px;
  }

  button {
    padding: 8px 16px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button.playing {
    background: #dc2626;
  }
</style>
```

---

## Best Practices Summary

### Code Organization
- ✅ Audio logic in `shared/audio-core/` (reusable JavaScript)
- ✅ UI components in `shared/ui-components/` (Svelte components)
- ✅ Integration in plugin components (tie it together)

### State Management
- ✅ Use `$state` for mutable values
- ✅ Use `$derived` for computed values (not `$effect`)
- ✅ Use `$effect` only for side effects (audio, DOM, timers)

### Event Handling
- ✅ Use modern syntax: `onclick`, `onchange`, `onmousemove`
- ✅ Use `bind:` for two-way binding on inputs
- ✅ Destructure `let { prop } = $props()` for component props

### Accessibility
- ✅ Always include `<label for="id">` elements
- ✅ Use `aria-label` for controls without visible labels
- ✅ Use semantic HTML (proper input types, button elements)

### Performance
- ✅ Memoize computations with `$derived`
- ✅ Separate audio updates from UI renders
- ✅ Clean up resources in `$effect` return functions

---

## Learning Progression

1. **Week 1-2**: Understand `$state`, `$derived`, `$effect`
2. **Week 3-4**: Build basic audio controls (Knob, Slider with audio integration)
3. **Week 5-7**: Create complex components (Meter, EQ Band, Frequency Response)
4. **Week 8-10**: Build professional panels (EQ Matrix, Automation, XY Pad)

See `AUDIO_UI_LEARNING_PATH.md` for detailed exercises.

---

## Resources

### Official Documentation
- [Svelte 5 Docs](https://svelte.dev/docs)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [AudioParam Scheduling](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam)

### In This Project
- `shared/audio-core/` - Web Audio utilities
- `shared/ui-components/` - Reusable Svelte components
- `docs/AUDIO_UI_LEARNING_PATH.md` - Complete learning course
- `docs/WEB_AUDIO_API_GUIDE.md` - Audio API reference

### Examples
- `plugins/_template/web/` - Template plugin with examples
- `plugins/lofi-piano/web/` - Real example implementation

---

**Version**: Svelte 5.0+
**Last Updated**: October 2025
**Status**: Ready for implementation
